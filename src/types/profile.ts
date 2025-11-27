// Các interface dùng cho trang Profile
export interface IRoom {
  _id: string;
  roomNumber: string;
  type: string;
  pricePerMonth: string;
  areaM2: number;
  floor: number;
  district: string;
  status: string;
  image: string;
  images: string[];
  currentContractSummary?: {
    contractId: string;
    tenantName: string;
    startDate: string;
    endDate: string;
    monthlyRent: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IContract {
  _id: number | string;
  startDate: string;
  endDate: string;
  status: string;
}

export type BillStatus = "PAID" | "UNPAID" | "PARTIALLY_PAID";

export interface IBill {
  _id: number;
  billingDate: string;
  amountDue: number;
  amountPaid: number;
  status: BillStatus;
}
