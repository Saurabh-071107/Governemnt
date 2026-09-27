import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Tag, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  AlertCircle, 
  Filter, 
  FileText, 
  ExternalLink,
  RefreshCw,
  Eye
} from 'lucide-react';
import { MarketplaceListingItem } from '../types';
import { AdminApiService } from '../services/api';

interface MarketplaceVerificationViewProps {
  onInspectAnimalTag?: (tag: string) => void;
}

export const MarketplaceVerificationView: React.FC<MarketplaceVerificationViewProps> = ({
  onInspectAnimalTag
}) => {
  const [listings, setListings] = useState<MarketplaceListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Action modal state
  const [selectedListing, setSelectedListing] = useState<MarketplaceListingItem | null>(null);
  const [actionType, setActionType] = useState<'VERIFY' | 'REJECT' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    const data = await AdminApiService.fetchMarketplaceListings();
    setListings(data);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const data = await AdminApiService.fetchMarketplaceListings();
    setListings(data);
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleConfirmAction = async () => {
    if (!selectedListing || !actionType) return;
    setProcessing(true);
    const res: any = await AdminApiService.verifyMarketplaceListing(
      selectedListing.id,
      actionType === 'VERIFY' ? 'VERIFIED' : 'REJECTED',
      remarks,
      rejectionReason
    );
    setProcessing(false);
    setSuccessMsg(res?.message || `Listing successfully ${actionType === 'VERIFY' ? 'approved' : 'rejected'}.`);
    
    // Refresh local list
    const updated = await AdminApiService.fetchMarketplaceListings();
    setListings(updated);

    setTimeout(() => {
      setSelectedListing(null);
      setActionType(null);
      setRemarks('');
      setRejectionReason('');
      setSuccessMsg('');
    }, 2000);
  };

  const filtered = listings.filter(item => {
    const matchesStatus = statusFilter === 'ALL' || (item.verificationStatus || 'PENDING').toUpperCase() === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || (item.category || '').toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.farmerName && item.farmerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.animalTag && item.animalTag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.village && item.village.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const pendingCount = listings.filter(l => (l.verificationStatus || 'PENDING').toUpperCase() === 'PENDING').length;
  const verifiedCount = listings.filter(l => (l.verificationStatus || '').toUpperCase() === 'VERIFIED').length;
  const rejectedCount = listings.filter(l => (l.verificationStatus || '').toUpperCase() === 'REJECTED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
            Farmer Marketplace & Trade Verification Center
          </h2>
          <p style={{ fontSize: 13, color: '#64748b' }}>
            Official regulatory oversight for livestock and agricultural trades listed on the Farmer App. Ensure animal health certificates and ear tag compliance prior to public sale.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-gov-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Syncing...' : 'Refresh Listings'}
        </button>
      </div>

      {/* 3 Status KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div
          onClick={() => setStatusFilter('PENDING')}
          className="admin-card"
          style={{
            padding: 18,
            cursor: 'pointer',
            border: statusFilter === 'PENDING' ? '2px solid #d97706' : '1px solid #e2e8f0',
            backgroundColor: statusFilter === 'PENDING' ? '#fefce8' : '#ffffff'
          }}
        >
          <div style={{ fontSize: 12, color: '#d97706', fontWeight: 700, textTransform: 'uppercase' }}>
            Pending Govt Review
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#b45309', marginTop: 4 }}>
            {pendingCount} Listings
          </div>
          <div style={{ fontSize: 11, color: '#78716c', marginTop: 2 }}>Requires inspection approval</div>
        </div>

        <div
          onClick={() => setStatusFilter('VERIFIED')}
          className="admin-card"
          style={{
            padding: 18,
            cursor: 'pointer',
            border: statusFilter === 'VERIFIED' ? '2px solid #16a34a' : '1px solid #e2e8f0',
            backgroundColor: statusFilter === 'VERIFIED' ? '#f0fdf4' : '#ffffff'
          }}
        >
          <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, textTransform: 'uppercase' }}>
            Certified & Approved
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#15803d', marginTop: 4 }}>
            {verifiedCount} Listings
          </div>
          <div style={{ fontSize: 11, color: '#78716c', marginTop: 2 }}>Live on Farmer Marketplace</div>
        </div>

        <div
          onClick={() => setStatusFilter('REJECTED')}
          className="admin-card"
          style={{
            padding: 18,
            cursor: 'pointer',
            border: statusFilter === 'REJECTED' ? '2px solid #dc2626' : '1px solid #e2e8f0',
            backgroundColor: statusFilter === 'REJECTED' ? '#fef2f2' : '#ffffff'
          }}
        >
          <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 700, textTransform: 'uppercase' }}>
            Trade Rejected / Flagged
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#b91c1c', marginTop: 4 }}>
            {rejectedCount} Listings
          </div>
          <div style={{ fontSize: 11, color: '#78716c', marginTop: 2 }}>Non-compliant with biosecurity</div>
        </div>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 280 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Title, Farmer, Tag..."
              style={{ width: '100%', paddingLeft: 38 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  border: '1px solid #cbd5e1',
                  backgroundColor: statusFilter === st ? '#0f172a' : '#ffffff',
                  color: statusFilter === st ? '#ffffff' : '#475569',
                  cursor: 'pointer'
                }}
              >
                {st}
              </button>
            ))}
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12, fontWeight: 600 }}
          >
            <option value="ALL">All Categories</option>
            <option value="cow">Cattle / Cow</option>
            <option value="buffalo">Buffalo</option>
            <option value="goat">Goat / Sheep</option>
            <option value="fodder">Fodder / Feed</option>
            <option value="equipment">Equipment</option>
          </select>
        </div>

        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
          Showing {filtered.length} of {listings.length} listings
        </div>
      </div>

      {/* Listings Table */}
      <div className="gov-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Listing Details</th>
              <th>Category & Price</th>
              <th>Farmer / Seller</th>
              <th>Ear Tag & Health Cert</th>
              <th>Verification Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                  No marketplace listings found matching the selected filter.
                </td>
              </tr>
            ) : (
              filtered.map(listing => {
                const isVerified = (listing.verificationStatus || '').toUpperCase() === 'VERIFIED';
                const isRejected = (listing.verificationStatus || '').toUpperCase() === 'REJECTED';
                const isPending = !isVerified && !isRejected;

                return (
                  <tr key={listing.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>{listing.title}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, maxWidth: 280 }}>
                        {listing.description || 'Farmer farm sale listing'}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                        Listed: {new Date(listing.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td>
                      <span style={{
                        display: 'inline-block',
                        backgroundColor: '#f1f5f9',
                        padding: '3px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#334155'
                      }}>
                        {listing.category}
                      </span>
                      <div style={{ fontSize: 15, fontWeight: 900, color: '#0f766e', marginTop: 4 }}>
                        ₹ {listing.expectedPrice?.toLocaleString() || 'N/A'}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{listing.farmerName || 'Registered Farmer'}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{listing.farmerPhone || 'Verified Phone'}</div>
                      <div style={{ fontSize: 11, color: '#0284c7', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                        <MapPin size={11} /> {listing.village || 'Pune'}
                      </div>
                    </td>

                    <td>
                      {listing.animalTag ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{
                              backgroundColor: '#e0f2fe',
                              color: '#0369a1',
                              fontWeight: 700,
                              fontSize: 12,
                              padding: '2px 6px',
                              borderRadius: 4
                            }}>
                              {listing.animalTag}
                            </span>
                            {onInspectAnimalTag && (
                              <button
                                onClick={() => onInspectAnimalTag(listing.animalTag!)}
                                title="Inspect Medical Dossier"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#0284c7',
                                  cursor: 'pointer',
                                  padding: 0
                                }}
                              >
                                <Eye size={14} />
                              </button>
                            )}
                          </div>
                          <div style={{ fontSize: 10, color: '#16a34a', marginTop: 3, fontWeight: 600 }}>
                            {listing.healthCertificateTag ? `Cert: ${listing.healthCertificateTag}` : 'Vaccination Checked'}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>N/A (Feed/Item)</span>
                      )}
                    </td>

                    <td>
                      {isVerified ? (
                        <div>
                          <span style={{
                            backgroundColor: '#dcfce7',
                            color: '#15803d',
                            fontWeight: 800,
                            fontSize: 11,
                            padding: '4px 8px',
                            borderRadius: 6,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            <ShieldCheck size={13} /> GOVT CERTIFIED
                          </span>
                          {listing.verifiedByName && (
                            <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                              by {listing.verifiedByName}
                            </div>
                          )}
                        </div>
                      ) : isRejected ? (
                        <div>
                          <span style={{
                            backgroundColor: '#fee2e2',
                            color: '#b91c1c',
                            fontWeight: 800,
                            fontSize: 11,
                            padding: '4px 8px',
                            borderRadius: 6,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            <XCircle size={13} /> REJECTED
                          </span>
                          {listing.rejectionReason && (
                            <div style={{ fontSize: 10, color: '#b91c1c', marginTop: 2 }}>
                              {listing.rejectionReason}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{
                          backgroundColor: '#fef3c7',
                          color: '#b45309',
                          fontWeight: 800,
                          fontSize: 11,
                          padding: '4px 8px',
                          borderRadius: 6,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          <AlertCircle size={13} /> PENDING APPROVAL
                        </span>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {!isVerified && (
                          <button
                            onClick={() => {
                              setSelectedListing(listing);
                              setActionType('VERIFY');
                              setRemarks('Meets all state veterinary biosecurity and tagging requirements.');
                            }}
                            className="btn-gov-primary"
                            style={{ padding: '6px 10px', fontSize: 12, backgroundColor: '#16a34a' }}
                          >
                            Approve
                          </button>
                        )}
                        {!isRejected && (
                          <button
                            onClick={() => {
                              setSelectedListing(listing);
                              setActionType('REJECT');
                              setRejectionReason('Missing mandatory ear tag or unverified vaccination');
                            }}
                            className="btn-gov-secondary"
                            style={{ padding: '6px 10px', fontSize: 12, color: '#dc2626', borderColor: '#fca5a5' }}
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Verification / Rejection Modal */}
      {selectedListing && actionType && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
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
            maxWidth: 520,
            padding: 24,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                {actionType === 'VERIFY' ? 'Approve & Certify Listing' : 'Reject Marketplace Listing'}
              </h3>
              <button
                onClick={() => { setSelectedListing(null); setActionType(null); }}
                style={{ background: 'none', border: 'none', fontSize: 20, color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {successMsg ? (
              <div style={{
                backgroundColor: '#dcfce7',
                border: '1px solid #86efac',
                color: '#15803d',
                borderRadius: 10,
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}>
                <CheckCircle2 size={24} />
                <div style={{ fontWeight: 700, fontSize: 14 }}>{successMsg}</div>
              </div>
            ) : (
              <>
                <div style={{ backgroundColor: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedListing.title}</div>
                  <div style={{ color: '#64748b', marginTop: 2 }}>
                    Seller: {selectedListing.farmerName} • Price: ₹ {selectedListing.expectedPrice?.toLocaleString()}
                  </div>
                  {selectedListing.animalTag && (
                    <div style={{ color: '#0369a1', fontWeight: 600, marginTop: 4 }}>
                      Tag: {selectedListing.animalTag}
                    </div>
                  )}
                </div>

                {actionType === 'VERIFY' ? (
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Official Certification Remarks:
                    </label>
                    <textarea
                      rows={3}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Remarks on health check compliance..."
                      style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                    />
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#dc2626', marginBottom: 6 }}>
                      Reason for Trade Rejection:
                    </label>
                    <textarea
                      rows={3}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain why this listing cannot be certified..."
                      style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button
                    onClick={() => { setSelectedListing(null); setActionType(null); }}
                    disabled={processing}
                    className="btn-gov-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAction}
                    disabled={processing}
                    className="btn-gov-primary"
                    style={{
                      backgroundColor: actionType === 'VERIFY' ? '#16a34a' : '#dc2626'
                    }}
                  >
                    {processing ? 'Processing...' : (actionType === 'VERIFY' ? 'Confirm & Certify' : 'Confirm Rejection')}
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
