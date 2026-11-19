export type UserRole = 'customer' | 'farmer' | 'delivery' | 'admin';

export interface User {
  id: string;
  name: string;
  /** Optional: accounts can be mobile-only. */
  email?: string;
  phone?: string;
  role: UserRole;
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type VerificationStatus = 'unsubmitted' | 'pending' | 'verified' | 'rejected';

export const FARMING_PRACTICES = [
  'certified-organic',
  'natural-farming',
  'no-chemical-pesticides',
  'drip-irrigation',
  'vermicompost',
  'crop-rotation',
] as const;
export type FarmingPractice = (typeof FARMING_PRACTICES)[number];

export interface Farmer {
  id: string;
  user: string;
  bio?: string;
  experienceYears?: number;
  languages: string[];
  practices: FarmingPractice[];
  profileStatus: VerificationStatus;
  organicCertification: {
    status: VerificationStatus;
    certificateNumber?: string;
    issuer?: string;
    documentUrl?: string;
    validUntil?: string;
    reviewNote?: string;
  };
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
}

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface Farm {
  id: string;
  farmer: string;
  name: string;
  description?: string;
  city: string;
  address: { line1: string; village?: string; district?: string; state: string; pincode: string };
  location: GeoPoint;
  areaAcres?: number;
  images: string[];
  deliveryRadiusKm: number;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  isActive: boolean;
}

export type ProductType = 'fresh' | 'dry';
export const UNITS = ['kg', 'g', 'bunch', 'piece', 'dozen', 'packet'] as const;
export type Unit = (typeof UNITS)[number];

export interface Product {
  id: string;
  name: string;
  localName?: string;
  slug: string;
  type: ProductType;
  category: string;
  defaultUnit: Unit;
  description?: string;
  image: string;
  imageCredit?: string;
  shelfLifeDays: number;
  isActive: boolean;
}

export interface InventoryItem {
  id: string;
  farmer: string;
  farm: { id: string; name: string } | string;
  product: Pick<Product, 'id' | 'name' | 'localName' | 'slug' | 'image' | 'type' | 'category' | 'defaultUnit'> & {
    shelfLifeDays?: number;
  };
  productName: string;
  productType: ProductType;
  category: string;
  city: string;
  price: number;
  unit: Unit;
  packSizeGrams?: number;
  quantityAvailable: number;
  quantityReserved: number;
  minOrderQty: number;
  harvestDate?: string;
  processedDate?: string;
  expiryDate?: string;
  packaging?: string;
  description?: string;
  images: string[];
  organicClaim: boolean;
  isActive: boolean;
  updatedAt: string;
}

export interface FarmerOverview {
  profileComplete: boolean;
  /** Reasons given by Khet Se when a profile or certificate was rejected. */
  profileReviewNote?: string;
  organicReviewNote?: string;
  organicStatus: VerificationStatus;
  profileStatus: VerificationStatus;
  farmCount: number;
  orders: { pending: number; active: number };
  listings: { total: number; active: number; outOfStock: number; lowStock: number; inactive: number };
}

export interface GeoPlace {
  label: string;
  lat: number;
  lng: number;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  village?: string;
  line1?: string;
}

// ─── Marketplace / recommendations ───────────────────────────────────────────

export interface ScoreBreakdown {
  proximity: number;
  freshness: number;
  stock: number;
  rating: number;
  price: number;
  organic: number;
}

export interface FarmerSummary {
  id: string;
  name: string;
  ratingAvg: number;
  ratingCount: number;
  organicVerified: boolean;
  profileVerified: boolean;
  experienceYears?: number;
}

export interface NearbyFarm {
  farm: {
    id: string;
    name: string;
    image: string | null;
    village?: string;
    district?: string;
    city: string;
    location: { lng: number; lat: number };
    deliveryRadiusKm: number;
    pickupAvailable: boolean;
  };
  farmer: FarmerSummary;
  distanceKm: number;
  roadDistanceKm: number | null;
  listingCount: number;
  types: ProductType[];
  categories: string[];
  priceFrom: number;
  topListings: { id: string; productName: string; price: number; unit: Unit; packSizeGrams?: number; image: string; freshness: number }[];
  score: number;
  scoreBreakdown: ScoreBreakdown;
}

export interface NearbyListing {
  id: string;
  product: Pick<Product, 'id' | 'name' | 'localName' | 'slug' | 'image' | 'type' | 'category'>;
  price: number;
  unit: Unit;
  packSizeGrams?: number;
  quantityAvailable: number;
  minOrderQty: number;
  harvestDate?: string;
  processedDate?: string;
  expiryDate?: string;
  packaging?: string;
  images: string[];
  organicClaim: boolean;
  farm: { id: string; name: string; village?: string; district?: string; pickupAvailable: boolean };
  farmer: FarmerSummary;
  distanceKm: number;
  score: number;
  scoreBreakdown: ScoreBreakdown;
  freshness: number;
}

export interface GeoPageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  /** Radius actually searched. */
  radiusKm: number;
  /** true when the engine widened the search to find enough results. */
  expanded: boolean;
  sort: string;
}

/** The fields every product card needs — satisfied by nearby listings and profile listings alike. */
export interface CardListing {
  id: string;
  product: Pick<Product, 'id' | 'name' | 'localName' | 'slug' | 'image' | 'type' | 'category'>;
  price: number;
  unit: Unit;
  packSizeGrams?: number;
  quantityAvailable: number;
  minOrderQty: number;
  harvestDate?: string;
  processedDate?: string;
  expiryDate?: string;
  packaging?: string;
  description?: string;
  images: string[];
  organicClaim: boolean;
  farm: { id: string; name: string; village?: string; district?: string; pickupAvailable: boolean };
  farmer: FarmerSummary;
  distanceKm: number | null;
}

export interface PublicFarm {
  id: string;
  name: string;
  description?: string;
  images: string[];
  village?: string;
  district?: string;
  state?: string;
  city?: string;
  location: { lng: number; lat: number };
  areaAcres?: number;
  deliveryRadiusKm: number;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  distanceKm: number | null;
  deliversToYou?: boolean | null;
}

export interface ListingDetail extends CardListing {
  productDescription?: string;
  farmDetails: PublicFarm;
  deliversToYou: boolean | null;
}

export interface FarmerProfile {
  farmer: FarmerSummary & {
    bio?: string;
    languages: string[];
    practices: FarmingPractice[];
    organicIssuer?: string;
    memberSince: string;
  };
  farms: PublicFarm[];
  listings: CardListing[];
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export type GroupStatus = 'pending' | 'accepted' | 'packed' | 'out_for_delivery' | 'delivered' | 'rejected' | 'cancelled';
export type OrderStatus = 'placed' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentMethod = 'cod' | 'online';
export type PaymentStatus = 'cod_pending' | 'pending' | 'paid' | 'refund_pending' | 'cancelled';

export interface Address {
  id: string;
  label: 'home' | 'work' | 'other';
  name: string;
  phone: string;
  line1: string;
  landmark?: string;
  city: string;
  pincode: string;
  location: GeoPoint;
  isDefault: boolean;
}

export interface QuoteItem {
  listing: string;
  productName: string;
  image: string;
  unit: Unit;
  packSizeGrams?: number;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface QuoteIssue {
  listing: string;
  code: 'UNAVAILABLE' | 'OUT_OF_STOCK' | 'INSUFFICIENT_STOCK' | 'BELOW_MINIMUM' | 'INVALID_QUANTITY' | 'NOT_DELIVERABLE';
  message: string;
  maxQuantity?: number;
}

export interface Quote {
  groups: { farm: string; farmer: string; farmName: string; farmerName: string; distanceKm: number; subtotal: number; deliveryFee: number; total: number; items: QuoteItem[] }[];
  issues: QuoteIssue[];
  itemsTotal: number;
  deliveryTotal: number;
  grandTotal: number;
  freeDeliveryAbove: number;
}

export interface OrderItem {
  inventory: string;
  product: string;
  productName: string;
  image: string;
  unit: Unit;
  packSizeGrams?: number;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderGroup {
  id?: string;
  _id?: string;
  farmer: string;
  farm: string;
  farmName: string;
  farmerName: string;
  farmerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  distanceKm: number;
  status: GroupStatus;
  history: { status: GroupStatus; at: string; by: string; note?: string }[];
  handoverCode?: string;
  /** True after too many wrong codes; the customer must issue a new one. */
  codeLocked?: boolean;
  codeAttempts?: number;
  /** The farmer must accept or decline before this, or the group is cancelled. */
  acceptBy?: string;
  scheduledFor?: string;
  paymentCollected: boolean;
  cancelReason?: string;
  /** "partner" once the farmer asked Khet Se for a delivery partner. */
  deliveryMode?: 'self' | 'partner';
  /** The partner who accepted the delivery. */
  courier?: { name: string; phone?: string; vehicle: Vehicle };
}

export interface Order {
  id: string;
  orderNumber: string;
  address: { name: string; phone: string; line1: string; landmark?: string; city: string; pincode: string; location: GeoPoint };
  groups: OrderGroup[];
  itemsTotal: number;
  deliveryTotal: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  refundDue: number;
  reservationExpiresAt?: string | null;
  status: OrderStatus;
  createdAt: string;
}

/** What a farmer sees: only their own groups, no handover codes. */
export interface FarmerOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  address: Order['address'];
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  groups: (OrderGroup & { id: string })[];
}

export interface OnlinePayment {
  provider: 'razorpay';
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  orderNumber: string;
  expiresAt?: string;
  prefill: { name?: string; email?: string; contact?: string };
}

/** Group id regardless of which serializer produced it. */
export const groupId = (g: OrderGroup) => (g.id ?? g._id)!;

// ─── Delivery partners ───────────────────────────────────────────────────────

export const VEHICLES = ['bicycle', 'bike', 'scooter', 'auto', 'van'] as const;
export type Vehicle = (typeof VEHICLES)[number];

export interface PartnerProfile {
  id: string;
  vehicle: Vehicle;
  base: { lng: number; lat: number; label: string } | null;
  serviceRadiusKm: number;
  isOnline: boolean;
  maxActiveJobs: number;
  /** Has a base location, so it can go online. */
  ready: boolean;
}

export interface PartnerOverview {
  profile: PartnerProfile;
  activeJobs: number;
  availableJobs: number;
  today: { jobs: number; earned: number; km: number };
  week: { jobs: number; earned: number };
  cashInHand: number;
}

export type JobStatus = 'requested' | 'assigned' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'scheduled';

/** A delivery job. Contact details and exact addresses appear only once it is yours. */
export interface DeliveryJob {
  id: string;
  status: JobStatus;
  orderNumber: string;
  payout: number;
  codAmount: number;
  tripKm: number;
  pickupDistanceKm?: number;
  scheduledFor: string;
  requestedAt?: string;
  assignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  itemCount: number;
  items?: { name: string; quantity: number; unit: string; packSizeGrams?: number }[];
  pickup: { farmName: string; area: string; location: { lng: number; lat: number }; line1?: string; farmerName?: string; farmerPhone?: string };
  drop: { area: string; location?: { lng: number; lat: number }; name?: string; phone?: string; line1?: string };
}
