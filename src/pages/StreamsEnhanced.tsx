import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { AlertCircle, BookOpen, CheckCircle, Clock, Copy, DollarSign, Dumbbell, Edit3, Eye,  Gamepad2, Grid3x3,   List, MessageSquare, MonitorSpeaker, MoreVertical, Music, Palette, PauseCircle, Radio, RefreshCw, Search,  Settings, Share2,   StopCircle, Trash2,  Utensils, Video } from 'lucide-react';
import { toast } from 'sonner';

// Stream management data
const myStreams = [
  {
    id: '1',
    title: 'Evening Gaming Session - Road to Diamond',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=225&fit=crop',
    status: 'live',
    viewers: 15420,
    duration: '2:34:15',
    category: 'Gaming',
    tags: ['Valorant', 'Competitive', 'English'],
    health: 'excellent',
    bitrate: 6000,
    fps: 60,
    resolution: '1920x1080',
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    peakViewers: 18543,
    avgViewers: 14250,
    revenue: 1247.50,
    chatActivity: 'high',
    streamKey: 'live_8xKd9Lm2nP4qR7vT',
    serverUrl: 'rtmp://live.bigfootlive.com/live'
  },
  {
    id: '2',
    title: 'Art Stream: Commission Work',
    thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=225&fit=crop',
    status: 'scheduled',
    scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    category: 'Art',
    tags: ['Digital Art', 'Commissions', 'Chill'],
    streamKey: 'live_3fGh8Jk5mN9pQ2wX',
    serverUrl: 'rtmp://live.bigfootlive.com/live'
  },
  {
    id: '3',
    title: 'Morning Yoga Flow',
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=225&fit=crop',
    status: 'ended',
    viewers: 3421,
    duration: '45:20',
    category: 'Fitness',
    tags: ['Yoga', 'Wellness', 'Morning'],
    endTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
    peakViewers: 4532,
    avgViewers: 3100,
    revenue: 456.30,
    vod: true
  }
];

const categories = [
  { name: 'Gaming', icon: Gamepad2, color: 'from-purple-500 to-purple-600' },
  { name: 'Just Chatting', icon: MessageSquare, color: 'from-blue-500 to-blue-600' },
  { name: 'Art', icon: Palette, color: 'from-pink-500 to-pink-600' },
  { name: 'Music', icon: Music, color: 'from-green-500 to-green-600' },
  { name: 'Education', icon: BookOpen, color: 'from-yellow-500 to-yellow-600' },
  { name: 'Cooking', icon: Utensils, color: 'from-orange-500 to-orange-600' },
  { name: 'Fitness', icon: Dumbbell, color: 'from-red-500 to-red-600' },
];

export default function StreamsEnhanced() {
  // const __navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  // const [__selectedCategory, _setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStreamKey, setShowStreamKey] = useState<{ [key: string]: boolean }>({});
  // const [__selectedStream, _setSelectedStream] = useState<unknown>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showDialog, setShowDialog] = useState(false);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

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
      border: '1px solid rgba(255, 255, 255, 0.1)'},
    primaryButton: {
      background: 'linear-gradient(to right, #a855f7, #3b82f6)',
      color: '#ffffff',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'},
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px',
      marginBottom: '32px'},
    statCard: {
      backgroundColor: 'rgba(18, 18, 18, 0.5)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '24px'},
    statContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'},
    statInfo: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '4px'},
    statLabel: {
      fontSize: '14px',
      color: '#9ca3af'},
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#ffffff'},
    statIcon: {
      padding: '12px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'},
    tabs: {
      marginBottom: '24px'},
    tabsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'},
    tabsList: {
      display: 'flex',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      padding: '4px',
      borderRadius: '8px',
      gap: '4px'},
    tabTrigger: {
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: 'transparent',
      color: '#9ca3af',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'},
    tabTriggerActive: {
      backgroundColor: '#262626',
      color: '#ffffff'},
    badge: {
      backgroundColor: '#ef4444',
      color: '#ffffff',
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '600'},
    searchContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'},
    searchWrapper: {
      position: 'relative' as const},
    searchIcon: {
      position: 'absolute' as const,
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af'},
    input: {
      backgroundColor: '#1f1f1f',
      border: '1px solid #374151',
      borderRadius: '8px',
      padding: '10px 16px 10px 40px',
      fontSize: '14px',
      color: '#ffffff',
      outline: 'none',
      width: '250px',
      transition: 'all 0.2s'},
    viewToggle: {
      display: 'flex',
      gap: '4px',
      padding: '4px',
      borderRadius: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)'},
    viewButton: {
      padding: '8px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: 'transparent',
      color: '#9ca3af',
      cursor: 'pointer',
      transition: 'all 0.2s'},
    viewButtonActive: {
      backgroundColor: '#262626',
      color: '#ffffff'},
    streamGrid: {
      display: 'grid',
      gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(350px, 1fr))' : '1fr',
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
    scheduledBadge: {
      position: 'absolute' as const,
      top: '12px',
      left: '12px',
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'},
    endedBadge: {
      position: 'absolute' as const,
      top: '12px',
      left: '12px',
      backgroundColor: '#6b7280',
      color: '#ffffff',
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '600'},
    viewerBadge: {
      position: 'absolute' as const,
      top: '12px',
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
      flexDirection: 'column' as const,
      gap: '12px'},
    streamTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#ffffff',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: 1,
      WebkitBoxOrient: 'vertical' as const,
      transition: 'color 0.2s'},
    streamTitleHover: {
      color: '#a855f7'},
    streamMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      color: '#9ca3af'},
    healthIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '14px',
      fontWeight: '500'},
    streamStats: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '12px',
      color: '#9ca3af'},
    streamFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'},
    tagList: {
      display: 'flex',
      gap: '4px'},
    tag: {
      backgroundColor: '#262626',
      color: '#9ca3af',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '12px'},
    dropdown: {
      position: 'relative' as const},
    dropdownButton: {
      padding: '8px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: 'transparent',
      color: '#9ca3af',
      cursor: 'pointer',
      transition: 'all 0.2s'},
    dropdownMenu: {
      position: 'absolute' as const,
      top: '100%',
      right: 0,
      marginTop: '4px',
      backgroundColor: '#121212',
      border: '1px solid #262626',
      borderRadius: '8px',
      padding: '8px',
      minWidth: '200px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      zIndex: 10},
    dropdownItem: {
      padding: '8px 12px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: 'transparent',
      color: '#ffffff',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      width: '100%',
      textAlign: 'left' as const,
      transition: 'all 0.2s'},
    dropdownItemHover: {
      backgroundColor: '#262626'},
    dropdownItemDanger: {
      color: '#ef4444'},
    dropdownSeparator: {
      height: '1px',
      backgroundColor: '#262626',
      margin: '8px 0'},
    dialog: {
      position: 'fixed' as const,
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50},
    dialogContent: {
      backgroundColor: '#121212',
      border: '1px solid #262626',
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '90vh',
      overflow: 'auto'},
    dialogHeader: {
      marginBottom: '16px'},
    dialogTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#ffffff'},
    dialogDescription: {
      fontSize: '14px',
      color: '#9ca3af',
      marginTop: '4px'},
    dialogBody: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '24px'},
    formGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px'},
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#e5e7eb'},
    inputGroup: {
      display: 'flex',
      gap: '8px'},
    monoInput: {
      fontFamily: 'monospace',
      fontSize: '14px'},
    recommendedSettings: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
      padding: '16px'},
    settingsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      fontSize: '14px'},
    settingItem: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '4px'},
    settingLabel: {
      color: '#9ca3af'},
    settingValue: {
      color: '#ffffff',
      fontWeight: '500'},
    dialogFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '24px'},
    liveDot: {
      width: '8px',
      height: '8px',
      backgroundColor: '#ffffff',
      borderRadius: '50%',
      animation: 'pulse 1.5s infinite'}};

  const handleCopyStreamKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('Stream key copied to clipboard');
  };

  const handleCopyServerUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Server URL copied to clipboard');
  };

  const StreamHealthIndicator = ({ health }: { health: string }) => {
    const config = {
      excellent: { color: '#10b981', icon: CheckCircle, label: 'Excellent' },
      good: { color: '#3b82f6', icon: CheckCircle, label: 'Good' },
      fair: { color: '#f59e0b', icon: AlertCircle, label: 'Fair' },
      poor: { color: '#ef4444', icon: AlertCircle, label: 'Poor' }
    };
    
    const { color, icon: Icon, label } = config[health as keyof typeof config] || config.good;
    
    return (
      <div style={{ ...styles.healthIndicator, color }}>
        <Icon style={{ width: '16px', height: '16px' }} />
        <span>{label}</span>
      </div>
    );
  };

  const StreamCard = ({ stream }: { stream: unknown }) => {
    const isLive = stream.status === 'live';
    const isScheduled = stream.status === 'scheduled';
    const categoryIcon = categories.find(c => c.name === stream.category)?.icon || Video;
    const CategoryIcon = categoryIcon;
    const [isHovered, setIsHovered] = useState(false);
    const dropdownId = `dropdown-${stream.id}`;
    
    return (
      <div 
        style={{
          ...styles.streamCard,
          ...(isHovered ? styles.streamCardHover : {})}}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
          
          {/* Status overlay */}
          {isLive && (
            <>
              <div style={styles.liveBadge}>
                <span style={styles.liveDot} />
                LIVE
              </div>
              <div style={styles.viewerBadge}>
                <Eye style={{ width: '12px', height: '12px' }} />
                {stream.viewers.toLocaleString()}
              </div>
              <div style={styles.durationBadge}>
                {stream.duration}
              </div>
            </>
          )}
          
          {isScheduled && (
            <div style={styles.scheduledBadge}>
              <Clock style={{ width: '12px', height: '12px' }} />
              SCHEDULED
            </div>
          )}
          
          {stream.status === 'ended' && (
            <div style={styles.endedBadge}>
              ENDED
            </div>
          )}
        </div>
        
        <div style={styles.streamContent}>
          <div style={styles.streamInfo}>
            <div>
              <h3 style={{
                ...styles.streamTitle,
                ...(isHovered ? styles.streamTitleHover : {})}}>
                {stream.title}
              </h3>
              <div style={styles.streamMeta}>
                <CategoryIcon style={{ width: '16px', height: '16px' }} />
                <span>{stream.category}</span>
              </div>
            </div>
            
            {isLive && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <StreamHealthIndicator health={stream.health} />
                <div style={styles.streamStats}>
                  <span>{stream.bitrate}kbps</span>
                  <span>{stream.fps}fps</span>
                  <span>{stream.resolution}</span>
                </div>
              </div>
            )}
            
            {isScheduled && (
              <div style={{ fontSize: '14px', color: '#9ca3af' }}>
                Starts {new Date(stream.scheduledTime).toLocaleString()}
              </div>
            )}
            
            {stream.status === 'ended' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#9ca3af' }}>Peak viewers</span>
                  <span style={{ fontWeight: '500', color: '#ffffff' }}>{stream.peakViewers.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#9ca3af' }}>Revenue</span>
                  <span style={{ fontWeight: '500', color: '#10b981' }}>${stream.revenue.toFixed(2)}</span>
                </div>
              </div>
            )}
            
            <div style={styles.streamFooter}>
              <div style={styles.tagList}>
                {stream.tags.slice(0, 2).map((tag: string, i: number) => (
                  <span key={i} style={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
              
              <div style={styles.dropdown}>
                <button
                  style={styles.dropdownButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(showDropdown === dropdownId ? null : dropdownId);
                  }}
                >
                  <MoreVertical style={{ width: '16px', height: '16px' }} />
                </button>
                {showDropdown === dropdownId && (
                  <div style={styles.dropdownMenu}>
                    <div style={{ padding: '8px 12px', fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>Stream Actions</div>
                    <div style={styles.dropdownSeparator} />
                    {isLive && (
                      <>
                        <button
                          style={styles.dropdownItem}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#262626';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/streams/${stream.id}`);
                          }}
                        >
                          <MonitorSpeaker style={{ width: '16px', height: '16px' }} />
                          View Dashboard
                        </button>
                        <button
                          style={styles.dropdownItem}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#262626';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <PauseCircle style={{ width: '16px', height: '16px' }} />
                          Pause Stream
                        </button>
                        <button
                          style={{ ...styles.dropdownItem, ...styles.dropdownItemDanger }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#262626';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <StopCircle style={{ width: '16px', height: '16px' }} />
                          End Stream
                        </button>
                      </>
                    )}
                    {isScheduled && (
                      <>
                        <button
                          style={styles.dropdownItem}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#262626';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <Edit3 style={{ width: '16px', height: '16px' }} />
                          Edit Details
                        </button>
                        <button
                          style={styles.dropdownItem}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#262626';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <Clock style={{ width: '16px', height: '16px' }} />
                          Reschedule
                        </button>
                      </>
                    )}
                    {stream.status === 'ended' && stream.vod && (
                      <button
                        style={styles.dropdownItem}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#262626';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Video style={{ width: '16px', height: '16px' }} />
                        View VOD
                      </button>
                    )}
                    <button
                      style={styles.dropdownItem}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#262626';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Share2 style={{ width: '16px', height: '16px' }} />
                      Share
                    </button>
                    <div style={styles.dropdownSeparator} />
                    <button
                      style={{ ...styles.dropdownItem, ...styles.dropdownItemDanger }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#262626';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Trash2 style={{ width: '16px', height: '16px' }} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Stream Manager</h1>
          <p style={styles.subtitle}>Manage your streams and go live</p>
        </div>
        <div style={styles.headerActions}>
          <button 
            style={{
              ...styles.button,
              ...styles.outlineButton}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <RefreshCw style={{ width: '16px', height: '16px' }} />
            Refresh
          </button>
          <button 
            style={{
              ...styles.button,
              ...styles.primaryButton}}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #9333ea, #2563eb)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #a855f7, #3b82f6)';
            }}
            onClick={() => setShowDialog(true)}
          >
            <Radio style={{ width: '16px', height: '16px', animation: 'pulse 2s infinite' }} />
            Go Live Now
          </button>
        </div>
      </div>

      {/* Dialog */}
      {showDialog && (
        <div style={styles.dialog} onClick={() => setShowDialog(false)}>
          <div style={styles.dialogContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.dialogHeader}>
              <h2 style={styles.dialogTitle}>Stream Configuration</h2>
              <p style={styles.dialogDescription}>
                Configure your stream settings in OBS, Streamlabs, or your preferred software
              </p>
            </div>
            <div style={styles.dialogBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Server URL</label>
                  <div style={styles.inputGroup}>
                    <input 
                      value="rtmp://live.bigfootlive.com/live" 
                      readOnly 
                      style={{ ...styles.input, ...styles.monoInput, flex: 1 }}
                    />
                    <button 
                      style={{
                        ...styles.button,
                        ...styles.outlineButton,
                        padding: '10px'}}
                      onClick={() => handleCopyServerUrl('rtmp://live.bigfootlive.com/live')}
                    >
                      <Copy style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Stream Key</label>
                  <div style={styles.inputGroup}>
                    <input 
                      type={showStreamKey['new'] ? 'text' : 'password'}
                      value="live_8xKd9Lm2nP4qR7vT" 
                      readOnly 
                      style={{ ...styles.input, ...styles.monoInput, flex: 1 }}
                    />
                    <button 
                      style={{
                        ...styles.button,
                        ...styles.outlineButton,
                        padding: '10px'}}
                      onClick={() => setShowStreamKey({ ...showStreamKey, new: !showStreamKey.new })}
                    >
                      <Eye style={{ width: '16px', height: '16px' }} />
                    </button>
                    <button 
                      style={{
                        ...styles.button,
                        ...styles.outlineButton,
                        padding: '10px'}}
                      onClick={() => handleCopyStreamKey('live_8xKd9Lm2nP4qR7vT')}
                    >
                      <Copy style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div style={styles.recommendedSettings}>
                <h4 style={{ fontWeight: '500', marginBottom: '8px', color: '#ffffff' }}>Recommended Settings</h4>
                <div style={styles.settingsGrid}>
                  <div style={styles.settingItem}>
                    <span style={styles.settingLabel}>Resolution:</span>
                    <span style={styles.settingValue}>1920x1080 (1080p)</span>
                  </div>
                  <div style={styles.settingItem}>
                    <span style={styles.settingLabel}>Framerate:</span>
                    <span style={styles.settingValue}>60 FPS</span>
                  </div>
                  <div style={styles.settingItem}>
                    <span style={styles.settingLabel}>Video Bitrate:</span>
                    <span style={styles.settingValue}>6000 Kbps</span>
                  </div>
                  <div style={styles.settingItem}>
                    <span style={styles.settingLabel}>Audio Bitrate:</span>
                    <span style={styles.settingValue}>160 Kbps</span>
                  </div>
                  <div style={styles.settingItem}>
                    <span style={styles.settingLabel}>Encoder:</span>
                    <span style={styles.settingValue}>x264 or NVENC</span>
                  </div>
                  <div style={styles.settingItem}>
                    <span style={styles.settingLabel}>Keyframe:</span>
                    <span style={styles.settingValue}>2 seconds</span>
                  </div>
                </div>
              </div>
              
              <div style={styles.dialogFooter}>
                <button 
                  style={{
                    ...styles.button,
                    ...styles.outlineButton}}
                  onClick={() => navigate('/streams/new')}
                >
                  <Settings style={{ width: '16px', height: '16px' }} />
                  Advanced Settings
                </button>
                <button 
                  style={{
                    ...styles.button,
                    ...styles.primaryButton}}
                  onClick={() => {
                    toast.success('Stream configuration saved. You can now start streaming!');
                    navigate('/streams/new');
                  }}
                >
                  Configure Stream
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stream Stats Overview */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statContent}>
            <div style={styles.statInfo}>
              <p style={styles.statLabel}>Live Streams</p>
              <p style={styles.statValue}>
                {myStreams.filter(s => s.status === 'live').length}
              </p>
            </div>
            <div style={{ ...styles.statIcon, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              <Radio style={{ width: '20px', height: '20px', color: '#ef4444' }} />
            </div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statContent}>
            <div style={styles.statInfo}>
              <p style={styles.statLabel}>Total Viewers</p>
              <p style={styles.statValue}>
                {myStreams
                  .filter(s => s.status === 'live')
                  .reduce((acc, s) => acc + (s.viewers || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
            <div style={{ ...styles.statIcon, backgroundColor: 'rgba(168, 85, 247, 0.1)' }}>
              <Eye style={{ width: '20px', height: '20px', color: '#a855f7' }} />
            </div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statContent}>
            <div style={styles.statInfo}>
              <p style={styles.statLabel}>Today's Revenue</p>
              <p style={styles.statValue}>
                ${myStreams
                  .reduce((acc, s) => acc + (s.revenue || 0), 0)
                  .toFixed(2)}
              </p>
            </div>
            <div style={{ ...styles.statIcon, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <DollarSign style={{ width: '20px', height: '20px', color: '#10b981' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <div style={styles.tabsHeader}>
          <div style={styles.tabsList}>
            <button
              style={{
                ...styles.tabTrigger,
                ...(activeTab === 'all' ? styles.tabTriggerActive : {})}}
              onClick={() => setActiveTab('all')}
            >
              All Streams
            </button>
            <button
              style={{
                ...styles.tabTrigger,
                ...(activeTab === 'live' ? styles.tabTriggerActive : {})}}
              onClick={() => setActiveTab('live')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Live
                <span style={styles.badge}>
                  {myStreams.filter(s => s.status === 'live').length}
                </span>
              </span>
            </button>
            <button
              style={{
                ...styles.tabTrigger,
                ...(activeTab === 'scheduled' ? styles.tabTriggerActive : {})}}
              onClick={() => setActiveTab('scheduled')}
            >
              Scheduled
            </button>
            <button
              style={{
                ...styles.tabTrigger,
                ...(activeTab === 'past' ? styles.tabTriggerActive : {})}}
              onClick={() => setActiveTab('past')}
            >
              Past Streams
            </button>
          </div>
          
          <div style={styles.searchContainer}>
            <div style={styles.searchWrapper}>
              <Search style={{ ...styles.searchIcon, width: '16px', height: '16px' }} />
              <input 
                placeholder="Search streams..."
                style={styles.input}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#a855f7';
                  e.target.style.backgroundColor = '#262626';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#374151';
                  e.target.style.backgroundColor = '#1f1f1f';
                }}
              />
            </div>
            <div style={styles.viewToggle}>
              <button
                style={{
                  ...styles.viewButton,
                  ...(viewMode === 'grid' ? styles.viewButtonActive : {})}}
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 style={{ width: '16px', height: '16px' }} />
              </button>
              <button
                style={{
                  ...styles.viewButton,
                  ...(viewMode === 'list' ? styles.viewButtonActive : {})}}
                onClick={() => setViewMode('list')}
              >
                <List style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'all' && (
          <div style={{ ...styles.streamGrid, gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(350px, 1fr))' : '1fr' }}>
            {myStreams.map((stream) => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        )}

        {activeTab === 'live' && (
          <div style={{ ...styles.streamGrid, gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(350px, 1fr))' : '1fr' }}>
            {myStreams.filter(s => s.status === 'live').map((stream) => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        )}

        {activeTab === 'scheduled' && (
          <div style={{ ...styles.streamGrid, gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(350px, 1fr))' : '1fr' }}>
            {myStreams.filter(s => s.status === 'scheduled').map((stream) => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        )}

        {activeTab === 'past' && (
          <div style={{ ...styles.streamGrid, gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(350px, 1fr))' : '1fr' }}>
            {myStreams.filter(s => s.status === 'ended').map((stream) => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
          }
        }
      `}</style>
    </div>
  );
}