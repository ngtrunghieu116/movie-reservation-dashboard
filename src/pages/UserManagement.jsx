import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { Pencil, KeyRound, Trash2 } from 'lucide-react';
import userApi from '../api/userApi';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const size = 10;

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Edit Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE',
    role: 'USER',
    status: 'ACTIVE'
  });

  // Reset Password State
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [filterRole, filterStatus, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const fetchUsers = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const params = { page, size };
      if (search.trim()) params.search = search.trim();
      if (filterRole) params.role = filterRole;
      if (filterStatus) params.status = filterStatus;

      const res = await userApi.getUsers(params);
      setUsers(res.content || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      setFetchError(true);
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || '',
      gender: user.gender || 'MALE',
      role: user.role || 'USER',
      status: user.status || 'ACTIVE'
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleOpenResetPasswordModal = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setIsResetPasswordModalOpen(true);
  };

  const handleCloseResetPasswordModal = () => {
    setIsResetPasswordModalOpen(false);
    setSelectedUser(null);
    setNewPassword('');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await userApi.updateUser(selectedUser.id, formData);
      toast.success('Cập nhật thông tin người dùng thành công');
      handleCloseEditModal();
      fetchUsers();
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Có lỗi xảy ra khi cập nhật thông tin');
      }
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có tối thiểu 6 ký tự');
      return;
    }
    try {
      await userApi.resetPassword(selectedUser.id, newPassword);
      toast.success('Đổi mật khẩu thành công!');
      handleCloseResetPasswordModal();
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Không thể đổi mật khẩu người dùng');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    try {
      await userApi.deleteUser(id);
      toast.success('Xóa người dùng thành công');
      fetchUsers();
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Không thể xóa người dùng này');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản Lý Người Dùng</h1>
      </div>

      {/* Header & Filters Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm theo tên, email, SĐT..."
              className="w-64 border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition"
          >
            Tìm kiếm
          </button>
        </form>

        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-gray-500 text-xs font-semibold uppercase">Vai trò:</span>
            <select
              className="border border-gray-300 rounded-md py-1.5 px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterRole}
              onChange={(e) => { setFilterRole(e.target.value); setPage(0); }}
            >
              <option value="">Tất cả</option>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-gray-500 text-xs font-semibold uppercase">Trạng thái:</span>
            <select
              className="border border-gray-300 rounded-md py-1.5 px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
            >
              <option value="">Tất cả</option>
              <option value="ACTIVE">HOẠT ĐỘNG</option>
              <option value="BLOCKED">ĐÃ KHÓA</option>
            </select>
          </div>

          {(search || filterRole || filterStatus) && (
            <button
              onClick={() => {
                setSearch('');
                setFilterRole('');
                setFilterStatus('');
                setPage(0);
              }}
              className="text-red-500 hover:text-red-700 text-xs font-medium underline"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ & Tên</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số điện thoại</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="8" className="text-center py-4">Đang tải...</td></tr>
            ) : fetchError ? (
              <tr>
                <td colSpan="8" className="text-center py-8">
                  <p className="text-red-500 mb-2">Không thể lấy dữ liệu người dùng</p>
                  <button onClick={fetchUsers} className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition">Thử lại</button>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="8" className="text-center py-4 text-gray-500">Không tìm thấy người dùng nào</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-500">
                    {u.id}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {u.lastName} {u.firstName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {u.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-mono">
                    {u.phone || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${u.status === 'BLOCKED' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {u.status === 'BLOCKED' ? 'ĐÃ KHÓA' : 'HOẠT ĐỘNG'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {u.createdAt ? format(new Date(u.createdAt), 'dd/MM/yyyy HH:mm') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(u)}
                        className="p-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition"
                        title="Sửa thông tin"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenResetPasswordModal(u)}
                        className="p-1.5 text-amber-600 hover:text-amber-900 hover:bg-amber-50 rounded-md transition"
                        title="Đổi mật khẩu"
                      >
                        <KeyRound size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition"
                        title="Xóa người dùng"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Trước
            </button>
            <span className="text-sm text-gray-700">
              Trang {page + 1} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">Cập Nhật Thông Tin Người Dùng</h3>
              <button onClick={handleCloseEditModal} className="text-gray-400 hover:text-gray-500">&times;</button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email (Không thể sửa)</label>
                <input
                  type="text"
                  disabled
                  className="w-full border rounded-md p-2 bg-gray-100 text-gray-600"
                  value={selectedUser.email}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ *</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    className="w-full border rounded-md p-2"
                    value={formData.lastName}
                    onChange={handleEditChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên *</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    className="w-full border rounded-md p-2"
                    value={formData.firstName}
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                  <input
                    type="text"
                    name="phone"
                    required
                    className="w-full border rounded-md p-2"
                    value={formData.phone}
                    onChange={handleEditChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    required
                    className="w-full border rounded-md p-2"
                    value={formData.dateOfBirth}
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính *</label>
                  <select
                    name="gender"
                    className="w-full border rounded-md p-2"
                    value={formData.gender}
                    onChange={handleEditChange}
                  >
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò *</label>
                  <select
                    name="role"
                    className="w-full border rounded-md p-2"
                    value={formData.role}
                    onChange={handleEditChange}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái *</label>
                  <select
                    name="status"
                    className="w-full border rounded-md p-2"
                    value={formData.status}
                    onChange={handleEditChange}
                  >
                    <option value="ACTIVE">HOẠT ĐỘNG</option>
                    <option value="BLOCKED">ĐÃ KHÓA</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetPasswordModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">Đổi Mật Khẩu Người Dùng</h3>
              <button onClick={handleCloseResetPasswordModal} className="text-gray-400 hover:text-gray-500">&times;</button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Thay đổi mật khẩu trực tiếp cho tài khoản: <strong className="text-gray-900">{selectedUser.email}</strong>
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                  className="w-full border rounded-md p-2"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseResetPasswordModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700"
                >
                  Đổi mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
