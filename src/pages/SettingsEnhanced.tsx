import React, { useState } from 'react';
import { Bell, Camera, ChevronRight, CreditCard, Globe, Monitor, Save, Shield, User, Video, Volume2, Wifi } from 'lucide-react';

export default function SettingsEnhanced() {
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'streaming', label: 'Streaming', icon: Video },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'appearance', label: 'Appearance', icon: Globe },
  ];

  return (
    <div className="p-8" style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h1>
        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
          Manage your account and streaming preferences
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <div className="col-span-3">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeTab === tab.id 
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white' 
                      : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                  style={{
                    backgroundColor: activeTab === tab.id ? '' : 'transparent',
                    background: activeTab === tab.id ? 'var(--gradient-purple)' : ''
                  }}
                >
                  <Icon size={20} />
                  <span className="font-medium">{tab.label}</span>
                  <ChevronRight size={16} className="ml-auto" />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="col-span-9">
          <div className="card" style={{ padding: '32px' }}>
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                  Profile Information
                </h2>
                <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
                  Update your personal details and public profile
                </p>

                <div className="space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      <div 
                        className="w-24 h-24 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--gradient-purple)' }}
                      >
                        <User size={40} color="white" />
                      </div>
                      <button 
                        className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ 
                          background: 'var(--bg-hover)', 
                          border: '2px solid var(--bg-card)'
                        }}
                      >
                        <Camera size={14} style={{ color: 'var(--text-primary)' }} />
                      </button>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        Profile Picture
                      </h3>
                      <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                        Upload a photo to personalize your profile
                      </p>
                      <button className="btn-secondary text-sm">
                        Upload Photo
                      </button>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        Display Name
                      </label>
                      <input 
                        type="text" 
                        defaultValue="BigfootStreamer"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        Username
                      </label>
                      <input 
                        type="text" 
                        defaultValue="@bigfoot_pro"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      defaultValue="john@bigfootlive.io"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Bio
                    </label>
                    <textarea 
                      rows={4}
                      placeholder="Tell viewers about yourself..."
                      className="w-full"
                      style={{ resize: 'none' }}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Maximum 160 characters
                    </p>
                  </div>

                  <div className="pt-4">
                    <button className="btn-primary">
                      <Save size={16} />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                  Notification Preferences
                </h2>
                <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
                  Choose how you want to be notified about important updates
                </p>

                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div 
                    className="p-6 rounded-lg"
                    style={{ backgroundColor: 'var(--bg-tertiary)' }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                          Email Notifications
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Receive updates via email
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={notifications.email}
                          onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          New viewer milestones
                        </span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          Stream performance reports
                        </span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          Marketing and promotional emails
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div 
                    className="p-6 rounded-lg"
                    style={{ backgroundColor: 'var(--bg-tertiary)' }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                          Push Notifications
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Get instant alerts on your device
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={notifications.push}
                          onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* SMS Notifications */}
                  <div 
                    className="p-6 rounded-lg"
                    style={{ backgroundColor: 'var(--bg-tertiary)' }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                          SMS Notifications
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Critical alerts via text message
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={notifications.sms}
                          onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Streaming Tab */}
            {activeTab === 'streaming' && (
              <div>
                <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                  Streaming Settings
                </h2>
                <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
                  Configure your streaming quality and preferences
                </p>

                <div className="space-y-8">
                  {/* Video Quality */}
                  <div>
                    <h3 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                      <Monitor className="inline mr-2" size={18} />
                      Video Quality
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all hover:bg-gray-800" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <input type="radio" name="quality" defaultChecked />
                        <div className="flex-1">
                          <div className="font-medium" style={{ color: 'var(--text-primary)' }}>1080p HD</div>
                          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>High definition streaming</div>
                        </div>
                        <span className="text-sm font-medium px-2 py-1 rounded" style={{ backgroundColor: 'rgba(147, 51, 234, 0.1)', color: '#9333ea' }}>
                          Recommended
                        </span>
                      </label>
                      <label className="flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all hover:bg-gray-800" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <input type="radio" name="quality" />
                        <div className="flex-1">
                          <div className="font-medium" style={{ color: 'var(--text-primary)' }}>4K Ultra HD</div>
                          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Maximum quality (requires more bandwidth)</div>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all hover:bg-gray-800" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <input type="radio" name="quality" />
                        <div className="flex-1">
                          <div className="font-medium" style={{ color: 'var(--text-primary)' }}>720p</div>
                          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Standard quality</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Audio Settings */}
                  <div>
                    <h3 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                      <Volume2 className="inline mr-2" size={18} />
                      Audio Settings
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                          Microphone Input
                        </label>
                        <select className="w-full">
                          <option>Default Microphone</option>
                          <option>USB Audio Device</option>
                          <option>Built-in Microphone</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                          Audio Bitrate
                        </label>
                        <select className="w-full">
                          <option>128 kbps</option>
                          <option>192 kbps</option>
                          <option>256 kbps</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Network Settings */}
                  <div>
                    <h3 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                      <Wifi className="inline mr-2" size={18} />
                      Network Optimization
                    </h3>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <span style={{ color: 'var(--text-primary)' }}>Adaptive Bitrate</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Automatically adjust quality based on viewer's connection
                      </p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button className="btn-primary">
                      <Save size={16} />
                      Save Streaming Settings
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}