import { apiGet, apiPost } from './client';
import type { CheckoutSession, PaginatedPayments, Subscription } from './types';

export const subscriptionApi = {
  getByOrg: (slug: string) => apiGet<Subscription>(`/organizations/${slug}/subscriptions`),

  createCheckout: (slug: string) =>
    apiPost<CheckoutSession>(`/organizations/${slug}/subscriptions/checkout`),

  // Cancel uses POST per backend spec.
  cancel: (slug: string) =>
    apiPost<{ message: string }>(`/organizations/${slug}/subscriptions/cancel`),

  getPayments: (slug: string, page = 1, limit = 20) =>
    apiGet<PaginatedPayments>(`/organizations/${slug}/payments?page=${page}&limit=${limit}`),
};
