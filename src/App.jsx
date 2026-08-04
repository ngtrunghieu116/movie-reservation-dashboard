import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GenreManagement from './pages/GenreManagement';
import MovieManagement from './pages/MovieManagement';
import AdminProtectedRoute from './components/AdminProtectedRoute';

function App() {
  return (
    <BrowserRouter>
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
          <Route path="theaters" element={<div>Theater Management (To do)</div>} />
          <Route path="users" element={<div>User Management (To do)</div>} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
