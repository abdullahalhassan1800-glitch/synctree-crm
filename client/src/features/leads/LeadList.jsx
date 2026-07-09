import { useEffect, useState, useRef } from 'react';
import { Table, Button, Space, Tag, Input, Select, Card, message, Popconfirm, Row, Col, DatePicker, Upload, Modal, Tooltip } from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  DownloadOutlined, UploadOutlined, FilterOutlined, DeleteRowOutlined,
  SwapOutlined, ClearOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { leadAPI } from '../../api';

const { RangePicker } = DatePicker;

export default function LeadList() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [stages, setStages] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importData, setImportData] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const fetchLeads = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (stageFilter) params.stageName = stageFilter;
      if (sourceFilter) params.source = sourceFilter;
      if (assignedFilter) params.assignedTo = assignedFilter;
      if (dateRange) {
        params.startDate = dateRange[0].toISOString();
        params.endDate = dateRange[1].toISOString();
      }
      const { data } = await leadAPI.getAll(params);
      setLeads(data.leads);
      setStages(data.stages);
      setPagination(data.pagination);
    } catch (error) {
      message.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const clearFilters = () => {
    setSearch('');
    setStageFilter('');
    setSourceFilter('');
    setAssignedFilter('');
    setDateRange(null);
    setSelectedRowKeys([]);
    fetchLeads(1);
  };

  const handleDelete = async (id) => {
    try {
      await leadAPI.delete(id);
      message.success('Lead deleted');
      fetchLeads(pagination.page);
    } catch { message.error('Delete failed'); }
  };

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) return;
    try {
      await leadAPI.bulkDelete({ ids: selectedRowKeys });
      message.success(`${selectedRowKeys.length} leads deleted`);
      setSelectedRowKeys([]);
      fetchLeads(1);
    } catch { message.error('Bulk delete failed'); }
  };

  const handleBulkStageChange = async (stageName, stageId) => {
    if (selectedRowKeys.length === 0) return;
    try {
      await leadAPI.bulkUpdate({ ids: selectedRowKeys, updates: { stage: stageId, stageName } });
      message.success(`${selectedRowKeys.length} leads updated`);
      setSelectedRowKeys([]);
      fetchLeads(1);
    } catch { message.error('Bulk update failed'); }
  };

  const handleExport = () => {
    const params = new URLSearchParams({ format: 'csv' });
    if (stageFilter) params.append('stageName', stageFilter);
    if (sourceFilter) params.append('source', sourceFilter);
    if (search) params.append('search', search);
    window.open(`/api/leads/export?${params.toString()}`, '_blank');
  };

  const handleImportCSV = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) {
          message.error('CSV must have a header row and at least one data row');
          return;
        }
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const leadsData = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const lead = {};
          headers.forEach((h, idx) => { lead[h] = values[idx] || ''; });
          leadsData.push(lead);
        }
        setImportData(leadsData);
        Modal.confirm({
          title: `Import ${leadsData.length} leads?`,
          content: `Found ${leadsData.length} leads in the CSV. Import them now?`,
          onOk: async () => {
            try {
              const { data } = await leadAPI.bulkImport({ leads: leadsData });
              message.success(`Created: ${data.created}, Updated: ${data.updated}, Skipped: ${data.skipped}`);
              setImportModalOpen(false);
              fetchLeads(1);
            } catch { message.error('Import failed'); }
          },
        });
      } catch { message.error('Failed to parse CSV'); }
    };
    reader.readAsText(file);
    return false;
  };

  const stageColors = {
    'New': 'blue', 'Contacted': 'purple', 'Qualified': 'cyan',
    'Proposal': 'orange', 'Negotiation': 'red', 'Closed Won': 'green', 'Closed Lost': 'default',
  };

  const columns = [
    { title: 'Name', key: 'name', render: (_, r) => `${r.firstName} ${r.lastName || ''}`, sorter: true, align: 'left', fixed: 'left', width: 150 },
    { title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true, align: 'left', responsive: ['md'] },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', align: 'left', responsive: ['lg'] },
    { title: 'Company', dataIndex: 'company', key: 'company', ellipsis: true, align: 'left', responsive: ['sm'] },
    { title: 'Source', dataIndex: 'source', key: 'source', render: (s) => <Tag>{s}</Tag>, align: 'center', responsive: ['sm'] },
    { title: 'Stage', dataIndex: 'stageName', key: 'stageName', render: (s) => <Tag color={stageColors[s] || 'default'}>{s}</Tag>, align: 'center', width: 100 },
    { title: 'Score', dataIndex: 'score', key: 'score', render: (s) => <Tag color={s > 50 ? 'green' : s > 20 ? 'orange' : 'default'}>{s}</Tag>, sorter: true, align: 'center', responsive: ['sm'] },
    { title: 'Assigned To', dataIndex: ['assignedTo', 'name'], key: 'assignedTo', align: 'left', responsive: ['md'] },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', render: (d) => new Date(d).toLocaleDateString(), sorter: true, align: 'center', responsive: ['lg'] },
    {
      title: 'Actions', key: 'actions', width: 90, align: 'center', fixed: 'right',
      render: (_, r) => (
        <Space>
          <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); navigate(`/leads/${r._id}`); }} /></Tooltip>
          <Popconfirm title="Delete this lead?" onConfirm={() => handleDelete(r._id)}>
            <Tooltip title="Delete"><Button size="small" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} /></Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" className="mb-4">
        <Col><h2 className="text-xl font-semibold">Leads</h2></Col>
        <Col>
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>Export</Button>
            <Button icon={<UploadOutlined />} onClick={() => setImportModalOpen(true)}>Import</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/leads/new')}>New Lead</Button>
          </Space>
        </Col>
      </Row>

      <Card className="mb-4">
        <Space wrap>
          <Input prefix={<SearchOutlined />} placeholder="Search leads..." value={search}
            onChange={e => setSearch(e.target.value)} onPressEnter={() => fetchLeads(1)} style={{ width: 220 }} allowClear />
          <Select placeholder="Stage" allowClear style={{ width: 130 }} value={stageFilter || undefined}
            onChange={v => setStageFilter(v || '')}>
            {stages.map(s => <Select.Option key={s._id} value={s.name}>{s.name}</Select.Option>)}
          </Select>
          <Select placeholder="Source" allowClear style={{ width: 130 }} value={sourceFilter || undefined}
            onChange={v => setSourceFilter(v || '')}>
            {['manual', 'website', 'referral', 'social_media', 'email', 'call', 'other'].map(s =>
              <Select.Option key={s} value={s}>{s}</Select.Option>
            )}
          </Select>
          <RangePicker value={dateRange} onChange={v => setDateRange(v)} />
          <Button type="primary" icon={<FilterOutlined />} onClick={() => fetchLeads(1)}>Apply</Button>
          <Tooltip title="Clear filters"><Button icon={<ClearOutlined />} onClick={clearFilters} /></Tooltip>
        </Space>
      </Card>

      {selectedRowKeys.length > 0 && (
        <Card className="mb-4 bg-blue-50 dark:bg-gray-800">
          <Space>
            <span className="font-medium">{selectedRowKeys.length} selected</span>
            <Popconfirm title={`Delete ${selectedRowKeys.length} leads?`} onConfirm={handleBulkDelete}>
              <Button danger icon={<DeleteRowOutlined />}>Bulk Delete</Button>
            </Popconfirm>
            <Select placeholder="Change stage" style={{ width: 150 }}
              onChange={(v, o) => handleBulkStageChange(o.label, o.value)}>
              {stages.filter(s => !['Closed Won', 'Closed Lost'].includes(s.name)).map(s =>
                <Select.Option key={s._id} value={s._id} label={s.name}>
                  <Space><Tag color={stageColors[s.name]}>{s.name}</Tag></Space>
                </Select.Option>
              )}
            </Select>
            <Button onClick={() => setSelectedRowKeys([])}>Clear Selection</Button>
          </Space>
        </Card>
      )}

      <Table
        dataSource={leads}
        columns={columns}
        rowKey="_id"
        loading={loading}
        scroll={{ x: 700 }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        pagination={{
          current: pagination.page,
          total: pagination.total,
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} leads`,
          onChange: (p) => fetchLeads(p),
        }}
        onRow={(record) => ({
          onClick: () => navigate(`/leads/${record._id}`),
          style: { cursor: 'pointer' },
        })}
      />

      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files[0]) handleImportCSV(e.target.files[0]);
          e.target.value = '';
        }}
      />
      <Modal title="Import Leads from CSV" open={importModalOpen} onCancel={() => setImportModalOpen(false)} footer={null}>
        <div className="text-center py-8">
          <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          <p className="mt-4 mb-6">Upload a CSV file with lead data.</p>
          <p className="text-xs text-gray-400 mb-4">
            Required column: <strong>firstName</strong><br />
            Optional: lastName, email, phone, company, source, stageName, score, tags
          </p>
          <Button type="primary" icon={<UploadOutlined />} onClick={() => fileInputRef.current?.click()}>
            Select CSV File
          </Button>
        </div>
      </Modal>
    </div>
  );
}
