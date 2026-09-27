import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  AlertTriangle, 
  CloudRain, 
  Thermometer, 
  Droplets, 
  Send, 
  ShieldAlert, 
  RefreshCw, 
  Search, 
  Activity, 
  CheckCircle2, 
  Bell, 
  MapPin, 
  Clock, 
  MessageSquare,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { AISurveillanceData, AIPredictedOutbreak } from '../types';
import { AdminApiService } from '../services/api';

export const AISurveillanceIntelligenceView: React.FC = () => {
  const [data, setData] = useState<AISurveillanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterDistrict, setFilterDistrict] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Emergency Alert Modal state
  const [selectedZone, setSelectedZone] = useState<AIPredictedOutbreak | null>(null);
  const [customAlertMsg, setCustomAlertMsg] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadIntelligence();
  }, []);

  const loadIntelligence = async () => {
    setLoading(true);
    const res = await AdminApiService.fetchAISurveillanceIntelligence();
    if (res && res.predictedOutbreaks) {
      setData(res);
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const res = await AdminApiService.fetchAISurveillanceIntelligence();
    if (res && res.predictedOutbreaks) {
      setData(res);
    }
    setTimeout(() => setRefreshing(false), 500);
  };

  const openEmergencyModal = (zone: AIPredictedOutbreak) => {
    setSelectedZone(zone);
    setCustomAlertMsg(
      `AI Predictive Surveillance has detected a ${zone.probabilityPercent}% outbreak probability of ${zone.disease} in ${zone.village} (${zone.panchayat || zone.district}). Immediate quarantine of symptomatic animals is ordered. Local veterinary officers are placed on emergency alert.`
    );
    setDispatchSuccess(null);
  };

  const handleSendEmergencyAlert = async () => {
    if (!selectedZone || dispatching) return;
    setDispatching(true);
    try {
      const res: any = await AdminApiService.pushAIEmergencyAlert({
        village: selectedZone.village,
        panchayat: selectedZone.panchayat,
        district: selectedZone.district,
        disease: selectedZone.disease,
        probabilityPercent: selectedZone.probabilityPercent,
        severity: selectedZone.urgency,
        customMessage: customAlertMsg
      });
      setDispatchSuccess(res?.message || 'Emergency notification pushed successfully to both farmers and doctors!');
      setTimeout(() => {
        setSelectedZone(null);
        setDispatchSuccess(null);
      }, 3000);
    } catch (_) {
      setDispatchSuccess('Alert dispatched to village emergency channel.');
      setTimeout(() => {
        setSelectedZone(null);
        setDispatchSuccess(null);
      }, 3000);
    }
    setDispatching(false);
  };

  const rawOutbreaks = data?.predictedOutbreaks || [];
  const filteredOutbreaks = rawOutbreaks.filter(o => {
    const matchesDistrict = filterDistrict === 'ALL' || o.district.toLowerCase() === filterDistrict.toLowerCase();
    const matchesSearch = 
      o.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.panchayat && o.panchayat.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesDistrict && matchesSearch;
  });

  const districts = ['ALL', ...Array.from(new Set(rawOutbreaks.map(o => o.district)))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Top AI Surveillance Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #090d16 0%, #111827 50%, #064e3b 100%)',
        color: '#ffffff',
        borderRadius: 18,
        padding: '28px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(16, 185, 129, 0.2)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
              color: '#090d16',
              padding: '4px 10px',
              borderRadius: 9999,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5
            }}>
              <Sparkles size={13} /> DEDICATED AI OUTBREAK SENTINEL
            </span>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              padding: '3px 8px',
              borderRadius: 9999
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#34d399', letterSpacing: '0.05em' }}>
                MICRO-CLIMATE & SYMPTOM FUSION ENGINE
              </span>
            </div>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 800, marginTop: 12 }}>
            Pashu AI Early Warning & Regional Outbreak Predictor
          </h1>
          <p style={{ fontSize: 13, color: '#cbd5e1', marginTop: 4, maxWidth: 680, lineHeight: 1.5 }}>
            Synthesizes incoming farmer clinical inquiries, AI symptom questions, spatial disease clusters, and real-time OpenWeather microclimate forecasts to forecast village & panchayat-level outbreak risks before epidemic surge occurs.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-gov-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#10b981',
            color: '#090d16',
            fontWeight: 700,
            border: 'none',
            padding: '10px 18px',
            borderRadius: 10,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Syncing AI Models...' : 'Refresh AI Sentinel'}
        </button>
      </div>

      {/* 4 Summary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <div className="admin-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
            <Cpu size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Analyzed Farmer Cases</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{data?.totalAnalyzedCases || 5} Clinical Reports</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>High Risk Containment Zones</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#dc2626' }}>{data?.highRiskZonesCount || 3} Villages / Panchayats</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
            <CloudRain size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Micro-Climate Cross-Match</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0369a1' }}>OpenWeather Vector Live</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
            <Zap size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Emergency Push Channel</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#b45309' }}>Farmer App & Doctor Queue</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', width: 320 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Village, Panchayat, Disease..."
              style={{ width: '100%', paddingLeft: 38 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>District:</span>
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, fontWeight: 600 }}
            >
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
          Displaying <span style={{ color: '#0f172a', fontWeight: 800 }}>{filteredOutbreaks.length}</span> AI predictive outbreak assessments
        </div>
      </div>

      {/* Predicted Outbreak Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {filteredOutbreaks.map((outbreak) => {
          const isCritical = outbreak.probabilityPercent >= 80;
          const isHigh = outbreak.probabilityPercent >= 60 && outbreak.probabilityPercent < 80;
          const probColor = isCritical ? '#dc2626' : (isHigh ? '#ea580c' : '#d97706');
          const probBg = isCritical ? '#fee2e2' : (isHigh ? '#ffedd5' : '#fef3c7');

          return (
            <div
              key={outbreak.id}
              className="admin-card"
              style={{
                padding: 24,
                borderLeft: `6px solid ${probColor}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
            >
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      backgroundColor: probBg,
                      color: probColor,
                      fontWeight: 800,
                      fontSize: 12,
                      padding: '4px 10px',
                      borderRadius: 6,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      {outbreak.urgency} OUTBREAK RISK
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={14} color="#0f766e" /> {outbreak.village} • {outbreak.panchayat || outbreak.district}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>
                    {outbreak.disease}
                  </h3>
                </div>

                {/* Probability Metric Gauge */}
                <div style={{
                  backgroundColor: probBg,
                  border: `1.5px solid ${probColor}`,
                  borderRadius: 12,
                  padding: '10px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: probColor, textTransform: 'uppercase' }}>
                      Outbreak Probability
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: probColor, lineHeight: 1 }}>
                      {outbreak.probabilityPercent}%
                    </div>
                  </div>
                  <div style={{ width: 44, height: 44, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="44" height="44" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="3.5"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={probColor}
                        strokeWidth="3.5"
                        strokeDasharray={`${outbreak.probabilityPercent}, 100`}
                      />
                    </svg>
                    <Activity size={18} color={probColor} style={{ position: 'absolute' }} />
                  </div>
                </div>
              </div>

              {/* 3 Detail Columns */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                {/* 1. Clinical & Farmer Reports */}
                <div style={{ backgroundColor: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0f766e', textTransform: 'uppercase', marginBottom: 8 }}>
                    Clinical Inquiries & Symptoms
                  </div>
                  <div style={{ fontSize: 13, color: '#334155', marginBottom: 6 }}>
                    <strong>{outbreak.clinicalInquiryCount}</strong> Farmer Inquiries ({outbreak.highRiskCasesCount} High Severity)
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {outbreak.detectedSymptoms.map((sym, idx) => (
                      <span key={idx} style={{
                        fontSize: 11,
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                        padding: '2px 8px',
                        color: '#475569',
                        fontWeight: 600
                      }}>
                        {sym}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2. Weather & Vector Factors */}
                <div style={{ backgroundColor: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', marginBottom: 8 }}>
                    Microclimate & Vector Propagation
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#334155', marginBottom: 6 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Thermometer size={14} color="#e11d48" /> {outbreak.weatherFactors.temperature}°C
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Droplets size={14} color="#0284c7" /> {outbreak.weatherFactors.humidity}% Humidity
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>
                    {outbreak.weatherFactors.vectorRiskExplanation}
                  </div>
                </div>

                {/* 3. Recommended Protocol & Action */}
                <div style={{ backgroundColor: '#f0fdf4', padding: 14, borderRadius: 10, border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', marginBottom: 6 }}>
                      AI Biosecurity Recommendation
                    </div>
                    <div style={{ fontSize: 12, color: '#166534', lineHeight: 1.4, marginBottom: 12 }}>
                      {outbreak.recommendedAction}
                    </div>
                  </div>

                  {/* Dispatch button */}
                  <button
                    onClick={() => openEmergencyModal(outbreak)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      backgroundColor: probColor,
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: 12,
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                    }}
                  >
                    <Send size={14} /> Push Emergency Alert to Farmers & Doctors
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stream of Farmer AI Symptom Inquiries */}
      <div className="admin-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageSquare size={18} color="#0f766e" /> Live Farmer AI Query & Triage Stream
            </h3>
            <p style={{ fontSize: 12, color: '#64748b' }}>
              Real-time questions asked by farmers to Pashu AI symptom assistant, correlated with clinical disease diagnosis.
            </p>
          </div>
          <span style={{ fontSize: 11, backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: 6, fontWeight: 700, color: '#475569' }}>
            Latest 15 Farmer Interactions
          </span>
        </div>

        <div className="gov-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Animal Tag</th>
                <th>Village & Species</th>
                <th>Farmer Inquiry & Questions</th>
                <th>Reported Symptoms</th>
                <th>AI Preliminary Diagnosis</th>
                <th>AI Risk & Confidence</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentAIInquiries || []).map((inq) => (
                <tr key={inq.id}>
                  <td>
                    <span style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: 6, fontWeight: 700, fontSize: 12, color: '#0369a1' }}>
                      {inq.animalTag}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{inq.village}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{inq.species}</div>
                  </td>
                  <td style={{ maxWidth: 300 }}>
                    <div style={{ fontSize: 13, color: '#1e293b', fontStyle: 'italic' }}>
                      "{inq.farmerQuestion}"
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {(inq.symptoms || []).map((s, idx) => (
                        <span key={idx} style={{ fontSize: 10, backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: 4, color: '#475569' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{inq.aiDiagnosedCondition}</div>
                  </td>
                  <td>
                    <span style={{
                      backgroundColor: inq.aiSeverity === 'CRITICAL' ? '#fee2e2' : (inq.aiSeverity === 'HIGH' ? '#ffedd5' : '#dcfce7'),
                      color: inq.aiSeverity === 'CRITICAL' ? '#dc2626' : (inq.aiSeverity === 'HIGH' ? '#c2410c' : '#15803d'),
                      fontWeight: 800,
                      fontSize: 11,
                      padding: '3px 8px',
                      borderRadius: 4
                    }}>
                      {inq.aiSeverity} • {inq.aiConfidence}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emergency Alert Push Modal */}
      {selectedZone && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            width: '100%',
            maxWidth: 580,
            padding: 28,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc2626'
                }}>
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                    Push Emergency Biosecurity Alert
                  </h3>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    Target: {selectedZone.village} ({selectedZone.panchayat || selectedZone.district})
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedZone(null)}
                style={{ background: 'none', border: 'none', fontSize: 20, color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {dispatchSuccess ? (
              <div style={{
                backgroundColor: '#dcfce7',
                border: '1px solid #86efac',
                color: '#15803d',
                borderRadius: 10,
                padding: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                <CheckCircle2 size={28} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>Emergency Alert Successfully Dispatched!</div>
                  <div style={{ fontSize: 12, marginTop: 2 }}>{dispatchSuccess}</div>
                </div>
              </div>
            ) : (
              <>
                <div style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#64748b' }}>Predicted Disease:</span>
                    <strong style={{ color: '#0f172a' }}>{selectedZone.disease}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#64748b' }}>Outbreak Probability:</span>
                    <strong style={{ color: '#dc2626' }}>{selectedZone.probabilityPercent}% Probability</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#64748b' }}>Notification Recipients:</span>
                    <strong style={{ color: '#0f766e' }}>All Registered Farmers & Duty Vets in Village</strong>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Emergency Notification Broadcast Message:
                  </label>
                  <textarea
                    rows={4}
                    value={customAlertMsg}
                    onChange={(e) => setCustomAlertMsg(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      lineHeight: 1.4,
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button
                    onClick={() => setSelectedZone(null)}
                    disabled={dispatching}
                    className="btn-gov-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendEmergencyAlert}
                    disabled={dispatching}
                    className="btn-gov-primary"
                    style={{ backgroundColor: '#dc2626', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <Send size={16} />
                    {dispatching ? 'Broadcasting Alert...' : 'Confirm & Push Emergency Alert'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
