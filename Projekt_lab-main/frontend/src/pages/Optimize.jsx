import React, { useState, useRef, useEffect } from 'react'
import { computeRoute, createRoute, listOrders, listUsers, assignRoute, getSuitableCouriers } from '../services/api'

export default function Optimize(){
  useEffect(()=>{
    if (!document.getElementById('leaflet-css')){
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
  }, [])
  const [result, setResult] = useState(null)
  const [ordersList, setOrdersList] = useState([])
  const [selectedOrders, setSelectedOrders] = useState([])
  const [users, setUsers] = useState([])
  const [suitableCouriers, setSuitableCouriers] = useState([])
  const [loading, setLoading] = useState(false)
  const [courierId, setCourierId] = useState('')
  const [orderZones, setOrderZones] = useState(null)
  const [loadingZones, setLoadingZones] = useState(false)
  const mapRef = useRef(null)
  const leafletLayersRef = useRef({ markers: [], polyline: null })
  const scriptLoadedRef = useRef(false)

  // Load Leaflet runtime from CDN for map rendering
  useEffect(()=>{
    if (!document.getElementById('leaflet-js')){
      const s = document.createElement('script')
      s.id = 'leaflet-js'
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      s.async = true
      s.onload = ()=>{ scriptLoadedRef.current = true }
      document.body.appendChild(s)
    } else {
      scriptLoadedRef.current = true
    }
  }, [])

  async function run(){
    try{
      setLoading(true)
      if (selectedOrders.length === 0) {
        alert('Please select at least one order')
        setLoading(false)
        return
      }
      const payload = ordersList.filter(o=> selectedOrders.includes(o.id)).map(o=> ({id: o.id, address: o.address}))
      const res = await computeRoute(payload)
      setResult(res)
    }catch(e){ 
      setResult({error: e.message})
      alert('Compute error: ' + e.message)
    }
    finally{ setLoading(false) }
  }

  async function saveRoute(){
    if(!result) return alert('No result to save')
    try{
      if (selectedOrders.length > 0){
        const resp = await assignRoute(selectedOrders, courierId ? Number(courierId) : null, null)
        alert('Route created, assigned orders: ' + (resp.orders_assigned || 0))
        // Reload orders list to exclude assigned orders
        const o = await listOrders()
        setOrdersList(o)
        setSelectedOrders([])
        setResult(null)
        setCourierId('')
        setSuitableCouriers([])
        setOrderZones(null)
      } else {
        const path = result.optimal_order || result.order || []
        const orderIds = Array.isArray(path) ? path.map(p => (p && p.id) ? p.id : null).filter(Boolean) : []
        const payload = {
          courier_id: courierId ? Number(courierId) : null,
          date: new Date().toISOString(),
          total_orders: Array.isArray(path) ? path.length : 0,
          total_distance: Math.round((result.total_distance_km || result.distance_km || 0) * 1000),
          optimized_path: path,
          optimized_order_ids: orderIds,
          status: 'atdots kurjēram'
        }
        const saved = await createRoute(payload)
        alert('Route saved with id ' + (saved.id || 'unknown'))
        // Reload orders list to exclude assigned orders
        const o = await listOrders()
        setOrdersList(o)
        setSelectedOrders([])
        setResult(null)
        setCourierId('')
        setSuitableCouriers([])
        setOrderZones(null)
      }
    }catch(e){ alert('Save failed: ' + e.message) }
  }

  function renderMap(){
    return (
      <div style={{marginTop: '20px', marginBottom: '20px'}}>
        <h4>📍 Route Map (Real Road Path)</h4>
        <div id="opt-map" style={{height: 400, border: '2px solid #1976d2', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}} />
        <p style={{fontSize: '12px', color: '#666', marginTop: '8px'}}>Blue line shows the actual route following roads in Riga</p>
      </div>
    )
  }

  // Sync Leaflet map when a new result arrives
  useEffect(()=>{
    if (!result) return;
    if (!scriptLoadedRef.current || typeof window.L === 'undefined') return;

    const L = window.L
    
    // Use route_geometry for the line if available, otherwise fall back to points
    const routeGeometry = result.route_geometry;
    const coords = result && (result.coordinates || (result.optimal_order && result.optimal_order.map(p=>[p.lat,p.lng])) || result.ordered_points)
    if(!coords || coords.length === 0) return;
    const latlngs = coords.map(c => Array.isArray(c)?[c[0], c[1]]: [c[0], c[1]])

    // Create map instance once
    if (!mapRef.current){
      mapRef.current = L.map('opt-map').setView(latlngs[0], 12)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(mapRef.current)
    }

    const layers = leafletLayersRef.current
    if (layers.polyline){ mapRef.current.removeLayer(layers.polyline); layers.polyline = null }
    layers.markers.forEach(m=>mapRef.current.removeLayer(m)); layers.markers = []

    // Use route geometry if available (actual road route), otherwise use straight lines between points
    if (routeGeometry && routeGeometry.length > 0) {
      layers.polyline = L.polyline(routeGeometry, {color:'blue', weight: 4}).addTo(mapRef.current)
    } else {
      layers.polyline = L.polyline(latlngs, {color:'red'}).addTo(mapRef.current)
    }
    
    // Add markers for delivery points
    latlngs.forEach((p,i)=>{
      const m = L.marker(p).addTo(mapRef.current).bindPopup(`#${i+1}`)
      layers.markers.push(m)
    })

    try{ mapRef.current.fitBounds(latlngs, {padding:[20,20]}) }catch(e){}

  }, [result])

  // Load orders and couriers once on mount
  useEffect(()=>{
    (async ()=>{
      try{
        const o = await listOrders()
        setOrdersList(o)
      }catch(e){}
      try{
        const u = await listUsers()
        setUsers(u)
      }catch(e){}
    })()
  }, [])

  function toggleOrder(id){
    const newSelected = selectedOrders.includes(id) ? selectedOrders.filter(x=>x!==id) : [...selectedOrders, id]
    setSelectedOrders(newSelected)
    
    if (newSelected.length > 0) {
      loadSuitableCouriers(newSelected)
      loadOrderZones(newSelected)
    } else {
      setSuitableCouriers([])
      setOrderZones(null)
    }
  }

  async function loadOrderZones(orderIds) {
    try {
      setLoadingZones(true)
      const response = await fetch('http://127.0.0.1:8001/optimize/order-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_ids: orderIds })
      })
      const data = await response.json()
      setOrderZones(data)
    } catch (e) {
      console.error('Failed to load order zones:', e)
    } finally {
      setLoadingZones(false)
    }
  }

  async function loadSuitableCouriers(orderIds) {
    try {
      const result = await getSuitableCouriers(orderIds)
      setSuitableCouriers(result.suitable_couriers || [])
    } catch (e) {
      console.error('Failed to load suitable couriers:', e)
      setSuitableCouriers([])
    }
  }

  function generateGoogleMapsUrl(result) {
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
  }

  return (
    <div className="container" style={{maxWidth: '45%'}}>
      <h2>Route optimization</h2>
      
      <div style={{maxWidth: '600px', marginBottom: '12px'}}>
        <h4>Select Orders</h4>
        <div style={{maxHeight: '250px', overflow: 'auto', border: '1px solid #eee', padding: '8px', marginBottom: '12px'}}>
          {ordersList.length === 0 && <div>No orders available</div>}
          {ordersList.map(o => (
            <div key={o.id} style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
              <input 
                type="checkbox" 
                checked={selectedOrders.includes(o.id)} 
                onChange={() => toggleOrder(o.id)} 
              />
              <div style={{flex: 1}}>
                <div><strong>#{o.id}</strong> {o.address}</div>
                <div style={{fontSize: '12px', color: '#666'}}>Client: {o.client_id || '-'}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{marginBottom: '12px'}}>
          <label htmlFor="courier-select" style={{marginRight: '8px'}}>Assign to courier:</label>
          <select 
            id="courier-select"
            value={courierId} 
            onChange={(e) => setCourierId(e.target.value)}
            style={{padding: '6px'}}
          >
            <option value="">— choose courier —</option>
            {suitableCouriers.length > 0 && (
              <>
                <optgroup label="✓ Recommended Couriers">
                  {suitableCouriers.map(c => (
                    <option key={c.courier_id} value={c.courier_id}>
                      {c.username} ({c.car_number}) - {c.work_area_name}
                    </option>
                  ))}
                </optgroup>
              </>
            )}
            <optgroup label={suitableCouriers.length > 0 ? "Other Couriers" : "All Couriers"}>
              {users.filter(u => u.role === 'kurjers' && !suitableCouriers.find(sc => sc.courier_id === u.id)).map(u => (
                <option key={u.id} value={u.id}>{u.username || u.name || `User #${u.id}`}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {orderZones && orderZones.orders && orderZones.orders.length > 0 && (
          <div style={{marginBottom: '12px', padding: '10px', backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px'}}>
            <h5 style={{margin: '0 0 10px 0', color: '#333'}}>📍 Order Zones Information</h5>
            {orderZones.total_zones > 0 ? (
              <>
                <div style={{marginBottom: '8px', fontSize: '12px', color: '#666'}}>
                  <strong>Zones Involved:</strong> {orderZones.total_zones}
                  {Object.entries(orderZones.zones_involved).map(([zoneId, zoneName]) => (
                    <span key={zoneId} style={{marginLeft: '8px', display: 'inline-block', backgroundColor: '#e0e0e0', padding: '2px 8px', borderRadius: '12px', fontSize: '11px'}}>
                      {zoneName}
                    </span>
                  ))}
                </div>
                <div style={{fontSize: '12px', marginTop: '8px'}}>
                  {orderZones.orders.map((order, idx) => (
                    <div key={order.id} style={{marginBottom: '6px', paddingLeft: '8px', borderLeft: '3px solid', borderLeftColor: order.zone_color || '#999'}}>
                      <strong>#{order.id}</strong> {order.address}
                      <br/>
                      <span style={{backgroundColor: order.zone_color || '#999', color: 'white', padding: '2px 6px', borderRadius: '3px', fontSize: '10px', marginTop: '2px', display: 'inline-block'}}>
                        {order.zone_name}
                      </span>
                      {order.lat && order.lng && (
                        <span style={{marginLeft: '8px', fontSize: '10px', color: '#999'}}>
                          [{order.lat.toFixed(4)}, {order.lng.toFixed(4)}]
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{fontSize: '12px', color: '#d32f2f'}}>⚠ No zones found for selected addresses</div>
            )}
          </div>
        )}

        {suitableCouriers.length > 0 && (
          <div style={{marginBottom: '12px', padding: '8px', backgroundColor: '#e8f5e9', border: '1px solid #4caf50', borderRadius: '4px'}}>
            <h5 style={{margin: '0 0 8px 0', color: '#2e7d32'}}>✓ Recommended Couriers</h5>
            <div style={{fontSize: '12px'}}>
              {suitableCouriers.length} courier(s) with suitable workload and capacity
            </div>
            <div style={{fontSize: '12px', marginTop: '4px'}}>
              {suitableCouriers.map(c => (
                <div key={c.courier_id} style={{marginTop: '6px', paddingLeft: '8px', borderLeft: '3px solid #4caf50'}}>
                  <strong>{c.username}</strong> 
                  {c.work_area_name && <span style={{marginLeft: '8px', backgroundColor: '#c8e6c9', padding: '2px 6px', borderRadius: '3px', fontSize: '11px'}}>🗺️ {c.work_area_name}</span>}
                  {c.in_zone_count !== undefined && c.total_orders && (
                    <span style={{marginLeft: '8px', backgroundColor: c.in_zone_count === c.total_orders ? '#c8e6c9' : '#fff9c4', padding: '2px 6px', borderRadius: '3px', fontSize: '11px'}}>
                      📍 {c.in_zone_count}/{c.total_orders} in zone
                    </span>
                  )}
                  <br/>Car: {c.car_number} (Size: {c.car_size}m³, Weight: {c.car_weight}kg)
                  <br/>Routes today: {c.current_routes}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedOrders.length > 0 && suitableCouriers.length === 0 && (
          <div style={{marginBottom: '12px', padding: '8px', backgroundColor: '#fff3e0', border: '1px solid #ff9800', borderRadius: '4px'}}>
            <h5 style={{margin: '0 0 8px 0', color: '#e65100'}}>⚠ No Recommended Couriers</h5>
            <div style={{fontSize: '12px'}}>
              Selected orders may exceed courier capacity or workload limits. You can still assign manually.
            </div>
          </div>
        )}

        <div>
          <button 
            onClick={run} 
            disabled={loading || selectedOrders.length === 0}
            className="btn btn-primary"
          >
            {loading ? 'Computing...' : 'Calculate Route'}
          </button>
          <button 
            onClick={saveRoute}
            disabled={!result || result.error}
            className="btn btn-primary"
            style={{marginLeft: '8px'}}
          >
            Save & Assign
          </button>
        </div>
      </div>

      {result && result.error && (
        <div style={{color: 'red', marginBottom: '12px'}}>
          <strong>Error:</strong> {result.error}
        </div>
      )}

      {result && !result.error && (
        <div style={{marginBottom: '12px'}}>
          <h4>Calculation Result</h4>
          <p><strong>Distance (km):</strong> {((result.total_distance_km ?? result.distance_km ?? 0) || 0).toFixed(2)} km</p>
          <p><strong>Estimated Time:</strong> {result.estimated_time_minutes ? `${Math.floor(result.estimated_time_minutes / 60)}h ${result.estimated_time_minutes % 60}min` : '—'}</p>
          <p><strong>Order sequence:</strong> {result.optimal_order ? result.optimal_order.join(' → ') : result.order?.join(' → ') || '—'}</p>
          
          <div style={{marginTop: '16px', padding: '12px', backgroundColor: '#f0f7ff', border: '1px solid #2196f3', borderRadius: '6px'}}>
            <h5 style={{margin: '0 0 10px 0', color: '#1976d2'}}>🚗 Start Navigation</h5>
            <p style={{fontSize: '13px', color: '#666', marginBottom: '12px'}}>Open route in Google Maps:</p>
            <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
              {generateGoogleMapsUrl(result) && (
                <a 
                  href={generateGoogleMapsUrl(result)} 
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
                  <span style={{fontSize: '20px'}}>📍</span>
                  Open in Google Maps
                </a>
              )}
            </div>
            <p style={{fontSize: '11px', color: '#999', marginTop: '10px', marginBottom: 0}}>
              💡 Click to open the complete route with all delivery stops in Google Maps
            </p>
          </div>
        </div>
      )}

      {result && !result.error && renderMap()}
    </div>
  )
}
