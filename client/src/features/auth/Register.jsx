import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, Select } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { register, clearError } from '../../store/authSlice';

const { Title, Text } = Typography;

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const result = await dispatch(register(values));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <div className="text-center mb-8">
          <Title level={2} className="mb-1">Create Account</Title>
          <Text type="secondary">Register for SycnTree CRM</Text>
        </div>
        {error && <Alert message={error} type="error" showIcon closable className="mb-4" onClose={() => dispatch(clearError())} />}
        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item name="name" rules={[{ required: true, message: 'Please enter your name' }]}>
            <Input prefix={<UserOutlined />} placeholder="Full Name" size="large" />
          </Form.Item>
          <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>
          <Form.Item name="phone">
            <Input prefix={<PhoneOutlined />} placeholder="Phone (optional)" size="large" />
          </Form.Item>
          <Form.Item name="roleName" label="Role">
            <Select size="large">
              <Select.Option value="sales_rep">Sales Representative</Select.Option>
              <Select.Option value="manager">Manager</Select.Option>
              <Select.Option value="support">Support</Select.Option>
              <Select.Option value="hr">HR</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Register
            </Button>
          </Form.Item>
        </Form>
        <div className="text-center">
          <Text>Already have an account? </Text>
          <Link to="/login" className="text-blue-500">Sign In</Link>
        </div>
      </Card>
    </div>
  );
}
