export type UserRole = "ADMIN" | "USER" | "STAFF" | "TENANT";

export interface User {
  id?: string;
  _id?: string;
  avatar?: string;
  fullName: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  role: UserRole;
  address?: string;
  createdAt?: string;
  isLocked?: boolean;
}

export type IUserToken = Omit<User, "passwordHash">;
