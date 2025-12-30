import React, { useState, useEffect } from 'react';
import '../styles.css';

export default function UserForm({ user, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user',
    work_area_id: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        password: user.password,
        role: user.role,
        work_area_id: user.work_area_id || '',
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (formData.password.length < 4) newErrors.password = 'Password must be at least 4 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit({
      username: formData.username,
      password: formData.password,
      role: formData.role,
      work_area_id: formData.work_area_id ? parseInt(formData.work_area_id) : null,
    });
  };

  return (
    <div className="form-container">
      <h2>{user ? 'Edit User' : 'Add New User'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={errors.username ? 'error' : ''}
          />
          {errors.username && <span className="error-text">{errors.username}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? 'error' : ''}
          />
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="role">Role:</label>
          <select id="role" name="role" value={formData.role} onChange={handleChange}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="work_area_id">Work Area ID:</label>
          <input
            type="number"
            id="work_area_id"
            name="work_area_id"
            value={formData.work_area_id}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {user ? 'Update User' : 'Create User'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
