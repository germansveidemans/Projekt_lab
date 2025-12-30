import React, { useState, useEffect } from 'react';
import '../styles.css';

export default function CarForm({ car, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    vehicle_number: '',
    size: '',
    weight: '',
    user_id: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (car) {
      setFormData({
        vehicle_number: car.vehicle_number,
        size: car.size,
        weight: car.weight,
        user_id: car.user_id || '',
      });
    }
  }, [car]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.vehicle_number.trim()) newErrors.vehicle_number = 'Vehicle number is required';
    if (!formData.size || formData.size <= 0) newErrors.size = 'Size must be greater than 0';
    if (!formData.weight || formData.weight <= 0) newErrors.weight = 'Weight must be greater than 0';
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
      vehicle_number: formData.vehicle_number,
      size: parseInt(formData.size),
      weight: parseInt(formData.weight),
      user_id: formData.user_id ? parseInt(formData.user_id) : null,
    });
  };

  return (
    <div className="form-container">
      <h2>{car ? 'Edit Car' : 'Add New Car'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="vehicle_number">Vehicle Number:</label>
          <input
            type="text"
            id="vehicle_number"
            name="vehicle_number"
            value={formData.vehicle_number}
            onChange={handleChange}
            className={errors.vehicle_number ? 'error' : ''}
          />
          {errors.vehicle_number && <span className="error-text">{errors.vehicle_number}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="size">Size:</label>
          <input
            type="number"
            id="size"
            name="size"
            value={formData.size}
            onChange={handleChange}
            className={errors.size ? 'error' : ''}
          />
          {errors.size && <span className="error-text">{errors.size}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="weight">Weight:</label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            className={errors.weight ? 'error' : ''}
          />
          {errors.weight && <span className="error-text">{errors.weight}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="user_id">User ID:</label>
          <input
            type="number"
            id="user_id"
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {car ? 'Update Car' : 'Create Car'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
