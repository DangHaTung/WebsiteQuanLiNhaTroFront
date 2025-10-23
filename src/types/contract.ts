import type { Tenant } from "./tenant";
import type { Room } from "./room";

export type ContractStatus = "ACTIVE" | "ENDED" | "CANCELED";

export interface Contract {
  _id: string;
  tenantId: string | Tenant;  
  roomId: string | Room;      
  startDate: string; 
  endDate: string;   
  deposit: number;   
  monthlyRent: number; 
  status: ContractStatus;
  pricingSnapshot?: {
    roomNumber?: string;
    monthlyRent?: number; 
    deposit?: number; 
  };
  createdAt?: string;
  updatedAt?: string;
}
