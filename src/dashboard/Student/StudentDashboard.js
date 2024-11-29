import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Table,
  Button,
  message,
  Card,
  Avatar,
  Row,
  Col,
  Input,
  Empty,
  Spin,
} from 'antd';
import { db, auth } from '../../config/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const { Sider, Content } = Layout;

const StudentDashboard = () => {
  const [results, setResults] = useState([]);
  const [studentEmail, setStudentEmail] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentPhoto, setStudentPhoto] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [isSearch, setIsSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  const fetchResults = async (email) => {
    setLoading(true);
    try {
      const resultsCollection = collection(db, 'results');
      const resultsQuery = query(
        resultsCollection,
        where('studentEmail', '==', email)
      );
      const snapshot = await getDocs(resultsQuery);
      const resultList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setResults(resultList);
    } catch (error) {
      message.error('Error fetching results!');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      message.success('Logged out successfully!');
      navigate('/');
    } catch (error) {
      message.error('Error logging out: ' + error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setStudentEmail(user.email);
        setStudentName(user.displayName || 'Student');
        setStudentPhoto(user.photoURL);

        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', user.email));
        const userSnapshot = await getDocs(q);

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setStudentName(userData.name);
          setStudentPhoto(userData.photoURL);
        }
      } else {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSearchChange = (e) => setSearchEmail(e.target.value);

  const handleSearch = () => {
    if (searchEmail) {
      setResults([]);
      setIsSearch(true);
      fetchResults(searchEmail);
      setSearchEmail('');
    } else {
      message.warning('Please enter an email to search!');
    }
  };

  const columns = [
    { title: 'Student Name', dataIndex: 'studentName', key: 'studentName' },
    { title: 'Subject', dataIndex: 'subject', key: 'subject' },
    { title: 'Marks', dataIndex: 'marks', key: 'marks' },
    { title: 'Grade', dataIndex: 'grade', key: 'grade' },
  ];

  return (
    <Layout className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sider
        width={250}
        className={`bg-gradient-to-b from-gray-900 to-gray-500 text-white ${
          visible ? 'block' : 'hidden'
        } md:block fixed md:relative z-50 shadow-lg`}
        breakpoint="md"
        collapsedWidth="0"
        onBreakpoint={(broken) => setVisible(!broken)}
      >
        <div className="p-6 text-center">
          <Avatar
            src={
              studentPhoto || 'https://www.w3schools.com/w3images/avatar2.png'
            }
            size={80}
            className="mb-4 shadow-md border-2 border-gray-200"
          />
          <h1 className="text-lg font-bold">{studentName}</h1>
          <p className="text-gray-400">{studentEmail}</p>
        </div>
        <Menu
          theme="none"
          mode="inline"
          className="mt-4 rounded-md"
          items={[
            {
              label: (
                <button
                  onClick={handleLogout}
                  className="w-full text-white text-center bg-red-600 hover:bg-red-500 rounded-md py-2 font-medium"
                >
                  Logout
                </button>
              ),
              key: 'logout',
            },
          ]}
        />
      </Sider>

      {/* Main Content */}
      <Layout>
        <Content className="p-6">
          <Card
            title={
              <div className="flex flex-col items-center py-5">
                <span className="text-xl font-bold text-gray-700">
                  Welcome to Your Dashboard ;
                </span>
                <button
                  onClick={handleLogout}
                  className="md:hidden text-white my-4 bg-red-600 hover:bg-red-500 rounded-md py-1 px-3"
                >
                  Logout
                </button>
              </div>
            }
            className="rounded-lg shadow-lg bg-white"
          >
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={8}>
                <h2 className="text-lg font-semibold text-center text-gray-700">
                  Welcome, {studentName}!
                </h2>
                <p className="text-gray-500 text-center">
                  Email: {studentEmail}
                </p>
              </Col>
              <Col xs={24} md={16}>
                <div className="flex items-center space-x-4 ">
                  <Input
                    placeholder="Enter student email to search"
                    value={searchEmail}
                    onChange={handleSearchChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm"
                  />
                  <Button
                    className="bg-green-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-green-700 shadow-md"
                    onClick={handleSearch}
                  >
                    Search
                  </Button>
                </div>
              </Col>
            </Row>
          </Card>
          {loading ? (
            <div className="text-center mt-10">
              <Spin size="large" />
            </div>
          ) : isSearch && results.length === 0 ? (
            <div className="text-center mt-10">
              <Empty description="No results found" />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={results}
              rowKey="id"
              pagination={false}
              className="mt-6 rounded-lg shadow-lg border"
            />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default StudentDashboard;
