import { api, apiPage, type Paginated } from '@/lib/api';
import type { GroupStatus, Order, OrderStatus, PaymentStatus, UserRole, VerificationStatus } from '@/types';

export interface AdminOverview {
  users: { customers: number; farmers: number; partners: number; admins: number; suspended: number };
  verification: { profilesPending: number; organicPending: number };
  orders: { today: number; last7Days: number; groups: Partial<Record<GroupStatus, number>> };
  money: { deliveredLast30Days: number; ordersDeliveredLast30Days: number; codToCollect: number; refundsOutstanding: number; refundsOutstandingOrders: number };
  deliveries: { open: number; assigned: number; onTheWay: number; partnersOnline: number };
  recentOrders: { id: string; orderNumber: string; customer: string; total: number; status: OrderStatus; paymentMethod: 'cod' | 'online'; paymentStatus: PaymentStatus; createdAt: string }[];
}

export interface AdminUserRow {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  status: 'active' | 'suspended';
  createdAt: string;
  lastLoginAt?: string;
  farmer?: { id: string; profileStatus: VerificationStatus; organicStatus: VerificationStatus };
}

export interface AdminAction { id: string; action: string; note?: string; by?: string; at: string; details?: Record<string, unknown> }

export interface OrganicCert { status: VerificationStatus; certificateNumber?: string; issuer?: string; documentUrl?: string; validUntil?: string; reviewNote?: string; reviewedAt?: string }

export interface AdminUserDetail extends Omit<AdminUserRow, 'farmer'> {
  actions: AdminAction[];
  customer?: {
    orders: { id: string; orderNumber: string; grandTotal: number; status: OrderStatus; paymentStatus: PaymentStatus; createdAt: string }[];
    addresses: { label: string; line1: string; landmark?: string; city: string; pincode: string }[];
    totals: { orders: number; spent: number };
  };
  farmer?: {
    id: string; bio?: string; experienceYears?: number; practices: string[]; profileStatus: VerificationStatus; profileReviewNote?: string;
    organicCertification: OrganicCert; ratingAvg: number; ratingCount: number; activeListings: number;
    farms: { id: string; name: string; village?: string; district?: string; deliveryRadiusKm: number; isActive: boolean; deliveryAvailable: boolean; location: { lng: number; lat: number } }[];
    sales: Partial<Record<GroupStatus, { groups: number; total: number }>>;
  };
  partner?: { vehicle: string; base?: string; serviceRadiusKm: number; isOnline: boolean; jobs: Record<string, { count: number; payout: number }> } | null;
}

export interface VerificationItem {
  id: string;
  user: { id: string; name: string; phone?: string; email?: string; joined: string };
  bio?: string; experienceYears?: number; practices: string[];
  profileStatus: VerificationStatus; profileReviewNote?: string;
  organicCertification: OrganicCert;
  farms: { name: string; village?: string; district?: string; deliveryRadiusKm: number }[];
  activeListings: number;
  waitingSince: string;
}

export interface AdminOrderRow {
  id: string; orderNumber: string;
  customer: { id: string; name: string; phone: string; city: string };
  farms: { name: string; status: GroupStatus; total: number; deliveryMode?: 'self' | 'partner' }[];
  total: number; status: OrderStatus; paymentMethod: 'cod' | 'online'; paymentStatus: PaymentStatus; refundOutstanding: number; createdAt: string;
}

export interface AdminOrderDetail {
  order: Order;
  refundOutstanding: number;
  refundsSettled: { amount: number; reference?: string; note?: string; at: string }[];
  customer: { id: string; name: string; phone?: string; email?: string; status: string } | null;
  payments: { id: string; provider: 'cod' | 'razorpay'; amount: number; status: string; providerPaymentId?: string; paidAt?: string; createdAt: string }[];
  deliveries: { group: string; mode: 'self' | 'partner'; status: string; partner?: string; partnerPhone?: string; payout?: number; codAmount?: number; deliveredAt?: string }[];
  actions: AdminAction[];
}

export interface PaymentRow { id: string; orderId: string; orderNumber?: string; customer?: string; provider: 'cod' | 'razorpay'; amount: number; status: string; providerPaymentId?: string; paidAt?: string; createdAt: string }
export interface AuditRow { id: string; action: string; target: string; targetType: 'user' | 'farmer' | 'order'; targetId: string; note?: string; details?: Record<string, unknown>; by?: string; at: string }

type Q = Record<string, string | number | boolean | undefined>;

export const adminService = {
  overview: () => api<AdminOverview>('/admin/overview'),
  users: (query: Q) => apiPage<AdminUserRow>('/admin/users', { query }),
  user: (id: string) => api<{ user: AdminUserDetail }>(`/admin/users/${id}`),
  setStatus: (id: string, status: 'active' | 'suspended', reason: string) => api(`/admin/users/${id}/status`, { method: 'PATCH', body: { status, reason } }),
  verification: (kind: 'all' | 'profile' | 'organic', page = 1) => apiPage<VerificationItem>('/admin/verification', { query: { kind, page, limit: 20 } }),
  decide: (farmerId: string, body: { profile?: 'verified' | 'rejected'; organic?: 'verified' | 'rejected'; note?: string }) =>
    api(`/admin/farmers/${farmerId}/verification`, { method: 'POST', body }),
  orders: (query: Q) => apiPage<AdminOrderRow>('/admin/orders', { query }),
  order: (id: string) => api<AdminOrderDetail>(`/admin/orders/${id}`),
  cancelGroup: (id: string, groupId: string, note: string) => api<AdminOrderDetail>(`/admin/orders/${id}/groups/${groupId}/cancel`, { method: 'POST', body: { note } }),
  recordRefund: (id: string, body: { amount: number; reference?: string; note?: string }) => api<AdminOrderDetail>(`/admin/orders/${id}/refunds`, { method: 'POST', body }),
  payments: (query: Q) => apiPage<PaymentRow>('/admin/payments', { query }) as Promise<Paginated<PaymentRow> & { meta: { totals?: { provider: string; status: string; amount: number; count: number }[] } }>,
  audit: (page = 1) => apiPage<AuditRow>('/admin/audit', { query: { page, limit: 30 } }),
};
