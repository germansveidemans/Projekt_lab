import React, { useState, useEffect } from 'react';
import { listWorkAreas, createWorkArea, updateWorkArea, deleteWorkArea } from '../services/api';
import WorkAreaForm from '../components/WorkAreaForm';
import '../styles.css';

export default function WorkAreas() {
  const [workAreas, setWorkAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchWorkAreas();
  }, []);

  const fetchWorkAreas = async () => {
    try {
      setLoading(true);
      const data = await listWorkAreas();
      setWorkAreas(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch work areas');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingArea(null);
    setShowForm(true);
  };

  const handleEditClick = (area) => {
    setEditingArea(area);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingArea) {
        await updateWorkArea(editingArea.id, formData);
        setSuccessMessage(`Work area "${formData.name}" updated successfully`);
      } else {
        await createWorkArea(formData);
        setSuccessMessage(`Work area "${formData.name}" created successfully`);
      }
      setShowForm(false);
      setEditingArea(null);
      await fetchWorkAreas();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save work area');
    }
  };

  const handleDeleteClick = async (areaId) => {
    if (!window.confirm('Are you sure you want to delete this work area?')) return;
    try {
      await deleteWorkArea(areaId);
      setSuccessMessage('Work area deleted successfully');
      await fetchWorkAreas();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete work area');
    }
  };

  return (
    <div className="container">
      <h1>Work Areas Management</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {!showForm ? (
        <>
          <button className="btn btn-primary" onClick={handleAddClick}>
            + Add New Work Area
          </button>

          {loading ? (
            <p>Loading work areas...</p>
          ) : workAreas.length === 0 ? (
            <p>No work areas found.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workAreas.map((area) => (
                  <tr key={area.id}>
                    <td>{area.id}</td>
                    <td>{area.name}</td>
                    <td>
                      <button
                        className="btn btn-small btn-edit"
                        onClick={() => handleEditClick(area)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-small btn-delete"
                        onClick={() => handleDeleteClick(area.id)}
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
        <WorkAreaForm
          area={editingArea}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingArea(null);
          }}
        />
      )}
    </div>
  );
}
