import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Signup from './components/Signup';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import UserDashboard from './components/UserDashboard';
import BarPage from './components/Bars/BarPage';
import ManageEmployees from './components/Employees/ManageEmployees'; // New import
import ManageQueue from './components/Queue/ManageQueue'; // New import
import QueuePage from './components/Queue/QueuePage'; // New import
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './AuthContext';
import Profile from './components/Users/Profile';
import WaitingPage from './components/Queue/WaitingPage'
import VenueProfile from './components/Queue/VenueProfile'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-dashboard" element={<ProtectedRoute element={AdminDashboard} />} />
        <Route path="/employee-dashboard" element={<ProtectedRoute element={EmployeeDashboard} />} />
        <Route path="/user-dashboard" element={<ProtectedRoute element={UserDashboard} />} />
        <Route path="/bar/:barId" element={<ProtectedRoute element={BarPage} />} />
        <Route path="/bar/:barId/manage-employees" element={<ProtectedRoute element={ManageEmployees} />} /> {/* New route */}
        <Route path="/bar/:barId/manage-queue" element={<ProtectedRoute element={ManageQueue} />} /> {/* New route */}
        <Route path="/queue/waiting/:barId" element={<WaitingPage />} />
        <Route path="/venue/:barId" element={<VenueProfile />} />
        <Route path="/bar/:barId/queue" element={<ProtectedRoute element={QueuePage} />} /> {/* New route */}
        <Route path="/profile" element={<ProtectedRoute element={Profile} />} /> 
      </Routes>
    </AuthProvider>
  );
}

export default App;

