import React, { useEffect, useState } from "react";
import { Card, List, Typography, Badge } from "antd";
import axios from "axios";

const { Title } = Typography;

interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    axios.get("http://localhost:3000/notifications").then((res) => {
      setNotifications(res.data);
    });
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Title level={2}>🔔 Notifications</Title>
      <Card>
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item className={item.isRead ? "opacity-60" : ""}>
              <List.Item.Meta
                title={
                  <Badge dot={!item.isRead} color="red">
                    <span className="font-medium">{item.title}</span>
                  </Badge>
                }
                description={
                  <>
                    <p>{item.message}</p>
                    <small className="text-gray-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </small>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default Notifications;
