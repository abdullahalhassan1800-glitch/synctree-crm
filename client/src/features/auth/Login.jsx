import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { login, clearError } from '../../store/authSlice';

const { Title, Text } = Typography;

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const result = await dispatch(login(values));
    if (result.meta.requestStatus === 'fulfilled') {
      message.success('Login successful');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <div className="text-center mb-8">
          <Title level={2} className="mb-1">SycnTree CRM</Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>
        {error && <Alert message={error} type="error" showIcon closable className="mb-4" onClose={() => dispatch(clearError())} />}
        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Please enter your password' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>
        <div className="text-center">
          <Text>Don't have an account? </Text>
          <Link to="/register" className="text-blue-500">Register</Link>
        </div>
      </Card>
    </div>
  );
}
