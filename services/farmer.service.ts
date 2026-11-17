import { api, apiPage, type QueryParams } from '@/lib/api';
import type { Farm, Farmer, FarmerOverview, FarmingPractice, InventoryItem, Product, Unit, User } from '@/types';

export interface ProfilePayload {
  bio?: string;
  experienceYears?: number;
  languages?: string[];
  practices?: FarmingPractice[];
  organicCertification?: { certificateNumber: string; issuer: string; documentUrl?: string; validUntil?: string };
}

export interface FarmPayload {
  name: string;
  description?: string;
  city: string;
  address: Farm['address'];
  location: { lng: number; lat: number };
  areaAcres?: number;
  images?: string[];
  deliveryRadiusKm?: number;
  deliveryAvailable?: boolean;
  pickupAvailable?: boolean;
  isActive?: boolean;
}

export interface ListingPayload {
  farm?: string;
  product: string;
  price: number;
  unit: Unit;
  packSizeGrams?: number;
  quantityAvailable: number;
  minOrderQty?: number;
  harvestDate?: string;
  processedDate?: string;
  expiryDate?: string;
  packaging?: string;
  description?: string;
  images?: string[];
  organicClaim?: boolean;
  isActive?: boolean;
}

export const farmerService = {
  me: () => api<{ farmer: Farmer; farms: Farm[] }>('/farmers/me'),
  overview: () => api<FarmerOverview>('/farmers/me/overview'),
  updateProfile: (body: ProfilePayload) => api<{ farmer: Farmer }>('/farmers/profile', { method: 'PUT', body }),
};

export const farmService = {
  mine: () => api<{ farms: Farm[] }>('/farms/mine'),
  create: (body: FarmPayload) => api<{ farm: Farm }>('/farms', { method: 'POST', body }),
  update: (id: string, body: Partial<FarmPayload>) => api<{ farm: Farm }>(`/farms/${id}`, { method: 'PUT', body }),
};

export const productService = {
  list: (query: QueryParams) => apiPage<Product>('/products', { query }),
};

export const inventoryService = {
  mine: (query: QueryParams) => apiPage<InventoryItem>('/inventory/mine', { query }),
  get: (id: string) => api<{ item: InventoryItem }>(`/inventory/mine/${id}`),
  create: (body: ListingPayload) => api<{ item: InventoryItem }>('/inventory', { method: 'POST', body }),
  update: (id: string, body: Partial<Omit<ListingPayload, 'product' | 'farm'>>) =>
    api<{ item: InventoryItem }>(`/inventory/${id}`, { method: 'PUT', body }),
  adjustStock: (id: string, mode: 'set' | 'add', quantity: number) =>
    api<{ item: InventoryItem }>(`/inventory/${id}/stock`, { method: 'PATCH', body: { mode, quantity } }),
  remove: (id: string) => api<null>(`/inventory/${id}`, { method: 'DELETE' }),
};

export const userService = {
  updateMe: (body: { name?: string; phone?: string }) => api<{ user: User }>('/users/me', { method: 'PATCH', body }),
};
