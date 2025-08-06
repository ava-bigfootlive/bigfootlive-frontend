import React, { useState, useEffect, useCallback } from 'react';
import { SSOProvider, SSOConfig, AttributeMapping, GroupMapping, ENTERPRISE_SSO_PROVIDERS } from '../../types/auth';

interface SSOConfigurationProps {
  providers: SSOProvider[];
  onSave: (provider: Partial<SSOProvider>) => Promise<void>;
  onTest: (providerId: string) => Promise<{ success: boolean; message: string }>;
  onDelete: (providerId: string) => Promise<void>;
  className?: string;
}

export const SSOConfiguration: React.FC<SSOConfigurationProps> = ({
  providers,
  onSave,
  onTest,
  onDelete,
  className = ''
}) => {
  const [selectedProvider, setSelectedProvider] = useState<SSOProvider | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<SSOProvider>>({});
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Initialize form data when provider is selected
  useEffect(() => {
    if (selectedProvider) {
      setFormData(selectedProvider);
    } else if (isCreating) {
      setFormData({
        name: '',
        displayName: '',
        type: 'saml',
        isEnabled: true,
        isDefault: false,
        config: {},
        attributeMapping: {
          email: 'email',
          username: 'username',
          firstName: 'firstName',
          lastName: 'lastName',
          displayName: 'displayName'
        },
        groupMapping: []
      });
    }
  }, [selectedProvider, isCreating]);

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
    
    // Clear validation error for this field
    if (validationErrors[path]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[path];
        return newErrors;
      });
    }
  }, [validationErrors]);

  // Validate form data
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      errors['name'] = 'Provider name is required';
    }
    
    if (!formData.displayName?.trim()) {
      errors['displayName'] = 'Display name is required';
    }
    
    if (!formData.type) {
      errors['type'] = 'Provider type is required';
    }
    
    // Type-specific validation
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
    } else if (formData.type === 'oidc') {
      if (!formData.config?.oidc?.issuer) {
        errors['config.oidc.issuer'] = 'Issuer URL is required';
      }
      if (!formData.config?.oidc?.clientId) {
        errors['config.oidc.clientId'] = 'Client ID is required';
      }
      if (!formData.config?.oidc?.clientSecret) {
        errors['config.oidc.clientSecret'] = 'Client Secret is required';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await onSave(formData);
      setIsEditing(false);
      setIsCreating(false);
      setSelectedProvider(null);
      setFormData({});
    } catch (error) {
      console.error('Failed to save SSO provider:', error);
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, onSave]);

  // Handle test connection
  const handleTest = useCallback(async (providerId: string) => {
    setIsLoading(true);
    try {
      const result = await onTest(providerId);
      setTestResults(prev => ({ ...prev, [providerId]: result }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [providerId]: { success: false, message: 'Test failed' }
      }));
    } finally {
      setIsLoading(false);
    }
  }, [onTest]);

  // Handle delete
  const handleDelete = useCallback(async (providerId: string) => {
    if (window.confirm('Are you sure you want to delete this SSO provider?')) {
      setIsLoading(true);
      try {
        await onDelete(providerId);
        if (selectedProvider?.id === providerId) {
          setSelectedProvider(null);
          setIsEditing(false);
        }
      } catch (error) {
        console.error('Failed to delete SSO provider:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [onDelete, selectedProvider]);

  // Add group mapping
  const addGroupMapping = useCallback(() => {
    const newMapping: GroupMapping = {
      ssoGroup: '',
      internalRole: '',
      permissions: []
    };
    
    setFormData(prev => ({
      ...prev,
      groupMapping: [...(prev.groupMapping || []), newMapping]
    }));
  }, []);

  // Remove group mapping
  const removeGroupMapping = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      groupMapping: prev.groupMapping?.filter((_, i) => i !== index) || []
    }));
  }, []);

  // Update group mapping
  const updateGroupMapping = useCallback((index: number, field: keyof GroupMapping, value: any) => {
    setFormData(prev => ({
      ...prev,
      groupMapping: prev.groupMapping?.map((mapping, i) =>
        i === index ? { ...mapping, [field]: value } : mapping
      ) || []
    }));
  }, []);

  return (
    <div className={`sso-configuration ${className}`}>
      <div className="sso-configuration__header">
        <h2>SSO Configuration</h2>
        <button
          className="sso-configuration__add-button"
          onClick={() => setIsCreating(true)}
          disabled={isLoading}
        >
          Add SSO Provider
        </button>
      </div>

      <div className="sso-configuration__content">
        {/* Provider List */}
        <div className="sso-configuration__sidebar">
          <div className="sso-configuration__provider-list">
            {providers.map(provider => (
              <div
                key={provider.id}
                className={`sso-configuration__provider-item ${
                  selectedProvider?.id === provider.id ? 'sso-configuration__provider-item--active' : ''
                }`}
                onClick={() => {
                  setSelectedProvider(provider);
                  setIsEditing(false);
                  setIsCreating(false);
                }}
              >
                <div className="sso-configuration__provider-info">
                  <div className="sso-configuration__provider-name">
                    {provider.displayName}
                  </div>
                  <div className="sso-configuration__provider-type">
                    {provider.type.toUpperCase()}
                  </div>
                </div>
                <div className="sso-configuration__provider-status">
                  <span className={`sso-configuration__status-badge ${
                    provider.isEnabled ? 'sso-configuration__status-badge--enabled' : 'sso-configuration__status-badge--disabled'
                  }`}>
                    {provider.isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                  {provider.isDefault && (
                    <span className="sso-configuration__default-badge">Default</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="sso-configuration__main">
          {(selectedProvider || isCreating) && (
            <>
              <div className="sso-configuration__panel-header">
                <h3>
                  {isCreating ? 'Add New SSO Provider' : 
                   isEditing ? 'Edit SSO Provider' : 'SSO Provider Details'}
                </h3>
                <div className="sso-configuration__panel-actions">
                  {!isEditing && !isCreating && (
                    <>
                      <button
                        className="sso-configuration__test-button"
                        onClick={() => selectedProvider && handleTest(selectedProvider.id)}
                        disabled={isLoading}
                      >
                        Test Connection
                      </button>
                      <button
                        className="sso-configuration__edit-button"
                        onClick={() => setIsEditing(true)}
                        disabled={isLoading}
                      >
                        Edit
                      </button>
                      <button
                        className="sso-configuration__delete-button"
                        onClick={() => selectedProvider && handleDelete(selectedProvider.id)}
                        disabled={isLoading}
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {(isEditing || isCreating) && (
                    <>
                      <button
                        className="sso-configuration__save-button"
                        onClick={handleSave}
                        disabled={isLoading}
                      >
                        Save
                      </button>
                      <button
                        className="sso-configuration__cancel-button"
                        onClick={() => {
                          setIsEditing(false);
                          setIsCreating(false);
                          setSelectedProvider(isCreating ? null : selectedProvider);
                        }}
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Test Results */}
              {selectedProvider && testResults[selectedProvider.id] && (
                <div className={`sso-configuration__test-result ${
                  testResults[selectedProvider.id].success ? 
                  'sso-configuration__test-result--success' : 
                  'sso-configuration__test-result--error'
                }`}>
                  <strong>Test Result:</strong> {testResults[selectedProvider.id].message}
                </div>
              )}

              {/* Basic Configuration */}
              <div className="sso-configuration__section">
                <h4>Basic Configuration</h4>
                <div className="sso-configuration__form-grid">
                  <div className="sso-configuration__form-field">
                    <label>Provider Name</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditing && !isCreating}
                      className={validationErrors['name'] ? 'error' : ''}
                    />
                    {validationErrors['name'] && (
                      <span className="sso-configuration__error">{validationErrors['name']}</span>
                    )}
                  </div>

                  <div className="sso-configuration__form-field">
                    <label>Display Name</label>
                    <input
                      type="text"
                      value={formData.displayName || ''}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      disabled={!isEditing && !isCreating}
                      className={validationErrors['displayName'] ? 'error' : ''}
                    />
                    {validationErrors['displayName'] && (
                      <span className="sso-configuration__error">{validationErrors['displayName']}</span>
                    )}
                  </div>

                  <div className="sso-configuration__form-field">
                    <label>Provider Type</label>
                    <select
                      value={formData.type || 'saml'}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      disabled={!isEditing && !isCreating}
                    >
                      <option value="saml">SAML 2.0</option>
                      <option value="oidc">OpenID Connect</option>
                      <option value="oauth2">OAuth 2.0</option>
                      <option value="ldap">LDAP</option>
                      <option value="active_directory">Active Directory</option>
                    </select>
                  </div>

                  <div className="sso-configuration__form-field">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.isEnabled || false}
                        onChange={(e) => handleInputChange('isEnabled', e.target.checked)}
                        disabled={!isEditing && !isCreating}
                      />
                      Enabled
                    </label>
                  </div>

                  <div className="sso-configuration__form-field">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.isDefault || false}
                        onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                        disabled={!isEditing && !isCreating}
                      />
                      Default Provider
                    </label>
                  </div>
                </div>
              </div>

              {/* Provider-Specific Configuration */}
              {formData.type === 'saml' && (
                <div className="sso-configuration__section">
                  <h4>SAML Configuration</h4>
                  <div className="sso-configuration__form-grid">
                    <div className="sso-configuration__form-field">
                      <label>SSO URL (Entry Point)</label>
                      <input
                        type="url"
                        value={formData.config?.saml?.entryPoint || ''}
                        onChange={(e) => handleInputChange('config.saml.entryPoint', e.target.value)}
                        disabled={!isEditing && !isCreating}
                        className={validationErrors['config.saml.entryPoint'] ? 'error' : ''}
                      />
                      {validationErrors['config.saml.entryPoint'] && (
                        <span className="sso-configuration__error">{validationErrors['config.saml.entryPoint']}</span>
                      )}
                    </div>

                    <div className="sso-configuration__form-field">
                      <label>Entity ID (Issuer)</label>
                      <input
                        type="text"
                        value={formData.config?.saml?.issuer || ''}
                        onChange={(e) => handleInputChange('config.saml.issuer', e.target.value)}
                        disabled={!isEditing && !isCreating}
                        className={validationErrors['config.saml.issuer'] ? 'error' : ''}
                      />
                      {validationErrors['config.saml.issuer'] && (
                        <span className="sso-configuration__error">{validationErrors['config.saml.issuer']}</span>
                      )}
                    </div>

                    <div className="sso-configuration__form-field full-width">
                      <label>X.509 Certificate</label>
                      <textarea
                        value={formData.config?.saml?.cert || ''}
                        onChange={(e) => handleInputChange('config.saml.cert', e.target.value)}
                        disabled={!isEditing && !isCreating}
                        rows={5}
                        className={validationErrors['config.saml.cert'] ? 'error' : ''}
                        placeholder="-----BEGIN CERTIFICATE-----"
                      />
                      {validationErrors['config.saml.cert'] && (
                        <span className="sso-configuration__error">{validationErrors['config.saml.cert']}</span>
                      )}
                    </div>

                    <div className="sso-configuration__form-field">
                      <label>Callback URL (ACS URL)</label>
                      <input
                        type="url"
                        value={formData.config?.saml?.callbackUrl || `${window.location.origin}/auth/saml/callback`}
                        onChange={(e) => handleInputChange('config.saml.callbackUrl', e.target.value)}
                        disabled={!isEditing && !isCreating}
                      />
                    </div>

                    <div className="sso-configuration__form-field">
                      <label>Logout URL</label>
                      <input
                        type="url"
                        value={formData.config?.saml?.logoutUrl || ''}
                        onChange={(e) => handleInputChange('config.saml.logoutUrl', e.target.value)}
                        disabled={!isEditing && !isCreating}
                      />
                    </div>

                    <div className="sso-configuration__form-field">
                      <label>Signature Algorithm</label>
                      <select
                        value={formData.config?.saml?.signatureAlgorithm || 'sha256'}
                        onChange={(e) => handleInputChange('config.saml.signatureAlgorithm', e.target.value)}
                        disabled={!isEditing && !isCreating}
                      >
                        <option value="sha1">SHA-1</option>
                        <option value="sha256">SHA-256</option>
                      </select>
                    </div>

                    <div className="sso-configuration__form-field">
                      <label>
                        <input
                          type="checkbox"
                          checked={formData.config?.saml?.wantAssertionsSigned || false}
                          onChange={(e) => handleInputChange('config.saml.wantAssertionsSigned', e.target.checked)}
                          disabled={!isEditing && !isCreating}
                        />
                        Want Assertions Signed
                      </label>
                    </div>

                    <div className="sso-configuration__form-field">
                      <label>
                        <input
                          type="checkbox"
                          checked={formData.config?.saml?.wantResponseSigned || false}
                          onChange={(e) => handleInputChange('config.saml.wantResponseSigned', e.target.checked)}
                          disabled={!isEditing && !isCreating}
                        />
                        Want Response Signed
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {formData.type === 'oidc' && (
                <div className="sso-configuration__section">
                  <h4>OpenID Connect Configuration</h4>
                  <div className="sso-configuration__form-grid">
                    <div className="sso-configuration__form-field">
                      <label>Issuer URL</label>
                      <input
                        type="url"
                        value={formData.config?.oidc?.issuer || ''}
                        onChange={(e) => handleInputChange('config.oidc.issuer', e.target.value)}
                        disabled={!isEditing && !isCreating}
                        className={validationErrors['config.oidc.issuer'] ? 'error' : ''}
                      />
                      {validationErrors['config.oidc.issuer'] && (
                        <span className="sso-configuration__error">{validationErrors['config.oidc.issuer']}</span>
                      )}
                    </div>

                    <div className="sso-configuration__form-field">
                      <label>Client ID</label>
                      <input
                        type="text"
                        value={formData.config?.oidc?.clientId || ''}
                        onChange={(e) => handleInputChange('config.oidc.clientId', e.target.value)}
                        disabled={!isEditing && !isCreating}
                        className={validationErrors['config.oidc.clientId'] ? 'error' : ''}
                      />
                      {validationErrors['config.oidc.clientId'] && (
                        <span className="sso-configuration__error">{validationErrors['config.oidc.clientId']}</span>
                      )}
                    </div>

                    <div className="sso-configuration__form-field">
                      <label>Client Secret</label>
                      <input
                        type="password"
                        value={formData.config?.oidc?.clientSecret || ''}
                        onChange={(e) => handleInputChange('config.oidc.clientSecret', e.target.value)}
                        disabled={!isEditing && !isCreating}
                        className={validationErrors['config.oidc.clientSecret'] ? 'error' : ''}
                      />
                      {validationErrors['config.oidc.clientSecret'] && (
                        <span className="sso-configuration__error">{validationErrors['config.oidc.clientSecret']}</span>
                      )}
                    </div>

                    <div className="sso-configuration__form-field">
                      <label>Redirect URI</label>
                      <input
                        type="url"
                        value={formData.config?.oidc?.redirectUri || `${window.location.origin}/auth/oidc/callback`}
                        onChange={(e) => handleInputChange('config.oidc.redirectUri', e.target.value)}
                        disabled={!isEditing && !isCreating}
                      />
                    </div>

                    <div className="sso-configuration__form-field">
                      <label>Scope</label>
                      <input
                        type="text"
                        value={formData.config?.oidc?.scope?.join(' ') || 'openid email profile'}
                        onChange={(e) => handleInputChange('config.oidc.scope', e.target.value.split(' '))}
                        disabled={!isEditing && !isCreating}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Attribute Mapping */}
              <div className="sso-configuration__section">
                <h4>Attribute Mapping</h4>
                <div className="sso-configuration__form-grid">
                  <div className="sso-configuration__form-field">
                    <label>Email Attribute</label>
                    <input
                      type="text"
                      value={formData.attributeMapping?.email || 'email'}
                      onChange={(e) => handleInputChange('attributeMapping.email', e.target.value)}
                      disabled={!isEditing && !isCreating}
                    />
                  </div>

                  <div className="sso-configuration__form-field">
                    <label>Username Attribute</label>
                    <input
                      type="text"
                      value={formData.attributeMapping?.username || 'username'}
                      onChange={(e) => handleInputChange('attributeMapping.username', e.target.value)}
                      disabled={!isEditing && !isCreating}
                    />
                  </div>

                  <div className="sso-configuration__form-field">
                    <label>First Name Attribute</label>
                    <input
                      type="text"
                      value={formData.attributeMapping?.firstName || 'firstName'}
                      onChange={(e) => handleInputChange('attributeMapping.firstName', e.target.value)}
                      disabled={!isEditing && !isCreating}
                    />
                  </div>

                  <div className="sso-configuration__form-field">
                    <label>Last Name Attribute</label>
                    <input
                      type="text"
                      value={formData.attributeMapping?.lastName || 'lastName'}
                      onChange={(e) => handleInputChange('attributeMapping.lastName', e.target.value)}
                      disabled={!isEditing && !isCreating}
                    />
                  </div>

                  <div className="sso-configuration__form-field">
                    <label>Display Name Attribute</label>
                    <input
                      type="text"
                      value={formData.attributeMapping?.displayName || 'displayName'}
                      onChange={(e) => handleInputChange('attributeMapping.displayName', e.target.value)}
                      disabled={!isEditing && !isCreating}
                    />
                  </div>

                  <div className="sso-configuration__form-field">
                    <label>Groups Attribute</label>
                    <input
                      type="text"
                      value={formData.attributeMapping?.groups || 'groups'}
                      onChange={(e) => handleInputChange('attributeMapping.groups', e.target.value)}
                      disabled={!isEditing && !isCreating}
                    />
                  </div>
                </div>
              </div>

              {/* Group Mapping */}
              <div className="sso-configuration__section">
                <div className="sso-configuration__section-header">
                  <h4>Group/Role Mapping</h4>
                  {(isEditing || isCreating) && (
                    <button
                      className="sso-configuration__add-mapping-button"
                      onClick={addGroupMapping}
                      disabled={isLoading}
                    >
                      Add Mapping
                    </button>
                  )}
                </div>

                {formData.groupMapping && formData.groupMapping.length > 0 ? (
                  <div className="sso-configuration__group-mappings">
                    {formData.groupMapping.map((mapping, index) => (
                      <div key={index} className="sso-configuration__group-mapping">
                        <div className="sso-configuration__form-field">
                          <label>SSO Group</label>
                          <input
                            type="text"
                            value={mapping.ssoGroup}
                            onChange={(e) => updateGroupMapping(index, 'ssoGroup', e.target.value)}
                            disabled={!isEditing && !isCreating}
                            placeholder="e.g., CN=Administrators,OU=Groups,DC=company,DC=com"
                          />
                        </div>

                        <div className="sso-configuration__form-field">
                          <label>Internal Role</label>
                          <input
                            type="text"
                            value={mapping.internalRole}
                            onChange={(e) => updateGroupMapping(index, 'internalRole', e.target.value)}
                            disabled={!isEditing && !isCreating}
                            placeholder="e.g., admin, user, viewer"
                          />
                        </div>

                        {(isEditing || isCreating) && (
                          <button
                            className="sso-configuration__remove-mapping-button"
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
                  <p className="sso-configuration__no-mappings">
                    No group mappings configured. Users will be assigned default roles.
                  </p>
                )}
              </div>
            </>
          )}

          {!selectedProvider && !isCreating && (
            <div className="sso-configuration__empty-state">
              <h3>Select an SSO Provider</h3>
              <p>Choose a provider from the list to view or edit its configuration.</p>
            </div>
          )}
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .sso-configuration {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f7fafc;
        }

        .sso-configuration__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: white;
          border-bottom: 1px solid #e2e8f0;
        }

        .sso-configuration__header h2 {
          margin: 0;
          color: #1a202c;
        }

        .sso-configuration__add-button {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .sso-configuration__add-button:hover:not(:disabled) {
          background: #5a67d8;
        }

        .sso-configuration__add-button:disabled {
          background: #a0aec0;
          cursor: not-allowed;
        }

        .sso-configuration__content {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .sso-configuration__sidebar {
          width: 300px;
          background: white;
          border-right: 1px solid #e2e8f0;
          overflow-y: auto;
        }

        .sso-configuration__provider-list {
          padding: 1rem;
        }

        .sso-configuration__provider-item {
          padding: 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          margin-bottom: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .sso-configuration__provider-item:hover {
          border-color: #cbd5e0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .sso-configuration__provider-item--active {
          border-color: #667eea;
          background: #f0f4ff;
        }

        .sso-configuration__provider-info {
          margin-bottom: 0.5rem;
        }

        .sso-configuration__provider-name {
          font-weight: 600;
          color: #1a202c;
        }

        .sso-configuration__provider-type {
          font-size: 0.75rem;
          color: #718096;
          margin-top: 0.25rem;
        }

        .sso-configuration__provider-status {
          display: flex;
          gap: 0.5rem;
        }

        .sso-configuration__status-badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 3px;
          font-weight: 600;
        }

        .sso-configuration__status-badge--enabled {
          background: #c6f6d5;
          color: #22543d;
        }

        .sso-configuration__status-badge--disabled {
          background: #fed7d7;
          color: #742a2a;
        }

        .sso-configuration__default-badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 3px;
          background: #bee3f8;
          color: #1a365d;
          font-weight: 600;
        }

        .sso-configuration__main {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
        }

        .sso-configuration__panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .sso-configuration__panel-header h3 {
          margin: 0;
          color: #1a202c;
        }

        .sso-configuration__panel-actions {
          display: flex;
          gap: 0.75rem;
        }

        .sso-configuration__panel-actions button {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .sso-configuration__test-button {
          background: #38b2ac;
          color: white;
        }

        .sso-configuration__test-button:hover:not(:disabled) {
          background: #319795;
        }

        .sso-configuration__edit-button {
          background: #ed8936;
          color: white;
        }

        .sso-configuration__edit-button:hover:not(:disabled) {
          background: #dd6b20;
        }

        .sso-configuration__delete-button {
          background: #e53e3e;
          color: white;
        }

        .sso-configuration__delete-button:hover:not(:disabled) {
          background: #c53030;
        }

        .sso-configuration__save-button {
          background: #38a169;
          color: white;
        }

        .sso-configuration__save-button:hover:not(:disabled) {
          background: #2f855a;
        }

        .sso-configuration__cancel-button {
          background: #e2e8f0;
          color: #4a5568;
        }

        .sso-configuration__cancel-button:hover:not(:disabled) {
          background: #cbd5e0;
        }

        .sso-configuration__test-result {
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
        }

        .sso-configuration__test-result--success {
          background: #c6f6d5;
          border: 1px solid #9ae6b4;
          color: #22543d;
        }

        .sso-configuration__test-result--error {
          background: #fed7d7;
          border: 1px solid #feb2b2;
          color: #c53030;
        }

        .sso-configuration__section {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .sso-configuration__section h4 {
          margin: 0 0 1rem 0;
          color: #1a202c;
          font-size: 1.125rem;
        }

        .sso-configuration__section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .sso-configuration__section-header h4 {
          margin: 0;
        }

        .sso-configuration__add-mapping-button {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
        }

        .sso-configuration__form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .sso-configuration__form-field {
          display: flex;
          flex-direction: column;
        }

        .sso-configuration__form-field.full-width {
          grid-column: 1 / -1;
        }

        .sso-configuration__form-field label {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .sso-configuration__form-field input,
        .sso-configuration__form-field select,
        .sso-configuration__form-field textarea {
          padding: 0.75rem;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }

        .sso-configuration__form-field input:focus,
        .sso-configuration__form-field select:focus,
        .sso-configuration__form-field textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .sso-configuration__form-field input:disabled,
        .sso-configuration__form-field select:disabled,
        .sso-configuration__form-field textarea:disabled {
          background: #f7fafc;
          color: #718096;
        }

        .sso-configuration__form-field input.error,
        .sso-configuration__form-field textarea.error {
          border-color: #e53e3e;
        }

        .sso-configuration__error {
          color: #e53e3e;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .sso-configuration__group-mappings {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .sso-configuration__group-mapping {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 1rem;
          align-items: end;
          padding: 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: #f7fafc;
        }

        .sso-configuration__remove-mapping-button {
          background: #e53e3e;
          color: white;
          border: none;
          padding: 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .sso-configuration__no-mappings {
          color: #718096;
          font-style: italic;
          text-align: center;
          padding: 2rem;
        }

        .sso-configuration__empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 50vh;
          color: #718096;
        }

        .sso-configuration__empty-state h3 {
          margin: 0 0 0.5rem 0;
          color: #4a5568;
        }

        @media (max-width: 768px) {
          .sso-configuration__content {
            flex-direction: column;
          }
          
          .sso-configuration__sidebar {
            width: 100%;
            height: 200px;
          }
          
          .sso-configuration__form-grid {
            grid-template-columns: 1fr;
          }
          
          .sso-configuration__group-mapping {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SSOConfiguration;
