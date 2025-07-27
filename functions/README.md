# Firebase Cloud Functions for PhonoCorrect AI

This directory contains the Firebase Cloud Functions for handling authentication, Stripe billing, and premium features.

## Setup

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize Firebase Functions:
```bash
cd functions
npm install
```

3. Set environment variables:
```bash
firebase functions:config:set stripe.secret_key="sk_test_..."
firebase functions:config:set stripe.webhook_secret="whsec_..."
```

## Functions

### createCheckoutSession
Creates a Stripe checkout session for premium subscription.

### createPortalLink
Creates a Stripe customer portal link for subscription management.

### handleStripeEvent
Webhook handler for Stripe events to update user subscription status.

## Deployment

```bash
firebase deploy --only functions
```