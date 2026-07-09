import { useEffect, useState } from 'react';
import { Table, Button, Space, Input, Card, Modal, Form, message, Popconfirm, Row, Col, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { contactAPI } from '../../api';

export default function ContactList() {
  const [contacts, setContacts] = useState([]);
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
      const { data } = await contactAPI.getAll(params);
      setContacts(data.contacts);
      setPagination(data.pagination);
    } catch { message.error('Failed to fetch'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openModal = (contact = null) => {
    setEditing(contact);
    if (contact) form.setFieldsValue(contact);
    else form.resetFields();
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await contactAPI.update(editing._id, values);
        message.success('Contact updated');
      } else {
        await contactAPI.create(values);
        message.success('Contact created');
      }
      setModalOpen(false);
      fetch(pagination.page);
    } catch { message.error('Save failed'); }
  };

  const handleDelete = async (id) => {
    try {
      await contactAPI.delete(id);
      message.success('Deleted');
      fetch(pagination.page);
    } catch { message.error('Delete failed'); }
  };

  const columns = [
    { title: 'Name', key: 'name', render: (_, r) => `${r.firstName} ${r.lastName || ''}` },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Company', dataIndex: 'company', key: 'company' },
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
        <Col><h2 className="text-xl font-semibold">Contacts</h2></Col>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>New Contact</Button></Col>
      </Row>

      <Card className="mb-4">
        <Space>
          <Input prefix={<SearchOutlined />} placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} onPressEnter={() => fetch(1)} style={{ width: 250 }} />
          <Button onClick={() => fetch(1)}>Search</Button>
        </Space>
      </Card>

      <Table dataSource={contacts} columns={columns} rowKey="_id" loading={loading}
        pagination={{ current: pagination.page, total: pagination.total, pageSize: 20, onChange: (p) => fetch(p) }}
      />

      <Modal title={editing ? 'Edit Contact' : 'New Contact'} open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)} width={600}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}><Input /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastName" label="Last Name"><Input /></Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}><Input /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Phone"><Input /></Form.Item>
            </Col>
          </Row>
          <Form.Item name="company" label="Company"><Input /></Form.Item>
          <Form.Item name="notes" label="Notes"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
