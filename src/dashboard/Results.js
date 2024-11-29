import { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, message, Spin, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { db, auth } from '../config/firebaseConfig';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [subject, setSubject] = useState('');
  const [marks, setMarks] = useState('');
  const [grade, setGrade] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [editingResult, setEditingResult] = useState(null);
  const [adminEmail, setAdminEmail] = useState('');

  // Function to fetch data from Firestore
  const fetchResults = () => {
    const resultsCollection = collection(db, 'results');
    const unsubscribe = onSnapshot(resultsCollection, (snapshot) => {
      const resultList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setResults(resultList);
      setLoading(false);
    });
    return unsubscribe;
  };

  // Use useEffect to fetch results and handle authentication state
  useEffect(() => {
    const unsubscribe = fetchResults();

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAdminEmail(user.email);
      }
    });

    return () => {
      unsubscribe();
      authUnsubscribe();
    };
  }, []);

  // Check if a result for the student already exists by email
  const checkIfResultExists = async (email) => {
    const resultsCollection = collection(db, 'results');
    const q = query(resultsCollection, where('studentEmail', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  // Handle adding a new result
  const handleUpload = async () => {
    if (!studentName || !subject || !marks || !grade || !studentEmail) {
      message.error(
        'Please fill all fields: student name, subject, marks, grade, and email!'
      );
      return;
    }

    setLoading(true);
    try {
      const resultExists = await checkIfResultExists(studentEmail);
      if (resultExists) {
        message.error('Results already added for this email.');
        setLoading(false);
        return;
      }

      const newResult = {
        studentName,
        subject,
        marks,
        grade,
        studentEmail,
        timestamp: new Date(),
      };

      await addDoc(collection(db, 'results'), newResult);

      message.success('Result added successfully!');
      resetModalState();
    } catch (error) {
      message.error('Error adding result: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle editing a result
  const openEditModal = (result) => {
    setEditingResult(result);
    setStudentName(result.studentName);
    setSubject(result.subject);
    setMarks(result.marks);
    setGrade(result.grade);
    setStudentEmail(result.studentEmail);
    setIsModalVisible(true);
  };

  const handleEditSave = async () => {
    if (
      !studentName.trim() ||
      !subject.trim() ||
      !marks.trim() ||
      !grade.trim() ||
      !studentEmail.trim()
    ) {
      message.error('All fields must be filled!');
      return;
    }

    try {
      const resultRef = doc(db, 'results', editingResult.id);
      await updateDoc(resultRef, {
        studentName,
        subject,
        marks,
        grade,
        studentEmail,
      });

      setResults((prevResults) =>
        prevResults.map((result) =>
          result.id === editingResult.id
            ? { ...result, studentName, subject, marks, grade, studentEmail }
            : result
        )
      );

      message.success('Result updated successfully!');
      resetModalState();
    } catch (error) {
      message.error('Error updating result: ' + error.message);
    }
  };

  // Handle deleting a result
  const handleDelete = async (resultId) => {
    try {
      await deleteDoc(doc(db, 'results', resultId));
      setResults((prevResults) =>
        prevResults.filter((result) => result.id !== resultId)
      );
      message.success('Result deleted successfully!');
    } catch (error) {
      message.error('Error deleting result: ' + error.message);
    }
  };

  // Reset modal state
  const resetModalState = () => {
    setIsModalVisible(false);
    setEditingResult(null);
    setStudentName('');
    setSubject('');
    setMarks('');
    setGrade('');
    setStudentEmail('');
  };

  // Table columns
  const columns = [
    { title: 'Student Name', dataIndex: 'studentName', key: 'studentName' },
    { title: 'Subject', dataIndex: 'subject', key: 'subject' },
    { title: 'Marks', dataIndex: 'marks', key: 'marks' },
    { title: 'Grade', dataIndex: 'grade', key: 'grade' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Edit
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            className="hover:bg-red-700"
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-4 min-h-screen bg-gradient-to-tr from-green-300 via-blue-400 to-purple-600">
      {/* Header Section */}
      <div className="flex justify-between items-center bg-gray-800 shadow-lg p-4 rounded-lg">
        <h2 className="text-xl font-semibold text-white">Results Management</h2>
        <Button
          type="primary"
          onClick={() => resetModalState() || setIsModalVisible(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold"
        >
          Add Result
        </Button>
      </div>

      {/* Table Section */}
      <Spin spinning={loading} tip="Loading Results...">
        <Table
          dataSource={results}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 6 }}
          className="bg-white rounded-lg shadow-lg"
        />
      </Spin>

      {/* Modal Section */}
      <Modal
        title={editingResult ? 'Edit Result' : 'Add Result'}
        open={isModalVisible}
        onCancel={resetModalState}
        onOk={editingResult ? handleEditSave : handleUpload}
        confirmLoading={loading}
        okText={editingResult ? 'Save Changes' : 'Add Result'}
        cancelText="Cancel"
      >
        <div className="space-y-4">
          <Input
            placeholder="Student Name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
          />
          <Input
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <Input
            placeholder="Marks"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
          />
          <Input
            placeholder="Grade"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          />
          <Input
            placeholder="Student Email"
            value={studentEmail}
            onChange={(e) => setStudentEmail(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Results;
