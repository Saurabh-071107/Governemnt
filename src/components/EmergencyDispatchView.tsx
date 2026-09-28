import React, { useState, useEffect, useCallback } from 'react';
import { AdminApiService, EmergencyDutyVet } from '../services/api';
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Stethoscope, 
  RefreshCw, 
  Send, 
  Clock, 
  UserCheck, 
  Radio,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

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
      setDutyVets(data.onDuty || []);
      setCount(data.count || 0);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Top Hero Banner matching Sep 28 Mockup Page 5 */}
      <div style={{
        position: 'relative',
        borderRadius: 18,
        overflow: 'hidden',
        border: '1px solid #D1E7DD',
        backgroundColor: '#F0FDF4',
        backgroundImage: 'linear-gradient(90deg, rgba(240, 253, 244, 0.96) 0%, rgba(240, 253, 244, 0.88) 55%, rgba(240, 253, 244, 0.20) 100%), url("/assets/banner-emergency-dispatch.png")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right center',
        backgroundSize: 'contain',
        padding: '24px 30px',
        boxShadow: '0 4px 20px rgba(16, 185, 129, 0.08)'
      }}>
        <div style={{ maxWidth: 740, position: 'relative', zIndex: 2 }}>
          {/* Badges Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
            <span style={{
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              border: '1px solid #FCA5A5',
              padding: '4px 12px',
              borderRadius: 9999,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}>
              <AlertCircle size={13} /> GOV- VET SECURE CHANNEL
            </span>
            <span style={{
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              backgroundColor: '#DCFCE7',
              color: '#15803D',
              border: '1px solid #86EFAC',
              padding: '4px 12px',
              borderRadius: 9999,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', display: 'inline-block' }} />
              LIVE {count} PENDING
            </span>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
            Emergency Veterinary Dispatch
          </h1>
          <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.55, margin: 0, maxWidth: 660 }}>
            Vets who are advised for emergency duty appear here exclusively. Dispatch emergency cases directly.
          </p>
        </div>

        {/* Sync Button */}
        <div style={{ position: 'absolute', top: 24, right: 28, zIndex: 3 }}>
          <button
            onClick={refresh}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              fontWeight: 700,
              fontSize: 13,
              border: '1px solid #CBD5E1',
              padding: '9px 16px',
              borderRadius: 10,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
              transition: 'background-color 0.2s'
            }}
          >
            <RefreshCw size={14} /> Sync
          </button>
        </div>
      </div>

      {/* 2. Last Synced Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', fontSize: 12.5, fontWeight: 500 }}>
        <Clock size={14} color="#64748B" />
        <span>Last synced: {lastRefresh.toLocaleTimeString()} • Auto-refreshes every 5s</span>
      </div>

      {/* Success Notification */}
      {dispatchSuccess && (
        <div style={{
          backgroundColor: '#DCFCE7',
          border: '1px solid #86EFAC',
          borderRadius: 12,
          padding: '12px 18px',
          color: '#166534',
          fontSize: 13,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <CheckCircle2 size={18} /> {dispatchSuccess}
        </div>
      )}

      {/* 3. Main Content: Empty State vs Active Vets List */}
      {loading ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: '50px 24px',
          textAlign: 'center',
          border: '1px solid #E2E8F0',
          color: '#64748B'
        }}>
          <RefreshCw size={24} className="spin" style={{ margin: '0 auto 10px auto', color: '#00594C' }} />
          <div style={{ fontSize: 14, fontWeight: 600 }}>Syncing emergency duty roster...</div>
        </div>
      ) : dutyVets.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '2px dashed #E2E8F0',
          borderRadius: 16,
          padding: '60px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Circular Radio Waves Icon */}
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14
          }}>
            <Radio size={28} color="#2563EB" />
          </div>

          <div style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
            No Vets on Emergency Duty
          </div>
          <div style={{ fontSize: 13, color: '#64748B', maxWidth: 440, lineHeight: 1.5 }}>
            When a veterinarian activates their Emergency Duty toggle in the Vet App, they will appear here for dispatch.
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {dutyVets.map(vet => (
            <div
              key={vet.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: '18px 20px',
                border: selectedVet?.id === vet.id ? '2px solid #DC2626' : '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => setSelectedVet(prev => prev?.id === vet.id ? null : vet)}
            >
              {/* Top right On Duty Pill */}
              <div style={{
                position: 'absolute',
                top: 14,
                right: 14,
                backgroundColor: '#DCFCE7',
                border: '1px solid #86EFAC',
                borderRadius: 9999,
                padding: '2px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#16A34A', display: 'inline-block' }} />
                <span style={{ fontSize: 10, fontWeight: 800, color: '#15803D' }}>ON DUTY</span>
              </div>

              {/* Avatar and Doctor Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  flexShrink: 0,
                  backgroundColor: '#E0F2FE',
                  border: '1px solid #BAE6FD',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284C7',
                  fontSize: 16,
                  fontWeight: 900
                }}>
                  {vet.name.replace(/^Dr\.?\s*/i, '').split(' ').map((p: string) => p[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>{vet.name}</div>
                  <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>{vet.licenseNumber}</div>
                </div>
              </div>

              {/* Doctor Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: '#334155' }}>
                  <Stethoscope size={13} style={{ color: '#00594C', flexShrink: 0 }} />
                  <span>{vet.specialization}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: '#334155' }}>
                  <MapPin size={13} style={{ color: '#2563EB', flexShrink: 0 }} />
                  <span>{vet.district} District</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: '#334155' }}>
                  <Phone size={13} style={{ color: '#059669', flexShrink: 0 }} />
                  <span>{vet.phone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: '#64748B' }}>
                  <Clock size={12} style={{ flexShrink: 0 }} />
                  <span>On duty since: {formatDutySince(vet.emergencyDutySince)}</span>
                </div>
              </div>

              {/* Inline Dispatch Drawer */}
              {selectedVet?.id === vet.id && (
                <div
                  style={{ marginTop: 14, borderTop: '1px solid #FEE2E2', paddingTop: 12 }}
                  onClick={e => e.stopPropagation()}
                >
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: '#DC2626', marginBottom: 6, textTransform: 'uppercase' }}>
                    Dispatch Emergency Case
                  </div>
                  <select
                    value={caseType}
                    onChange={e => setCaseType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 12.5,
                      marginBottom: 8,
                      backgroundColor: '#FFFFFF',
                      color: '#0F172A'
                    }}
                  >
                    {caseTypes.map(ct => <option key={ct}>{ct}</option>)}
                  </select>
                  <textarea
                    value={dispatchNotes}
                    onChange={e => setDispatchNotes(e.target.value)}
                    placeholder="Additional notes for the vet (location, severity, GPS, etc.)..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 12,
                      resize: 'none',
                      marginBottom: 10,
                      boxSizing: 'border-box',
                      color: '#0F172A'
                    }}
                  />
                  <button
                    onClick={handleDispatch}
                    disabled={dispatching}
                    style={{
                      width: '100%',
                      backgroundColor: dispatching ? '#94A3B8' : '#DC2626',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 8,
                      padding: '9px 0',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: dispatching ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <Send size={13} />
                    {dispatching ? 'Dispatching...' : 'Dispatch Emergency Case'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 4. Restricted Channel Warning Banner */}
      <div style={{
        backgroundColor: '#FFFBEB',
        border: '1px solid #FDE68A',
        borderRadius: 12,
        padding: '14px 18px',
        fontSize: 13,
        color: '#92400E',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        lineHeight: 1.45
      }}>
        <AlertTriangle size={18} style={{ flexShrink: 0, color: '#D97706' }} />
        <span>
          <strong>Restricted Channel:</strong> This panel is exclusively visible to Government Admin. Farmers and general users cannot see which vets are on emergency duty or access dispatch functionality.
        </span>
      </div>
    </div>
  );
};
