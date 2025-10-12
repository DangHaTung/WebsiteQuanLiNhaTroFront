export interface Room {
  _id: string;
  roomNumber: string;
  type: 'SINGLE' | 'DOUBLE' | 'STUDIO' | 'VIP';
  pricePerMonth: number;
  areaM2: number;
  floor: number;
  district: string;
  status: 'OCCUPIED' | 'AVAILABLE' | 'MAINTENANCE';
  currentContractSummary?: {
    contractId: string;
    tenantName: string;
    startDate: string;
    endDate: string;
    monthlyRent: string;
  };
  image: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}
