import React, { useState, useEffect } from 'react';
import '../styles.css';

export default function RouteForm({ route, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    courier_id: '',
    total_orders: '',
    total_distance: '',
    estimated_time_minutes: '',
    status: 'pending',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (route) {
      setFormData({
        courier_id: route.courier_id || '',
        total_orders: route.total_orders,
        total_distance: route.total_distance,
        estimated_time_minutes: route.estimated_time_minutes || '',
        status: route.status || 'pending',
      });
    }
  }, [route]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.total_orders || formData.total_orders <= 0) newErrors.total_orders = 'Total orders must be greater than 0';
    if (!formData.total_distance || formData.total_distance < 0) newErrors.total_distance = 'Total distance must be >= 0';
    if (!formData.estimated_time_minutes || formData.estimated_time_minutes < 0) newErrors.estimated_time_minutes = 'Estimated time must be >= 0';
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
      courier_id: formData.courier_id ? parseInt(formData.courier_id) : null,
      total_orders: parseInt(formData.total_orders),
      total_distance: parseInt(formData.total_distance),
      estimated_time_minutes: parseInt(formData.estimated_time_minutes) || 0,
      status: formData.status,
    });
  };

  return (
    <div className="form-container">
      <h2>{route ? 'Edit Route' : 'Add New Route'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="courier_id">Courier ID:</label>
          <input
            type="number"
            id="courier_id"
            name="courier_id"
            value={formData.courier_id}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>

        <div className="form-group">
          <label htmlFor="total_orders">Total Orders:</label>
          <input
            type="number"
            id="total_orders"
            name="total_orders"
            value={formData.total_orders}
            onChange={handleChange}
            className={errors.total_orders ? 'error' : ''}
          />
          {errors.total_orders && <span className="error-text">{errors.total_orders}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="total_distance">Total Distance (km):</label>
          <input
            type="number"
            id="total_distance"
            name="total_distance"
            value={formData.total_distance}
            onChange={handleChange}
            className={errors.total_distance ? 'error' : ''}
          />
          {errors.total_distance && <span className="error-text">{errors.total_distance}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="estimated_time_minutes">Estimated Time (minutes):</label>
          <input
            type="number"
            id="estimated_time_minutes"
            name="estimated_time_minutes"
            value={formData.estimated_time_minutes}
            onChange={handleChange}
            className={errors.estimated_time_minutes ? 'error' : ''}
          />
          {errors.estimated_time_minutes && <span className="error-text">{errors.estimated_time_minutes}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="status">Status:</label>
          <select id="status" name="status" value={formData.status} onChange={handleChange}>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {route ? 'Update Route' : 'Create Route'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
