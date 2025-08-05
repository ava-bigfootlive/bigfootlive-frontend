/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { Activity, Calendar, Clock, DollarSign, Download, Eye, Filter, Globe, Headphones, MessageSquare, Monitor, Smartphone, ThumbsUp, TrendingDown, TrendingUp, UserPlus } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

// Analytics data
const overviewData = [
  { date: 'Jan 1', views: 45000, watchTime: 125000, subscribers: 450, revenue: 1250 },
  { date: 'Jan 7', views: 52000, watchTime: 145000, subscribers: 520, revenue: 1450 },
  { date: 'Jan 14', views: 48000, watchTime: 135000, subscribers: 480, revenue: 1350 },
  { date: 'Jan 21', views: 61000, watchTime: 175000, subscribers: 610, revenue: 1750 },
  { date: 'Jan 28', views: 58000, watchTime: 165000, subscribers: 580, revenue: 1650 },
  { date: 'Feb 4', views: 72000, watchTime: 195000, subscribers: 720, revenue: 1950 },
  { date: 'Feb 11', views: 85000, watchTime: 225000, subscribers: 850, revenue: 2250 },
];

const realtimeData = [
  { time: '00:00', viewers: 1200 },
  { time: '01:00', viewers: 900 },
  { time: '02:00', viewers: 600 },
  { time: '03:00', viewers: 400 },
  { time: '04:00', viewers: 500 },
  { time: '05:00', viewers: 800 },
  { time: '06:00', viewers: 1500 },
  { time: '07:00', viewers: 2800 },
  { time: '08:00', viewers: 3500 },
  { time: '09:00', viewers: 4200 },
  { time: '10:00', viewers: 5100 },
  { time: '11:00', viewers: 5800 },
  { time: 'NOW', viewers: 6234 },
];

const topVideos = [
  { 
    title: 'INSANE Clutch Moments - Tournament Highlights',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=160&h=90&fit=crop',
    views: 125420,
    watchTime: 425000,
    likes: 8920,
    comments: 1254,
    revenue: 2450.80
  },
  { 
    title: 'Beginner\'s Guide to Streaming Setup 2025',
    thumbnail: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=160&h=90&fit=crop',
    views: 98450,
    watchTime: 380000,
    likes: 7650,
    comments: 892,
    revenue: 1890.50
  },
  { 
    title: 'Late Night Chill Stream - Just Chatting',
    thumbnail: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=160&h=90&fit=crop',
    views: 76320,
    watchTime: 290000,
    likes: 5420,
    comments: 2341,
    revenue: 1456.30
  },
  { 
    title: 'Art Stream: Drawing Your Requests Live!',
    thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=160&h=90&fit=crop',
    views: 54230,
    watchTime: 195000,
    likes: 4320,
    comments: 567,
    revenue: 987.40
  }
];

const audienceData = {
  age: [
    { range: '13-17', value: 15 },
    { range: '18-24', value: 35 },
    { range: '25-34', value: 30 },
    { range: '35-44', value: 15 },
    { range: '45+', value: 5 }
  ],
  gender: [
    { name: 'Male', value: 65, color: '#3b82f6' },
    { name: 'Female', value: 30, color: '#ec4899' },
    { name: 'Other', value: 5, color: '#8b5cf6' }
  ],
  geography: [
    { country: 'United States', viewers: 45000, percentage: 35 },
    { country: 'United Kingdom', viewers: 25000, percentage: 20 },
    { country: 'Canada', viewers: 18000, percentage: 15 },
    { country: 'Germany', viewers: 12000, percentage: 10 },
    { country: 'Japan', viewers: 10000, percentage: 8 },
    { country: 'Other', viewers: 15000, percentage: 12 }
  ],
  devices: [
    { device: 'Desktop', value: 45, icon: Monitor },
    { device: 'Mobile', value: 35, icon: Smartphone },
    { device: 'TV', value: 15, icon: Monitor },
    { device: 'Other', value: 5, icon: Headphones }
  ]
};

const engagementMetrics = [
  { subject: 'Views', A: 85, fullMark: 100 },
  { subject: 'Likes', A: 78, fullMark: 100 },
  { subject: 'Comments', A: 65, fullMark: 100 },
  { subject: 'Shares', A: 72, fullMark: 100 },
  { subject: 'Watch Time', A: 88, fullMark: 100 },
  { subject: 'Retention', A: 82, fullMark: 100 }
];

export default function AnalyticsEnhanced() {
  const [timeRange, setTimeRange] = useState('last28');
  const [compareMode, setCompareMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Inline styles
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      padding: '32px'},
    header: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
      marginBottom: '32px',
      '@media (min-width: 1024px)': {
        flexDirection: 'row' as const,
        justifyContent: 'space-between',
        alignItems: 'center'}},
    headerContent: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px'},
    title: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: '8px'},
    subtitle: {
      fontSize: '18px',
      color: '#9ca3af'},
    headerActions: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '12px'},
    button: {
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s'},
    outlineButton: {
      backgroundColor: 'transparent',
      color: '#ffffff',
      border: '1px solid #262626'},
    primaryButton: {
      background: 'linear-gradient(to right, #a855f7, #ec4899)',
      color: '#ffffff',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'},
    selectWrapper: {
      position: 'relative' as const},
    select: {
      backgroundColor: '#121212',
      border: '1px solid #262626',
      borderRadius: '8px',
      padding: '10px 16px',
      paddingRight: '40px',
      fontSize: '14px',
      color: '#ffffff',
      outline: 'none',
      cursor: 'pointer',
      appearance: 'none' as const,
      minWidth: '180px'},
    selectIcon: {
      position: 'absolute' as const,
      right: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none' as const,
      color: '#9ca3af'},
    metricGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px',
      marginBottom: '32px'},
    metricCard: {
      backgroundColor: '#121212',
      border: '1px solid #262626',
      borderRadius: '12px',
      padding: '24px',
      position: 'relative' as const,
      overflow: 'hidden',
      transition: 'transform 0.3s'},
    metricContent: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px'},
    metricHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'},
    metricIconWrapper: {
      padding: '12px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'},
    badge: {
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'},
    badgeSuccess: {
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      color: '#10b981'},
    badgeDanger: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444'},
    metricValue: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: '4px'},
    metricLabel: {
      fontSize: '14px',
      color: '#9ca3af'},
    metricSubtitle: {
      fontSize: '12px',
      color: '#9ca3af'},
    tabs: {
      marginBottom: '32px'},
    tabsList: {
      display: 'flex',
      backgroundColor: '#121212',
      padding: '4px',
      borderRadius: '8px',
      gap: '4px',
      marginBottom: '24px',
      width: 'fit-content'},
    tabTrigger: {
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: 'transparent',
      color: '#9ca3af',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '14px',
      fontWeight: '500'},
    tabTriggerActive: {
      backgroundColor: '#262626',
      color: '#ffffff'},
    card: {
      backgroundColor: '#121212',
      border: '1px solid #262626',
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: '24px'},
    cardHeader: {
      padding: '24px',
      borderBottom: '1px solid #262626'},
    cardHeaderContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'},
    cardTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#ffffff'},
    cardDescription: {
      fontSize: '14px',
      color: '#9ca3af',
      marginTop: '4px'},
    cardContent: {
      padding: '24px'},
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px'},
    liveBadge: {
      backgroundColor: '#ef4444',
      color: '#ffffff',
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      animation: 'pulse 2s infinite'},
    liveDot: {
      width: '8px',
      height: '8px',
      backgroundColor: '#ffffff',
      borderRadius: '50%'},
    bigNumber: {
      fontSize: '48px',
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: '8px'},
    videoItem: {
      display: 'flex',
      gap: '12px',
      padding: '12px',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'background-color 0.2s'},
    videoThumbnail: {
      width: '80px',
      height: '45px',
      borderRadius: '6px',
      objectFit: 'cover' as const},
    videoInfo: {
      flex: 1,
      minWidth: 0},
    videoTitle: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#ffffff',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const},
    videoStats: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginTop: '4px',
      fontSize: '12px',
      color: '#9ca3af'},
    videoRevenue: {
      textAlign: 'right' as const},
    revenueAmount: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#10b981'},
    progressBar: {
      height: '8px',
      backgroundColor: '#262626',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '8px'},
    progressFill: {
      height: '100%',
      borderRadius: '4px',
      transition: 'width 0.3s'},
    demographicItem: {
      marginBottom: '16px'},
    demographicHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '4px'},
    demographicLabel: {
      fontSize: '14px',
      color: '#ffffff'},
    demographicValue: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#ffffff'},
    legendContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '24px',
      marginTop: '16px'},
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'},
    legendDot: {
      width: '12px',
      height: '12px',
      borderRadius: '50%'},
    locationItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      borderRadius: '8px',
      backgroundColor: '#1f1f1f',
      marginBottom: '8px'},
    locationInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'},
    locationStats: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'},
    deviceGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
      marginTop: '24px'},
    deviceCard: {
      textAlign: 'center' as const,
      padding: '16px',
      borderRadius: '8px',
      backgroundColor: '#1f1f1f'},
    deviceIcon: {
      margin: '0 auto 8px',
      color: '#9ca3af'},
    deviceName: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#ffffff',
      marginBottom: '4px'},
    deviceValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#ffffff'},
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
      marginTop: '24px'},
    statItem: {
      textAlign: 'center' as const,
      padding: '16px',
      borderRadius: '8px',
      backgroundColor: '#1f1f1f'},
    statIcon: {
      margin: '0 auto 8px'},
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#ffffff'},
    statLabel: {
      fontSize: '12px',
      color: '#9ca3af',
      marginTop: '4px'}};

  const MetricCard = ({ title, value, change, icon: Icon, color, subtitle }: unknown) => (
    <div style={styles.metricCard}>
      <div style={styles.metricContent}>
        <div style={styles.metricHeader}>
          <div style={{ ...styles.metricIconWrapper, background: color }}>
            <Icon style={{ width: '20px', height: '20px', color: '#ffffff' }} />
          </div>
          {change !== undefined && (
            <div style={{
              ...styles.badge,
              ...(change >= 0 ? styles.badgeSuccess : styles.badgeDanger)
            }}>
              {change >= 0 ? (
                <TrendingUp style={{ width: '12px', height: '12px' }} />
              ) : (
                <TrendingDown style={{ width: '12px', height: '12px' }} />
              )}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div>
          <h3 style={styles.metricValue}>{value}</h3>
          <p style={styles.metricLabel}>{title}</p>
          {subtitle && <p style={styles.metricSubtitle}>{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Channel Analytics</h1>
          <p style={styles.subtitle}>Deep insights into your streaming performance</p>
        </div>
        <div style={styles.headerActions}>
          <div style={styles.selectWrapper}>
            <Calendar style={{ ...styles.selectIcon, width: '16px', height: '16px' }} />
            <select 
              style={styles.select}
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="last7">Last 7 days</option>
              <option value="last28">Last 28 days</option>
              <option value="last90">Last 90 days</option>
              <option value="lastYear">Last year</option>
              <option value="allTime">All time</option>
            </select>
          </div>
          <button 
            style={{
              ...styles.button,
              ...styles.outlineButton}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1f1f1f';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Filter style={{ width: '16px', height: '16px' }} />
            Filters
          </button>
          <button 
            style={{
              ...styles.button,
              ...styles.outlineButton}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1f1f1f';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Download style={{ width: '16px', height: '16px' }} />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={styles.metricGrid}>
        <MetricCard
          title="Views"
          value="2.4M"
          subtitle="Last 28 days"
          change={12.5}
          icon={Eye}
          color="linear-gradient(135deg, #3b82f6, #2563eb)"
        />
        <MetricCard
          title="Watch time (hours)"
          value="185.2K"
          subtitle="Average: 4.2 min"
          change={8.3}
          icon={Clock}
          color="linear-gradient(135deg, #a855f7, #ec4899)"
        />
        <MetricCard
          title="Subscribers"
          value="+8,542"
          subtitle="Total: 125.4K"
          change={15.7}
          icon={UserPlus}
          color="linear-gradient(135deg, #10b981, #059669)"
        />
        <MetricCard
          title="Revenue"
          value="$12,450"
          subtitle="RPM: $5.18"
          change={22.4}
          icon={DollarSign}
          color="linear-gradient(135deg, #f97316, #ea580c)"
        />
      </div>

      {/* Main Analytics Tabs */}
      <div style={styles.tabs}>
        <div style={styles.tabsList}>
          <button
            style={{
              ...styles.tabTrigger,
              ...(activeTab === 'overview' ? styles.tabTriggerActive : {})}}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            style={{
              ...styles.tabTrigger,
              ...(activeTab === 'realtime' ? styles.tabTriggerActive : {})}}
            onClick={() => setActiveTab('realtime')}
          >
            Realtime
          </button>
          <button
            style={{
              ...styles.tabTrigger,
              ...(activeTab === 'content' ? styles.tabTriggerActive : {})}}
            onClick={() => setActiveTab('content')}
          >
            Content
          </button>
          <button
            style={{
              ...styles.tabTrigger,
              ...(activeTab === 'audience' ? styles.tabTriggerActive : {})}}
            onClick={() => setActiveTab('audience')}
          >
            Audience
          </button>
          <button
            style={{
              ...styles.tabTrigger,
              ...(activeTab === 'revenue' ? styles.tabTriggerActive : {})}}
            onClick={() => setActiveTab('revenue')}
          >
            Revenue
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Performance Chart */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardHeaderContent}>
                  <div>
                    <h2 style={styles.cardTitle}>Channel Performance</h2>
                    <p style={styles.cardDescription}>Views and watch time over the selected period</p>
                  </div>
                  <button
                    style={{
                      ...styles.button,
                      ...styles.outlineButton,
                      fontSize: '12px',
                      padding: '6px 12px'}}
                    onClick={() => setCompareMode(!compareMode)}
                  >
                    {compareMode ? 'Hide' : 'Compare'} Previous Period
                  </button>
                </div>
              </div>
              <div style={styles.cardContent}>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={overviewData}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorWatchTime" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#121212', 
                        border: '1px solid #262626',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorViews)"
                      strokeWidth={2}
                      name="Views"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="watchTime" 
                      stroke="#8b5cf6" 
                      fillOpacity={1} 
                      fill="url(#colorWatchTime)"
                      strokeWidth={2}
                      name="Watch Time (minutes)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Engagement Radar */}
            <div style={styles.grid}>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h2 style={styles.cardTitle}>Engagement Score</h2>
                    <p style={styles.cardDescription}>How your content performs across key metrics</p>
                  </div>
                </div>
                <div style={styles.cardContent}>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={engagementMetrics}>
                      <PolarGrid stroke="#262626" />
                      <PolarAngleAxis dataKey="subject" stroke="#9ca3af" />
                      <PolarRadiusAxis stroke="#9ca3af" />
                      <Radar 
                        name="Performance" 
                        dataKey="A" 
                        stroke="#8b5cf6" 
                        fill="#8b5cf6" 
                        fillOpacity={0.3}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#121212', 
                          border: '1px solid #262626',
                          borderRadius: '8px'
                        }} 
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h2 style={styles.cardTitle}>Top Performing Content</h2>
                    <p style={styles.cardDescription}>Your best videos this period</p>
                  </div>
                </div>
                <div style={styles.cardContent}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {topVideos.slice(0, 3).map((video, index) => (
                      <div 
                        key={index} 
                        style={styles.videoItem}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#1f1f1f';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          style={styles.videoThumbnail}
                        />
                        <div style={styles.videoInfo}>
                          <h4 style={styles.videoTitle}>{video.title}</h4>
                          <div style={styles.videoStats}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Eye style={{ width: '12px', height: '12px' }} />
                              {(video.views / 1000).toFixed(1)}K
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <ThumbsUp style={{ width: '12px', height: '12px' }} />
                              {(video.likes / 1000).toFixed(1)}K
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MessageSquare style={{ width: '12px', height: '12px' }} />
                              {video.comments}
                            </span>
                          </div>
                        </div>
                        <div style={styles.videoRevenue}>
                          <p style={styles.revenueAmount}>
                            ${video.revenue.toFixed(2)}
                          </p>
                          <p style={{ fontSize: '12px', color: '#9ca3af' }}>revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Realtime Tab */}
        {activeTab === 'realtime' && (
          <div>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardHeaderContent}>
                  <div>
                    <h2 style={styles.cardTitle}>Live Viewership</h2>
                    <p style={styles.cardDescription}>Currently watching across all streams</p>
                  </div>
                  <div style={styles.liveBadge}>
                    <span style={styles.liveDot} />
                    LIVE
                  </div>
                </div>
              </div>
              <div style={styles.cardContent}>
                <div style={styles.bigNumber}>
                  6,234
                  <span style={{ fontSize: '18px', fontWeight: 'normal', color: '#9ca3af', marginLeft: '8px' }}>
                    concurrent viewers
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={realtimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="time" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#121212', 
                        border: '1px solid #262626',
                        borderRadius: '8px'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="viewers" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div style={styles.statsGrid}>
                  <div style={styles.statItem}>
                    <Activity style={{ ...styles.statIcon, width: '20px', height: '20px', color: '#10b981' }} />
                    <p style={styles.statValue}>2.8K</p>
                    <p style={styles.statLabel}>Peak today</p>
                  </div>
                  <div style={styles.statItem}>
                    <Clock style={{ ...styles.statIcon, width: '20px', height: '20px', color: '#3b82f6' }} />
                    <p style={styles.statValue}>4:32</p>
                    <p style={styles.statLabel}>Avg. watch time</p>
                  </div>
                  <div style={styles.statItem}>
                    <MessageSquare style={{ ...styles.statIcon, width: '20px', height: '20px', color: '#a855f7' }} />
                    <p style={styles.statValue}>892</p>
                    <p style={styles.statLabel}>Chat messages/min</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audience Tab */}
        {activeTab === 'audience' && (
          <div style={styles.grid}>
            {/* Demographics */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.cardTitle}>Audience Demographics</h2>
                  <p style={styles.cardDescription}>Age and gender distribution</p>
                </div>
              </div>
              <div style={styles.cardContent}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '500', marginBottom: '12px', color: '#ffffff' }}>
                      Age Distribution
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {audienceData.age.map((item, index) => (
                        <div key={index} style={styles.demographicItem}>
                          <div style={styles.demographicHeader}>
                            <span style={styles.demographicLabel}>{item.range}</span>
                            <span style={styles.demographicValue}>{item.value}%</span>
                          </div>
                          <div style={styles.progressBar}>
                            <div 
                              style={{
                                ...styles.progressFill,
                                width: `${item.value}%`,
                                background: 'linear-gradient(to right, #a855f7, #ec4899)'}}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '500', marginBottom: '12px', color: '#ffffff' }}>
                      Gender Distribution
                    </h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={audienceData.gender}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {audienceData.gender.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#121212', 
                            border: '1px solid #262626',
                            borderRadius: '8px'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={styles.legendContainer}>
                      {audienceData.gender.map((item, index) => (
                        <div key={index} style={styles.legendItem}>
                          <div style={{ ...styles.legendDot, backgroundColor: item.color }} />
                          <span style={{ fontSize: '14px', color: '#ffffff' }}>{item.name}: {item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Geography */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.cardTitle}>Top Locations</h2>
                  <p style={styles.cardDescription}>Where your viewers are from</p>
                </div>
              </div>
              <div style={styles.cardContent}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {audienceData.geography.map((country, index) => (
                    <div key={index} style={styles.locationItem}>
                      <div style={styles.locationInfo}>
                        <Globe style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
                        <span style={{ fontWeight: '500', color: '#ffffff' }}>{country.country}</span>
                      </div>
                      <div style={styles.locationStats}>
                        <span style={{ fontSize: '14px', color: '#9ca3af' }}>
                          {country.viewers.toLocaleString()} viewers
                        </span>
                        <span style={{
                          ...styles.badge,
                          backgroundColor: '#262626',
                          color: '#ffffff'}}>
                          {country.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={styles.deviceGrid}>
                  {audienceData.devices.map((device, index) => {
                    const Icon = device.icon;
                    return (
                      <div key={index} style={styles.deviceCard}>
                        <Icon style={{ ...styles.deviceIcon, width: '32px', height: '32px' }} />
                        <p style={styles.deviceName}>{device.device}</p>
                        <p style={styles.deviceValue}>{device.value}%</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}