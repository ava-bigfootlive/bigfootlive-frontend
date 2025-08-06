import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { TenantIdPManager } from '../../components/admin/TenantIdPManager';
import { SSOProvider, SSOConfig } from '../../types/auth';

interface TenantAdminPageProps {
  className?: string;
}

// Mock tenant data - this would come from your API
interface TenantInfo {
  id: string;
  name: string;
  domain: string;
  plan: 'starter' | 'business' | 'enterprise';
  users: number;
  isActive: boolean;
}

export const TenantAdminPage: React.FC<TenantAdminPageProps> = ({ className = '' }) => {
  const { user, hasRole } = useAuth();
  const [activeSection, setActiveSection] = useState<'overview' | 'sso' | 'users' | 'billing' | 'settings'>('overview');
  const [currentProvider, setCurrentProvider] = useState<SSOProvider | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock tenant data - replace with actual API calls
  const [tenantInfo] = useState<TenantInfo>({
    id: 'tenant-123',
    name: 'Disney Entertainment',
    domain: 'disney.com',
    plan: 'enterprise',
    users: 1250,
    isActive: true
  });

  // Check if user has admin access
  const hasAdminAccess = hasRole('admin') || hasRole('tenant_admin');

  // Load current SSO provider on mount
  useEffect(() => {
    if (hasAdminAccess) {
      loadCurrentSSOProvider();
    }
  }, [hasAdminAccess]);

  const loadCurrentSSOProvider = async () => {
    setIsLoading(true);
    try {
      // Replace with actual API call
      // const response = await fetch(`/api/tenants/${tenantInfo.id}/sso`);
      // const provider = await response.json();
      // setCurrentProvider(provider);
      
      // Mock data for demonstration - Disney uses Okta
      const mockProvider: SSOProvider = {
        id: 'disney-okta',
        name: 'okta',
        displayName: 'Disney Okta SSO',
        type: 'saml',
        isEnabled: true,
        isDefault: true,
        config: {
          saml: {
            entryPoint: 'https://disney.okta.com/app/bigfootlive/exk1234567890abcdef/sso/saml',
            issuer: 'http://www.okta.com/exk1234567890abcdef',
            cert: '-----BEGIN CERTIFICATE-----\nMIIDpDCCAoygAwIBAgIGAV2ka+55MA0GCSqGSIb3DQEBCwUAMIGSMQswCQYDVQQG\nEwJVUzETMBEGA1UECAwKQ2FsaWZvcm5pYTEWMBQGA1UEBwwNU2FuIEZyYW5jaXNj\nbzENMAsGA1UECgwET2t0YTEUMBIGA1UECwwLU1NPUHJvdmlkZXIxEzARBgNVBAMM\nCmRpc25leS5jb20xHDAaBgkqhkiG9w0BCQEWDWluZm9Ab2t0YS5jb20wHhcNMTgw\nMzI3MjExOTEwWhcNMjgwMzI3MjEyMDEwWjCBkjELMAkGA1UEBhMCVVMxEzARBgNV\nBAgMCkNhbGlmb3JuaWExFjAUBgNVBAcMDVNhbiBGcmFuY2lzY28xDTALBgNVBAoM\nBE9rdGExFDASBgNVBAsMC1NTT1Byb3ZpZGVyMRMwEQYDVQQDDApkaXNuZXkuY29t\nMRwwGgYJKoZIhvcNAQkBFg1pbmZvQG9rdGEuY29tMIIBIjANBgkqhkiG9w0BAQEF\nAAOCAQ8AMIIBCgKCAQEAuHgwOgpeoSYT4u5sdfb1yQfDvhX8+jkU2eQeQ==\n-----END CERTIFICATE-----',
            callbackUrl: `${window.location.origin}/auth/saml/callback`,
            signatureAlgorithm: 'sha256',
            digestAlgorithm: 'sha256',
            wantAssertionsSigned: true,
            wantResponseSigned: false,
            signRequest: false,
            encryptAssertion: false
          }
        },
        attributeMapping: {
          email: 'email',
          username: 'username',
          firstName: 'firstName',
          lastName: 'lastName',
          displayName: 'displayName',
          groups: 'groups'
        },
        groupMapping: [
          { ssoGroup: 'BigfootLive-Administrators', internalRole: 'admin', permissions: [] },
          { ssoGroup: 'BigfootLive-ContentManagers', internalRole: 'manager', permissions: [] },
          { ssoGroup: 'BigfootLive-Users', internalRole: 'user', permissions: [] }
        ],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20')
      };
      
      // Simulate API delay
      setTimeout(() => {
        setCurrentProvider(mockProvider);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load SSO provider:', error);
      setIsLoading(false);
    }
  };

  const handleSaveSSO = async (provider: Partial<SSOProvider>) => {
    setIsLoading(true);
    try {
      // Replace with actual API call
      // const response = await fetch(`/api/tenants/${tenantInfo.id}/sso`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(provider)
      // });
      // const savedProvider = await response.json();
      
      // Mock implementation
      console.log('Saving SSO provider:', provider);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update current provider
      setCurrentProvider({
        ...currentProvider,
        ...provider,
        id: currentProvider?.id || `sso-${Date.now()}`,
        updatedAt: new Date()
      } as SSOProvider);
    } catch (error) {
      console.error('Failed to save SSO provider:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSSO = async (config: SSOConfig) => {
    // Replace with actual API call
    // const response = await fetch(`/api/tenants/${tenantInfo.id}/sso/test`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(config)
    // });
    // return response.json();

    // Mock implementation
    console.log('Testing SSO configuration:', config);
    
    // Simulate API delay and test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock test results
    if (config.saml?.entryPoint && config.saml?.issuer && config.saml?.cert) {
      return {
        success: true,
        message: 'SSO connection test successful. Metadata retrieved and certificate validated.',
        metadata: {
          entityId: config.saml.issuer,
          ssoUrl: config.saml.entryPoint,
          certificateFingerprint: 'AA:BB:CC:DD:EE:FF...',
          supportedNameIdFormats: ['urn:oasis:names:tc:SAML:2.0:nameid-format:emailAddress'],
          responseTime: '245ms'
        }
      };
    } else {
      return {
        success: false,
        message: 'SSO configuration incomplete. Please ensure all required fields are filled.',
        metadata: null
      };
    }
  };

  const handleDisableSSO = async () => {
    setIsLoading(true);
    try {
      // Replace with actual API call
      // await fetch(`/api/tenants/${tenantInfo.id}/sso`, { method: 'DELETE' });
      
      // Mock implementation
      console.log('Disabling SSO');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentProvider(null);
    } catch (error) {
      console.error('Failed to disable SSO:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if not admin
  if (!hasAdminAccess) {
    return (
      <div className="tenant-admin-page__unauthorized">
        <h2>Access Denied</h2>
        <p>You don't have permission to access tenant administration.</p>
      </div>
    );
  }

  return (
    <div className={`tenant-admin-page ${className}`}>
      {/* Header */}
      <div className="tenant-admin-page__header">
        <div className="tenant-admin-page__tenant-info">
          <h1>{tenantInfo.name}</h1>
          <div className="tenant-admin-page__tenant-details">
            <span className="tenant-admin-page__domain">{tenantInfo.domain}</span>
            <span className={`tenant-admin-page__plan tenant-admin-page__plan--${tenantInfo.plan}`}>
              {tenantInfo.plan.toUpperCase()}
            </span>
            <span className="tenant-admin-page__users">{tenantInfo.users} users</span>
            <span className={`tenant-admin-page__status ${tenantInfo.isActive ? 'active' : 'inactive'}`}>
              {tenantInfo.isActive ? '🟢 Active' : '🔴 Inactive'}
            </span>
          </div>
        </div>
        
        <div className="tenant-admin-page__user-info">
          <span>Logged in as: {user?.displayName || user?.email}</span>
          <span className="tenant-admin-page__role">
            {user?.roles.includes('admin') ? 'Super Admin' : 'Tenant Admin'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="tenant-admin-page__nav">
        <button
          className={`tenant-admin-page__nav-item ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSection('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tenant-admin-page__nav-item ${activeSection === 'sso' ? 'active' : ''}`}
          onClick={() => setActiveSection('sso')}
        >
          🔐 Single Sign-On
        </button>
        <button
          className={`tenant-admin-page__nav-item ${activeSection === 'users' ? 'active' : ''}`}
          onClick={() => setActiveSection('users')}
        >
          👥 User Management
        </button>
        <button
          className={`tenant-admin-page__nav-item ${activeSection === 'billing' ? 'active' : ''}`}
          onClick={() => setActiveSection('billing')}
        >
          💳 Billing & Plans
        </button>
        <button
          className={`tenant-admin-page__nav-item ${activeSection === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveSection('settings')}
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Content */}
      <div className="tenant-admin-page__content">
        {activeSection === 'overview' && (
          <div className="tenant-admin-page__overview">
            <h2>Tenant Overview</h2>
            
            <div className="tenant-admin-page__stats-grid">
              <div className="tenant-admin-page__stat-card">
                <h3>Total Users</h3>
                <div className="tenant-admin-page__stat-number">{tenantInfo.users}</div>
                <div className="tenant-admin-page__stat-change">+12% this month</div>
              </div>
              
              <div className="tenant-admin-page__stat-card">
                <h3>Active Sessions</h3>
                <div className="tenant-admin-page__stat-number">847</div>
                <div className="tenant-admin-page__stat-change">Current active</div>
              </div>
              
              <div className="tenant-admin-page__stat-card">
                <h3>SSO Status</h3>
                <div className="tenant-admin-page__stat-number">
                  {currentProvider?.isEnabled ? '✅' : '❌'}
                </div>
                <div className="tenant-admin-page__stat-change">
                  {currentProvider?.isEnabled ? 'Active' : 'Inactive'}
                </div>
              </div>
              
              <div className="tenant-admin-page__stat-card">
                <h3>Plan</h3>
                <div className="tenant-admin-page__stat-number">{tenantInfo.plan}</div>
                <div className="tenant-admin-page__stat-change">Enterprise features</div>
              </div>
            </div>

            <div className="tenant-admin-page__quick-actions">
              <h3>Quick Actions</h3>
              <div className="tenant-admin-page__action-grid">
                <button
                  className="tenant-admin-page__action-card"
                  onClick={() => setActiveSection('sso')}
                >
                  <div className="tenant-admin-page__action-icon">🔐</div>
                  <h4>Configure SSO</h4>
                  <p>Set up single sign-on for your organization</p>
                </button>
                
                <button
                  className="tenant-admin-page__action-card"
                  onClick={() => setActiveSection('users')}
                >
                  <div className="tenant-admin-page__action-icon">👥</div>
                  <h4>Manage Users</h4>
                  <p>Add, remove, and manage user access</p>
                </button>
                
                <button
                  className="tenant-admin-page__action-card"
                  onClick={() => setActiveSection('billing')}
                >
                  <div className="tenant-admin-page__action-icon">💳</div>
                  <h4>Billing Settings</h4>
                  <p>Manage subscription and billing</p>
                </button>
                
                <button
                  className="tenant-admin-page__action-card"
                  onClick={() => setActiveSection('settings')}
                >
                  <div className="tenant-admin-page__action-icon">⚙️</div>
                  <h4>Tenant Settings</h4>
                  <p>Configure organization preferences</p>
                </button>
              </div>
            </div>

            <div className="tenant-admin-page__recent-activity">
              <h3>Recent Activity</h3>
              <div className="tenant-admin-page__activity-list">
                <div className="tenant-admin-page__activity-item">
                  <div className="tenant-admin-page__activity-icon">👤</div>
                  <div className="tenant-admin-page__activity-content">
                    <p><strong>John Smith</strong> logged in via SSO</p>
                    <span className="tenant-admin-page__activity-time">2 minutes ago</span>
                  </div>
                </div>
                <div className="tenant-admin-page__activity-item">
                  <div className="tenant-admin-page__activity-icon">🔐</div>
                  <div className="tenant-admin-page__activity-content">
                    <p>SSO configuration updated</p>
                    <span className="tenant-admin-page__activity-time">1 hour ago</span>
                  </div>
                </div>
                <div className="tenant-admin-page__activity-item">
                  <div className="tenant-admin-page__activity-icon">👥</div>
                  <div className="tenant-admin-page__activity-content">
                    <p><strong>5 new users</strong> added to the system</p>
                    <span className="tenant-admin-page__activity-time">3 hours ago</span>
                  </div>
                </div>
                <div className="tenant-admin-page__activity-item">
                  <div className="tenant-admin-page__activity-icon">⚙️</div>
                  <div className="tenant-admin-page__activity-content">
                    <p>Tenant settings updated by <strong>Jane Doe</strong></p>
                    <span className="tenant-admin-page__activity-time">Yesterday</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'sso' && (
          <TenantIdPManager
            tenantId={tenantInfo.id}
            currentProvider={currentProvider}
            onSave={handleSaveSSO}
            onTest={handleTestSSO}
            onDisable={handleDisableSSO}
          />
        )}

        {activeSection === 'users' && (
          <div className="tenant-admin-page__users">
            <h2>User Management</h2>
            <p>User management features coming soon...</p>
            <div className="tenant-admin-page__placeholder">
              <div className="tenant-admin-page__placeholder-icon">👥</div>
              <h3>User Management Dashboard</h3>
              <p>This section will include:</p>
              <ul>
                <li>User list with search and filtering</li>
                <li>Add/remove users</li>
                <li>Role assignments</li>
                <li>Bulk user operations</li>
                <li>User activity logs</li>
              </ul>
            </div>
          </div>
        )}

        {activeSection === 'billing' && (
          <div className="tenant-admin-page__billing">
            <h2>Billing & Plans</h2>
            <p>Billing management features coming soon...</p>
            <div className="tenant-admin-page__placeholder">
              <div className="tenant-admin-page__placeholder-icon">💳</div>
              <h3>Billing Dashboard</h3>
              <p>This section will include:</p>
              <ul>
                <li>Current plan details</li>
                <li>Usage metrics and limits</li>
                <li>Billing history</li>
                <li>Payment methods</li>
                <li>Plan upgrade/downgrade options</li>
              </ul>
            </div>
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="tenant-admin-page__settings">
            <h2>Tenant Settings</h2>
            <p>Tenant configuration features coming soon...</p>
            <div className="tenant-admin-page__placeholder">
              <div className="tenant-admin-page__placeholder-icon">⚙️</div>
              <h3>Settings Panel</h3>
              <p>This section will include:</p>
              <ul>
                <li>Organization information</li>
                <li>Domain settings</li>
                <li>Security policies</li>
                <li>Branding customization</li>
                <li>API keys and integrations</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Styles */}
      <style jsx>{`
        .tenant-admin-page {
          min-height: 100vh;
          background: #f7fafc;
        }

        .tenant-admin-page__unauthorized {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          text-align: center;
          padding: 2rem;
        }

        .tenant-admin-page__unauthorized h2 {
          color: #e53e3e;
          margin-bottom: 1rem;
        }

        .tenant-admin-page__header {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .tenant-admin-page__tenant-info h1 {
          margin: 0 0 0.75rem 0;
          color: #1a202c;
          font-size: 2rem;
        }

        .tenant-admin-page__tenant-details {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .tenant-admin-page__domain {
          color: #4a5568;
          font-weight: 500;
        }

        .tenant-admin-page__plan {
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .tenant-admin-page__plan--starter {
          background: #bee3f8;
          color: #1a365d;
        }

        .tenant-admin-page__plan--business {
          background: #c6f6d5;
          color: #22543d;
        }

        .tenant-admin-page__plan--enterprise {
          background: #fed7d7;
          color: #742a2a;
        }

        .tenant-admin-page__users {
          color: #4a5568;
          font-weight: 500;
        }

        .tenant-admin-page__status {
          font-weight: 600;
        }

        .tenant-admin-page__status.active {
          color: #22543d;
        }

        .tenant-admin-page__status.inactive {
          color: #742a2a;
        }

        .tenant-admin-page__user-info {
          text-align: right;
          color: #4a5568;
        }

        .tenant-admin-page__user-info span {
          display: block;
          margin-bottom: 0.25rem;
        }

        .tenant-admin-page__role {
          font-weight: 600;
          color: #667eea;
        }

        .tenant-admin-page__nav {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 0 2rem;
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
        }

        .tenant-admin-page__nav-item {
          background: none;
          border: none;
          padding: 1rem 1.5rem;
          cursor: pointer;
          transition: all 0.2s;
          border-bottom: 3px solid transparent;
          white-space: nowrap;
          font-weight: 500;
        }

        .tenant-admin-page__nav-item:hover {
          background: #f7fafc;
        }

        .tenant-admin-page__nav-item.active {
          border-bottom-color: #667eea;
          color: #667eea;
          background: #f0f4ff;
        }

        .tenant-admin-page__content {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .tenant-admin-page__overview h2 {
          margin: 0 0 2rem 0;
          color: #1a202c;
        }

        .tenant-admin-page__stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .tenant-admin-page__stat-card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
        }

        .tenant-admin-page__stat-card h3 {
          margin: 0 0 1rem 0;
          color: #718096;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .tenant-admin-page__stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 0.5rem;
        }

        .tenant-admin-page__stat-change {
          color: #38a169;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .tenant-admin-page__quick-actions {
          margin-bottom: 3rem;
        }

        .tenant-admin-page__quick-actions h3 {
          margin: 0 0 1.5rem 0;
          color: #1a202c;
        }

        .tenant-admin-page__action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .tenant-admin-page__action-card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .tenant-admin-page__action-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .tenant-admin-page__action-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .tenant-admin-page__action-card h4 {
          margin: 0 0 0.5rem 0;
          color: #1a202c;
        }

        .tenant-admin-page__action-card p {
          margin: 0;
          color: #718096;
          font-size: 0.875rem;
        }

        .tenant-admin-page__recent-activity h3 {
          margin: 0 0 1.5rem 0;
          color: #1a202c;
        }

        .tenant-admin-page__activity-list {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .tenant-admin-page__activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .tenant-admin-page__activity-item:last-child {
          border-bottom: none;
        }

        .tenant-admin-page__activity-icon {
          font-size: 1.5rem;
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f7fafc;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .tenant-admin-page__activity-content p {
          margin: 0 0 0.25rem 0;
          color: #1a202c;
        }

        .tenant-admin-page__activity-time {
          color: #718096;
          font-size: 0.875rem;
        }

        .tenant-admin-page__placeholder {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
        }

        .tenant-admin-page__placeholder-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .tenant-admin-page__placeholder h3 {
          margin: 0 0 1rem 0;
          color: #1a202c;
        }

        .tenant-admin-page__placeholder p {
          margin: 0 0 1rem 0;
          color: #718096;
        }

        .tenant-admin-page__placeholder ul {
          text-align: left;
          max-width: 300px;
          margin: 0 auto;
          color: #4a5568;
        }

        .tenant-admin-page__placeholder li {
          margin-bottom: 0.5rem;
        }

        @media (max-width: 768px) {
          .tenant-admin-page__header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .tenant-admin-page__user-info {
            text-align: left;
          }

          .tenant-admin-page__tenant-details {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .tenant-admin-page__stats-grid,
          .tenant-admin-page__action-grid {
            grid-template-columns: 1fr;
          }

          .tenant-admin-page__content {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default TenantAdminPage;
