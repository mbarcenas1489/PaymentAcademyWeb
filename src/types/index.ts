export type MemberStatus = "active" | "inactive" | "frozen";

export type PaymentCurrency = "NIO" | "USD";

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
  pending_amount: number;
  currency: PaymentCurrency;
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
  lastPendingAmount: number | null;
  lastCurrency: PaymentCurrency | null;
  lastPaidOn: string | null;
  lastPaymentType: PaymentType | null;
  lastPaymentMethod: PaymentMethod | null;
  lastValidFrom: string | null;
  lastValidUntil: string | null;
}

export interface PaymentDraft {
  memberId: string;
  amount: number;
  pendingAmount?: number;
  currency: PaymentCurrency;
  paidOn: string;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  validFrom: string;
  validUntil: string;
  reference?: string | null;
  notes?: string | null;
}

export interface InstallmentInput {
  paymentId: string;
  installmentAmount: number;
  paidOn: string;
  paymentMethod: PaymentMethod;
  reference?: string | null;
  notes?: string | null;
}

export interface PaymentReceiptData {
  memberName: string;
  amount: number;
  pendingAmount?: number;
  totalPeriodAmount?: number;
  currency?: PaymentCurrency;
  paidOn: string;
  paymentType: string;
  paymentMethod: string;
  validFrom: string;
  validUntil: string;
  reference?: string | null;
  receiptNumber?: string | null;
  memberDocument?: string | null;
}

export interface PaymentSettingValue {
  AmountMonthDollar: number;
  AmountMonthCordoba: number;
  AmountBiweek: number;
  AmountDay: number;
}

export interface AppConfigurationRow {
  Id: string;
  SettingName: string;
  value: Record<string, unknown>;
}

