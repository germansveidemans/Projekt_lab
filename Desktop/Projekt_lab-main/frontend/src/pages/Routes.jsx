import React, { useState, useEffect } from 'react';
import { listRoutes, createRoute, updateRoute, deleteRoute, getRoute, listOrders } from '../services/api';
import RouteForm from '../components/RouteForm';
import '../styles.css';

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const data = await listRoutes();
      setRoutes(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingRoute(null);
    setShowForm(true);
  };

  const handleEditClick = (route) => {
    setEditingRoute(route);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingRoute) {
        await updateRoute(editingRoute.id, formData);
        setSuccessMessage(`Route updated successfully`);
      } else {
        await createRoute(formData);
        setSuccessMessage(`Route created successfully`);
      }
      setShowForm(false);
      setEditingRoute(null);
      await fetchRoutes();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save route');
    }
  };

  const handleDeleteClick = async (routeId) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;
    try {
      await deleteRoute(routeId);
      setSuccessMessage('Route deleted successfully');
      await fetchRoutes();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete route');
    }
  };

  const handleViewClick = async (routeId) => {
    try {
      setLoading(true);
      const data = await getRoute(routeId);
      // enrich with order details when possible
      if (data && data.optimized_order_ids && Array.isArray(data.optimized_order_ids) && data.optimized_order_ids.length > 0) {
        try {
          const allOrders = await listOrders();
          const ordersMap = new Map(allOrders.map(o => [o.id, o]));
          data.orders_details = data.optimized_order_ids.map(id => ordersMap.get(id) || { id, address: 'unknown' });
        } catch (e) {
          data.orders_details = [];
        }
      }
      setSelectedRoute(data);
      setShowDetails(true);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch route details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Routes Management</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {!showForm ? (
        <>
          <button className="btn btn-primary" onClick={handleAddClick}>
            + Add New Route
          </button>

          {loading ? (
            <p>Loading routes...</p>
          ) : routes.length === 0 ? (
            <p>No routes found.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Courier</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Orders</th>
                  <th>Distance (km)</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => (
                  <tr key={route.id}>
                    <td>#{route.id}</td>
                    <td>{route.courier_name || route.courier_id || '-'}</td>
                    <td>{route.created_at ? new Date(route.created_at).toLocaleString() : '-'}</td>
                    <td>{route.status}</td>
                    <td>{route.total_orders}</td>
                    <td>{route.total_distance_km ? route.total_distance_km.toFixed(2) : (route.total_distance ? (route.total_distance / 1000).toFixed(2) : '-')} km</td>
                    <td>{route.estimated_time_display || route.estimated_time_minutes ? `${route.estimated_time_minutes || 0} min` : '-'}</td>
                    <td>
                      <button
                        className="btn btn-small btn-edit"
                        onClick={() => handleEditClick(route)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-small btn-view"
                        onClick={() => handleViewClick(route.id)}
                        style={{marginLeft: '6px'}}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-small btn-delete"
                        onClick={() => handleDeleteClick(route.id)}
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
        <RouteForm
          route={editingRoute}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingRoute(null);
          }}
        />
      )}

      {showDetails && selectedRoute && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Route #{selectedRoute.id} Details</h3>
            <p><strong>Status:</strong> {selectedRoute.status}</p>
            <p><strong>Courier:</strong> {selectedRoute.courier_id || '-'}</p>
            <p><strong>Date:</strong> {selectedRoute.date ? new Date(selectedRoute.date).toLocaleString() : '-'}</p>
            <p><strong>Distance:</strong> {selectedRoute.total_distance_km ? selectedRoute.total_distance_km.toFixed(2) : (selectedRoute.total_distance ? (selectedRoute.total_distance / 1000).toFixed(2) : '-')} km</p>
            <p><strong>Estimated Time:</strong> {selectedRoute.estimated_time_display || `${selectedRoute.estimated_time_minutes || 0} min`}</p>
            <p><strong>Optimized Order IDs:</strong> {selectedRoute.optimized_order_ids && Array.isArray(selectedRoute.optimized_order_ids) ? selectedRoute.optimized_order_ids.join(', ') : (selectedRoute.optimized_order_ids || '-')}</p>
            <p><strong>Optimized Path:</strong></p>
            {renderOptimizedPath(selectedRoute.optimized_path)}

            {selectedRoute.orders_details && selectedRoute.orders_details.length > 0 && (
              <>
                <p><strong>Order details:</strong></p>
                <ol className="route-path-list">
                  {selectedRoute.orders_details.map((o) => (
                    <li key={o.id}>{`#${o.id} — ${o.address || o.client_id || 'no address'}`}</li>
                  ))}
                </ol>
              </>
            )}

            <div style={{textAlign: 'right'}}>
              <button className="btn" onClick={() => setShowDetails(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderOptimizedPath(path) {
  let list = path;
  if (!list) return <p>No path available.</p>;
  if (!Array.isArray(list)) {
    try {
      list = JSON.parse(list);
    } catch (e) {
      list = [list];
    }
  }

  return (
    <ol className="route-path-list">
      {list.map((p, i) => (
        <li key={i}>
          {typeof p === 'object' ? JSON.stringify(p) : String(p)}
        </li>
      ))}
    </ol>
  );
}
