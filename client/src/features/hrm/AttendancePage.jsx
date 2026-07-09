import { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Table, Tag, Typography, Space, message, Spin, DatePicker, Select, Statistic } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { attendanceAPI } from '../../api/hrm';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function AttendancePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (dateRange) {
        params.startDate = dateRange[0].toISOString();
        params.endDate = dateRange[1].toISOString();
      }
      if (statusFilter) params.status = statusFilter;
      const { data } = await attendanceAPI.getAll(params);
      setRecords(data.records);
    } catch { message.error('Failed to fetch'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [dateRange, statusFilter]);

  const handleCheckIn = async () => {
    setChecking(true);
    try { await attendanceAPI.checkIn(); message.success('Checked in!'); fetch(); }
    catch (e) { message.error(e.response?.data?.message || 'Check-in failed'); }
    finally { setChecking(false); }
  };

  const handleCheckOut = async () => {
    setChecking(true);
    try { await attendanceAPI.checkOut(); message.success('Checked out!'); fetch(); }
    catch (e) { message.error(e.response?.data?.message || 'Check-out failed'); }
    finally { setChecking(false); }
  };

  const statusColors = { present: 'green', absent: 'red', half_day: 'orange', late: 'gold', holiday: 'default' };
  const today = new Date().toDateString();
  const todayRecord = records.find(r => new Date(r.date).toDateString() === today);

  const columns = [
    { title: 'Employee', key: 'name', render: (_, r) => r.employee?.user?.name || '-' },
    { title: 'Date', dataIndex: 'date', key: 'date', render: (d) => new Date(d).toLocaleDateString() },
    { title: 'Check In', dataIndex: 'checkIn', key: 'checkIn', render: (t) => t ? new Date(t).toLocaleTimeString() : '-' },
    { title: 'Check Out', dataIndex: 'checkOut', key: 'checkOut', render: (t) => t ? new Date(t).toLocaleTimeString() : '-' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusColors[s]}>{s}</Tag> },
  ];

  return (
    <div>
      <Title level={4}>Attendance</Title>

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Today" value={todayRecord ? todayRecord.status : 'Not marked'} prefix={todayRecord?.checkIn ? <CheckCircleOutlined /> : <ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Total Records" value={records.length} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Present" value={records.filter(r => r.status === 'present').length} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Late" value={records.filter(r => r.status === 'late').length} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Space wrap>
          <Button type={todayRecord?.checkIn ? 'default' : 'primary'} icon={<CheckCircleOutlined />} onClick={handleCheckIn} loading={checking} disabled={!!todayRecord?.checkIn}>
            {todayRecord?.checkIn ? 'Already Checked In' : 'Check In'}
          </Button>
          <Button type={todayRecord?.checkOut ? 'default' : 'primary'} icon={<CloseCircleOutlined />} onClick={handleCheckOut} loading={checking} disabled={!todayRecord?.checkIn || !!todayRecord?.checkOut} danger>
            {todayRecord?.checkOut ? 'Already Checked Out' : 'Check Out'}
          </Button>
          <RangePicker onChange={(v) => setDateRange(v)} />
          <Select placeholder="Filter status" allowClear style={{ width: 140 }} value={statusFilter || undefined} onChange={v => setStatusFilter(v || '')}>
            <Select.Option value="present">Present</Select.Option>
            <Select.Option value="absent">Absent</Select.Option>
            <Select.Option value="late">Late</Select.Option>
            <Select.Option value="half_day">Half Day</Select.Option>
          </Select>
        </Space>
      </Card>

      <Table dataSource={records} columns={columns} rowKey="_id" loading={loading} pagination={{ pageSize: 30 }} />
    </div>
  );
}
