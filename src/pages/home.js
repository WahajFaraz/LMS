import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../config/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Form, Input, Button, Typography, message, Card, Divider } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    const { email, password } = values;
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        message.error('No user found with this email.');
      } else {
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          const userType = userData.type;

          if (userType === 'admin') {
            message.success('Admin Login successful!');
            navigate('/dashboard');
          } else if (userType === 'student') {
            message.success('Student Login successful!');
            navigate('/student-dashboard');
          } else {
            message.error('Invalid user type.');
          }
        });
      }
    } catch (error) {
      console.error('Error during login:', error);
      message.error('Invalid email or password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
      <Card
        className="shadow-lg rounded-xl"
        style={{
          maxWidth: '400px',
          borderRadius: '12px',
          background: 'white',
        }}
      >
        <Title level={2} className="text-center text-blue-700">
          LMS User Login
        </Title>
        <Divider />
        <Form layout="vertical" onFinish={handleLogin} className="space-y-4">
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Please enter your email!' }]}
          >
            <Input
              prefix={<MailOutlined className="text-gray-400" />}
              placeholder="Enter your email"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Enter your password"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="bg-blue-700 hover:bg-blue-600 text-white font-semibold rounded-lg"
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
