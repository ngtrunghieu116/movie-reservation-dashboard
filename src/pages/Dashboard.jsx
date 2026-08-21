import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Film, Calendar, Building2, Coffee, Users, RefreshCw, ArrowUpRight, ShieldCheck } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const Dashboard = () => {
    const [stats, setStats] = useState({
        moviesCount: 0,
        showtimesCount: 0,
        theatersCount: 0,
        usersCount: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            setIsLoading(true);
            try {
                const [moviesRes, showtimesRes, theatersRes] = await Promise.allSettled([
                    axiosClient.get('/admin/movies?page=0&size=1'),
                    axiosClient.get('/admin/showtimes?page=0&size=1'),
                    axiosClient.get('/admin/theaters?page=0&size=1')
                ]);

                setStats({
                    moviesCount: moviesRes.status === 'fulfilled' ? (moviesRes.value?.totalElements || moviesRes.value?.data?.totalElements || 0) : 0,
                    showtimesCount: showtimesRes.status === 'fulfilled' ? (showtimesRes.value?.totalElements || showtimesRes.value?.data?.totalElements || 0) : 0,
                    theatersCount: theatersRes.status === 'fulfilled' ? (theatersRes.value?.totalElements || theatersRes.value?.data?.totalElements || 0) : 0,
                    usersCount: 12
                });
            } catch (err) {
                console.error('Failed to load dashboard stats:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    const statCards = [
        { label: 'Phim Chiếu', count: stats.moviesCount, icon: Film, link: '/movies', color: 'bg-red-500' },
        { label: 'Suất Chiếu', count: stats.showtimesCount, icon: Calendar, link: '/showtimes', color: 'bg-amber-500' },
        { label: 'Cơ Sở Rạp', count: stats.theatersCount, icon: Building2, link: '/theaters', color: 'bg-emerald-500' },
        { label: 'Người Dùng', count: stats.usersCount, icon: Users, link: '/users', color: 'bg-blue-500' },
    ];

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Top Banner Header */}
            <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-red-950 p-8 text-white shadow-xl overflow-hidden border border-slate-800">
                <div className="relative z-10 max-w-2xl space-y-3">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-red-600/30 border border-red-500/40 rounded-full text-red-300 text-xs font-bold uppercase tracking-wider">
                        <ShieldCheck className="w-4 h-4 text-red-400" />
                        <span>Hệ Thống Quản Trị CineMind</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        Chào Mừng Trở Lại, <span className="text-red-500">Admin</span>
                    </h1>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, idx) => {
                    const IconComponent = card.icon;
                    return (
                        <Link
                            key={idx}
                            to={card.link}
                            className="group bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-red-300 transition-all duration-300 flex items-center justify-between"
                        >
                            <div className="space-y-1">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    {card.label}
                                </span>
                                <h3 className="text-3xl font-extrabold text-slate-900 group-hover:text-red-600 transition-colors">
                                    {isLoading ? '...' : card.count}
                                </h3>
                            </div>
                            <div className={`w-13 h-13 ${card.color} text-white rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition duration-300`}>
                                <IconComponent className="w-6 h-6" />
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                    <div className="w-2 h-6 bg-red-600 rounded-full" />
                    <span>Lối Tắt Quản Lý Nhanh</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link
                        to="/movies"
                        className="p-5 rounded-2xl bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-800 hover:text-red-700 font-semibold transition group flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <Film className="w-5 h-5 text-red-600" />
                            <span>Quản Lý Danh Sách Phim</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>

                    <Link
                        to="/showtimes"
                        className="p-5 rounded-2xl bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-800 hover:text-red-700 font-semibold transition group flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-red-600" />
                            <span>Tạo Lịch Chiếu Mới</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>

                    <Link
                        to="/theaters"
                        className="p-5 rounded-2xl bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-800 hover:text-red-700 font-semibold transition group flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-red-600" />
                            <span>Quản Lý Phòng Chiếu & Ghế</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
