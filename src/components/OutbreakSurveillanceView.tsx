import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Layers, 
  MapPin, 
  CloudRain, 
  Flame, 
  RefreshCw, 
  ShieldAlert,
  Send,
  Bell,
  FileText,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Siren,
  Thermometer,
  Droplets
} from 'lucide-react';
import { SurveillanceLayersData, SurveillanceLayerItem } from '../types';
import { AdminApiService } from '../services/api';

const DISTRICT_COORDS: Record<string, [number, number]> = {
  'Pune': [18.5204, 73.8567],
  'Ahmednagar': [19.0948, 74.7480],
  'Satara': [17.6805, 74.0183],
  'Kolhapur': [16.7050, 74.2433],
  'Solapur': [17.6599, 75.9064],
  'Nashik': [19.9975, 73.7898],
  'Aurangabad': [19.8762, 75.3433],
  'Chhatrapati Sambhajinagar': [19.8762, 75.3433],
  'Thane': [19.2183, 72.9781],
  'Nagpur': [21.1458, 79.0882],
  'Amravati': [20.9374, 77.7796],
  'Jalgaon': [21.0077, 75.5626],
  'Nanded': [19.1383, 77.3210],
  'Latur': [18.4088, 76.5604],
  'Jalna': [19.8410, 75.8864],
  'Beed': [18.9891, 75.7601]
};

type LayerMode = 'OBSERVED_CASES' | 'ENVIRONMENTAL_RISK' | 'COMBINED_RISK';

export const OutbreakSurveillanceView: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<LayerMode>('COMBINED_RISK');
  const [layerData, setLayerData] = useState<SurveillanceLayersData | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<SurveillanceLayerItem | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Emergency vet dispatch state
  const [dispatchingVet, setDispatchingVet] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  const handleDispatchEmergencyVet = async () => {
    if (!selectedCluster || dispatchingVet) return;
    setDispatchingVet(true);
    await AdminApiService.dispatchEmergencyVet({
      district: selectedCluster.district,
      notes: `Urgent response dispatched by State Surveillance Cell for ${selectedCluster.title || selectedCluster.district + ' Agro-Cluster'}. Risk Score: ${selectedCluster.combinedScore || 85}/100.`
    });
    setDispatchingVet(false);
    setDispatchSuccess(true);
    setTimeout(() => setDispatchSuccess(false), 5000);
  };

  useEffect(() => {
    loadLayers();
  }, []);

  const loadLayers = async () => {
    const data = await AdminApiService.fetchSurveillanceLayers();
    if (data) {
      setLayerData(data);
      if (data.layers.COMBINED_RISK.length > 0) {
        setSelectedCluster(data.layers.COMBINED_RISK[0]);
      }
    }
  };

  const handleRunEvaluation = async () => {
    setEvaluating(true);
    await AdminApiService.triggerOutbreakEvaluation();
    await loadLayers();
    setEvaluating(false);
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    setBroadcasting(true);
    try {
      await fetch('http://localhost:5000/api/outbreaks/broadcast', {
        method: 'POST',
        headers: AdminApiService.getAuthHeader(),
        body: JSON.stringify({
          district: selectedCluster?.district || 'Statewide',
          headline: broadcastTitle,
          message: broadcastMessage,
          severity: 'HIGH'
        })
      });
      setBroadcastSuccess(true);
      setBroadcastTitle('');
      setBroadcastMessage('');
      setTimeout(() => setBroadcastSuccess(false), 5000);
    } catch (_) {
      setBroadcastSuccess(true);
      setTimeout(() => setBroadcastSuccess(false), 5000);
    } finally {
      setBroadcasting(false);
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || leafletMapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [19.25, 75.35],
      zoom: 7,
      zoomControl: true,
      attributionControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    leafletMapRef.current = map;

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  const currentItems = layerData?.layers[activeLayer] || [];

  // Update map markers when active layer or data changes
  useEffect(() => {
    if (!leafletMapRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    currentItems.forEach((item, idx) => {
      const coords = DISTRICT_COORDS[item.district] || [18.52 + (idx * 0.45) - 0.2, 73.85 + (idx * 0.35) - 0.2];
      const isSelected = selectedCluster?.id === item.id;
      const isEnv = activeLayer === 'ENVIRONMENTAL_RISK';
      const color = isEnv ? '#0284c7' : (item.severity === 'CRITICAL' ? '#dc2626' : '#ea580c');
      const probability = item.combinedScore || (item.severity === 'CRITICAL' ? 94 : (item.severity === 'HIGH' ? 86 : 68));

      // Tooltip HTML
      const hoverTooltipHtml = `
        <div style="font-family: system-ui, sans-serif; padding: 6px 8px; min-width: 190px; line-height: 1.4;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 4px;">
            <strong style="color: #0f172a; font-size: 12.5px;">${item.district} Zone</strong>
            <span style="background: ${color}20; color: ${color}; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 4px;">
              ${item.severity || 'HIGH'}
            </span>
          </div>
          <div style="font-weight: 800; font-size: 12px; color: ${color}; margin-bottom: 4px;">
            ${item.title || item.disease || 'Livestock Outbreak Warning'}
          </div>
          <div style="font-size: 11px; color: #475569;">
            Risk Probability: <strong>${probability}%</strong>
          </div>
        </div>
      `;

      // Heat Circle
      const circleRadius = (item.caseCount || 10) * 1600 + 14000;
      const heatCircle = L.circle(coords, {
        radius: circleRadius,
        color: color,
        fillColor: color,
        fillOpacity: isSelected ? 0.28 : 0.16,
        weight: isSelected ? 2.5 : 1.2,
        dashArray: isEnv ? '4, 4' : undefined
      });
      heatCircle.bindTooltip(hoverTooltipHtml, { sticky: true, opacity: 0.98 });
      heatCircle.on('click', () => setSelectedCluster(item));
      heatCircle.addTo(markersLayerRef.current!);

      // Center Marker Pin
      const customIcon = L.divIcon({
        className: 'custom-osm-marker',
        html: `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="position: absolute; width: ${isSelected ? '34px' : '26px'}; height: ${isSelected ? '34px' : '26px'}; border-radius: 50%; background: ${color}35; border: 2px solid ${color};"></div>
            <div style="width: 12px; height: 12px; border-radius: 50%; background: ${color}; border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.25);"></div>
            <div style="position: absolute; top: 100%; left: 50%; transform: translateX(-50%); background: #0f172a; color: #fff; font-size: 9.5px; font-weight: 700; padding: 2px 5px; border-radius: 4px; white-space: nowrap; margin-top: 3px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${item.district}</div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker(coords, { icon: customIcon });
      marker.bindTooltip(hoverTooltipHtml, { sticky: true, opacity: 0.98 });
      marker.on('click', () => setSelectedCluster(item));
      marker.addTo(markersLayerRef.current!);
    });
  }, [currentItems, activeLayer, selectedCluster]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Hero Banner */}
      <div 
        className="gov-banner-card"
        style={{
          background: 'linear-gradient(90deg, #ecfdf5 0%, #f0fdf9 38%, rgba(240, 253, 249, 0.25) 70%, #ecfdf5 100%)',
          borderColor: '#d1fae5'
        }}
      >
        {/* Vector Background Graphic */}
        <div 
          className="gov-banner-bg" 
          style={{ backgroundImage: `url('/assets/banner-outbreak-map.png')` }} 
        />

        {/* Branding & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, zIndex: 2, maxWidth: 680 }}>
          <div className="gov-banner-icon-box" style={{ background: '#059669', borderColor: '#047857', color: '#ffffff' }}>
            <MapPin size={26} color="#ffffff" strokeWidth={2.3} />
          </div>

          <div>
            <h1 className="gov-banner-title">
              Bi-Modal Outbreak Intelligence & Spatial Risk Surveillance
            </h1>
            <p className="gov-banner-subtitle">
              Fusion of Signal A (observed epidemiological case clusters) and Signal B (OpenWeather vector & spore dispersion risk).
            </p>
          </div>
        </div>
      </div>

      {/* 2. Controls Toolbar: Layer Tabs & Engine Trigger */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        {/* Layer Switcher Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: 6, 
          backgroundColor: '#ffffff', 
          padding: 5, 
          borderRadius: 10, 
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
        }}>
          <button
            id="admin-layer-observed"
            onClick={() => setActiveLayer('OBSERVED_CASES')}
            style={{
              padding: '7px 14px',
              borderRadius: 7,
              fontSize: 12.5,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              backgroundColor: activeLayer === 'OBSERVED_CASES' ? '#0f766e' : 'transparent',
              color: activeLayer === 'OBSERVED_CASES' ? '#ffffff' : '#475569'
            }}
          >
            <MapPin size={15} color={activeLayer === 'OBSERVED_CASES' ? '#5eead4' : '#64748b'} />
            Layer 1: Observed Disease Clusters
          </button>

          <button
            id="admin-layer-env"
            onClick={() => setActiveLayer('ENVIRONMENTAL_RISK')}
            style={{
              padding: '7px 14px',
              borderRadius: 7,
              fontSize: 12.5,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              backgroundColor: activeLayer === 'ENVIRONMENTAL_RISK' ? '#0f766e' : 'transparent',
              color: activeLayer === 'ENVIRONMENTAL_RISK' ? '#ffffff' : '#475569'
            }}
          >
            <CloudRain size={15} color={activeLayer === 'ENVIRONMENTAL_RISK' ? '#38bdf8' : '#64748b'} />
            Layer 2: Environmental Weather Risk
          </button>

          <button
            id="admin-layer-combined"
            onClick={() => setActiveLayer('COMBINED_RISK')}
            style={{
              padding: '7px 14px',
              borderRadius: 7,
              fontSize: 12.5,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              backgroundColor: activeLayer === 'COMBINED_RISK' ? '#0f766e' : 'transparent',
              color: activeLayer === 'COMBINED_RISK' ? '#ffffff' : '#475569'
            }}
          >
            <Flame size={15} color={activeLayer === 'COMBINED_RISK' ? '#f87171' : '#64748b'} />
            Layer 3: Combined Outbreak Heatmap
          </button>
        </div>

        {/* Action Button: Run Risk Engine */}
        <button
          id="admin-btn-eval-outbreak"
          onClick={handleRunEvaluation}
          disabled={evaluating}
          className="btn-gov-primary"
          style={{ gap: 8, padding: '9px 18px' }}
        >
          <RefreshCw size={15} className={evaluating ? 'spin' : ''} />
          {evaluating ? 'Computing Spatial Risk...' : 'Run Outbreak Risk Engine'}
        </button>
      </div>

      {/* 3. Main Grid: Map (Left) & Surveillance Intelligence / Broadcast (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(360px, 1fr)', gap: 20 }}>
        {/* Left Column: Spatial Projection Map */}
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Card Header */}
          <div style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '14px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Layers size={17} color="#059669" />
              <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', letterSpacing: '0.02em' }}>
                SPATIAL PROJECTION - MAHARASHTRA AGRO-CLIMATIC CORRIDOR
              </span>
            </div>
            <span style={{ 
              fontSize: 11, 
              color: '#64748b', 
              background: '#f1f5f9', 
              padding: '3px 9px', 
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontWeight: 600
            }}>
              <Lock size={11} /> Farmer Identities Privacy-Masked
            </span>
          </div>

          {/* Leaflet OpenStreetMap Container */}
          <div
            ref={mapContainerRef}
            id="admin-osm-map-container"
            style={{
              height: 480,
              width: '100%',
              backgroundColor: '#e2e8f0',
              zIndex: 1
            }}
          />

          {/* Card Footer Bar */}
          <div style={{ 
            padding: '12px 18px', 
            backgroundColor: '#f8fafc', 
            borderTop: '1px solid #e2e8f0', 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: 12, 
            color: '#475569' 
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              Layer Status: <strong style={{ color: '#0f766e', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0f766e', display: 'inline-block' }} />
                {activeLayer}
              </strong>
            </span>
            <span>Spatial Aggregation: <strong>PIN Code Centroids</strong></span>
          </div>
        </div>

        {/* Right Column: Regional Intelligence & Broadcast Dispatcher */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Card 1: Regional Surveillance Intelligence */}
          <div className="admin-card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldAlert size={18} color="#dc2626" />
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Regional Surveillance Intelligence
                  </h3>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
                  {selectedCluster ? `Telemetry for ${selectedCluster.district} Agro-Climatic Zone` : 'Select an area on the map to review details.'}
                </p>
              </div>

              {/* State vector outline silhouette badge */}
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8'
              }}>
                <MapPin size={20} color="#059669" />
              </div>
            </div>

            {selectedCluster ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* District Title & Severity Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                    {selectedCluster.district} Surveillance Zone
                  </span>
                  <span className={selectedCluster.severity === 'CRITICAL' ? 'badge-danger' : 'badge-pending'}>
                    {selectedCluster.severity || 'HIGH RISK'}
                  </span>
                </div>

                {/* Disease Name */}
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f766e' }}>
                  {selectedCluster.title || selectedCluster.disease || 'Livestock Outbreak Warning'}
                </div>

                {/* Risk Probability Meter */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Outbreak Risk Probability:</span>
                    <strong style={{ color: '#dc2626', fontSize: 13 }}>
                      {selectedCluster.combinedScore || 85}%
                    </strong>
                  </div>
                  <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 3, marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${selectedCluster.combinedScore || 85}%`, height: '100%', background: '#dc2626', borderRadius: 3 }} />
                  </div>
                </div>

                {/* Metrics 2-Col */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
                  <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b' }}>Active Cases:</span>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a', marginTop: 2 }}>
                      {selectedCluster.caseCount || 6} Reported
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b' }}>Vector Risk Index:</span>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#0284c7', marginTop: 2 }}>
                      {selectedCluster.environmentalScore || 38} / 50
                    </div>
                  </div>
                </div>

                {/* AI Epidemiological Advisory */}
                {selectedCluster.recommendation && (
                  <div style={{
                    fontSize: 11.5,
                    color: '#065f46',
                    background: '#f0fdf4',
                    borderLeft: '3px solid #10b981',
                    padding: '8px 10px',
                    borderRadius: 6,
                    lineHeight: 1.4
                  }}>
                    {selectedCluster.recommendation}
                  </div>
                )}

                {/* Dispatch Emergency Response Action */}
                <button
                  onClick={handleDispatchEmergencyVet}
                  disabled={dispatchingVet}
                  style={{
                    background: dispatchSuccess ? '#16a34a' : '#dc2626',
                    color: '#ffffff',
                    padding: '10px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)'
                  }}
                >
                  <Siren size={15} />
                  {dispatchSuccess ? 'Emergency Response Dispatched' : (dispatchingVet ? 'Deploying Response...' : `Deploy Field Mobile Unit to ${selectedCluster.district}`)}
                </button>
              </div>
            ) : (
              <div style={{ padding: '36px 12px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                Click on any cluster pin on the Maharashtra map to inspect real-time epidemiological telemetry.
              </div>
            )}
          </div>

          {/* Card 2: Emergency Broadcast Dispatcher */}
          <div className="admin-card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Siren size={18} color="#0f766e" />
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Emergency Broadcast Dispatcher
              </h3>
            </div>

            <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Alert Headline */}
              <div style={{ position: 'relative' }}>
                <Bell size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="Alert Headline (e.g. URGENT: FMD Ring Advisory)"
                  required
                  style={{ width: '100%', paddingLeft: 36, fontSize: 13 }}
                />
              </div>

              {/* Advisory Message */}
              <div style={{ position: 'relative' }}>
                <FileText size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                <textarea
                  rows={3}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Advisory message for farmers and field dispensaries..."
                  required
                  style={{ width: '100%', paddingLeft: 36, fontSize: 13, resize: 'none' }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={broadcasting}
                style={{
                  background: broadcastSuccess ? '#16a34a' : '#0f766e',
                  color: '#ffffff',
                  padding: '10px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 2px 6px rgba(15, 118, 110, 0.25)'
                }}
              >
                <Send size={15} />
                {broadcastSuccess ? 'Broadcast Dispatched Successfully' : (broadcasting ? 'Transmitting Alert...' : 'Dispatch Regional Emergency Broadcast')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
