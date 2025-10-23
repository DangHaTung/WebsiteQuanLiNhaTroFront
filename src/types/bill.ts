import type { Contract } from "./contract";

export type BillStatus = "PAID" | "UNPAID" | "PARTIALLY_PAID" | "VOID";

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
    unitPrice: number; 
    lineTotal: number; 
}

export interface BillPayment {
    paidAt: string; 
    amount: number; 
    method: string;
    provider?: string;
    transactionId?: string;
    note?: string;
    metadata?: any;
}

export interface Bill {
    _id: string;
    contractId: string | Contract;  
    billingDate: string; 
    status: BillStatus;
    lineItems: BillLineItem[];
    amountDue: number; 
    amountPaid: number; 
    payments?: BillPayment[];
    note?: string;
    createdAt?: string;
    updatedAt?: string;
}
