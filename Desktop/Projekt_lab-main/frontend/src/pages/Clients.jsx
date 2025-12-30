import React, { useState, useEffect } from 'react';
import { listClients, createClient, updateClient, deleteClient } from '../services/api';
import ClientForm from '../components/ClientForm';
import '../styles.css';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await listClients();
      setClients(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  const handleEditClick = (client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingClient) {
        await updateClient(editingClient.id, formData);
        setSuccessMessage(`Client "${formData.name_surname}" updated successfully`);
      } else {
        await createClient(formData);
        setSuccessMessage(`Client "${formData.name_surname}" created successfully`);
      }
      setShowForm(false);
      setEditingClient(null);
      await fetchClients();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save client');
    }
  };

  const handleDeleteClick = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      await deleteClient(clientId);
      setSuccessMessage('Client deleted successfully');
      await fetchClients();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete client');
    }
  };

  return (
    <div className="container">
      <h1>Clients Management</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {!showForm ? (
        <>
          <button className="btn btn-primary" onClick={handleAddClick}>
            + Add New Client
          </button>

          {loading ? (
            <p>Loading clients...</p>
          ) : clients.length === 0 ? (
            <p>No clients found.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.id}</td>
                    <td>{client.name_surname}</td>
                    <td>{client.email}</td>
                    <td>{client.phone_number}</td>
                    <td>{client.address}</td>
                    <td>
                      <button
                        className="btn btn-small btn-edit"
                        onClick={() => handleEditClick(client)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-small btn-delete"
                        onClick={() => handleDeleteClick(client.id)}
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
        <ClientForm
          client={editingClient}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingClient(null);
          }}
        />
      )}
    </div>
  );
}
