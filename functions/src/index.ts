import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Stripe
const stripe = new Stripe(functions.config().stripe.secret_key, {
  apiVersion: '2023-10-16',
});

interface UserData {
  email: string;
  subscriptionStatus: 'free' | 'active' | 'canceled' | 'past_due';
  subscriptionId?: string;
  customerId?: string;
}

/**
 * Create a Stripe checkout session for premium subscription
 */
export const createCheckoutSession = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { priceId, successUrl, cancelUrl } = data;
  const userId = context.auth.uid;

  try {
    // Get or create Stripe customer
    const userDoc = await admin.firestore().doc(`users/${userId}`).get();
    const userData = userDoc.data() as UserData;
    
    let customerId = userData?.customerId;
    
    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: userData?.email || context.auth.token.email,
        metadata: {
          firebaseUID: userId,
        },
      });
      
      customerId = customer.id;
      
      // Update user document with customer ID
      await admin.firestore().doc(`users/${userId}`).update({
        customerId: customerId,
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || 'https://phonocorrect-ai.com/success',
      cancel_url: cancelUrl || 'https://phonocorrect-ai.com/canceled',
      metadata: {
        firebaseUID: userId,
      },
    });

    return { url: session.url };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create checkout session');
  }
});

/**
 * Create a Stripe customer portal link
 */
export const createPortalLink = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { returnUrl } = data;
  const userId = context.auth.uid;

  try {
    // Get user's Stripe customer ID
    const userDoc = await admin.firestore().doc(`users/${userId}`).get();
    const userData = userDoc.data() as UserData;
    
    if (!userData?.customerId) {
      throw new functions.https.HttpsError('not-found', 'No customer found');
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: userData.customerId,
      return_url: returnUrl || 'https://phonocorrect-ai.com',
    });

    return { url: session.url };
  } catch (error) {
    console.error('Error creating portal link:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create portal link');
  }
});

/**
 * Handle Stripe webhook events
 */
export const handleStripeEvent = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = functions.config().stripe.webhook_secret;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    res.status(400).send('Webhook signature verification failed');
    return;
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Get Firebase UID from customer metadata
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const firebaseUID = (customer as Stripe.Customer).metadata.firebaseUID;
        
        if (!firebaseUID) {
          console.error('No Firebase UID found in customer metadata');
          res.status(400).send('No Firebase UID found');
          return;
        }

        // Map Stripe status to our status
        let status: 'free' | 'active' | 'canceled' | 'past_due' = 'free';
        switch (subscription.status) {
          case 'active':
            status = 'active';
            break;
          case 'past_due':
            status = 'past_due';
            break;
          case 'canceled':
          case 'unpaid':
          case 'incomplete':
          case 'incomplete_expired':
            status = 'canceled';
            break;
          default:
            status = 'free';
        }

        // Update user document
        await admin.firestore().doc(`users/${firebaseUID}`).update({
          subscriptionStatus: status,
          subscriptionId: subscription.id,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`Updated subscription status for user ${firebaseUID}: ${status}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          const firebaseUID = (customer as Stripe.Customer).metadata.firebaseUID;
          
          if (firebaseUID) {
            await admin.firestore().doc(`users/${firebaseUID}`).update({
              subscriptionStatus: 'active',
              lastPaymentDate: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          const firebaseUID = (customer as Stripe.Customer).metadata.firebaseUID;
          
          if (firebaseUID) {
            await admin.firestore().doc(`users/${firebaseUID}`).update({
              subscriptionStatus: 'past_due',
              lastFailedPaymentDate: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).send('Event handled');
  } catch (error) {
    console.error('Error handling webhook event:', error);
    res.status(500).send('Error handling event');
  }
});