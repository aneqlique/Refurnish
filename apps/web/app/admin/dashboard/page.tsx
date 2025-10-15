"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users, TrendingUp, ShoppingBag, Clock, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { Montserrat } from 'next/font/google';
import { LogOut, LayoutDashboard, PackageCheck } from "lucide-react";
import { useAuth } from '../../../contexts/AuthContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://refurnish-backend.onrender.com';

interface StatCard {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const AdminDashboard: React.FC = () => {
  const { user, logout, token } = useAuth();
  const [userCount, setUserCount] = useState<number>(0);
  const [isLoadingUserCount, setIsLoadingUserCount] = useState(true);
  const [siteVisitsCount, setSiteVisitsCount] = useState<number>(0);
  const [isLoadingSiteVisits, setIsLoadingSiteVisits] = useState(true);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [isLoadingSales, setIsLoadingSales] = useState(true);
  const [pendingApprovalCount, setPendingApprovalCount] = useState<number>(0);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [weeklyChartData, setWeeklyChartData] = useState<Array<{ name: string; sales: number; visits: number }>>([
    { name: "Mon", sales: 0, visits: 0 },
    { name: "Tue", sales: 0, visits: 0 },
    { name: "Wed", sales: 0, visits: 0 },
    { name: "Thu", sales: 0, visits: 0 },
    { name: "Fri", sales: 0, visits: 0 },
    { name: "Sat", sales: 0, visits: 0 },
    { name: "Sun", sales: 0, visits: 0 },
  ]);
  const [analyticsRangeLabel, setAnalyticsRangeLabel] = useState<string>("");
  const [currentWeekStart, setCurrentWeekStart] = useState<Date | null>(null);

  // Function to fetch user count
  const fetchUserCount = useCallback(async () => {
    try {
      setIsLoadingUserCount(true);
      const response = await fetch(`${API_BASE_URL}/api/users?limit=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user count');
      }

      const data = await response.json();
      setUserCount(data.pagination.total);
    } catch (error) {
      console.error('Error fetching user count:', error);
      // Keep the default value of 0 if fetch fails
    } finally {
      setIsLoadingUserCount(false);
    }
  }, [token]);

  // Function to fetch site visits count
  const fetchSiteVisitsCount = useCallback(async () => {
    try {
      setIsLoadingSiteVisits(true);
      const response = await fetch(`${API_BASE_URL}/api/site-visits/total`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch site visits count');
      }

      const data = await response.json();
      setSiteVisitsCount(data.totalVisits);
    } catch (error) {
      console.error('Error fetching site visits count:', error);
      // Keep the default value of 0 if fetch fails
    } finally {
      setIsLoadingSiteVisits(false);
    }
  }, [token]);

  // Function to fetch total sales
  const fetchTotalSales = useCallback(async () => {
    try {
      setIsLoadingSales(true);
      const response = await fetch(`${API_BASE_URL}/api/products/total-sales`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch total sales');
      }

      const data = await response.json();
      setTotalSales(data.totalSales);
    } catch (error) {
      console.error('Error fetching total sales:', error);
      // Keep the default value of 0 if fetch fails
    } finally {
      setIsLoadingSales(false);
    }
  }, [token]);

  // Function to fetch weekly analytics (sales & visits Mon-Sun)
  const fetchWeeklyAnalytics = useCallback(async (startDate?: Date) => {
    try {
      const params = startDate ? `?startDate=${encodeURIComponent(startDate.toISOString())}` : '';
      const response = await fetch(`${API_BASE_URL}/api/products/analytics/weekly${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch weekly analytics');
      }

      const data = await response.json();
      setWeeklyChartData(data.data || []);
      setAnalyticsRangeLabel(data.range?.label || "");
    } catch (error) {
      console.error('Error fetching weekly analytics:', error);
      // Keep zeros if fetch fails
      setWeeklyChartData([
        { name: "Mon", sales: 0, visits: 0 },
        { name: "Tue", sales: 0, visits: 0 },
        { name: "Wed", sales: 0, visits: 0 },
        { name: "Thu", sales: 0, visits: 0 },
        { name: "Fri", sales: 0, visits: 0 },
        { name: "Sat", sales: 0, visits: 0 },
        { name: "Sun", sales: 0, visits: 0 },
      ]);
      setAnalyticsRangeLabel("");
    } finally {
    }
  }, [token]);

  // Function to fetch pending approval count
  const fetchPendingApprovalCount = useCallback(async () => {
    try {
      setIsLoadingPending(true);
      const response = await fetch(`${API_BASE_URL}/api/products/for-approval`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending approval');
      }

      const data = await response.json();
      setPendingApprovalCount(Array.isArray(data) ? data.length : 0);
    } catch (error) {
      console.error('Error fetching pending approval count:', error);
    } finally {
      setIsLoadingPending(false);
    }
  }, [token]);

  // Fetch user count, site visits count, total sales, and weekly analytics on mount
  useEffect(() => {
    if (token) {
      fetchUserCount();
      fetchSiteVisitsCount();
      fetchTotalSales();
      const now = new Date();
      setCurrentWeekStart(now);
      fetchWeeklyAnalytics(now);
      fetchPendingApprovalCount();
    }
  }, [token, fetchUserCount, fetchSiteVisitsCount, fetchTotalSales, fetchWeeklyAnalytics, fetchPendingApprovalCount]);

  // Helpers for week navigation
  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day; // adjust to Monday
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + diff);
    return date;
  };

  const handlePrevWeek = () => {
    if (!currentWeekStart) return;
    const monday = getMonday(currentWeekStart);
    const prev = new Date(monday);
    prev.setDate(monday.getDate() - 7);
    setCurrentWeekStart(prev);
    fetchWeeklyAnalytics(prev);
  };

  const handleNextWeek = () => {
    if (!currentWeekStart) return;
    const monday = getMonday(currentWeekStart);
    const next = new Date(monday);
    next.setDate(monday.getDate() + 7);
    // Do not allow navigating into future weeks beyond current week's Monday
    const todayMonday = getMonday(new Date());
    if (next > todayMonday) return;
    setCurrentWeekStart(next);
    fetchWeeklyAnalytics(next);
  };

  const navItems = [
   { label: 'Dashboard Overview', href: '/admin/dashboard', active: true, icon: <LayoutDashboard className="w-5 h-5 text-gray-500" /> },
  { label: 'User Management', href: '/admin/user-management', active: false, icon: <Users className="w-5 h-5 text-gray-500" /> },
  { label: 'Product Moderation', href: '/admin/product-moderation', active: false, icon: <PackageCheck className="w-5 h-5 text-gray-500" /> },
];

  const stats: StatCard[] = [
    { title: "Users", value: isLoadingUserCount ? "..." : userCount.toString(), icon: <Users className="w-5 h-5" />, color: "text-purple-600", bgColor: "bg-purple-100" },
    { title: "Site Visits", value: isLoadingSiteVisits ? "..." : siteVisitsCount.toString(), icon: <TrendingUp className="w-5 h-5" />, color: "text-green-600", bgColor: "bg-green-100" },
    { title: "Sales", value: isLoadingSales ? "..." : `₱${totalSales.toLocaleString()}`, icon: <ShoppingBag className="w-5 h-5" />, color: "text-red-600", bgColor: "bg-red-100" },
    { title: "Pending Approval", value: isLoadingPending ? "..." : pendingApprovalCount.toString(), icon: <Clock className="w-5 h-5" />, color: "text-blue-600", bgColor: "bg-blue-100" }
  ];

  const chartData = weeklyChartData;

  // Logout
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 h-screen w-80 bg-white shadow-sm">
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
                    // Fallback to initials if image fails to load
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
          <button onClick={handleLogout} className="w-full cursor-pointer flex items-center justify-start gap-2 px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <LogOut className="w-5 h-5 text-gray-500" />
            <span>Log out</span>
          </button>
        </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${montserrat.className} flex-1 ml-80 p-8 overflow-y-auto`}>
        {/* Header */}
      <div className="flex items-center mb-6">
        <Menu className="w-5 h-5 text-gray-600 mr-3" />
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
      </div>

        {/* Statistics Cards */}
      <div className="mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Site statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-1.5 rounded-lg ${stat.bgColor}`}>
                  <div className={`${stat.color} w-4 h-4`}>{stat.icon}</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.title}</div>
              <div
                className={`mt-2 h-1 rounded-full ${
                  index === 0 ? 'bg-purple-500' :
                  index === 1 ? 'bg-blue-500' :
                  index === 2 ? 'bg-red-500' : 'bg-blue-400'
                }`}
                style={{ width: '50%' }}
              ></div>
            </div>
          ))}
        </div>
      </div>


          {/* Graphs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold text-gray-900">Sales & Visits</h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevWeek}
                  className="p-1 rounded-md hover:bg-gray-100"
                  aria-label="Previous week"
                  title="Previous week"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={handleNextWeek}
                  className="p-1 rounded-md hover:bg-gray-100"
                  aria-label="Next week"
                  title="Next week"
                >
                  <ChevronRight className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>
            {analyticsRangeLabel ? (
              <div className="text-xs text-gray-500 mb-3">{analyticsRangeLabel}</div>
            ) : null}
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>

            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Weekly Sales</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
  );
};

export default AdminDashboard;
