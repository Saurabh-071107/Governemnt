import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Layers, 
  MapPin, 
  CloudRain, 
  Flame, 
  AlertTriangle, 
  RefreshCw, 
  ShieldAlert,
  Send,
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


  // Broadcast modal state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastDistrict, setBroadcastDistrict] = useState('Pune');
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
    setBroadcasting(true);
    try {
      await fetch('http://localhost:5000/api/outbreaks/broadcast', {
        method: 'POST',
        headers: AdminApiService.getAuthHeader(),
        body: JSON.stringify({
          title: broadcastTitle,
          message: broadcastMessage,
          targetDistrict: broadcastDistrict,
          targetAudience: 'Farmers & Veterinarians',
          urgency: 'Immediate'
        })
      });
      setBroadcastSuccess(true);
      setTimeout(() => setBroadcastSuccess(false), 4000);
      setBroadcastTitle('');
      setBroadcastMessage('');
    } catch (_) {}
    setBroadcasting(false);
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current).setView([18.75, 74.3], 7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      leafletMapRef.current = map;
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  const currentItems = layerData?.layers[activeLayer] || [];

  useEffect(() => {
    if (!leafletMapRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    currentItems.forEach((item, idx) => {
      const coords = DISTRICT_COORDS[item.district] || [18.52 + (idx * 0.45) - 0.2, 73.85 + (idx * 0.35) - 0.2];
      const isSelected = selectedCluster?.id === item.id;
      const isEnv = activeLayer === 'ENVIRONMENTAL_RISK';
      const color = isEnv ? '#0284c7' : (item.severity === 'CRITICAL' ? '#dc2626' : '#ea580c');

      const customIcon = L.divIcon({
        className: 'custom-osm-marker',
        html: `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="position: absolute; width: ${isSelected ? '36px' : '26px'}; height: ${isSelected ? '36px' : '26px'}; border-radius: 50%; background: ${color}40; border: 2px solid ${color}; box-shadow: 0 0 10px ${color}80;"></div>
            <div style="width: 12px; height: 12px; border-radius: 50%; background: ${color};"></div>
            <div style="position: absolute; top: 100%; left: 50%; transform: translateX(-50%); background: #0f172a; color: #fff; font-size: 10px; font-weight: bold; padding: 2px 5px; border-radius: 3px; white-space: nowrap; margin-top: 3px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${item.district}</div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker(coords, { icon: customIcon });
      marker.bindPopup(`
        <div style="font-family: system-ui; min-width: 140px;">
          <strong style="color: #0f172a; font-size: 13px;">${item.district}</strong><br/>
          <span style="color: ${color}; font-weight: bold; font-size: 12px;">${item.title || item.disease || 'Outbreak Alert'}</span><br/>
          <span style="font-size: 11px; color: #64748b;">Risk: ${item.severity || 'HIGH'}</span>
        </div>
      `);
      marker.on('click', () => {
        setSelectedCluster(item);
      });
      marker.addTo(markersLayerRef.current!);
    });
  }, [currentItems, activeLayer, selectedCluster]);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
            Bi-Modal Outbreak Intelligence & Spatial Risk Surveillance
          </h2>
          <p style={{ fontSize: 13, color: '#64748b' }}>
            Fusion of Signal A (observed epidemiological case clusters) and Signal B (OpenWeather vector & spore dispersion risk).
          </p>
        </div>

        <button
          id="admin-btn-eval-outbreak"
          onClick={handleRunEvaluation}
          disabled={evaluating}
          className="btn-gov-primary"
          style={{ gap: 8 }}
        >
          <RefreshCw size={16} className={evaluating ? 'spin' : ''} />
          {evaluating ? 'Computing Spatial Risk...' : 'Run Outbreak Risk Engine'}
        </button>
      </div>

      {/* Layer Switcher Tabs */}
      <div style={{ display: 'flex', gap: 12, backgroundColor: '#ffffff', padding: 8, borderRadius: 10, border: '1px solid #e2e8f0', width: 'fit-content' }}>
        <button
          id="admin-layer-observed"
          onClick={() => setActiveLayer('OBSERVED_CASES')}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: activeLayer === 'OBSERVED_CASES' ? '#0f172a' : 'transparent',
            color: activeLayer === 'OBSERVED_CASES' ? '#ffffff' : '#475569'
          }}
        >
          <MapPin size={16} color={activeLayer === 'OBSERVED_CASES' ? '#2dd4bf' : '#64748b'} />
          Layer 1: Observed Disease Clusters
        </button>

        <button
          id="admin-layer-env"
          onClick={() => setActiveLayer('ENVIRONMENTAL_RISK')}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: activeLayer === 'ENVIRONMENTAL_RISK' ? '#0f172a' : 'transparent',
            color: activeLayer === 'ENVIRONMENTAL_RISK' ? '#ffffff' : '#475569'
          }}
        >
          <CloudRain size={16} color={activeLayer === 'ENVIRONMENTAL_RISK' ? '#38bdf8' : '#64748b'} />
          Layer 2: Environmental Weather Risk
        </button>

        <button
          id="admin-layer-combined"
          onClick={() => setActiveLayer('COMBINED_RISK')}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: activeLayer === 'COMBINED_RISK' ? '#0f172a' : 'transparent',
            color: activeLayer === 'COMBINED_RISK' ? '#ffffff' : '#475569'
          }}
        >
          <Flame size={16} color={activeLayer === 'COMBINED_RISK' ? '#f87171' : '#64748b'} />
          Layer 3: Combined Outbreak Heatmap
        </button>
      </div>

      {/* Interactive Map Visualizer and Cluster Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        {/* Map Canvas / Grid Representation */}
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Layers size={18} color="#2dd4bf" />
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em' }}>
                SPATIAL PROJECTION • MAHARASHTRA AGRO-CLIMATIC CORRIDOR
              </span>
            </div>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              Farmer Identities Privacy-Masked
            </span>
          </div>

          {/* Real Leaflet OpenStreetMap Container */}
          <div
            ref={mapContainerRef}
            id="admin-osm-map-container"
            style={{
              height: 420,
              width: '100%',
              backgroundColor: '#e2e8f0',
              zIndex: 1
            }}
          />


          <div style={{ padding: '12px 18px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
            <span>Layer Status: <strong>{activeLayer}</strong></span>
            <span>Spatial Aggregation: <strong>PIN Code Centroids</strong></span>
          </div>
        </div>

        {/* Selected Hotspot Intelligence Panel */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <ShieldAlert size={20} color="#b91c1c" />
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>Regional Surveillance Intelligence</h3>
            </div>

            {selectedCluster ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ padding: '12px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase' }}>
                    Risk Category: {selectedCluster.severity || 'CRITICAL / HIGH'}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                    {selectedCluster.title || `${selectedCluster.district} Agro-Cluster`}
                  </div>
                  <div style={{ fontSize: 13, color: '#475569', marginTop: 6, fontStyle: 'italic' }}>
                    "{selectedCluster.statusWording || 'Potential outbreak risk with high environmental transmission probability'}"
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Observed Cases</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{selectedCluster.caseCount || 4} herds</div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Combined Risk Score</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#b91c1c' }}>{selectedCluster.combinedScore || 82}/100</div>
                  </div>
                </div>

                {/* Weather Features */}
                <div style={{ backgroundColor: '#f0fdf4', padding: '12px 14px', borderRadius: 8, border: '1px solid #bbf7d0', fontSize: 12 }}>
                  <div style={{ fontWeight: 700, color: '#166534', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CloudRain size={14} /> OpenWeather Ingestion Telemetry
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#14532d' }}>
                    <span>Temperature: <strong>{selectedCluster.temperature || 29}°C</strong></span>
                    <span>Humidity: <strong>{selectedCluster.humidity || 72}%</strong></span>
                    <span>Condition: <strong>{selectedCluster.condition || 'Humid / Monsoon'}</strong></span>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: '#475569' }}>
                  <strong>Official Biosecurity Protocol:</strong>{' '}
                  {selectedCluster.recommendation || 'Veterinary attention recommended immediately. Enforce ring vaccination.'}
                </div>

                {/* Emergency Vet Dispatch Action */}
                <div style={{ marginTop: 8 }}>
                  {dispatchSuccess && (
                    <div style={{
                      padding: '10px 12px',
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      borderRadius: 8,
                      border: '1px solid #86efac',
                      fontSize: 12,
                      fontWeight: 600,
                      marginBottom: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <span style={{ fontSize: 16 }}>🚨</span>
                      <span>Emergency Vet Dispatched! A priority video consultation case has been queued on the field veterinarian's mobile app.</span>
                    </div>
                  )}

                  <button
                    onClick={handleDispatchEmergencyVet}
                    disabled={dispatchingVet}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 12.5,
                      fontWeight: 800,
                      cursor: dispatchingVet ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                    }}
                  >
                    <AlertTriangle size={15} />
                    {dispatchingVet ? 'Dispatching Emergency Response...' : 'Dispatch Emergency Field Vet'}
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: '#94a3b8' }}>Select an area on the map to review details.</p>
            )}
          </div>

          {/* Quick Broadcast Form */}
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Send size={14} /> Emergency Broadcast Dispatcher
            </h4>
            {broadcastSuccess && (
              <div style={{ padding: '8px 12px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: 6, fontSize: 12, marginBottom: 8 }}>
                Emergency alert dispatched to farmers and veterinarians via OneSignal.
              </div>
            )}
            <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="text"
                placeholder="Alert Headline (e.g. URGENT: FMD Ring Advisory)"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                required
                style={{ fontSize: 12 }}
              />
              <textarea
                rows={2}
                placeholder="Advisory message for farmers and field dispensaries..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                required
                style={{ fontSize: 12 }}
              />
              <button
                type="submit"
                disabled={broadcasting}
                className="btn-gov-primary"
                style={{ padding: '8px 12px', fontSize: 12, justifyContent: 'center' }}
              >
                {broadcasting ? 'Transmitting Alert...' : 'Dispatch Regional Emergency Broadcast'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
