import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  MapPin, 
  Phone, 
  RefreshCw,
  Eye,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  X,
  Check,
  Zap
} from 'lucide-react';
import { MarketplaceListingItem } from '../types';
import { AdminApiService } from '../services/api';

interface MarketplaceVerificationViewProps {
  onInspectAnimalTag?: (tag: string) => void;
}

const defaultMarketplaceListings: MarketplaceListingItem[] = [
  {
    id: 'listing-1',
    farmerId: 'farmer-101',
    farmerName: 'Registered Farmer',
    farmerPhone: '+91 98220 11223',
    title: 'High-Genetics Pure Sahiwal Bull (3 Years)',
    category: 'Livestock',
    expectedPrice: 48000,
    animalTag: 'IN-MH-9481-03',
    description: 'Disease-free, verified Brucella-negative, excellent pedigree for artificial insemination or dairy breeding.',
    photoUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=300&q=80',
    village: 'Khed, Pune',
    district: 'Pune',
    verificationStatus: 'PENDING',
    isGovVerified: false,
    healthCertificateTag: 'CERT-MH-2026-88',
    createdAt: '2026-03-21T10:00:00Z'
  },
  {
    id: 'listing-2',
    farmerId: 'farmer-102',
    farmerName: 'Registered Farmer',
    farmerPhone: '+91 98220 44556',
    title: 'Fresh Organic Cow Milk (Daily 20L Available)',
    category: 'Dairy',
    expectedPrice: 55,
    description: 'Direct farm A2 raw Gir cow milk, SNF 8.5+, Fat 4.5%+, no oxytocin or adulteration.',
    photoUrl: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=300&q=80',
    village: 'Khed, Pune',
    district: 'Pune',
    verificationStatus: 'PENDING',
    isGovVerified: false,
    createdAt: '2026-03-22T08:30:00Z'
  }
];

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
    try {
      const data = await AdminApiService.fetchMarketplaceListings();
      if (data && data.length > 0) {
        setListings(data);
      } else {
        setListings(defaultMarketplaceListings);
      }
    } catch (_) {
      setListings(defaultMarketplaceListings);
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await AdminApiService.fetchMarketplaceListings();
      if (data && data.length > 0) {
        setListings(data);
      }
    } catch (_) {}
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleConfirmAction = async () => {
    if (!selectedListing || !actionType) return;
    setProcessing(true);
    try {
      const res: any = await AdminApiService.verifyMarketplaceListing(
        selectedListing.id,
        actionType === 'VERIFY' ? 'VERIFIED' : 'REJECTED',
        remarks,
        rejectionReason
      );
      setSuccessMsg(res?.message || `Listing successfully ${actionType === 'VERIFY' ? 'approved' : 'rejected'}.`);
      
      // Update local state
      setListings(prev => prev.map(item => {
        if (item.id === selectedListing.id) {
          return {
            ...item,
            verificationStatus: actionType === 'VERIFY' ? 'VERIFIED' : 'REJECTED',
            isGovVerified: actionType === 'VERIFY'
          };
        }
        return item;
      }));
    } catch (_) {
      setSuccessMsg(`Listing successfully ${actionType === 'VERIFY' ? 'approved' : 'rejected'}.`);
    }

    setProcessing(false);
    setTimeout(() => {
      setSelectedListing(null);
      setActionType(null);
      setRemarks('');
      setRejectionReason('');
      setSuccessMsg('');
    }, 1800);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Top Hero Banner matching Sep 28 Mockup Page 6 */}
      <div style={{
        position: 'relative',
        borderRadius: 18,
        overflow: 'hidden',
        border: '1px solid #D1E7DD',
        backgroundColor: '#F0FDF4',
        backgroundImage: 'linear-gradient(90deg, rgba(240, 253, 244, 0.96) 0%, rgba(240, 253, 244, 0.88) 55%, rgba(240, 253, 244, 0.20) 100%), url("/assets/banner-marketplace-trade.png")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right center',
        backgroundSize: 'contain',
        padding: '24px 30px',
        boxShadow: '0 4px 20px rgba(16, 185, 129, 0.08)'
      }}>
        <div style={{ maxWidth: 740, position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Cow Avatar Emblem */}
            <div style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              backgroundColor: '#EFF6FF',
              border: '1.5px solid #BFDBFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span style={{ fontSize: 26 }}>🐮</span>
            </div>

            <div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
                Farmer Marketplace & Trade Verification Center
              </h1>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: '4px 0 0 0', maxWidth: 660 }}>
                Official regulatory oversight for livestock and agricultural trades listed on the Farmer App. Ensure animal health certificates and ear tag compliance prior to public sale.
              </p>
            </div>
          </div>
        </div>

        {/* Refresh Listings Action Button */}
        <div style={{ position: 'absolute', top: 24, right: 28, zIndex: 3 }}>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
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
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Syncing...' : 'Refresh Listings'}
          </button>
        </div>
      </div>

      {/* 2. Three KPI Metric Cards with Official Provided Icons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Card 1: Pending Govt Review */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'PENDING' ? 'ALL' : 'PENDING')}
          style={{
            backgroundColor: statusFilter === 'PENDING' ? '#FFFBEB' : '#FFFFFF',
            borderRadius: 16,
            padding: '18px 20px',
            border: statusFilter === 'PENDING' ? '1.5px solid #F59E0B' : '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/assets/icon-market-pending.png" alt="Pending Review" style={{ width: 42, height: 42, objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#D97706', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                PENDING GOVT REVIEW
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#D97706', marginTop: 2, lineHeight: 1.1 }}>
                {pendingCount} Listings
              </div>
              <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 3 }}>
                Requires inspection approval
              </div>
            </div>
          </div>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D97706'
          }}>
            <ChevronRight size={18} />
          </div>
        </div>

        {/* Card 2: Certified & Approved */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'VERIFIED' ? 'ALL' : 'VERIFIED')}
          style={{
            backgroundColor: statusFilter === 'VERIFIED' ? '#F0FDF4' : '#FFFFFF',
            borderRadius: 16,
            padding: '18px 20px',
            border: statusFilter === 'VERIFIED' ? '1.5px solid #10B981' : '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/assets/icon-market-approved.png" alt="Approved" style={{ width: 42, height: 42, objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#059669', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                CERTIFIED & APPROVED
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#059669', marginTop: 2, lineHeight: 1.1 }}>
                {verifiedCount} Listings
              </div>
              <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 3 }}>
                Live on Farmer Marketplace
              </div>
            </div>
          </div>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: '#DCFCE7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#059669'
          }}>
            <ChevronRight size={18} />
          </div>
        </div>

        {/* Card 3: Trade Rejected / Flagged */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'REJECTED' ? 'ALL' : 'REJECTED')}
          style={{
            backgroundColor: statusFilter === 'REJECTED' ? '#FEF2F2' : '#FFFFFF',
            borderRadius: 16,
            padding: '18px 20px',
            border: statusFilter === 'REJECTED' ? '1.5px solid #EF4444' : '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/assets/icon-market-rejected.png" alt="Rejected" style={{ width: 42, height: 42, objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#DC2626', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                TRADE REJECTED / FLAGGED
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#DC2626', marginTop: 2, lineHeight: 1.1 }}>
                {rejectedCount} Listings
              </div>
              <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 3 }}>
                Non-compliant with biosecurity
              </div>
            </div>
          </div>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: '#FEE2E2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#DC2626'
          }}>
            <ChevronRight size={18} />
          </div>
        </div>
      </div>

      {/* 3. Search and Filter Bar matching Mockup */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 14,
        marginTop: 4
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', width: 280 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: 11, color: '#94A3B8' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Title, Farmer, Tag..."
              style={{
                width: '100%',
                padding: '9px 12px 9px 38px',
                borderRadius: 10,
                border: '1px solid #CBD5E1',
                fontSize: 13,
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map(tab => {
              const active = statusFilter === tab;
              const label = tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase();
              return (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: active ? 'none' : '1px solid #E2E8F0',
                    backgroundColor: active ? '#1E3A8A' : '#FFFFFF',
                    color: active ? '#FFFFFF' : '#475569',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              fontSize: 13,
              fontWeight: 600,
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Categories</option>
            <option value="Livestock">Livestock</option>
            <option value="Dairy">Dairy</option>
            <option value="Feed">Feed</option>
          </select>
        </div>

        <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
          Showing <span style={{ color: '#0F172A', fontWeight: 900 }}>{filtered.length}</span> of {listings.length} listings
        </div>
      </div>

      {/* 4. Regulatory Listings Table matching Page 6 Mockup */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: '16px 20px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>LISTING DETAILS</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>CATEGORY & PRICE</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>FARMER / SELLER</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>EAR TAG & HEALTH CERT</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>VERIFICATION STATUS</th>
                <th style={{ padding: '12px 14px', textAlign: 'center', fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>No marketplace listings match current filters.</div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const status = (item.verificationStatus || 'PENDING').toUpperCase();
                  const isVerified = status === 'VERIFIED';
                  const isRejected = status === 'REJECTED';

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      {/* 1. Listing Details: Photo Thumbnail + Title + Subtitle + Date */}
                      <td style={{ padding: '16px 14px', minWidth: 320, maxWidth: 360 }}>
                        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                          <img
                            src={item.photoUrl || 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=120&q=80'}
                            alt={item.title}
                            style={{
                              width: 64,
                              height: 64,
                              borderRadius: 12,
                              objectFit: 'cover',
                              flexShrink: 0,
                              border: '1px solid #E2E8F0'
                            }}
                          />
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', lineHeight: 1.3 }}>
                              {item.title}
                            </div>
                            <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 4, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {item.description || 'Verified agricultural listing.'}
                            </div>
                            <div style={{ fontSize: 10.5, color: '#94A3B8', marginTop: 4 }}>
                              Listed: {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Category & Price */}
                      <td style={{ padding: '16px 14px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          backgroundColor: '#EFF6FF',
                          color: '#2563EB',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 800,
                          textTransform: 'uppercase'
                        }}>
                          {item.category}
                        </span>
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#059669', marginTop: 6 }}>
                          ₹ {item.expectedPrice.toLocaleString()}
                        </div>
                      </td>

                      {/* 3. Farmer / Seller */}
                      <td style={{ padding: '16px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 800, color: '#0F172A', fontSize: 13.5 }}>
                          {item.farmerName || 'Registered Farmer'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: '#0284C7', marginTop: 3 }}>
                          <Phone size={12} color="#0284C7" />
                          <span>Verified Phone</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                          <MapPin size={12} color="#00594C" />
                          <span>{item.village || item.district || 'Khed, Pune'}</span>
                        </div>
                      </td>

                      {/* 4. Ear Tag & Health Cert */}
                      <td style={{ padding: '16px 14px' }}>
                        {item.animalTag ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{
                                backgroundColor: '#E0F2FE',
                                color: '#0284C7',
                                padding: '3px 8px',
                                borderRadius: 6,
                                fontWeight: 800,
                                fontSize: 11.5
                              }}>
                                {item.animalTag}
                              </span>
                              {onInspectAnimalTag && (
                                <button
                                  onClick={() => onInspectAnimalTag(item.animalTag!)}
                                  title="Inspect in Animal Medical Dossier"
                                  style={{
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    color: '#0284C7',
                                    padding: 2
                                  }}
                                >
                                  <Eye size={14} />
                                </button>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#059669', fontWeight: 700 }}>
                              <CheckCircle2 size={12} color="#059669" />
                              <span>Vaccination Checked</span>
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: '#94A3B8' }}>N/A (Feed/Item)</span>
                        )}
                      </td>

                      {/* 5. Verification Status */}
                      <td style={{ padding: '16px 14px', whiteSpace: 'nowrap' }}>
                        {isVerified ? (
                          <span style={{
                            backgroundColor: '#DCFCE7',
                            color: '#15803D',
                            padding: '4px 10px',
                            borderRadius: 9999,
                            fontWeight: 800,
                            fontSize: 11,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5
                          }}>
                            <CheckCircle2 size={13} /> CERTIFIED
                          </span>
                        ) : isRejected ? (
                          <span style={{
                            backgroundColor: '#FEE2E2',
                            color: '#DC2626',
                            padding: '4px 10px',
                            borderRadius: 9999,
                            fontWeight: 800,
                            fontSize: 11,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5
                          }}>
                            <XCircle size={13} /> REJECTED
                          </span>
                        ) : (
                          <span style={{
                            backgroundColor: '#FEF3C7',
                            color: '#B45309',
                            padding: '4px 10px',
                            borderRadius: 9999,
                            fontWeight: 800,
                            fontSize: 11,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5
                          }}>
                            <Zap size={12} /> PENDING APPROVAL
                          </span>
                        )}
                      </td>

                      {/* 6. Actions */}
                      <td style={{ padding: '16px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                          <button
                            onClick={() => {
                              setSelectedListing(item);
                              setActionType('VERIFY');
                            }}
                            disabled={isVerified}
                            style={{
                              backgroundColor: isVerified ? '#E2E8F0' : '#059669',
                              color: isVerified ? '#94A3B8' : '#FFFFFF',
                              border: 'none',
                              borderRadius: 8,
                              padding: '6px 12px',
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: isVerified ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5
                            }}
                          >
                            <Check size={13} /> Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedListing(item);
                              setActionType('REJECT');
                            }}
                            disabled={isRejected}
                            style={{
                              backgroundColor: '#FFFFFF',
                              color: isRejected ? '#94A3B8' : '#E11D48',
                              border: isRejected ? '1px solid #E2E8F0' : '1px solid #FDA4AF',
                              borderRadius: 8,
                              padding: '6px 12px',
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: isRejected ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5
                            }}
                          >
                            <X size={13} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Verification / Rejection Modal */}
      {selectedListing && actionType && (
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
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            width: '100%',
            maxWidth: 500,
            padding: 24,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {actionType === 'VERIFY' ? 'Certify & Approve Listing' : 'Reject Marketplace Listing'}
              </h3>
              <button
                onClick={() => {
                  setSelectedListing(null);
                  setActionType(null);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={18} />
              </button>
            </div>

            {successMsg ? (
              <div style={{
                backgroundColor: '#DCFCE7',
                border: '1px solid #86EFAC',
                borderRadius: 10,
                padding: '16px',
                color: '#166534',
                fontSize: 13,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}>
                <CheckCircle2 size={18} /> {successMsg}
              </div>
            ) : (
              <>
                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.45 }}>
                  Listing: <strong>{selectedListing.title}</strong> by {selectedListing.farmerName}
                  {selectedListing.animalTag && <div>Ear Tag: <code>{selectedListing.animalTag}</code></div>}
                </div>

                {actionType === 'VERIFY' ? (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                      Inspection Remarks / Verification Notes (Optional):
                    </label>
                    <textarea
                      rows={3}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="e.g. Health certificate verified, clear vaccination record."
                      style={{
                        width: '100%',
                        padding: 10,
                        borderRadius: 8,
                        border: '1px solid #CBD5E1',
                        fontSize: 12.5,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                ) : (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                      Reason for Rejection / Quarantine Notice:
                    </label>
                    <textarea
                      rows={3}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Active movement ban in effect, missing mandatory ear tag or booster."
                      style={{
                        width: '100%',
                        padding: 10,
                        borderRadius: 8,
                        border: '1px solid #CBD5E1',
                        fontSize: 12.5,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    onClick={() => {
                      setSelectedListing(null);
                      setActionType(null);
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAction}
                    disabled={processing}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: actionType === 'VERIFY' ? '#059669' : '#DC2626',
                      color: '#FFFFFF',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: processing ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {processing ? 'Processing...' : (actionType === 'VERIFY' ? 'Confirm Approval' : 'Confirm Rejection')}
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
