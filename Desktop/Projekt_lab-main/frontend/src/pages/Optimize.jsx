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
  const [routeImage, setRouteImage] = useState(null)
  const html2canvasLoadedRef = useRef(false)

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

  // Load html2canvas to capture map snapshots
  useEffect(() => {
    if (!document.getElementById('html2canvas-js')){
      const s = document.createElement('script')
      s.id = 'html2canvas-js'
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
      s.async = true
      s.onload = ()=>{ html2canvasLoadedRef.current = true }
      document.body.appendChild(s)
    } else {
      html2canvasLoadedRef.current = true
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
      }
    }catch(e){ alert('Save failed: ' + e.message) }
  }

  function renderMap(){
    return <div id="opt-map" style={{height:250}} />
  }

  // Sync Leaflet map when a new result arrives
  useEffect(()=>{
    if (!result) return;
    if (!scriptLoadedRef.current || typeof window.L === 'undefined') return;

    const L = window.L
    const coords = result && (result.coordinates || (result.optimal_order && result.optimal_order.map(p=>[p.lat,p.lng])))
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

    layers.polyline = L.polyline(latlngs, {color:'red'}).addTo(mapRef.current)
    latlngs.forEach((p,i)=>{
      const m = L.marker(p).addTo(mapRef.current).bindPopup(`#${i+1}`)
      layers.markers.push(m)
    })

    try{ mapRef.current.fitBounds(latlngs, {padding:[20,20]}) }catch(e){}

    // Capture PNG snapshot of the rendered map when html2canvas is loaded
    try{
      if (html2canvasLoadedRef.current && window.html2canvas){
        setTimeout(()=>{
          try{
            window.html2canvas(document.getElementById('opt-map')).then(canvas=>{
              try{
                const data = canvas.toDataURL('image/png')
                setRouteImage(data)
              }catch(e){/* ignore */}
            }).catch(()=>{})
          }catch(e){}
        }, 300)
      }
    }catch(e){}

    // Fallback: generate vector-only snapshot to avoid tile CORS issues
    try{
      if (!routeImage && latlngs && latlngs.length>0){
        try{
          const data = generateVectorSnapshot(latlngs, result)
          if (data) setRouteImage(data)
        }catch(e){}
      }
    }catch(e){}

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

  function generateVectorSnapshot(latlngs, result) {
    // Vector-only snapshot generation
    const width = 400, height = 300
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return null
    
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, width, height)
    
    let minLat = latlngs[0][0], maxLat = minLat
    let minLng = latlngs[0][1], maxLng = minLng
    latlngs.forEach(p => {
      minLat = Math.min(minLat, p[0]); maxLat = Math.max(maxLat, p[0])
      minLng = Math.min(minLng, p[1]); maxLng = Math.max(maxLng, p[1])
    })
    
    const padding = 20
    const latRange = maxLat - minLat || 0.001
    const lngRange = maxLng - minLng || 0.001
    const scale = Math.min((width - 2*padding) / lngRange, (height - 2*padding) / latRange)
    
    ctx.strokeStyle = '#ff0000'
    ctx.lineWidth = 2
    ctx.beginPath()
    latlngs.forEach((p, i) => {
      const x = padding + (p[1] - minLng) * scale
      const y = height - padding - (p[0] - minLat) * scale
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
    })
    ctx.stroke()
    
    latlngs.forEach((p, i) => {
      const x = padding + (p[1] - minLng) * scale
      const y = height - padding - (p[0] - minLat) * scale
      ctx.fillStyle = '#0000ff'
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, 2*Math.PI)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(i+1, x, y)
    })
    
    return canvas.toDataURL('image/png')
  }

  return (
    <div className="container">
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
                <optgroup label="✓ Suitable Couriers">
                  {suitableCouriers.map(c => (
                    <option key={c.courier_id} value={c.courier_id}>
                      {c.username} ({c.car_number}) - {c.total_hours}h/8h
                    </option>
                  ))}
                </optgroup>
              </>
            )}
            {suitableCouriers.length === 0 && selectedOrders.length > 0 && (
              <>
                <optgroup label="⚠ All Couriers (workload warning)">
                  {users.filter(u => u.role === 'kurjers').map(u => (
                    <option key={u.id} value={u.id}>{u.username || u.name || `User #${u.id}`}</option>
                  ))}
                </optgroup>
              </>
            )}
            {selectedOrders.length === 0 && (
              <>
                <optgroup label="All Couriers">
                  {users.filter(u => u.role === 'kurjers').map(u => (
                    <option key={u.id} value={u.id}>{u.username || u.name || `User #${u.id}`}</option>
                  ))}
                </optgroup>
              </>
            )}
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
            <h5 style={{margin: '0 0 8px 0', color: '#2e7d32'}}>✓ Suitable Couriers Found</h5>
            <div style={{fontSize: '12px'}}>
              {suitableCouriers.length} courier(s) available for these orders
            </div>
            <div style={{fontSize: '12px', marginTop: '4px'}}>
              {suitableCouriers.map(c => (
                <div key={c.courier_id} style={{marginTop: '6px', paddingLeft: '8px', borderLeft: '3px solid #4caf50'}}>
                  <strong>{c.username}</strong> 
                  {c.work_area_name && <span style={{marginLeft: '8px', backgroundColor: '#c8e6c9', padding: '2px 6px', borderRadius: '3px', fontSize: '11px'}}>🗺️ {c.work_area_name}</span>}
                  <br/>Car: {c.car_number} (Size: {c.car_size}, Weight: {c.car_weight})
                  <br/>Workload: {c.current_hours}h (current) + {c.estimated_new_hours}h (new) = {c.total_hours}h
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedOrders.length > 0 && suitableCouriers.length === 0 && (
          <div style={{marginBottom: '12px', padding: '8px', backgroundColor: '#fff3e0', border: '1px solid #ff9800', borderRadius: '4px'}}>
            <h5 style={{margin: '0 0 8px 0', color: '#e65100'}}>⚠ No Suitable Couriers</h5>
            <div style={{fontSize: '12px'}}>
              No couriers available for these orders (workload limit or vehicle capacity issue)
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
        </div>
      )}

      {result && !result.error && renderMap()}

      {/* Snapshot preview and download */}
      {routeImage && (
        <div style={{marginTop:12}}>
          <h4>Route Image</h4>
          <div style={{display:'flex', gap:12, alignItems:'center'}}>
            <img src={routeImage} alt="Route snapshot" style={{maxWidth:400, border:'1px solid #ddd'}} />
            <div>
              <a href={routeImage} download={`route_${Date.now()}.png`} className="btn btn-secondary">Download PNG</a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
