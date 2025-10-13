// Các interface dùng cho trang Profile
export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  createdAt: string;
}

export interface IRoom {
  id: number;
  title: string;
  price: number;
  address: string;
  image?: string;
}

export interface IContract {
  _id: number | string;
  startDate: string;
  endDate: string;
  status: string;
}

export type BillStatus = "PAID" | "UNPAID" | "PARTIALLY_PAID";

export interface IBill {
  id: number;
  billingDate: string;
  amountDue: number;
  amountPaid: number;
  status: BillStatus;
}
