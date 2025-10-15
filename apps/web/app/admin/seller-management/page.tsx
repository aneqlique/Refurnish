"use client";
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Users, MoreVertical, Search, CheckCircle, XCircle, Eye, Clock, User, Mail, Phone, MapPin, FileText, Store } from 'lucide-react';
import { Montserrat } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard, PackageCheck } from "lucide-react";
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

interface SellerRow {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    role: string;
  };
  shopName: string;
  address: string;
  detailedAddress: string;
  contactNumber: string;
  governmentId1Front: string;
  governmentId1Back: string;
  governmentId2Front: string;
  governmentId2Back: string;
  transactionOptions: string[];
  termsAccepted: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

const SellerManagementPage: React.FC = () => {
  const router = useRouter();
  const { token, user } = useAuth();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;
  const [sellers, setSellers] = useState<SellerRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://refurnish-backend.onrender.com';
  const SOCKET_URL = API_BASE_URL.replace(/\/$/, '');

  // Action menu and modals state
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<SellerRow | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Close action menu when clicking outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-action-menu]')) {
        setOpenMenuIndex(null);
      }
    };
    if (openMenuIndex !== null) {
      document.addEventListener('click', onDocClick);
    }
    return () => document.removeEventListener('click', onDocClick);
  }, [openMenuIndex]);

  const navItems = [
    { label: 'Dashboard Overview', href: '/admin/dashboard', active: false, icon: <LayoutDashboard className="w-5 h-5 text-gray-500" /> },
    { label: 'User Management', href: '/admin/user-management', active: false, icon: <Users className="w-5 h-5 text-gray-500" /> },
    { label: 'Seller Management', href: '/admin/seller-management', active: true, icon: <PackageCheck className="w-5 h-5 text-gray-500" /> },
    { label: 'Product Moderation', href: '/admin/product-moderation', active: false, icon: <PackageCheck className="w-5 h-5 text-gray-500" /> },
  ];

  const filteredSellers = sellers.filter(seller => {
    const matchesFilter = filter === 'all' || seller.status === filter;
    const matchesSearch = !search || 
      seller.userId.firstName.toLowerCase().includes(search.toLowerCase()) ||
      seller.userId.lastName.toLowerCase().includes(search.toLowerCase()) ||
      seller.userId.email.toLowerCase().includes(search.toLowerCase()) ||
      seller.shopName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Reset to first page when the search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Fetch sellers whenever page/search changes
  useEffect(() => {
    const controller = new AbortController();
    const fetchSellers = async () => {
      if (!token) return;
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/seller/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('API Error:', res.status, errorText);
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        setSellers(data || []);
        setTotalPages(1); // For now, no pagination
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.error('Error fetching sellers:', e);
          setSellers([]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchSellers();
    return () => controller.abort();
  }, [token, API_BASE_URL, currentPage, pageSize, search]);

  const handleApprove = async (sellerId: string) => {
    try {
      setActionLoading(sellerId);
      const response = await fetch(`${API_BASE_URL}/api/seller/${sellerId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        // Refresh the sellers list
        const res = await fetch(`${API_BASE_URL}/api/seller/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSellers(data || []);
        }
        setShowDetailsModal(false);
      }
    } catch (error) {
      console.error('Failed to approve seller:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (sellerId: string) => {
    try {
      setActionLoading(sellerId);
      const response = await fetch(`${API_BASE_URL}/api/seller/${sellerId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        // Refresh the sellers list
        const res = await fetch(`${API_BASE_URL}/api/seller/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSellers(data || []);
        }
        setShowDetailsModal(false);
      }
    } catch (error) {
      console.error('Failed to reject seller:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'approved': return <CheckCircle className="w-3 h-3" />;
      case 'rejected': return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const currentPageSellers = filteredSellers; // already paginated by server

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className='fixed top-0 left-0 h-screen w-80 bg-white shadow-sm"'> 
      <div className="w-80 bg-white shadow-sm h-screen flex flex-col">
        <div className="p-6 border-b flex-grow">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
              <Image src="/Rf-logo.svg" alt="Rf" width={40} height={40} />
            </div>
            <span className="text-lg font-medium text-gray-700">Admin Access</span>
          </div>

          {/* Admin Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#636B2F] rounded-full flex items-center justify-center overflow-hidden">
              {user?.profilePicture ? (
                <Image 
                  src={user.profilePicture} 
                  alt={`${user.firstName} ${user.lastName}`}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    const nextElement = target.nextElementSibling as HTMLElement;
                    target.style.display = 'none';
                    if (nextElement) nextElement.style.display = 'flex';
                  }}
                />
              ) : null}
              <span className={`${user?.profilePicture ? 'hidden' : 'flex'} items-center justify-center w-full h-full text-white font-semibold text-lg`}>
                {user?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-sm text-gray-500">Administrator</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-8">
            <div className="px-2">
              <div className="px-4 text-xs font-medium tracking-wider text-gray-500 mb-3">NAVIGATION</div>
              
              <div className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-3 rounded-lg text-sm transition-colors ${
                      item.active 
                        ? 'bg-gray-100 text-gray-900 font-semibold' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="w-4 h-4">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>

            </div>
          </nav>
        </div>
        <div className="p-6 border-t border-gray-200 mt-auto">
          <button onClick={() => router.push('/')} className="w-full cursor-pointer flex items-center justify-start gap-2 px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <LogOut className="w-5 h-5 text-gray-500" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </div>
    
    <div className={`${montserrat.className} flex min-h-screen bg-gray-50`}>
      {/* Main Content */}
      <div className="flex-1 ml-80 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Menu className="w-5 h-5 text-gray-600 mr-3" /> 
          <h1 className="text-xl font-semibold text-gray-900">Seller Management</h1>
        </div>

        {/* Sellers Title and Search */}
        <div className="mb-6">  
            <h2 className="text-base font-semibold text-gray-900 mb-3">Sellers ({filteredSellers.length})</h2>
          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by seller name, email, or shop name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {[
              { key: 'all', label: 'All Sellers', count: sellers.length },
              { key: 'pending', label: 'Pending', count: sellers.filter(s => s.status === 'pending').length },
              { key: 'approved', label: 'Approved', count: sellers.filter(s => s.status === 'approved').length },
              { key: 'rejected', label: 'Rejected', count: sellers.filter(s => s.status === 'rejected').length },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Sellers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {isLoading && (
            <div className="px-4 py-2 text-xs text-gray-500">Loading sellers…</div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop Details</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPageSellers.map((seller, index) => (
                  <tr key={seller._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Image 
                          src={seller.userId.profilePicture || '/icon/userIcon.png'} 
                          alt={`${seller.userId.firstName} ${seller.userId.lastName}`} 
                          width={32} 
                          height={32} 
                          className="w-8 h-8 rounded-full object-cover mr-2" 
                        />
                        <div className="text-sm">
                          <div className="text-gray-900 font-medium">
                            {seller.userId.firstName} {seller.userId.lastName}
                          </div>
                          <div className="text-gray-500 text-xs">{seller.userId.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{seller.shopName}</div>
                      <div className="text-sm text-gray-500">{seller.address}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{seller.contactNumber}</div>
                      <div className="text-sm text-gray-500">{seller.detailedAddress}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(seller.status)}`}>
                        {getStatusIcon(seller.status)}
                        <span className="ml-1 capitalize">{seller.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-900">
                      <div>{new Date(seller.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div className="text-gray-500 text-xs">{new Date(seller.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap z-50 text-right text-sm text-gray-500 relative" data-action-menu>
                      <button
                        className="p-1 rounded hover:bg-gray-100"
                        onClick={() => setOpenMenuIndex(openMenuIndex === index ? null : index)}
                        aria-label="More actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuIndex === index && (
                        <div className="relative right-0 z-60 mt-2 w-28 bg-white border border-gray-200 rounded-md shadow-lg" data-action-menu>
                          <div>
                            <button
                              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50"
                              onClick={() => {
                                setSelectedSeller(seller);
                                setShowDetailsModal(true);
                                setOpenMenuIndex(null);
                              }}
                            >
                              View Details
                            </button>
                          </div>
                          {seller.status === 'pending' && (
                            <>
                              <div>
                                <button
                                  className="w-full text-left px-3 py-2 text-xs text-green-600 hover:bg-gray-50"
                                  onClick={() => {
                                    handleApprove(seller._id);
                                    setOpenMenuIndex(null);
                                  }}
                                >
                                  Approve
                                </button>
                              </div>
                              <div>
                                <button
                                  className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-gray-50"
                                  onClick={() => {
                                    handleReject(seller._id);
                                    setOpenMenuIndex(null);
                                  }}
                                >
                                  Reject
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-gray-600">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`flex items-center space-x-2 px-2 py-1 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            >
              <span className="text-gray-400">«</span>
              <span>Prev</span>
            </button>
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                const isActive = page === currentPage;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-7 min-w-7 px-1.5 rounded-md text-xs ${
                      isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button> 
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`flex items-center space-x-2 px-2 py-1 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            >
              <span>Next</span>
              <span className="text-gray-400">»</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Seller Details Modal */}
    {showDetailsModal && selectedSeller && (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowDetailsModal(false);
          }
        }}
      >
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Seller Details</h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedSeller.userId.firstName} {selectedSeller.userId.lastName} • {selectedSeller.shopName}
              </p>
            </div>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <XCircle className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          
          {/* Modal Content */}
          <div className="p-6 max-h-[calc(90vh-180px)] overflow-y-auto">
          
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-gray-600" />
                  Personal Information
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedSeller.userId.firstName} {selectedSeller.userId.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{selectedSeller.userId.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Contact Number</p>
                      <p className="text-sm font-medium text-gray-900">{selectedSeller.contactNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-sm font-medium text-gray-900">{selectedSeller.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shop Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Store className="w-5 h-5 mr-2 text-gray-600" />
                  Shop Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Shop Name</p>
                    <p className="text-sm font-medium text-gray-900">{selectedSeller.shopName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Detailed Address</p>
                    <p className="text-sm font-medium text-gray-900">{selectedSeller.detailedAddress}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Transaction Options</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedSeller.transactionOptions.map((option, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Government IDs */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-600" />
                Government IDs
              </h4>
              
              {/* Test section */}
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium mb-2">Test Images:</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-red-700 mb-2">Test 1 - Direct URL:</p>
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" 
                      alt="Test 1" 
                      className="w-32 h-32 object-cover border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-red-700 mb-2">Test 2 - Seller ID:</p>
                    {selectedSeller.governmentId1Front && (
                      <img 
                        src={selectedSeller.governmentId1Front} 
                        alt="Test 2" 
                        className="w-32 h-32 object-cover border border-gray-300 rounded"
                      />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'ID 1 Front', url: selectedSeller.governmentId1Front },
                  { label: 'ID 1 Back', url: selectedSeller.governmentId1Back },
                  { label: 'ID 2 Front', url: selectedSeller.governmentId2Front },
                  { label: 'ID 2 Back', url: selectedSeller.governmentId2Back },
                ].map(({ label, url }, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">{label}</h5>
                    {url ? (
                      <div className="w-full h-48 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <img
                          src={url}
                          alt={label}
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '100%', 
                            objectFit: 'contain',
                            display: 'block'
                          }}
                          onLoad={() => console.log(`Image loaded: ${label}`)}
                          onError={() => console.log(`Image failed: ${label}`)}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                        <div className="text-center">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No image uploaded</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedSeller.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  selectedSeller.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedSeller.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                  {selectedSeller.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {selectedSeller.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                  {selectedSeller.status.charAt(0).toUpperCase() + selectedSeller.status.slice(1)}
                </span>
                <span className="text-sm text-gray-500">
                  Submitted {new Date(selectedSeller.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {selectedSeller.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleReject(selectedSeller._id)}
                      disabled={actionLoading === selectedSeller._id}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center"
                    >
                      {actionLoading === selectedSeller._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Rejecting...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleApprove(selectedSeller._id)}
                      disabled={actionLoading === selectedSeller._id}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors flex items-center"
                    >
                      {actionLoading === selectedSeller._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </ProtectedRoute>
  );
};

export default SellerManagementPage;