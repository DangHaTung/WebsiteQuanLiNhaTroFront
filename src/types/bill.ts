import type { Contract } from "./contract";

/**
 * Trạng thái hóa đơn
 * - DRAFT: bản nháp
 * - PAID: đã thanh toán
 * - UNPAID: chưa thanh toán
 * - PARTIALLY_PAID: thanh toán một phần
 * - VOID: hủy hóa đơn
 * - PENDING_CASH_CONFIRM: chờ xác nhận khi thanh toán tiền mặt
 */
export type BillStatus =
  | "DRAFT"
  | "PAID"
  | "UNPAID"
  | "PARTIALLY_PAID"
  | "VOID"
  | "PENDING_CASH_CONFIRM";

/**
 * Loại hóa đơn:
 * - RECEIPT: Phiếu thu
 * - CONTRACT: Hóa đơn hợp đồng check-in
 * - MONTHLY: Hóa đơn tháng
 */
export type BillType = "RECEIPT" | "CONTRACT" | "MONTHLY";

/**
 * Dữ liệu form check-in để tạo hợp đồng và hóa đơn ban đầu
 */
export interface CheckinFormData {
  fullName: string;
  phone: string;
  email: string;
  roomId: string;
  checkinDate: string; // ngày nhận phòng
  duration: number; // số tháng thuê
  deposit: number; // tiền cọc
  paymentMethod: string; // tiền mặt, chuyển khoản...
  idCard: string; // CCCD
  emergencyContact: string; // liên hệ khẩn cấp
  notes: string;
}

/**
 * Một dòng trong hóa đơn (tiền phòng, dịch vụ,...)
 */
export interface BillLineItem {
  item: string; // tên dịch vụ hoặc khoản thu
  quantity: number; // số lượng
  unitPrice: number; // đơn giá
  lineTotal: number; // thành tiền (quantity * unitPrice)
}

/**
 * Một lần thanh toán của hóa đơn
 */
export interface BillPayment {
  paidAt: string; // thời gian thanh toán (ISO string)
  amount: number; // số tiền thanh toán
  method: string; // phương thức: cash, transfer, momo, zalo,...
  provider?: string; // ví dụ: MoMo, ZaloPay
  transactionId?: string; // mã giao dịch
  note?: string; // ghi chú
  metadata?: any; // dữ liệu mở rộng (billproof, response bank,...)
}

/**
 * Thông tin số điện
 */
export interface ElectricityReading {
  previous?: number; // Số điện cũ (kỳ trước)
  current?: number;  // Số điện mới (kỳ này)
  consumption?: number; // Số điện tiêu thụ = current - previous
}

/**
 * Thông tin xe
 */
export interface BillVehicle {
  type: 'motorbike' | 'electric_bike' | 'bicycle';
  licensePlate?: string;
}

/**
 * Cấu trúc đầy đủ của 1 hóa đơn
 */
export interface Bill {
  _id: string;

  /** 
   * Có thể là contractId dạng string
   * hoặc object Contract sau khi backend populate
   */
  contractId: string | Contract;

  billingDate: string; // ngày lập hóa đơn
  billType: BillType; // loại hóa đơn
  status: BillStatus; // trạng thái
  lineItems: BillLineItem[]; // danh sách khoản thu

  amountDue: number; // tổng tiền cần thanh toán
  amountPaid: number; // tổng tiền đã thanh toán

  // Thông tin số điện (để hiển thị chi tiết trong hóa đơn)
  electricityReading?: ElectricityReading;
  
  // Thông tin xe chi tiết
  vehicles?: BillVehicle[];

  payments?: BillPayment[]; // danh sách thanh toán
  note?: string; // ghi chú thêm
  dueDate?: string; // hạn thanh toán
  tenantId?: string | { _id: string; fullName?: string }; // người thuê
  createdAt?: string;
  updatedAt?: string;
}
