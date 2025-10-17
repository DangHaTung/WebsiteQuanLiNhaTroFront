export type UserRole = "ADMIN" | "USER";

export interface User {
  id: string;
  avatar?: string;
  fullName: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  role: UserRole;
  createdAt?: string;
}

export type IUserToken = Omit<User, "passwordHash">;
