export interface Tenant {
  _id: string;
  fullName: string;
  phone?: string;
  email?: string;
  password?: string; // for creation
  role?: string;
  identityNo?: string; // CCCD/CMND - chỉ nhập khi đặt phòng
  createdAt?: string;
  updatedAt?: string;
}