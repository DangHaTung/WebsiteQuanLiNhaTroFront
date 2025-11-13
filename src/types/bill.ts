import type { Contract } from "./contract";

export type BillStatus = "DRAFT" | "PAID" | "UNPAID" | "PARTIALLY_PAID" | "VOID" | "PENDING_CASH_CONFIRM";
export type BillType = "RECEIPT" | "CONTRACT" | "MONTHLY";

export interface CheckinFormData {
  fullName: string;
  phone: string;
  email: string;
  roomId: string;
  checkinDate: string;
  duration: number;
  deposit: number;
  paymentMethod: string;
  idCard: string;
  emergencyContact: string;
  notes: string;
}

export interface BillLineItem {
    item: string;
    quantity: number;
    unitPrice: number; // number for API calls
    lineTotal: number; // number for API calls
}

export interface BillPayment {
    paidAt: string; // ISO string
    amount: number; // number for API calls
    method: string;
    provider?: string;
    transactionId?: string;
    note?: string;
    metadata?: any;
}

export interface Bill {
    _id: string;
    contractId: string | Contract;  // Can be populated
    billingDate: string; // ISO string
    billType: BillType;
    status: BillStatus;
    lineItems: BillLineItem[];
    amountDue: number; // number for API calls
    amountPaid: number; // number for API calls
    payments?: BillPayment[];
    note?: string;
    createdAt?: string;
    updatedAt?: string;
}
