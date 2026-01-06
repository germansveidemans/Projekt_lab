
from app.db import get_connection
from app.models.courier_statistics import CourierStatistics
from datetime import datetime

class StatisticsService:
    
    @staticmethod
    def get_courier_statistics(courier_id: int) -> CourierStatistics | None:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        try:
            cursor.execute("""
                SELECT id, courier_id, total_routes, completed_routes, 
                       total_distance_km, total_orders_delivered, last_updated
                FROM courier_statistics
                WHERE courier_id = %s
            """, (courier_id,))
            
            row = cursor.fetchone()
            
            if row:
                return CourierStatistics(**row)
            return None
            
        finally:
            cursor.close()
    
    @staticmethod
    def update_courier_statistics(courier_id: int):
        conn = get_connection()
        cursor = conn.cursor()
        
        try:
            update_sql ="""
                INSERT INTO courier_statistics 
                    (courier_id, total_routes, completed_routes, total_distance_km, total_orders_delivered)
                SELECT 
                    %s as courier_id,
                    COUNT(DISTINCT r.id) as total_routes,
                    COUNT(DISTINCT CASE WHEN r.status = 'pabeigts' THEN r.id END) as completed_routes,
                    COALESCE(SUM(r.total_distance / 1000.0), 0) as total_distance_km,
                    COALESCE(SUM(CASE WHEN r.status = 'pabeigts' THEN r.total_orders ELSE 0 END), 0) as total_orders_delivered
                FROM users u
                LEFT JOIN routes r ON r.courier_id = u.id
                WHERE u.id = %s
                GROUP BY u.id
                ON DUPLICATE KEY UPDATE
                    total_routes = VALUES(total_routes),
                    completed_routes = VALUES(completed_routes),
                    total_distance_km = VALUES(total_distance_km),
                    total_orders_delivered = VALUES(total_orders_delivered),
                    last_updated = CURRENT_TIMESTAMP
            """
            
            cursor.execute(update_sql, (courier_id, courier_id))
            conn.commit()
            
            return True
            
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
    
    @staticmethod
    def get_all_couriers_statistics():
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        try:
            cursor.execute("""
                SELECT cs.id, cs.courier_id, cs.total_routes, cs.completed_routes,
                       cs.total_distance_km, cs.total_orders_delivered, cs.last_updated,
                       u.username as courier_name
                FROM courier_statistics cs
                JOIN users u ON u.id = cs.courier_id
                ORDER BY cs.total_distance_km DESC
            """)
            
            rows = cursor.fetchall()
            return rows
            
        finally:
            cursor.close()
