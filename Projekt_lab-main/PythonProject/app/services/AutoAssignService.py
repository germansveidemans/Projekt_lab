"""
Service for automatic assignment of all pending orders to suitable couriers
"""
from app.services.OrderService import OrderService
from app.services.UserService import UserService
from app.services.CarService import CarService
from app.services.RouteService import RouteService
from app.services.OptimizationService import OptimizationService
from app.services.CourierSuitabilityService import CourierSuitabilityService
from app.db import get_connection
import app.services.OptimizationService as opt_module


class AutoAssignService:
    """Automatically assign all pending orders to couriers"""
    
    @staticmethod
    def auto_assign_all_orders():
        """
        Automatically assign all pending orders to suitable couriers.
        
        Algorithm:
        1. Get all orders with route_status NULL or 'в ожидании'
        2. Get all available couriers (role='kurjers')
        3. For each courier, find orders they can handle (based on capacity, work area, time)
        4. Assign maximum orders to each courier
        5. Calculate and save routes
        
        Returns:
        {
            "success": True/False,
            "routes_created": number,
            "orders_assigned": number,
            "unassigned_orders": [order_ids],
            "details": [{courier_id, courier_name, orders_count, route_id, distance, duration}]
        }
        """
        try:
            conn = get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT id, size, weight, adress as address, client_id 
                FROM orders 
                WHERE route_status IS NULL OR route_status = 'izskatīšanā'
                ORDER BY id
            """)
            pending_orders = cursor.fetchall()
            cursor.close()
            
            if not pending_orders:
                return {

"success": True,

"routes_created": 0,

"orders_assigned": 0,

"unassigned_orders": [],

"details": [],

"message":"No pending orders to assign"
                }
            
            pending_order_ids = [o['id'] for o in pending_orders]
            print(f"[AUTO-ASSIGN] Found {len(pending_orders)} pending orders: {pending_order_ids}")
            
                                 
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT id, username, work_area_id 
                FROM users 
                WHERE role='kurjers'
                ORDER BY id
            """)
            couriers = cursor.fetchall()
            cursor.close()
            
            if not couriers:
                return {

"success": False,

"routes_created": 0,

"orders_assigned": 0,

"unassigned_orders": pending_order_ids,

"details": [],

"message":"No couriers available"
                }
            
            print(f"[AUTO-ASSIGN] Found {len(couriers)} couriers")
            
                               
            assigned_order_ids = set()
            routes_created = []
            unassigned_orders = []
            
                                                             
            for courier in couriers:
                courier_id = courier['id']
                courier_name = courier['username']
                
                print(f"\n[AUTO-ASSIGN] 🚚 Processing courier: {courier_name} (ID: {courier_id})")
                print(f"[AUTO-ASSIGN] Already assigned: {len(assigned_order_ids)} orders")
                
                                   
                car = CarService.get_car_by_user(courier_id)
                if not car:
                    print(f"[AUTO-ASSIGN] Courier {courier_name} has no car, skipping")
                    continue
                
                                                                   
                available_orders = [oid for oid in pending_order_ids if oid not in assigned_order_ids]
                
                if not available_orders:
                    print(f"[AUTO-ASSIGN] ✅ No more orders available - all assigned!")
                    break
                
                print(f"[AUTO-ASSIGN] Available orders for {courier_name}: {len(available_orders)} orders")
                
                                                                             
                selected_orders = AutoAssignService._select_orders_for_courier(
                    available_orders, 
                    courier_id, 
                    car.size, 
                    car.weight,
                    courier['work_area_id']
                )
                
                if not selected_orders:
                    print(f"[AUTO-ASSIGN] No suitable orders for {courier_name}")
                    continue
                
                print(f"[AUTO-ASSIGN] Assigning {len(selected_orders)} orders to {courier_name}: {selected_orders}")
                
                                    
                try:
                    order_data = []
                    for oid in selected_orders:
                        order = OrderService.get_order(oid)
                        if order:
                            order_data.append({'id': oid,'address': order.address})
                    
                                                         
                    route_result = OptimizationService.compute_nearest_neighbor(order_data, start=None, city='Rīga')
                    
                    if not route_result or ('distance_km' not in route_result and'total_distance_km' not in route_result):
                        print(f"[AUTO-ASSIGN] Failed to compute route for {courier_name}")
                        continue
                    
                                   
                    distance_km = route_result.get('distance_km') or route_result.get('total_distance_km', 0)
                    distance_m = int(distance_km * 1000)
                    duration_min = route_result.get('estimated_time_minutes', 0)
                    
                    route_id = RouteService.create_route(
                        courier_id=courier_id,
                        total_orders=len(selected_orders),
                        total_distance=distance_m,
                        optimized_path=route_result.get('optimal_order', []),
                        optimized_order_ids=selected_orders,
                        status='gatavs',
                        estimated_time_minutes=duration_min
                    )
                    
                    if route_id:
                                                                                  
                        for oid in selected_orders:
                            try:
                                OrderService.update_order(oid, {

'route_status':'gatavs'
                                })
                                assigned_order_ids.add(oid)
                                print(f"[AUTO-ASSIGN] Order {oid} marked as assigned to {courier_name}")
                            except Exception as update_err:
                                print(f"[AUTO-ASSIGN] Failed to update order {oid}: {update_err}")
                        
                        routes_created.append({

'courier_id': courier_id,

'courier_name': courier_name,

'route_id': route_id,

'orders_count': len(selected_orders),

'order_ids': selected_orders,

'distance': distance_km,

'duration': duration_min
                        })
                        
                        print(f"[AUTO-ASSIGN] ✅ Created route {route_id} for {courier_name} with {len(selected_orders)} orders")
                        print(f"[AUTO-ASSIGN] Total assigned so far: {len(assigned_order_ids)} orders")
                    else:
                        print(f"[AUTO-ASSIGN] Failed to save route for {courier_name}")
                    
                except Exception as e:
                    print(f"[AUTO-ASSIGN] Error creating route for {courier_name}: {e}")
                    import traceback
                    traceback.print_exc()
                    continue
            
                                        
            unassigned_orders = [oid for oid in pending_order_ids if oid not in assigned_order_ids]
            
            return {

"success": True,

"routes_created": len(routes_created),

"orders_assigned": len(assigned_order_ids),

"unassigned_orders": unassigned_orders,

"details": routes_created,

"message":f"Created {len(routes_created)} routes, assigned {len(assigned_order_ids)} orders, {len(unassigned_orders)} unassigned"
            }
            
        except Exception as e:
            print(f"[AUTO-ASSIGN] Error: {e}")
            import traceback
            traceback.print_exc()
            return {

"success": False,

"routes_created": 0,

"orders_assigned": 0,

"unassigned_orders": pending_order_ids if'pending_order_ids' in locals() else [],

"details": [],

"error": str(e)
            }
    
    @staticmethod
    def _select_orders_for_courier(order_ids, courier_id, car_size, car_weight, work_area_id):
        """
        Select maximum orders that courier can handle.
        Uses greedy approach: keep adding orders while constraints satisfied.
        
        Returns: list of order IDs
        """
        if not order_ids:
            return []
        
                                         
        work_area = None
        if work_area_id:
            from app.services.Work_areaService import WorkAreaService
            work_area = WorkAreaService.get_work_area(work_area_id)
            print(f"[AUTO-ASSIGN] Courier work_area: {work_area_id}, bounds: {work_area.min_lat if work_area else 'N/A'}-{work_area.max_lat if work_area else 'N/A'}, {work_area.min_lng if work_area else 'N/A'}-{work_area.max_lng if work_area else 'N/A'}")
        
                             
        orders_info = []
        for oid in order_ids:
            order = OrderService.get_order(oid)
            if order:
                try:
                    lat, lng = opt_module.real_geocode(order.address,"Rīga")
                    orders_info.append({

'id': oid,

'size': order.size or 0,

'weight': order.weight or 0,

'address': order.address,

'lat': lat,

'lng': lng
                    })
                    print(f"[AUTO-ASSIGN] Order {oid} geocoded: {order.address} -> ({lat}, {lng})")
                except Exception as e:
                    print(f"[AUTO-ASSIGN] Failed to geocode order {oid}: {e}")
                                                  
                    continue
        
        print(f"[AUTO-ASSIGN] Successfully geocoded {len(orders_info)}/{len(order_ids)} orders")
        
                                                          
        selected = []
        current_size = 0
        current_weight = 0
        
        for order in orders_info:
                            
            if current_size + order['size'] > car_size:
                print(f"[AUTO-ASSIGN] Order {order['id']} skipped: size limit ({current_size + order['size']} > {car_size})")
                continue
            if current_weight + order['weight'] > car_weight:
                print(f"[AUTO-ASSIGN] Order {order['id']} skipped: weight limit ({current_weight + order['weight']} > {car_weight})")
                continue
            
                                                             
            if work_area:
                in_area = opt_module.is_point_in_work_area({'lat': order['lat'],'lng': order['lng']}, work_area)
                if not in_area:
                    print(f"[AUTO-ASSIGN] ⚠ Order {order['id']} at ({order['lat']}, {order['lng']}) OUTSIDE work area bounds (but will include anyway)")
                else:
                    print(f"[AUTO-ASSIGN] ✓ Order {order['id']} INSIDE work area")
            
                            
            selected.append(order['id'])
            current_size += order['size']
            current_weight += order['weight']
            print(f"[AUTO-ASSIGN] Order {order['id']} SELECTED (total: size={current_size}, weight={current_weight})")
        
        print(f"[AUTO-ASSIGN] Selected {len(selected)} orders: {selected}")
        return selected
