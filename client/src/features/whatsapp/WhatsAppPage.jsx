import { useEffect, useState } from 'react';
import {
  Card, Table, Button, Space, Tag, Typography, Input, Form, message, Modal, Row, Col,
  Select, Tabs, Badge, List, Avatar, Tooltip,
} from 'antd';
import {
  SendOutlined, WhatsAppOutlined, UserOutlined,
  InboxOutlined, ExportOutlined,
} from '@ant-design/icons';
import { whatsAppAPI } from '../../api';

const { Title, Text } = Typography;
const { TextArea } = Input;

const directionColors = { in: 'green', out: 'blue' };
const statusColors = { sent: 'blue', delivered: 'green', read: 'cyan', failed: 'red' };

export default function WhatsAppPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [directionFilter, setDirectionFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('inbox');

  const fetch = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (directionFilter) params.direction = directionFilter;
      const { data } = await whatsAppAPI.getAll(params);
      setMessages(data.messages);
      setPagination(data.pagination);
    } catch { message.error('Failed to fetch'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [directionFilter]);

  const handleSend = async () => {
    try {
      const values = await form.validateFields();
      await whatsAppAPI.send(values);
      message.success('Message sent');
      setModalOpen(false);
      form.resetFields();
      fetch(1);
    } catch { message.error('Send failed'); }
  };

  const inboxMessages = messages.filter(m => m.direction === 'in');
  const sentMessages = messages.filter(m => m.direction === 'out');

  const columns = [
    { title: 'Contact', key: 'contact', render: (_, r) => r.lead ? `${r.lead.firstName} ${r.lead.lastName || ''}` : r.contact ? `${r.contact.firstName} ${r.contact.lastName || ''}` : 'Unknown' },
    { title: 'Message', dataIndex: 'body', key: 'body', ellipsis: true },
    { title: 'Direction', dataIndex: 'direction', key: 'direction', render: (d) => <Tag color={directionColors[d]}>{d === 'in' ? 'Incoming' : 'Outgoing'}</Tag> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Badge status={s === 'delivered' || s === 'read' ? 'success' : s === 'failed' ? 'error' : 'processing'} text={s} /> },
    { title: 'Sent By', dataIndex: ['sentBy', 'name'], key: 'sentBy' },
    { title: 'Time', dataIndex: 'createdAt', key: 'createdAt', render: (d) => new Date(d).toLocaleString() },
  ];

  return (
    <div>
      <Title level={4}><WhatsAppOutlined className="mr-2 text-green-500" /> WhatsApp Messages</Title>

      <Card className="mb-4">
        <Tabs activeKey={activeTab} onChange={setActiveTab}
          items={[
            {
              key: 'inbox',
              label: <span><InboxOutlined /> Inbox ({inboxMessages.length})</span>,
              children: (
                <List
                  dataSource={inboxMessages}
                  loading={loading}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={<Space>{item.lead?.firstName || item.contact?.firstName || 'Unknown'} <Tag color="green">Incoming</Tag></Space>}
                        description={<div><Text>{item.body}</Text><div className="text-xs text-gray-400 mt-1">{new Date(item.createdAt).toLocaleString()}</div></div>}
                      />
                    </List.Item>
                  )}
                  locale={{ emptyText: 'No incoming messages' }}
                />
              ),
            },
            {
              key: 'sent',
              label: <span><ExportOutlined /> Sent ({sentMessages.length})</span>,
              children: (
                <List
                  dataSource={sentMessages}
                  loading={loading}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={<Space>{item.lead?.firstName || item.contact?.firstName || 'Unknown'} <Tag color="blue">Outgoing</Tag> <Badge status={item.status === 'sent' ? 'processing' : item.status === 'delivered' ? 'success' : 'error'} text={item.status} /></Space>}
                        description={<div><Text>{item.body}</Text><div className="text-xs text-gray-400 mt-1">{item.sentBy?.name} · {new Date(item.createdAt).toLocaleString()}</div></div>}
                      />
                    </List.Item>
                  )}
                  locale={{ emptyText: 'No sent messages' }}
                />
              ),
            },
          ]}
        />
      </Card>

      <Row justify="space-between" className="mb-4">
        <Col>
          <Select placeholder="Filter direction" allowClear style={{ width: 150 }} value={directionFilter || undefined} onChange={v => setDirectionFilter(v || '')}>
            <Select.Option value="in">Incoming</Select.Option>
            <Select.Option value="out">Outgoing</Select.Option>
          </Select>
        </Col>
        <Col>
          <Button type="primary" icon={<SendOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>Send Message</Button>
        </Col>
      </Row>

      <Table dataSource={messages} columns={columns} rowKey="_id" loading={loading}
        pagination={{ current: pagination.page, total: pagination.total, pageSize: 20, onChange: (p) => fetch(p) }}
      />

      <Modal title="Send WhatsApp Message" open={modalOpen} onOk={handleSend} onCancel={() => setModalOpen(false)} width={500}>
        <Form form={form} layout="vertical">
          <Form.Item name="lead" label="Lead ID (optional)">
            <Input placeholder="Lead Object ID" />
          </Form.Item>
          <Form.Item name="contact" label="Contact ID (optional)">
            <Input placeholder="Contact Object ID" />
          </Form.Item>
          <Form.Item name="body" label="Message" rules={[{ required: true, message: 'Message is required' }]}>
            <TextArea rows={4} placeholder="Type your message here..." />
          </Form.Item>
          <Form.Item name="templateName" label="Template Name">
            <Input placeholder="Optional: WhatsApp template name" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
