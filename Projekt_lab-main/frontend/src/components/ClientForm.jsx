import React, { useState, useEffect } from 'react';
import '../styles.css';

export default function ClientForm({ client, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name_surname: '',
    email: '',
    address: '',
    phone_number: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (client) {
      setFormData({
        name_surname: client.name_surname,
        email: client.email,
        address: client.address,
        phone_number: client.phone_number,
      });
    }
  }, [client]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name_surname.trim()) newErrors.name_surname = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
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
      name_surname: formData.name_surname,
      email: formData.email,
      address: formData.address,
      phone_number: formData.phone_number,
    });
  };

  return (
    <div className="form-container">
      <h2>{client ? 'Edit Client' : 'Add New Client'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name_surname">Name:</label>
          <input
            type="text"
            id="name_surname"
            name="name_surname"
            value={formData.name_surname}
            onChange={handleChange}
            className={errors.name_surname ? 'error' : ''}
          />
          {errors.name_surname && <span className="error-text">{errors.name_surname}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="phone_number">Phone Number:</label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            className={errors.phone_number ? 'error' : ''}
          />
          {errors.phone_number && <span className="error-text">{errors.phone_number}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="address">Address:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={errors.address ? 'error' : ''}
          />
          {errors.address && <span className="error-text">{errors.address}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {client ? 'Update Client' : 'Create Client'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
