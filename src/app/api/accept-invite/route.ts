import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// GET /api/accept-invite?token=<base64>
// Called when invited user clicks "Access Workspace" in email
export async function GET(request: NextRequest) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  try {
    const token = request.nextUrl.searchParams.get('token');
    if (!token) return NextResponse.redirect(`${base}/login?invite=invalid`);

    // Decode token: base64(JSON { ownerId, email, name, role })
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    const { ownerId, email, role } = payload;

    if (!adminDb) return NextResponse.redirect(`${base}/login?invite=error`);

    // Find invited user by email
    const invitedQuery = await adminDb.collection('users').where('email', '==', email).limit(1).get();

    if (!invitedQuery.empty) {
      const invitedDoc = invitedQuery.docs[0];
      const invitedData = invitedDoc.data() as any;

      // Upgrade to enterprise + store workspace owner reference
      const notifs: any[] = invitedData.notifications || [];
      notifs.unshift({
        id: Date.now().toString(),
        title: 'Workspace Access Granted',
        message: `You now have Enterprise access via team invite. Welcome to the workspace!`,
        time: 'just now',
        read: false,
        type: 'success',
      });

      await adminDb.collection('users').doc(invitedDoc.id).update({
        tier: 'enterprise',
        usageLimit: 999999,
        workspaceOwnerId: ownerId,
        workspaceRole: role,
        notifications: notifs.slice(0, 20),
        updatedAt: new Date(),
      });

      // Redirect to dashboard with welcome flag
      return NextResponse.redirect(`${base}/dashboard?workspace=joined`);
    }

    // User doesn't have account yet — redirect to signup with invite token preserved
    return NextResponse.redirect(`${base}/signup?invite=${token}`);
  } catch (err: any) {
    console.error('Accept invite error:', err);
    return NextResponse.redirect(`${base}/login?invite=error`);
  }
}
