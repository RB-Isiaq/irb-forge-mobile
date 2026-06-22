/** Standard envelope returned by every IRB Forge API endpoint. */
export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  data: T;
  message: string | null;
  timestamp: string;
}

export interface NormalizedApiError {
  code: string;
  message: string;
  details: { message: string }[];
}

export type PlatformRole = 'user' | 'super_admin';

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isVerified: boolean;
  role: PlatformRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface GoogleSignInPayload {
  idToken: string;
}

export interface VerifyEmailPayload {
  otp: string;
}
export interface ResendVerificationPayload {
  email: string;
}
export interface ForgotPasswordPayload {
  email: string;
}
export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/* ─── Organizations ─────────────────────────────── */

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationPayload {
  name: string;
  description?: string;
  slug?: string;
}

export type UpdateOrganizationPayload = Partial<CreateOrganizationPayload>;

/* ─── Members ────────────────────────────────────── */

export type OrgRole = 'owner' | 'admin' | 'mentor' | 'member';

/** Returned by GET /organizations/:slug/members — includes embedded user. */
export interface Membership {
  id: string;
  userId: string;
  organizationId: string;
  role: OrgRole;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

/** Returned by GET /organizations/:slug/members/me — no embedded user field. */
export interface MyMembership {
  id: string;
  userId: string;
  organizationId: string;
  role: OrgRole;
  joinedAt: string;
}

export interface UpdateMemberRolePayload {
  role: Exclude<OrgRole, 'owner'>;
}

/* ─── Programs ───────────────────────────────────── */

export type ProgramStatus = 'draft' | 'active' | 'completed' | 'cancelled';

export interface Program {
  id: string;
  organizationId: string;
  createdById: string | null;
  name: string;
  description: string | null;
  status: ProgramStatus;
  capacity: number | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProgramPayload {
  name: string;
  description?: string;
  status?: ProgramStatus;
  capacity?: number;
  startDate?: string;
  endDate?: string;
}

export type UpdateProgramPayload = Partial<CreateProgramPayload>;

/* ─── Invitations ────────────────────────────────── */

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface Invitation {
  id: string;
  email: string;
  organizationId: string;
  role: OrgRole;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  invitedBy?: { firstName: string | null; lastName: string | null };
  organization?: { name: string; slug: string; description: string | null };
}

export interface InvitationPreview {
  organization: { name: string; slug: string; description: string | null };
  invitedBy: { firstName: string | null; lastName: string | null };
  role: OrgRole;
  expiresAt: string;
}

export interface SendInvitationPayload {
  email: string;
  role?: Exclude<OrgRole, 'owner'>;
}
export interface AcceptInvitationPayload {
  token: string;
}
export interface DeclineInvitationPayload {
  token: string;
}

/* ─── Messages ───────────────────────────────────── */

export interface Message {
  id: string;
  organizationId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

export interface SendMessagePayload {
  content: string;
}

/* ─── Account ────────────────────────────────────── */

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export type UpdateProfilePayload = Partial<Pick<User, 'firstName' | 'lastName'>>;

/* ─── Enrollments ────────────────────────────────── */

export type EnrollmentStatus = 'active' | 'completed' | 'dropped';

export interface Enrollment {
  id: string;
  userId: string;
  programId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  program?: {
    id: string;
    name: string;
    description: string | null;
    status: ProgramStatus;
    startDate: string | null;
    endDate: string | null;
  };
}

export interface UpdateEnrollmentStatusPayload {
  status: Exclude<EnrollmentStatus, 'active'>;
}

/* ─── Subscriptions & billing ────────────────────── */

export type OrgPlan = 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'past_due' | 'trialing' | 'cancelled';

export interface Subscription {
  id: string;
  organizationId: string;
  plan: OrgPlan;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  organizationId: string;
  stripePaymentIntentId: string;
  amount: number; // in cents — divide by 100 for display
  currency: string;
  status: 'succeeded' | 'failed' | 'refunded';
  createdAt: string;
}

export type PaginatedPayments = PaginatedData<Payment>;

export interface CheckoutSession {
  url: string;
}
