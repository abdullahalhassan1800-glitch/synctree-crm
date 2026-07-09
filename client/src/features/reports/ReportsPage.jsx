import { useEffect, useState } from 'react';
import {
  Card, Row, Col, Table, Statistic, Typography, Spin, Select, Space, Tag, DatePicker,
} from 'antd';
import {
  TeamOutlined, UserOutlined, DollarOutlined, CustomerServiceOutlined,
  RiseOutlined, FallOutlined, ArrowUpOutlined, ArrowDownOutlined,
} from '@ant-design/icons';
import { reportAPI } from '../../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const COLORS = ['#1890ff', '#52c41a', '#fa8c16', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96'];

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    setLoading(true);
    reportAPI.getDashboard().then(({ data: res }) => setData(res)).finally(() => setLoading(false));
  }, [period]);

  if (loading) return <div className="flex justify-center py-20"><Spin size="large" /></div>;
  if (!data) return <div className="text-center py-20 text-gray-500">No data available</div>;

  const { stats, charts } = data;

  return (
    <div>
      <Row justify="space-between" align="middle" className="mb-6">
        <Col><Title level={4}>Reports & Analytics</Title></Col>
        <Col>
          <Space>
            <Select value={period} onChange={setPeriod} style={{ width: 120 }}>
              <Select.Option value="week">This Week</Select.Option>
              <Select.Option value="month">This Month</Select.Option>
              <Select.Option value="quarter">This Quarter</Select.Option>
              <Select.Option value="year">This Year</Select.Option>
            </Select>
          </Space>
        </Col>
      </Row>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="Total Leads" value={stats.totalLeads} prefix={<TeamOutlined />} valueStyle={{ color: '#1890ff' }} suffix={<small className="text-green-500"><ArrowUpOutlined /> 12%</small>} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="Active Contacts" value={stats.totalContacts} prefix={<UserOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="Total Deals" value={stats.totalDeals} prefix={<DollarOutlined />} valueStyle={{ color: '#fa8c16' }} suffix={<small>₹{(stats.wonValue || 0).toLocaleString()}</small>} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="Open Tickets" value={stats.openTickets} prefix={<CustomerServiceOutlined />} valueStyle={{ color: stats.openTickets > 0 ? '#f5222d' : '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12}>
          <Card hoverable>
            <Statistic title="Won Deals" value={stats.wonDeals} prefix={<RiseOutlined />} valueStyle={{ color: '#52c41a' }} suffix={`/ ${stats.totalDeals} total`} />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card hoverable>
            <Statistic title="Pipeline Value" value={`₹${(stats.pipelineValue || 0).toLocaleString()}`} prefix={<DollarOutlined />} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="Pipeline Distribution">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={charts.pipelineChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" name="Leads" radius={[4, 4, 0, 0]}>
                  {charts.pipelineChart?.map((entry, i) => <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Deal Status Breakdown">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={charts.dealsByStatus?.map(d => ({ name: d._id, value: d.count })) || []}
                  cx="50%" cy="50%" outerRadius={100} innerRadius={50}
                  dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(charts.dealsByStatus || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Summary Table */}
      <Card title="Pipeline Summary">
        <Table
          dataSource={charts.pipelineChart}
          rowKey="name"
          pagination={false}
          columns={[
            { title: 'Stage', dataIndex: 'name', key: 'name' },
            { title: 'Leads', dataIndex: 'count', key: 'count', sorter: (a, b) => a.count - b.count },
            { title: 'Percentage', key: 'pct', render: (_, r) => {
              const total = charts.pipelineChart?.reduce((s, i) => s + i.count, 0) || 1;
              return <Tag>{((r.count / total) * 100).toFixed(1)}%</Tag>;
            }},
          ]}
        />
      </Card>
    </div>
  );
}
