import React, { useEffect, useState } from "react";
import { Card, Form, InputNumber, Button, message, Space, Typography, Row, Col, Divider, Switch, Alert, Collapse } from "antd";
import { ThunderboltOutlined, SaveOutlined } from "@ant-design/icons";
import { utilityFeeService, type UtilityFee, type ElectricityTier } from "../services/utilityFee";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const UtilityFees: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [, setFees] = useState<UtilityFee[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      setLoading(true);
      const data = await utilityFeeService.getAll();
      setFees(data);
      
      // Set form values
      const formValues: any = {};
      data.forEach(fee => {
        if (fee.type === "electricity") {
          formValues.electricityVat = fee.vatPercent || 8;
          fee.electricityTiers?.forEach((tier, index) => {
            formValues[`elec_tier${index + 1}_min`] = tier.min;
            formValues[`elec_tier${index + 1}_max`] = tier.max;
            formValues[`elec_tier${index + 1}_rate`] = tier.rate;
          });
        } else {
          formValues[`${fee.type}Rate`] = fee.baseRate;
          formValues[`${fee.type}Active`] = fee.isActive;
        }
      });
      form.setFieldsValue(formValues);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();

      // Save electricity
      const electricityTiers: ElectricityTier[] = [
        { min: values.elec_tier1_min || 0, max: values.elec_tier1_max, rate: values.elec_tier1_rate || 0 },
        { min: values.elec_tier2_min || 0, max: values.elec_tier2_max, rate: values.elec_tier2_rate || 0 },
        { min: values.elec_tier3_min || 0, max: values.elec_tier3_max, rate: values.elec_tier3_rate || 0 },
        { min: values.elec_tier4_min || 0, max: values.elec_tier4_max, rate: values.elec_tier4_rate || 0 },
        { min: values.elec_tier5_min || 0, max: values.elec_tier5_max, rate: values.elec_tier5_rate || 0 },
        { min: values.elec_tier6_min || 0, rate: values.elec_tier6_rate || 0 },
      ].filter(tier => tier.rate > 0);

      await utilityFeeService.createOrUpdate({
        type: "electricity",
        electricityTiers,
        vatPercent: values.electricityVat || 8,
        isActive: true,
      });

      // Save other fees
      const otherFees = [
        { type: "water", baseRate: values.waterRate, isActive: values.waterActive },
        { type: "internet", baseRate: values.internetRate, isActive: values.internetActive },
        { type: "cleaning", baseRate: values.cleaningRate, isActive: values.cleaningActive },
        { type: "parking", baseRate: values.parkingRate, isActive: values.parkingActive },
      ];

      for (const fee of otherFees) {
        await utilityFeeService.createOrUpdate(fee as any);
      }

      message.success("Lưu cấu hình thành công!");
      loadFees();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi lưu cấu hình");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Card
          loading={loading}
          title={
            <Space>
              <ThunderboltOutlined style={{ fontSize: 24, color: "#1890ff" }} />
              <Title level={3} style={{ margin: 0 }}>Quản lý Tiện ích & Phí dịch vụ</Title>
            </Space>
          }
          extra={
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saving}
              size="large"
            >
              Lưu tất cả
            </Button>
          }
        >
          <Alert
            message="Hướng dẫn"
            description="Cấu hình giá các loại tiện ích. Các thay đổi sẽ áp dụng cho tất cả hóa đơn mới được tạo."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Form form={form} layout="vertical">
            {/* Electricity */}
            <Card type="inner" title="⚡ Tiền điện (Bậc thang)" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={24}>
                  <Text type="secondary">Cấu hình giá điện theo bậc thang (EVN)</Text>
                </Col>
              </Row>
              <Divider />
              
              <Collapse defaultActiveKey={["1"]} ghost>
                <Panel header="Bậc 1 (0-50 kWh)" key="1">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="Từ (kWh)" name="elec_tier1_min" initialValue={0}>
                        <InputNumber min={0} style={{ width: "100%" }} disabled />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Đến (kWh)" name="elec_tier1_max" initialValue={50}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Giá (₫/kWh)" name="elec_tier1_rate" initialValue={1806}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>

                <Panel header="Bậc 2 (51-100 kWh)" key="2">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="Từ (kWh)" name="elec_tier2_min" initialValue={51}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Đến (kWh)" name="elec_tier2_max" initialValue={100}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Giá (₫/kWh)" name="elec_tier2_rate" initialValue={1866}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>

                <Panel header="Bậc 3 (101-200 kWh)" key="3">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="Từ (kWh)" name="elec_tier3_min" initialValue={101}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Đến (kWh)" name="elec_tier3_max" initialValue={200}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Giá (₫/kWh)" name="elec_tier3_rate" initialValue={2167}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>

                <Panel header="Bậc 4 (201-300 kWh)" key="4">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="Từ (kWh)" name="elec_tier4_min" initialValue={201}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Đến (kWh)" name="elec_tier4_max" initialValue={300}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Giá (₫/kWh)" name="elec_tier4_rate" initialValue={2729}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>

                <Panel header="Bậc 5 (301-400 kWh)" key="5">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="Từ (kWh)" name="elec_tier5_min" initialValue={301}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Đến (kWh)" name="elec_tier5_max" initialValue={400}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Giá (₫/kWh)" name="elec_tier5_rate" initialValue={3050}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>

                <Panel header="Bậc 6 (>400 kWh)" key="6">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="Từ (kWh)" name="elec_tier6_min" initialValue={401}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Text type="secondary">Không giới hạn</Text>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Giá (₫/kWh)" name="elec_tier6_rate" initialValue={3151}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>
              </Collapse>

              <Divider />
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="VAT (%)" name="electricityVat" initialValue={8}>
                    <InputNumber min={0} max={100} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Other Fees */}
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Card type="inner" title="💧 Tiền nước" style={{ marginBottom: 16 }}>
                  <Form.Item label="Giá cố định (₫/tháng)" name="waterRate" initialValue={100000}>
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                  <Form.Item label="Kích hoạt" name="waterActive" valuePropName="checked" initialValue={true}>
                    <Switch />
                  </Form.Item>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card type="inner" title="📡 Internet" style={{ marginBottom: 16 }}>
                  <Form.Item label="Giá (₫/tháng)" name="internetRate" initialValue={100000}>
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                  <Form.Item label="Kích hoạt" name="internetActive" valuePropName="checked" initialValue={true}>
                    <Switch />
                  </Form.Item>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card type="inner" title="🧹 Phí dọn dẹp" style={{ marginBottom: 16 }}>
                  <Form.Item label="Giá (₫/người/tháng)" name="cleaningRate" initialValue={50000}>
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                  <Form.Item label="Kích hoạt" name="cleaningActive" valuePropName="checked" initialValue={false}>
                    <Switch />
                  </Form.Item>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card type="inner" title="🚗 Phí đỗ xe" style={{ marginBottom: 16 }}>
                  <Form.Item label="Giá (₫/xe/tháng)" name="parkingRate" initialValue={100000}>
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                  <Form.Item label="Kích hoạt" name="parkingActive" valuePropName="checked" initialValue={false}>
                    <Switch />
                  </Form.Item>
                </Card>
              </Col>
            </Row>

            <Divider />

            <Row justify="center">
              <Col>
                <Button
                  type="primary"
                  size="large"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={saving}
                  style={{ minWidth: 200 }}
                >
                  Lưu tất cả cấu hình
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default UtilityFees;
