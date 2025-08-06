const { AuditEvent } = require('../models');

/**
 * Log an audit event to the database
 * @param {Object} eventData - Event data to log
 * @returns {Promise<AuditEvent>} - Created audit event
 */
async function logAuditEvent(eventData) {
  try {
    const event = new AuditEvent({
      eventType: eventData.eventType,
      description: eventData.description,
      user: eventData.userId,
      tenant: eventData.tenantId,
      session: eventData.sessionId,
      ipAddress: eventData.ipAddress,
      userAgent: eventData.userAgent,
      deviceId: eventData.deviceId,
      success: eventData.success !== undefined ? eventData.success : true,
      metadata: eventData.metadata || {},
      riskScore: eventData.riskScore || 0,
      riskFactors: eventData.riskFactors || [],
      complianceFlags: eventData.complianceFlags || [],
      timestamp: new Date()
    });

    await event.save();
    return event;
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Don't throw error to avoid breaking the main flow
    return null;
  }
}

/**
 * Get audit events for a user
 * @param {string} userId - User ID
 * @param {number} limit - Number of events to retrieve
 * @returns {Promise<AuditEvent[]>} - Array of audit events
 */
async function getUserAuditEvents(userId, limit = 50) {
  return await AuditEvent.find({ user: userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('user', 'email displayName')
    .populate('tenant', 'name domain');
}

/**
 * Get audit events for a tenant
 * @param {string} tenantId - Tenant ID
 * @param {number} limit - Number of events to retrieve
 * @returns {Promise<AuditEvent[]>} - Array of audit events
 */
async function getTenantAuditEvents(tenantId, limit = 50) {
  return await AuditEvent.find({ tenant: tenantId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('user', 'email displayName')
    .populate('tenant', 'name domain');
}

/**
 * Calculate risk score based on various factors
 * @param {Object} factors - Risk factors
 * @returns {number} - Risk score (0-100)
 */
function calculateRiskScore(factors) {
  let score = 0;
  const riskFactors = [];

  // IP-based risk
  if (factors.unusualLocation) {
    score += 30;
    riskFactors.push('unusual_location');
  }

  if (factors.newDevice) {
    score += 20;
    riskFactors.push('new_device');
  }

  if (factors.offHours) {
    score += 15;
    riskFactors.push('off_hours_access');
  }

  if (factors.multipleFailedAttempts) {
    score += 40;
    riskFactors.push('multiple_failed_attempts');
  }

  if (factors.rapidRequests) {
    score += 25;
    riskFactors.push('rapid_requests');
  }

  return {
    score: Math.min(score, 100), // Cap at 100
    factors: riskFactors
  };
}

module.exports = {
  logAuditEvent,
  getUserAuditEvents,
  getTenantAuditEvents,
  calculateRiskScore
};
