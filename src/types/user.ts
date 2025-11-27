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
  createdAt?: string;
}

export type IUserToken = Omit<User, "passwordHash">;
