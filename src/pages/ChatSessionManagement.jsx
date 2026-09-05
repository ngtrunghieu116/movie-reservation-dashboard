import React, { useState, useEffect } from 'react';
import chatSessionApi from '../api/chatSessionApi';
import MarkdownMessage from '../components/ChatWidget/MarkdownMessage';
import {
    Bot,
    MessageSquare,
    Search,
    Trash2,
    Eye,
    X,
    Clock,
    User,
    RefreshCw,
    MessageCircle,
    HelpCircle,
    Layers,
    Sparkles,
    ArrowUpRight,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ChatSessionManagement = () => {
    const [sessions, setSessions] = useState([]);
    const [stats, setStats] = useState({ total_sessions: 0, total_messages: 0, total_questions: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedSession, setSelectedSession] = useState(null);
    const [transcript, setTranscript] = useState([]);
    const [loadingTranscript, setLoadingTranscript] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async (searchQuery = '') => {
        try {
            setLoading(true);
            const params = { limit: 100 };
            if (searchQuery.trim()) {
                params.search = searchQuery.trim();
            }
            const res = await chatSessionApi.getSessions(params);
            setSessions(res.sessions || []);
            if (res.stats) {
                setStats(res.stats);
            }
        } catch (err) {
            console.error('Lỗi khi tải phiên chat:', err);
            toast.error('Không thể kết nối dịch vụ Chatbot AI (cổng 8001)');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchSessions(search);
    };

    const handleClearSearch = () => {
        setSearch('');
        fetchSessions('');
    };

    const handleViewDetails = async (session) => {
        setSelectedSession(session);
        setLoadingTranscript(true);
        try {
            const data = await chatSessionApi.getSessionHistory(session.id);
            setTranscript(data.messages || []);
        } catch (err) {
            console.error('Lỗi tải transcript:', err);
            toast.error('Không thể tải lịch sử chi tiết cuộc trò chuyện');
        } finally {
            setLoadingTranscript(false);
        }
    };

    const handleDeleteSession = async (session) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa phiên chat #${session.id}? Thao tác này sẽ xóa toàn bộ tin nhắn liên quan.`)) {
            return;
        }

        try {
            await chatSessionApi.deleteSession(session.id);
            toast.success('Đã xóa phiên chat thành công');
            setSessions((prev) => prev.filter((s) => s.id !== session.id));
            if (selectedSession?.id === session.id) {
                setSelectedSession(null);
                setTranscript([]);
            }
            // Cập nhật lại stats
            fetchSessions(search);
        } catch (err) {
            console.error('Lỗi khi xóa phiên chat:', err);
            toast.error('Xóa phiên chat thất bại');
        }
    };

    const getAgentBadge = (agentName) => {
        switch (agentName) {
            case 'showtime_booking_agent':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Lịch chiếu & Đặt vé
                    </span>
                );
            case 'ticket_support_agent':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        Hỗ trợ vé
                    </span>
                );
            case 'navigation_agent':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        Điều hướng
                    </span>
                );
            case 'safe_guard':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                        Kiểm duyệt
                    </span>
                );
            case 'discovery_agent':
            default:
                return (
                    <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-md bg-red-50 text-red-700 border border-red-200">
                        Khám phá phim
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2.5">
                            <Bot className="text-red-600 w-7 h-7" />
                            Quản Lý Phiên Chat & Câu Hỏi AI
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Xem các câu hỏi thực tế của khách hàng, theo dõi phản hồi của AI CineBot và quản lý lịch sử hội thoại.
                        </p>
                    </div>
                    <button
                        onClick={() => fetchSessions(search)}
                        disabled={loading}
                        className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2 w-fit cursor-pointer shadow-xs"
                        title="Tải lại danh sách"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Làm mới
                    </button>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold">
                            <MessageCircle size={20} />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 font-medium block">Tổng số phiên chat</span>
                            <span className="text-xl font-black text-slate-800">{stats.total_sessions}</span>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                            <HelpCircle size={20} />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 font-medium block">Câu hỏi người dùng</span>
                            <span className="text-xl font-black text-slate-800">{stats.total_questions}</span>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                            <Layers size={20} />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 font-medium block">Tổng tin nhắn trao đổi</span>
                            <span className="text-xl font-black text-slate-800">{stats.total_messages}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
                <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Tìm theo nội dung câu hỏi, mã phiên, email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </form>

                {search && (
                    <button
                        onClick={handleClearSearch}
                        className="px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition cursor-pointer"
                    >
                        Xóa tìm kiếm
                    </button>
                )}
            </div>

            {/* Sessions Table */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[1000px]">
                        <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                            <tr>
                                <th className="py-3.5 px-4 w-44">Mã Phiên (ID)</th>
                                <th className="py-3.5 px-4 w-48">Khách Hàng</th>
                                <th className="py-3.5 px-4 min-w-[320px]">Câu Hỏi Đầu Tiên</th>
                                <th className="py-3.5 px-4 w-36 whitespace-nowrap">Agent Phụ Trách</th>
                                <th className="py-3.5 px-4 w-28 text-center whitespace-nowrap">Tin Nhắn</th>
                                <th className="py-3.5 px-4 w-40 whitespace-nowrap">Cập Nhật</th>
                                <th className="py-3.5 px-4 text-right w-28 whitespace-nowrap">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-12 text-slate-400">
                                        Đang tải danh sách phiên chat...
                                    </td>
                                </tr>
                            ) : sessions.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-12 text-slate-400">
                                        Không tìm thấy phiên trò chuyện nào.
                                    </td>
                                </tr>
                            ) : (
                                sessions.map((s) => (
                                    <tr key={s.id} className="hover:bg-slate-50/80 transition">
                                        <td className="py-3.5 px-4">
                                            <span className="font-mono text-xs font-bold text-slate-600 truncate block max-w-[150px]" title={s.id}>
                                                {s.id}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            {s.user ? (
                                                <div>
                                                    <p className="font-semibold text-slate-800 truncate" title={s.user.full_name}>
                                                        {s.user.full_name || 'Người dùng'}
                                                    </p>
                                                    <p className="text-xs text-slate-400 truncate" title={s.user.email}>
                                                        {s.user.email}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                                                    Khách vãng lai
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div
                                                onClick={() => handleViewDetails(s)}
                                                className="cursor-pointer group"
                                                title="Bấm để xem toàn bộ cuộc trò chuyện"
                                            >
                                                <p className="font-medium text-slate-800 line-clamp-2 text-xs sm:text-sm group-hover:text-red-600 transition">
                                                    {s.first_question ? `"${s.first_question}"` : <span className="italic text-slate-400">Chưa có câu hỏi văn bản</span>}
                                                </p>
                                                {s.last_message && s.last_message !== s.first_question && (
                                                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                                        Phản hồi: {s.last_message}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            {getAgentBadge(s.last_agent)}
                                        </td>
                                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                                                {s.message_count || 0} tin
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                                            {s.updated_at ? new Date(s.updated_at).toLocaleString('vi-VN') : ''}
                                        </td>
                                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleViewDetails(s)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 transition cursor-pointer"
                                                    title="Xem chi tiết cuộc trò chuyện"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSession(s)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition cursor-pointer"
                                                    title="Xóa phiên này"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Conversation Transcript Modal */}
            {selectedSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="flex items-start justify-between pb-3 border-b border-slate-100 flex-shrink-0">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
                                        <Bot size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900">
                                            Chi Tiết Đối Thoại #{selectedSession.id}
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                            Khách: <strong className="text-slate-700">{selectedSession.user?.full_name || 'Khách vãng lai'}</strong>
                                            {selectedSession.user?.email && ` (${selectedSession.user.email})`}
                                            {selectedSession.created_at && ` • Bắt đầu: ${new Date(selectedSession.created_at).toLocaleString('vi-VN')}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedSession(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body: Transcript Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 rounded-xl border border-slate-100">
                            {loadingTranscript ? (
                                <div className="text-center py-12 text-slate-400 text-xs">
                                    Đang tải nội dung cuộc hội thoại...
                                </div>
                            ) : transcript.length === 0 ? (
                                <div className="text-center py-12 text-slate-400 text-xs">
                                    Phiên này không có tin nhắn nào.
                                </div>
                            ) : (
                                transcript.map((m, idx) => {
                                    const isUser = m.role === 'user';
                                    return (
                                        <div
                                            key={idx}
                                            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`flex gap-2.5 max-w-[88%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                                {!isUser && (
                                                    <div className="w-7 h-7 rounded-lg bg-red-600/10 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-red-200/50">
                                                        <Bot size={15} />
                                                    </div>
                                                )}

                                                <div className="flex flex-col">
                                                    <div className={`flex items-center gap-2 mb-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                                                        <span className="text-[11px] font-bold text-slate-600">
                                                            {isUser ? (selectedSession.user?.full_name || 'Khách hàng') : 'CineBot AI'}
                                                        </span>
                                                        {!isUser && m.agent_name && getAgentBadge(m.agent_name)}
                                                        {m.created_at && (
                                                            <span className="text-[10px] text-slate-400">
                                                                {new Date(m.created_at).toLocaleTimeString('vi-VN')}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div
                                                        className={`p-3.5 rounded-2xl ${isUser
                                                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white rounded-tr-xs shadow-sm shadow-red-600/20 text-[13px] leading-relaxed'
                                                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs text-[13px]'
                                                            }`}
                                                    >
                                                        {isUser ? (
                                                            <div className="whitespace-pre-wrap">{m.content}</div>
                                                        ) : (
                                                            <MarkdownMessage content={m.content} />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
                            <button
                                onClick={() => handleDeleteSession(selectedSession)}
                                className="px-3.5 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                            >
                                <Trash2 size={14} /> Xóa phiên này
                            </button>
                            <button
                                onClick={() => setSelectedSession(null)}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatSessionManagement;
