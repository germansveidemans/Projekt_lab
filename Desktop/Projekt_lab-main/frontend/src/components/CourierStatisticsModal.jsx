import React, { useState, useEffect } from 'react';
import { getCourierStatistics } from '../services/api';

export default function CourierStatisticsModal({ courierId, courierName, onClose }) {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, [courierId]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCourierStatistics(courierId);
      setStatistics(data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Courier Statistics: {courierName}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {loading ? (
            <p>Loading statistics...</p>
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : statistics ? (
            <div className="statistics-grid">
              <div className="stat-card">
                <div className="stat-icon">🚚</div>
                <div className="stat-content">
                  <div className="stat-label">Total Routes</div>
                  <div className="stat-value">{statistics.total_routes}</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <div className="stat-label">Completed Routes</div>
                  <div className="stat-value">{statistics.completed_routes}</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📏</div>
                <div className="stat-content">
                  <div className="stat-label">Total Distance</div>
                  <div className="stat-value">{statistics.total_distance_km.toFixed(2)} km</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-content">
                  <div className="stat-label">Orders Delivered</div>
                  <div className="stat-value">{statistics.total_orders_delivered}</div>
                </div>
              </div>
              
              {statistics.total_routes > 0 && (
                <>
                  <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                      <div className="stat-label">Completion Rate</div>
                      <div className="stat-value">
                        {((statistics.completed_routes / statistics.total_routes) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">📍</div>
                    <div className="stat-content">
                      <div className="stat-label">Avg Distance per Route</div>
                      <div className="stat-value">
                        {(statistics.total_distance_km / statistics.total_routes).toFixed(2)} km
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {statistics.last_updated && (
                <div className="stat-card full-width">
                  <div className="stat-icon">🕐</div>
                  <div className="stat-content">
                    <div className="stat-label">Last Updated</div>
                    <div className="stat-value-small">
                      {new Date(statistics.last_updated).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p>No statistics available</p>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
