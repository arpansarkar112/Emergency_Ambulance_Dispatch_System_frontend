export type UserRole = "ADMIN" | "PATIENT" | "DRIVER";
export type AmbulanceType = "ICU" | "BASIC" | "PEDIATRIC";
export type AmbulanceStatus = "AVAILABLE" | "BUSY" | "MAINTENANCE";
export type PriorityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type RequestStatus =
  | "PENDING"
  | "ASSIGNED"
  | "EN_ROUTE"
  | "PICKED_UP"
  | "COMPLETED"
  | "CANCELLED";

export interface UserProfile {
  id: string;
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
  emergencyContact?: string | null;
  bloodGroup?: string | null;
}

export interface UserRecord {
  id: string;
  email: string;
  role: UserRole;
  isVerified?: boolean;
  createdAt?: string;
  deletedAt?: string | null;
  profile?: UserProfile | null;
  _count?: {
    requests?: number;
    dispatches?: number;
    ambulances?: number;
  };
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  ambulanceType: AmbulanceType;
  description: string;
  basePriceRange: string;
  responseSla: string;
  imageUrl?: string | null;
  unitCount?: number;
  availableCount?: number;
  createdAt?: string;
}

export interface ReviewItem {
  id: string;
  ambulanceId: string;
  userId: string;
  rating: number;
  title?: string | null;
  comment: string;
  verified: boolean;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    role: UserRole;
    profile?: {
      firstName?: string | null;
      lastName?: string | null;
      avatarUrl?: string | null;
    } | null;
  };
  ambulance?: {
    id: string;
    vehicleNumber: string;
    title?: string | null;
    type: AmbulanceType;
  };
}

export interface AmbulanceItem {
  id: string;
  vehicleNumber: string;
  title?: string | null;
  description?: string | null;
  type: AmbulanceType;
  status: AmbulanceStatus;
  basePrice: number;
  rating: number;
  reviewCount: number;
  images: string[];
  specifications: string[];
  capacity: number;
  responseTime: string;
  featured: boolean;
  currentAddress: string;
  categoryId?: string | null;
  category?: CategoryItem | null;
  driverId?: string | null;
  driver?: UserRecord | null;
  reviews?: ReviewItem[];
  relatedUnits?: AmbulanceItem[];
  _count?: {
    reviews?: number;
    dispatches?: number;
  };
  createdAt?: string;
}

export interface PublicStats {
  totalAmbulances: number;
  availableAmbulances: number;
  totalUsers: number;
  totalDrivers: number;
  totalRequests: number;
  completedDispatches: number;
  categoriesCount: number;
  averageRating: number;
  avgResponseMinutes: number;
}

export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  authorName: string;
  authorRole: string;
  coverImage: string;
  readTime: string;
  published: boolean;
  createdAt: string;
  related?: BlogPostItem[];
}

export interface ContactMessageItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  category: string;
  message: string;
  status: "NEW" | "READ" | "REPLIED";
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  requestId: string;
  patientId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "PAID";
  transactionId?: string | null;
  paymentGateway?: string;
  createdAt?: string;
}

export interface DispatchRequestItem {
  id: string;
  patientId: string;
  patient?: UserRecord | null;
  patientPhone: string;
  pickupAddress: string;
  pickupLocation?: string;
  destinationAddress: string;
  dropoffLocation?: string;
  priority: PriorityLevel;
  status: RequestStatus;
  amount?: number;
  paymentStatus?: string;
  payment?: PaymentRecord | null;
  payments?: PaymentRecord[];
  dispatch?: {
    id: string;
    ambulanceId: string;
    driverId: string;
    ambulance?: AmbulanceItem | null;
    driver?: UserRecord | null;
  } | null;
  ambulance?: AmbulanceItem | null;
  ambulanceId?: string | null;
  driver?: UserRecord | null;
  createdAt: string;
  updatedAt?: string;
}

export interface AuditLogItem {
  id: string;
  userId?: string | null;
  user?: { email: string; role?: UserRole } | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: string | null;
  createdAt: string;
}

export interface NewsletterSubscriberItem {
  id: string;
  email: string;
  createdAt: string;
}
