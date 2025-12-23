import React from "react";
import { Card, Typography, Space, Divider, Tag } from "antd";

const { Title, Paragraph, Text } = Typography;

const TermsOfService: React.FC = () => {
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 16px" }}>
      <Card bordered={false} style={{ borderRadius: 16, boxShadow: "0 6px 18px rgba(0,0,0,0.06)" }}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <Title level={2} style={{ marginBottom: 0 }}>
              Điều khoản dịch vụ
            </Title>
            <Text type="secondary">
              Áp dụng cho hệ thống Trọ 360 (phiên bản hiện tại) —{" "}
              <Tag color="blue" style={{ marginLeft: 6 }}>
                Cập nhật: 19/12/2025
              </Tag>
            </Text>
          </div>

          <Divider />

          <Title level={4}>1) Phạm vi & định nghĩa</Title>
          <Paragraph>
            “Trọ 360” là hệ thống hỗ trợ <Text strong>tìm kiếm phòng</Text>,{" "}
            <Text strong>liên hệ chủ trọ</Text>, và <Text strong>quản lý nghiệp vụ thuê</Text>{" "}
            (hợp đồng, hóa đơn, yêu cầu chuyển đi/hoàn cọc) theo chức năng có sẵn trên hệ thống.
          </Paragraph>
          <Paragraph>
            “Người dùng” bao gồm khách xem phòng (chưa đăng nhập) và khách thuê/đối tượng có tài khoản.
          </Paragraph>

          <Title level={4}>2) Quy tắc sử dụng</Title>
          <Paragraph>
            Người dùng cam kết cung cấp thông tin trung thực khi liên hệ/đặt thuê. Không sử dụng hệ thống cho mục đích
            vi phạm pháp luật, spam, gây ảnh hưởng đến vận hành hoặc trải nghiệm của người khác.
          </Paragraph>

          <Title level={4}>3) Thông tin phòng & tính chính xác</Title>
          <Paragraph>
            Thông tin phòng (giá, trạng thái, hình ảnh, tiện ích) được hiển thị theo dữ liệu quản trị cập nhật.
            Trọ 360 cố gắng đảm bảo độ chính xác nhưng có thể có sai lệch/độ trễ trong một số thời điểm.
          </Paragraph>

          <Title level={4}>4) Liên hệ, đặt thuê & đặt cọc</Title>
          <Paragraph>
            Người dùng có thể xem chi tiết phòng và sử dụng các kênh liên hệ (gọi điện/Zalo/Facebook/Messenger) để trao
            đổi. Việc đặt thuê/đặt cọc (nếu có) tuân theo quy trình được chủ trọ/đơn vị quản lý xác nhận.
          </Paragraph>

          <Title level={4}>5) Hợp đồng, hóa đơn & thanh toán</Title>
          <Paragraph>
            Khi phát sinh hợp đồng/hóa đơn, hệ thống lưu trữ thông tin phục vụ quản lý. Các khoản phí, ngày lập hóa đơn,
            trạng thái thanh toán… được xác định theo nghiệp vụ trên hệ thống và/hoặc xác nhận của chủ trọ.
          </Paragraph>
          <Paragraph>
            Trọ 360 không tự động trích tiền từ tài khoản ngân hàng của người dùng. Việc thanh toán được thực hiện theo
            phương thức mà chủ trọ/đơn vị quản lý cung cấp (ví dụ: chuyển khoản/tiền mặt).
          </Paragraph>

          <Title level={4}>6) Hủy, chấm dứt hợp đồng & hoàn cọc</Title>
          <Paragraph>
            Trường hợp chấm dứt/hủy hợp đồng và xử lý hoàn cọc (nếu có) sẽ được thực hiện theo quy trình nghiệp vụ trong
            hệ thống và thỏa thuận giữa các bên. Trọ 360 ghi nhận mốc thời gian và trạng thái để phục vụ tra cứu.
          </Paragraph>

          <Title level={4}>7) Tài khoản & bảo mật</Title>
          <Paragraph>
            Người dùng chịu trách nhiệm bảo mật thông tin đăng nhập. Không chia sẻ tài khoản cho người khác sử dụng nếu
            không được phép. Khi phát hiện truy cập trái phép, vui lòng liên hệ để được hỗ trợ.
          </Paragraph>

          <Title level={4}>8) Khiếu nại & hỗ trợ</Title>
          <Paragraph>
            Người dùng có thể gửi phản hồi/khiếu nại qua chức năng “Khiếu nại” hoặc trang “Liên hệ”. Trọ 360 sẽ tiếp nhận
            và phản hồi trong thời gian sớm nhất theo khung giờ làm việc.
          </Paragraph>

          <Title level={4}>9) Thay đổi điều khoản</Title>
          <Paragraph>
            Trọ 360 có thể cập nhật điều khoản để phù hợp với thay đổi chức năng/nghiệp vụ. Phiên bản điều khoản mới sẽ
            có hiệu lực kể từ thời điểm được công bố trên hệ thống.
          </Paragraph>

          <Divider />
          <Paragraph style={{ marginBottom: 0 }}>
            Nếu bạn cần hỗ trợ, vui lòng truy cập trang <Text strong>Liên hệ</Text>.
          </Paragraph>
        </Space>
      </Card>
    </div>
  );
};

export default TermsOfService;

