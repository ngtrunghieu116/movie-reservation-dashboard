import React, { useState, useEffect } from 'react';
import productApi from '../api/productApi';
import Pagination from '../components/Pagination';
import { Edit, Trash2, Plus, Search, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter & Pagination States
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [isActive, setIsActive] = useState('');
    const [sort, setSort] = useState('displayOrder,asc');
    
    const [pageNo, setPageNo] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    // Preview state
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewProduct, setPreviewProduct] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, [pageNo, pageSize, search, category, isActive, sort]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = {
                page: pageNo,
                size: pageSize,
                sort: sort
            };
            if (search.trim()) params.search = search.trim();
            if (category) params.category = category;
            if (isActive !== '') params.isActive = isActive;

            const data = await productApi.getAll(params);

            if (data && data.content !== undefined) {
                setProducts(data.content);
                setTotalElements(data.totalElements);
                setTotalPages(data.totalPages);
            } else {
                setProducts(data);
                setTotalElements(data.length);
                setTotalPages(1);
            }
            setError(null);
        } catch (err) {
            setError('Không thể tải danh sách sản phẩm. ' + (err.response?.data?.message || ''));
            toast.error('Lỗi khi tải dữ liệu sản phẩm!');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setCurrentProduct({ ...product });
            setIsEditing(true);
            setPreviewImage(product.imagePath ? `http://localhost:8080${product.imagePath}` : null);
        } else {
            setCurrentProduct({
                name: '',
                category: 'FOOD',
                description: '',
                price: '',
                availableQuantity: 0,
                isActive: true,
                displayOrder: 0
            });
            setIsEditing(false);
            setPreviewImage(null);
        }
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentProduct(null);
        setImageFile(null);
        setPreviewImage(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Kích thước ảnh tối đa là 2MB!');
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (currentProduct.price <= 0) {
            toast.error('Giá sản phẩm phải lớn hơn 0');
            return;
        }
        if (currentProduct.availableQuantity < 0) {
            toast.error('Số lượng tồn kho không được âm');
            return;
        }
        if (currentProduct.name.trim() === '') {
            toast.error('Tên sản phẩm không được rỗng');
            return;
        }

        const formData = new FormData();
        formData.append('name', currentProduct.name);
        formData.append('category', currentProduct.category);
        formData.append('description', currentProduct.description || '');
        formData.append('price', currentProduct.price);
        formData.append('availableQuantity', currentProduct.availableQuantity);
        formData.append('isActive', currentProduct.isActive);
        formData.append('displayOrder', currentProduct.displayOrder);

        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            if (isEditing) {
                await productApi.update(currentProduct.id, formData);
                toast.success('Cập nhật sản phẩm thành công!');
            } else {
                if (!imageFile) {
                    toast.error('Vui lòng chọn ảnh cho sản phẩm mới!');
                    return;
                }
                await productApi.create(formData);
                toast.success('Tạo mới sản phẩm thành công!');
            }
            fetchProducts();
            handleCloseModal();
        } catch (err) {
            toast.error('Lỗi: ' + (err.response?.data?.message || 'Có lỗi xảy ra'));
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation(); // Prevent opening preview
        if (window.confirm('Bạn có chắc chắn muốn ngưng kinh doanh sản phẩm này? (Soft Delete)')) {
            try {
                await productApi.delete(id);
                toast.success('Đã ngưng kinh doanh sản phẩm!');
                fetchProducts();
            } catch (err) {
                toast.error('Không thể xóa sản phẩm: ' + (err.response?.data?.message || ''));
            }
        }
    };

    const openPreview = (product) => {
        setPreviewProduct(product);
        setIsPreviewOpen(true);
    };

    const getStatusBadge = (product) => {
        if (!product.isActive) {
            return <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium border border-red-200">Ngừng bán</span>;
        }
        if (product.availableQuantity === 0) {
            return <span className="px-2.5 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-medium border border-orange-200">Hết hàng</span>;
        }
        return <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium border border-green-200">Đang kinh doanh</span>;
    };

    const getCategoryBadge = (category) => {
        switch (category) {
            case 'FOOD':
                return <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-100">Đồ Ăn</span>;
            case 'DRINK':
                return <span className="text-xs font-medium px-2 py-1 bg-cyan-50 text-cyan-700 rounded border border-cyan-100">Nước Uống</span>;
            case 'COMBO':
                return <span className="text-xs font-medium px-2 py-1 bg-purple-50 text-purple-700 rounded border border-purple-100">Combo</span>;
            default:
                return <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded">{category}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản Lý F&B</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý bắp nước và combo tại rạp</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-sm active:scale-95"
                >
                    <Plus size={18} /> Thêm Sản Phẩm
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="relative col-span-1 md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Tìm theo tên..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPageNo(0); }}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                </div>
                <select 
                    value={category} 
                    onChange={(e) => { setCategory(e.target.value); setPageNo(0); }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Tất cả Danh Mục</option>
                    <option value="FOOD">Đồ Ăn (Food)</option>
                    <option value="DRINK">Nước Uống (Drink)</option>
                    <option value="COMBO">Combo Bắp Nước</option>
                </select>
                <select 
                    value={isActive} 
                    onChange={(e) => { setIsActive(e.target.value); setPageNo(0); }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Tất cả Trạng thái</option>
                    <option value="true">Đang kinh doanh</option>
                    <option value="false">Ngừng bán (Inactive)</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {error && <div className="bg-red-50 text-red-600 p-4 m-4 rounded-lg text-sm">{error}</div>}

                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        <th className="px-6 py-4">Hình Ảnh</th>
                                        <th className="px-6 py-4 cursor-pointer" onClick={() => setSort(sort === 'name,asc' ? 'name,desc' : 'name,asc')}>Tên Sản Phẩm {sort.startsWith('name') ? (sort.endsWith('asc') ? '↑' : '↓') : ''}</th>
                                        <th className="px-6 py-4">Phân Loại</th>
                                        <th className="px-6 py-4 cursor-pointer" onClick={() => setSort(sort === 'price,asc' ? 'price,desc' : 'price,asc')}>Đơn Giá {sort.startsWith('price') ? (sort.endsWith('asc') ? '↑' : '↓') : ''}</th>
                                        <th className="px-6 py-4">Tồn Kho</th>
                                        <th className="px-6 py-4">Trạng Thái</th>
                                        <th className="px-6 py-4 text-right">Thao Tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {products.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-12 text-gray-400">Không tìm thấy sản phẩm.</td>
                                        </tr>
                                    ) : (
                                        products.map((product) => (
                                            <tr key={product.id} className="hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => openPreview(product)}>
                                                <td className="px-6 py-4">
                                                    {product.imagePath ? (
                                                        <img src={`http://localhost:8080${product.imagePath}`} alt={product.name} className="w-12 h-12 rounded object-cover border" />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 border"><ImageIcon size={20} /></div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-gray-800">{product.name}</td>
                                                <td className="px-6 py-4">{getCategoryBadge(product.category)}</td>
                                                <td className="px-6 py-4 font-medium text-blue-600">{Number(product.price).toLocaleString('vi-VN')} đ</td>
                                                <td className="px-6 py-4 text-gray-600">{product.availableQuantity}</td>
                                                <td className="px-6 py-4">{getStatusBadge(product)}</td>
                                                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => handleOpenModal(product)} className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition-colors" title="Sửa">
                                                            <Edit size={18} />
                                                        </button>
                                                        {product.isActive && (
                                                            <button onClick={(e) => handleDelete(product.id, e)} className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Ngừng bán">
                                                                <Trash2 size={18} />
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
                        <Pagination
                            pageNo={pageNo}
                            pageSize={pageSize}
                            totalElements={totalElements}
                            totalPages={totalPages}
                            onPageChange={setPageNo}
                            onPageSizeChange={(newSize) => { setPageSize(newSize); setPageNo(0); }}
                        />
                    </>
                )}
            </div>

            {/* Preview Modal */}
            {isPreviewOpen && previewProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsPreviewOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="relative h-64 bg-gray-100">
                            {previewProduct.imagePath ? (
                                <img src={`http://localhost:8080${previewProduct.imagePath}`} alt={previewProduct.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={48} /></div>
                            )}
                            <div className="absolute top-4 right-4">{getStatusBadge(previewProduct)}</div>
                        </div>
                        <div className="p-6 text-center space-y-2">
                            <div className="text-xs font-bold text-gray-400 tracking-widest uppercase">{getCategoryBadge(previewProduct.category)}</div>
                            <h2 className="text-2xl font-bold text-gray-800">{previewProduct.name}</h2>
                            <p className="text-blue-600 font-bold text-xl">{Number(previewProduct.price).toLocaleString('vi-VN')} đ</p>
                            <p className="text-gray-500 text-sm mt-4">{previewProduct.description || 'Chưa có mô tả'}</p>
                            <div className="mt-6 flex justify-center gap-4 text-sm text-gray-500 border-t pt-4">
                                <div>Tồn kho: <strong>{previewProduct.availableQuantity}</strong></div>
                                <div>Hiển thị: <strong>#{previewProduct.displayOrder}</strong></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Add/Edit */}
            {isModalOpen && currentProduct && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-800">
                                {isEditing ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">&times;</button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            <form id="productForm" onSubmit={handleSubmit} className="space-y-4">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Tên Sản Phẩm *</label>
                                            <input type="text" required className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500" value={currentProduct.name} onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Danh Mục *</label>
                                            <select required className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500" value={currentProduct.category} onChange={(e) => setCurrentProduct({...currentProduct, category: e.target.value})}>
                                                <option value="FOOD">Đồ ăn (Food)</option>
                                                <option value="DRINK">Nước uống (Drink)</option>
                                                <option value="COMBO">Combo Bắp Nước</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Giá Bán (VNĐ) *</label>
                                                <input type="number" required min="1" className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500" value={currentProduct.price} onChange={(e) => setCurrentProduct({...currentProduct, price: e.target.value})} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Tồn Kho *</label>
                                                <input type="number" required min="0" className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500" value={currentProduct.availableQuantity} onChange={(e) => setCurrentProduct({...currentProduct, availableQuantity: e.target.value})} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Thứ Tự Hiển Thị</label>
                                            <input type="number" required min="0" className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500" value={currentProduct.displayOrder} onChange={(e) => setCurrentProduct({...currentProduct, displayOrder: e.target.value})} />
                                        </div>
                                        <div className="flex items-center gap-2 mt-4">
                                            <input type="checkbox" id="isActive" checked={currentProduct.isActive} onChange={(e) => setCurrentProduct({...currentProduct, isActive: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" />
                                            <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">Đang kinh doanh</label>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-1/3 flex flex-col items-center gap-3">
                                        <label className="block text-sm font-semibold text-gray-700 self-start">Hình Ảnh {isEditing ? '' : '*'}</label>
                                        <div className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden bg-gray-50 relative group">
                                            {previewImage ? (
                                                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-gray-400 flex flex-col items-center">
                                                    <ImageIcon size={32} className="mb-2" />
                                                    <span className="text-xs">Chọn ảnh</span>
                                                </div>
                                            )}
                                            <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        </div>
                                        <p className="text-xs text-gray-400">JPG, PNG, WEBP (Tối đa 2MB)</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Mô Tả</label>
                                    <textarea rows="3" className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 outline-none" value={currentProduct.description || ''} onChange={(e) => setCurrentProduct({...currentProduct, description: e.target.value})}></textarea>
                                </div>
                            </form>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                            <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">Hủy</button>
                            <button type="submit" form="productForm" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium shadow-sm transition-colors">{isEditing ? 'Cập Nhật' : 'Tạo Mới'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagement;
