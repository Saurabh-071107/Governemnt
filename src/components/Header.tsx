import React from 'react';
import { Bell, ShieldCheck, User } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh }) => {
  return (
    <header className="admin-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
          National Animal Disease Surveillance & Telemedicine Command
        </h2>
        <span className="badge-verified" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShieldCheck size={14} /> Integrated Biosecurity Level 4
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={onRefresh}
          className="btn-gov-secondary"
          style={{ fontSize: 12, padding: '7px 12px' }}
        >
          Refresh Feed
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 8 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: '#0f766e',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 13
          }}>
            GOI
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>State Veterinary Commissioner</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Department of Animal Husbandry</div>
          </div>
        </div>
      </div>
    </header>
  );
};
