import React, { useState, useEffect } from 'react';
import '../styles.css';

export default function WorkAreaForm({ area, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (area) {
      setFormData({
        name: area.name,
      });
    }
  }, [area]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.name.length < 3) newErrors.name = 'Name must be at least 3 characters';
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
      name: formData.name,
    });
  };

  return (
    <div className="form-container">
      <h2>{area ? 'Edit Work Area' : 'Add New Work Area'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {area ? 'Update Work Area' : 'Create Work Area'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
