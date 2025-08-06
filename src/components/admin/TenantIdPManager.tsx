import React, { useState, useEffect, useCallback } from 'react';
import { SSOProvider, SSOConfig, AttributeMapping, GroupMapping } from '../../types/auth';

interface TenantIdPManagerProps {
  tenantId: string;
  currentProvider?: SSOProvider;
  onSave: (provider: Partial<SSOProvider>) => Promise<void>;
  onTest: (config: SSOConfig) => Promise<{ success: boolean; message: string; metadata?: any }>;
  onDisable: () => Promise<void>;
  className?: string;
}

interface IdPTemplate {
  id: string;
  name: string;
  type: SSOProvider['type'];
  description: string;
  icon: string;
  defaultConfig: Partial<SSOConfig>;
  defaultAttributeMapping: AttributeMapping;
  setupGuide: {
    title: string;
    steps: string[];
    helpLinks: { text: string; url: string }[];
  };
}

const IDP_TEMPLATES: IdPTemplate[] = [
  {
    id: 'azure_ad',
    name: 'Microsoft Azure AD',
    type: 'saml',
    description: 'Enterprise single sign-on with Microsoft Azure Active Directory',
    icon: '🏢',
    defaultConfig: {
      saml: {
        entryPoint: '',
        issuer: '',
        cert: '',
        callbackUrl: `${window.location.origin}/auth/saml/callback`,
        signatureAlgorithm: 'sha256',
        digestAlgorithm: 'sha256',
        wantAssertionsSigned: true,
        wantResponseSigned: true,
        signRequest: false,
        encryptAssertion: false
      }
    },
    defaultAttributeMapping: {
      email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
      username: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
      firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
      lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
      displayName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/displayname',
      groups: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/groups'
    },
    setupGuide: {
      title: 'Azure AD SAML Setup',
      steps: [
        'Log in to Azure Portal (portal.azure.com)',
        'Navigate to Azure Active Directory > Enterprise applications',
        'Click "New application" and select "Create your own application"',
        'Choose "Integrate any other application you don\'t find in the gallery"',
        'Go to Single sign-on and select SAML',
        'Copy the Login URL to "SSO URL" field below',
        'Copy the Azure AD Identifier to "Entity ID" field below',
        'Download the Certificate (Base64) and paste content to "X.509 Certificate" field',
        'Set the Reply URL in Azure to the Callback URL shown below',
        'Configure user attributes and claims as needed',
        'Assign users or groups to the application',
        'Test the connection using the button below'
      ],
      helpLinks: [
        { text: 'Azure AD SAML Documentation', url: 'https://docs.microsoft.com/en-us/azure/active-directory/saas-apps/tutorial-list' },
        { text: 'SAML Troubleshooting Guide', url: 'https://docs.microsoft.com/en-us/azure/active-directory/develop/howto-v1-debug-saml-sso-issues' }
      ]
    }
  },
  {
    id: 'okta',
    name: 'Okta',
    type: 'saml',
    description: 'Enterprise identity and access management with Okta',
    icon: '🔐',
    defaultConfig: {
      saml: {
        entryPoint: '',
        issuer: '',
        cert: '',
        callbackUrl: `${window.location.origin}/auth/saml/callback`,
        signatureAlgorithm: 'sha256',
        digestAlgorithm: 'sha256',
        wantAssertionsSigned: true,
        wantResponseSigned: false,
        signRequest: false,
        encryptAssertion: false
      }
    },
    defaultAttributeMapping: {
      email: 'email',
      username: 'username',
      firstName: 'firstName',
      lastName: 'lastName',
      displayName: 'displayName',
      groups: 'groups'
    },
    setupGuide: {
      title: 'Okta SAML Setup',
      steps: [
        'Log in to your Okta Admin Console',
        'Go to Applications > Applications',
        'Click "Create App Integration"',
        'Select "SAML 2.0" and click Next',
        'Enter app name and optional logo',
        'Set Single sign on URL to the Callback URL shown below',
        'Set Audience URI to your domain (e.g., bigfootlive-yourcompany)',
        'Configure attribute statements for user mapping',
        'Copy the Sign on URL to "SSO URL" field below',
        'Copy the Issuer to "Entity ID" field below',
        'Download the X.509 Certificate and paste to "X.509 Certificate" field',
        'Assign users or groups to the application',
        'Test the connection using the button below'
      ],
      helpLinks: [
        { text: 'Okta SAML Setup Guide', url: 'https://developer.okta.com/docs/guides/build-sso-integration/saml2/main/' },
        { text: 'Okta Attribute Mapping', url: 'https://help.okta.com/en/prod/Content/Topics/users-groups-profiles/usgp-about-attribute-mappings.htm' }
      ]
    }
  },
  {
    id: 'google_workspace',
    name: 'Google Workspace',
    type: 'saml',
    description: 'Single sign-on with Google Workspace (formerly G Suite)',
    icon: '🔍',
    defaultConfig: {
      saml: {
        entryPoint: '',
        issuer: '',
        cert: '',
        callbackUrl: `${window.location.origin}/auth/saml/callback`,
        signatureAlgorithm: 'sha256',
        digestAlgorithm: 'sha256',
        wantAssertionsSigned: false,
        wantResponseSigned: true,
        signRequest: false,
        encryptAssertion: false
      }
    },
    defaultAttributeMapping: {
      email: 'email',
      username: 'username',
      firstName: 'first_name',
      lastName: 'last_name',
      displayName: 'name'
    },
    setupGuide: {
      title: 'Google Workspace SAML Setup',
      steps: [
        'Log in to Google Admin Console (admin.google.com)',
        'Go to Apps > Web and mobile apps',
        'Click "Add app" > "Add custom SAML app"',
        'Enter app name and optional details',
        'Copy the SSO URL to "SSO URL" field below',
        'Copy the Entity ID to "Entity ID" field below',
        'Download the Certificate and paste to "X.509 Certificate" field',
        'Set ACS URL to the Callback URL shown below',
        'Set Entity ID to your domain identifier',
        'Configure attribute mapping as needed',
        'Enable the app for organizational units or groups',
        'Test the connection using the button below'
      ],
      helpLinks: [
        { text: 'Google Workspace SAML Setup', url: 'https://support.google.com/a/answer/6087519' },
        { text: 'SAML Attribute Mapping', url: 'https://support.google.com/a/answer/6301076' }
      ]
    }
  },
  {
    id: 'generic_saml',
    name: 'Generic SAML 2.0',
    type: 'saml',
    description: 'Configure any SAML 2.0 compliant identity provider',
    icon: '🔓',
    defaultConfig: {
      saml: {
        entryPoint: '',
        issuer: '',
        cert: '',
        callbackUrl: `${window.location.origin}/auth/saml/callback`,
        signatureAlgorithm: 'sha256',
        digestAlgorithm: 'sha256',
        wantAssertionsSigned: true,
        wantResponseSigned: true,
        signRequest: false,
        encryptAssertion: false
      }
    },
    defaultAttributeMapping: {
      email: 'email',
      username: 'username',
      firstName: 'firstName',
      lastName: 'lastName',
      displayName: 'displayName',
      groups: 'groups'
    },
    setupGuide: {
      title: 'Generic SAML 2.0 Setup',
      steps: [
        'Obtain the following information from your IdP administrator:',
        '  • Single Sign-On URL (SSO URL)',
        '  • Entity ID (Issuer)',
        '  • X.509 Certificate',
        'Configure your IdP with the Callback URL shown below',
        'Set up attribute mapping in your IdP to match the fields below',
        'Configure user provisioning and group assignments',
        'Test the connection using the button below',
        'Enable the integration once testing is successful'
      ],
      helpLinks: [
        { text: 'SAML 2.0 Specification', url: 'https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf' },
        { text: 'SAML Debugging Tools', url: 'https://www.samltool.com/online_tools.php' }
      ]
    }
  }
];

export const TenantIdPManager: React.FC<TenantIdPManagerProps> = ({
  tenantId,
  currentProvider,
  onSave,
  onTest,
  onDisable,
  className = ''
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<IdPTemplate | null>(null);
  const [formData, setFormData] = useState<Partial<SSOProvider>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; metadata?: any } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'configuration' | 'testing' | 'users'>('overview');

  // Initialize form data
  useEffect(() => {
    if (currentProvider) {
      setFormData(currentProvider);
      setSelectedTemplate(IDP_TEMPLATES.find(t => t.id === currentProvider.name?.toLowerCase().replace(/\s+/g, '_')) || null);
    } else {
      setFormData({});
      setSelectedTemplate(null);
    }
  }, [currentProvider]);

  // Handle template selection
  const handleTemplateSelect = useCallback((template: IdPTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.id,
      displayName: template.name,
      type: template.type,
      isEnabled: false,
      isDefault: true,
      config: template.defaultConfig,
      attributeMapping: template.defaultAttributeMapping,
      groupMapping: []
    });
    setIsEditing(true);
    setShowSetupGuide(true);
    setActiveTab('configuration');
  }, []);

  // Handle form field changes
  const handleInputChange = useCallback((path: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData as any;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
    
    // Clear validation error
    if (validationErrors[path]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[path];
        return newErrors;
      });
    }
  }, [validationErrors]);

  // Validate configuration
  const validateConfig = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.displayName?.trim()) {
      errors['displayName'] = 'Display name is required';
    }
    
    if (formData.type === 'saml') {
      if (!formData.config?.saml?.entryPoint) {
        errors['config.saml.entryPoint'] = 'SSO URL is required';
      }
      if (!formData.config?.saml?.issuer) {
        errors['config.saml.issuer'] = 'Entity ID is required';
      }
      if (!formData.config?.saml?.cert) {
        errors['config.saml.cert'] = 'X.509 Certificate is required';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!validateConfig()) return;
    
    setIsLoading(true);
    try {
      await onSave(formData);
      setIsEditing(false);
      setTestResult(null);
    } catch (error) {
      console.error('Failed to save IdP configuration:', error);
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateConfig, onSave]);

  // Handle test
  const handleTest = useCallback(async () => {
    if (!validateConfig() || !formData.config) return;
    
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const result = await onTest(formData.config);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Test failed'
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData.config, validateConfig, onTest]);

  // Handle disable
  const handleDisable = useCallback(async () => {
    if (window.confirm('Are you sure you want to disable SSO? Users will need to use password authentication.')) {
      setIsLoading(true);
      try {
        await onDisable();
        setFormData({});
        setSelectedTemplate(null);
        setIsEditing(false);
        setTestResult(null);
      } catch (error) {
        console.error('Failed to disable IdP:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [onDisable]);

  // Add group mapping
  const addGroupMapping = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      groupMapping: [...(prev.groupMapping || []), { ssoGroup: '', internalRole: '', permissions: [] }]
    }));
  }, []);

  // Remove group mapping
  const removeGroupMapping = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      groupMapping: prev.groupMapping?.filter((_, i) => i !== index) || []
    }));
  }, []);

  return (
    <div className={`tenant-idp-manager ${className}`}>
      <div className="tenant-idp-manager__header">
        <div className="tenant-idp-manager__title">
          <h2>Identity Provider Integration</h2>
          <p>Configure single sign-on for your organization</p>
        </div>
        
        {currentProvider && (
          <div className="tenant-idp-manager__status">
            <span className={`tenant-idp-manager__status-badge ${
              currentProvider.isEnabled ? 'enabled' : 'disabled'
            }`}>
              {currentProvider.isEnabled ? '✅ Active' : '⚠️ Inactive'}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="tenant-idp-manager__tabs">
        <button
          className={`tenant-idp-manager__tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tenant-idp-manager__tab ${activeTab === 'configuration' ? 'active' : ''}`}
          onClick={() => setActiveTab('configuration')}
          disabled={!selectedTemplate && !currentProvider}
        >
          Configuration
        </button>
        <button
          className={`tenant-idp-manager__tab ${activeTab === 'testing' ? 'active' : ''}`}
          onClick={() => setActiveTab('testing')}
          disabled={!formData.config}
        >
          Testing
        </button>
        <button
          className={`tenant-idp-manager__tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
          disabled={!currentProvider?.isEnabled}
        >
          User Management
        </button>
      </div>

      <div className="tenant-idp-manager__content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tenant-idp-manager__overview">
            {currentProvider ? (
              <div className="tenant-idp-manager__current-provider">
                <div className="tenant-idp-manager__provider-card">
                  <div className="tenant-idp-manager__provider-info">
                    <div className="tenant-idp-manager__provider-icon">
                      {selectedTemplate?.icon || '🔐'}
                    </div>
                    <div>
                      <h3>{currentProvider.displayName}</h3>
                      <p>{selectedTemplate?.description || 'Custom identity provider configuration'}</p>
                      <div className="tenant-idp-manager__provider-details">
                        <span>Type: {currentProvider.type.toUpperCase()}</span>
                        <span>Status: {currentProvider.isEnabled ? 'Active' : 'Inactive'}</span>
                        <span>Users: {/* Add user count */}0 connected</span>
                      </div>
                    </div>
                  </div>
                  <div className="tenant-idp-manager__provider-actions">
                    <button
                      className="tenant-idp-manager__edit-button"
                      onClick={() => {
                        setIsEditing(true);
                        setActiveTab('configuration');
                      }}
                      disabled={isLoading}
                    >
                      Edit Configuration
                    </button>
                    <button
                      className="tenant-idp-manager__disable-button"
                      onClick={handleDisable}
                      disabled={isLoading}
                    >
                      Disable SSO
                    </button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="tenant-idp-manager__stats">
                  <div className="tenant-idp-manager__stat">
                    <h4>Last Test</h4>
                    <p>{testResult ? (testResult.success ? '✅ Successful' : '❌ Failed') : 'Not tested'}</p>
                  </div>
                  <div className="tenant-idp-manager__stat">
                    <h4>Active Users</h4>
                    <p>0 users</p>
                  </div>
                  <div className="tenant-idp-manager__stat">
                    <h4>Group Mappings</h4>
                    <p>{currentProvider.groupMapping?.length || 0} configured</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="tenant-idp-manager__templates">
                <h3>Choose Your Identity Provider</h3>
                <p>Select your organization's identity provider to set up single sign-on.</p>
                
                <div className="tenant-idp-manager__template-grid">
                  {IDP_TEMPLATES.map(template => (
                    <div
                      key={template.id}
                      className="tenant-idp-manager__template-card"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="tenant-idp-manager__template-icon">
                        {template.icon}
                      </div>
                      <h4>{template.name}</h4>
                      <p>{template.description}</p>
                      <button className="tenant-idp-manager__template-button">
                        Configure
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Configuration Tab */}
        {activeTab === 'configuration' && (selectedTemplate || currentProvider) && (
          <div className="tenant-idp-manager__configuration">
            <div className="tenant-idp-manager__config-header">
              <h3>
                {selectedTemplate?.name || currentProvider?.displayName} Configuration
              </h3>
              <div className="tenant-idp-manager__config-actions">
                {!isEditing ? (
                  <button
                    className="tenant-idp-manager__edit-button"
                    onClick={() => setIsEditing(true)}
                    disabled={isLoading}
                  >
                    Edit Configuration
                  </button>
                ) : (
                  <>
                    <button
                      className="tenant-idp-manager__save-button"
                      onClick={handleSave}
                      disabled={isLoading}
                    >
                      Save Changes
                    </button>
                    <button
                      className="tenant-idp-manager__cancel-button"
                      onClick={() => {
                        setIsEditing(false);
                        if (currentProvider) {
                          setFormData(currentProvider);
                        }
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Setup Guide */}
            {selectedTemplate && showSetupGuide && (
              <div className="tenant-idp-manager__setup-guide">
                <div className="tenant-idp-manager__guide-header">
                  <h4>{selectedTemplate.setupGuide.title}</h4>
                  <button
                    className="tenant-idp-manager__guide-toggle"
                    onClick={() => setShowSetupGuide(!showSetupGuide)}
                  >
                    {showSetupGuide ? 'Hide Guide' : 'Show Guide'}
                  </button>
                </div>
                
                <div className="tenant-idp-manager__guide-content">
                  <ol className="tenant-idp-manager__guide-steps">
                    {selectedTemplate.setupGuide.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                  
                  <div className="tenant-idp-manager__guide-links">
                    <h5>Helpful Resources:</h5>
                    {selectedTemplate.setupGuide.helpLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tenant-idp-manager__guide-link"
                      >
                        {link.text} ↗
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Configuration Form */}
            <div className="tenant-idp-manager__config-form">
              {/* Basic Settings */}
              <div className="tenant-idp-manager__section">
                <h4>Basic Settings</h4>
                <div className="tenant-idp-manager__form-grid">
                  <div className="tenant-idp-manager__form-field">
                    <label>Display Name</label>
                    <input
                      type="text"
                      value={formData.displayName || ''}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      disabled={!isEditing}
                      className={validationErrors['displayName'] ? 'error' : ''}
                    />
                    {validationErrors['displayName'] && (
                      <span className="tenant-idp-manager__error">{validationErrors['displayName']}</span>
                    )}
                  </div>

                  <div className="tenant-idp-manager__form-field">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.isEnabled || false}
                        onChange={(e) => handleInputChange('isEnabled', e.target.checked)}
                        disabled={!isEditing}
                      />
                      Enable SSO
                    </label>
                  </div>
                </div>
              </div>

              {/* SAML Configuration */}
              {formData.type === 'saml' && (
                <div className="tenant-idp-manager__section">
                  <h4>SAML 2.0 Settings</h4>
                  <div className="tenant-idp-manager__form-grid">
                    <div className="tenant-idp-manager__form-field">
                      <label>SSO URL (Entry Point) *</label>
                      <input
                        type="url"
                        value={formData.config?.saml?.entryPoint || ''}
                        onChange={(e) => handleInputChange('config.saml.entryPoint', e.target.value)}
                        disabled={!isEditing}
                        className={validationErrors['config.saml.entryPoint'] ? 'error' : ''}
                        placeholder="https://your-idp.com/sso/saml"
                      />
                      {validationErrors['config.saml.entryPoint'] && (
                        <span className="tenant-idp-manager__error">{validationErrors['config.saml.entryPoint']}</span>
                      )}
                    </div>

                    <div className="tenant-idp-manager__form-field">
                      <label>Entity ID (Issuer) *</label>
                      <input
                        type="text"
                        value={formData.config?.saml?.issuer || ''}
                        onChange={(e) => handleInputChange('config.saml.issuer', e.target.value)}
                        disabled={!isEditing}
                        className={validationErrors['config.saml.issuer'] ? 'error' : ''}
                        placeholder="urn:your-idp:entity-id"
                      />
                      {validationErrors['config.saml.issuer'] && (
                        <span className="tenant-idp-manager__error">{validationErrors['config.saml.issuer']}</span>
                      )}
                    </div>

                    <div className="tenant-idp-manager__form-field full-width">
                      <label>Callback URL (ACS URL) - Read Only</label>
                      <input
                        type="text"
                        value={formData.config?.saml?.callbackUrl || `${window.location.origin}/auth/saml/callback`}
                        disabled
                        className="readonly"
                      />
                      <small>Use this URL in your identity provider configuration</small>
                    </div>

                    <div className="tenant-idp-manager__form-field full-width">
                      <label>X.509 Certificate *</label>
                      <textarea
                        value={formData.config?.saml?.cert || ''}
                        onChange={(e) => handleInputChange('config.saml.cert', e.target.value)}
                        disabled={!isEditing}
                        rows={6}
                        className={validationErrors['config.saml.cert'] ? 'error' : ''}
                        placeholder="-----BEGIN CERTIFICATE-----&#10;MIIDBTCCAe2gAwIBAgI...&#10;-----END CERTIFICATE-----"
                      />
                      {validationErrors['config.saml.cert'] && (
                        <span className="tenant-idp-manager__error">{validationErrors['config.saml.cert']}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Attribute Mapping */}
              <div className="tenant-idp-manager__section">
                <h4>User Attribute Mapping</h4>
                <p>Map attributes from your identity provider to user fields in BigfootLive.</p>
                <div className="tenant-idp-manager__form-grid">
                  <div className="tenant-idp-manager__form-field">
                    <label>Email Attribute</label>
                    <input
                      type="text"
                      value={formData.attributeMapping?.email || 'email'}
                      onChange={(e) => handleInputChange('attributeMapping.email', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="tenant-idp-manager__form-field">
                    <label>First Name Attribute</label>
                    <input
                      type="text"
                      value={formData.attributeMapping?.firstName || 'firstName'}
                      onChange={(e) => handleInputChange('attributeMapping.firstName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="tenant-idp-manager__form-field">
                    <label>Last Name Attribute</label>
                    <input
                      type="text"
                      value={formData.attributeMapping?.lastName || 'lastName'}
                      onChange={(e) => handleInputChange('attributeMapping.lastName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="tenant-idp-manager__form-field">
                    <label>Groups Attribute</label>
                    <input
                      type="text"
                      value={formData.attributeMapping?.groups || 'groups'}
                      onChange={(e) => handleInputChange('attributeMapping.groups', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              {/* Group Mapping */}
              <div className="tenant-idp-manager__section">
                <div className="tenant-idp-manager__section-header">
                  <h4>Role Mapping</h4>
                  {isEditing && (
                    <button
                      className="tenant-idp-manager__add-mapping-button"
                      onClick={addGroupMapping}
                      disabled={isLoading}
                    >
                      Add Role Mapping
                    </button>
                  )}
                </div>
                <p>Map groups from your identity provider to roles in BigfootLive.</p>

                {formData.groupMapping && formData.groupMapping.length > 0 ? (
                  <div className="tenant-idp-manager__group-mappings">
                    {formData.groupMapping.map((mapping, index) => (
                      <div key={index} className="tenant-idp-manager__group-mapping">
                        <div className="tenant-idp-manager__form-field">
                          <label>IdP Group/Role</label>
                          <input
                            type="text"
                            value={mapping.ssoGroup}
                            onChange={(e) => {
                              const newMappings = [...(formData.groupMapping || [])];
                              newMappings[index] = { ...newMappings[index], ssoGroup: e.target.value };
                              handleInputChange('groupMapping', newMappings);
                            }}
                            disabled={!isEditing}
                            placeholder="e.g., Administrators, CN=Users,DC=company,DC=com"
                          />
                        </div>

                        <div className="tenant-idp-manager__form-field">
                          <label>BigfootLive Role</label>
                          <select
                            value={mapping.internalRole}
                            onChange={(e) => {
                              const newMappings = [...(formData.groupMapping || [])];
                              newMappings[index] = { ...newMappings[index], internalRole: e.target.value };
                              handleInputChange('groupMapping', newMappings);
                            }}
                            disabled={!isEditing}
                          >
                            <option value="">Select role...</option>
                            <option value="admin">Administrator</option>
                            <option value="manager">Manager</option>
                            <option value="user">User</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        </div>

                        {isEditing && (
                          <button
                            className="tenant-idp-manager__remove-mapping-button"
                            onClick={() => removeGroupMapping(index)}
                            disabled={isLoading}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="tenant-idp-manager__no-mappings">
                    No role mappings configured. All users will be assigned the default "user" role.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Testing Tab */}
        {activeTab === 'testing' && formData.config && (
          <div className="tenant-idp-manager__testing">
            <div className="tenant-idp-manager__test-header">
              <h3>Test SSO Configuration</h3>
              <button
                className="tenant-idp-manager__test-button"
                onClick={handleTest}
                disabled={isLoading || !formData.config}
              >
                {isLoading ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            {testResult && (
              <div className={`tenant-idp-manager__test-result ${
                testResult.success ? 'success' : 'error'
              }`}>
                <h4>Test Result</h4>
                <p>
                  <strong>Status:</strong> {testResult.success ? '✅ Success' : '❌ Failed'}
                </p>
                <p>
                  <strong>Message:</strong> {testResult.message}
                </p>
                {testResult.metadata && (
                  <details className="tenant-idp-manager__test-details">
                    <summary>Technical Details</summary>
                    <pre>{JSON.stringify(testResult.metadata, null, 2)}</pre>
                  </details>
                )}
              </div>
            )}

            <div className="tenant-idp-manager__test-info">
              <h4>Testing Checklist</h4>
              <ul>
                <li>✅ Configuration saved successfully</li>
                <li>{testResult?.success ? '✅' : '⚠️'} IdP connection test</li>
                <li>⚠️ User attribute mapping (requires user login)</li>
                <li>⚠️ Group/role assignment (requires user login)</li>
              </ul>

              <div className="tenant-idp-manager__test-steps">
                <h4>Next Steps</h4>
                <ol>
                  <li>Ensure the test connection passes</li>
                  <li>Enable SSO in the configuration tab</li>
                  <li>Have a test user attempt to log in</li>
                  <li>Verify user attributes and roles are assigned correctly</li>
                  <li>Communicate the SSO login process to your users</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && currentProvider?.isEnabled && (
          <div className="tenant-idp-manager__users">
            <h3>SSO User Management</h3>
            <p>Users who have logged in via SSO will appear here.</p>
            
            <div className="tenant-idp-manager__user-stats">
              <div className="tenant-idp-manager__stat-card">
                <h4>Total SSO Users</h4>
                <div className="tenant-idp-manager__stat-number">0</div>
              </div>
              <div className="tenant-idp-manager__stat-card">
                <h4>Active Sessions</h4>
                <div className="tenant-idp-manager__stat-number">0</div>
              </div>
              <div className="tenant-idp-manager__stat-card">
                <h4>Last Login</h4>
                <div className="tenant-idp-manager__stat-number">Never</div>
              </div>
            </div>

            <div className="tenant-idp-manager__user-list">
              <p className="tenant-idp-manager__empty-state">
                No SSO users yet. Once users log in via SSO, they will appear here.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Styles */}
      <style jsx>{`
        .tenant-idp-manager {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          background: #f7fafc;
          min-height: 100vh;
        }

        .tenant-idp-manager__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          padding: 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .tenant-idp-manager__title h2 {
          margin: 0 0 0.5rem 0;
          color: #1a202c;
          font-size: 1.75rem;
        }

        .tenant-idp-manager__title p {
          margin: 0;
          color: #718096;
        }

        .tenant-idp-manager__status-badge {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .tenant-idp-manager__status-badge.enabled {
          background: #c6f6d5;
          color: #22543d;
        }

        .tenant-idp-manager__status-badge.disabled {
          background: #fed7d7;
          color: #c53030;
        }

        .tenant-idp-manager__tabs {
          display: flex;
          background: white;
          border-radius: 8px;
          padding: 0.25rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .tenant-idp-manager__tab {
          flex: 1;
          padding: 0.75rem 1rem;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }

        .tenant-idp-manager__tab:hover:not(:disabled) {
          background: #f7fafc;
        }

        .tenant-idp-manager__tab.active {
          background: #667eea;
          color: white;
        }

        .tenant-idp-manager__tab:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .tenant-idp-manager__content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .tenant-idp-manager__overview {
          padding: 2rem;
        }

        .tenant-idp-manager__current-provider {
          margin-bottom: 2rem;
        }

        .tenant-idp-manager__provider-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          margin-bottom: 2rem;
        }

        .tenant-idp-manager__provider-info {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .tenant-idp-manager__provider-icon {
          font-size: 3rem;
          width: 4rem;
          height: 4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f7fafc;
          border-radius: 12px;
        }

        .tenant-idp-manager__provider-info h3 {
          margin: 0 0 0.5rem 0;
          color: #1a202c;
        }

        .tenant-idp-manager__provider-info p {
          margin: 0 0 1rem 0;
          color: #718096;
        }

        .tenant-idp-manager__provider-details {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #4a5568;
        }

        .tenant-idp-manager__provider-actions {
          display: flex;
          gap: 0.75rem;
        }

        .tenant-idp-manager__provider-actions button {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .tenant-idp-manager__edit-button {
          background: #667eea;
          color: white;
        }

        .tenant-idp-manager__edit-button:hover:not(:disabled) {
          background: #5a67d8;
        }

        .tenant-idp-manager__disable-button {
          background: #e53e3e;
          color: white;
        }

        .tenant-idp-manager__disable-button:hover:not(:disabled) {
          background: #c53030;
        }

        .tenant-idp-manager__stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .tenant-idp-manager__stat {
          padding: 1.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          text-align: center;
        }

        .tenant-idp-manager__stat h4 {
          margin: 0 0 0.5rem 0;
          color: #718096;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .tenant-idp-manager__stat p {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a202c;
        }

        .tenant-idp-manager__templates h3 {
          margin: 0 0 0.5rem 0;
          color: #1a202c;
        }

        .tenant-idp-manager__templates p {
          margin: 0 0 2rem 0;
          color: #718096;
        }

        .tenant-idp-manager__template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .tenant-idp-manager__template-card {
          padding: 2rem;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tenant-idp-manager__template-card:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }

        .tenant-idp-manager__template-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .tenant-idp-manager__template-card h4 {
          margin: 0 0 0.5rem 0;
          color: #1a202c;
        }

        .tenant-idp-manager__template-card p {
          margin: 0 0 1.5rem 0;
          color: #718096;
          font-size: 0.875rem;
        }

        .tenant-idp-manager__template-button {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .tenant-idp-manager__template-button:hover {
          background: #5a67d8;
        }

        .tenant-idp-manager__configuration {
          padding: 2rem;
        }

        .tenant-idp-manager__config-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .tenant-idp-manager__config-header h3 {
          margin: 0;
          color: #1a202c;
        }

        .tenant-idp-manager__config-actions {
          display: flex;
          gap: 0.75rem;
        }

        .tenant-idp-manager__config-actions button {
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .tenant-idp-manager__save-button {
          background: #38a169;
          color: white;
        }

        .tenant-idp-manager__save-button:hover:not(:disabled) {
          background: #2f855a;
        }

        .tenant-idp-manager__cancel-button {
          background: #e2e8f0;
          color: #4a5568;
        }

        .tenant-idp-manager__cancel-button:hover:not(:disabled) {
          background: #cbd5e0;
        }

        .tenant-idp-manager__setup-guide {
          background: #f0f4ff;
          border: 1px solid #c6d4ff;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .tenant-idp-manager__guide-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .tenant-idp-manager__guide-header h4 {
          margin: 0;
          color: #1a202c;
        }

        .tenant-idp-manager__guide-toggle {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .tenant-idp-manager__guide-steps {
          margin: 0 0 1.5rem 0;
          padding-left: 1.5rem;
        }

        .tenant-idp-manager__guide-steps li {
          margin-bottom: 0.5rem;
          color: #4a5568;
        }

        .tenant-idp-manager__guide-links h5 {
          margin: 0 0 0.5rem 0;
          color: #1a202c;
        }

        .tenant-idp-manager__guide-link {
          display: inline-block;
          color: #667eea;
          text-decoration: none;
          margin-right: 1rem;
          margin-bottom: 0.5rem;
        }

        .tenant-idp-manager__guide-link:hover {
          text-decoration: underline;
        }

        .tenant-idp-manager__section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }

        .tenant-idp-manager__section h4 {
          margin: 0 0 1rem 0;
          color: #1a202c;
        }

        .tenant-idp-manager__section p {
          margin: 0 0 1rem 0;
          color: #718096;
          font-size: 0.875rem;
        }

        .tenant-idp-manager__section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .tenant-idp-manager__section-header h4 {
          margin: 0;
        }

        .tenant-idp-manager__add-mapping-button {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
        }

        .tenant-idp-manager__form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .tenant-idp-manager__form-field {
          display: flex;
          flex-direction: column;
        }

        .tenant-idp-manager__form-field.full-width {
          grid-column: 1 / -1;
        }

        .tenant-idp-manager__form-field label {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .tenant-idp-manager__form-field input,
        .tenant-idp-manager__form-field select,
        .tenant-idp-manager__form-field textarea {
          padding: 0.75rem;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }

        .tenant-idp-manager__form-field input:focus,
        .tenant-idp-manager__form-field select:focus,
        .tenant-idp-manager__form-field textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .tenant-idp-manager__form-field input:disabled,
        .tenant-idp-manager__form-field select:disabled,
        .tenant-idp-manager__form-field textarea:disabled {
          background: #f7fafc;
          color: #718096;
        }

        .tenant-idp-manager__form-field input.readonly {
          background: #f7fafc;
          color: #4a5568;
        }

        .tenant-idp-manager__form-field input.error,
        .tenant-idp-manager__form-field textarea.error {
          border-color: #e53e3e;
        }

        .tenant-idp-manager__form-field small {
          margin-top: 0.25rem;
          color: #718096;
          font-size: 0.75rem;
        }

        .tenant-idp-manager__error {
          color: #e53e3e;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .tenant-idp-manager__group-mappings {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .tenant-idp-manager__group-mapping {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 1rem;
          align-items: end;
          padding: 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: #f7fafc;
        }

        .tenant-idp-manager__remove-mapping-button {
          background: #e53e3e;
          color: white;
          border: none;
          padding: 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .tenant-idp-manager__no-mappings {
          color: #718096;
          font-style: italic;
          text-align: center;
          padding: 2rem;
        }

        .tenant-idp-manager__testing {
          padding: 2rem;
        }

        .tenant-idp-manager__test-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .tenant-idp-manager__test-header h3 {
          margin: 0;
          color: #1a202c;
        }

        .tenant-idp-manager__test-button {
          background: #38b2ac;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .tenant-idp-manager__test-button:hover:not(:disabled) {
          background: #319795;
        }

        .tenant-idp-manager__test-button:disabled {
          background: #a0aec0;
          cursor: not-allowed;
        }

        .tenant-idp-manager__test-result {
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .tenant-idp-manager__test-result.success {
          background: #c6f6d5;
          border: 1px solid #9ae6b4;
          color: #22543d;
        }

        .tenant-idp-manager__test-result.error {
          background: #fed7d7;
          border: 1px solid #feb2b2;
          color: #c53030;
        }

        .tenant-idp-manager__test-result h4 {
          margin: 0 0 1rem 0;
        }

        .tenant-idp-manager__test-result p {
          margin: 0.5rem 0;
        }

        .tenant-idp-manager__test-details {
          margin-top: 1rem;
        }

        .tenant-idp-manager__test-details pre {
          background: rgba(0, 0, 0, 0.05);
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 0.75rem;
        }

        .tenant-idp-manager__test-info h4 {
          margin: 0 0 1rem 0;
          color: #1a202c;
        }

        .tenant-idp-manager__test-info ul,
        .tenant-idp-manager__test-steps ol {
          margin: 0 0 2rem 0;
          padding-left: 1.5rem;
        }

        .tenant-idp-manager__test-info li,
        .tenant-idp-manager__test-steps li {
          margin-bottom: 0.5rem;
          color: #4a5568;
        }

        .tenant-idp-manager__users {
          padding: 2rem;
        }

        .tenant-idp-manager__users h3 {
          margin: 0 0 0.5rem 0;
          color: #1a202c;
        }

        .tenant-idp-manager__users p {
          margin: 0 0 2rem 0;
          color: #718096;
        }

        .tenant-idp-manager__user-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .tenant-idp-manager__stat-card {
          padding: 1.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          text-align: center;
        }

        .tenant-idp-manager__stat-card h4 {
          margin: 0 0 0.5rem 0;
          color: #718096;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .tenant-idp-manager__stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: #1a202c;
        }

        .tenant-idp-manager__empty-state {
          text-align: center;
          color: #718096;
          font-style: italic;
          padding: 3rem;
        }

        @media (max-width: 768px) {
          .tenant-idp-manager {
            padding: 1rem;
          }
          
          .tenant-idp-manager__header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }
          
          .tenant-idp-manager__tabs {
            flex-direction: column;
          }
          
          .tenant-idp-manager__template-grid {
            grid-template-columns: 1fr;
          }
          
          .tenant-idp-manager__form-grid {
            grid-template-columns: 1fr;
          }
          
          .tenant-idp-manager__group-mapping {
            grid-template-columns: 1fr;
          }
          
          .tenant-idp-manager__provider-card {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }
          
          .tenant-idp-manager__config-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }
          
          .tenant-idp-manager__test-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default TenantIdPManager;
