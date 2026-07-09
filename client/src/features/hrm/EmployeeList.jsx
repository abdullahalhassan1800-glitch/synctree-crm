import { useEffect, useState } from 'react';
import { Table, Button, Space, Input, Card, Modal, Form, message, Popconfirm, Row, Col, Tag, Select, DatePicker, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { employeeAPI } from '../../api/hrm';
import { roleAPI } from '../../api';

const { Title } = Typography;

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
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
      const { data } = await employeeAPI.getAll(params);
      setEmployees(data.employees);
      setPagination(data.pagination);
    } catch { message.error('Failed to fetch'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); roleAPI.getUsers().then(({ data }) => setUsers(data.users)).catch(() => {}); }, []);

  const openModal = (emp = null) => {
    setEditing(emp);
    form.resetFields();
    if (emp) form.setFieldsValue({ ...emp, doj: emp.doj ? emp.doj.split('T')[0] : undefined });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await employeeAPI.update(editing._id, values);
        message.success('Updated');
      } else {
        await employeeAPI.create(values);
        message.success('Created');
      }
      setModalOpen(false);
      fetch(pagination.page);
    } catch { message.error('Save failed'); }
  };

  const handleDelete = async (id) => {
    try { await employeeAPI.delete(id); message.success('Deleted'); fetch(pagination.page); }
    catch { message.error('Delete failed'); }
  };

  const statusColors = { active: 'green', inactive: 'orange', terminated: 'red' };

  const columns = [
    { title: 'Employee ID', dataIndex: 'employeeId', key: 'employeeId' },
    { title: 'Name', key: 'name', render: (_, r) => r.user?.name || '-' },
    { title: 'Email', key: 'email', render: (_, r) => r.user?.email || '-' },
    { title: 'Department', dataIndex: 'department', key: 'department' },
    { title: 'Designation', dataIndex: 'designation', key: 'designation' },
    { title: 'DOJ', dataIndex: 'doj', key: 'doj', render: (d) => d ? new Date(d).toLocaleDateString() : '-' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusColors[s]}>{s}</Tag> },
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
        <Col><Title level={4}>Employees</Title></Col>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Add Employee</Button></Col>
      </Row>

      <Card className="mb-4">
        <Space>
          <Input prefix={<SearchOutlined />} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} onPressEnter={() => fetch(1)} style={{ width: 250 }} />
          <Button onClick={() => fetch(1)}>Search</Button>
        </Space>
      </Card>

      <Table dataSource={employees} columns={columns} rowKey="_id" loading={loading}
        pagination={{ current: pagination.page, total: pagination.total, pageSize: 20, onChange: (p) => fetch(p) }}
      />

      <Modal title={editing ? 'Edit Employee' : 'New Employee'} open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)} width={600}>
        <Form form={form} layout="vertical">
          <Form.Item name="userId" label="User" rules={[{ required: true }]}>
            <Select showSearch placeholder="Select user" filterOption={(i, o) => o.children?.toLowerCase().includes(i.toLowerCase())}>
              {users.filter(u => !employees.find(e => e.user?._id === u._id) || editing?.user?._id === u._id).map(u => (
                <Select.Option key={u._id} value={u._id}>{u.name} ({u.email})</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="employeeId" label="Employee ID"><Input /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="doj" label="Date of Joining"><Input type="date" /></Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="department" label="Department"><Input /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="designation" label="Designation"><Input /></Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="salary" label="Salary"><Input type="number" /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status">
                <Select>
                  <Select.Option value="active">Active</Select.Option>
                  <Select.Option value="inactive">Inactive</Select.Option>
                  <Select.Option value="terminated">Terminated</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
