const BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001'

console.log('🔗 API Base URL:', BASE)

async function handleResponse(res) {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Users API
export async function listUsers() {
  console.log('📡 Calling GET /users/')
  try {
    const res = await fetch(`${BASE}/users/`);
    console.log('📬 Response status:', res.status)
    return handleResponse(res);
  } catch (err) {
    console.error('❌ Fetch error:', err);
    throw new Error(`Failed to fetch users: ${err.message}. Is backend running at ${BASE}?`);
  }
}

export async function createUser(userData) {
  const res = await fetch(`${BASE}/users/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return handleResponse(res);
}

export async function updateUser(userId, userData) {
  const res = await fetch(`${BASE}/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return handleResponse(res);
}

export async function deleteUser(userId) {
  const res = await fetch(`${BASE}/users/${userId}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

// Cars API
export async function listCars() {
  const res = await fetch(`${BASE}/cars/`);
  return handleResponse(res);
}

export async function createCar(carData) {
  const res = await fetch(`${BASE}/cars/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(carData),
  });
  return handleResponse(res);
}

export async function updateCar(carId, carData) {
  const res = await fetch(`${BASE}/cars/${carId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(carData),
  });
  return handleResponse(res);
}

export async function deleteCar(carId) {
  const res = await fetch(`${BASE}/cars/${carId}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

// Clients API
export async function listClients() {
  const res = await fetch(`${BASE}/clients/`);
  return handleResponse(res);
}

export async function createClient(clientData) {
  const res = await fetch(`${BASE}/clients/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientData),
  });
  return handleResponse(res);
}

export async function updateClient(clientId, clientData) {
  const res = await fetch(`${BASE}/clients/${clientId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientData),
  });
  return handleResponse(res);
}

export async function deleteClient(clientId) {
  const res = await fetch(`${BASE}/clients/${clientId}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

// Orders API
export async function listOrders() {
  const res = await fetch(`${BASE}/orders/`);
  return handleResponse(res);
}

export async function createOrder(orderData) {
  const res = await fetch(`${BASE}/orders/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  return handleResponse(res);
}

export async function updateOrder(orderId, orderData) {
  const res = await fetch(`${BASE}/orders/${orderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  return handleResponse(res);
}

export async function deleteOrder(orderId) {
  const res = await fetch(`${BASE}/orders/${orderId}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

// Work Areas API
export async function listWorkAreas() {
  const res = await fetch(`${BASE}/work_areas/`);
  return handleResponse(res);
}

export async function createWorkArea(areaData) {
  const res = await fetch(`${BASE}/work_areas/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(areaData),
  });
  return handleResponse(res);
}

export async function updateWorkArea(areaId, areaData) {
  const res = await fetch(`${BASE}/work_areas/${areaId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(areaData),
  });
  return handleResponse(res);
}

export async function deleteWorkArea(areaId) {
  const res = await fetch(`${BASE}/work_areas/${areaId}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

// Routes API
export async function listRoutes() {
  const res = await fetch(`${BASE}/routes/`);
  return handleResponse(res);
}

export async function getRoute(routeId) {
  const res = await fetch(`${BASE}/routes/${routeId}`);
  return handleResponse(res);
}

export async function createRoute(routeData) {
  const res = await fetch(`${BASE}/routes/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(routeData),
  });
  return handleResponse(res);
}

// convenience wrapper to compute+save (not used yet)
export async function computeAndSave(orders, meta={}){
  const res = await fetch(`${BASE}/optimize/compute`, {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({...meta, orders})
  })
  const data = await handleResponse(res)
  return data
}

export async function updateRoute(routeId, routeData) {
  const res = await fetch(`${BASE}/routes/${routeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(routeData),
  });
  return handleResponse(res);
}

export async function deleteRoute(routeId) {
  const res = await fetch(`${BASE}/routes/${routeId}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

// Legacy - kept for compatibility
export async function getUsers() {
  return listUsers();
}

export async function computeRoute(orders){
  const res = await fetch(`${BASE}/optimize/compute`, {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({orders})
  })
  return await res.json()
}

export async function assignRoute(orderIds, courierId, city){
  const res = await fetch(`${BASE}/optimize/assign`, {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({order_ids: orderIds, courier_id: courierId, city})
  })
  return handleResponse(res)
}

export async function getSuitableCouriers(orderIds) {
  const res = await fetch(`${BASE}/couriers/suitable-for-orders`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({order_ids: orderIds})
  })
  return handleResponse(res)
}

export async function getCourierStatus(courierId) {
  const res = await fetch(`${BASE}/couriers/${courierId}/status`)
  return handleResponse(res)
}
