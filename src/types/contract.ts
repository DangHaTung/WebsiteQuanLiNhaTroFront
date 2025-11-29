import type { User } from "./user";
import type { Room } from "./room";

/**
 * Trạng thái check-in:
 * - CREATED: tạo mới, chưa hoàn tất
 * - COMPLETED: đã hoàn tất check-in
 * - CANCELED: đã hủy check-in
 */
export type CheckinStatus = "CREATED" | "COMPLETED" | "CANCELED";

/**
 * Cách xử lý tiền cọc khi kết thúc hợp đồng:
 * - FORFEIT: giữ lại một phần/toàn bộ cọc
 * - APPLIED: trừ vào tiền phòng/hóa đơn
 * - REFUNDED: hoàn lại cho khách
 */
export type DepositDisposition = "FORFEIT" | "APPLIED" | "REFUNDED";

/**
 * Thông tin file đính kèm (ảnh CCCD, hợp đồng, biên lai,...)
 */
export interface FileInfo {
  url: string;
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
  bytes: number;
}

/**
 * Snapshot thông tin khách thuê tại thời điểm check-in
 * (dùng để lưu lại thông tin phòng trường hợp user thay đổi profile sau này)
 */
export interface TenantSnapshot {
  fullName?: string;
  phone?: string;
  identityNo?: string; // CCCD/CMND
  address?: string;
  note?: string;
}

/**
 * Dữ liệu check-in hoàn chỉnh
 */
export interface Checkin {
  _id: string;

  /**
   * tenantId có thể là:
   * - string (id)
   * - User (đã populate)
   */
  tenantId?: string | User;

  /** Nhân viên thực hiện check-in */
  staffId: string | User;

  /**
   * Thông tin phòng:
   * - string: roomId
   * - Room object nếu được populate
   */
  roomId: string | Room;

  /** ID hợp đồng tạm (contract) nếu có */
  contractId?: string;

  /** ID hợp đồng cuối cùng (final contract) nếu đã tạo */
  finalContractId?: string;

  /** ID phiếu thu tiền cọc */
  receiptBillId?: string;

  /** Ngày check-in */
  checkinDate: string;

  /** Số tháng thuê */
  durationMonths: number;

  /** Tiền cọc */
  deposit: number;

  /** Giá thuê mỗi tháng lúc check-in */
  monthlyRent: number;

  /** Snapshot thông tin khách thuê */
  tenantSnapshot: TenantSnapshot;

  /** Ghi chú thêm */
  notes?: string;

  /** Danh sách file đính kèm */
  attachments?: FileInfo[];

  /** Trạng thái check-in */
  status: CheckinStatus;

  /** Cách xử lý tiền cọc (chỉ dùng sau khi checkout hoặc kết thúc hợp đồng) */
  depositDisposition?: DepositDisposition;

  /** Thời gian tạo */
  createdAt: string;

  /** Thời gian cập nhật */
  updatedAt?: string;
}
