import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Button, Space, Card, Tag, Switch, message, Popconfirm, Row, Col, Modal, Form, Input, Select,
  Tabs, Badge, Typography, Tooltip,
} from 'antd';
import {
  PlusOutlined, PlayCircleOutlined, DeleteOutlined, EditOutlined,
  MailOutlined, NodeIndexOutlined,
} from '@ant-design/icons';
import { workflowAPI, emailTemplateAPI, automationLogAPI } from '../../api/workflow';

const { Text, Title } = Typography;
const { TextArea } = Input;

const moduleColors = { lead: 'blue', contact: 'green', deal: 'orange', ticket: 'purple' };
const statusColors = { active: 'green', inactive: 'default', draft: 'orange' };

export default function WorkflowList() {
  const [workflows, setWorkflows] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [form] = Form.useForm();
  const [templateForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('workflows');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wfRes, tmplRes, logsRes] = await Promise.all([
        workflowAPI.getAll(),
        emailTemplateAPI.getAll(),
        automationLogAPI.getAll({ limit: 50 }),
      ]);
      setWorkflows(wfRes.data.workflows);
      setTemplates(tmplRes.data.templates);
      setLogs(logsRes.data.logs);
    } catch { message.error('Failed to load automation data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (wf = null) => {
    setEditing(wf);
    form.resetFields();
    if (wf) {
      form.setFieldsValue({
        ...wf,
        triggerEvent: wf.trigger?.event,
        conditions: wf.trigger?.conditions || [],
        actions: wf.actions || [],
      });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        description: values.description,
        module: values.module,
        trigger: { event: values.triggerEvent, conditions: values.conditions || [] },
        actions: values.actions || [],
        status: values.status || 'draft',
      };
      if (editing) {
        await workflowAPI.update(editing._id, payload);
        message.success('Workflow updated');
      } else {
        await workflowAPI.create(payload);
        message.success('Workflow created');
      }
      setModalOpen(false);
      fetchData();
    } catch { message.error('Save failed'); }
  };

  const handleToggle = async (id) => {
    try {
      await workflowAPI.toggle(id);
      fetchData();
    } catch { message.error('Toggle failed'); }
  };

  const handleDelete = async (id) => {
    try { await workflowAPI.delete(id); message.success('Deleted'); fetchData(); }
    catch { message.error('Delete failed'); }
  };

  const handleTest = async (id) => {
    try {
      const { data } = await workflowAPI.test(id, { module: 'lead', event: 'created', recordId: null });
      message.success(`Test executed: ${data.logs.length} logs generated`);
      fetchData();
    } catch { message.error('Test failed'); }
  };

  const openTemplateModal = (tmpl = null) => {
    setEditingTemplate(tmpl);
    templateForm.resetFields();
    if (tmpl) templateForm.setFieldsValue(tmpl);
    setTemplateModalOpen(true);
  };

  const handleTemplateSave = async () => {
    try {
      const values = await templateForm.validateFields();
      if (editingTemplate) {
        await emailTemplateAPI.update(editingTemplate._id, values);
        message.success('Template updated');
      } else {
        await emailTemplateAPI.create(values);
        message.success('Template created');
      }
      setTemplateModalOpen(false);
      fetchData();
    } catch { message.error('Save failed'); }
  };

  const handleTemplateDelete = async (id) => {
    try { await emailTemplateAPI.delete(id); message.success('Deleted'); fetchData(); }
    catch { message.error('Delete failed'); }
  };

  const workflowColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name', render: (n, r) => <><Text strong>{n}</Text>{r.description && <div><Text type="secondary" className="text-xs">{r.description}</Text></div>}</> },
    { title: 'Module', dataIndex: 'module', key: 'module', render: (m) => <Tag color={moduleColors[m]}>{m}</Tag> },
    { title: 'Trigger', key: 'trigger', render: (_, r) => <Tag>{r.trigger?.event || '-'}</Tag> },
    { title: 'Actions', key: 'actionsCount', render: (_, r) => <Tag>{r.actions?.length || 0} action(s)</Tag> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusColors[s]}>{s}</Tag> },
    {
      title: 'Active', key: 'active',
      render: (_, r) => <Switch checked={r.status === 'active'} onChange={() => handleToggle(r._id)} />,
    },
    {
      title: 'Actions', key: 'actions',
      render: (_, r) => (
        <Space>
          <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} onClick={() => openModal(r)} /></Tooltip>
          <Tooltip title="Test"><Button size="small" icon={<PlayCircleOutlined />} onClick={() => handleTest(r._id)} /></Tooltip>
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(r._id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const templateColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name', render: (n) => <Text strong>{n}</Text> },
    { title: 'Subject', dataIndex: 'subject', key: 'subject' },
    { title: 'Category', dataIndex: 'category', key: 'category', render: (c) => <Tag>{c}</Tag> },
    {
      title: 'Actions', key: 'actions',
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openTemplateModal(r)} />
          <Popconfirm title="Delete?" onConfirm={() => handleTemplateDelete(r._id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const logColumns = [
    { title: 'Workflow', dataIndex: ['workflow', 'name'], key: 'workflow' },
    { title: 'Trigger', key: 'trigger', render: (_, r) => <Tag>{r.trigger?.event} ({r.trigger?.module})</Tag> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Badge status={s === 'success' ? 'success' : s === 'partial' ? 'warning' : 'error'} text={s} /> },
    { title: 'Actions', key: 'actionsCount', render: (_, r) => `${r.actionsExecuted?.length || 0} executed` },
    { title: 'Executed At', dataIndex: 'executedAt', key: 'executedAt', render: (d) => new Date(d).toLocaleString() },
  ];

  return (
    <div>
      <Title level={4} className="mb-6">Workflow Automation</Title>

      <Card className="mb-4">
        <Tabs activeKey={activeTab} onChange={setActiveTab}
          items={[
            {
              key: 'workflows',
              label: <span><NodeIndexOutlined /> Workflows ({workflows.length})</span>,
              children: (
                <div>
                  <Row justify="end" className="mb-4">
                    <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>New Workflow</Button></Col>
                  </Row>
                  <Table dataSource={workflows} columns={workflowColumns} rowKey="_id" loading={loading} pagination={false} />
                </div>
              ),
            },
            {
              key: 'templates',
              label: <span><MailOutlined /> Email Templates ({templates.length})</span>,
              children: (
                <div>
                  <Row justify="end" className="mb-4">
                    <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => openTemplateModal()}>New Template</Button></Col>
                  </Row>
                  <Table dataSource={templates} columns={templateColumns} rowKey="_id" loading={loading} pagination={false} />
                </div>
              ),
            },
            {
              key: 'logs',
              label: <span>Execution Logs ({logs.length})</span>,
              children: (
                <Table dataSource={logs} columns={logColumns} rowKey="_id" loading={loading} pagination={{ pageSize: 20 }} />
              ),
            },
          ]}
        />
      </Card>

      {/* Workflow Modal */}
      <Modal title={editing ? 'Edit Workflow' : 'New Workflow'} open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)} width={700}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Workflow Name" rules={[{ required: true }]}>
                <Input placeholder="E.g., Welcome Email Sequence" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="module" label="Module" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="lead">Lead</Select.Option>
                  <Select.Option value="contact">Contact</Select.Option>
                  <Select.Option value="deal">Deal</Select.Option>
                  <Select.Option value="ticket">Ticket</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Description">
            <TextArea rows={2} placeholder="What does this workflow do?" />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select>
              <Select.Option value="draft">Draft</Select.Option>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>

          <Card size="small" title="Trigger" className="mb-4">
            <Form.Item name="triggerEvent" label="Event" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="created">Created</Select.Option>
                <Select.Option value="updated">Updated</Select.Option>
                <Select.Option value="stage_changed">Stage Changed</Select.Option>
                <Select.Option value="assigned">Assigned</Select.Option>
                <Select.Option value="deleted">Deleted</Select.Option>
              </Select>
            </Form.Item>
          </Card>

          <Card size="small" title="Actions" className="mb-4">
            <Form.List name="actions">
              {(fields, { add, remove }) => (
                <div>
                  {fields.map(({ key, name, ...rest }) => (
                    <Space key={key} className="w-full mb-3" align="start">
                      <Form.Item {...rest} name={[name, 'type']} rules={[{ required: true }]}>
                        <Select style={{ width: 160 }} placeholder="Action type">
                          <Select.Option value="send_email">Send Email</Select.Option>
                          <Select.Option value="create_task">Create Task</Select.Option>
                          <Select.Option value="update_field">Update Field</Select.Option>
                          <Select.Option value="assign_user">Assign User</Select.Option>
                          <Select.Option value="webhook">Webhook</Select.Option>
                          <Select.Option value="whatsapp">WhatsApp</Select.Option>
                        </Select>
                      </Form.Item>
                      <Form.Item {...rest} name={[name, 'config']}>
                        <Input placeholder='Config JSON ({"key":"value"})' style={{ width: 300 }} />
                      </Form.Item>
                      <Button danger onClick={() => remove(name)}>Remove</Button>
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Add Action</Button>
                </div>
              )}
            </Form.List>
          </Card>
        </Form>
      </Modal>

      {/* Template Modal */}
      <Modal title={editingTemplate ? 'Edit Template' : 'New Template'} open={templateModalOpen} onOk={handleTemplateSave} onCancel={() => setTemplateModalOpen(false)} width={600}>
        <Form form={templateForm} layout="vertical">
          <Form.Item name="name" label="Template Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="subject" label="Subject" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="category" label="Category">
            <Select>
              <Select.Option value="general">General</Select.Option>
              <Select.Option value="welcome">Welcome</Select.Option>
              <Select.Option value="follow_up">Follow Up</Select.Option>
              <Select.Option value="reminder">Reminder</Select.Option>
              <Select.Option value="newsletter">Newsletter</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="body" label="Email Body" rules={[{ required: true }]}>
            <TextArea rows={6} placeholder="Use {{variable}} for dynamic values" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
