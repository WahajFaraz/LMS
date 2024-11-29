import { useState } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import HamburgerMenu from '../components/HamburgerMenu';
import {
  SolutionOutlined,
  PlusOutlined,
  LogoutOutlined,
  UserAddOutlined,
} from '@ant-design/icons';

import StudentRegistration from './StudentRegistration';
import CourseRegistration from './CourseRegistration';
import Result from './Results';
import TeacherRegistration from './TeacherRegistration';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { message, Typography } from 'antd';

const { Title, Text } = Typography;

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      message.success('Logged out successfully!');
      navigate('/');
    } catch (error) {
      message.error('Error logging out!');
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Sidebar */}
      <nav
        className={`${
          isSidebarOpen ? 'w-full' : 'hidden'
        } md:w-1/5 h-screen bg-gradient-to-b from-blue-600 to-purple-700 text-white flex flex-col items-center py-6 md:block`}
      >
        {/* Admin Profile */}
        <div className="flex flex-col items-center mb-8">
          <Title level={4} className="text-white">
            Admin Dashboard
          </Title>
        </div>

        {/* Sidebar Links */}
        <div className="space-y-6 w-full px-6">
          {[
            {
              name: 'Student Registration',
              icon: <UserAddOutlined />,
              path: 'student-registration',
            },
            {
              name: 'Course Registration',
              icon: <PlusOutlined />,
              path: 'course-registration',
            },
            {
              name: 'Teacher Registration',
              icon: <UserAddOutlined />,
              path: 'teacher-registration',
            },
            { name: 'Result', icon: <SolutionOutlined />, path: 'result' },
          ].map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center space-x-4 py-3 px-4 bg-white text-gray-800 rounded-lg shadow-md hover:bg-gray-100 transition duration-300"
              onClick={() => setIsSidebarOpen(false)}
            >
              {item.icon}
              <Text className="font-medium">{item.name}</Text>
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <div className="mt-auto w-full px-6">
          <button
            className="w-full flex items-center justify-center py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition duration-300 mt-6"
            onClick={handleLogout}
          >
            <LogoutOutlined className="mr-3 " />
            Logout
          </button>
        </div>
      </nav>

      {/* Hamburger Menu */}
      <div className="absolute top-4 left-4 md:hidden z-30">
        <HamburgerMenu isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      {/* Main Content */}
      <div className="w-full md:w-4/5 p-6 bg-gray-100 overflow-auto">
        <Routes>
          <Route
            path="student-registration"
            element={<StudentRegistration />}
          />
          <Route path="course-registration" element={<CourseRegistration />} />
          <Route path="result" element={<Result />} />
          <Route
            path="teacher-registration"
            element={<TeacherRegistration />}
          />
        </Routes>
      </div>
    </div>
  );
}
