
from flask import Blueprint, jsonify, request
from app.services.StatisticsService import StatisticsService

statistics_bp = Blueprint('statistics', __name__, url_prefix='/statistics')

@statistics_bp.route('/courier/<int:courier_id>', methods=['GET'])
def get_courier_statistics(courier_id):
    try:
        StatisticsService.update_courier_statistics(courier_id)
        
        stats = StatisticsService.get_courier_statistics(courier_id)
        
        if not stats:
            return jsonify({'error':'Courier not found or no statistics available'}), 404
        
        return jsonify({

'courier_id': stats.courier_id,

'total_routes': stats.total_routes,

'completed_routes': stats.completed_routes,

'total_distance_km': float(stats.total_distance_km),

'total_orders_delivered': stats.total_orders_delivered,

'last_updated': stats.last_updated.isoformat() if stats.last_updated else None
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@statistics_bp.route('/all', methods=['GET'])
def get_all_statistics():
    try:
        stats = StatisticsService.get_all_couriers_statistics()
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@statistics_bp.route('/update/<int:courier_id>', methods=['POST'])
def update_statistics(courier_id):
    try:
        StatisticsService.update_courier_statistics(courier_id)
        return jsonify({'message':'Statistics updated successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
