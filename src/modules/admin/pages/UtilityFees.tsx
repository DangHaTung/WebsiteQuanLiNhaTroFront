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
      
      // Default tiers (luôn có 6 tiers)
      const defaultTiers = [
        { min: 0, max: 50, rate: 1806 },
        { min: 51, max: 100, rate: 1866 },
        { min: 101, max: 200, rate: 2167 },
        { min: 201, max: 300, rate: 2729 },
        { min: 301, max: 400, rate: 3050 },
        { min: 401, max: undefined, rate: 3151 },
      ];
      
      // Khởi tạo tất cả 6 tiers với giá trị mặc định trước
      for (let i = 1; i <= 6; i++) {
        const defaultTier = defaultTiers[i - 1];
        formValues[`elec_tier${i}_min`] = defaultTier.min;
        formValues[`elec_tier${i}_max`] = defaultTier.max;
        formValues[`elec_tier${i}_rate`] = defaultTier.rate;
      }
      
      data.forEach(fee => {
        if (fee.type === "electricity") {
          formValues.electricityVat = fee.vatPercent || 8;
          
          // Load tiers từ database và override giá trị mặc định
          if (fee.electricityTiers && fee.electricityTiers.length > 0) {
            fee.electricityTiers.forEach((tier, index) => {
              if (index < 6) { // Chỉ load tối đa 6 tiers
            formValues[`elec_tier${index + 1}_min`] = tier.min;
            formValues[`elec_tier${index + 1}_max`] = tier.max;
            formValues[`elec_tier${index + 1}_rate`] = tier.rate;
              }
            });
          }
          
          console.log('[UtilityFees] Loaded tiers from DB:', fee.electricityTiers?.length || 0);
          console.log('[UtilityFees] Form values after load:', {
            elec_tier1_rate: formValues.elec_tier1_rate,
            elec_tier2_rate: formValues.elec_tier2_rate,
            elec_tier3_rate: formValues.elec_tier3_rate,
            elec_tier4_rate: formValues.elec_tier4_rate,
            elec_tier5_rate: formValues.elec_tier5_rate,
            elec_tier6_rate: formValues.elec_tier6_rate,
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
      // Lấy giá trị từ form, nếu không có thì dùng giá trị mặc định
      const getFormValue = (key: string, defaultValue: any) => {
        const val = values[key];
        return val !== undefined && val !== null ? val : defaultValue;
      };
      
      // Tạo tất cả 6 tiers với giá trị từ form hoặc mặc định
      const allTiers: ElectricityTier[] = [
        { 
          min: getFormValue('elec_tier1_min', 0), 
          max: getFormValue('elec_tier1_max', 50), 
          rate: getFormValue('elec_tier1_rate', 1806) 
        },
        { 
          min: getFormValue('elec_tier2_min', 51), 
          max: getFormValue('elec_tier2_max', 100), 
          rate: getFormValue('elec_tier2_rate', 1866) 
        },
        { 
          min: getFormValue('elec_tier3_min', 101), 
          max: getFormValue('elec_tier3_max', 200), 
          rate: getFormValue('elec_tier3_rate', 2167) 
        },
        { 
          min: getFormValue('elec_tier4_min', 201), 
          max: getFormValue('elec_tier4_max', 300), 
          rate: getFormValue('elec_tier4_rate', 2729) 
        },
        { 
          min: getFormValue('elec_tier5_min', 301), 
          max: getFormValue('elec_tier5_max', 400), 
          rate: getFormValue('elec_tier5_rate', 3050) 
        },
        { 
          min: getFormValue('elec_tier6_min', 401), 
          max: undefined, 
          rate: getFormValue('elec_tier6_rate', 3151) 
        },
      ];
      
      // Debug: Log tất cả tiers trước khi filter
      console.log('[UtilityFees] Form values:', {
        elec_tier1_rate: values.elec_tier1_rate,
        elec_tier2_rate: values.elec_tier2_rate,
        elec_tier3_rate: values.elec_tier3_rate,
        elec_tier4_rate: values.elec_tier4_rate,
        elec_tier5_rate: values.elec_tier5_rate,
        elec_tier6_rate: values.elec_tier6_rate,
      });
      console.log('[UtilityFees] All tiers before filter:', JSON.stringify(allTiers, null, 2));
      
      // KHÔNG filter - gửi tất cả 6 tiers lên backend
      const electricityTiers = allTiers;
      
      console.log('[UtilityFees] Tiers to send (no filter):', JSON.stringify(electricityTiers, null, 2));
      console.log('[UtilityFees] Tiers count:', electricityTiers.length);

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
                  <Form.Item label="Giá (₫/người/tháng)" name="waterRate" initialValue={100000}>
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
