import React, { useState, useEffect } from 'react';
import { db } from '../config/firebaseConfig'; // Firebase Firestore
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore'; // Firestore methods
import { Table, Button, message, Modal, Spin, Form, Input } from 'antd'; // Ant Design components
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const CourseRegistration = () => {
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form] = Form.useForm();

  // Fetch courses from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'courses'), (snapshot) => {
      setCourses(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setTableLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveCourse = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (editingCourse) {
        await updateDoc(doc(db, 'courses', editingCourse.id), {
          name: values.courseName,
          duration: values.courseDuration,
          timing: values.courseTiming,
        });
        message.success('Course updated successfully');
      } else {
        await addDoc(collection(db, 'courses'), {
          name: values.courseName,
          duration: values.courseDuration,
          timing: values.courseTiming,
        });
        message.success('Course added successfully');
      }

      form.resetFields();
      setIsModalOpen(false);
      setEditingCourse(null);
    } catch (error) {
      console.error('Error saving course:', error);
      message.error('Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      await deleteDoc(doc(db, 'courses', courseId));
      message.success('Course deleted successfully');
    } catch (error) {
      console.error('Error deleting course:', error);
      message.error('Failed to delete course');
    }
  };

  const handleEdit = (record) => {
    setEditingCourse(record);
    form.setFieldsValue({
      courseName: record.name,
      courseDuration: record.duration,
      courseTiming: record.timing,
    });
    setIsModalOpen(true);
  };

  const columns = [
    { title: 'Course Name', dataIndex: 'name', key: 'name' },
    { title: 'Duration', dataIndex: 'duration', key: 'duration' },
    { title: 'Timing', dataIndex: 'timing', key: 'timing' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="primary"
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => deleteCourse(record.id)}
            type="primary"
            danger
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
      {/* Navbar */}
      <div className="flex justify-between items-center bg-gray-800 shadow-lg p-4 rounded-lg">
        <h2 className="text-xl font-semibold text-white">
          Course Registration
        </h2>
        <Button
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields();
            setEditingCourse(null);
            setIsModalOpen(true);
          }}
          type="primary"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold"
        >
          Add Course
        </Button>
      </div>

      {/* Courses Table */}
      <Spin spinning={tableLoading} tip="Loading courses...">
        <Table
          dataSource={courses}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 6 }}
          className="bg-white rounded-lg shadow-lg"
        />
      </Spin>

      {/* Modal */}
      <Modal
        title={editingCourse ? 'Edit Course' : 'Add New Course'}
        open={isModalOpen}
        onOk={saveCourse}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={loading}
        okText={editingCourse ? 'Update' : 'Add'}
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            courseName: '',
            courseDuration: '',
            courseTiming: '',
          }}
        >
          <Form.Item
            label="Course Name"
            name="courseName"
            rules={[
              { required: true, message: 'Please input the course name!' },
            ]}
          >
            <Input placeholder="Enter course name" />
          </Form.Item>
          <Form.Item
            label="Course Duration"
            name="courseDuration"
            rules={[
              { required: true, message: 'Please input the course duration!' },
            ]}
          >
            <Input placeholder="Enter course duration" />
          </Form.Item>
          <Form.Item
            label="Course Timing"
            name="courseTiming"
            rules={[
              { required: true, message: 'Please input the course timing!' },
            ]}
          >
            <Input placeholder="Enter course timing" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseRegistration;
