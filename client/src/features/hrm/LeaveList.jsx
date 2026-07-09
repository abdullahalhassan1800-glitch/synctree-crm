import { useEffect, useState } from 'react';
import { Table, Button, Space, Card, Modal, Form, message, Popconfirm, Row, Col, Tag, Select, DatePicker, Typography, Input } from 'antd';
import { PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { leaveAPI } from '../../api/hrm';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function LeaveList() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetch = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await leaveAPI.getAll(params);
      setLeaves(data.leaves);
      setPagination(data.pagination);
    } catch { message.error('Failed to fetch'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [statusFilter]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await leaveAPI.create(values);
      message.success('Leave request submitted');
      setModalOpen(false);
      form.resetFields();
      fetch(1);
    } catch { message.error('Submit failed'); }
  };

  const handleApprove = async (id, status) => {
    try {
      await leaveAPI.approve(id, { status, rejectionReason: status === 'rejected' ? 'Declined' : '' });
      message.success(`Leave ${status}`);
      fetch(pagination.page);
    } catch { message.error('Action failed'); }
  };

  const typeColors = { sick: 'red', casual: 'green', earned: 'blue', unpaid: 'orange', other: 'default' };
  const statusColors = { pending: 'orange', approved: 'green', rejected: 'red', cancelled: 'default' };

  const columns = [
    { title: 'Employee', key: 'name', render: (_, r) => r.employee?.user?.name || '-' },
    { title: 'Type', dataIndex: 'type', key: 'type', render: (t) => <Tag color={typeColors[t]}>{t}</Tag> },
    { title: 'From', dataIndex: 'startDate', key: 'startDate', render: (d) => new Date(d).toLocaleDateString() },
    { title: 'To', dataIndex: 'endDate', key: 'endDate', render: (d) => new Date(d).toLocaleDateString() },
    { title: 'Days', dataIndex: 'totalDays', key: 'totalDays' },
    { title: 'Reason', dataIndex: 'reason', key: 'reason', ellipsis: true },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusColors[s]}>{s}</Tag> },
    {
      title: 'Actions', key: 'actions',
      render: (_, r) => r.status === 'pending' ? (
        <Space>
          <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => handleApprove(r._id, 'approved')}>Approve</Button>
          <Button size="small" danger icon={<CloseOutlined />} onClick={() => handleApprove(r._id, 'rejected')}>Reject</Button>
        </Space>
      ) : <Text type="secondary">{r.approvedBy?.name || '-'}</Text>,
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" className="mb-4">
        <Col><Title level={4}>Leave Management</Title></Col>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>Apply Leave</Button></Col>
      </Row>

      <Card className="mb-4">
        <Space>
          <Select placeholder="Filter by status" allowClear style={{ width: 150 }} value={statusFilter || undefined} onChange={v => setStatusFilter(v || '')}>
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="approved">Approved</Select.Option>
            <Select.Option value="rejected">Rejected</Select.Option>
          </Select>
        </Space>
      </Card>

      <Table dataSource={leaves} columns={columns} rowKey="_id" loading={loading}
        pagination={{ current: pagination.page, total: pagination.total, pageSize: 20, onChange: (p) => fetch(p) }}
      />

      <Modal title="Apply for Leave" open={modalOpen} onOk={handleCreate} onCancel={() => setModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="type" label="Leave Type" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="sick">Sick Leave</Select.Option>
              <Select.Option value="casual">Casual Leave</Select.Option>
              <Select.Option value="earned">Earned Leave</Select.Option>
              <Select.Option value="unpaid">Unpaid Leave</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}><Input type="date" /></Form.Item>
          <Form.Item name="endDate" label="End Date" rules={[{ required: true }]}><Input type="date" /></Form.Item>
          <Form.Item name="reason" label="Reason" rules={[{ required: true }]}><TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
