import React, { useState, useEffect, useCallback } from 'react';
import { AdminApiService, EmergencyDutyVet } from '../services/api';
import { AlertTriangle, Phone, MapPin, Stethoscope, RefreshCw, Send, Clock, UserCheck, Radio } from 'lucide-react';

export const EmergencyDispatchView: React.FC = () => {
  const [dutyVets, setDutyVets] = useState<EmergencyDutyVet[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedVet, setSelectedVet] = useState<EmergencyDutyVet | null>(null);
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [caseType, setCaseType] = useState('Disease Outbreak Response');
  const [dispatching, setDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const caseTypes = [
    'Disease Outbreak Response',
    'Mass Livestock Casualty',
    'Zoonotic Disease Suspected',
    'Emergency Vaccination Drive',
    'Anthrax / FMD Containment',
    'Cross-Border Animal Movement Alert',
  ];

  const refresh = useCallback(async () => {
    try {
      const data = await AdminApiService.fetchEmergencyDutyVets();
      setDutyVets(data.onDuty);
      setCount(data.count);
      setLastRefresh(new Date());
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleDispatch = async () => {
    if (!selectedVet) return;
    setDispatching(true);
    await AdminApiService.dispatchEmergencyToVet(selectedVet.id, {
      district: selectedVet.district,
      notes: dispatchNotes,
      caseType,
    });
    setDispatching(false);
    setDispatchSuccess(`Emergency case dispatched to ${selectedVet.name} (${selectedVet.district})`);
    setSelectedVet(null);
    setDispatchNotes('');
    setTimeout(() => setDispatchSuccess(null), 5000);
  };

  const formatDutySince = (iso: string | null) => {
    if (!iso) return 'Active';
    const d = new Date(iso);
    const diff = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 60%, #b91c1c 100%)', borderRadius: 16, padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 24px rgba(220,38,38,0.3)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(255,255,255,0.18)', color: '#fff', padding: '3px 10px', borderRadius: 9999 }}>Gov-Vet Secure Channel</span>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', padding: '2px 8px', borderRadius: 9999 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px #4ade80' }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#bbf7d0', letterSpacing: '0.05em' }}>LIVE - {count} ON DUTY</span>
            </div>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>Emergency Veterinary Dispatch</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>Vets who activated Emergency Duty appear here exclusively. Dispatch emergency cases directly.</p>
        </div>
        <button onClick={refresh} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontWeight: 600, padding: '9px 14px', borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <RefreshCw size={14} /> Sync
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 12 }}>
        <Clock size={13} /> Last synced: {lastRefresh.toLocaleTimeString()} - Auto-refreshes every 5s
      </div>

      {dispatchSuccess && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 12, padding: '12px 16px', color: '#166534', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserCheck size={16} /> {dispatchSuccess}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
          <div>Loading emergency duty roster...</div>
        </div>
      ) : dutyVets.length === 0 ? (
        <div style={{ background: '#fff', border: '2px dashed #e2e8f0', borderRadius: 16, padding: '48px 24px', textAlign: 'center' }}>
          <Radio size={40} style={{ color: '#94a3b8', marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: '#334155', marginBottom: 6 }}>No Vets on Emergency Duty</div>
          <div style={{ fontSize: 13, color: '#64748b', maxWidth: 400, margin: '0 auto' }}>When a veterinarian activates their Emergency Duty toggle in the Vet App, they will appear here for dispatch.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {dutyVets.map(vet => (
            <div key={vet.id} className="admin-card" style={{ border: selectedVet?.id === vet.id ? '2px solid #dc2626' : '1px solid #e2e8f0', cursor: 'pointer', position: 'relative', overflow: 'hidden' }} onClick={() => setSelectedVet(prev => prev?.id === vet.id ? null : vet)}>
              <div style={{ position: 'absolute', top: 12, right: 12, background: '#dcfce7', border: '1px solid #86efac', borderRadius: 9999, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#15803d' }}>ON DUTY</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #7f1d1d, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 800 }}>
                  {vet.name.replace(/^Dr\.?\s*/i, '').split(' ').map((p: string) => p[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{vet.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{vet.licenseNumber}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: '#334155' }}><Stethoscope size={13} style={{ color: '#dc2626', flexShrink: 0 }} />{vet.specialization}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: '#334155' }}><MapPin size={13} style={{ color: '#2563eb', flexShrink: 0 }} />{vet.district} District</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: '#334155' }}><Phone size={13} style={{ color: '#059669', flexShrink: 0 }} />{vet.phone}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: '#64748b' }}><Clock size={12} style={{ flexShrink: 0 }} />On duty since: {formatDutySince(vet.emergencyDutySince)}</div>
              </div>
              {selectedVet?.id === vet.id && (
                <div style={{ marginTop: 16, borderTop: '1px solid #fee2e2', paddingTop: 14 }} onClick={e => e.stopPropagation()}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dispatch Emergency Case</div>
                  <select value={caseType} onChange={e => setCaseType(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #fca5a5', fontSize: 12.5, marginBottom: 8, background: '#fff', color: '#0f172a' }}>
                    {caseTypes.map(ct => <option key={ct}>{ct}</option>)}
                  </select>
                  <textarea value={dispatchNotes} onChange={e => setDispatchNotes(e.target.value)} placeholder="Additional notes for the vet (location, severity, GPS, etc.)..." rows={3} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #fca5a5', fontSize: 12, resize: 'none', marginBottom: 10, boxSizing: 'border-box', color: '#0f172a' }} />
                  <button onClick={handleDispatch} disabled={dispatching} style={{ width: '100%', background: dispatching ? '#94a3b8' : '#dc2626', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 700, fontSize: 13, cursor: dispatching ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Send size={14} />{dispatching ? 'Dispatching...' : 'Dispatch Emergency Case'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', fontSize: 12.5, color: '#92400e', display: 'flex', gap: 10 }}>
        <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
        <span><strong>Restricted Channel:</strong> This panel is exclusively visible to Government Admin. Farmers and general users cannot see which vets are on emergency duty or access dispatch functionality.</span>
      </div>
    </div>
  );
};
