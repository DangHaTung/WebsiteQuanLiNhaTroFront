import type { Tenant } from "./tenant";
import type { Room } from "./room";

export type ContractStatus = "ACTIVE" | "ENDED" | "CANCELED";

export interface Contract {
  _id: string;
  tenantId: string | Tenant;  // Can be populated
  roomId: string | Room;      // Can be populated
  startDate: string; // ISO string
  endDate: string;   // ISO string
  deposit: number;   // number for API calls (converted from Decimal128)
  monthlyRent: number; // number for API calls (converted from Decimal128)
  status: ContractStatus;
  pricingSnapshot?: {
    roomNumber?: string;
    monthlyRent?: number; // converted from Decimal128
    deposit?: number; // converted from Decimal128
  };
  createdAt?: string;
  updatedAt?: string;
}
