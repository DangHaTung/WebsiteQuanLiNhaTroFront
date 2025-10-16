export type BillStatus = "PAID" | "UNPAID" | "PARTIALLY_PAID";

export interface BillLineItem {
    item: string;
    quantity: number;
    unitPrice: string; // kept as string to mirror db.json
    lineTotal: string; // kept as string to mirror db.json
}

export interface BillPayment {
    paidAt: string; // ISO string
    amount: string; // string to mirror db.json
    method: string;
    note?: string;
}

export interface Bill {
    _id: string;
    contractId: string;
    billingDate: string; // ISO string
    status: BillStatus;
    lineItems: BillLineItem[];
    amountDue: string; // string in db.json
    amountPaid: string; // string in db.json
    payments?: BillPayment[];
    createdAt?: string;
    updatedAt?: string;
}
