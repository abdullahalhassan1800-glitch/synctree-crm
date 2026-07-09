import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Menu, Button, Avatar, Dropdown, Typography, theme } from 'antd';
import {
  DashboardOutlined, TeamOutlined, UserOutlined, DollarOutlined,
  CustomerServiceOutlined, SettingOutlined, LogoutOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, BulbOutlined,
  NodeIndexOutlined, WhatsAppOutlined, ScheduleOutlined,
  ClockCircleOutlined, BarChartOutlined, AppstoreOutlined,
} from '@ant-design/icons';
import { logout } from '../store/authSlice';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/leads', icon: <TeamOutlined />, label: 'Leads' },
  { key: '/pipeline', icon: <NodeIndexOutlined />, label: 'Pipeline' },
  { key: '/contacts', icon: <UserOutlined />, label: 'Contacts' },
  { key: '/deals', icon: <DollarOutlined />, label: 'Deals' },
  { key: '/tickets', icon: <CustomerServiceOutlined />, label: 'Support' },
  { type: 'divider' },
  { key: '/employees', icon: <TeamOutlined />, label: 'Employees' },
  { key: '/attendance', icon: <ClockCircleOutlined />, label: 'Attendance' },
  { key: '/leaves', icon: <ScheduleOutlined />, label: 'Leaves' },
  { type: 'divider' },
  { key: '/automation', icon: <NodeIndexOutlined />, label: 'Automation' },
  { key: '/whatsapp', icon: <WhatsAppOutlined />, label: 'WhatsApp' },
  { key: '/reports', icon: <BarChartOutlined />, label: 'Reports' },
  { type: 'divider' },
  { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
];

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        className="border-r border-gray-200 dark:border-gray-700"
        style={{ height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
          <Text strong className={`${collapsed ? 'text-lg' : 'text-xl'} truncate`}>
            {collapsed ? 'CRM' : 'SycnTree CRM'}
          </Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="border-r-0"
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Header
          className="flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700"
          style={{ background: colorBgContainer, padding: '0 24px', position: 'sticky', top: 0, zIndex: 99 }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg"
          />
          <div className="flex items-center gap-4">
            <Button type="text" icon={<BulbOutlined />} />
            <Dropdown menu={{ items: userMenuItems, onClick: ({ key }) => { if (key === 'logout') handleLogout(); } }} trigger={['click']}>
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar icon={<UserOutlined />} />
                <Text className="hidden sm:block">{user?.name}</Text>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="m-6">
          <div className="p-6 min-h-[calc(100vh-120px)]" style={{ background: colorBgContainer, borderRadius: borderRadiusLG }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
