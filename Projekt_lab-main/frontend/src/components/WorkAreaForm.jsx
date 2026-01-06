import React, { useState, useEffect } from 'react';
import '../styles.css';

export default function WorkAreaForm({ area, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    min_lat: '',
    max_lat: '',
    min_lng: '',
    max_lng: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (area) {
      setFormData({
        name: area.name,
        min_lat: area.min_lat || '',
        max_lat: area.max_lat || '',
        min_lng: area.min_lng || '',
        max_lng: area.max_lng || '',
      });
    }
  }, [area]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.name.length < 3) newErrors.name = 'Name must be at least 3 characters';
    
    // Optional validation: if one coordinate is provided, all should be provided
    const hasAnyCoordinate = formData.min_lat || formData.max_lat || formData.min_lng || formData.max_lng;
    if (hasAnyCoordinate) {
      if (!formData.min_lat) newErrors.min_lat = 'Min latitude is required when setting boundaries';
      if (!formData.max_lat) newErrors.max_lat = 'Max latitude is required when setting boundaries';
      if (!formData.min_lng) newErrors.min_lng = 'Min longitude is required when setting boundaries';
      if (!formData.max_lng) newErrors.max_lng = 'Max longitude is required when setting boundaries';
      
      if (formData.min_lat && formData.max_lat && parseFloat(formData.min_lat) >= parseFloat(formData.max_lat)) {
        newErrors.min_lat = 'Min latitude must be less than max latitude';
      }
      if (formData.min_lng && formData.max_lng && parseFloat(formData.min_lng) >= parseFloat(formData.max_lng)) {
        newErrors.min_lng = 'Min longitude must be less than max longitude';
      }
    }
    
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
      min_lat: formData.min_lat ? parseFloat(formData.min_lat) : null,
      max_lat: formData.max_lat ? parseFloat(formData.max_lat) : null,
      min_lng: formData.min_lng ? parseFloat(formData.min_lng) : null,
      max_lng: formData.max_lng ? parseFloat(formData.max_lng) : null,
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

        <h3>Zone Boundaries (Optional)</h3>
        
        <div className="form-group">
          <label htmlFor="min_lat">Min Latitude (SW Corner):</label>
          <input
            type="number"
            id="min_lat"
            name="min_lat"
            value={formData.min_lat}
            onChange={handleChange}
            step="0.000001"
            placeholder="e.g., 56.946285"
            className={errors.min_lat ? 'error' : ''}
          />
          {errors.min_lat && <span className="error-text">{errors.min_lat}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="max_lat">Max Latitude (NE Corner):</label>
          <input
            type="number"
            id="max_lat"
            name="max_lat"
            value={formData.max_lat}
            onChange={handleChange}
            step="0.000001"
            placeholder="e.g., 56.986285"
            className={errors.max_lat ? 'error' : ''}
          />
          {errors.max_lat && <span className="error-text">{errors.max_lat}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="min_lng">Min Longitude (SW Corner):</label>
          <input
            type="number"
            id="min_lng"
            name="min_lng"
            value={formData.min_lng}
            onChange={handleChange}
            step="0.000001"
            placeholder="e.g., 24.105078"
            className={errors.min_lng ? 'error' : ''}
          />
          {errors.min_lng && <span className="error-text">{errors.min_lng}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="max_lng">Max Longitude (NE Corner):</label>
          <input
            type="number"
            id="max_lng"
            name="max_lng"
            value={formData.max_lng}
            onChange={handleChange}
            step="0.000001"
            placeholder="e.g., 24.205078"
            className={errors.max_lng ? 'error' : ''}
          />
          {errors.max_lng && <span className="error-text">{errors.max_lng}</span>}
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
