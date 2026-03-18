import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import nodemailer from 'nodemailer';

async function getTransporter() {
  // Use configured SMTP if env vars are set
  if (process.env.EMAIL_FROM && process.env.EMAIL_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_FROM, pass: process.env.EMAIL_PASSWORD },
    });
  }
  // Fallback: Ethereal test account (auto-created, logs preview URL to console)
  const testAccount = await nodemailer.createTestAccount();
  const transport = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  return transport;
}

export async function POST(request: NextRequest) {
  try {
    if (!adminAuth || !adminDb) {
      return NextResponse.json({ success: false, error: 'Firebase Admin not configured' }, { status: 500 });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decoded = await adminAuth.verifyIdToken(token);
    const ownerId = decoded.uid;

    // Verify enterprise plan
    const ownerDoc = await adminDb.collection('users').doc(ownerId).get();
    if (!ownerDoc.exists) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const ownerData = ownerDoc.data() as any;
    if (ownerData.tier !== 'enterprise') {
      return NextResponse.json({ success: false, error: 'Team members require Enterprise plan' }, { status: 403 });
    }

    const { email, name, role } = await request.json();
    if (!email || !name || !role) {
      return NextResponse.json({ success: false, error: 'email, name and role are required' }, { status: 400 });
    }

    const existing: any[] = ownerData.teamMembers || [];
    if (existing.length >= 5) {
      return NextResponse.json({ success: false, error: 'Maximum 5 team members reached' }, { status: 400 });
    }
    if (existing.find((m: any) => m.email === email)) {
      return NextResponse.json({ success: false, error: 'This email is already a team member' }, { status: 400 });
    }

    const newMember = { email, name, role, addedAt: new Date().toLocaleDateString() };
    const updatedMembers = [...existing, newMember];

    // Save to owner's Firestore doc
    await adminDb.collection('users').doc(ownerId).update({ teamMembers: updatedMembers });

    // Build accept-invite token (base64 encoded payload)
    const inviteToken = Buffer.from(JSON.stringify({ ownerId, email, name, role })).toString('base64');
    const acceptUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/accept-invite?token=${inviteToken}`;

    // Check if invited user already has an account — if so, write a notification to their doc
    const invitedQuery = await adminDb.collection('users').where('email', '==', email).limit(1).get();
    if (!invitedQuery.empty) {
      const invitedDoc = invitedQuery.docs[0];
      const invitedNotifs: any[] = invitedDoc.data().notifications || [];
      invitedNotifs.unshift({
        id: Date.now().toString(),
        title: 'Team Invitation',
        message: `${ownerData.displayName} added you to their Enterprise workspace as ${role}. Click to accept.`,
        time: 'just now',
        read: false,
        type: 'info',
        actionUrl: acceptUrl,
      });
      await adminDb.collection('users').doc(invitedDoc.id).update({ notifications: invitedNotifs.slice(0, 20) });
    }

    // Send invite email
    try {
      const transporter = await getTransporter();
      const info = await transporter.sendMail({
        from: `"ListingOptimizer AI" <${process.env.EMAIL_FROM || 'noreply@listingoptimizer.site'}>`,
        to: email,
        subject: `You've been added to ${ownerData.displayName}'s workspace`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
            <h2 style="color:#1d4ed8;margin-bottom:8px;">You've been invited!</h2>
            <p style="color:#374151;">Hi ${name},</p>
            <p style="color:#374151;"><strong>${ownerData.displayName}</strong> has added you to their <strong>ListingOptimizer AI</strong> Enterprise workspace as a <strong>${role}</strong>.</p>
            <p style="color:#374151;">Click below to accept the invite. You'll be automatically upgraded to Enterprise and redirected to the dashboard:</p>
            <a href="${acceptUrl}"
               style="display:inline-block;margin-top:16px;padding:12px 28px;background:#1d4ed8;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
              Access Workspace
            </a>
            <p style="color:#6b7280;font-size:12px;margin-top:24px;">If you don't have an account yet, you'll be taken to sign up first.</p>
            <p style="color:#9ca3af;font-size:12px;margin-top:8px;">ListingOptimizer AI · AI-powered listing optimization</p>
          </div>
        `,
      });
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) console.log('📧 Email preview URL:', previewUrl);
    } catch (emailErr) {
      console.warn('Email send failed (non-fatal):', emailErr);
    }

    return NextResponse.json({ success: true, data: newMember });
  } catch (err: any) {
    console.error('Team invite error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!adminAuth || !adminDb) {
      return NextResponse.json({ success: false, error: 'Firebase Admin not configured' }, { status: 500 });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decoded = await adminAuth.verifyIdToken(token);
    const ownerId = decoded.uid;

    const { email } = await request.json();
    const ownerDoc = await adminDb.collection('users').doc(ownerId).get();
    const ownerData = ownerDoc.data() as any;
    const updated = (ownerData.teamMembers || []).filter((m: any) => m.email !== email);
    await adminDb.collection('users').doc(ownerId).update({ teamMembers: updated });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
