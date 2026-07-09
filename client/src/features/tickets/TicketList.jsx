import { useEffect, useState } from 'react';
import { Table, Button, Space, Input, Card, Modal, Form, message, Popconfirm, Row, Col, Tag, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { ticketAPI } from '../../api';

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetch = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      const { data } = await ticketAPI.getAll(params);
      setTickets(data.tickets);
      setPagination(data.pagination);
    } catch { message.error('Failed to fetch'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openModal = (ticket = null) => {
    setEditing(ticket);
    if (ticket) form.setFieldsValue(ticket);
    else form.resetFields();
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await ticketAPI.update(editing._id, values);
        message.success('Ticket updated');
      } else {
        await ticketAPI.create(values);
        message.success('Ticket created');
      }
      setModalOpen(false);
      fetch(pagination.page);
    } catch { message.error('Save failed'); }
  };

  const handleDelete = async (id) => {
    try { await ticketAPI.delete(id); message.success('Deleted'); fetch(pagination.page); }
    catch { message.error('Delete failed'); }
  };

  const statusColors = { open: 'blue', in_progress: 'orange', resolved: 'green', closed: 'default' };
  const priorityColors = { low: 'green', medium: 'orange', high: 'red', urgent: 'purple' };

  const columns = [
    { title: 'Subject', dataIndex: 'subject', key: 'subject' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusColors[s]}>{s}</Tag> },
    { title: 'Priority', dataIndex: 'priority', key: 'priority', render: (p) => <Tag color={priorityColors[p]}>{p}</Tag> },
    { title: 'Assigned To', dataIndex: ['assignedTo', 'name'], key: 'assignedTo' },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', render: (d) => new Date(d).toLocaleDateString() },
    {
      title: 'Actions', key: 'actions',
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openModal(r)} />
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(r._id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" className="mb-4">
        <Col><h2 className="text-xl font-semibold">Support Tickets</h2></Col>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>New Ticket</Button></Col>
      </Row>
      <Card className="mb-4">
        <Space>
          <Input prefix={<SearchOutlined />} placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} onPressEnter={() => fetch(1)} style={{ width: 250 }} />
          <Button onClick={() => fetch(1)}>Search</Button>
        </Space>
      </Card>
      <Table dataSource={tickets} columns={columns} rowKey="_id" loading={loading}
        pagination={{ current: pagination.page, total: pagination.total, pageSize: 20, onChange: (p) => fetch(p) }}
      />
      <Modal title={editing ? 'Edit Ticket' : 'New Ticket'} open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)} width={600}>
        <Form form={form} layout="vertical">
          <Form.Item name="subject" label="Subject" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea rows={3} /></Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="Status">
                <Select>
                  <Select.Option value="open">Open</Select.Option>
                  <Select.Option value="in_progress">In Progress</Select.Option>
                  <Select.Option value="resolved">Resolved</Select.Option>
                  <Select.Option value="closed">Closed</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Priority">
                <Select>
                  <Select.Option value="low">Low</Select.Option>
                  <Select.Option value="medium">Medium</Select.Option>
                  <Select.Option value="high">High</Select.Option>
                  <Select.Option value="urgent">Urgent</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
