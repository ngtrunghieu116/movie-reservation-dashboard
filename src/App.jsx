import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GenreManagement from './pages/GenreManagement';
import MovieManagement from './pages/MovieManagement';
import TheaterManagement from './pages/TheaterManagement';
import RoomManagement from './pages/RoomManagement';
import ShowtimeManagement from './pages/ShowtimeManagement';
import UserManagement from './pages/UserManagement';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="genres" element={<GenreManagement />} />
          <Route path="movies" element={<MovieManagement />} />
          <Route path="theaters" element={<TheaterManagement />} />
          <Route path="showtimes" element={<ShowtimeManagement />} />
          <Route path="users" element={<UserManagement />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
