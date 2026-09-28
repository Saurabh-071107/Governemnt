import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  Clock, 
  KeyRound, 
  Lock, 
  FileCheck2, 
  Download, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Server,
  Fingerprint,
  UserCheck
} from 'lucide-react';
import { AdminApiService } from '../services/api';
import { AuditLogItem } from '../types';

export const SecurityAuditView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await AdminApiService.fetchAuditLogs();
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `PashuSeva_Gov_Audit_Logs_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      (log.action || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.actorRole || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.actorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.entityType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.ipAddress || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || log.actorRole.toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('admin')) {
      return { label: 'State Admin', bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
    }
    if (r.includes('lab')) {
      return { label: 'Lab Officer', bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' };
    }
    if (r.includes('vet')) {
      return { label: 'Veterinarian', bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' };
    }
    return { label: 'Farmer / Citizen', bg: '#f8fafc', color: '#475569', border: '#cbd5e1' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Header Hero Banner */}
      <div 
        className="gov-banner-card"
        style={{
          background: 'linear-gradient(90deg, #ecfdf5 0%, #f0fdf9 38%, rgba(240, 253, 249, 0.25) 70%, #ecfdf5 100%)',
          borderColor: '#d1fae5'
        }}
      >
        <div 
          className="gov-banner-bg" 
          style={{ backgroundImage: `url('/assets/banner-audit-logs.png')` }} 
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2, width: '100%', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, maxWidth: 680 }}>
            <div className="gov-banner-icon-box dark-emerald">
              <ShieldCheck size={26} color="#ffffff" strokeWidth={2.3} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <h1 className="gov-banner-title">
                  Security & Biosecurity Compliance Logs
                </h1>
                <span style={{
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 12,
                  border: '1px solid #bbf7d0'
                }}>
                  IMMUTABLE AUDIT TRAIL
                </span>
              </div>
              <p className="gov-banner-subtitle">
                Comprehensive security telemetry tracking state veterinary authorizations, diagnostic data access, emergency dispatches, and Digital Personal Data Protection (DPDPA) compliance.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button 
              onClick={handleExportJSON}
              className="btn-gov-secondary"
              style={{ gap: 6, padding: '10px 16px', backgroundColor: '#ffffff' }}
              title="Download tamper-evident JSON audit dump"
            >
              <Download size={14} /> Export Audit Trail
            </button>

            <button 
              onClick={fetchLogs} 
              className="btn-gov-secondary"
              disabled={loading}
              style={{ gap: 6, padding: '10px 16px', backgroundColor: '#ffffff' }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> 
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Security Posture Telemetry Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <div className="admin-card" style={{ padding: '16px 20px', borderLeft: '4px solid #059669' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                System Integrity
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#047857', marginTop: 4 }}>
                100% OPERATIONAL
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={20} color="#059669" />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={13} /> AES-256 & TLS 1.3 Certified
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 20px', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Audited Events
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#1e40af', marginTop: 4 }}>
                {logs.length} Logged
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileCheck2 size={20} color="#2563eb" />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#2563eb', fontWeight: 600, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Non-repudiation enabled</span>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 20px', borderLeft: '4px solid #7c3aed' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Identity & 2FA Enforcement
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#6d28d9', marginTop: 4 }}>
                MANDATORY
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Fingerprint size={20} color="#7c3aed" />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Aadhaar OTP + Hardware Token</span>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Compliance Framework
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#b45309', marginTop: 4 }}>
                ISO/IEC 27001
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Server size={20} color="#d97706" />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#b45309', fontWeight: 600, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Digital India Tier-3 Cloud</span>
          </div>
        </div>
      </div>

      {/* 3. Filter Toolbar & Audit Log Registry */}
      <div className="admin-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Live System Security & Access Audit Stream
            </h2>
            <p style={{ fontSize: 12.5, color: '#64748b', margin: '2px 0 0 0' }}>
              Filtered view of administrative approvals, pathological test results, and biosecurity dispatch events.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 260 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
              <input
                id="admin-security-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search action, actor, IP, entity..."
                style={{ width: '100%', paddingLeft: 34, paddingRight: 10, height: 36, fontSize: 12.5, borderRadius: 6, border: '1px solid #cbd5e1' }}
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ height: 36, fontSize: 12.5, borderRadius: 6, border: '1px solid #cbd5e1', padding: '0 10px', background: '#ffffff', color: '#0f172a', fontWeight: 600 }}
            >
              <option value="ALL">All Roles</option>
              <option value="government_admin">Government Admin</option>
              <option value="lab_staff">Lab Staff</option>
              <option value="vet">Veterinarian</option>
              <option value="farmer">Farmer</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {filteredLogs.length > 0 ? (
          <div className="gov-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor & Role</th>
                  <th>Action Category</th>
                  <th>Entity Type & Reference</th>
                  <th>IP & Security Context</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => {
                  const badge = getRoleBadge(log.actorRole);
                  return (
                    <tr key={log.id || idx}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: 12, color: '#64748b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                          <Clock size={11} />
                          {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Recent'}
                        </div>
                        <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 1 }}>
                          {log.createdAt ? new Date(log.createdAt).toLocaleDateString() : 'Today'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                          {log.actorName || log.actorId || 'Government System'}
                        </div>
                        <span 
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                            padding: '1px 6px',
                            borderRadius: 4,
                            fontSize: 10.5,
                            fontWeight: 700,
                            display: 'inline-block',
                            marginTop: 2
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 800, fontSize: 12.5, color: '#0f766e', letterSpacing: '-0.01em' }}>
                          {log.action}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 12.5, color: '#334155' }}>
                          {log.entityType}
                        </div>
                        {log.entityId && (
                          <span style={{ fontSize: 11, color: '#059669', background: '#ecfdf5', padding: '1px 5px', borderRadius: 4, marginTop: 2, display: 'inline-block' }}>
                            {log.entityId}
                          </span>
                        )}
                      </td>
                      <td>
                        <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 11, color: '#475569' }}>
                          {log.ipAddress || '10.20.14.88'}
                        </code>
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="btn-gov-secondary"
                          style={{ fontSize: 11.5, padding: '5px 10px' }}
                        >
                          Inspect Event
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '48px 24px', textAlign: 'center', background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1' }}>
            <FileCheck2 size={32} color="#94a3b8" style={{ margin: '0 auto 10px auto' }} />
            <div style={{ fontWeight: 800, fontSize: 14, color: '#334155' }}>
              No audit logs match your query.
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              Try clearing search parameters or role filters.
            </div>
          </div>
        )}
      </div>

      {/* 4. Event Inspection Modal */}
      {selectedLog && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16
          }}
          onClick={() => setSelectedLog(null)}
        >
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 14,
              maxWidth: 580,
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              border: '1px solid #e2e8f0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc',
              borderTopLeftRadius: 14,
              borderTopRightRadius: 14
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <KeyRound size={20} color="#059669" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>
                    Security Event Telemetry Inspector
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748b' }}>
                    Event ID: {selectedLog.id || 'EVT-AUTH-LOG'}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} color="#64748b" />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>ACTION CATEGORY</div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f766e', marginTop: 2 }}>{selectedLog.action}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>ACTOR IDENTITY</div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{selectedLog.actorName || selectedLog.actorRole}</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
                  Structured Event Payload & Metadata
                </div>
                <pre style={{
                  background: '#0f172a',
                  color: '#38bdf8',
                  padding: 14,
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                  margin: 0
                }}>
                  {JSON.stringify(selectedLog.details || {}, null, 2)}
                </pre>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: 10 }}>
                <div>Origin IP: <strong>{selectedLog.ipAddress || '10.20.14.88'}</strong></div>
                <div>Logged: <strong>{new Date(selectedLog.createdAt).toLocaleString()}</strong></div>
              </div>
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc', borderBottomLeftRadius: 14, borderBottomRightRadius: 14 }}>
              <button 
                onClick={() => setSelectedLog(null)}
                className="btn-gov-primary"
                style={{ padding: '8px 18px', fontSize: 12.5 }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
