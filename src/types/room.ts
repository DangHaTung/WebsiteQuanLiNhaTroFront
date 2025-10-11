export interface Room {
  _id: string;
  roomNumber: string;
  type: string;
  pricePerMonth: string;
  areaM2: number;
  floor: number;
  district: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  currentContractSummary?: {
    contractId: string;
    tenantName: string;
    startDate: string;
    endDate: string;
    monthlyRent: string;
  };
  image: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}
