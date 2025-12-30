import React, { useState, useEffect } from 'react';
import { listOrders, createOrder, updateOrder, deleteOrder, listClients } from '../services/api';
import OrderForm from '../components/OrderForm';
import '../styles.css';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersData, clientsData] = await Promise.all([listOrders(), listClients()]);
      setOrders(ordersData);
      setClients(clientsData);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name_surname : 'Unknown';
  };

  const handleViewClick = (order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const handleAddClick = () => {
    setEditingOrder(null);
    setShowForm(true);
  };

  const handleEditClick = (order) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingOrder) {
        await updateOrder(editingOrder.id, formData);
        setSuccessMessage(`Order updated successfully`);
      } else {
        await createOrder(formData);
        setSuccessMessage(`Order created successfully`);
      }
      setShowForm(false);
      setEditingOrder(null);
      await fetchData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save order');
    }
  };

  const handleDeleteClick = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await deleteOrder(orderId);
      setSuccessMessage('Order deleted successfully');
      await fetchData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete order');
    }
  };

  return (
    <div className="container">
      <h1>Orders Management</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {!showForm ? (
        <>
          <button className="btn btn-primary" onClick={handleAddClick}>
            + Add New Order
          </button>

          {loading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Address</th>
                  <th>Size / Weight</th>
                  <th>Expected Delivery</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{getClientName(order.client_id)}</td>
                    <td>{order.address || '-'}</td>
                    <td>{order.size}kg / {order.weight}m³</td>
                    <td>{order.expected_delivery_time ? new Date(order.expected_delivery_time).toLocaleString() : '-'}</td>
                    <td><strong>{order.route_status}</strong></td>
                    <td>
                      <button
                        className="btn btn-small btn-view"
                        onClick={() => handleViewClick(order)}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-small btn-edit"
                        onClick={() => handleEditClick(order)}
                        style={{marginLeft: '6px'}}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-small btn-delete"
                        onClick={() => handleDeleteClick(order.id)}
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
        <OrderForm
          order={editingOrder}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingOrder(null);
          }}
        />
      )}

      {showDetails && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Order #{selectedOrder.id} Details</h3>
            <p><strong>Client:</strong> {getClientName(selectedOrder.client_id)}</p>
            <p><strong>Address:</strong> {selectedOrder.address || '-'}</p>
            <p><strong>Size:</strong> {selectedOrder.size} kg</p>
            <p><strong>Weight:</strong> {selectedOrder.weight} m³</p>
            <p><strong>Expected Delivery:</strong> {selectedOrder.expected_delivery_time ? new Date(selectedOrder.expected_delivery_time).toLocaleString() : '-'}</p>
            <p><strong>Status:</strong> {selectedOrder.route_status}</p>
            {selectedOrder.actual_delivery_time && (
              <p><strong>Actual Delivery:</strong> {new Date(selectedOrder.actual_delivery_time).toLocaleString()}</p>
            )}
            <p><strong>Created:</strong> {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : '-'}</p>
            <div style={{textAlign: 'right', marginTop: '12px'}}>
              <button className="btn" onClick={() => setShowDetails(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
