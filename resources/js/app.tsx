import React from 'react';
import { createRoot } from 'react-dom/client';
import './bootstrap';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import SmartBinsPage from './pages/SmartBinsPage';
import PointRedemptionPage from './pages/PointRedemptionPage';
import StaffManagementPage from './pages/StaffManagementPage';
import RoleManagementPage from './pages/RoleManagementPage';
import FinancePage from './pages/FinancePage';

import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    
                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<MainLayout />}>
                            <Route index element={<DashboardPage />} />
                            <Route path="users" element={<UserManagementPage />} />
                            <Route path="smart-bins" element={<SmartBinsPage />} />
                            <Route path="points" element={<PointRedemptionPage />} />
                            <Route path="staff" element={<StaffManagementPage />} />
                            <Route path="roles" element={<RoleManagementPage />} />
                            <Route path="finance" element={<FinancePage />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </Provider>
    );
};


const rootElement = document.getElementById('root');
if (rootElement) {
    const root = (window as any)._reactRoot || createRoot(rootElement);
    (window as any)._reactRoot = root;
    root.render(<App />);
}

export default App;
