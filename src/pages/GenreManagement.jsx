import React, { useState, useEffect } from 'react';
import genreApi from '../api/genreApi';
import { Edit, Trash2, Plus } from 'lucide-react';

const GenreManagement = () => {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentGenre, setCurrentGenre] = useState({ name: '', description: '' });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchGenres();
    }, []);

    const fetchGenres = async () => {
        try {
            setLoading(true);
            const data = await genreApi.getAll();
            setGenres(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch genres. ' + (err.response?.data?.message || ''));
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (genre = null) => {
        if (genre) {
            setCurrentGenre(genre);
            setIsEditing(true);
        } else {
            setCurrentGenre({ name: '', description: '' });
            setIsEditing(false);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentGenre({ name: '', description: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await genreApi.update(currentGenre.id, currentGenre);
            } else {
                await genreApi.create(currentGenre);
            }
            fetchGenres();
            handleCloseModal();
        } catch (err) {
            alert('Failed to save genre. ' + (err.response?.data?.message || ''));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this genre?')) {
            try {
                await genreApi.delete(id);
                fetchGenres();
            } catch (err) {
                alert('Failed to delete genre. ' + (err.response?.data?.message || ''));
            }
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Genres</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage movie categories and genres</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus size={18} /> Add New
                </button>
            </div>

            {error && <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">{error}</div>}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-y border-gray-200">
                            <th className="px-6 py-4 font-semibold text-sm text-gray-600">ID</th>
                            <th className="px-6 py-4 font-semibold text-sm text-gray-600">Name</th>
                            <th className="px-6 py-4 font-semibold text-sm text-gray-600">Description</th>
                            <th className="px-6 py-4 font-semibold text-sm text-gray-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {genres.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-gray-500">No genres found.</td>
                            </tr>
                        ) : (
                            genres.map((genre) => (
                                <tr key={genre.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-600">#{genre.id}</td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-full text-sm">
                                            {genre.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">{genre.description}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-3">
                                            <button 
                                                onClick={() => handleOpenModal(genre)}
                                                className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(genre.id)}
                                                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                                                title="Delete"
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
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {isEditing ? 'Edit Genre' : 'Add New Genre'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        value={currentGenre.name}
                                        onChange={(e) => setCurrentGenre({...currentGenre, name: e.target.value})}
                                        placeholder="e.g. Action, Comedy"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea 
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        rows="3"
                                        value={currentGenre.description || ''}
                                        onChange={(e) => setCurrentGenre({...currentGenre, description: e.target.value})}
                                        placeholder="Brief description about this genre..."
                                    ></textarea>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-sm transition-colors"
                                >
                                    {isEditing ? 'Save Changes' : 'Create Genre'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenreManagement;
