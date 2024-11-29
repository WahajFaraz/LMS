import React, { useState, useEffect } from 'react';
import { db } from '../config/firebaseConfig';
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { Table, Button, Input, message, Modal, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const TeacherRegistration = () => {
  const [teachers, setTeachers] = useState([]);
  const [teacherName, setTeacherName] = useState('');
  const [teacherDesignation, setTeacherDesignation] = useState('');
  const [teacherImage, setTeacherImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'teachers'), (snapshot) => {
      setTeachers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setDataLoading(false);
    });

    return () => {
      setDataLoading(true);
      unsubscribe();
    };
  }, []);

  const handleTeacherSubmit = async () => {
    if (!teacherName.trim() || !teacherDesignation.trim() || !teacherImage) {
      message.warning('Please enter all required fields including an image');
      return;
    }

    setLoading(true);
    try {
      if (editingTeacherId) {
        const teacherRef = doc(db, 'teachers', editingTeacherId);
        await updateDoc(teacherRef, {
          name: teacherName,
          designation: teacherDesignation,
          image: teacherImage,
        });
        message.success('Teacher updated successfully');
      } else {
        await addDoc(collection(db, 'teachers'), {
          name: teacherName,
          designation: teacherDesignation,
          image: teacherImage,
        });
        message.success('Teacher added successfully');
      }
      resetForm();
    } catch (error) {
      console.error('Error submitting teacher:', error);
      message.error('Failed to submit teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (teacher) => {
    setTeacherName(teacher.name);
    setTeacherDesignation(teacher.designation);
    setTeacherImage(teacher.image);
    setEditingTeacherId(teacher.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (teacherId) => {
    try {
      await deleteDoc(doc(db, 'teachers', teacherId));
      message.success('Teacher deleted successfully');
    } catch (error) {
      message.error('Failed to delete teacher');
    }
  };

  const resetForm = () => {
    setTeacherName('');
    setTeacherDesignation('');
    setTeacherImage(null);
    setEditingTeacherId(null);
    setIsModalOpen(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTeacherImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const columns = [
    {
      title: 'Profile',
      dataIndex: 'image',
      key: 'image',
      render: (text) => (
        <img
          src={text}
          alt="Teacher Profile"
          className="w-12 h-12 rounded-full"
        />
      ),
    },
    { title: 'Teacher Name', dataIndex: 'name', key: 'name' },
    { title: 'Designation', dataIndex: 'designation', key: 'designation' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleEdit(record)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Edit
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => handleDelete(record.id)}
            className="hover:bg-red-700"
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
          Teacher Registration
        </h2>
        <Button
          icon={<PlusOutlined />}
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-green-600 font-semibold text-white hover:bg-green-700"
        >
          Add Teacher
        </Button>
      </div>
      <Spin spinning={dataLoading} tip="Loading Teachers...">
        <Table
          dataSource={teachers}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 6 }}
          className="bg-white rounded-lg shadow-lg"
        />
      </Spin>
      <Modal
        title={editingTeacherId ? 'Edit Teacher' : 'Add New Teacher'}
        open={isModalOpen}
        onOk={handleTeacherSubmit}
        onCancel={resetForm}
        okText={editingTeacherId ? 'Save Changes' : 'Add Teacher'}
        confirmLoading={loading}
      >
        <div className="space-y-4">
          <Input
            placeholder="Teacher Name"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            className="mb-3"
          />
          <Input
            placeholder="Teacher Designation"
            value={teacherDesignation}
            onChange={(e) => setTeacherDesignation(e.target.value)}
            className="mb-3"
          />
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Profile Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
            />
            {teacherImage && (
              <img
                src={teacherImage}
                alt="Preview"
                className="mt-3 w-16 h-16 rounded-full"
              />
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeacherRegistration;
