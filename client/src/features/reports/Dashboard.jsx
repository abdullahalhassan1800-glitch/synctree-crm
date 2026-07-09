import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Spin, Tag, Typography, DatePicker, Space, Button } from 'antd';
import { TeamOutlined, UserOutlined, DollarOutlined, CustomerServiceOutlined, RiseOutlined, FallOutlined, ArrowUpOutlined, ArrowDownOutlined, SwapOutlined } from '@ant-design/icons';
import { reportAPI } from '../../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const COLORS = ['#1890ff', '#52c41a', '#fa8c16', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(null);

  const fetchDashboard = () => {
    setLoading(true);
    const params = {};
    if (dateRange) {
      params.startDate = dateRange[0].toISOString();
      params.endDate = dateRange[1].toISOString();
    }
    reportAPI.getDashboard(params)
      .then(({ data: res }) => setData(res))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDashboard(); }, []);

  if (loading) return <div className="flex justify-center py-20"><Spin size="large" /></div>;
  if (!data) return <div className="text-center py-20 text-gray-500">No data available</div>;

  const { stats, charts, recentLeads } = data;

  const TrendTag = ({ trend }) => {
    if (trend === undefined || trend === null) return null;
    const isUp = trend >= 0;
    return (
      <Tag color={isUp ? 'green' : 'red'} style={{ marginLeft: 8 }}>
        {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(trend)}%
      </Tag>
    );
  };

  return (
    <div>
      <Row justify="space-between" align="middle" className="mb-6">
        <Col><Title level={4}>Dashboard</Title></Col>
        <Col>
          <Space>
            <RangePicker value={dateRange} onChange={v => setDateRange(v)} />
            <Button type="primary" onClick={fetchDashboard}>Apply</Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="Total Leads" value={stats.totalLeads} prefix={<TeamOutlined />} valueStyle={{ color: '#1890ff' }} suffix={<TrendTag trend={stats.leadTrend} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="Contacts" value={stats.totalContacts} prefix={<UserOutlined />} valueStyle={{ color: '#52c41a' }} suffix={<TrendTag trend={stats.contactTrend} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="Deals" value={stats.totalDeals} prefix={<DollarOutlined />} valueStyle={{ color: '#fa8c16' }} suffix={<TrendTag trend={stats.dealTrend} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="Open Tickets" value={stats.openTickets} prefix={<CustomerServiceOutlined />} valueStyle={{ color: stats.openTickets > 0 ? '#f5222d' : '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Conversion Rate" value={stats.conversionRate} suffix="%" prefix={<SwapOutlined />} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Won Deals" value={stats.wonDeals} prefix={<RiseOutlined />} suffix={`/ ₹${(stats.wonValue || 0).toLocaleString()}`} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Pipeline Value" value={`₹${(stats.pipelineValue || 0).toLocaleString()}`} prefix={<DollarOutlined />} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="Pipeline Overview">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charts.pipelineChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" name="Leads" radius={[4, 4, 0, 0]}>
                  {charts.pipelineChart?.map((entry, i) => (
                    <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Lead Trend">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={charts.leadTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="leads" stroke="#1890ff" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card title="Source Breakdown">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={charts.sourceChart} cx="50%" cy="50%" outerRadius={90} innerRadius={45} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {(charts.sourceChart || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card title="Recent Leads">
            <Table
              dataSource={recentLeads}
              rowKey="_id"
              pagination={false}
              size="small"
              columns={[
                { title: 'Name', dataIndex: 'firstName', key: 'firstName', render: (_, r) => `${r.firstName} ${r.lastName || ''}` },
                { title: 'Stage', dataIndex: 'stageName', key: 'stageName', render: (s) => <Tag>{s}</Tag> },
                { title: 'Source', dataIndex: 'source', key: 'source' },
                { title: 'Assigned To', dataIndex: ['assignedTo', 'name'], key: 'assignedTo' },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
