const express = require('express');
const { body, validationResult } = require('express-validator');
const saml2 = require('saml2-js');
const axios = require('axios');
const crypto = require('crypto');
const { Tenant, SSOProvider } = require('../models');
const { authenticateToken, requirePermission, requireTenantAdmin } = require('../middleware/auth');
const { logAuditEvent } = require('../utils/audit');

const router = express.Router();

// Validation middleware for SSO provider
const validateSSOProvider = [
  body('displayName').trim().isLength({ min: 1, max: 100 }),
  body('type').isIn(['saml', 'oidc', 'oauth2', 'ldap', 'active_directory']),
  body('isEnabled').optional().isBoolean(),
  body('config').isObject(),
  body('attributeMapping').optional().isObject(),
  body('groupMapping').optional().isArray()
];

// Get tenant information
router.get('/:tenantId', authenticateToken, requireTenantAdmin, async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    const tenant = await Tenant.findById(tenantId).populate('ssoProvider');
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    // Check if user has access to this tenant
    if (req.user.tenant !== tenantId && !req.user.permissions.includes('admin.tenant.read')) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      id: tenant._id,
      name: tenant.name,
      domain: tenant.domain,
      plan: tenant.plan,
      isActive: tenant.isActive,
      userCount: await tenant.getUserCount(),
      ssoProvider: tenant.ssoProvider,
      settings: tenant.settings,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt
    });

  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get current SSO provider
router.get('/:tenantId/sso', authenticateToken, requireTenantAdmin, async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    const provider = await SSOProvider.findOne({ 
      tenant: tenantId,
      isEnabled: true 
    });
    
    if (!provider) {
      return res.json(null);
    }

    // Remove sensitive data before sending to client
    const sanitizedProvider = {
      ...provider.toObject(),
      config: sanitizeConfig(provider.config, provider.type)
    };

    res.json(sanitizedProvider);

  } catch (error) {
    console.error('Get SSO provider error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create or update SSO provider
router.post('/:tenantId/sso', authenticateToken, requireTenantAdmin, validateSSOProvider, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { tenantId } = req.params;
    const providerData = req.body;

    // Validate tenant exists and user has access
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    if (req.user.tenant !== tenantId && !req.user.permissions.includes('admin.tenant.write')) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Validate provider configuration
    const validationResult = await validateProviderConfig(providerData.type, providerData.config);
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid provider configuration',
        details: validationResult.errors
      });
    }

    // Disable any existing SSO providers for this tenant
    await SSOProvider.updateMany(
      { tenant: tenantId },
      { isEnabled: false, isDefault: false }
    );

    // Create or update SSO provider
    let provider = await SSOProvider.findOne({ tenant: tenantId });
    
    if (provider) {
      // Update existing provider
      Object.assign(provider, {
        ...providerData,
        updatedAt: new Date()
      });
    } else {
      // Create new provider
      provider = new SSOProvider({
        ...providerData,
        tenant: tenantId,
        name: generateProviderName(providerData.type),
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await provider.save();

    // Update tenant reference
    tenant.ssoProvider = provider._id;
    await tenant.save();

    await logAuditEvent({
      userId: req.user.sub,
      eventType: 'sso_configuration_updated',
      description: `SSO provider ${provider.displayName} configured`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true,
      metadata: {
        tenantId,
        providerId: provider._id,
        providerType: provider.type
      }
    });

    // Return sanitized provider data
    res.json({
      success: true,
      provider: {
        ...provider.toObject(),
        config: sanitizeConfig(provider.config, provider.type)
      }
    });

  } catch (error) {
    console.error('Save SSO provider error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Test SSO provider configuration
router.post('/:tenantId/sso/test', authenticateToken, requireTenantAdmin, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { config } = req.body;

    if (!config) {
      return res.status(400).json({
        success: false,
        error: 'Configuration is required'
      });
    }

    let testResult = { success: false, message: 'Unknown error', metadata: null };

    // Test based on provider type
    if (config.saml) {
      testResult = await testSAMLProvider(config.saml);
    } else if (config.oidc) {
      testResult = await testOIDCProvider(config.oidc);
    } else if (config.oauth2) {
      testResult = await testOAuth2Provider(config.oauth2);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Unsupported provider type'
      });
    }

    await logAuditEvent({
      userId: req.user.sub,
      eventType: 'sso_test',
      description: `SSO provider test ${testResult.success ? 'successful' : 'failed'}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: testResult.success,
      metadata: {
        tenantId,
        testResult: testResult.message
      }
    });

    res.json(testResult);

  } catch (error) {
    console.error('Test SSO provider error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Disable SSO provider
router.delete('/:tenantId/sso', authenticateToken, requireTenantAdmin, async (req, res) => {
  try {
    const { tenantId } = req.params;

    // Disable all SSO providers for this tenant
    const result = await SSOProvider.updateMany(
      { tenant: tenantId },
      { isEnabled: false, isDefault: false, updatedAt: new Date() }
    );

    // Remove SSO provider reference from tenant
    await Tenant.findByIdAndUpdate(tenantId, {
      ssoProvider: null,
      updatedAt: new Date()
    });

    await logAuditEvent({
      userId: req.user.sub,
      eventType: 'sso_disabled',
      description: 'SSO provider disabled for tenant',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true,
      metadata: { tenantId, providersDisabled: result.modifiedCount }
    });

    res.json({ success: true });

  } catch (error) {
    console.error('Disable SSO provider error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get SSO provider templates
router.get('/sso/templates', authenticateToken, async (req, res) => {
  try {
    const templates = [
      {
        id: 'azure_ad',
        name: 'Microsoft Azure AD',
        type: 'saml',
        description: 'Enterprise single sign-on with Microsoft Azure Active Directory',
        defaultConfig: {
          saml: {
            signatureAlgorithm: 'sha256',
            digestAlgorithm: 'sha256',
            wantAssertionsSigned: true,
            wantResponseSigned: true,
            signRequest: false,
            encryptAssertion: false
          }
        },
        attributeMapping: {
          email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
          username: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
          firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
          lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
          displayName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/displayname',
          groups: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/groups'
        }
      },
      {
        id: 'okta',
        name: 'Okta',
        type: 'saml',
        description: 'Enterprise identity and access management with Okta',
        defaultConfig: {
          saml: {
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
        }
      },
      {
        id: 'google_workspace',
        name: 'Google Workspace',
        type: 'saml',
        description: 'Single sign-on with Google Workspace (formerly G Suite)',
        defaultConfig: {
          saml: {
            signatureAlgorithm: 'sha256',
            digestAlgorithm: 'sha256',
            wantAssertionsSigned: false,
            wantResponseSigned: true,
            signRequest: false,
            encryptAssertion: false
          }
        },
        attributeMapping: {
          email: 'email',
          username: 'username',
          firstName: 'first_name',
          lastName: 'last_name',
          displayName: 'name'
        }
      }
    ];

    res.json(templates);

  } catch (error) {
    console.error('Get SSO templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Utility functions
function sanitizeConfig(config, type) {
  const sanitized = JSON.parse(JSON.stringify(config));
  
  // Remove sensitive fields
  if (type === 'saml' && sanitized.saml) {
    delete sanitized.saml.privateCert;
  }
  
  if (type === 'oidc' && sanitized.oidc) {
    if (sanitized.oidc.clientSecret) {
      sanitized.oidc.clientSecret = '***HIDDEN***';
    }
  }
  
  if (type === 'oauth2' && sanitized.oauth2) {
    if (sanitized.oauth2.clientSecret) {
      sanitized.oauth2.clientSecret = '***HIDDEN***';
    }
  }
  
  return sanitized;
}

async function validateProviderConfig(type, config) {
  const errors = [];
  
  switch (type) {
    case 'saml':
      if (!config.saml) {
        errors.push('SAML configuration is required');
      } else {
        if (!config.saml.entryPoint) errors.push('SSO URL (Entry Point) is required');
        if (!config.saml.issuer) errors.push('Entity ID (Issuer) is required');
        if (!config.saml.cert) errors.push('X.509 Certificate is required');
        if (!config.saml.callbackUrl) errors.push('Callback URL is required');
      }
      break;
      
    case 'oidc':
      if (!config.oidc) {
        errors.push('OIDC configuration is required');
      } else {
        if (!config.oidc.issuer) errors.push('Issuer URL is required');
        if (!config.oidc.clientId) errors.push('Client ID is required');
        if (!config.oidc.clientSecret) errors.push('Client Secret is required');
        if (!config.oidc.redirectUri) errors.push('Redirect URI is required');
      }
      break;
      
    case 'oauth2':
      if (!config.oauth2) {
        errors.push('OAuth2 configuration is required');
      } else {
        if (!config.oauth2.authorizationEndpoint) errors.push('Authorization Endpoint is required');
        if (!config.oauth2.tokenEndpoint) errors.push('Token Endpoint is required');
        if (!config.oauth2.clientId) errors.push('Client ID is required');
        if (!config.oauth2.clientSecret) errors.push('Client Secret is required');
      }
      break;
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

async function testSAMLProvider(samlConfig) {
  try {
    // Test SAML metadata retrieval
    if (samlConfig.metadataUrl) {
      const response = await axios.get(samlConfig.metadataUrl, {
        timeout: 10000,
        headers: { 'User-Agent': 'BigfootLive-SSO-Test/1.0' }
      });
      
      if (response.status === 200 && response.data.includes('EntityDescriptor')) {
        return {
          success: true,
          message: 'SAML metadata successfully retrieved and validated',
          metadata: {
            entityId: samlConfig.issuer,
            ssoUrl: samlConfig.entryPoint,
            metadataSize: response.data.length
          }
        };
      }
    }
    
    // Basic SAML configuration validation
    if (samlConfig.entryPoint && samlConfig.issuer && samlConfig.cert) {
      // Validate certificate format
      const certPattern = /-----BEGIN CERTIFICATE-----[\s\S]*-----END CERTIFICATE-----/;
      if (certPattern.test(samlConfig.cert)) {
        return {
          success: true,
          message: 'SAML configuration validated successfully',
          metadata: {
            entityId: samlConfig.issuer,
            ssoUrl: samlConfig.entryPoint,
            certificateValid: true
          }
        };
      } else {
        return {
          success: false,
          message: 'Invalid X.509 certificate format'
        };
      }
    }
    
    return {
      success: false,
      message: 'Missing required SAML configuration fields'
    };
    
  } catch (error) {
    return {
      success: false,
      message: `SAML provider test failed: ${error.message}`
    };
  }
}

async function testOIDCProvider(oidcConfig) {
  try {
    // Test OIDC discovery endpoint
    const discoveryUrl = `${oidcConfig.issuer}/.well-known/openid_configuration`;
    const response = await axios.get(discoveryUrl, {
      timeout: 10000,
      headers: { 'User-Agent': 'BigfootLive-SSO-Test/1.0' }
    });
    
    if (response.status === 200) {
      const config = response.data;
      return {
        success: true,
        message: 'OIDC provider configuration successfully retrieved',
        metadata: {
          issuer: config.issuer,
          authorizationEndpoint: config.authorization_endpoint,
          tokenEndpoint: config.token_endpoint,
          userInfoEndpoint: config.userinfo_endpoint,
          supportedScopes: config.scopes_supported
        }
      };
    }
    
    return {
      success: false,
      message: 'Failed to retrieve OIDC configuration'
    };
    
  } catch (error) {
    return {
      success: false,
      message: `OIDC provider test failed: ${error.message}`
    };
  }
}

async function testOAuth2Provider(oauth2Config) {
  try {
    // Basic OAuth2 endpoint validation
    const endpoints = [
      oauth2Config.authorizationEndpoint,
      oauth2Config.tokenEndpoint,
      oauth2Config.userInfoEndpoint
    ].filter(Boolean);
    
    const validEndpoints = [];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.head(endpoint, {
          timeout: 5000,
          headers: { 'User-Agent': 'BigfootLive-SSO-Test/1.0' }
        });
        
        if (response.status < 400) {
          validEndpoints.push(endpoint);
        }
      } catch (error) {
        // Endpoint might require authentication, which is expected
        if (error.response && error.response.status === 401) {
          validEndpoints.push(endpoint);
        }
      }
    }
    
    if (validEndpoints.length === endpoints.length) {
      return {
        success: true,
        message: 'OAuth2 provider endpoints successfully validated',
        metadata: {
          authorizationEndpoint: oauth2Config.authorizationEndpoint,
          tokenEndpoint: oauth2Config.tokenEndpoint,
          userInfoEndpoint: oauth2Config.userInfoEndpoint,
          validEndpoints: validEndpoints.length
        }
      };
    } else {
      return {
        success: false,
        message: `Only ${validEndpoints.length} of ${endpoints.length} endpoints are accessible`
      };
    }
    
  } catch (error) {
    return {
      success: false,
      message: `OAuth2 provider test failed: ${error.message}`
    };
  }
}

function generateProviderName(type) {
  return `${type}_${crypto.randomBytes(4).toString('hex')}`;
}

module.exports = router;
