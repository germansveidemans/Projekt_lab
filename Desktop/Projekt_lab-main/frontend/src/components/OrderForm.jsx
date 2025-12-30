import React, { useState, useEffect } from 'react';
import '../styles.css';

export default function OrderForm({ order, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    sequence: '',
    size: '',
    weight: '',
    route_id: '',
    client_id: '',
    address: '',
    expected_delivery_time: '',
    route_status: 'gatavs',
    actual_delivery_time: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (order) {
      setFormData({
        sequence: order.sequence,
        size: order.size,
        weight: order.weight,
        route_id: order.route_id || '',
        client_id: order.client_id || '',
        address: order.address || '',
        expected_delivery_time: order.expected_delivery_time || '',
        route_status: order.route_status,
        actual_delivery_time: order.actual_delivery_time || '',
      });
    }
  }, [order]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.sequence || formData.sequence <= 0) newErrors.sequence = 'Sequence must be greater than 0';
    if (!formData.size || formData.size <= 0) newErrors.size = 'Size must be greater than 0';
    if (!formData.weight || formData.weight <= 0) newErrors.weight = 'Weight must be greater than 0';
    if (!formData.expected_delivery_time) newErrors.expected_delivery_time = 'Expected delivery time is required';
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
      sequence: parseInt(formData.sequence),
      size: parseInt(formData.size),
      weight: parseInt(formData.weight),
      route_id: formData.route_id ? parseInt(formData.route_id) : null,
      client_id: formData.client_id ? parseInt(formData.client_id) : null,
      address: formData.address,
      expected_delivery_time: formData.expected_delivery_time,
      route_status: formData.route_status,
      actual_delivery_time: formData.actual_delivery_time || null,
    });
  };

  return (
    <div className="form-container">
      <h2>{order ? 'Edit Order' : 'Add New Order'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="sequence">Sequence:</label>
          <input
            type="number"
            id="sequence"
            name="sequence"
            value={formData.sequence}
            onChange={handleChange}
            className={errors.sequence ? 'error' : ''}
          />
          {errors.sequence && <span className="error-text">{errors.sequence}</span>}
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
          <label htmlFor="route_status">Status:</label>
          <select id="route_status" name="route_status" value={formData.route_status} onChange={handleChange}>
            <option value="gatavs">gatavs</option>
            <option value="progresā">progresā</option>
            <option value="atcelts">atcelts</option>
            <option value="izskatīšanā">izskatīšanā</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="expected_delivery_time">Expected Delivery Time:</label>
          <input
            type="datetime-local"
            id="expected_delivery_time"
            name="expected_delivery_time"
            value={formData.expected_delivery_time}
            onChange={handleChange}
            className={errors.expected_delivery_time ? 'error' : ''}
          />
          {errors.expected_delivery_time && <span className="error-text">{errors.expected_delivery_time}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="route_id">Route ID:</label>
          <input
            type="number"
            id="route_id"
            name="route_id"
            value={formData.route_id}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>

        <div className="form-group">
          <label htmlFor="client_id">Client ID:</label>
          <input
            type="number"
            id="client_id"
            name="client_id"
            value={formData.client_id}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Address:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>

        <div className="form-group">
          <label htmlFor="actual_delivery_time">Actual Delivery Time:</label>
          <input
            type="datetime-local"
            id="actual_delivery_time"
            name="actual_delivery_time"
            value={formData.actual_delivery_time}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {order ? 'Update Order' : 'Create Order'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
