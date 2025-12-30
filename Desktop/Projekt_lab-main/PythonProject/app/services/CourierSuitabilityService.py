"""
Service to find suitable couriers for given orders
"""
from app.db import get_connection
from app.services.UserService import UserService
from app.services.CarService import CarService
from app.services.RouteService import RouteService
from app.services.OrderService import OrderService
from app.services.Work_areaService import WorkAreaService
from app.services.OptimizationService import is_point_in_work_area
import app.services.OptimizationService as opt_module


class CourierSuitabilityService:
    """Find suitable couriers based on vehicle capacity and workload"""
    
    MAX_HOURS_PER_DAY = 8  # 8 hours = 480 minutes
    
    @staticmethod
    def get_suitable_couriers(order_ids: list) -> list:
        """
        Find all couriers who can handle the given orders.
        Returns list of dicts with courier info and suitability details.
        
        Criteria:
        1. Courier must have a car
        2. Car size/weight must accommodate all orders
        3. Current routes + new route must not exceed MAX_HOURS_PER_DAY
        4. All order addresses must be within courier's work area zone (if assigned)
        """
        if not order_ids:
            return []
        
        # Fetch all orders to calculate total size/weight
        try:
            orders = []
            order_addresses = []
            for oid in order_ids:
                o = OrderService.get_order(oid)
                if o:
                    orders.append(o)
                    order_addresses.append(o.address)
            
            if not orders:
                return []
            
            total_size = sum(o.size or 0 for o in orders)
            total_weight = sum(o.weight or 0 for o in orders)
            
            # Pre-geocode all order addresses for zone checking
            order_coords = []
            for addr in order_addresses:
                try:
                    lat, lng = opt_module.real_geocode(addr, "Rīga")
                    order_coords.append({'lat': lat, 'lng': lng, 'address': addr})
                except Exception as e:
                    print(f"[WARNING] Failed to geocode {addr}: {e}")
                    # Preserve entry so lengths align; mark missing coords
                    order_coords.append({'lat': None, 'lng': None, 'address': addr})
            
        except Exception as e:
            print(f"[ERROR] Failed to fetch orders: {e}")
            return []
        
        # Get all couriers (role='kurjers')
        all_couriers = []
        try:
            conn = get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT id, username, role, work_area_id FROM users WHERE role='kurjers'")
            all_couriers = cursor.fetchall()
            cursor.close()
        except Exception as e:
            print(f"[ERROR] Failed to fetch couriers: {e}")
            return []
        
        suitable = []
        
        for courier in all_couriers:
            courier_id = courier['id']
            username = courier['username']
            work_area_id = courier.get('work_area_id')
            
            try:
                # 1. Check if courier has a car
                car = CarService.get_car_by_user(courier_id)
                if not car:
                    print(f"[INFO] Courier {username} (ID {courier_id}) skipped: no car")
                    continue
                
                # 2. Check if car can accommodate orders
                car_size = car.size or 0
                car_weight = car.weight or 0
                
                if total_size > car_size or total_weight > car_weight:
                    print(f"[INFO] Courier {username} skipped: car too small (need {total_size}/{total_weight}, have {car_size}/{car_weight})")
                    continue
                
                # 3. Check if all orders are within courier's work area
                if work_area_id:
                    try:
                        work_area = WorkAreaService.get_work_area(work_area_id)
                        if work_area and (work_area.min_lat is not None and work_area.max_lat is not None):
                            # Check if all geocoded addresses are in zone
                            all_in_zone = True
                            for coord in order_coords:
                                if coord is None:
                                    # Skip if could not geocode
                                    continue
                                if coord.get('lat') is None or coord.get('lng') is None:
                                    continue
                                if not is_point_in_work_area(coord, work_area):
                                    all_in_zone = False
                                    break
                            
                            if not all_in_zone:
                                print(f"[INFO] Courier {username} skipped: orders outside work area {work_area.name}")
                                continue
                    except Exception as e:
                        print(f"[WARNING] Could not check zone for {username}: {e}")
                        # Continue anyway if zone check fails
                
                # 4. Calculate current workload (existing routes for today)
                routes = RouteService.list_routes()
                courier_routes = [r for r in routes if r.courier_id == courier_id]
                
                # Use estimated_time_minutes if available, otherwise estimate 1.5 hours per route
                current_hours = sum(
                    (r.estimated_time_minutes / 60) if r.estimated_time_minutes else 1.5 
                    for r in courier_routes
                )
                
                # Estimate new route time: 0.5 hours per order (rough)
                estimated_new_hours = len(order_ids) * 0.5
                total_hours = current_hours + estimated_new_hours
                
                if total_hours > CourierSuitabilityService.MAX_HOURS_PER_DAY:
                    print(f"[INFO] Courier {username} skipped: too much workload ({total_hours}h > {CourierSuitabilityService.MAX_HOURS_PER_DAY}h)")
                    continue
                
                # Courier is suitable!
                work_area_name = "No zone"
                if work_area_id:
                    try:
                        wa = WorkAreaService.get_work_area(work_area_id)
                        work_area_name = wa.name if wa else "Unknown"
                    except:
                        pass
                
                suitable.append({
                    'courier_id': courier_id,
                    'username': username,
                    'work_area_id': work_area_id,
                    'work_area_name': work_area_name,
                    'car_id': car.id,
                    'car_number': car.vehicle_number,
                    'car_size': car_size,
                    'car_weight': car_weight,
                    'current_routes': len(courier_routes),
                    'current_hours': round(current_hours, 1),
                    'estimated_new_hours': round(estimated_new_hours, 1),
                    'total_hours': round(total_hours, 1),
                    'available': True
                })
                print(f"[INFO] ✓ Courier {username} is suitable")
                
            except Exception as e:
                print(f"[ERROR] Checking courier {courier_id}: {e}")
                continue
        
        return suitable
    
    @staticmethod
    def get_courier_status(courier_id: int) -> dict:
        """Get detailed status of a courier"""
        try:
            courier = UserService.get_user(courier_id)
            if not courier:
                return {"error": "Courier not found"}
            
            car = CarService.get_car_by_user(courier_id)
            routes = RouteService.list_routes()
            courier_routes = [r for r in routes if r.courier_id == courier_id]
            
            return {
                'courier_id': courier_id,
                'username': courier.username,
                'car': {
                    'id': car.id if car else None,
                    'vehicle_number': car.vehicle_number if car else None,
                    'size': car.size if car else None,
                    'weight': car.weight if car else None,
                } if car else None,
                'routes_today': len(courier_routes),
                'estimated_hours': round(len(courier_routes) * 1.5, 1)
            }
        except Exception as e:
            return {"error": str(e)}
