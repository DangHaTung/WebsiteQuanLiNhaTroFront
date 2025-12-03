import api from "../services/api";
import type { User } from "../../../types/user";

export const adminUserService = {
  async list(): Promise<User[]> {
    const raw = localStorage.getItem("admin_currentUser");
    const current = raw ? (JSON.parse(raw) as any) : null;

    // Try full users endpoint first (may include admins)
    try {
      const { data } = await api.get("/users", { params: { page: 1, limit: 100 } });
      const users: any[] = data?.data || data || [];
      const mappedUsers: User[] = users.map((u) => ({
        _id: u._id || u.id,
        fullName: u.fullName || u.username,
        email: u.email,
        phone: u.phone,
        role: u.role,
        createdAt: u.createdAt,
        isLocked: u.isLocked || false,
      }));
// Include current admin user if not in list
      const adminList = current
        ? [{
            _id: current.id || current._id,
            fullName: current.fullName || current.username,
            email: current.email,
            phone: (current as any).phone,
            role: current.role,
          } as User]
        : [];

      // Deduplicate by _id or email, preferring API data (which may include phone)
      const merged = [...mappedUsers, ...adminList];
      const seen = new Set<string>();
      return merged.filter((u) => {
        const key = (u._id || u.id || u.email) as string;
        if (!key) return true;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    } catch (_) {
      // Fallback to tenants list if /users not available
      const { data } = await api.get("/tennant", { params: { page: 1, limit: 100 } });
      const tenants: any[] = data?.data || [];

      const mappedTenants: User[] = tenants.map((t) => ({
        _id: t._id,
        fullName: t.fullName,
        email: t.email,
        phone: t.phone,
        role: "USER",
        createdAt: t.createdAt,
        isLocked: t.isLocked || false,
      }));
// Include current admin user if not in list
      const adminList = current
        ? [{
            _id: current.id || current._id,
            fullName: current.fullName || current.username,
            email: current.email,
            phone: (current as any).phone,
            role: current.role,
          } as User]
        : [];

      // Prefer tenant data first, then add admin (may not have phone in fallback)
      return [...mappedTenants, ...adminList];
    }
  },

  async create(payload: Pick<User, "fullName" | "email" | "role" | "phone"> & { password: string }): Promise<User> {
    const roleToSend = payload.role === "USER" ? "TENANT" : payload.role;
    const { data } = await api.post("/users", {
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
      role: roleToSend,
    });
    const u = data.data || data.user || data;
    return {
      _id: u._id || u.id,
      fullName: u.fullName ?? u.username,
      email: u.email,
      phone: u.phone,
      role: u.role,
      createdAt: u.createdAt,
      isLocked: u.isLocked || false,
    } as User;
  },
// Update user details
  async update(id: string, payload: Partial<Pick<User, "fullName" | "email" | "role" | "phone">> & { password?: string }): Promise<User> {
    const body = { ...payload } as any;
    if (body.role === "USER") body.role = "TENANT";
    const { data } = await api.put(`/users/${id}`, body);
    const u = data.data || data.user || data;
    return {
      _id: u._id || u.id,
      fullName: u.fullName ?? u.username,
      email: u.email,
      phone: u.phone,
      role: u.role,
      createdAt: u.createdAt,
      isLocked: u.isLocked || false,
    } as User;
  },
//  Delete user by ID
  async remove(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
  // Khóa/Mở khóa tài khoản
  async toggleLock(id: string): Promise<User> {
    const { data } = await api.put(`/users/${id}/toggle-lock`);
    const u = data.data || data;
    return {
      _id: u._id || u.id,
      fullName: u.fullName ?? u.username,
      email: u.email,
      phone: u.phone,
      role: u.role,
      createdAt: u.createdAt,
      isLocked: u.isLocked || false,
    } as User;
  },
// Search tenants by keyword
  async searchTenants(keyword?: string): Promise<User[]> {
    const params: any = { role: "TENANT", limit: 100 };
    if (keyword) {
      params.keyword = keyword;
    }
    
    const { data } = await api.get("/users", { params });
    const users: any[] = data?.data || [];
    
    return users.map((u) => ({
      _id: u._id || u.id,
      fullName: u.fullName || u.username,
      email: u.email,
      phone: u.phone,
      role: u.role,
      createdAt: u.createdAt,
      isLocked: u.isLocked || false,
    }));
  },
};


