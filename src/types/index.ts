/**
 * @file Core TypeScript types and interfaces for MaslaConnect
 * @description All data models, enums, and interfaces used throughout the application
 * 
 * Main entities:
 * - UserProfile: User account and profile information
 * - Service: Freelancer service listings
 * - Order: Service request/contract between client and freelancer
 * - Payment: Payment transaction records
 * - Conversation: Chat conversation between two users
 * - Rating: User reviews and ratings
 */

// User & Authentication Types

/** Possible user roles in the platform */
export type UserRole = "freelancer" | "client" | "admin";

/**
 * User profile and account information
 * Stores all user-related data including bio, skills, ratings, etc.
 */
export interface UserProfile {
  id: string;
  email: string;
  password: string; // Demo only - should be hashed in production backend
  name: string;
  role: UserRole;
  accountType?: "person" | "company" | "school";
  avatar?: string;
  phoneCountry?: string;
  phoneDialCode?: string;
  phoneNumber?: string;
  tagline?: string; // Short profession/headline
  bio?: string;
  location?: string;
  skills: string[]; // Array of skill tags
  socialLinks?: {
    portfolio?: string;
    linkedin?: string;
    github?: string;
    phone?: string;
  };
  /** Perfil de pasante (freelancer buscando pasantía) */
  internshipProfile?: InternshipCandidateProfile;
  /** Perfil de empresa (client buscando pasantes) */
  companyProfile?: CompanyProfile;
  /** Perfil de escuela/institución educativa */
  schoolProfile?: SchoolProfile;
  /** Proyectos de portafolio */
  portfolio?: PortfolioProject[];
  rating?: number; // Average rating (1-5 stars)
  reviewCount?: number; // Total number of reviews
  createdAt: Date;
  updatedAt: Date;
}

/** Proyecto del portafolio del usuario */
export interface PortfolioProject {
  id: string;
  title: string;
  description?: string;
  image: string;
  category: string;
  link?: string;
}

/** Perfil de pasante: disponibilidad, rubro, escuela y documentación */
export interface InternshipCandidateProfile {
  seekingInternship: boolean;
  field: string;
  school?: string;
  degree?: string;
  year?: string;
  availability?: string;
  documentsReady?: boolean;
  coverLetter?: string;
}

/** Perfil de empresa que busca pasantes */
export interface CompanyProfile {
  companyName: string;
  industry: string;
  taxId?: string;
  website?: string;
  description?: string;
  seekingInterns: boolean;
}

/** Perfil de escuela/institución educativa */
export interface SchoolProfile {
  schoolName: string;
  institutionCode?: string;
  website?: string;
  description?: string;
  seekingStudents?: boolean;
}

/** Modalidad de la pasantía */
export type InternshipModality = "presencial" | "remoto" | "hibrido";

/** Pasantía publicada por una empresa en la plataforma */
export interface Internship {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  description: string;
  field: string;
  skills: string[];
  stipend?: string;
  duration: string;
  modality: InternshipModality;
  location: string;
  requirements?: string;
  schoolInfo?: string;
  status: "open" | "closed";
  externalUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Estado de postulación a pasantía */
export type InternshipApplicationStatus =
  | "applied"
  | "reviewing"
  | "interview"
  | "accepted"
  | "rejected";

/** Postulación de un pasante a una pasantía */
export interface InternshipApplication {
  id: string;
  internshipId: string;
  internshipTitle: string;
  companyId: string;
  companyName: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  coverLetter?: string;
  school?: string;
  degree?: string;
  documentsReady: boolean;
  status: InternshipApplicationStatus;
  matchScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Enlace externo a plataformas de pasantías en Argentina */
export interface ExternalInternshipLink {
  id: string;
  name: string;
  organization: string;
  url: string;
  field: string;
  description: string;
}

export interface Service {
  id: string;
  userId: string; // ID of the user offering the service
  userName?: string; // Cached user name for quick access
  title: string; // Service name
  description: string; // Detailed service description
  category: string; // Category/tag for filtering
  price: string; // Service price (as string for precision)
  rate?: number; // Hourly/daily rate
  rating: number; // Average rating (1-5)
  reviews: number; // Total number of reviews
  image?: string; // Main image URL
  images?: string[]; // Additional images
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Direct message between two users
 * Used for initial contact before creating a conversation
 */
export interface ContactMessage {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  whatsapp?: string;
  createdAt: Date;
}

// Payment & Order Types

/** Status of a payment transaction */
export type PaymentStatus = "pending" | "completed" | "failed" | "cancelled";
/** Payment method used for the transaction */
export type PaymentMethod = "card" | "mercado_pago" | "bank_transfer";

/**
 * Payment record for an order
 * Tracks all payment-related information including Stripe/Mercado Pago IDs
 */
export interface Payment {
  id: string;
  orderId: string;
  clientId: string; // User making the payment
  freelancerId: string; // User receiving the payment
  amount: number;
  currency: string; // USD, ARS, EUR, etc
  status: PaymentStatus;
  method: PaymentMethod;
  stripePaymentIntentId?: string; // Stripe integration (coming soon)
  mercadoPagoId?: string; // Mercado Pago integration (coming soon)
  metadata?: {
    [key: string]: string | number;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Service order/contract between client and freelancer
 * Tracks the entire order lifecycle from creation to completion
 */
export interface Order {
  id: string;
  serviceId: string; // Reference to the service being ordered
  clientId: string; // User requesting/paying for the service
  freelancerId: string; // User providing the service
  totalAmount: number;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  paymentId?: string; // Linked payment record
  notes?: string; // Additional order notes
  deliveryDate?: Date; // Expected completion date
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  /** Current authenticated user or null if not logged in */
  user: UserProfile | null;
  /** Whether user is currently authenticated */
  isAuthenticated: boolean;
  /** Whether auth is loading (async operation in progress) */
  isLoading: boolean;
  /** Error message from last auth operation */
  error: string | null;
}

// Chat & Messaging Types

/**
 * Single message in a conversation
 * Part of real-time chat functionality
 */
export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string; // Cached sender name
  senderAvatar?: string; // Cached sender avatar URL
  content: string; // Message text content
  createdAt: Date;
  readAt?: Date; // When message was read by recipient
}

/**
 * Chat conversation between two users
 * Two-way conversation containing messages
 * Supports real-time updates via Supabase subscriptions
 */
export interface Conversation {
  id: string;
  participant1Id: string;
  participant1?: UserProfile; // Cached first participant
  participant2Id: string;
  participant2?: UserProfile; // Cached second participant
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: string; // Cache of last message text
  lastMessageTime?: Date; // Cache of last message timestamp
  messages?: ConversationMessage[]; // Messages in this conversation
}
