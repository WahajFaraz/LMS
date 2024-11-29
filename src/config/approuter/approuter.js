import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "../../pages/home";
import Dashboard from "../../dashboard/Dashboard"; 
import StudentDashboard from '../../dashboard/Student/StudentDashboard'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
