import React from 'react';
import { createRoot } from 'react-dom/client';
import './bootstrap';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import SmartBinsPage from './pages/SmartBinsPage';
import PointRedemptionPage from './pages/PointRedemptionPage';
import StaffManagementPage from './pages/StaffManagementPage';
import FinancePage from './pages/FinancePage';

const LoginPage = () => <div className="flex items-center justify-center h-screen bg-gray-100">Login Page (WIP)</div>;

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="users" element={<UserManagementPage />} />
                    <Route path="smart-bins" element={<SmartBinsPage />} />
                    <Route path="points" element={<PointRedemptionPage />} />
                    <Route path="staff" element={<StaffManagementPage />} />
                    <Route path="finance" element={<FinancePage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};


const rootElement = document.getElementById('root');
if (rootElement) {
    const root = (window as any)._reactRoot || createRoot(rootElement);
    (window as any)._reactRoot = root;
    root.render(<App />);
}

export default App;
