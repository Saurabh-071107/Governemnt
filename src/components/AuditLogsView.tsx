import React, { useState, useEffect } from 'react';
import { Shield, Search, RefreshCw, KeyRound, Clock, FileCheck2, FileSearch } from 'lucide-react';
import { AuditLogItem } from '../types';
import { AdminApiService } from '../services/api';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    const data = await AdminApiService.fetchAuditLogs();
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(query.toLowerCase()) ||
    l.actorRole.toLowerCase().includes(query.toLowerCase()) ||
    l.entityType.toLowerCase().includes(query.toLowerCase()) ||
    (l.details && JSON.stringify(l.details).toLowerCase().includes(query.toLowerCase()))
  );

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
          style={{ backgroundImage: `url('/assets/banner-audit-logs.png')` }} 
        />

        {/* Branding & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, zIndex: 2, maxWidth: 680 }}>
          <div className="gov-banner-icon-box dark-emerald">
            <FileCheck2 size={26} color="#ffffff" strokeWidth={2.3} />
          </div>

          <div>
            <h1 className="gov-banner-title">
              Security & Audit Logs
            </h1>
            <p className="gov-banner-subtitle">
              View and monitor system access, user activities, and security events for better transparency and data protection.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Controls Toolbar: Search & Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 440 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: 12, color: '#94a3b8' }} />
          <input
            id="admin-audit-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter audit events..."
            style={{ width: '100%', paddingLeft: 40, borderRadius: 8 }}
          />
        </div>

        <button 
          onClick={fetchLogs} 
          className="btn-gov-secondary" 
          disabled={loading} 
          style={{ gap: 6, padding: '9px 16px' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Logs
        </button>
      </div>

      {/* 3. Table of Logs or Empty State */}
      {filteredLogs.length > 0 ? (
        <div className="gov-table-wrap">
          <table>
            <thead>
              <tr>
                <th><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={13} /> Timestamp</div></th>
                <th>Actor Role</th>
                <th>Action Category</th>
                <th>Entity Type</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, idx) => (
                <tr key={log.id || idx}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: 12.5, color: '#64748b' }}>
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                  </td>
                  <td>
                    <span style={{
                      backgroundColor: '#f1f5f9',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontWeight: 700,
                      fontSize: 11.5,
                      color: '#0f172a'
                    }}>
                      {log.actorRole}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: '#0f766e', fontSize: 13 }}>
                      {log.action}
                    </strong>
                  </td>
                  <td>
                    <span style={{ fontSize: 12.5, color: '#475569', fontWeight: 600 }}>
                      {log.entityType}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: '#64748b' }}>
                    {log.details ? (
                      <code style={{ background: '#f8fafc', padding: '3px 6px', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                        {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details)}
                      </code>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div 
          className="admin-card" 
          style={{ 
            padding: '64px 32px', 
            textAlign: 'center', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '2px dashed #e2e8f0',
            background: '#ffffff'
          }}
        >
          {/* Centered Document Illustration */}
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: '#ecfdf5',
            border: '2px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 18,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.12)'
          }}>
            <FileSearch size={40} color="#059669" strokeWidth={1.8} />
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
            No Audit Logs Found
          </h3>
          <p style={{ fontSize: 13, color: '#64748b', maxWidth: 420, margin: 0, lineHeight: 1.5 }}>
            No audit logs matching query. System operations are running securely.
          </p>
        </div>
      )}
    </div>
  );
};
