import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AddStudent from './pages/AddStudent';
import UpdateStudent from './pages/UpdateStudent';
import MarkAttendance from './pages/MarkAttendance';
import DeleteStudent from './pages/DeleteStudent';
import SearchStudent from './pages/SearchStudent';
import Branch from './pages/Branch';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import Team from './pages/Team';
import Settings from './pages/Settings';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <AnimatePresence mode="wait">
                    <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add-student" element={<AddStudent />} />
          <Route path="/update-student" element={<UpdateStudent />} />
          <Route path="/mark-attendance" element={<MarkAttendance />} />
          <Route path="/delete-student" element={<DeleteStudent />} />
          <Route path="/search-student" element={<SearchStudent />} />
          <Route path="/branch" element={<Branch />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/team" element={<Team />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
  );
}

export default App; 