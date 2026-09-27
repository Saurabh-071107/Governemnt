import React, { useState, useEffect } from 'react';
import { Shield, Search, RefreshCw, KeyRound, Clock } from 'lucide-react';
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
    l.entityType.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Security & Regulatory Audit Trail</h2>
          <p style={{ fontSize: 13, color: '#64748b' }}>
            Immutable event records: veterinarian verification approvals, emergency broadcasts, and auto-dispatch logs.
          </p>
        </div>

        <button onClick={fetchLogs} className="btn-gov-secondary" disabled={loading} style={{ gap: 6 }}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Logs
        </button>
      </div>

      <div style={{ position: 'relative', maxWidth: 400 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
        <input
          id="admin-audit-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter audit events..."
          style={{ width: '100%', paddingLeft: 38 }}
        />
      </div>

      <div className="gov-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor Role</th>
              <th>Action Category</th>
              <th>Entity Type</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
                  No audit logs matching query. System operations are running securely.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, idx) => (
                <tr key={idx}>
                  <td>
                    <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={12} /> {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#0f766e' }}>{log.actorRole}</span>
                  </td>
                  <td>
                    <span style={{
                      backgroundColor: '#f1f5f9',
                      padding: '3px 8px',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#0f172a'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.entityType}</td>
                  <td>
                    <div style={{ maxWidth: 350, fontSize: 12, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {typeof log.details === 'object' ? JSON.stringify(log.details) : (log.details || 'System event recorded')}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
