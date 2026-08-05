import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import showtimeApi from '../api/showtimeApi';
import theaterApi from '../api/theaterApi';
import roomApi from '../api/roomApi';
import movieApi from '../api/movieApi';

const ShowtimeManagement = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterTheater, setFilterTheater] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [filterMovie, setFilterMovie] = useState('');
  const [filterDate, setFilterDate] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const size = 10;

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    movieId: '',
    theaterId: '',
    roomId: '',
    startTime: '',
    priceStandard: '',
    priceVip: '',
    priceCouple: ''
  });
  
  const [modalRooms, setModalRooms] = useState([]);

  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    fetchShowtimes();
  }, [filterTheater, filterRoom, filterMovie, filterDate, page]);

  // When filter theater changes, fetch rooms for filter
  useEffect(() => {
    setFilterRoom('');
    if (filterTheater) {
      fetchRoomsByTheater(filterTheater, setRooms);
    } else {
      setRooms([]);
    }
  }, [filterTheater]);

  // When modal theater changes, fetch rooms for modal
  useEffect(() => {
    if (formData.theaterId) {
      fetchRoomsByTheater(formData.theaterId, setModalRooms);
    } else {
      setModalRooms([]);
    }
  }, [formData.theaterId]);

  // Auto-fill prices when room changes
  useEffect(() => {
    if (formData.roomId && !editingShowtime) {
      const selectedRoom = modalRooms.find(r => r.id === parseInt(formData.roomId));
      if (selectedRoom) {
        let defaultPrices = { standard: 80000, vip: 100000, couple: 150000 };
        // Customize prices based on room type if needed
        if (selectedRoom.roomType === '3D') {
          defaultPrices = { standard: 100000, vip: 120000, couple: 180000 };
        } else if (selectedRoom.roomType === 'IMAX') {
          defaultPrices = { standard: 120000, vip: 150000, couple: 220000 };
        } else if (selectedRoom.roomType === 'VIP') {
          defaultPrices = { standard: 150000, vip: 180000, couple: 250000 };
        }
        
        setFormData(prev => ({
          ...prev,
          priceStandard: defaultPrices.standard,
          priceVip: defaultPrices.vip,
          priceCouple: defaultPrices.couple
        }));
      }
    }
  }, [formData.roomId, modalRooms, editingShowtime]);

  const loadInitialData = async () => {
    setFetchError(false);
    try {
      await Promise.all([fetchTheaters(), fetchMovies()]);
    } catch (err) {
      setFetchError(true);
      toast.error('Lỗi khi tải dữ liệu. Vui lòng thử lại.');
    }
  };

  const fetchTheaters = async () => {
    const res = await theaterApi.getAll();
    setTheaters(Array.isArray(res) ? res : res.content || []);
  };

  const fetchRoomsByTheater = async (theaterId, setRoomsState) => {
    try {
      const params = theaterId ? { theaterId } : {};
      const res = await roomApi.getAll(params);
      setRoomsState(Array.isArray(res) ? res : res.content || []);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách phòng chiếu');
    }
  };

  const fetchMovies = async () => {
    const res = await movieApi.getAll();
    setMovies(Array.isArray(res) ? res : res.content || []);
  };

  const fetchShowtimes = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const params = { page, size };
      if (filterTheater) params.theaterId = filterTheater;
      if (filterRoom) params.roomId = filterRoom;
      if (filterMovie) params.movieId = filterMovie;
      if (filterDate) {
        params.fromDate = `${filterDate}T00:00:00`;
        params.toDate = `${filterDate}T23:59:59`;
      }
      
      const res = await showtimeApi.searchShowtimes(params);
      setShowtimes(res.content || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      setFetchError(true);
      toast.error('Lỗi khi tải danh sách suất chiếu');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (showtime = null) => {
    setEditingShowtime(showtime);
    if (showtime) {
      setFormData({
        movieId: showtime.movieId,
        theaterId: showtime.theaterId,
        roomId: showtime.roomId,
        // Format LocalDateTime to datetime-local input format (YYYY-MM-DDThh:mm)
        startTime: showtime.startTime.substring(0, 16),
        priceStandard: showtime.priceStandard,
        priceVip: showtime.priceVip,
        priceCouple: showtime.priceCouple
      });
    } else {
      setFormData({
        movieId: '',
        theaterId: filterTheater || '',
        roomId: filterRoom || '',
        startTime: '',
        priceStandard: '',
        priceVip: '',
        priceCouple: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingShowtime(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        movieId: Number(formData.movieId),
        roomId: Number(formData.roomId),
        startTime: formData.startTime.length === 16 ? `${formData.startTime}:00` : formData.startTime,
        priceStandard: Number(formData.priceStandard),
        priceVip: Number(formData.priceVip),
        priceCouple: Number(formData.priceCouple)
      };
      
      if (editingShowtime) {
        await showtimeApi.updateShowtime(editingShowtime.id, payload);
        toast.success('Cập nhật suất chiếu thành công');
      } else {
        await showtimeApi.createShowtime(payload);
        toast.success('Tạo suất chiếu thành công');
      }
      handleCloseModal();
      fetchShowtimes();
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Có lỗi xảy ra, vui lòng thử lại');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa suất chiếu này?')) return;
    try {
      await showtimeApi.deleteShowtime(id);
      toast.success('Xóa suất chiếu thành công');
      fetchShowtimes();
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Không thể xóa suất chiếu này');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản Lý Lịch Chiếu</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Thêm Suất Chiếu
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Cơ sở</label>
          <select
            className="border rounded p-2 min-w-[200px]"
            value={filterTheater}
            onChange={(e) => setFilterTheater(e.target.value)}
          >
            <option value="">-- Tất cả cơ sở --</option>
            {theaters.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Phòng chiếu</label>
          <select
            className="border rounded p-2 min-w-[200px]"
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            disabled={!filterTheater}
          >
            <option value="">-- Tất cả phòng --</option>
            {rooms.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.roomType})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Phim</label>
          <select
            className="border rounded p-2 min-w-[200px]"
            value={filterMovie}
            onChange={(e) => setFilterMovie(e.target.value)}
          >
            <option value="">-- Tất cả phim --</option>
            {movies.map(m => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Ngày chiếu</label>
          <input
            type="date"
            className="border rounded p-2"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
        
        <button 
          onClick={() => {
            setFilterTheater(''); setFilterRoom(''); setFilterMovie(''); setFilterDate('');
          }}
          className="text-gray-500 hover:text-gray-700 underline text-sm pb-2"
        >
          Xóa bộ lọc
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phim</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cơ sở / Phòng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giờ chiếu</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá (STD/VIP/CPL)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái / Ghế</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="6" className="text-center py-4">Đang tải...</td></tr>
            ) : fetchError ? (
              <tr>
                <td colSpan="6" className="text-center py-8">
                  <p className="text-red-500 mb-2">Không thể lấy dữ liệu</p>
                  <button onClick={fetchShowtimes} className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition">Thử lại</button>
                </td>
              </tr>
            ) : showtimes.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-4 text-gray-500">Không có suất chiếu nào</td></tr>
            ) : (
              showtimes.map(st => (
                <tr key={st.id}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{st.movieTitle}</div>
                    <div className="text-xs text-gray-500">{st.movieDuration} phút</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{st.theaterName}</div>
                    <div className="text-xs text-gray-500 font-semibold">{st.roomName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-blue-600 font-semibold">
                      {format(new Date(st.startTime), 'HH:mm dd/MM/yyyy')}
                    </div>
                    <div className="text-xs text-gray-500">
                      đến {format(new Date(st.endTime), 'HH:mm')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>{st.priceStandard.toLocaleString()}đ</div>
                    <div>{st.priceVip.toLocaleString()}đ</div>
                    <div>{st.priceCouple.toLocaleString()}đ</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-xs font-bold px-2 py-1 inline-block rounded ${st.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : st.status === 'SOLD_OUT' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      {st.status === 'AVAILABLE' ? 'CÒN CHỖ' : st.status === 'SOLD_OUT' ? 'HẾT VÉ' : 'ĐÃ CHIẾU'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Trống: <span className="font-semibold text-gray-800">{st.availableSeats}</span> / {st.availableSeats + st.bookedSeats}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button onClick={() => handleOpenModal(st)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                      Sửa
                    </button>
                    <button onClick={() => handleDelete(st.id)} className="text-red-600 hover:text-red-900">
                      Xóa
                    </button>
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

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">{editingShowtime ? 'Cập Nhật Suất Chiếu' : 'Thêm Suất Chiếu Mới'}</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phim *</label>
                  <select
                    name="movieId"
                    required
                    className="w-full border rounded-md p-2"
                    value={formData.movieId}
                    onChange={handleChange}
                  >
                    <option value="">-- Chọn phim --</option>
                    {movies.map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cơ sở *</label>
                  <select
                    name="theaterId"
                    required
                    className="w-full border rounded-md p-2"
                    value={formData.theaterId}
                    onChange={handleChange}
                  >
                    <option value="">-- Chọn cơ sở --</option>
                    {theaters.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phòng chiếu *</label>
                  <select
                    name="roomId"
                    required
                    className="w-full border rounded-md p-2"
                    value={formData.roomId}
                    onChange={handleChange}
                    disabled={!formData.theaterId}
                  >
                    <option value="">-- Chọn phòng --</option>
                    {modalRooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.roomType})</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian bắt đầu *</label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    required
                    className="w-full border rounded-md p-2"
                    value={formData.startTime}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">Giờ kết thúc sẽ được hệ thống tự động tính dựa trên thời lượng phim.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá vé thường (VND) *</label>
                  <input
                    type="number"
                    name="priceStandard"
                    required
                    className="w-full border rounded-md p-2"
                    value={formData.priceStandard}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá vé VIP (VND) *</label>
                  <input
                    type="number"
                    name="priceVip"
                    required
                    className="w-full border rounded-md p-2"
                    value={formData.priceVip}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá vé Đôi (VND) *</label>
                  <input
                    type="number"
                    name="priceCouple"
                    required
                    className="w-full border rounded-md p-2"
                    value={formData.priceCouple}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {editingShowtime && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <strong>Lưu ý:</strong> Nếu suất chiếu này đã có khách đặt vé, bạn sẽ <strong>không thể</strong> thay đổi Phim, Phòng chiếu và Giờ chiếu (Chỉ có thể đổi giá vé).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  {editingShowtime ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowtimeManagement;
