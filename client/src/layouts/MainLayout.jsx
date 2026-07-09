import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Menu, Button, Avatar, Dropdown, Typography, theme, Drawer } from 'antd';
import {
  DashboardOutlined, TeamOutlined, UserOutlined, DollarOutlined,
  CustomerServiceOutlined, SettingOutlined, LogoutOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, BulbOutlined,
  MenuOutlined, CloseOutlined,
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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

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

  const sidebarContent = (
    <>
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
        <Text strong className={`${collapsed && !mobileDrawerOpen ? 'text-lg' : 'text-xl'} truncate`}>
          {collapsed && !mobileDrawerOpen ? 'CRM' : 'SycnTree CRM'}
        </Text>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => { navigate(key); if (isMobile) setMobileDrawerOpen(false); }}
        className="border-r-0"
      />
    </>
  );

  return (
    <Layout className="min-h-screen">
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          theme="light"
          className="border-r border-gray-200 dark:border-gray-700"
          style={{ height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}
        >
          {sidebarContent}
        </Sider>
      )}
      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 200), transition: 'margin-left 0.2s' }}>
        <Header
          className="flex items-center justify-between px-4 sm:px-6 border-b border-gray-200 dark:border-gray-700"
          style={{ background: colorBgContainer, padding: '0 16px', position: 'sticky', top: 0, zIndex: 99 }}
        >
          <div className="flex items-center gap-2">
            {isMobile ? (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileDrawerOpen(true)}
                className="text-lg"
              />
            ) : (
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="text-lg"
              />
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Dropdown menu={{ items: userMenuItems, onClick: ({ key }) => { if (key === 'logout') handleLogout(); } }} trigger={['click']}>
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar icon={<UserOutlined />} />
                <Text className="hidden sm:block">{user?.name}</Text>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="m-4 sm:m-6">
          <div className="p-4 sm:p-6 min-h-[calc(100vh-120px)]" style={{ background: colorBgContainer, borderRadius: borderRadiusLG }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
      <Drawer
        title={null}
        placement="left"
        closable={false}
        onClose={() => setMobileDrawerOpen(false)}
        open={mobileDrawerOpen}
        width={260}
        styles={{ body: { padding: 0 } }}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <Text strong className="text-xl">SycnTree CRM</Text>
          <Button type="text" icon={<CloseOutlined />} onClick={() => setMobileDrawerOpen(false)} />
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => { navigate(key); setMobileDrawerOpen(false); }}
          className="border-r-0"
        />
      </Drawer>
    </Layout>
  );
}
