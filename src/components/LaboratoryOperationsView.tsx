import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Building2, 
  FileText, 
  Filter, 
  MapPin, 
  Phone, 
  Microscope,
  X,
  ExternalLink,
  ShieldAlert,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import { AdminApiService } from '../services/api';
import { LabTestBooking, DiagnosticLaboratory, LabTestReport } from '../types';

export const LaboratoryOperationsView: React.FC = () => {
  const [queue, setQueue] = useState<LabTestBooking[]>([]);
  const [labs, setLabs] = useState<DiagnosticLaboratory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [testTypeFilter, setTestTypeFilter] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState<LabTestBooking | null>(null);
  const [selectedReport, setSelectedReport] = useState<LabTestReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const loadLabData = async () => {
    setLoading(true);
    try {
      const [queueData, labsData] = await Promise.all([
        AdminApiService.fetchLabQueue(),
        AdminApiService.fetchLaboratories()
      ]);
      setQueue(queueData || []);
      setLabs(labsData || []);
    } catch (err) {
      console.error('Error fetching laboratory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLabData();
    const interval = setInterval(loadLabData, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleViewReport = async (booking: LabTestBooking) => {
    setSelectedBooking(booking);
    if (booking.report) {
      setSelectedReport(booking.report);
      return;
    }
    setLoadingReport(true);
    const rep = await AdminApiService.fetchLabReport(booking.bookingId || booking.id);
    setSelectedReport(rep);
    setLoadingReport(false);
  };

  // KPI Calculations
  const totalSamples = queue.length;
  const inTestingCount = queue.filter(b => b.status === 'IN_TESTING' || b.status === 'SAMPLE_COLLECTED').length;
  const completedCount = queue.filter(b => b.status === 'REPORT_AVAILABLE' || b.status === 'COMPLETED').length;
  const positivePathogenCount = queue.filter(b => b.report?.isAbnormal).length;

  // Filtered Queue
  const filteredQueue = queue.filter(b => {
    const matchesSearch = 
      (b.bookingId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.animalTag || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.testType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.farmerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.labName || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesType = testTypeFilter === 'ALL' || (b.testType || '').toLowerCase().includes(testTypeFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REPORT_AVAILABLE':
      case 'COMPLETED':
        return { label: 'Report Available', bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' };
      case 'IN_TESTING':
        return { label: 'In Lab Testing', bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' };
      case 'SAMPLE_COLLECTED':
        return { label: 'Sample In-Transit', bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' };
      case 'ACCEPTED':
        return { label: 'Phlebotomist Assigned', bg: '#fffbeb', color: '#d97706', border: '#fde68a' };
      case 'TEST_BOOKED':
      default:
        return { label: 'Slot Booked', bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
    }
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
              <FlaskConical size={26} color="#ffffff" strokeWidth={2.3} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <h1 className="gov-banner-title">
                  State Diagnostic & Laboratory Operations
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
                  LIVE TELEMETRY
                </span>
              </div>
              <p className="gov-banner-subtitle">
                Centralized oversight of biological specimen collection, pathology queues, and pathogen validation across accredited Maharashtra veterinary diagnostic centers.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button 
              onClick={loadLabData} 
              className="btn-gov-secondary"
              disabled={loading}
              style={{ gap: 6, padding: '10px 18px', backgroundColor: '#ffffff' }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> 
              {loading ? 'Refreshing...' : 'Refresh Telemetry'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Live KPI Telemetry Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <div className="admin-card" style={{ padding: '16px 20px', borderLeft: '4px solid #059669' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Diagnostics Booked
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', marginTop: 4 }}>
                {totalSamples}
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Microscope size={20} color="#059669" />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={13} /> Integrated State Lab Network
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 20px', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active In-Testing / Transit
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#1e40af', marginTop: 4 }}>
                {inTestingCount}
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} color="#2563eb" />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#2563eb', fontWeight: 600, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Phlebotomist collection in progress</span>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Reports Certified & Ready
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#047857', marginTop: 4 }}>
                {completedCount}
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} color="#059669" />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Available on Farmer Dossier</span>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Positive Pathogens Isolated
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#b45309', marginTop: 4 }}>
                {positivePathogenCount}
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={20} color="#d97706" />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#b45309', fontWeight: 600, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Alerts linked to Outbreak Engine</span>
          </div>
        </div>
      </div>

      {/* 3. Accredited Diagnostic Laboratories Directory */}
      <div className="admin-card" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Building2 size={18} color="#059669" />
          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Accredited State Veterinary Diagnostic Facilities
          </h2>
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>({labs.length} Facilities Operational)</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
          {labs.map(lab => (
            <div 
              key={lab.id} 
              style={{
                padding: '14px 16px',
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#059669', background: '#dcfce7', padding: '2px 8px', borderRadius: 4 }}>
                  {lab.code}
                </span>
                <span style={{ fontSize: 11.5, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={12} color="#059669" /> {lab.district}, {lab.state}
                </span>
              </div>
              <div style={{ fontWeight: 800, fontSize: 13.5, color: '#0f172a' }}>
                {lab.name}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.3 }}>
                {lab.address}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569', fontWeight: 600 }}>
                <Phone size={12} color="#64748b" /> {lab.phone}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                {lab.testsOffered?.map((t, idx) => (
                  <span 
                    key={idx} 
                    style={{
                      fontSize: 10.5,
                      fontWeight: 600,
                      background: '#ffffff',
                      color: '#0f766e',
                      border: '1px solid #ccfbf1',
                      padding: '2px 6px',
                      borderRadius: 4
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Live Diagnostic Testing Queue Table & Filters */}
      <div className="admin-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Live Specimen Collection & Diagnostic Testing Queue
            </h2>
            <p style={{ fontSize: 12.5, color: '#64748b', margin: '2px 0 0 0' }}>
              Real-time synchronization with Farmer App bookings and Lab Staff pathology stations.
            </p>
          </div>

          {/* Filter Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 240 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
              <input
                id="admin-lab-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tag, booking ID, lab..."
                style={{ width: '100%', paddingLeft: 34, paddingRight: 10, height: 36, fontSize: 12.5, borderRadius: 6, border: '1px solid #cbd5e1' }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ height: 36, fontSize: 12.5, borderRadius: 6, border: '1px solid #cbd5e1', padding: '0 10px', background: '#ffffff', color: '#0f172a', fontWeight: 600 }}
            >
              <option value="ALL">All Statuses</option>
              <option value="TEST_BOOKED">Slot Booked</option>
              <option value="ACCEPTED">Assigned</option>
              <option value="SAMPLE_COLLECTED">Sample In-Transit</option>
              <option value="IN_TESTING">In Testing</option>
              <option value="REPORT_AVAILABLE">Report Certified</option>
            </select>

            <select
              value={testTypeFilter}
              onChange={(e) => setTestTypeFilter(e.target.value)}
              style={{ height: 36, fontSize: 12.5, borderRadius: 6, border: '1px solid #cbd5e1', padding: '0 10px', background: '#ffffff', color: '#0f172a', fontWeight: 600 }}
            >
              <option value="ALL">All Test Types</option>
              <option value="Mastitis">Mastitis (CMT/SCC)</option>
              <option value="PCR">RT-PCR (FMD/LSD)</option>
              <option value="Parasite">Blood Parasite</option>
              <option value="Blood">Complete Blood Count</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {filteredQueue.length > 0 ? (
          <div className="gov-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Booking ID & Date</th>
                  <th>Animal Ear Tag & Type</th>
                  <th>Diagnostic Test Type</th>
                  <th>Sample Collector & OTP</th>
                  <th>Target Laboratory</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueue.map(item => {
                  const badge = getStatusBadge(item.status);
                  return (
                    <tr key={item.id || item.bookingId}>
                      <td>
                        <div style={{ fontWeight: 800, fontSize: 12.5, color: '#0f172a' }}>
                          {item.bookingId || item.id}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <Calendar size={11} /> {item.date || item.slotDate || 'Today'} ({item.slotTime || 'Morning'})
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 800, color: '#059669', fontSize: 13, background: '#ecfdf5', padding: '2px 6px', borderRadius: 4 }}>
                            {item.animalTag}
                          </span>
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                          {item.animalType || 'Bovine'}
                        </div>
                        {item.farmerName && (
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>
                            Farmer: {item.farmerName}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#0f766e' }}>
                          {item.testType}
                        </div>
                        {item.notes && (
                          <div style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            "{item.notes}"
                          </div>
                        )}
                      </td>
                      <td>
                        {item.collectorName ? (
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>
                            {item.collectorName}
                          </div>
                        ) : (
                          <span style={{ fontSize: 11.5, color: '#94a3b8', fontStyle: 'italic' }}>
                            Pending Assignment
                          </span>
                        )}
                        {item.collectionOtp && (
                          <div style={{ fontSize: 11, color: '#059669', fontWeight: 700, marginTop: 2 }}>
                            OTP: {item.collectionOtp}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                          {item.labName || 'Central Regional Lab'}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          {item.district}
                        </div>
                      </td>
                      <td>
                        <span 
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: 11.5,
                            fontWeight: 700,
                            display: 'inline-block'
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleViewReport(item)}
                          className="btn-gov-secondary"
                          style={{ fontSize: 11.5, padding: '5px 10px', gap: 4 }}
                        >
                          <FileText size={12} /> {item.report || item.status === 'REPORT_AVAILABLE' ? 'View Report' : 'Details'}
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
            <Microscope size={32} color="#94a3b8" style={{ margin: '0 auto 10px auto' }} />
            <div style={{ fontWeight: 800, fontSize: 14, color: '#334155' }}>
              No diagnostic sample bookings match the search criteria.
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              Try adjusting your search query, status, or test type filters.
            </div>
          </div>
        )}
      </div>

      {/* 5. Diagnostic Test Report Slide-Over Modal */}
      {selectedBooking && (
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
          onClick={() => { setSelectedBooking(null); setSelectedReport(null); }}
        >
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 14,
              maxWidth: 620,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              border: '1px solid #e2e8f0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
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
                <FlaskConical size={20} color="#059669" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>
                    Diagnostic Report & Pathology Sign-Off
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748b' }}>
                    Booking ID: {selectedBooking.bookingId || selectedBooking.id}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedBooking(null); setSelectedReport(null); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} color="#64748b" />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Animal & Lab Core Meta */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>ANIMAL EAR TAG</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#059669', marginTop: 2 }}>{selectedBooking.animalTag}</div>
                  <div style={{ fontSize: 11.5, color: '#475569' }}>{selectedBooking.animalType || 'Cattle / Bovine'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>DIAGNOSTIC TEST</div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{selectedBooking.testType}</div>
                  <div style={{ fontSize: 11.5, color: '#64748b' }}>{selectedBooking.labName}</div>
                </div>
              </div>

              {/* Report Body */}
              {loadingReport ? (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <RefreshCw size={22} className="spin" color="#059669" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: 12.5, color: '#64748b' }}>Fetching official certified report...</div>
                </div>
              ) : selectedReport ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Status Banner */}
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: 8,
                    background: selectedReport.isAbnormal ? '#fff1f2' : '#f0fdf4',
                    border: `1px solid ${selectedReport.isAbnormal ? '#fecdd3' : '#bbf7d0'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}>
                    {selectedReport.isAbnormal ? (
                      <AlertTriangle size={18} color="#e11d48" />
                    ) : (
                      <CheckCircle2 size={18} color="#059669" />
                    )}
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: selectedReport.isAbnormal ? '#be123c' : '#15803d' }}>
                        {selectedReport.isAbnormal ? 'Pathogen / Clinical Abnormality Detected' : 'Diagnostic Profile Within Normal Limits'}
                      </div>
                      <div style={{ fontSize: 12, color: selectedReport.isAbnormal ? '#9f1239' : '#166534', marginTop: 1 }}>
                        {selectedReport.resultSummary || selectedReport.testResult}
                      </div>
                    </div>
                  </div>

                  {/* Quantitative Parameters */}
                  {selectedReport.parameters && Object.keys(selectedReport.parameters).length > 0 && (
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                        Pathology Test Parameters
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
                        {Object.entries(selectedReport.parameters).map(([key, val], idx) => (
                          <div 
                            key={idx}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              background: '#f8fafc',
                              borderRadius: 6,
                              fontSize: 12.5,
                              border: '1px solid #f1f5f9'
                            }}
                          >
                            <span style={{ fontWeight: 600, color: '#475569' }}>{key}</span>
                            <span style={{ fontWeight: 800, color: '#0f172a' }}>{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Observations */}
                  {selectedReport.observations && (
                    <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                        Veterinary Pathologist Clinical Observation
                      </div>
                      <p style={{ fontSize: 12.5, color: '#334155', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                        {selectedReport.observations}
                      </p>
                    </div>
                  )}

                  {/* Sign-Off */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: 12, fontSize: 12, color: '#64748b' }}>
                    <div>
                      Certified by: <strong>{selectedReport.staffName || selectedReport.finalizedBy || 'Lab Pathologist'}</strong>
                    </div>
                    <div>
                      Date: {selectedReport.finalizedAt ? new Date(selectedReport.finalizedAt).toLocaleDateString() : 'Recent'}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '24px 16px', textAlign: 'center', background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1' }}>
                  <Clock size={24} color="#f59e0b" style={{ margin: '0 auto 6px auto' }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    Laboratory Analysis In Progress
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                    Sample collection is underway or currently in PCR / culture incubator. Certified report will populate automatically upon pathologist completion.
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc', borderBottomLeftRadius: 14, borderBottomRightRadius: 14 }}>
              <button 
                onClick={() => { setSelectedBooking(null); setSelectedReport(null); }}
                className="btn-gov-primary"
                style={{ padding: '8px 18px', fontSize: 12.5 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
