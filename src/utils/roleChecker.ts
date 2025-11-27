import type { UserRole } from "../types/user";

/** Lấy role hiện tại của admin từ localStorage */
export const getCurrentAdminRole = (): UserRole | "" => {
  try {
    const userData = localStorage.getItem("admin_currentUser");
    if (!userData) return "";
    const user = JSON.parse(userData);
    const role = (user?.role || "").toUpperCase();
    return role as UserRole;
  } catch {
    return "";
  }
};

/** Kiểm tra role có nằm trong danh sách cho phép không */
export const hasAdminRole = (allowedRoles: UserRole[]): boolean => {
  const currentRole = getCurrentAdminRole();
  return allowedRoles.map((r) => r.toUpperCase()).includes(currentRole);
};

/** Hàm rút gọn tiện */
export const isAdmin = (): boolean => hasAdminRole(["ADMIN"]);
export const isStaff = (): boolean => hasAdminRole(["STAFF"]);
export const isAdminOrStaff = (): boolean => hasAdminRole(["ADMIN", "STAFF"]);
