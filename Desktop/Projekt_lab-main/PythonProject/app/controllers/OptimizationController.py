from flask import Blueprint, jsonify, request
from app.services.OptimizationService import OptimizationService
from app.services.OrderService import OrderService
from app.services.RouteService import RouteService
from app.services.Work_areaService import WorkAreaService
from app.controllers.RouteController import route_to_dict
import app.services.OptimizationService as opt_module
from app.services.OptimizationService import real_geocode, is_point_in_work_area

opt_bp = Blueprint("optimize", __name__, url_prefix="/optimize")

@opt_bp.post('/clear-cache')
def clear_cache():
    """Clear geocoding and distance caches"""
    opt_module._GEOCODE_CACHE.clear()
    opt_module._DISTANCE_CACHE.clear()
    return jsonify({"status": "Cache cleared", "message": "Geocoding and distance caches have been cleared"})


@opt_bp.post('/order-zones')
def get_order_zones():
    """Get zone information for selected orders"""
    data = request.get_json() or {}
    order_ids = data.get('order_ids') or []
    
    if not order_ids:
        return jsonify({"error": "order_ids list required"}), 400
    
    # Fetch work areas
    work_areas = WorkAreaService.list_work_areas()
    work_area_map = {wa.id: wa for wa in work_areas}
    
    # Process each order
    orders_info = []
    zones_involved = {}  # zone_id -> zone_name
    
    for order_id in order_ids:
        order = OrderService.get_order(order_id)
        if not order:
            continue
        
        # Get order address and coordinates
        address = order.address or ""
        
        # Geocode the address
        lat, lng = None, None
        try:
            print(f"[ZONE-INFO] Geocoding address: {address}")
            lat, lng = real_geocode(address)
            print(f"[ZONE-INFO] Geocode result: ({lat}, {lng})")
        except Exception as e:
            print(f"[ERROR] Failed to geocode {address}: {e}")
            import traceback
            traceback.print_exc()
        
        # Find which zone this order belongs to
        zone_id = None
        zone_name = "Unknown Zone"
        zone_color = "#999999"
        
        if lat is not None and lng is not None:
            for wa in work_areas:
                if is_point_in_work_area({"lat": lat, "lng": lng}, wa):
                    zone_id = wa.id
                    zone_name = wa.name
                    zones_involved[wa.id] = wa.name
                    # Assign colors
                    colors = {
                        "Old Riga": "#FF6B6B",
                        "New Riga": "#4ECDC4",
                        "Centre": "#FFD93D",
                        "North": "#6BCB77",
                        "South": "#A29BFE",
                        "East": "#FFA502",
                        "West": "#FF7675"
                    }
                    zone_color = colors.get(wa.name, "#999999")
                    break
        
        orders_info.append({
            "id": order.id,
            "address": address,
            "lat": lat,
            "lng": lng,
            "zone_id": zone_id,
            "zone_name": zone_name,
            "zone_color": zone_color
        })
    
    return jsonify({
        "orders": orders_info,
        "zones_involved": zones_involved,
        "total_zones": len(zones_involved)
    })


@opt_bp.post('/compute')
def compute_route():
    print("[DEBUG] /optimize/compute called")
    # accept JSON body with list of orders: [{id, lat, lng, size, weight}, ...]
    data = request.get_json() or {}
    orders = data.get('orders')
    if not orders or not isinstance(orders, list):
        return jsonify({"error": "orders list required"}), 400

    # try osmnx-based exact search if available, otherwise fallback to nearest-neighbor
    try:
        city = data.get('city')
        start = data.get('start')
        print(f"[DEBUG] Computing with city={city}, start={start}")
        result = OptimizationService.compute_with_osmnx(orders, city_name=city, start_point=start)
        print(f"[DEBUG] compute_with_osmnx returned: {result}")
        if result is None:
            result = OptimizationService.compute_nearest_neighbor(orders, start)
    except Exception as e:
        print(f"[DEBUG] Exception in compute: {e}")
        # on any error, fallback
        try:
            result = OptimizationService.compute_nearest_neighbor(orders, data.get('start'))
        except Exception:
            return jsonify({"error": str(e)}), 500

    return jsonify(result)


@opt_bp.post('/assign')
def compute_and_assign():
    data = request.get_json() or {}
    order_ids = data.get('order_ids') or []
    courier_id = data.get('courier_id')
    city = data.get('city')

    print(f"[DEBUG] /optimize/assign called with data: order_ids={order_ids}, courier_id={courier_id}, city={city}")

    if not order_ids or not isinstance(order_ids, list):
        return jsonify({"error": "order_ids (list) required"}), 400

    # fetch orders
    orders = []
    for oid in order_ids:
        o = OrderService.get_order(oid)
        if not o:
            return jsonify({"error": f"Order {oid} not found"}), 404
        orders.append({
            'id': o.id,
            'address': o.address,
        })
    
    # Sort orders by ID to ensure consistent ordering
    orders.sort(key=lambda x: x['id'])

    # compute route
    result = None
    try:
        result = OptimizationService.compute_with_osmnx(orders, city_name=city, start_point=None)
        if result is None:
            result = OptimizationService.compute_nearest_neighbor(orders, None, city)
    except Exception as e:
        # fallback
        try:
            result = OptimizationService.compute_nearest_neighbor(orders, None, city)
        except Exception as e2:
            return jsonify({"error": str(e2)}), 500

    # create route record
    try:
        print(f"[DEBUG] Creating route: courier_id={courier_id}, total_orders={len(order_ids)}")
        # determine optimized order sequence returned by optimizer
        optimized_ids = result.get('order') or result.get('optimal_order') or order_ids

        # build optimized_path as list of delivery addresses in optimized order
        id_to_address = {o['id']: o.get('address') for o in orders}
        optimized_path = [id_to_address.get(i) or '' for i in optimized_ids]

        route = RouteService.create_route(
            courier_id=courier_id,
            total_orders=len(optimized_ids),
            total_distance=round((result.get('total_distance_km') or result.get('distance_km') or 0) * 1000),
            optimized_path=optimized_path,
            optimized_order_ids=optimized_ids,
            estimated_time_minutes=result.get('estimated_time_minutes', 0),
            status='atdots kurjēram',  # Use one of the valid ENUM values
        )
        print(f"[DEBUG] Route created with id: {route.id if route else None}")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"[ERROR] Failed to create route: {e}")
        return jsonify({"error": str(e)}), 500

    # no longer assign orders via separate endpoint; route now stores order ids directly
    return jsonify({"route": route_to_dict(route), "orders_assigned": len(order_ids)})
