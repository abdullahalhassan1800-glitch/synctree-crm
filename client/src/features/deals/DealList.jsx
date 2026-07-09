import { useEffect, useState } from 'react';
import { Table, Button, Space, Input, Card, Modal, Form, message, Popconfirm, Row, Col, Tag, Select, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { dealAPI, leadAPI } from '../../api';

export default function DealList() {
  const [deals, setDeals] = useState([]);
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
      const { data } = await dealAPI.getAll(params);
      setDeals(data.deals);
      setPagination(data.pagination);
    } catch { message.error('Failed to fetch'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openModal = (deal = null) => {
    setEditing(deal);
    if (deal) form.setFieldsValue(deal);
    else form.resetFields();
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await dealAPI.update(editing._id, values);
        message.success('Deal updated');
      } else {
        await dealAPI.create(values);
        message.success('Deal created');
      }
      setModalOpen(false);
      fetch(pagination.page);
    } catch { message.error('Save failed'); }
  };

  const handleDelete = async (id) => {
    try { await dealAPI.delete(id); message.success('Deleted'); fetch(pagination.page); }
    catch { message.error('Delete failed'); }
  };

  const statusColors = { open: 'blue', won: 'green', lost: 'red' };

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Value', dataIndex: 'value', key: 'value', render: (v) => `₹${(v || 0).toLocaleString()}`, sorter: true },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusColors[s]}>{s}</Tag> },
    { title: 'Contact', dataIndex: ['contact', 'firstName'], key: 'contact', render: (_, r) => r.contact ? `${r.contact.firstName} ${r.contact.lastName || ''}` : '-' },
    { title: 'Assigned To', dataIndex: ['assignedTo', 'name'], key: 'assignedTo' },
    { title: 'Close Date', dataIndex: 'expectedCloseDate', key: 'expectedCloseDate', render: (d) => d ? new Date(d).toLocaleDateString() : '-' },
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
        <Col><h2 className="text-xl font-semibold">Deals</h2></Col>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>New Deal</Button></Col>
      </Row>
      <Card className="mb-4">
        <Space>
          <Input prefix={<SearchOutlined />} placeholder="Search deals..." value={search} onChange={e => setSearch(e.target.value)} onPressEnter={() => fetch(1)} style={{ width: 250 }} />
          <Button onClick={() => fetch(1)}>Search</Button>
        </Space>
      </Card>
      <Table dataSource={deals} columns={columns} rowKey="_id" loading={loading}
        pagination={{ current: pagination.page, total: pagination.total, pageSize: 20, onChange: (p) => fetch(p) }}
      />
      <Modal title={editing ? 'Edit Deal' : 'New Deal'} open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)} width={600}>
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="value" label="Value"><InputNumber style={{ width: '100%' }} prefix="₹" /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status">
                <Select>
                  <Select.Option value="open">Open</Select.Option>
                  <Select.Option value="won">Won</Select.Option>
                  <Select.Option value="lost">Lost</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="notes" label="Notes"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
