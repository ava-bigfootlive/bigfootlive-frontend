/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Activity, Award, BarChart3, BookOpen, Camera, Clock, DollarSign, Dumbbell, Eye, Film, Gamepad2, Globe, Mic, MoreVertical, Palette, Radio, Sparkles, TrendingUp, Users, Utensils } from 'lucide-react';
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
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [hoveredStream, setHoveredStream] = useState<number | null>(null);
  const navigate = useNavigate();

  // Inline styles
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      position: 'relative' as const},
    backgroundGradient: {
      position: 'fixed' as const,
      inset: 0,
      background: 'linear-gradient(to bottom right, rgba(168, 85, 247, 0.05), transparent, rgba(236, 72, 153, 0.05))',
      pointerEvents: 'none' as const},
    content: {
      position: 'relative' as const,
      padding: '32px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '32px'},
    header: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
      '@media (min-width: 1024px)': {
        flexDirection: 'row' as const,
        justifyContent: 'space-between',
        alignItems: 'center'}},
    headerContent: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px'},
    title: {
      fontSize: '48px',
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: '8px'},
    titleGradient: {
      background: 'linear-gradient(to right, #a855f7, #ec4899)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'},
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
    metricGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px'},
    metricCard: {
      backgroundColor: '#121212',
      border: '1px solid #262626',
      borderRadius: '12px',
      padding: '24px',
      position: 'relative' as const,
      overflow: 'hidden',
      transition: 'transform 0.3s'},
    metricCardHover: {
      transform: 'scale(1.02)'},
    metricGradientOverlay: {
      position: 'absolute' as const,
      inset: 0,
      opacity: 0.1},
    metricContent: {
      position: 'relative' as const},
    metricHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'},
    metricIconWrapper: {
      padding: '12px',
      borderRadius: '16px',
      color: '#ffffff',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'},
    badge: {
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'},
    metricValue: {
      fontSize: '30px',
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: '4px'},
    metricLabel: {
      fontSize: '14px',
      color: '#9ca3af'},
    metricSubtitle: {
      fontSize: '12px',
      color: '#9ca3af',
      marginTop: '4px'},
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'},
    sectionTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#ffffff'},
    sectionSubtitle: {
      color: '#9ca3af'},
    streamGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '16px'},
    streamCard: {
      backgroundColor: 'rgba(18, 18, 18, 0.6)',
      backdropFilter: 'blur(10px)',
      border: '1px solid #262626',
      borderRadius: '12px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.3s'},
    streamCardHover: {
      backgroundColor: 'rgba(18, 18, 18, 0.8)'},
    streamThumbnail: {
      position: 'relative' as const,
      aspectRatio: '16 / 9',
      overflow: 'hidden'},
    streamImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
      transition: 'transform 0.5s'},
    streamImageHover: {
      transform: 'scale(1.1)'},
    streamOverlay: {
      position: 'absolute' as const,
      inset: 0,
      background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 40%, transparent 100%)',
      display: 'flex',
      alignItems: 'flex-end',
      padding: '16px'},
    liveBadge: {
      position: 'absolute' as const,
      top: '12px',
      left: '12px',
      backgroundColor: '#ef4444',
      color: '#ffffff',
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'},
    liveDot: {
      width: '8px',
      height: '8px',
      backgroundColor: '#ffffff',
      borderRadius: '50%',
      animation: 'pulse 1.5s infinite'},
    viewerBadge: {
      position: 'absolute' as const,
      bottom: '12px',
      right: '12px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: '#ffffff',
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '12px',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'},
    durationBadge: {
      position: 'absolute' as const,
      bottom: '12px',
      left: '12px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: '#ffffff',
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '12px',
      backdropFilter: 'blur(10px)'},
    streamContent: {
      padding: '16px'},
    streamInfo: {
      display: 'flex',
      gap: '12px'},
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      border: '2px solid #0a0a0a'},
    streamDetails: {
      flex: 1,
      minWidth: 0},
    streamTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#ffffff',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical' as const,
      transition: 'color 0.2s'},
    streamTitleHover: {
      color: '#a855f7'},
    streamMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '4px'},
    streamAuthor: {
      fontSize: '14px',
      color: '#9ca3af'},
    partnerBadge: {
      backgroundColor: 'rgba(168, 85, 247, 0.2)',
      color: '#c084fc',
      padding: '2px 4px',
      borderRadius: '4px',
      fontSize: '10px',
      display: 'flex',
      alignItems: 'center'},
    streamCategory: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '8px',
      fontSize: '12px',
      color: '#9ca3af'},
    moreButton: {
      background: 'none',
      border: 'none',
      color: '#9ca3af',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '8px',
      opacity: 0,
      transition: 'opacity 0.2s'},
    moreButtonVisible: {
      opacity: 1},
    chartCard: {
      backgroundColor: 'rgba(18, 18, 18, 0.5)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '24px'},
    chartHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'},
    chartTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#ffffff'},
    chartDescription: {
      fontSize: '14px',
      color: '#9ca3af',
      marginTop: '4px'},
    legendBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 8px',
      border: '1px solid #262626',
      borderRadius: '6px',
      fontSize: '12px',
      color: '#9ca3af'},
    legendDot: {
      width: '12px',
      height: '12px',
      borderRadius: '50%'},
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '24px',
      '@media (min-width: 1024px)': {
        gridTemplateColumns: '2fr 1fr'}},
    floatingButton: {
      position: 'fixed' as const,
      bottom: '32px',
      right: '32px',
      padding: '16px',
      background: 'linear-gradient(to right, #a855f7, #3b82f6)',
      color: '#ffffff',
      borderRadius: '50%',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      cursor: 'pointer',
      transition: 'transform 0.3s',
      border: 'none'},
    floatingButtonHover: {
      transform: 'scale(1.1)'},
    tooltip: {
      position: 'absolute' as const,
      top: '-48px',
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: '#ffffff',
      padding: '8px 12px',
      borderRadius: '8px',
      fontSize: '14px',
      whiteSpace: 'nowrap' as const,
      opacity: 0,
      transition: 'opacity 0.3s'},
    tooltipVisible: {
      opacity: 1},
    loadingContainer: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0a0a0a'},
    loadingContent: {
      position: 'relative' as const},
    loadingGlow: {
      position: 'absolute' as const,
      inset: 0,
      filter: 'blur(48px)',
      opacity: 0.3},
    loadingPulse: {
      width: '128px',
      height: '128px',
      backgroundColor: '#a855f7',
      borderRadius: '50%',
      animation: 'pulse 2s infinite'},
    loadingBox: {
      position: 'relative' as const,
      background: 'linear-gradient(135deg, #a855f7, #ec4899)',
      color: '#ffffff',
      padding: '32px',
      borderRadius: '24px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'},
    spinner: {
      animation: 'spin 1s linear infinite'}};

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Live streams data with real streaming platform feel
  const liveStreams = [
    {
      id: 1,
      title: 'EPIC Ranked Grind to Diamond | !discord !merch',
      streamer: 'ProGamer42',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ProGamer42',
      thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=225&fit=crop',
      viewers: 15420,
      category: 'Valorant',
      tags: ['English', 'Competitive', 'PC'],
      duration: '2:34:15',
      isLive: true,
      isPartner: true
    },
    {
      id: 2,
      title: 'Chill Art Stream - Drawing Your Requests! ✨',
      streamer: 'ArtistAlice',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ArtistAlice',
      thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=225&fit=crop',
      viewers: 8932,
      category: 'Art',
      tags: ['Creative', 'Chill', 'Interactive'],
      duration: '1:15:42',
      isLive: true,
      isPartner: false
    },
    {
      id: 3,
      title: 'Morning Yoga Flow 🧘‍♀️ All Levels Welcome',
      streamer: 'YogaWithSarah',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=YogaWithSarah',
      thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=225&fit=crop',
      viewers: 3421,
      category: 'Fitness',
      tags: ['Yoga', 'Wellness', 'Morning'],
      duration: '45:20',
      isLive: true,
      isPartner: true
    },
    {
      id: 4,
      title: 'Speedrunning Mario 64 - World Record Attempts',
      streamer: 'SpeedDemon',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SpeedDemon',
      thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=225&fit=crop',
      viewers: 12543,
      category: 'Retro Gaming',
      tags: ['Speedrun', 'Nintendo', 'WR Attempts'],
      duration: '4:12:33',
      isLive: true,
      isPartner: true
    },
    {
      id: 5,
      title: 'Cooking Italian Pasta From Scratch 🍝',
      streamer: 'ChefMarcello',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChefMarcello',
      thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=225&fit=crop',
      viewers: 5672,
      category: 'Cooking',
      tags: ['Italian', 'Tutorial', 'Food'],
      duration: '1:30:15',
      isLive: true,
      isPartner: false
    },
    {
      id: 6,
      title: 'Late Night Chill Music Production Stream',
      streamer: 'BeatsByAlex',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BeatsByAlex',
      thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=225&fit=crop',
      viewers: 2890,
      category: 'Music',
      tags: ['Production', 'Electronic', 'Tutorial'],
      duration: '3:45:00',
      isLive: true,
      isPartner: true
    }
  ];

  // Category icons mapping
  const categoryIcons: { [key: string]: unknown } = {
    'Valorant': Gamepad2,
    'Art': Palette,
    'Fitness': Dumbbell,
    'Retro Gaming': Gamepad2,
    'Cooking': Utensils,
    // 'Music': Music,
    'Education': BookOpen,
    'Photography': Camera,
    'Podcast': Mic,
    'Movies': Film
  };

  // Sample data for charts
  const revenueData = [
    { month: 'Jan', revenue: 4500, growth: 4200, subscribers: 3200 },
    { month: 'Feb', revenue: 5200, growth: 4800, subscribers: 3800 },
    { month: 'Mar', revenue: 4800, growth: 5100, subscribers: 4200 },
    { month: 'Apr', revenue: 6100, growth: 5800, subscribers: 5100 },
    { month: 'May', revenue: 7200, growth: 6500, subscribers: 5800 },
    { month: 'Jun', revenue: 8500, growth: 7800, subscribers: 6500 },
  ];

  // const viewershipData = [
  //   { hour: '00:00', viewers: 1200, avgDuration: 45 },
  //   { hour: '04:00', viewers: 800, avgDuration: 62 },
  //   { hour: '08:00', viewers: 2400, avgDuration: 38 },
  //   { hour: '12:00', viewers: 4500, avgDuration: 52 },
  //   { hour: '16:00', viewers: 3800, avgDuration: 48 },
  //   { hour: '20:00', viewers: 5200, avgDuration: 68 },
  //   { hour: '22:00', viewers: 4800, avgDuration: 72 },
  // ];

  // Engagement metrics
  const engagementData = [
    { name: 'Watch Time', value: 85, fill: '#8b5cf6' },
    { name: 'Chat Activity', value: 72, fill: '#3b82f6' },
    { name: 'Shares', value: 68, fill: '#10b981' },
    { name: 'New Followers', value: 92, fill: '#f59e0b' },
  ];

  const streamCategories = [
    { name: 'Gaming', value: 35, color: '#8b5cf6', growth: '+12%' },
    { name: 'Just Chatting', value: 25, color: '#3b82f6', growth: '+8%' },
    { name: 'Art & Creative', value: 15, color: '#10b981', growth: '+15%' },
    { name: 'Music', value: 10, color: '#f59e0b', growth: '+5%' },
    { name: 'Fitness', value: 8, color: '#ef4444', growth: '+18%' },
    { name: 'Cooking', value: 7, color: '#ec4899', growth: '+10%' },
  ];

  // Recent activity
  const recentActivity = [
    { id: 1, type: 'milestone', message: 'Reached 10K followers!', time: '2 min ago', icon: Award },
    { id: 2, type: 'donation', message: 'TechFan donated $50', time: '5 min ago', icon: DollarSign },
    { id: 3, type: 'raid', message: 'SpeedDemon raided with 543 viewers', time: '15 min ago', icon: Users },
    { id: 4, type: 'achievement', message: 'Unlocked Stream Veteran badge', time: '1 hour ago', icon: Award },
  ];

  const MetricCard = ({ title, value, change, icon: Icon, gradient, subtitle }: unknown) => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <div 
        style={{
          ...styles.metricCard,
          ...(isHovered ? styles.metricCardHover : {})}}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={{ ...styles.metricGradientOverlay, background: gradient }} />
        <div style={styles.metricContent}>
          <div style={styles.metricHeader}>
            <div style={{ ...styles.metricIconWrapper, background: gradient }}>
              <Icon style={{ width: '24px', height: '24px' }} />
            </div>
            {change && (
              <div style={styles.badge}>
                <TrendingUp style={{ width: '12px', height: '12px' }} />
                {change}%
              </div>
            )}
          </div>
          <h3 style={styles.metricValue}>{value}</h3>
          <p style={styles.metricLabel}>{title}</p>
          {subtitle && <p style={styles.metricSubtitle}>{subtitle}</p>}
        </div>
      </div>
    );
  };

  const StreamCard = ({ stream, index }: { stream: unknown; index: number }) => {
    const Icon = categoryIcons[stream.category] || Gamepad2;
    const isHovered = hoveredStream === index;
    
    return (
      <div 
        style={{
          ...styles.streamCard,
          ...(isHovered ? styles.streamCardHover : {})}}
        onMouseEnter={() => setHoveredStream(index)}
        onMouseLeave={() => setHoveredStream(null)}
        onClick={() => navigate(`/streams/${stream.id}`)}
      >
        <div style={styles.streamThumbnail}>
          <img 
            src={stream.thumbnail} 
            alt={stream.title}
            style={{
              ...styles.streamImage,
              ...(isHovered ? styles.streamImageHover : {})}}
          />
          {/* Live indicator */}
          <div style={styles.liveBadge}>
            <span style={styles.liveDot} />
            LIVE
          </div>
          {/* Duration */}
          <div style={styles.durationBadge}>
            {stream.duration}
          </div>
          {/* Viewers */}
          <div style={styles.viewerBadge}>
            <Eye style={{ width: '12px', height: '12px' }} />
            {stream.viewers.toLocaleString()}
          </div>
          {/* Hover preview */}
          {isHovered && (
            <div style={styles.streamOverlay}>
              <div style={{ color: '#ffffff' }}>
                <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>{stream.category}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {stream.tags.map((tag: string, i: number) => (
                    <span 
                      key={i} 
                      style={{
                        fontSize: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        padding: '2px 8px',
                        borderRadius: '4px'}}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div style={styles.streamContent}>
          <div style={styles.streamInfo}>
            <img 
              src={stream.avatar} 
              alt={stream.streamer}
              style={styles.avatar}
            />
            <div style={styles.streamDetails}>
              <h3 style={{
                ...styles.streamTitle,
                ...(isHovered ? styles.streamTitleHover : {})}}>
                {stream.title}
              </h3>
              <div style={styles.streamMeta}>
                <p style={styles.streamAuthor}>{stream.streamer}</p>
                {stream.isPartner && (
                  <span style={styles.partnerBadge}>
                    <Award style={{ width: '12px', height: '12px' }} />
                  </span>
                )}
              </div>
              <div style={styles.streamCategory}>
                <Icon style={{ width: '16px', height: '16px' }} />
                <p>{stream.category}</p>
              </div>
            </div>
            <button 
              style={{
                ...styles.moreButton,
                ...(isHovered ? styles.moreButtonVisible : {})}}
              onClick={(e) => {
                e.stopPropagation();
                // Handle more options
              }}
            >
              <MoreVertical style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingContent}>
          <div style={styles.loadingGlow}>
            <div style={styles.loadingPulse} />
          </div>
          <div style={styles.loadingBox}>
            <Activity style={{ width: '48px', height: '48px', ...styles.spinner }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Stream Background Effect */}
      <div style={styles.backgroundGradient} />
      
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.title}>
              Welcome back, <span style={styles.titleGradient}>Creator</span>
            </h1>
            <p style={styles.subtitle}>Your streaming empire awaits 🎮</p>
          </div>
          <div style={styles.headerActions}>
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
              <BarChart3 style={{ width: '16px', height: '16px' }} />
              Analytics Studio
            </button>
            <button 
              style={{
                ...styles.button,
                ...styles.primaryButton}}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Radio style={{ width: '16px', height: '16px', animation: 'pulse 2s infinite' }} />
              Start Streaming
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={styles.metricGrid}>
          <MetricCard
            title="Monthly Revenue"
            value="$48,574"
            subtitle="+$5,420 from last month"
            change={12.5}
            icon={DollarSign}
            gradient="linear-gradient(135deg, #10b981, #059669)"
          />
          <MetricCard
            title="Live Viewers"
            value="23,456"
            subtitle="Peak: 45,892 viewers"
            change={8.2}
            icon={Eye}
            gradient="linear-gradient(135deg, #a855f7, #ec4899)"
          />
          <MetricCard
            title="Followers"
            value="125.4K"
            subtitle="+12.5K this month"
            change={15.3}
            icon={Users}
            gradient="linear-gradient(135deg, #3b82f6, #06b6d4)"
          />
          <MetricCard
            title="Stream Time"
            value="428hrs"
            subtitle="187 streams this month"
            change={5.7}
            icon={Clock}
            gradient="linear-gradient(135deg, #f97316, #ef4444)"
          />
        </div>

        {/* Live Streams Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Live Channels You Follow</h2>
              <p style={styles.sectionSubtitle}>Your favorite creators are streaming right now</p>
            </div>
            <button 
              style={{
                ...styles.button,
                backgroundColor: 'transparent',
                color: '#ffffff',
                border: 'none'}}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1f1f1f';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              View All
              <Sparkles style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
          
          <div style={styles.streamGrid}>
            {liveStreams.map((stream, index) => (
              <StreamCard key={stream.id} stream={stream} index={index} />
            ))}
          </div>
        </div>

        {/* Analytics Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Revenue & Subscribers Chart */}
          <div style={{ ...styles.chartCard, gridColumn: 'span 2' }}>
            <div style={styles.chartHeader}>
              <div>
                <h3 style={styles.chartTitle}>Revenue & Growth</h3>
                <p style={styles.chartDescription}>Track your earnings and subscriber growth</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={styles.legendBadge}>
                  <div style={{ ...styles.legendDot, backgroundColor: '#8b5cf6' }} />
                  Revenue
                </div>
                <div style={styles.legendBadge}>
                  <div style={{ ...styles.legendDot, backgroundColor: '#3b82f6' }} />
                  Subscribers
                </div>
              </div>
            </div>
            <div>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSubscribers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#121212', 
                      border: '1px solid #262626',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="subscribers" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorSubscribers)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Engagement Metrics */}
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <div>
                <h3 style={styles.chartTitle}>Engagement Score</h3>
                <p style={styles.chartDescription}>How well your audience interacts</p>
              </div>
            </div>
            <div>
              <ResponsiveContainer width="100%" height={350}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={engagementData}>
                  <RadialBar
                    minAngle={15}
                    background
                    clockWise
                    dataKey="value"
                    cornerRadius={10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#121212', 
                      border: '1px solid #262626',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)'
                    }} 
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                {engagementData.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.fill }} />
                      <span style={{ fontSize: '14px', color: '#ffffff' }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff' }}>{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Category Performance */}
          <div style={styles.chartCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={styles.chartTitle}>Top Categories</h3>
              <button 
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '8px'}}
              >
                <TrendingUp style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {streamCategories.map((category, index) => {
                const Icon = categoryIcons[category.name] || Globe;
                return (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff' }}>{category.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '500' }}>{category.growth}</span>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff' }}>{category.value}%</span>
                      </div>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#262626', borderRadius: '4px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${category.value}%`,
                          backgroundColor: category.color,
                          borderRadius: '4px',
                          transition: 'width 0.3s'}} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={styles.chartCard}>
            <h3 style={{ ...styles.chartTitle, marginBottom: '24px' }}>Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                const iconStyle = {
                  milestone: { backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#c084fc' },
                  donation: { backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399' },
                  raid: { backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' },
                  achievement: { backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}[activity.type] || { backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' };
                
                return (
                  <div key={activity.id} style={{ display: 'flex', gap: '12px' }}>
                    <div style={{
                      padding: '8px',
                      borderRadius: '8px',
                      ...iconStyle}}>
                      <Icon style={{ width: '16px', height: '16px' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', color: '#ffffff' }}>{activity.message}</p>
                      <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={styles.chartCard}>
            <h3 style={{ ...styles.chartTitle, marginBottom: '24px' }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button 
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  color: '#ffffff'}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1f1f1f';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={() => navigate('/streams/new')}
              >
                <Radio style={{ width: '20px', height: '20px' }} />
                <span style={{ fontSize: '12px' }}>Go Live</span>
              </button>
              <button 
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  color: '#ffffff'}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1f1f1f';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={() => navigate('/analytics')}
              >
                <BarChart3 style={{ width: '20px', height: '20px' }} />
                <span style={{ fontSize: '12px' }}>Analytics</span>
              </button>
              <button 
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  color: '#ffffff'}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1f1f1f';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Film style={{ width: '20px', height: '20px' }} />
                <span style={{ fontSize: '12px' }}>Upload</span>
              </button>
              <button 
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  color: '#ffffff'}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1f1f1f';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={() => navigate('/settings')}
              >
                <Award style={{ width: '20px', height: '20px' }} />
                <span style={{ fontSize: '12px' }}>Achievements</span>
              </button>
            </div>
            <div style={{
              marginTop: '16px',
              padding: '16px',
              borderRadius: '8px',
              background: 'linear-gradient(to right, rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.1))',
              border: '1px solid rgba(255, 255, 255, 0.1)'}}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Sparkles style={{ width: '20px', height: '20px', color: '#c084fc' }} />
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff' }}>Pro tip!</p>
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>Stream consistently to grow your audience</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <button
          style={styles.floatingButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            const tooltip = e.currentTarget.querySelector('.tooltip') as HTMLElement;
            if (tooltip) tooltip.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            const tooltip = e.currentTarget.querySelector('.tooltip') as HTMLElement;
            if (tooltip) tooltip.style.opacity = '0';
          }}
          onClick={() => navigate('/streams/new')}
        >
          <Radio style={{ width: '24px', height: '24px' }} />
          <div className="tooltip" style={styles.tooltip}>
            Start Streaming
          </div>
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(168, 85, 247, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(168, 85, 247, 0);
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;