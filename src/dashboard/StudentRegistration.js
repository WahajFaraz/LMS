// StudentRegistration.js
import React, { useEffect, useState } from 'react';
import { db, auth } from '../config/firebaseConfig';
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Table, Button, Modal, Input, message, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const AddStudent = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentImage, setStudentImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAdmin(user.email === 'admin@gmail.com'); // Replace with your admin email
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(
        snapshot.docs.map((doc, index) => ({
          id: doc.id,
          number: index + 1,
          ...doc.data(),
        }))
      );
    });
    return () => unsubscribe();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStudentImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addUser = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !studentImage) {
      message.warning('Please enter all fields including an image');
      return;
    }
    if (!isAdmin) {
      message.warning('You are not authorized to add users');
      return;
    }

    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        message.warning('This email is already registered');
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await addDoc(collection(db, 'users'), {
        name,
        email,
        password,
        image: studentImage,
        type: 'student',
        uid: user.uid,
      });

      message.success('User added successfully');
      resetForm();
    } catch (error) {
      console.error('Error adding user:', error);
      message.error('Failed to add user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user) => {
    setEditingUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPassword(user.password);
    setStudentImage(user.image);
    setIsEditModalOpen(true);
  };

  const editUser = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !studentImage) {
      message.warning('Please enter all fields including an image');
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', editingUserId);
      await updateDoc(userRef, { name, email, password, image: studentImage });
      message.success('User updated successfully');
      resetForm();
    } catch (error) {
      console.error('Error editing user:', error);
      message.error('Failed to edit user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      message.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Failed to delete user. Please try again.');
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setStudentImage(null);
    setEditingUserId(null);
    setIsModalOpen(false);
    setIsEditModalOpen(false);
  };

  const columns = [
    {
      title: 'Profile',
      dataIndex: 'image',
      key: 'image',
      render: (text) => (
        <img
          src={text}
          alt="Student Profile"
          className="w-12 h-12 rounded-full"
        />
      ),
    },
    { title: 'No.', dataIndex: 'number', key: 'number' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, user) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => openEditModal(user)}
          >
            Edit
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => deleteUser(user.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-4 min-h-screen bg-gradient-to-tr from-green-300 via-blue-400 to-purple-600">
      <div className="flex justify-between items-center bg-gray-800 shadow-lg p-4 rounded-lg">
        <h2 className="text-xl font-semibold text-white">
          Student Registration
        </h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Add User
        </Button>
      </div>
      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 6 }}
        className="bg-white rounded-lg shadow-lg"
      />
      <Modal
        title="Add New User"
        open={isModalOpen}
        onOk={addUser}
        onCancel={resetForm}
        confirmLoading={loading}
      >
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-3"
        />
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3"
        />
        <Input.Password
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-3"
        />
        <div>
          <label className="block mb-2">Profile Picture</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {studentImage && (
            <img
              src={studentImage}
              alt="Preview"
              className="mt-3 w-16 h-16 rounded-full"
            />
          )}
        </div>
      </Modal>
      <Modal
        title="Edit User"
        open={isEditModalOpen}
        onOk={editUser}
        onCancel={resetForm}
        confirmLoading={loading}
      >
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-3"
        />
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3"
        />
        <Input.Password
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-3"
        />
        <div>
          <label className="block mb-2">Profile Picture</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {studentImage && (
            <img
              src={studentImage}
              alt="Preview"
              className="mt-3 w-16 h-16 rounded-full"
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AddStudent;
