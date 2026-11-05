export type MemberStatus = "active" | "inactive" | "frozen";

export type PaymentType =
  | "monthly_fee"
  | "enrollment"
  | "class_package"
  | "personal_training"
  | "other";

export type PaymentMethod =
  | "cash"
  | "card"
  | "transfer"
  | "online"
  | "other";

export type OrganizationRoleType = "owner" | "admin" | "staff";

export interface OrganizationMembership {
  organization_id: string;
  role: OrganizationRoleType;
  user_id?: string;
}

export interface Member {
  id: string;
  organization_id: string;
  full_name: string;
  document_number: string | null;
  email: string | null;
  phone: string | null;
  status: MemberStatus;
  joined_on: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewMemberInput {
  fullName: string;
  documentNumber?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface Payment {
  id: string;
  organization_id: string;
  member_id: string;
  amount: number;
  paid_on: string;
  payment_type: PaymentType;
  payment_method: PaymentMethod;
  valid_from: string;
  valid_until: string;
  reference: string | null;
  notes: string | null;
  created_at: string;
  member_name?: string;
  member_document?: string | null;
}

export interface PaymentSummary extends Payment {
  memberName: string;
  memberDocument: string | null;
}

export interface MemberPaymentSummary {
  memberId: string;
  organizationId: string;
  fullName: string;
  documentNumber: string | null;
  email: string | null;
  phone: string | null;
  memberStatus: MemberStatus;
  lastPaymentId: string | null;
  lastAmount: number | null;
  lastPaidOn: string | null;
  lastPaymentType: PaymentType | null;
  lastPaymentMethod: PaymentMethod | null;
  lastValidFrom: string | null;
  lastValidUntil: string | null;
}

export interface PaymentDraft {
  memberId: string;
  amount: number;
  paidOn: string;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  validFrom: string;
  validUntil: string;
  reference?: string | null;
  notes?: string | null;
}

export interface PaymentReceiptData {
  memberName: string;
  amount: number;
  paidOn: string;
  paymentType: string;
  paymentMethod: string;
  validFrom: string;
  validUntil: string;
  reference?: string | null;
  receiptNumber?: string | null;
  memberDocument?: string | null;
}

