
import math
import random
from itertools import permutations
import hashlib
import requests
import time

_OSMNX_AVAILABLE = False
def _load_osmnx():
    global _OSMNX_AVAILABLE, ox, nx, np
    try:
        import osmnx as ox_
        import networkx as nx_
        import numpy as np_
        ox = ox_
        nx = nx_
        np = np_
        _OSMNX_AVAILABLE = True
    except Exception as e:
        print(f"[WARNING] OSMnx unavailable: {e}")
        _OSMNX_AVAILABLE = False


_GEOCODE_CACHE = {}

def is_point_in_work_area(point, work_area) -> bool:
    if not work_area:
        return True

    if (work_area.min_lat is None or work_area.max_lat is None or
        work_area.min_lng is None or work_area.max_lng is None):
        return False

    lat = lng = None
    if isinstance(point, dict):
        lat = point.get('lat')
        lng = point.get('lng')
    elif isinstance(point, (list, tuple)) and len(point) >= 2:
        lat, lng = point[0], point[1]

    if lat is None or lng is None:
        return False

    return (work_area.min_lat <= lat <= work_area.max_lat and
            work_area.min_lng <= lng <= work_area.max_lng)


def real_geocode(address, city="Rīga"):
    if not address or not address.strip():
        print(f"[GEOCODE ERROR] Empty address provided")
        return mock_geocode("default", city)
    
    cache_key =f"{city}:{address}".lower().strip()
    if cache_key in _GEOCODE_CACHE:
        print(f"[GEOCODE CACHE HIT] {address}")
        return _GEOCODE_CACHE[cache_key]
    
    try:
        normalized_address = address.replace('Rīga,','').replace('Rīga','').strip()
        normalized_city = city.replace('Rīga','Riga')
        
        if not normalized_address:
            print(f"[GEOCODE ERROR] Normalized address is empty")
            return mock_geocode(address, city)
        
        query =f"{normalized_address}, {normalized_city}, Latvia"
        
        print(f"[GEOCODE REQUEST] Original: {address}, Query: {query}")
        url ="https://nominatim.openstreetmap.org/search"
        params = {

'q': query,

'format':'json',

'limit': 1
        }
        headers = {

'User-Agent':'CourierOptimizationApp/1.0'
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=15)
        print(f"[GEOCODE RESPONSE] Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"[GEOCODE DATA] Results: {len(data) if data else 0}")
            if data and len(data) > 0:
                lat = float(data[0]['lat'])
                lng = float(data[0]['lon'])
                result = (lat, lng)
                _GEOCODE_CACHE[cache_key] = result
                print(f"[GEOCODE SUCCESS] {address} -> ({lat:.6f}, {lng:.6f})")
                time.sleep(1)
                return result
            else:
                print(f"[GEOCODE WARNING] No results found for {address}")
        else:
            print(f"[GEOCODE ERROR] HTTP {response.status_code} for {address}")
    except requests.exceptions.Timeout:
        print(f"[GEOCODE ERROR] Timeout geocoding '{address}'")
    except requests.exceptions.RequestException as e:
        print(f"[GEOCODE ERROR] Request failed for '{address}': {e}")
    except Exception as e:
        print(f"[GEOCODE ERROR] Unexpected error geocoding '{address}': {e}")
        import traceback
        traceback.print_exc()
    
    print(f"[GEOCODE FALLBACK] Using mock geocoding for {address}")
    return mock_geocode(address, city)


def mock_geocode(address, city="Rīga"):
    cache_key =f"{city}:{address}".lower().strip()
    if cache_key in _GEOCODE_CACHE:
        return _GEOCODE_CACHE[cache_key]
    
    base_lat, base_lng = 56.9496, 24.1052
    
    addr_hash = hashlib.md5(cache_key.encode('utf-8')).hexdigest()
    hash_val1 = int(addr_hash[:8], 16) / (16**8)
    hash_val2 = int(addr_hash[8:16], 16) / (16**8)
    
    lat = base_lat + (hash_val1 - 0.5) * 0.08
    lng = base_lng + (hash_val2 - 0.5) * 0.08
    
    result = (lat, lng)
    _GEOCODE_CACHE[cache_key] = result
    return result


def _ensure_coordinates(points, city=None, use_real_geocoding=True):
    result = []
    for i, p in enumerate(points):
        if isinstance(p, str):
            pt = {'id': i, 'address': p}
        elif isinstance(p, dict):
            pt = p.copy()
        else:
            pt = {'id': i}
            
        if 'lat' not in pt or 'lng' not in pt:
            if 'address' in pt:
                if use_real_geocoding:
                    lat, lng = real_geocode(pt['address'], city or "Rīga")
                else:
                    lat, lng = mock_geocode(pt['address'], city or "Rīga")
                pt['lat'] = lat
                pt['lng'] = lng
            else:
                raise ValueError(f"Point {p} has no lat/lng or address")
        
        if 'id' not in pt:
            pt['id'] = i
            
        result.append(pt)
    return result


_DISTANCE_CACHE = {}
_TIME_CACHE = {}
_GEOMETRY_CACHE = {}

def get_road_distance(point_a, point_b):
    cache_key =f"{point_a['lat']:.6f},{point_a['lng']:.6f}-{point_b['lat']:.6f},{point_b['lng']:.6f}"
    if cache_key in _DISTANCE_CACHE:
        return _DISTANCE_CACHE[cache_key]
    
    try:
        coords =f"{point_a['lng']},{point_a['lat']};{point_b['lng']},{point_b['lat']}"
        url =f"https://router.project-osrm.org/route/v1/driving/{coords}"
        params = {'overview':'false'}
        
        response = requests.get(url, params=params, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('code') =='Ok' and data.get('routes'):
                distance_m = data['routes'][0]['distance']
                distance_km = distance_m / 1000.0
                _DISTANCE_CACHE[cache_key] = distance_km
                return distance_km
    except Exception as e:
        print(f"[OSRM ERROR] Failed to get road distance: {e}")
    
    return haversine(point_a, point_b)

def get_route_time_minutes(point_a, point_b):
    cache_key =f"{point_a['lat']:.6f},{point_a['lng']:.6f}-{point_b['lat']:.6f},{point_b['lng']:.6f}"
    if cache_key in _TIME_CACHE:
        return _TIME_CACHE[cache_key]
    
    try:
        coords =f"{point_a['lng']},{point_a['lat']};{point_b['lng']},{point_b['lat']}"
        url =f"https://router.project-osrm.org/route/v1/driving/{coords}"
        params = {'overview':'false'}
        
        response = requests.get(url, params=params, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('code') =='Ok' and data.get('routes'):
                time_s = data['routes'][0]['duration']
                time_minutes = int(time_s / 60)
                _TIME_CACHE[cache_key] = time_minutes
                return time_minutes
    except Exception as e:
        print(f"[OSRM ERROR] Failed to get route time: {e}")
    
    distance_km = haversine(point_a, point_b)
    estimated_minutes = int((distance_km / 30.0) * 60)
    _TIME_CACHE[cache_key] = estimated_minutes
    return estimated_minutes


def haversine(a, b):
    R = 6371.0
    lat1 = math.radians(a['lat'])
    lon1 = math.radians(a['lng'])
    lat2 = math.radians(b['lat'])
    lon2 = math.radians(b['lng'])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    sa = math.sin(dlat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlon/2)**2
    return 2 * R * math.asin(math.sqrt(sa))


def get_full_route_geometry(ordered_points):
    if len(ordered_points) < 2:
        return []
    
    try:
        coords_str =";".join([f"{p['lng']},{p['lat']}" for p in ordered_points])
        url =f"https://router.project-osrm.org/route/v1/driving/{coords_str}"
        params = {

'overview':'full',

'geometries':'geojson'
        }
        
        response = requests.get(url, params=params, timeout=20)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('code') =='Ok' and data.get('routes'):
                geometry = data['routes'][0]['geometry']
                if geometry and'coordinates' in geometry:
                    return [[coord[1], coord[0]] for coord in geometry['coordinates']]
    except Exception as e:
        print(f"[OSRM ERROR] Failed to get route geometry: {e}")
    
    return [[p['lat'], p['lng']] for p in ordered_points]


class OptimizationService:
    @staticmethod
    def compute_nearest_neighbor(points, start=None, city=None, use_real_distances=True):
        if not points:
            return {"order": [],"distance_km": 0,"estimated_time_minutes": 0}

        try:
            points = _ensure_coordinates(points, city, use_real_geocoding=True)
        except Exception as e:
            return {"order": [],"distance_km": 0,"estimated_time_minutes": 0,"error": str(e)}

        if start is not None:
            return OptimizationService._nn_from_start(points, start, use_real_distances)
        
        best_result = None
        best_distance = float('inf')
        
        for start_idx in range(len(points)):
            result = OptimizationService._nn_from_start(points, points[start_idx], use_real_distances)
            if result['distance_km'] < best_distance:
                best_distance = result['distance_km']
                best_result = result
        
        return best_result if best_result else {"order": [],"distance_km": 0,"estimated_time_minutes": 0}
    
    @staticmethod
    def _nn_from_start(points, start, use_real_distances=True):
        pts = [p.copy() for p in points]
        current = start

        route = [current.get('id')]
        ordered_points = [current]
        total_distance = 0.0
        total_time = 0

        pts = [p for p in pts if p.get('id') != current.get('id')]

        while pts:
            best_idx = 0
            if use_real_distances:
                best_d = get_road_distance(current, pts[0])
            else:
                best_d = haversine(current, pts[0])
                
            for i in range(1, len(pts)):
                if use_real_distances:
                    d = get_road_distance(current, pts[i])
                else:
                    d = haversine(current, pts[i])
                    
                if d < best_d:
                    best_d = d
                    best_idx = i

            total_distance += best_d
            if use_real_distances:
                segment_time = get_route_time_minutes(current, pts[best_idx])
                total_time += segment_time
            current = pts.pop(best_idx)
            route.append(current.get('id'))
            ordered_points.append(current)

        route_geometry = []
        if use_real_distances and len(ordered_points) >= 2:
            route_geometry = get_full_route_geometry(ordered_points)

        return {

"order": route, 

"distance_km": round(total_distance, 3),

"estimated_time_minutes": total_time,

"route_geometry": route_geometry,

"ordered_points": [[p['lat'], p['lng']] for p in ordered_points]
        }

    @staticmethod
    def compute_with_osmnx(points, city_name=None, start_point=None, route_type='drive'):
        return OptimizationService.compute_nearest_neighbor(
            points, 
            start_point, 
            city_name or"Rīga",
            use_real_distances=True
        )

    @staticmethod
    def two_opt(order_tuple, coordinates):
        if not order_tuple or len(order_tuple) < 4:
            return list(order_tuple)

        def route_distance(order):
            dist = 0.0
            for i in range(len(order) - 1):
                a = {'lat': coordinates[order[i]][0],'lng': coordinates[order[i]][1]}
                b = {'lat': coordinates[order[i+1]][0],'lng': coordinates[order[i+1]][1]}
                dist += haversine(a, b)
            return dist

        order = list(order_tuple)
        improved = True
        best_distance = route_distance(order)
        while improved:
            improved = False
            for i in range(1, len(order) - 2):
                for j in range(i + 1, len(order)):
                    if j - i == 1:
                        continue
                    new_order = order[:i] + order[i:j][::-1] + order[j:]
                    new_distance = route_distance(new_order)
                    if new_distance < best_distance:
                        order = new_order
                        best_distance = new_distance
                        improved = True
        return order
