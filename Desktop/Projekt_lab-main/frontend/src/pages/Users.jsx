import React, { useState, useEffect } from 'react';
import { listUsers, createUser, updateUser, deleteUser } from '../services/api';
import UserForm from '../components/UserForm';
import '../styles.css';

export default function Users() {
  console.log('📄 Users.jsx mounted')
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    console.log('🔄 Users useEffect running')
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listUsers();
      setUsers(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Error: ${err.message}. Make sure backend is running at http://127.0.0.1:8001`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData);
        setSuccessMessage(`User "${formData.username}" updated successfully`);
      } else {
        await createUser(formData);
        setSuccessMessage(`User "${formData.username}" created successfully`);
      }
      setShowForm(false);
      setEditingUser(null);
      await fetchUsers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save user');
    }
  };

  const handleDeleteClick = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(userId);
      setSuccessMessage('User deleted successfully');
      await fetchUsers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  return (
    <div className="container">
      <h1>Users Management</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {!showForm ? (
        <>
          <button className="btn btn-primary" onClick={handleAddClick}>
            + Add New User
          </button>

          {loading ? (
            <p>Loading users...</p>
          ) : users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Work Area ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.role}</td>
                    <td>
                      {user.work_area_id ? (
                        <span style={{
                          backgroundColor: user.role === 'kurjers' ? '#e8f5e9' : '#e3f2fd',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          Zone #{user.work_area_id}
                        </span>
                      ) : (
                        <span style={{color: '#999'}}>No zone</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-small btn-edit"
                        onClick={() => handleEditClick(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-small btn-delete"
                        onClick={() => handleDeleteClick(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      ) : (
        <UserForm
          user={editingUser}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
}
