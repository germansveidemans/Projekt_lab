from flask import Blueprint, jsonify, request
from app.services.CourierSuitabilityService import CourierSuitabilityService

courier_bp = Blueprint("couriers", __name__, url_prefix="/couriers")


@courier_bp.post('/suitable-for-orders')
def get_suitable_couriers():
    """
    Find all couriers suitable for the given orders.
    
    Request JSON:
    {
        "order_ids": [1, 2, 3]
    }
    
    Response:
    {
        "suitable_couriers": [
            {
                "courier_id": 1,
                "username": "courier1",
                "car_id": 5,
                "car_number": "AA1001",
                "car_size": 100.0,
                "car_weight": 5000.0,
                "current_routes": 0,
                "current_hours": 0.0,
                "estimated_new_hours": 1.5,
                "total_hours": 1.5,
                "available": true
            },
            ...
        ],
        "total_size_needed": 150.0,
        "total_weight_needed": 10.0,
    }
    """
    data = request.get_json() or {}
    order_ids = data.get('order_ids') or []
    
    if not order_ids:
        return jsonify({"error": "order_ids list required"}), 400
    
    try:
        suitable = CourierSuitabilityService.get_suitable_couriers(order_ids)
        
        # Calculate total requirements
        from app.services.OrderService import OrderService
        orders = []
        for oid in order_ids:
            o = OrderService.get_order(oid)
            if o:
                orders.append(o)
        
        total_size = sum(o.size or 0 for o in orders)
        total_weight = sum(o.weight or 0 for o in orders)
        
        return jsonify({
            "suitable_couriers": suitable,
            "total_size_needed": total_size,
            "total_weight_needed": total_weight,
            "max_hours_per_day": CourierSuitabilityService.MAX_HOURS_PER_DAY,
            "count": len(suitable)
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@courier_bp.get('/<int:courier_id>/status')
def get_courier_status(courier_id: int):
    """Get current status of a courier (workload, car, routes)"""
    try:
        status = CourierSuitabilityService.get_courier_status(courier_id)
        if "error" in status:
            return jsonify(status), 404
        return jsonify(status)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
