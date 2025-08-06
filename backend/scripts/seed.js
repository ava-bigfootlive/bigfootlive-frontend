#!/usr/bin/env node

/**
 * Database Seed Script
 * Creates sample data for development and testing
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../src/config/config');

// Import models
const { User, Tenant, SSOProvider, SecurityPolicy, AuditEvent } = require('../src/models');

class DatabaseSeeder {
  async connect() {
    try {
      await mongoose.connect(config.mongodb.uri);
      console.log('✅ Connected to database');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }

  async clearDatabase() {
    console.log('🧹 Clearing existing data...');
    
    await User.deleteMany({});
    await Tenant.deleteMany({});
    await SSOProvider.deleteMany({});
    await SecurityPolicy.deleteMany({});
    await AuditEvent.deleteMany({});
    
    console.log('✅ Database cleared');
  }

  async seedTenants() {
    console.log('🏢 Creating sample tenants...');
    
    const tenants = [
      {
        name: 'Disney Corporation',
        domain: 'disney.com',
        subdomain: 'disney',
        plan: 'enterprise',
        settings: {
          branding: {
            logo: 'https://example.com/disney-logo.png',
            primaryColor: '#006bb3',
            secondaryColor: '#ff6600'
          },
          security: {
            requireMFA: true,
            sessionTimeout: 8 * 60 * 60, // 8 hours
            maxConcurrentSessions: 3,
            allowedDomains: ['disney.com', 'disneyland.com', 'disneyworld.com']
          },
          features: {
            ssoEnabled: true,
            analyticsEnabled: true,
            streamingEnabled: true,
            apiAccess: true
          }
        },
        usage: {
          userCount: 1500,
          streamCount: 250,
          storageUsed: 1024 * 1024 * 1024 * 500, // 500GB  
          bandwidthUsed: 1024 * 1024 * 1024 * 1024 * 2 // 2TB
        }
      },
      {
        name: 'Acme Corp',
        domain: 'acme.com',
        subdomain: 'acme',
        plan: 'business',
        settings: {
          branding: {
            primaryColor: '#667eea',
            secondaryColor: '#764ba2'
          },
          security: {
            requireMFA: false,
            sessionTimeout: 24 * 60 * 60, // 24 hours
            maxConcurrentSessions: 5
          },
          features: {
            ssoEnabled: false,
            analyticsEnabled: true,
            streamingEnabled: true,
            apiAccess: false
          }
        },
        usage: {
          userCount: 50,
          streamCount: 10,
          storageUsed: 1024 * 1024 * 1024 * 10, // 10GB
          bandwidthUsed: 1024 * 1024 * 1024 * 50 // 50GB
        }
      },
      {
        name: 'StartupXYZ',
        domain: 'startupxyz.com',
        subdomain: 'startup',
        plan: 'starter',
        settings: {
          security: {
            requireMFA: false,
            sessionTimeout: 24 * 60 * 60,
            maxConcurrentSessions: 2
          },
          features: {
            ssoEnabled: false,
            analyticsEnabled: true,
            streamingEnabled: true,
            apiAccess: false
          }
        },
        usage: {
          userCount: 5,
          streamCount: 2,
          storageUsed: 1024 * 1024 * 1024, // 1GB
          bandwidthUsed: 1024 * 1024 * 1024 * 5 // 5GB
        }
      }
    ];

    const createdTenants = await Tenant.insertMany(tenants);
    console.log(`✅ Created ${createdTenants.length} tenants`);
    
    return createdTenants;
  }

  async seedUsers(tenants) {
    console.log('👥 Creating sample users...');
    
    const hashedPassword = await bcrypt.hash('password123', config.security.bcryptRounds);
    
    const users = [];
    
    // Disney users
    const disneyTenant = tenants.find(t => t.domain === 'disney.com');
    users.push(
      {
        email: 'admin@disney.com',
        username: 'disney-admin',
        passwordHash: hashedPassword,
        displayName: 'Disney Admin',
        firstName: 'Disney',
        lastName: 'Admin',
        roles: ['tenant_admin', 'user'],
        permissions: ['tenant:manage', 'users:manage', 'sso:manage', 'analytics:view'],
        tenant: disneyTenant._id,
        profile: {
          department: 'IT',
          jobTitle: 'System Administrator',
          location: 'Burbank, CA'
        },
        preferences: {
          language: 'en',
          timezone: 'America/Los_Angeles',
          theme: 'light'
        },
        mfa: {
          isEnabled: true,
          methods: ['totp'],
          backupCodes: ['123456', '789012', '345678']
        },
        lastLoginAt: new Date(),
        isActive: true
      },
      {
        email: 'user@disney.com',
        username: 'disney-user',
        passwordHash: hashedPassword,
        displayName: 'Disney User',
        firstName: 'Mickey',
        lastName: 'Mouse',
        roles: ['user'],
        permissions: ['streams:view', 'chat:send'],
        tenant: disneyTenant._id,
        profile: {
          department: 'Entertainment',
          jobTitle: 'Content Creator',
          location: 'Orlando, FL'
        },
        isActive: true
      },
      {
        email: 'manager@disney.com',
        username: 'disney-manager',
        passwordHash: hashedPassword,
        displayName: 'Disney Creator',
        firstName: 'Walt',
        lastName: 'Disney',
        roles: ['manager', 'user'],
        permissions: ['streams:create', 'streams:manage', 'analytics:view'],
        tenant: disneyTenant._id,
        profile: {
          department: 'Content',
          jobTitle: 'Senior Creator',
          location: 'Anaheim, CA'
        },
        mfa: {
          isEnabled: true,
          methods: ['totp']
        },
        isActive: true
      }
    );

    // Acme users
    const acmeTenant = tenants.find(t => t.domain === 'acme.com');
    users.push(
      {
        email: 'admin@acme.com',
        username: 'acme-admin',
        passwordHash: hashedPassword,
        displayName: 'Acme Admin',
        firstName: 'John',
        lastName: 'Doe',
        roles: ['tenant_admin', 'user'],
        permissions: ['tenant:manage', 'users:manage', 'analytics:view'],
        tenant: acmeTenant._id,
        isActive: true
      },
      {
        email: 'user@acme.com',
        username: 'acme-user',
        passwordHash: hashedPassword,
        displayName: 'Acme User',
        firstName: 'Jane',
        lastName: 'Smith',
        roles: ['user'],
        permissions: ['streams:view'],
        tenant: acmeTenant._id,
        isActive: true
      }
    );

    // Startup users
    const startupTenant = tenants.find(t => t.domain === 'startupxyz.com');
    users.push(
      {
        email: 'founder@startupxyz.com',
        username: 'startup-founder',
        passwordHash: hashedPassword,
        displayName: 'Startup Founder',
        firstName: 'Alice',
        lastName: 'Johnson',
        roles: ['tenant_admin', 'manager', 'user'],
        permissions: ['tenant:manage', 'streams:create', 'analytics:view'],
        tenant: startupTenant._id,
        isActive: true
      }
    );

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);
    
    return createdUsers;
  }

  async seedSSO(tenants) {
    console.log('🔐 Creating sample SSO configurations...');
    
    const disneyTenant = tenants.find(t => t.domain === 'disney.com');
    
    const ssoProviders = [
      {
        tenant: disneyTenant._id,
        name: 'okta-disney',
        displayName: 'Disney Okta',
        type: 'saml',
        isEnabled: true,
        isDefault: true,
        config: {
          saml: {
            entryPoint: 'https://disney.okta.com/app/disney_bigfootlive_1/exk1234567890/sso/saml',
            issuer: 'http://www.okta.com/exk1234567890',
            cert: '-----BEGIN CERTIFICATE-----\nMIIC...SAMPLE...CERT\n-----END CERTIFICATE-----',
            callbackUrl: 'http://localhost:3001/api/auth/sso/callback/saml',
            logoutUrl: 'https://disney.okta.com/app/disney_bigfootlive_1/exk1234567890/slo/saml',
            signatureAlgorithm: 'sha256',
            digestAlgorithm: 'sha256',
            wantAssertionsSigned: true,
            wantResponseSigned: true
          }
        },
        attributeMapping: {
          email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
          username: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
          firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
          lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
          displayName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/displayname',
          employeeId: 'http://schemas.disney.com/ws/2023/05/identity/claims/employeeid',
          department: 'http://schemas.disney.com/ws/2023/05/identity/claims/department',
          groups: 'http://schemas.disney.com/ws/2023/05/identity/claims/groups'
        },
        groupMapping: [
          {
            ssoGroup: 'BigFoot-Admins',
            internalRole: 'tenant_admin',
            permissions: ['tenant:manage', 'users:manage', 'sso:manage', 'analytics:view']
          },
          {
            ssoGroup: 'BigFoot-Creators',
            internalRole: 'manager',
            permissions: ['streams:create', 'streams:manage', 'analytics:view']
          },
          {
            ssoGroup: 'BigFoot-Users',
            internalRole: 'user',
            permissions: ['streams:view', 'chat:send']
          }
        ],
        stats: {
          totalLogins: 1247,
          lastUsed: new Date(),
          lastTestResult: {
            success: true,
            message: 'Connection test successful',
            timestamp: new Date()
          }
        }
      }
    ];

    const createdProviders = await SSOProvider.insertMany(ssoProviders);
    console.log(`✅ Created ${createdProviders.length} SSO providers`);
    
    // Update Disney tenant with SSO provider reference
    await Tenant.findByIdAndUpdate(disneyTenant._id, {
      ssoProvider: createdProviders[0]._id,
      'settings.features.ssoEnabled': true
    });
    
    return createdProviders;
  }

  async seedSecurityPolicies(tenants) {
    console.log('🔒 Creating sample security policies...');
    
    const policies = [];
    
    for (const tenant of tenants) {
      const policyName = tenant.plan === 'enterprise' ? 'Enterprise Security Policy' : 
                        tenant.plan === 'business' ? 'Business Security Policy' : 
                        'Standard Security Policy';
      
      policies.push({
        tenant: tenant._id,
        name: policyName,
        description: `Default security policy for ${tenant.name}`,
        isActive: true,
        passwordPolicy: {
          minLength: tenant.plan === 'enterprise' ? 12 : 8,
          maxLength: 128,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSymbols: tenant.plan === 'enterprise',
          preventReuse: tenant.plan === 'enterprise' ? 10 : 5,
          maxAge: tenant.plan === 'enterprise' ? 60 : 90,
          lockoutAttempts: 5,
          lockoutDuration: 15
        },
        sessionPolicy: {
          maxDuration: tenant.plan === 'enterprise' ? 8 * 60 : 24 * 60, // minutes
          extendOnActivity: true,
          requireReauth: tenant.plan === 'enterprise',
          concurrentSessions: tenant.plan === 'enterprise' ? 3 : 5,
          ipRestriction: tenant.plan === 'enterprise',
          allowedIPs: tenant.plan === 'enterprise' ? ['192.168.1.0/24'] : []
        },
        mfaPolicy: {
          required: tenant.plan === 'enterprise',
          requiredForRoles: tenant.plan === 'enterprise' ? ['tenant_admin'] : [],
          allowedMethods: ['totp', 'sms', 'email'],
          gracePeriod: 7,
          backupCodesRequired: true
        },
        loginPolicy: {
          allowEmailLogin: true,
          allowUsernameLogin: true,
          requireEmailVerification: true,
          maxFailedAttempts: 5,
          lockoutDuration: 15,
          bruteForceProtection: true
        }
      });
    }

    const createdPolicies = await SecurityPolicy.insertMany(policies);
    console.log(`✅ Created ${createdPolicies.length} security policies`);
    
    return createdPolicies;
  }

  async seedAuditEvents(tenants, users) {
    console.log('📋 Creating sample audit events...');
    
    const events = [];
    const eventTypes = ['login', 'logout', 'sso_login', 'mfa_setup', 'password_change', 'user_created'];
    
    // Generate some sample audit events
    for (let i = 0; i < 50; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      
      events.push({
        eventType,
        description: `${eventType.replace('_', ' ').toUpperCase()} event for ${user.email}`,
        user: user._id,
        tenant: user.tenant,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        success: Math.random() > 0.1, // 90% success rate
        riskScore: Math.floor(Math.random() * 100),
        riskFactors: Math.random() > 0.8 ? ['unusual_location'] : [],
        timestamp: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      });
    }

    const createdEvents = await AuditEvent.insertMany(events);
    console.log(`✅ Created ${createdEvents.length} audit events`);
    
    return createdEvents;
  }

  async seed() {
    try {
      await this.connect();
      
      const shouldClear = process.argv.includes('--clear');
      if (shouldClear) {
        await this.clearDatabase();
      }
      
      console.log('🌱 Starting database seeding...');
      
      const tenants = await this.seedTenants();
      const users = await this.seedUsers(tenants);
      const ssoProviders = await this.seedSSO(tenants);
      const securityPolicies = await this.seedSecurityPolicies(tenants);
      const auditEvents = await this.seedAuditEvents(tenants, users);
      
      console.log('\n✅ Database seeding completed successfully!');
      console.log('\n📊 Summary:');
      console.log(`   Tenants: ${tenants.length}`);
      console.log(`   Users: ${users.length}`);
      console.log(`   SSO Providers: ${ssoProviders.length}`);
      console.log(`   Security Policies: ${securityPolicies.length}`);
      console.log(`   Audit Events: ${auditEvents.length}`);
      
      console.log('\n🔑 Sample login credentials:');
      console.log('   Disney Admin: admin@disney.com / password123');
      console.log('   Disney User: user@disney.com / password123');
      console.log('   Acme Admin: admin@acme.com / password123');
      console.log('   Startup Founder: founder@startupxyz.com / password123');
      
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

async function main() {
  const seeder = new DatabaseSeeder();
  
  try {
    await seeder.seed();
  } catch (error) {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = DatabaseSeeder;
