import React, { useState, useEffect } from 'react';
import '../styles.css';

export default function RouteForm({ route, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    work_time: '',
    date: '',
    total_orders: '',
    total_distance: '',
    status: 'atdots kurjēram',
    courier_id: '',
    optimized_path: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (route) {
      setFormData({
        work_time: route.work_time,
        date: route.date ? route.date.split('T')[0] : '',
        total_orders: route.total_orders,
        total_distance: route.total_distance,
        status: route.status,
        courier_id: route.courier_id || '',
        optimized_path: route.optimized_path || '',
      });
    }
  }, [route]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.work_time || formData.work_time <= 0) newErrors.work_time = 'Work time must be greater than 0';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.total_orders || formData.total_orders <= 0) newErrors.total_orders = 'Total orders must be greater than 0';
    if (!formData.total_distance || formData.total_distance < 0) newErrors.total_distance = 'Total distance must be >= 0';
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
      work_time: parseInt(formData.work_time),
      date: formData.date,
      total_orders: parseInt(formData.total_orders),
      total_distance: parseFloat(formData.total_distance),
      status: formData.status,
      courier_id: formData.courier_id ? parseInt(formData.courier_id) : null,
      optimized_path: formData.optimized_path || null,
    });
  };

  return (
    <div className="form-container">
      <h2>{route ? 'Edit Route' : 'Add New Route'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="work_time">Work Time (hours):</label>
          <input
            type="number"
            id="work_time"
            name="work_time"
            value={formData.work_time}
            onChange={handleChange}
            className={errors.work_time ? 'error' : ''}
          />
          {errors.work_time && <span className="error-text">{errors.work_time}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="date">Date:</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={errors.date ? 'error' : ''}
          />
          {errors.date && <span className="error-text">{errors.date}</span>}
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
            step="0.1"
            className={errors.total_distance ? 'error' : ''}
          />
          {errors.total_distance && <span className="error-text">{errors.total_distance}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="status">Status:</label>
          <select id="status" name="status" value={formData.status} onChange={handleChange}>
            <option value="atdots kurjēram">atdots kurjēram</option>
            <option value="izskatīšanā">izskatīšanā</option>
          </select>
        </div>

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
          <label htmlFor="optimized_path">Optimized Path:</label>
          <input
            type="text"
            id="optimized_path"
            name="optimized_path"
            value={formData.optimized_path}
            onChange={handleChange}
            placeholder="Optional (JSON format)"
          />
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
