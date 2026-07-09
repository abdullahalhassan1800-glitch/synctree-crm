import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, Card, Typography, Tag, Button, Dropdown, message, Badge, Avatar, Space } from 'antd';
import { leadAPI } from '../../api';
import {
  MoreOutlined, UserOutlined, EditOutlined,
  DeleteOutlined, SwapOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

export default function LeadPipeline() {
  const [pipelineData, setPipelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragLead, setDragLead] = useState(null);
  const navigate = useNavigate();
  const dragRef = useRef(null);

  const fetchPipeline = async () => {
    try {
      const { data } = await leadAPI.getPipeline();
      setPipelineData(data.pipelineData);
    } catch { message.error('Failed to load pipeline'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPipeline(); }, []);

  const handleStageChange = async (leadId, stageId, stageName) => {
    try {
      await leadAPI.updateStage(leadId, { stageId, stageName });
      message.success('Moved to ' + stageName);
      fetchPipeline();
    } catch { message.error('Update failed'); }
  };

  const onDragStart = useCallback((e, lead, fromStage) => {
    dragRef.current = { lead, fromStage };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', lead._id);
    setDragLead(lead);
  }, []);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(async (e, targetStage) => {
    e.preventDefault();
    const item = dragRef.current;
    setDragLead(null);
    if (!item || item.fromStage._id === targetStage._id) return;
    await handleStageChange(item.lead._id, targetStage._id, targetStage.name);
  }, []);

  const onDragEnd = useCallback(() => {
    dragRef.current = null;
    setDragLead(null);
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spin size="large" /></div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Sales Pipeline</h2>
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
        {pipelineData.map(({ stage, leads }) => (
          <div
            key={stage._id}
            className="min-w-[280px] max-w-[320px] flex-1"
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, stage)}
          >
            <Card
              size="small"
              className="mb-3"
              style={{ borderTop: `3px solid ${stage.color}` }}
            >
              <div className="flex items-center justify-between">
                <Space>
                  <Badge color={stage.color} />
                  <Text strong>{stage.name}</Text>
                  <Tag>{leads.length}</Tag>
                </Space>
              </div>
            </Card>

            <div className="space-y-3">
              {leads.map((lead) => (
                <Card
                  key={lead._id}
                  size="small"
                  draggable
                  onDragStart={(e) => onDragStart(e, lead, stage)}
                  onDragEnd={onDragEnd}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${dragLead?._id === lead._id ? 'opacity-40' : ''}`}
                  onClick={() => navigate(`/leads/${lead._id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <Text strong className="text-sm">{lead.firstName} {lead.lastName || ''}</Text>
                      {lead.company && <div><Text type="secondary" className="text-xs">{lead.company}</Text></div>}
                      {lead.email && <div><Text type="secondary" className="text-xs">{lead.email}</Text></div>}
                      {lead.value && <div className="mt-1"><Tag color="green">₹{lead.value}</Tag></div>}
                    </div>
                    <Dropdown
                      menu={{
                        items: [
                          { key: 'edit', icon: <EditOutlined />, label: 'Edit' },
                          ...pipelineData.map(({ stage: s }) => ({
                            key: s._id,
                            icon: <SwapOutlined />,
                            label: `Move to ${s.name}`,
                            disabled: s._id === stage._id,
                            onClick: () => handleStageChange(lead._id, s._id, s.name),
                          })),
                          { type: 'divider' },
                          { key: 'delete', icon: <DeleteOutlined />, label: 'Delete', danger: true },
                        ],
                      }}
                      trigger={['click']}
                    >
                      <Button type="text" size="small" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
                    </Dropdown>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar size={20} icon={<UserOutlined />} />
                    <Text type="secondary" className="text-xs">{lead.assignedTo?.name || 'Unassigned'}</Text>
                  </div>
                </Card>
              ))}
              {leads.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-300 rounded-lg">
                  No leads
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
