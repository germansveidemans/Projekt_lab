import osmnx as ox
import networkx as nx
import numpy as np
import matplotlib.pyplot as plt
from itertools import permutations

def find_optimal_route(city_name, points, start_point = None, route_type = 'drive', plot_route = True):
    def geocode_point(point):
        if isinstance(point, str):
            return ox.geocode(point)
        elif isinstance(point, (tuple, list)) and len(point) == 2:
            return point[0], point[1]
        else:
            raise ValueError("Punktam vajag but adresei vai koordinatos")
    try:
        print("Lādējam karti...")
        graph = ox.graph_from_place(city_name, network_type=route_type)
        graph = ox.add_edge_speeds(graph)
        graph = ox.add_edge_travel_times(graph)
        
        print("Adreses ģeокodēšana...")

        coordinates = []
        for point in points:
            lat, lon = geocode_point(point)
            coordinates.append((lat, lon))
            print(f"  {point} -> {lat:.4f}, {lon:.4f}")
        
        nodes = []
        for lat, lon in coordinates:
            node = ox.distance.nearest_nodes(graph, lon, lat)
            nodes.append(node)
        
        print("Laiku matricas aprēķinašana...")
        n = len(points)
        time_matrix = np.zeros((n, n))
        
        for i in range(n):
            for j in range(n):
                if i != j:
                    try:
                        time = nx.shortest_path_length(graph, nodes[i], nodes[j], weight='travel_time')
                        time_matrix[i][j] = time
                    except:
                        time_matrix[i][j] = float('inf')
                else:
                    time_matrix[i][j] = 0
        
        print("Optimālu apmeklējuma secības meklēšana...")
        point_indices = list(range(n))
        
        if start_point is not None:
            start_index = points.index(start_point)
            other_indices = [i for i in point_indices if i != start_index]
            permutations_list = [[start_index] + list(p) for p in permutations(other_indices)]
        else:
            permutations_list = list(permutations(point_indices))
        
        min_time = float('inf')
        best_route_indices = None
        
        for route in permutations_list:
            total_time = 0
            for k in range(len(route) - 1):
                i, j = route[k], route[k + 1]
                total_time += time_matrix[i][j]
            
            if total_time < min_time:
                min_time = total_time
                best_route_indices = route
        full_route_nodes = []
        best_route_points = [points[i] for i in best_route_indices]
        
        for k in range(len(best_route_indices) - 1):
            i, j = best_route_indices[k], best_route_indices[k + 1]
            segment = nx.shortest_path(graph, nodes[i], nodes[j], weight='travel_time')
            full_route_nodes.extend(segment[:-1])
        
        full_route_nodes.append(nodes[best_route_indices[-1]])
        
        total_distance = 0
        for k in range(len(best_route_indices)-1):
            i, j = best_route_indices[k], best_route_indices[k + 1]
            distance = nx.shortest_path_length(graph, nodes[i], nodes[j], weight='length')
            total_distance += distance
    
        route_info = {
            'optimal_order': best_route_points,
            'optimal_order_indices': best_route_indices,
            'total_distance_km': total_distance / 1000,
            'total_time_minutes': total_time / 60,
            'route_nodes': full_route_nodes,
            'coordinates': coordinates,
            'graph': graph,
            'time_matrix': time_matrix
        }
        
        print(f"\n Optimālais maršruts atrasts!")
        print(f"Adrešu secība:")
        for i, point in enumerate(best_route_points, 1):
            print(f"  {i}. {point}")
        print(f"Kopējais attālums: {route_info['total_distance_km']:.2f} km")
        print(f"Kopējais laiks: {route_info['total_time_minutes']:.1f} minutes")
        
        if plot_route:
            plot_optimal_route(route_info, points, city_name, route_type)
        
        return route_info
        
    except Exception as e:
        print(f"Kļūda: {e}")
        return None
    
def plot_optimal_route(route_info, original_points, city_name, route_type):
    fig, ax = plt.subplots(figsize=(14, 12))
     
    ox.plot_graph(route_info['graph'], ax=ax, show=False, close=False,
                  node_size=0, edge_color='lightgray', edge_linewidth=0.5)
    
    ox.plot_graph_route(route_info['graph'], route_info['route_nodes'], 
                       ax=ax, route_color='red', route_linewidth=5, 
                       route_alpha=0.8, show=False, close=False)
    
    optimal_order = route_info['optimal_order']
    
    for i, point in enumerate(optimal_order):
        original_index = original_points.index(point)
        lat, lon = route_info['coordinates'][original_index]
        
        color = 'blue'
        marker = 'o'
        
        ax.plot(lon, lat, marker=marker, color=color, markersize=15, 
                alpha=0.8, markeredgecolor='white', markeredgewidth=2,
                label=f'{i+1}. {point}')
    
    for i in range(len(optimal_order) - 1):
        start_idx = original_points.index(optimal_order[i])
        end_idx = original_points.index(optimal_order[i + 1])
        
        start_lat, start_lon = route_info['coordinates'][start_idx]
        end_lat, end_lon = route_info['coordinates'][end_idx]
        
        ax.annotate('', xy=(end_lon, end_lat), xytext=(start_lon, start_lat),
                   arrowprops=dict(arrowstyle='->', color='red', lw=2, alpha=0.7))
    
    ax.legend(loc='upper right')
    
    title = f'Optimalais maršruts {len(original_points)} punkti\n'
    title += f'Attālums: {route_info["total_distance_km"]:.2f} km | '
    title += f'Laiks: {route_info["total_time_minutes"]:.1f} min'
    
    ax.set_title(title, fontsize=14, fontweight='bold')
    plt.tight_layout()
    plt.show()
    
    
route = find_optimal_route(
    city_name = "Rīga, Latvija",
    points=["Pilsoņu iela 1", "Daugavgrīvas iela 85", "Katrīnas dambis 22", "Sarkandaugavas iela 7", "Dārzaugļu iela 1", "Čiekurkalna 2.līnija 74","Kaivas iela 50"],
    start_point = "Kaivas iela 50"
)