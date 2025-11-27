export interface Room {
  _id?: string;
  roomNumber: string;
  type: "SINGLE" | "DOUBLE";
  pricePerMonth: number;
  areaM2: number;
  floor: number;
  status: "AVAILABLE" | "DEPOSITED" | "OCCUPIED" | "MAINTENANCE";
  occupantCount?: number;
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
  utilities?: Array<{
    _id: string;
    name: string;
    condition: "new" | "used" | "broken";
    description?: string;
  }>;
}
