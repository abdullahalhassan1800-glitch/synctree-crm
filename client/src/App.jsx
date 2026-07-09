import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Spin } from 'antd';
import { getMe } from './store/authSlice';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import MainLayout from './layouts/MainLayout';
import Dashboard from './features/reports/Dashboard';
import LeadList from './features/leads/LeadList';
import LeadDetail from './features/leads/LeadDetail';
import LeadPipeline from './features/leads/LeadPipeline';
import ContactList from './features/contacts/ContactList';
import DealList from './features/deals/DealList';
import TicketList from './features/tickets/TicketList';
import WorkflowList from './features/automation/WorkflowList';
import WhatsAppPage from './features/whatsapp/WhatsAppPage';
import EmployeeList from './features/hrm/EmployeeList';
import AttendancePage from './features/hrm/AttendancePage';
import LeaveList from './features/hrm/LeaveList';
import SettingsPage from './features/settings/SettingsPage';
import ReportsPage from './features/reports/ReportsPage';

function PrivateRoute({ children }) {
  const { user, loading } = useSelector((state) => state.auth);
  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
  }
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(getMe());
    }
  }, [dispatch, token, user]);

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="leads" element={<LeadList />} />
        <Route path="leads/new" element={<LeadDetail />} />
        <Route path="leads/:id" element={<LeadDetail />} />
        <Route path="pipeline" element={<LeadPipeline />} />
        <Route path="contacts" element={<ContactList />} />
        <Route path="deals" element={<DealList />} />
        <Route path="tickets" element={<TicketList />} />
        <Route path="automation" element={<WorkflowList />} />
        <Route path="whatsapp" element={<WhatsAppPage />} />
        <Route path="employees" element={<EmployeeList />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="leaves" element={<LeaveList />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
