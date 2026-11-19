import { api, apiPage } from '@/lib/api';
import type { Address, FarmerOrder, GroupStatus, OnlinePayment, Order, PaymentMethod, Quote } from '@/types';

export interface CartLine {
  listing: string;
  quantity: number;
}

export interface AddressPayload {
  label: Address['label'];
  name: string;
  phone: string;
  line1: string;
  landmark?: string;
  city: string;
  pincode: string;
  location: { lng: number; lat: number };
  isDefault?: boolean;
}

export const addressService = {
  list: () => api<{ addresses: Address[] }>('/addresses'),
  create: (body: AddressPayload) => api<{ address: Address }>('/addresses', { method: 'POST', body }),
  update: (id: string, body: Partial<AddressPayload>) => api<{ address: Address }>(`/addresses/${id}`, { method: 'PUT', body }),
  remove: (id: string) => api<null>(`/addresses/${id}`, { method: 'DELETE' }),
};

export const orderService = {
  quote: (items: CartLine[], location: { lng: number; lat: number }) =>
    api<Quote>('/orders/quote', { method: 'POST', body: { items, location } }),

  place: (body: { items: CartLine[]; addressId: string; paymentMethod: PaymentMethod; expectedTotal: number }, idempotencyKey: string) =>
    api<{ order: Order; payment: OnlinePayment | null; replayed: boolean }>('/orders', {
      method: 'POST',
      body,
      headers: { 'Idempotency-Key': idempotencyKey },
    }),

  mine: (page = 1, limit = 10) => apiPage<Order>('/orders/my-orders', { query: { page, limit } }),
  get: (id: string) => api<{ order: Order }>(`/orders/${id}`),
  cancel: (id: string, groupId?: string) => api<{ order: Order }>(`/orders/${id}/cancel`, { method: 'POST', body: { groupId } }),
  /** Issue a fresh delivery code (e.g. after it locked from wrong attempts). */
  newCode: (id: string, groupId: string) => api<{ order: Order }>(`/orders/${id}/groups/${groupId}/code`, { method: 'POST' }),

  farmerQueue: (view: 'incoming' | 'active' | 'completed', page = 1) =>
    apiPage<FarmerOrder>('/orders/farmer', { query: { view, page, limit: 20 } }),
  updateStatus: (id: string, body: { groupId: string; status: GroupStatus; note?: string; code?: string; deliveryDate?: string }) =>
    api<{ order: FarmerOrder }>(`/orders/${id}/status`, { method: 'PUT', body }),
};

export const paymentService = {
  methods: () => api<{ cod: boolean; online: boolean }>('/payments/methods'),
  retry: (orderId: string) => api<{ payment: OnlinePayment }>(`/orders/${orderId}/pay`, { method: 'POST' }),
  verify: (body: { orderId: string; razorpayOrderId: string; razorpayPaymentId: string; signature: string }) =>
    api<{ order: Order | null }>('/payments/razorpay/verify', { method: 'POST', body }),
};
