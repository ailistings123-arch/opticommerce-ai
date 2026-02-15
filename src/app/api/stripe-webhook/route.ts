import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// Stripe webhook handler
// This endpoint will be called by Stripe when subscription events occur

export async function POST(request: NextRequest) {
  try {
    // Check if Firebase Admin is initialized
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // TODO: Verify Stripe webhook signature
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const event = stripe.webhooks.constructEvent(
    //   body,
    //   signature,
    //   process.env.STRIPE_WEBHOOK_SECRET
    // );

    // Parse the event (placeholder)
    const event = JSON.parse(body);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;
        const credits = parseInt(session.metadata?.credits || '5');

        if (userId && plan) {
          // Update user's subscription in Firestore
          await adminDb.collection('users').doc(userId).update({
            tier: plan,
            usageLimit: credits,
            usageCount: 0, // Reset usage count on new subscription
            subscriptionId: session.subscription,
            customerId: session.customer,
            updatedAt: new Date(),
          });

          console.log(`✅ Updated user ${userId} to ${plan} plan`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        if (userId) {
          // Handle subscription updates (e.g., plan changes)
          await adminDb.collection('users').doc(userId).update({
            subscriptionStatus: subscription.status,
            updatedAt: new Date(),
          });

          console.log(`✅ Updated subscription for user ${userId}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        if (userId) {
          // Downgrade user to free tier
          await adminDb.collection('users').doc(userId).update({
            tier: 'free',
            usageLimit: 5,
            subscriptionId: null,
            subscriptionStatus: 'canceled',
            updatedAt: new Date(),
          });

          console.log(`✅ Downgraded user ${userId} to free tier`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        // Find user by customer ID and handle failed payment
        const usersSnapshot = await adminDb
          .collection('users')
          .where('customerId', '==', customerId)
          .limit(1)
          .get();

        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          await userDoc.ref.update({
            paymentStatus: 'failed',
            updatedAt: new Date(),
          });

          console.log(`⚠️ Payment failed for customer ${customerId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
