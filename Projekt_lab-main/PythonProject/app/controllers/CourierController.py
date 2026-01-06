
from flask import Blueprint, jsonify, request
from app.services.CourierSuitabilityService import CourierSuitabilityService

courier_bp = Blueprint("couriers", __name__, url_prefix="/couriers")


@courier_bp.post('/suitable-for-orders')
def get_suitable_couriers():
    data = request.get_json() or {}
    order_ids = data.get('order_ids') or []
    
    if not order_ids:
        return jsonify({"error":"order_ids list required"}), 400
    
    try:
        suitable = CourierSuitabilityService.get_suitable_couriers(order_ids)
        
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
    try:
        status = CourierSuitabilityService.get_courier_status(courier_id)
        if"error" in status:
            return jsonify(status), 404
        return jsonify(status)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
