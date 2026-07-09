import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, Button, Spin, message, Row, Col, Descriptions, Tag, Divider, Tabs, Space, DatePicker, InputNumber } from 'antd';
import { leadAPI } from '../../api';

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(id ? true : false);
  const [lead, setLead] = useState(null);
  const [stages, setStages] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activityForm] = Form.useForm();
  const isNew = !id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: stageData } = await leadAPI.getStages();
        setStages(stageData.stages);
        if (id) {
          const { data } = await leadAPI.getById(id);
          setLead(data.lead);
          setActivities(data.activities);
          form.setFieldsValue({
            firstName: data.lead.firstName,
            lastName: data.lead.lastName,
            email: data.lead.email,
            phone: data.lead.phone,
            company: data.lead.company,
            source: data.lead.source,
            stageName: data.lead.stageName,
            notes: data.lead.notes,
          });
        }
      } catch { message.error('Failed to load data'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (values) => {
    try {
      if (isNew) {
        await leadAPI.create(values);
        message.success('Lead created');
      } else {
        await leadAPI.update(id, values);
        message.success('Lead updated');
      }
      navigate('/leads');
    } catch { message.error('Save failed'); }
  };

  const handleAddActivity = async (values) => {
    try {
      await leadAPI.addActivity(id, values);
      message.success('Activity added');
      activityForm.resetFields();
      const { data } = await leadAPI.getById(id);
      setActivities(data.activities);
    } catch { message.error('Failed to add activity'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spin size="large" /></div>;

  if (!isNew && !lead) return <div className="text-center py-20 text-gray-500">Lead not found</div>;

  return (
    <div>
      <Row justify="space-between" align="middle" className="mb-4">
        <Col><h2 className="text-xl font-semibold">{isNew ? 'New Lead' : `Lead: ${lead?.firstName} ${lead?.lastName || ''}`}</h2></Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={isNew ? 24 : 16}>
          <Card title="Lead Information">
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="lastName" label="Last Name">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="phone" label="Phone">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="company" label="Company">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="source" label="Source">
                    <Select allowClear>
                      <Select.Option value="manual">Manual</Select.Option>
                      <Select.Option value="website">Website</Select.Option>
                      <Select.Option value="referral">Referral</Select.Option>
                      <Select.Option value="social_media">Social Media</Select.Option>
                      <Select.Option value="email">Email</Select.Option>
                      <Select.Option value="call">Call</Select.Option>
                      <Select.Option value="other">Other</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="notes" label="Notes">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">{isNew ? 'Create Lead' : 'Update Lead'}</Button>
                  <Button onClick={() => navigate('/leads')}>Cancel</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {!isNew && (
          <Col xs={24} lg={8}>
            <Card title="Activity Timeline" className="mb-4">
              <Form form={activityForm} layout="vertical" onFinish={handleAddActivity}>
                <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                  <Select>
                    <Select.Option value="call">Call</Select.Option>
                    <Select.Option value="email">Email</Select.Option>
                    <Select.Option value="meeting">Meeting</Select.Option>
                    <Select.Option value="note">Note</Select.Option>
                    <Select.Option value="task">Task</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="subject" label="Subject">
                  <Input />
                </Form.Item>
                <Form.Item name="description" label="Description">
                  <Input.TextArea rows={2} />
                </Form.Item>
                <Button type="primary" htmlType="submit" block>Add Activity</Button>
              </Form>
            </Card>

            <Card title="Recent Activity" className="max-h-96 overflow-auto">
              {activities?.length === 0 && <p className="text-gray-400 text-sm">No activity yet</p>}
              {activities?.map((a) => (
                <div key={a._id} className="mb-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Tag color="blue">{a.type}</Tag>
                    <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm font-medium">{a.subject}</p>
                  {a.description && <p className="text-xs text-gray-500">{a.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">by {a.createdBy?.name}</p>
                </div>
              ))}
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
}
