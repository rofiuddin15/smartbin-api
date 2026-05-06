import React, { useState } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    Trash2, 
    Coins, 
    UsersRound, 
    BarChart3, 
    Menu, 
    Search, 
    Bell, 
    Maximize2, 
    LogOut,
    ChevronLeft,
    Shield,
    TrendingUp,
    TrendingDown
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const SidebarItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active?: boolean }) => (
    <Link 
        to={to} 
        className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded transition-colors text-gray-300 hover:bg-gray-700 hover:text-white",
            active && "bg-admin-primary text-white hover:bg-admin-primary"
        )}
    >
        <Icon size={18} />
        <span className="text-base font-medium">{label}</span>
    </Link>
);

const MainLayout: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    
    const user = JSON.parse(localStorage.getItem('smartbin_admin_user') || '{}');

    const handleLogout = async () => {
        try {
            const api = (await import('../utils/api')).default;
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            localStorage.removeItem('smartbin_admin_token');
            localStorage.removeItem('smartbin_admin_user');
            navigate('/login');
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            {/* Sidebar */}
            <aside 
                className={cn(
                    "bg-admin-dark text-white flex flex-col transition-all duration-300 ease-in-out shrink-0",
                    isSidebarOpen ? "w-[250px]" : "w-0 md:w-20 overflow-hidden"
                )}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center px-4 border-b border-gray-700 shrink-0">
                    <div className="bg-admin-primary p-2 rounded mr-3">
                        <Trash2 size={24} className="text-white" />
                    </div>
                    <span className={cn("font-bold text-xl tracking-tight transition-opacity", !isSidebarOpen && "md:opacity-0")}>
                        SmartBin <span className="text-[12px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400 font-normal">ADMIN</span>
                    </span>
                </div>

                {/* User Section */}
                <div className="p-4 flex items-center border-b border-gray-700">
                    <div className="w-10 h-10 rounded bg-gray-600 flex items-center justify-center text-xl font-bold mr-3 border border-gray-500 uppercase">
                        {user.name?.charAt(0) || 'A'}
                    </div>
                    <div className={cn("transition-opacity", !isSidebarOpen && "md:opacity-0")}>
                        <p className="text-base font-semibold truncate">{user.name || 'Admin'}</p>
                        <p className="text-[12px] text-green-400 font-bold uppercase tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            Online
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                    <p className={cn("px-4 py-2 text-[12px] uppercase font-bold text-gray-500 tracking-wider", !isSidebarOpen && "md:hidden")}>
                        Menu Utama
                    </p>
                    <SidebarItem 
                        to="/" 
                        icon={LayoutDashboard} 
                        label="Dashboard" 
                        active={location.pathname === "/"} 
                    />
                    <SidebarItem 
                        to="/users" 
                        icon={Users} 
                        label="Moderasi Member" 
                        active={location.pathname === "/users"} 
                    />
                    <SidebarItem 
                        to="/smart-bins" 
                        icon={Trash2} 
                        label="Perangkat IoT" 
                        active={location.pathname === "/smart-bins"} 
                    />
                    
                    <p className={cn("px-4 py-2 mt-4 text-[12px] uppercase font-bold text-gray-500 tracking-wider", !isSidebarOpen && "md:hidden")}>
                        Administrasi
                    </p>
                    <SidebarItem 
                        to="/points" 
                        icon={Coins} 
                        label="Penukaran Poin" 
                        active={location.pathname === "/points"} 
                    />
                    <SidebarItem 
                        to="/staff" 
                        icon={UsersRound} 
                        label="Kelola Staff" 
                        active={location.pathname === "/staff"} 
                    />
                    <SidebarItem 
                        to="/roles" 
                        icon={Shield} 
                        label="Hak Akses (Role)" 
                        active={location.pathname === "/roles"} 
                    />
                    
                    <p className={cn("px-4 py-2 mt-4 text-[12px] uppercase font-bold text-gray-500 tracking-wider", !isSidebarOpen && "md:hidden")}>
                        Keuangan & Akuntansi
                    </p>
                    <SidebarItem 
                        to="/finance/income" 
                        icon={TrendingUp} 
                        label="Tabungan Masuk" 
                        active={location.pathname === "/finance/income"} 
                    />
                    <SidebarItem 
                        to="/finance/expense" 
                        icon={TrendingDown} 
                        label="Penarikan Saldo" 
                        active={location.pathname === "/finance/expense"} 
                    />
                    <SidebarItem 
                        to="/finance" 
                        icon={BarChart3} 
                        label="Laporan Keuangan" 
                        active={location.pathname === "/finance"} 
                    />
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Navbar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <nav className="hidden md:flex items-center gap-4">
                            <Link to="/" className="text-base text-gray-600 hover:text-admin-primary font-medium">Beranda</Link>
                            <span className="text-gray-300">/</span>
                            <span className="text-base text-gray-400 capitalize">{(location.pathname || '').substring(1) || 'Dashboard'}</span>
                        </nav>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4 text-gray-600">
                        <button className="p-2 hover:bg-gray-100 rounded hidden sm:block">
                            <Search size={18} />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded relative">
                            <Bell size={18} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded hidden sm:block">
                            <Maximize2 size={18} />
                        </button>
                        <div className="h-8 w-px bg-gray-200 mx-1"></div>
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded transition-colors text-red-600 group"
                        >
                            <LogOut size={18} />
                            <span className="text-base font-bold hidden md:block">Keluar</span>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/50">
                    <Outlet />
                </main>

                {/* Footer */}
                <footer className="h-12 bg-white border-t border-gray-200 flex items-center justify-between px-6 shrink-0 text-[12px] text-gray-400 font-bold uppercase tracking-widest">
                    <div>
                        <strong>Hak Cipta &copy; {new Date().getFullYear()} <span className="text-admin-primary">SmartBin Pamekasan</span>.</strong>
                    </div>
                    <div className="hidden sm:block">
                        Versi 1.0.0-PRO
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default MainLayout;
