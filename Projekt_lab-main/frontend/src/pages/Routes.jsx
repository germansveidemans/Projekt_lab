import React, { useState, useEffect } from 'react';
import { listRoutes, deleteRoute, completeRoute, getRoute, listOrders, listAllOrders } from '../services/api';
import RouteEditor from '../components/RouteEditor';
import '../styles.css';

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
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

  const handleEditClick = (route) => {
    setEditingRoute(route);
    setShowEditor(true);
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

  const handleCompleteClick = async (routeId) => {
    if (!window.confirm('Mark this route as completed? All orders will be marked as delivered.')) return;
    try {
      await completeRoute(routeId);
      setSuccessMessage('Route completed successfully. All orders marked as delivered.');
      await fetchRoutes();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to complete route');
    }
  };

  const handleViewClick = async (routeId) => {
    try {
      setLoading(true);
      const data = await getRoute(routeId);
      // enrich with order details when possible
      if (data && data.optimized_order_ids && Array.isArray(data.optimized_order_ids) && data.optimized_order_ids.length > 0) {
        try {
          const allOrders = await listAllOrders();
          const ordersMap = new Map(allOrders.map(o => [o.id, o]));
          data.orders_details = data.optimized_order_ids.map(id => ordersMap.get(id) || { id, address: 'unknown' });
        } catch (e) {
          console.error('Failed to load order details:', e);
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

  const generateGoogleMapsUrlFromRoute = (route) => {
    // Try multiple sources for addresses
    let addresses = [];
    
    // First try: orders_details
    if (route && route.orders_details && route.orders_details.length > 0) {
      addresses = route.orders_details
        .filter(o => o && o.address && o.address !== 'unknown')
        .map(o => o.address);
    }
    
    // Second try: optimized_path
    if (addresses.length === 0 && route && route.optimized_path) {
      let path = route.optimized_path;
      if (typeof path === 'string') {
        try {
          path = JSON.parse(path);
        } catch (e) {
          path = [path];
        }
      }
      if (Array.isArray(path)) {
        addresses = path
          .filter(p => p && typeof p === 'string' && p !== 'unknown')
          .map(p => p);
      }
    }
    
    console.log('[Google Maps] Found addresses:', addresses);
    
    if (addresses.length < 1) return null;
    
    // Encode addresses
    const encodedAddresses = addresses.map(a => encodeURIComponent(a));
    
    if (encodedAddresses.length === 1) {
      // Single address - just open it
      return `https://www.google.com/maps/search/?api=1&query=${encodedAddresses[0]}`;
    }
    
    // Multiple addresses - create route
    const origin = encodedAddresses[0];
    const destination = encodedAddresses[encodedAddresses.length - 1];
    const waypoints = encodedAddresses.slice(1, -1).join('|');
    
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }
    
    return url;
  };

  return (
    <>
      {showEditor ? (
        <div style={{ maxWidth: '95%', margin: '0 auto', padding: '20px', background: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.12)' }}>
          <RouteEditor
            route={editingRoute}
            onSave={async () => {
              setShowEditor(false);
              setEditingRoute(null);
              setSuccessMessage('Route updated successfully');
              await fetchRoutes();
              setTimeout(() => setSuccessMessage(''), 3000);
            }}
            onCancel={() => {
              setShowEditor(false);
              setEditingRoute(null);
            }}
          />
        </div>
      ) : (
        <div className="container">
          <h1>Routes Management</h1>

          {error && <div className="alert alert-error">{error}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}

          {loading ? (
            <p>Loading routes...</p>
          ) : routes.length === 0 ? (
            <p>No routes found. Create routes on the Optimize page.</p>
          ) : (
            <div style={{overflowX: 'auto', width: '100%'}}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Courier</th>
                  <th>Created</th>
                  <th>Delivery Date</th>
                  <th>Status</th>
                  <th>Orders</th>
                  <th>Distance (km)</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => (
                  <tr 
                    key={route.id}
                    style={{
                      backgroundColor: route.status === 'pabeigts' ? 'rgba(76, 175, 80, 0.08)' : 'transparent',
                      borderLeft: route.status === 'pabeigts' ? '4px solid #4caf50' : 'none'
                    }}
                  >
                    <td style={{fontWeight: route.status === 'pabeigts' ? '600' : 'normal'}}>#{route.id}</td>
                    <td>{route.courier_name || route.courier_id || '-'}</td>
                    <td style={{fontSize: '13px'}}>{route.created_at ? new Date(route.created_at).toLocaleString() : '-'}</td>
                    <td style={{fontSize: '13px', fontWeight: '500', color: '#1976d2'}}>
                      {route.delivery_date ? new Date(route.delivery_date).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'}) : '-'}
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: route.status === 'pabeigts' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(33, 150, 243, 0.15)',
                        color: route.status === 'pabeigts' ? '#2e7d32' : '#1565c0'
                      }}>
                        {route.status === 'pabeigts' ? '✓ ' : ''}{route.status}
                      </span>
                    </td>
                    <td>{route.total_orders}</td>
                    <td>{route.total_distance_km ? route.total_distance_km.toFixed(2) : (route.total_distance ? (route.total_distance / 1000).toFixed(2) : '-')} km</td>
                    <td>{route.estimated_time_display || route.estimated_time_minutes ? `${route.estimated_time_minutes || 0} min` : '-'}</td>
                    <td>
                      <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
                        <button
                          className="btn btn-small btn-view"
                          onClick={() => handleViewClick(route.id)}
                          title="View route details"
                        >
                          👁️ View
                        </button>
                        <button
                          className="btn btn-small btn-edit"
                          onClick={() => handleEditClick(route)}
                          title="Edit route"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-small"
                          onClick={() => handleCompleteClick(route.id)}
                          style={{
                            backgroundColor: route.status === 'pabeigts' ? '#9e9e9e' : '#4caf50', 
                            color: 'white',
                            cursor: route.status === 'pabeigts' ? 'not-allowed' : 'pointer',
                            opacity: route.status === 'pabeigts' ? 0.6 : 1
                          }}
                          disabled={route.status === 'pabeigts'}
                          title={route.status === 'pabeigts' ? 'Already completed' : 'Mark as completed'}
                        >
                          ✓ Complete
                        </button>
                        <button
                          className="btn btn-small btn-delete"
                          onClick={() => handleDeleteClick(route.id)}
                          title="Delete route"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}

          {showDetails && selectedRoute && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Route #{selectedRoute.id} Details</h3>
            <p><strong>Status:</strong> {selectedRoute.status}</p>
            <p><strong>Courier:</strong> {selectedRoute.courier_id || '-'}</p>
            <p><strong>Created:</strong> {selectedRoute.created_at ? new Date(selectedRoute.created_at).toLocaleString() : '-'}</p>
            <p><strong>Delivery Date:</strong> <span style={{color: '#1976d2', fontWeight: '500'}}>{selectedRoute.delivery_date ? new Date(selectedRoute.delivery_date).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'}) : '-'}</span></p>
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

            {(() => {
              const mapsUrl = generateGoogleMapsUrlFromRoute(selectedRoute);
              console.log('[View Modal] Google Maps URL:', mapsUrl);
              console.log('[View Modal] Selected Route:', selectedRoute);
              
              if (mapsUrl) {
                return (
                  <div style={{ marginTop: '16px', marginBottom: '16px', padding: '12px', backgroundColor: '#f0f7ff', border: '1px solid #2196f3', borderRadius: '6px' }}>
                    <h5 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>🚗 Start Navigation</h5>
                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>Open this route in Google Maps:</p>
                    <a 
                      href={mapsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        backgroundColor: '#4285f4',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontSize: '15px',
                        fontWeight: '500',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#357ae8';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#4285f4';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>📍</span>
                      Open in Google Maps
                    </a>
                    <p style={{ fontSize: '11px', color: '#999', marginTop: '10px', marginBottom: 0 }}>
                      💡 Click to open the complete route with all delivery stops in Google Maps
                    </p>
                  </div>
                );
              } else {
                // Show debug info if URL couldn't be generated
                return (
                  <div style={{ marginTop: '16px', marginBottom: '16px', padding: '12px', backgroundColor: '#fff3e0', border: '1px solid #ff9800', borderRadius: '6px' }}>
                    <p style={{ fontSize: '13px', color: '#666' }}>⚠️ Google Maps link not available (check console for details)</p>
                  </div>
                );
              }
            })()}

            <div style={{textAlign: 'right'}}>
              <button className="btn" onClick={() => setShowDetails(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
        </div>
      )}
    </>
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
