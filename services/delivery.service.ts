import { api, apiPage } from '@/lib/api';
import type { DeliveryJob, PartnerOverview, PartnerProfile, Vehicle } from '@/types';

export interface PartnerProfileInput {
  vehicle?: Vehicle;
  base?: { lng: number; lat: number; label?: string };
  serviceRadiusKm?: number;
  isOnline?: boolean;
}

export const deliveryService = {
  profile: () => api<{ profile: PartnerProfile }>('/delivery/profile'),
  updateProfile: (body: PartnerProfileInput) => api<{ profile: PartnerProfile }>('/delivery/profile', { method: 'PUT', body }),
  overview: () => api<PartnerOverview>('/delivery/overview'),
  available: (page = 1) => apiPage<DeliveryJob>('/delivery/jobs/available', { query: { page, limit: 20 } }),
  mine: (view: 'active' | 'completed', page = 1) => apiPage<DeliveryJob>('/delivery/jobs', { query: { view, page, limit: 20 } }),
  accept: (id: string) => api<{ job: DeliveryJob }>(`/delivery/jobs/${id}/accept`, { method: 'POST' }),
  release: (id: string) => api<{ released: boolean }>(`/delivery/jobs/${id}/release`, { method: 'POST' }),
  pickUp: (id: string) => api<{ job: DeliveryJob }>(`/delivery/jobs/${id}/pickup`, { method: 'POST' }),
  deliver: (id: string, code: string) => api<{ job: DeliveryJob }>(`/delivery/jobs/${id}/deliver`, { method: 'POST', body: { code } }),
};
