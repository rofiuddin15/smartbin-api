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

const LoginPage = () => (
    <div className="flex items-center justify-center h-screen bg-gray-100 p-4">
        <div className="bg-white p-10 rounded shadow-2xl border border-gray-200 w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="text-center">
                <div className="bg-admin-primary w-16 h-16 rounded mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-admin-primary/20">
                    <span className="text-3xl font-black italic">SB</span>
                </div>
                <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">SmartBin Admin</h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Sistem Manajemen Sampah Terintegrasi</p>
            </div>
            
            <div className="p-6 bg-blue-50 border border-blue-100 rounded text-center">
                <p className="text-xs font-bold text-blue-700 leading-relaxed uppercase tracking-tight">Halaman Login Sedang Dalam Tahap Pengembangan</p>
                <button onClick={() => window.location.href = '/'} className="mt-4 w-full py-2 bg-admin-primary text-white text-[10px] font-black uppercase tracking-widest rounded shadow-md hover:bg-blue-700 transition-all">Masuk ke Dashboard</button>
            </div>
            
            <div className="text-center text-[9px] text-gray-300 font-bold uppercase tracking-widest">
                &copy; {new Date().getFullYear()} SmartBin Pamekasan
            </div>
        </div>
    </div>
);

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<DashboardPage />} />
                        <Route path="users" element={<UserManagementPage />} />
                        <Route path="smart-bins" element={<SmartBinsPage />} />
                        <Route path="points" element={<PointRedemptionPage />} />
                        <Route path="staff" element={<StaffManagementPage />} />
                        <Route path="roles" element={<RoleManagementPage />} />
                        <Route path="finance" element={<FinancePage />} />
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
