export type ContractStatus = "ACTIVE" | "ENDED" | "PENDING";

export interface Contract {
  _id: string;
  tenantId: string;
  roomId: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  deposit: string;   // as string in db.json
  monthlyRent: string; // as string in db.json
  status: ContractStatus;
  pricingSnapshot?: {
    roomNumber?: string;
    monthlyRent?: string;
    deposit?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
