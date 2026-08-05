import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Tags, 
    Film, 
    Building2, 
    DoorClosed,
    Users, 
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    Calendar
} from 'lucide-react';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/genres', icon: <Tags size={20} />, label: 'Thể Loại' },
        { path: '/movies', icon: <Film size={20} />, label: 'Phim Chiếu' },
        { path: '/theaters', icon: <Building2 size={20} />, label: 'Cơ Sở Rạp' },
        { path: '/showtimes', icon: <Calendar size={20} />, label: 'Lịch Chiếu' },
        { path: '/users', icon: <Users size={20} />, label: 'Người Dùng' },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className={`bg-white w-64 shadow-lg flex flex-col transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full fixed z-20 h-full'}`}>
                <div className="h-16 flex items-center justify-between px-4 border-b">
                    <span className="text-xl font-bold text-blue-600 flex items-center gap-2">
                        <Film className="w-6 h-6" /> CineMind
                    </span>
                    {!sidebarOpen && (
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden">
                            <X size={20} />
                        </button>
                    )}
                </div>
                
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link 
                            key={item.path} 
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                location.pathname === item.path 
                                ? 'bg-blue-50 text-blue-600 font-medium' 
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 z-10">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            <Menu size={24} />
                        </button>
                        
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm hệ thống..."
                                className="pl-9 pr-4 py-2 bg-gray-100 border-transparent rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all w-64"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative text-gray-500 hover:text-gray-700">
                            <Bell size={20} />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        
                        <div className="flex items-center gap-3 pl-4 border-l">
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-medium text-gray-700">{user.firstName} {user.lastName}</span>
                                <span className="text-xs text-gray-500">Admin</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                {user.firstName?.charAt(0) || 'A'}
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main scrollable area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
