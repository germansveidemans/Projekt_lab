import React, { useState, useEffect } from 'react';
import { listCars, createCar, updateCar, deleteCar } from '../services/api';
import CarForm from '../components/CarForm';
import '../styles.css';

export default function Cars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const data = await listCars();
      setCars(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch cars');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingCar(null);
    setShowForm(true);
  };

  const handleEditClick = (car) => {
    setEditingCar(car);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingCar) {
        await updateCar(editingCar.id, formData);
        setSuccessMessage(`Car "${formData.vehicle_number}" updated successfully`);
      } else {
        await createCar(formData);
        setSuccessMessage(`Car "${formData.vehicle_number}" created successfully`);
      }
      setShowForm(false);
      setEditingCar(null);
      await fetchCars();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save car');
    }
  };

  const handleDeleteClick = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;
    try {
      await deleteCar(carId);
      setSuccessMessage('Car deleted successfully');
      await fetchCars();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete car');
    }
  };

  return (
    <div className="container">
      <h1>Cars Management</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {!showForm ? (
        <>
          <button className="btn btn-primary" onClick={handleAddClick}>
            + Add New Car
          </button>

          {loading ? (
            <p>Loading cars...</p>
          ) : cars.length === 0 ? (
            <p>No cars found.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vehicle Number</th>
                  <th>Size</th>
                  <th>Weight</th>
                  <th>User ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car.id}>
                    <td>{car.id}</td>
                    <td>{car.vehicle_number}</td>
                    <td>{car.size}</td>
                    <td>{car.weight}</td>
                    <td>{car.user_id || '-'}</td>
                    <td>
                      <button
                        className="btn btn-small btn-edit"
                        onClick={() => handleEditClick(car)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-small btn-delete"
                        onClick={() => handleDeleteClick(car.id)}
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
        <CarForm
          car={editingCar}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingCar(null);
          }}
        />
      )}
    </div>
  );
}
