# Stripe Payment Integration Setup Guide

## Overview
This guide will help you integrate Stripe payments for subscription management in your listing optimizer app.

## What's Been Implemented

### 1. Credit System ✅
- Free tier: 5 credits/month
- Basic tier: 50 credits/month ($9/mo)
- Premium tier: Unlimited credits ($19/mo)
- Enterprise tier: Unlimited credits ($49/mo)

### 2. Credit Tracking ✅
- Each optimization counts as 1 credit
- Usage count increments automatically
- Users are blocked when credits run out
- Upgrade prompts shown when limit reached

### 3. Checkout Page ✅
- Located at `/dashboard/checkout`
- Plan selection interface
- Order summary
- Ready for Stripe integration

### 4. API Endpoints ✅
- `/api/create-checkout-session` - Creates Stripe checkout
- `/api/stripe-webhook` - Handles subscription events
- `/api/optimize` - Enforces credit limits

## Stripe Integration Steps

### Step 1: Install Stripe
```bash
npm install stripe @stripe/stripe-js
```

### Step 2: Get Stripe Keys
1. Go to https://dashboard.stripe.com
2. Get your API keys from Developers > API keys
3. Add to `.env.local`:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Step 3: Create Products in Stripe Dashboard
1. Go to Products in Stripe Dashboard
2. Create three products:
   - Basic Plan: $9/month recurring
   - Premium Plan: $19/month recurring
   - Enterprise Plan: $49/month recurring
3. Copy the Price IDs

### Step 4: Update Checkout API
Edit `src/app/api/create-checkout-session/route.ts`:

```typescript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2023-10-16' 
});

const STRIPE_PRICE_IDS = {
  basic: 'price_xxxxx', // Replace with your Price ID
  premium: 'price_xxxxx',
  enterprise: 'price_xxxxx'
};

export async function POST(request: NextRequest) {
  // ... existing auth code ...

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: STRIPE_PRICE_IDS[plan],
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/checkout?plan=${plan}`,
    client_reference_id: userId,
    metadata: {
      userId,
      plan,
      credits: planDetails.credits.toString(),
    },
  });

  return NextResponse.json({ url: session.url });
}
```

### Step 5: Update Checkout Page
Edit `src/app/dashboard/checkout/page.tsx`:

```typescript
const handleCheckout = async () => {
  setLoading(true);
  try {
    const token = await user.getIdToken();
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ plan: selectedPlan })
    });
    
    const { url } = await response.json();
    window.location.href = url;
  } catch (err) {
    setError('Failed to process checkout');
  } finally {
    setLoading(false);
  }
};
```

### Step 6: Setup Webhook
1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the webhook secret to `.env.local`

### Step 7: Update Webhook Handler
Edit `src/app/api/stripe-webhook/route.ts`:

```typescript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Handle events (already implemented in the file)
  // ...
}
```

### Step 8: Test the Integration

#### Test Mode
1. Use test card: `4242 4242 4242 4242`
2. Any future expiry date
3. Any 3-digit CVC
4. Any ZIP code

#### Test Flow
1. Sign up as a new user (gets 5 free credits)
2. Use all 5 credits
3. Try to optimize again (should be blocked)
4. Click upgrade button
5. Complete checkout with test card
6. Verify user tier updated in Firestore
7. Verify credits reset and limit increased

## Credit System Logic

### Free Tier (Default)
- 5 credits per month
- Resets on the 1st of each month
- No payment required

### Paid Tiers
- Basic: 50 credits/month
- Premium: Unlimited (999999 credits)
- Enterprise: Unlimited (999999 credits)

### Credit Deduction
Every optimization (Mode 1, 2, or 3) deducts 1 credit:
1. User submits optimization
2. Check `usageCount >= usageLimit`
3. If exceeded, show upgrade modal
4. If allowed, process optimization
5. Increment `usageCount` by 1
6. Save to Firestore

### Monthly Reset
You'll need to create a Cloud Function or cron job:

```typescript
// Firebase Cloud Function (example)
export const resetMonthlyCredits = functions.pubsub
  .schedule('0 0 1 * *') // First day of month at midnight
  .onRun(async () => {
    const usersRef = admin.firestore().collection('users');
    const snapshot = await usersRef.get();
    
    const batch = admin.firestore().batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { usageCount: 0 });
    });
    
    await batch.commit();
  });
```

## Environment Variables Checklist

```env
# Firebase (already configured)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY=...

# Stripe (add these)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Testing Checklist

- [ ] User can sign up and gets 5 free credits
- [ ] Credit counter shows correct usage (0/5, 1/5, etc.)
- [ ] After 5 optimizations, user is blocked
- [ ] Upgrade modal appears with pricing options
- [ ] Checkout page loads with correct plan
- [ ] Stripe checkout session creates successfully
- [ ] Payment completes in test mode
- [ ] Webhook receives event
- [ ] User tier updates in Firestore
- [ ] Credits reset to 0
- [ ] Usage limit updates (50 or unlimited)
- [ ] User can now optimize again

## Production Deployment

1. Switch to live Stripe keys
2. Update webhook URL to production domain
3. Test with real card (small amount)
4. Set up monthly credit reset job
5. Monitor webhook logs
6. Set up Stripe email notifications

## Support & Troubleshooting

### Common Issues

**Webhook not receiving events:**
- Check webhook URL is correct
- Verify webhook secret matches
- Check Stripe Dashboard > Webhooks > Logs

**Credits not updating:**
- Check Firestore rules allow writes
- Verify webhook handler is updating correct fields
- Check server logs for errors

**Checkout not redirecting:**
- Verify `NEXT_PUBLIC_BASE_URL` is set
- Check success/cancel URLs are correct
- Ensure Stripe keys are valid

## Next Steps

1. Complete Stripe setup (Steps 1-7)
2. Test in development
3. Deploy to production
4. Set up monitoring
5. Add customer portal for subscription management
6. Implement invoice emails
7. Add usage analytics

## Additional Features to Consider

- Annual billing (save 20%)
- Add-on purchases (extra credits)
- Team/agency plans
- Referral program
- Free trial period
- Promo codes
- Usage alerts (80% used)
- Billing history page
- Download invoices

---

Need help? Check:
- Stripe Docs: https://stripe.com/docs
- Next.js + Stripe: https://github.com/vercel/next.js/tree/canary/examples/with-stripe-typescript
- Firebase + Stripe: https://github.com/stripe/stripe-firebase-extensions
