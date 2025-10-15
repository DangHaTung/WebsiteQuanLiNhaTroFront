export interface Room {
  _id?: string;
  roomNumber: string;
  type: "SINGLE" | "DOUBLE" | "DORM";
  pricePerMonth: number;
  areaM2: number;
  floor: number;
  district: string;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  image: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  currentContractSummary?: {
    contractId: string;
    tenantName: string;
    startDate: string;
    endDate: string;
    monthlyRent: string;
  };
}
