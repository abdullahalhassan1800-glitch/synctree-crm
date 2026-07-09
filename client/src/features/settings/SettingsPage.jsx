import { useState, useEffect } from 'react';
import {
  Card, Tabs, Table, Button, Space, Tag, message, Modal, Form, Input, Select,
  Row, Col, Switch, Typography, Popconfirm, InputNumber, Divider,
} from 'antd';
import {
  SettingOutlined, TeamOutlined, SafetyOutlined, ApiOutlined,
  PlusOutlined, EditOutlined, DeleteOutlined, NodeIndexOutlined,
  FieldBinaryOutlined, MailOutlined,
} from '@ant-design/icons';
import { leadAPI, roleAPI, settingsAPI } from '../../api';

const { Title, Text } = Typography;

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Select' },
  { value: 'multiselect', label: 'Multi Select' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'url', label: 'URL' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('pipeline');
  const [stages, setStages] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [smtp, setSmtp] = useState({ host: '', port: 587, user: '', fromEmail: '', fromName: '', secure: false });
  const [loading, setLoading] = useState(true);

  // Stage modal
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [stageForm] = Form.useForm();
  const [editingStage, setEditingStage] = useState(null);

  // User modal
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userForm] = Form.useForm();
  const [editingUser, setEditingUser] = useState(null);

  // Role modal
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleForm] = Form.useForm();
  const [editingRole, setEditingRole] = useState(null);

  // Custom field modal
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [fieldForm] = Form.useForm();
  const [editingField, setEditingField] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [stageRes, userRes, roleRes, fieldRes] = await Promise.all([
        leadAPI.getStages(),
        roleAPI.getUsers(),
        roleAPI.getAll(),
        settingsAPI.getCustomFields('lead'),
      ]);
      setStages(stageRes.data.stages);
      setUsers(userRes.data.users);
      setRoles(roleRes.data.roles);
      setCustomFields(fieldRes.data.fields);
    } catch { message.error('Failed to load settings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const fetchFields = async (module) => {
    try {
      const { data } = await settingsAPI.getCustomFields(module);
      setCustomFields(data.fields);
    } catch { message.error('Failed to load fields'); }
  };

  const fetchSmtp = async () => {
    try {
      const { data } = await settingsAPI.getSmtp();
      setSmtp(data.smtp);
    } catch { /* not configured */ }
  };

  const onTabChange = (key) => {
    setActiveTab(key);
    if (key === 'custom-fields') fetchFields('lead');
    if (key === 'smtp') fetchSmtp();
  };

  // ---- Pipeline Stages ----
  const handleStageSave = async () => {
    try {
      const values = await stageForm.validateFields();
      if (editingStage) {
        const updated = stages.map(s => s._id === editingStage._id ? { ...s, ...values } : s);
        await leadAPI.updateStages(updated);
        message.success('Stage updated');
      } else {
        const newStage = { ...values, isDefault: false };
        const updated = [...stages, { ...newStage, _id: Date.now().toString(), order: stages.length + 1 }];
        await leadAPI.updateStages(updated);
        message.success('Stage created');
      }
      setStageModalOpen(false);
      fetchAll();
    } catch { message.error('Save failed'); }
  };

  const handleStageDelete = async (id) => {
    const updated = stages.filter(s => s._id !== id).map((s, i) => ({ ...s, order: i + 1 }));
    await leadAPI.updateStages(updated);
    message.success('Stage deleted');
    fetchAll();
  };

  const moveStage = async (id, direction) => {
    const idx = stages.findIndex(s => s._id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === stages.length - 1) return;
    const newStages = [...stages];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newStages[idx].order, newStages[swapIdx].order] = [newStages[swapIdx].order, newStages[idx].order];
    newStages.sort((a, b) => a.order - b.order);
    await leadAPI.updateStages(newStages);
    fetchAll();
  };

  // ---- Users ----
  const handleUserSave = async () => {
    try {
      const values = await userForm.validateFields();
      if (editingUser) {
        await roleAPI.updateUser(editingUser._id, values);
        message.success('User updated');
      }
      setUserModalOpen(false);
      fetchAll();
    } catch { message.error('Save failed'); }
  };

  const handleRoleSave = async () => {
    try {
      const values = await roleForm.validateFields();
      if (editingRole) {
        await roleAPI.update(editingRole._id, values);
        message.success('Role updated');
      } else {
        await roleAPI.create(values);
        message.success('Role created');
      }
      setRoleModalOpen(false);
      fetchAll();
    } catch { message.error('Save failed'); }
  };

  const handleRoleDelete = async (id) => {
    try { await roleAPI.delete(id); message.success('Deleted'); fetchAll(); }
    catch { message.error('Delete failed'); }
  };

  // ---- Custom Fields ----
  const handleFieldSave = async () => {
    try {
      const values = await fieldForm.validateFields();
      if (editingField) {
        await settingsAPI.updateCustomField(editingField._id, values);
        message.success('Field updated');
      } else {
        await settingsAPI.createCustomField(values);
        message.success('Field created');
      }
      setFieldModalOpen(false);
      fetchFields('lead');
    } catch { message.error('Save failed'); }
  };

  const handleFieldDelete = async (id) => {
    try {
      await settingsAPI.deleteCustomField(id);
      message.success('Field deleted');
      fetchFields('lead');
    } catch { message.error('Delete failed'); }
  };

  // ---- SMTP ----
  const handleSmtpSave = async () => {
    try {
      await settingsAPI.updateSmtp(smtp);
      message.success('SMTP settings saved');
    } catch { message.error('Save failed'); }
  };

  const stageColumns = [
    { title: 'Order', dataIndex: 'order', key: 'order', width: 60 },
    { title: 'Name', dataIndex: 'name', key: 'name', render: (n, r) => <><Tag color={r.color}>{n}</Tag></> },
    { title: 'Probability', dataIndex: 'probability', key: 'probability', render: (p) => `${p || 0}%` },
    { title: 'Default', dataIndex: 'isDefault', key: 'isDefault', render: (v) => v ? <Tag color="green">Yes</Tag> : '-' },
    {
      title: 'Actions', key: 'actions',
      render: (_, r) => (
        <Space>
          <Button size="small" onClick={() => moveStage(r._id, 'up')} disabled={r.order === 1}>↑</Button>
          <Button size="small" onClick={() => moveStage(r._id, 'down')} disabled={r.order === stages.length}>↓</Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingStage(r); stageForm.setFieldsValue(r); setStageModalOpen(true); }} />
          <Popconfirm title="Delete?" onConfirm={() => handleStageDelete(r._id)}>
            <Button size="small" danger icon={<DeleteOutlined />} disabled={r.isDefault} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const userColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'roleName', key: 'roleName', render: (r) => <Tag>{r}</Tag> },
    { title: 'Department', dataIndex: 'department', key: 'department' },
    { title: 'Status', dataIndex: 'isActive', key: 'isActive', render: (v) => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag> },
    {
      title: 'Actions', key: 'actions',
      render: (_, r) => (
        <Button size="small" icon={<EditOutlined />} onClick={() => {
          setEditingUser(r);
          userForm.setFieldsValue({ name: r.name, email: r.email, roleName: r.roleName, department: r.department, isActive: r.isActive });
          setUserModalOpen(true);
        }} />
      ),
    },
  ];

  const roleColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name', render: (n) => <Text strong>{n}</Text> },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'System', dataIndex: 'isSystem', key: 'isSystem', render: (v) => v ? <Tag color="blue">System</Tag> : '-' },
    {
      title: 'Actions', key: 'actions',
      render: (_, r) => r.isSystem ? <Text type="secondary">Protected</Text> : (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => {
            setEditingRole(r);
            roleForm.setFieldsValue(r);
            setRoleModalOpen(true);
          }} />
          <Popconfirm title="Delete?" onConfirm={() => handleRoleDelete(r._id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const fieldColumns = [
    { title: 'Order', dataIndex: 'order', key: 'order', width: 60 },
    { title: 'Label', dataIndex: 'label', key: 'label' },
    { title: 'Key', dataIndex: 'key', key: 'key' },
    { title: 'Type', dataIndex: 'type', key: 'type', render: (t) => <Tag>{t}</Tag> },
    { title: 'Required', dataIndex: 'required', key: 'required', render: (v) => v ? <Tag color="red">Yes</Tag> : '-' },
    { title: 'Active', dataIndex: 'isActive', key: 'isActive', render: (v) => <Tag color={v ? 'green' : 'default'}>{v ? 'Yes' : 'No'}</Tag> },
    {
      title: 'Actions', key: 'actions',
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => {
            setEditingField(r);
            fieldForm.setFieldsValue(r);
            setFieldModalOpen(true);
          }} />
          <Popconfirm title="Delete field?" onConfirm={() => handleFieldDelete(r._id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}><SettingOutlined className="mr-2" /> Settings</Title>

      <Card>
        <Tabs activeKey={activeTab} onChange={onTabChange}
          items={[
            {
              key: 'pipeline',
              label: <span><NodeIndexOutlined /> Pipeline Stages</span>,
              children: (
                <div>
                  <Row justify="end" className="mb-4">
                    <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingStage(null); stageForm.resetFields(); setStageModalOpen(true); }}>Add Stage</Button></Col>
                  </Row>
                  <Table dataSource={stages} columns={stageColumns} rowKey="_id" pagination={false} loading={loading} />
                </div>
              ),
            },
            {
              key: 'users',
              label: <span><TeamOutlined /> Users</span>,
              children: (
                <Table dataSource={users} columns={userColumns} rowKey="_id" loading={loading} pagination={{ pageSize: 20 }} />
              ),
            },
            {
              key: 'roles',
              label: <span><SafetyOutlined /> Roles</span>,
              children: (
                <div>
                  <Row justify="end" className="mb-4">
                    <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingRole(null); roleForm.resetFields(); setRoleModalOpen(true); }}>New Role</Button></Col>
                  </Row>
                  <Table dataSource={roles} columns={roleColumns} rowKey="_id" loading={loading} pagination={false} />
                </div>
              ),
            },
            {
              key: 'custom-fields',
              label: <span><FieldBinaryOutlined /> Custom Fields</span>,
              children: (
                <div>
                  <Row justify="end" className="mb-4">
                    <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingField(null); fieldForm.resetFields(); setFieldModalOpen(true); }}>Add Field</Button></Col>
                  </Row>
                  <Table dataSource={customFields} columns={fieldColumns} rowKey="_id" pagination={false} loading={loading} />
                </div>
              ),
            },
            {
              key: 'smtp',
              label: <span><MailOutlined /> SMTP</span>,
              children: (
                <div style={{ maxWidth: 500, margin: '0 auto' }}>
                  <Title level={5}>Email Server Configuration</Title>
                  <Form layout="vertical">
                    <Row gutter={16}>
                      <Col span={16}>
                        <Form.Item label="SMTP Host">
                          <Input value={smtp.host} onChange={e => setSmtp({ ...smtp, host: e.target.value })} placeholder="smtp.gmail.com" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="Port">
                          <InputNumber value={smtp.port} onChange={v => setSmtp({ ...smtp, port: v })} min={1} max={65535} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Username">
                          <Input value={smtp.user} onChange={e => setSmtp({ ...smtp, user: e.target.value })} placeholder="user@gmail.com" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Password">
                          <Input.Password value={smtp.pass} onChange={e => setSmtp({ ...smtp, pass: e.target.value })} placeholder="SMTP password" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item label="From Email">
                      <Input value={smtp.fromEmail} onChange={e => setSmtp({ ...smtp, fromEmail: e.target.value })} placeholder="noreply@example.com" />
                    </Form.Item>
                    <Form.Item label="From Name">
                      <Input value={smtp.fromName} onChange={e => setSmtp({ ...smtp, fromName: e.target.value })} placeholder="CRM System" />
                    </Form.Item>
                    <Form.Item label="Secure (TLS/SSL)">
                      <Switch checked={smtp.secure} onChange={v => setSmtp({ ...smtp, secure: v })} />
                    </Form.Item>
                    <Button type="primary" onClick={handleSmtpSave}>Save SMTP Settings</Button>
                  </Form>
                </div>
              ),
            },
            {
              key: 'integrations',
              label: <span><ApiOutlined /> Integrations</span>,
              children: (
                <div className="text-center py-10">
                  <ApiOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                  <Title level={5} type="secondary" className="mt-4">Integration Settings</Title>
                  <Text type="secondary">Configure API keys, webhooks, and third-party integrations here.</Text>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Stage Modal */}
      <Modal title={editingStage ? 'Edit Stage' : 'New Stage'} open={stageModalOpen} onOk={handleStageSave} onCancel={() => setStageModalOpen(false)}>
        <Form form={stageForm} layout="vertical">
          <Form.Item name="name" label="Stage Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="probability" label="Probability (%)"><InputNumber min={0} max={100} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="color" label="Color"><Input type="color" /></Form.Item>
        </Form>
      </Modal>

      {/* User Modal */}
      <Modal title="Edit User" open={userModalOpen} onOk={handleUserSave} onCancel={() => setUserModalOpen(false)} width={500}>
        <Form form={userForm} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="roleName" label="Role">
                <Select>
                  {roles.map(r => <Select.Option key={r._id} value={r.name}>{r.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="Department"><Input /></Form.Item>
            </Col>
          </Row>
          <Form.Item name="isActive" label="Active" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>

      {/* Role Modal */}
      <Modal title={editingRole ? 'Edit Role' : 'New Role'} open={roleModalOpen} onOk={handleRoleSave} onCancel={() => setRoleModalOpen(false)} width={600}>
        <Form form={roleForm} layout="vertical">
          <Form.Item name="name" label="Role Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* Custom Field Modal */}
      <Modal title={editingField ? 'Edit Custom Field' : 'New Custom Field'} open={fieldModalOpen} onOk={handleFieldSave} onCancel={() => setFieldModalOpen(false)} width={500}>
        <Form form={fieldForm} layout="vertical" initialValues={{ module: 'lead', type: 'text', required: false, isActive: true, order: customFields.length + 1 }}>
          <Form.Item name="module" label="Module" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="lead">Lead</Select.Option>
              <Select.Option value="contact">Contact</Select.Option>
              <Select.Option value="deal">Deal</Select.Option>
              <Select.Option value="ticket">Ticket</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="label" label="Field Label" rules={[{ required: true }]}><Input placeholder="e.g. Company Size" /></Form.Item>
          <Form.Item name="key" label="Field Key" rules={[{ required: true }]}><Input placeholder="e.g. companySize" /></Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                <Select>
                  {FIELD_TYPES.map(t => <Select.Option key={t.value} value={t.value}>{t.label}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="order" label="Order"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
            </Col>
          </Row>
          <Form.Item name="placeholder" label="Placeholder"><Input /></Form.Item>
          <Form.Item name="options" label="Options (comma separated for select types)">
            <Input placeholder="Option1, Option2, Option3" />
          </Form.Item>
          <Form.Item name="required" label="Required" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
