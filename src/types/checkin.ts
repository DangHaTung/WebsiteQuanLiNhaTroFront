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

export interface Checkin {
  _id: string;
  tenantId?: string | User;
  staffId: string | User;
  roomId: string | Room;
  contractId?: string;
  finalContractId?: string;
  receiptBillId?: string;
  checkinDate: string;
  durationMonths: number;
  deposit: number;
  monthlyRent: number;
  tenantSnapshot: TenantSnapshot;
  notes?: string;
  attachments?: FileInfo[];
  status: CheckinStatus;
  depositDisposition?: DepositDisposition;
  createdAt: string;
  updatedAt?: string;
}
