import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

// Stripe-related cloud functions
export const createPortalLink = httpsCallable(functions, 'createPortalLink');
export const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');

export interface CreatePortalLinkRequest {
  returnUrl?: string;
}

export interface CreatePortalLinkResponse {
  url: string;
}

export interface CreateCheckoutSessionRequest {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreateCheckoutSessionResponse {
  url: string;
}

export const PREMIUM_PRICE_ID = process.env.REACT_APP_STRIPE_PREMIUM_PRICE_ID || 'price_premium_monthly';