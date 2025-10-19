export interface Tenant {
  _id: string;
  fullName: string;
  phone?: string;
  email?: string;
  password?: string; // for creation
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}