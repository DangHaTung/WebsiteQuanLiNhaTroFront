import type { User } from "./user";
import type { Room } from "./room";

export type CheckinStatus = "CREATED" | "COMPLETED" | "CANCELED";
export type DepositDisposition = "FORFEIT" | "APPLIED" | "REFUNDED";

export interface FileInfo {
  url: string;
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
  bytes: number;
}

export interface TenantSnapshot {
  fullName?: string;
  phone?: string;
  identityNo?: string;
  address?: string;
  note?: string;
}

export type VehicleType = 'motorbike' | 'electric_bike' | 'bicycle';

export interface Vehicle {
  type: VehicleType;
  licensePlate?: string;
}

export interface Checkin {
  _id: string;
  tenantId?: string | User;
  staffId: string | User;
  roomId: string | Room;
  contractId?: string;
  finalContractId?: string;
  receiptBillId?: string | any; // Can be populated Bill object
  checkinDate: string;
  durationMonths: number;
  deposit: number;
  monthlyRent: number;
  tenantSnapshot: TenantSnapshot;
  notes?: string;
  attachments?: FileInfo[];
  cccdImages?: {
    front?: FileInfo;
    back?: FileInfo;
  };
  status: CheckinStatus;
  depositDisposition?: DepositDisposition;
  receiptPaidAt?: string; // Thời điểm thanh toán phiếu thu (để tính thời hạn 3 ngày)
  initialElectricReading?: number; // Số điện chốt ban đầu khi check-in (để tính số điện tiêu thụ cho hóa đơn hàng tháng)
  vehicles?: Vehicle[]; // Danh sách xe của khách thuê
  createdAt: string;
  updatedAt?: string;
}
