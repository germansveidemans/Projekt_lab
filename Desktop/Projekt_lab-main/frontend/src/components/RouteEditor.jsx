import React, { useState, useEffect, useRef } from 'react';
import { listAllOrders, listUsers, getSuitableCouriers, computeRoute, updateRoute } from '../services/api';
import '../styles.css';

export default function RouteEditor({ route, onSave, onCancel }) {
  const [availableOrders, setAvailableOrders] = useState([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [courierId, setCourierId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [users, setUsers] = useState([]);
  const [suitableCouriers, setSuitableCouriers] = useState([]);
  const [orderZones, setOrderZones] = useState(null);
  const [loadingZones, setLoadingZones] = useState(false);
  const [recalculatedRoute, setRecalculatedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);
  const leafletLayersRef = useRef({ markers: [], polyline: null });
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Load Leaflet if needed
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('leaflet-js')) {
      const s = document.createElement('script');
      s.id = 'leaflet-js';
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.async = true;
      s.onload = () => { scriptLoadedRef.current = true; };
      document.body.appendChild(s);
    } else {
      scriptLoadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (route) {
      setSelectedOrderIds(route.optimized_order_ids || []);
      setCourierId(route.courier_id || '');
      setDeliveryDate(route.delivery_date || '');
    }
  }, [route]);

  useEffect(() => {
    if (selectedOrderIds.length > 0) {
      loadSuitableCouriers(selectedOrderIds);
      loadOrderZones(selectedOrderIds);
    } else {
      setSuitableCouriers([]);
      setOrderZones(null);
    }
  }, [selectedOrderIds]);

  // Render map when recalculated route is updated
  useEffect(() => {
    if (recalculatedRoute && !recalculatedRoute.error) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        renderMap(recalculatedRoute);
      }, 100);
    }
  }, [recalculatedRoute]);

  const loadData = async () => {
    try {
      const [ordersData, usersData] = await Promise.all([
        listAllOrders(), // Use listAllOrders to get all orders including assigned ones
        listUsers()
      ]);
      setAvailableOrders(ordersData);
      setUsers(usersData);
    } catch (e) {
      console.error('Failed to load data:', e);
    }
  };

  async function loadOrderZones(orderIds) {
    try {
      setLoadingZones(true);
      const response = await fetch('http://127.0.0.1:8001/optimize/order-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_ids: orderIds })
      });
      const data = await response.json();
      setOrderZones(data);
    } catch (e) {
      console.error('Failed to load order zones:', e);
    } finally {
      setLoadingZones(false);
    }
  }

  async function loadSuitableCouriers(orderIds) {
    try {
      const result = await getSuitableCouriers(orderIds);
      setSuitableCouriers(result.suitable_couriers || []);
    } catch (e) {
      console.error('Failed to load suitable couriers:', e);
      setSuitableCouriers([]);
    }
  }

  const toggleOrder = (orderId) => {
    setSelectedOrderIds(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleRecalculate = async () => {
    if (selectedOrderIds.length === 0) {
      alert('Please select at least one order');
      return;
    }

    try {
      setLoading(true);
      const payload = availableOrders
        .filter(o => selectedOrderIds.includes(o.id))
        .map(o => ({ id: o.id, address: o.address }));
      
      console.log('[RouteEditor] Recalculating route for orders:', payload);
      console.log('[RouteEditor] Selected order IDs:', selectedOrderIds);
      console.log('[RouteEditor] Number of orders:', payload.length);
      
      const res = await computeRoute(payload);
      console.log('[RouteEditor] Recalculation result:', res);
      
      setRecalculatedRoute(res);
    } catch (e) {
      console.error('[RouteEditor] Recalculation error:', e);
      alert('Recalculation error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderMap = (result) => {
    if (!result || !scriptLoadedRef.current || typeof window.L === 'undefined') return;

    const L = window.L;
    
    // Use route_geometry for the line if available, otherwise fall back to points
    const routeGeometry = result.route_geometry;
    const coords = result.coordinates || (result.optimal_order && result.optimal_order.map(p => [p.lat, p.lng])) || result.ordered_points;
    
    if (!coords || coords.length === 0) return;
    
    const latlngs = coords.map(c => Array.isArray(c) ? [c[0], c[1]] : [c[0], c[1]]);

    if (!mapRef.current) {
      mapRef.current = L.map('route-edit-map').setView(latlngs[0], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    const layers = leafletLayersRef.current;
    if (layers.polyline) { mapRef.current.removeLayer(layers.polyline); layers.polyline = null; }
    layers.markers.forEach(m => mapRef.current.removeLayer(m)); layers.markers = [];

    // Use route geometry if available (actual road route), otherwise use straight lines between points
    if (routeGeometry && routeGeometry.length > 0) {
      layers.polyline = L.polyline(routeGeometry, { color: 'blue', weight: 4 }).addTo(mapRef.current);
    } else {
      layers.polyline = L.polyline(latlngs, { color: 'red' }).addTo(mapRef.current);
    }
    
    // Add markers for delivery points
    latlngs.forEach((p, i) => {
      const m = L.marker(p).addTo(mapRef.current).bindPopup(`#${i + 1}`);
      layers.markers.push(m);
    });

    try { mapRef.current.fitBounds(latlngs, { padding: [20, 20] }); } catch (e) { }
  };

  const generateGoogleMapsUrl = (result) => {
    if (!result || !result.ordered_points || result.ordered_points.length < 2) return null;
    
    const points = result.ordered_points;
    const origin = `${points[0][0]},${points[0][1]}`;
    const destination = `${points[points.length - 1][0]},${points[points.length - 1][1]}`;
    
    // Waypoints are all points between origin and destination
    const waypoints = points.slice(1, -1).map(p => `${p[0]},${p[1]}`).join('|');
    
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }
    
    return url;
  };

  const handleSave = async () => {
    try {
      // Build optimized_order_ids and optimized_path from recalculated route or current selection
      let optimizedOrderIds = selectedOrderIds;
      let optimizedPath = [];
      
      if (recalculatedRoute && recalculatedRoute.optimal_order) {
        optimizedOrderIds = recalculatedRoute.optimal_order;
      }
      
      // Build path from selected orders
      optimizedPath = optimizedOrderIds.map(id => {
        const order = availableOrders.find(o => o.id === id);
        return order?.address || `Order #${id}`;
      });

      const updatedData = {
        courier_id: courierId ? Number(courierId) : null,
        total_orders: selectedOrderIds.length,
        total_distance: recalculatedRoute 
          ? Math.round((recalculatedRoute.total_distance_km || recalculatedRoute.distance_km || 0) * 1000)
          : route.total_distance,
        estimated_time_minutes: recalculatedRoute?.estimated_time_minutes || route.estimated_time_minutes || 0,
        optimized_order_ids: optimizedOrderIds,
        optimized_path: optimizedPath,
        status: route.status,
        delivery_date: deliveryDate || null,
      };

      await updateRoute(route.id, updatedData);
      
      // Update order statuses
      // Remove "progresā" status from orders that were removed from route
      const removedOrders = (route.optimized_order_ids || []).filter(id => !selectedOrderIds.includes(id));
      for (const orderId of removedOrders) {
        try {
          const order = availableOrders.find(o => o.id === orderId);
          if (order) {
            await fetch(`http://127.0.0.1:8001/orders/${orderId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                size: order.size,
                weight: order.weight,
                client_id: order.client_id,
                address: order.address,
                expected_delivery_time: order.expected_delivery_time,
                route_status: 'gatavs'
              })
            });
          }
        } catch (e) {
          console.error('Failed to update removed order status:', e);
        }
      }

      // Add "progresā" status to newly added orders
      const addedOrders = selectedOrderIds.filter(id => !(route.optimized_order_ids || []).includes(id));
      for (const orderId of addedOrders) {
        try {
          const order = availableOrders.find(o => o.id === orderId);
          if (order) {
            await fetch(`http://127.0.0.1:8001/orders/${orderId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                size: order.size,
                weight: order.weight,
                client_id: order.client_id,
                address: order.address,
                expected_delivery_time: order.expected_delivery_time,
                route_status: 'progresā'
              })
            });
          }
        } catch (e) {
          console.error('Failed to update added order status:', e);
        }
      }

      onSave();
    } catch (e) {
      alert('Save failed: ' + e.message);
    }
  };

  // Show all orders: current route orders + available orders (gatavs status)
  const currentRouteOrderIds = route?.optimized_order_ids || [];
  const ordersList = availableOrders;

  return (
    <div className="route-editor">
      <h2>Edit Route #{route?.id}</h2>
      
      <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h3>Available Orders</h3>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
            Select orders to include in this route
          </p>
          <div style={{ maxHeight: '400px', overflow: 'auto', border: '1px solid #eee', padding: '8px' }}>
            {ordersList.length === 0 && <p>No orders available</p>}
            {ordersList.map(o => {
              const isInCurrentRoute = currentRouteOrderIds.includes(o.id);
              const isAssignedToOther = o.route_status === 'progresā' && !isInCurrentRoute;
              return (
                <div 
                  key={o.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '8px',
                    opacity: isAssignedToOther ? 0.5 : 1,
                    backgroundColor: isInCurrentRoute ? '#e3f2fd' : 'transparent',
                    padding: '4px',
                    borderRadius: '4px'
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={selectedOrderIds.includes(o.id)} 
                    onChange={() => toggleOrder(o.id)}
                    disabled={isAssignedToOther}
                  />
                  <div style={{ flex: 1 }}>
                    <div>
                      <strong>#{o.id}</strong> {o.address}
                      {isAssignedToOther && <span style={{ marginLeft: '8px', fontSize: '11px', color: '#999' }}>(assigned to another route)</span>}
                      {isInCurrentRoute && <span style={{ marginLeft: '8px', fontSize: '11px', color: '#1976d2', fontWeight: 'bold' }}>✓ In route</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Size: {o.size}, Weight: {o.weight} | Status: {o.route_status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3>Courier Assignment & Delivery Date</h3>
          <select 
            value={courierId} 
            onChange={(e) => setCourierId(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '12px' }}
          >
            <option value="">— choose courier —</option>
            {suitableCouriers.length > 0 && (
              <optgroup label="✓ Recommended Couriers">
                {suitableCouriers.map(c => (
                  <option key={c.courier_id} value={c.courier_id}>
                    {c.username} ({c.car_number}) - {c.work_area_name}
                  </option>
                ))}
              </optgroup>
            )}
            <optgroup label={suitableCouriers.length > 0 ? "⚠ Other Couriers (may exceed workload)" : "All Couriers"}>
              {users.filter(u => u.role === 'kurjers' && !suitableCouriers.find(sc => sc.courier_id === u.id)).map(u => (
                <option key={u.id} value={u.id}>{u.username || `User #${u.id}`}</option>
              ))}
            </optgroup>
          </select>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
              📅 Delivery Date:
            </label>
            <input 
              type="date" 
              value={deliveryDate} 
              onChange={(e) => setDeliveryDate(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          {orderZones && orderZones.orders && orderZones.orders.length > 0 && (
            <div style={{ padding: '10px', backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '12px' }}>
              <h5 style={{ margin: '0 0 10px 0' }}>📍 Order Zones</h5>
              <div style={{ fontSize: '12px' }}>
                <strong>Zones:</strong> {orderZones.total_zones}
                {Object.entries(orderZones.zones_involved).map(([zoneId, zoneName]) => (
                  <span key={zoneId} style={{ marginLeft: '8px', backgroundColor: '#e0e0e0', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', display: 'inline-block' }}>
                    {zoneName}
                  </span>
                ))}
              </div>
            </div>
          )}

          {suitableCouriers.length > 0 && (
            <div style={{ padding: '8px', backgroundColor: '#e8f5e9', border: '1px solid #4caf50', borderRadius: '4px', marginBottom: '12px' }}>
              <h5 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>✓ Recommended Couriers</h5>
              <div style={{ fontSize: '12px' }}>
                {suitableCouriers.length} courier(s) available with suitable workload and capacity
              </div>
            </div>
          )}

          {selectedOrderIds.length > 0 && suitableCouriers.length === 0 && (
            <div style={{ padding: '8px', backgroundColor: '#fff3e0', border: '1px solid #ff9800', borderRadius: '4px', marginBottom: '12px' }}>
              <h5 style={{ margin: '0 0 8px 0', color: '#e65100' }}>⚠ No Recommended Couriers</h5>
              <div style={{ fontSize: '12px' }}>
                Selected orders may exceed courier capacity or workload limits. You can still assign manually.
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleRecalculate}
          disabled={loading || selectedOrderIds.length === 0}
          className="btn btn-primary"
          style={{ marginRight: '8px' }}
        >
          {loading ? 'Calculating...' : 'Recalculate Route'}
        </button>
        
        {recalculatedRoute && !recalculatedRoute.error && (
          <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
            <h4>New Route Calculation</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '12px' }}>
              <div>
                <h5 style={{ margin: '0 0 8px 0', color: '#666' }}>Original Route</h5>
                <p><strong>Orders:</strong> {route?.total_orders || 0}</p>
                <p><strong>Distance:</strong> {route?.total_distance ? (route.total_distance / 1000).toFixed(2) : route?.total_distance_km?.toFixed(2) || '0'} km</p>
                <p><strong>Time:</strong> {route?.estimated_time_minutes ? `${Math.floor(route.estimated_time_minutes / 60)}h ${route.estimated_time_minutes % 60}min` : '—'}</p>
              </div>
              <div>
                <h5 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>New Calculation</h5>
                <p><strong>Orders:</strong> {selectedOrderIds.length}</p>
                <p><strong>Distance:</strong> {((recalculatedRoute.total_distance_km ?? recalculatedRoute.distance_km ?? 0) || 0).toFixed(2)} km</p>
                <p><strong>Time:</strong> {recalculatedRoute.estimated_time_minutes ? `${Math.floor(recalculatedRoute.estimated_time_minutes / 60)}h ${recalculatedRoute.estimated_time_minutes % 60}min` : '—'}</p>
              </div>
            </div>
            <p><strong>Optimized delivery sequence:</strong></p>
            <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
              {(recalculatedRoute.optimal_order || recalculatedRoute.order || []).map((orderId, idx) => {
                const order = availableOrders.find(o => o.id === orderId);
                return (
                  <li key={orderId} style={{ marginBottom: '4px' }}>
                    <strong>#{orderId}</strong> - {order?.address || 'Unknown address'}
                  </li>
                );
              })}
            </ol>
            
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f0f7ff', border: '1px solid #2196f3', borderRadius: '6px' }}>
              <h5 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>🚗 Start Navigation</h5>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>Open route in Google Maps:</p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {generateGoogleMapsUrl(recalculatedRoute) && (
                  <a 
                    href={generateGoogleMapsUrl(recalculatedRoute)} 
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
                )}
              </div>
              <p style={{ fontSize: '11px', color: '#999', marginTop: '10px', marginBottom: 0 }}>
                💡 Click to open the complete route with all delivery stops in Google Maps
              </p>
            </div>
          </div>
        )}
        
        {recalculatedRoute && recalculatedRoute.error && (
          <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#ffebee', borderRadius: '4px', color: '#c62828' }}>
            <h4>Calculation Error</h4>
            <p>{recalculatedRoute.error}</p>
          </div>
        )}
      </div>

      {recalculatedRoute && !recalculatedRoute.error && (
        <div style={{ marginBottom: '20px', marginTop: '20px' }}>
          <h4>📍 Route Map (Real Road Path)</h4>
          <div id="route-edit-map" style={{ height: '450px', border: '2px solid #1976d2', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
          <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Blue line shows the actual route following roads in Riga. Markers show delivery points in optimal order.</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        <button onClick={handleSave} className="btn btn-primary">
          Save Changes
        </button>
        <button onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </div>
  );
}
