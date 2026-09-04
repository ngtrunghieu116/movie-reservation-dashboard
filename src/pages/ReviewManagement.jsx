import React, { useState, useEffect } from 'react';
import reviewApi from '../api/reviewApi';
import movieApi from '../api/movieApi';
import Pagination from '../components/Pagination';
import { MessageSquare, Search, Eye, EyeOff, Trash2, Star, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ReviewManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters & Pagination
    const [search, setSearch] = useState('');
    const [selectedMovieId, setSelectedMovieId] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pageNo, setPageNo] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchMovies();
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [pageNo, pageSize, selectedMovieId, statusFilter]);

    const fetchMovies = async () => {
        try {
            const res = await movieApi.getAll({ size: 100 });
            if (res && res.content) {
                setMovies(res.content);
            }
        } catch (err) {
            console.error('Không thể tải danh sách phim:', err);
        }
    };

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const params = {
                page: pageNo,
                size: pageSize,
                movieId: selectedMovieId || undefined,
                status: statusFilter || undefined,
                search: search.trim() || undefined,
            };
            const res = await reviewApi.getAll(params);
            if (res && res.content) {
                setReviews(res.content);
                setTotalElements(res.totalElements);
                setTotalPages(res.totalPages);
            } else {
                setReviews([]);
                setTotalElements(0);
                setTotalPages(0);
            }
        } catch (err) {
            toast.error('Lỗi khi tải danh sách nhận xét: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPageNo(0);
        fetchReviews();
    };

    const handlePublish = async (review) => {
        try {
            await reviewApi.publish(review.id);
            toast.success(`Đã hiển thị nhận xét của ${review.userFullName || review.userEmail}`);
            fetchReviews();
        } catch (err) {
            toast.error('Thao tác thất bại: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleHide = async (review) => {
        try {
            await reviewApi.hide(review.id);
            toast.success(`Đã ẩn nhận xét của ${review.userFullName || review.userEmail}`);
            fetchReviews();
        } catch (err) {
            toast.error('Thao tác thất bại: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async (review) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa nhận xét của ${review.userFullName || review.userEmail}? Nhận xét sẽ được đánh dấu ĐÃ XÓA.`)) {
            return;
        }

        try {
            await reviewApi.delete(review.id);
            toast.success('Đã chuyển trạng thái nhận xét sang ĐÃ XÓA');
            fetchReviews();
        } catch (err) {
            toast.error('Xóa nhận xét thất bại: ' + (err.response?.data?.message || err.message));
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="flex items-center gap-0.5 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={14}
                        className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                    />
                ))}
            </div>
        );
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PUBLISHED':
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Hiển thị</span>;
            case 'HIDDEN':
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">Đã ẩn</span>;
            case 'DELETED':
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">Đã xóa</span>;
            default:
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">{status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
                <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2.5">
                    <MessageSquare className="text-red-600 w-7 h-7" />
                    Kiểm Duyệt Đánh Giá & Nhận Xét
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Theo dõi, kiểm duyệt và quản lý các đánh giá 1-5 sao và ý kiến của khán giả về từng bộ phim.
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
                <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
                    <input
                        type="text"
                        placeholder="Tìm theo nội dung, tên user, email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </form>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Movie Filter */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-600 whitespace-nowrap">Phim:</label>
                        <select
                            value={selectedMovieId}
                            onChange={(e) => {
                                setSelectedMovieId(e.target.value);
                                setPageNo(0);
                            }}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 max-w-xs truncate"
                        >
                            <option value="">Tất cả phim</option>
                            {movies.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-600 whitespace-nowrap">Trạng thái:</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPageNo(0);
                            }}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        >
                            <option value="">Tất cả</option>
                            <option value="PUBLISHED">Hiển thị (PUBLISHED)</option>
                            <option value="HIDDEN">Đã ẩn (HIDDEN)</option>
                            <option value="DELETED">Đã xóa (DELETED)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Reviews Table */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                            <tr>
                                <th className="py-3.5 px-4 w-16">ID</th>
                                <th className="py-3.5 px-4 w-52">Phim</th>
                                <th className="py-3.5 px-4 w-44">Khách Hàng</th>
                                <th className="py-3.5 px-4 w-28">Đánh Giá</th>
                                <th className="py-3.5 px-4">Nhận Xét</th>
                                <th className="py-3.5 px-4 w-32">Xác Thực</th>
                                <th className="py-3.5 px-4 w-28">Trạng Thái</th>
                                <th className="py-3.5 px-4 text-right w-36">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-12 text-slate-400">
                                        Đang tải danh sách nhận xét...
                                    </td>
                                </tr>
                            ) : reviews.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-12 text-slate-400">
                                        Không tìm thấy nhận xét nào.
                                    </td>
                                </tr>
                            ) : (
                                reviews.map((r) => (
                                    <tr key={r.id} className="hover:bg-slate-50/80 transition">
                                        <td className="py-3.5 px-4 font-bold text-slate-600">#{r.id}</td>
                                        <td className="py-3.5 px-4">
                                            <p className="font-bold text-slate-800 line-clamp-1">{r.movieTitle || `Phim #${r.movieId}`}</p>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <p className="font-semibold text-slate-800">{r.userFullName || 'Khách hàng'}</p>
                                            <p className="text-xs text-slate-400 truncate">{r.userEmail}</p>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="flex flex-col gap-1">
                                                {renderStars(r.rating)}
                                                <span className="text-xs font-bold text-slate-600">{r.rating}/5 sao</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <p className="text-slate-700 text-xs sm:text-sm line-clamp-2 italic">
                                                "{r.comment || 'Không có bình luận văn bản'}"
                                            </p>
                                            <span className="text-[11px] text-slate-400 mt-1 block">
                                                {r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : ''}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            {r.verifiedPurchase ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                    <CheckCircle size={12} /> Đã mua vé
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-500 border border-slate-200">
                                                    <XCircle size={12} /> Chưa mua
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            {getStatusBadge(r.status)}
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {r.status !== 'PUBLISHED' && (
                                                    <button
                                                        onClick={() => handlePublish(r)}
                                                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition"
                                                        title="Hiển thị nhận xét"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                )}
                                                {r.status === 'PUBLISHED' && (
                                                    <button
                                                        onClick={() => handleHide(r)}
                                                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg border border-amber-200 transition"
                                                        title="Ẩn nhận xét"
                                                    >
                                                        <EyeOff size={16} />
                                                    </button>
                                                )}
                                                {r.status !== 'DELETED' && (
                                                    <button
                                                        onClick={() => handleDelete(r)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition"
                                                        title="Đánh dấu xóa"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-200">
                        <Pagination
                            currentPage={pageNo}
                            totalPages={totalPages}
                            onPageChange={(page) => setPageNo(page)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewManagement;
