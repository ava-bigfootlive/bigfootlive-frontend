import axios, { AxiosInstance, AxiosResponse } from 'axios';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('🚨 Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('🚨 Response error:', error);
        
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Auth API
  async login(username: string, password: string) {
    const response = await this.api.post('/auth/login', {
      username,
      password,
    });
    return response.data;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
  }) {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async logout() {
    const response = await this.api.post('/auth/logout');
    localStorage.removeItem('authToken');
    return response.data;
  }

  async refreshToken() {
    const response = await this.api.post('/auth/refresh');
    return response.data;
  }

  async getProfile() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // Legacy Events API (keeping for backward compatibility)
  async getEvents() {
    const response = await this.api.get('/events');
    return response.data;
  }

  async deleteEvent(eventId: string) {
    const response = await this.api.delete(`/events/${eventId}`);
    return response.data;
  }

  async getEventStats(eventId: string) {
    const response = await this.api.get(`/events/${eventId}/stats`);
    return response.data;
  }

  // Streaming API
  async getStreamingConfig(eventId: string) {
    const response = await this.api.get(`/streaming/events/${eventId}/stream`);
    return response.data;
  }

  async getStreamHealth(eventId: string) {
    const response = await this.api.get(`/streaming/events/${eventId}/health`);
    return response.data;
  }

  async restartStream(eventId: string) {
    const response = await this.api.post(`/streaming/events/${eventId}/restart`);
    return response.data;
  }

  // Users API
  async getUsers(filters: any = {}) {
    const response = await this.api.get('/users', { params: filters });
    return response.data;
  }

  async getUser(userId: string) {
    const response = await this.api.get(`/users/${userId}`);
    return response.data;
  }

  async createUser(userData: any) {
    const response = await this.api.post('/users', userData);
    return response.data;
  }

  async updateUser(userId: string, userData: any) {
    const response = await this.api.put(`/users/${userId}`, userData);
    return response.data;
  }

  async deleteUser(userId: string) {
    const response = await this.api.delete(`/users/${userId}`);
    return response.data;
  }

  async bulkUpdateUsers(userIds: string[], updateData: any) {
    const response = await this.api.put('/users/bulk', { userIds, ...updateData });
    return response.data;
  }

  async bulkInviteUsers(emails: string[]) {
    const response = await this.api.post('/users/bulk-invite', { emails });
    return response.data;
  }

  async exportUsers(filters: any = {}) {
    const response = await this.api.get('/users/export', { params: filters });
    return response.data;
  }

  async followUser(userId: string) {
    const response = await this.api.post(`/users/${userId}/follow`);
    return response.data;
  }

  async unfollowUser(userId: string) {
    const response = await this.api.delete(`/users/${userId}/follow`);
    return response.data;
  }

  async getUserEvents(userId: string) {
    const response = await this.api.get(`/users/${userId}/events`);
    return response.data;
  }

  // Roles and Permissions API
  async getRoles() {
    const response = await this.api.get('/roles');
    return response.data;
  }

  async createRole(roleData: any) {
    const response = await this.api.post('/roles', roleData);
    return response.data;
  }

  async updateRole(roleId: string, roleData: any) {
    const response = await this.api.put(`/roles/${roleId}`, roleData);
    return response.data;
  }

  async deleteRole(roleId: string) {
    const response = await this.api.delete(`/roles/${roleId}`);
    return response.data;
  }

  async getPermissions() {
    const response = await this.api.get('/permissions');
    return response.data;
  }

  async getUserGroups() {
    const response = await this.api.get('/groups');
    return response.data;
  }

  async createUserGroup(groupData: any) {
    const response = await this.api.post('/groups', groupData);
    return response.data;
  }

  async updateUserGroup(groupId: string, groupData: any) {
    const response = await this.api.put(`/groups/${groupId}`, groupData);
    return response.data;
  }

  async deleteUserGroup(groupId: string) {
    const response = await this.api.delete(`/groups/${groupId}`);
    return response.data;
  }

  // Analytics API
  async getEventAnalytics(eventId: string) {
    const response = await this.api.get(`/analytics/events/${eventId}`);
    return response.data;
  }

  async getDashboardAnalytics() {
    const response = await this.api.get('/analytics/dashboard');
    return response.data;
  }

  async getPlatformAnalytics() {
    const response = await this.api.get('/analytics/platform');
    return response.data;
  }

  // Monetization API
  
  // Super Chat
  async getSuperChats(streamerId: string) {
    const response = await this.api.get(`/monetization/superchats/${streamerId}`);
    return response.data;
  }

  async createSuperChat(data: any) {
    const response = await this.api.post('/monetization/superchats', data);
    return response.data;
  }

  // Donations
  async getDonations(streamerId: string) {
    const response = await this.api.get(`/monetization/donations/${streamerId}`);
    return response.data;
  }

  async createDonation(data: any) {
    const response = await this.api.post('/monetization/donations', data);
    return response.data;
  }

  async getDonationStats(streamerId: string) {
    const response = await this.api.get(`/monetization/donations/${streamerId}/stats`);
    return response.data;
  }

  async getDonationGoals(streamerId: string) {
    const response = await this.api.get(`/monetization/goals/${streamerId}`);
    return response.data;
  }

  async createDonationGoal(data: any) {
    const response = await this.api.post('/monetization/goals', data);
    return response.data;
  }

  // Subscriptions
  async getSubscriptionTiers(streamerId: string) {
    const response = await this.api.get(`/monetization/subscriptions/${streamerId}/tiers`);
    return response.data;
  }

  async createSubscription(data: any) {
    const response = await this.api.post('/monetization/subscriptions', data);
    return response.data;
  }

  async cancelSubscription(subscriptionId: string) {
    const response = await this.api.delete(`/monetization/subscriptions/${subscriptionId}`);
    return response.data;
  }

  async getUserSubscription(userId: string, streamerId: string) {
    const response = await this.api.get(`/monetization/subscriptions/${userId}/${streamerId}`);
    return response.data;
  }

  async getSubscriptionStats(streamerId: string) {
    const response = await this.api.get(`/monetization/subscriptions/${streamerId}/stats`);
    return response.data;
  }

  // Feature Flags API
  async getFeatureFlags() {
    const response = await this.api.get('/admin/features');
    return response.data;
  }

  async updateFeatureFlags(flags: any) {
    const response = await this.api.put('/admin/features', flags);
    return response.data;
  }

  async getTenantFeatureFlags(tenantId: string) {
    const response = await this.api.get(`/admin/tenants/${tenantId}/features`);
    return response.data;
  }

  async updateTenantFeatureFlags(tenantId: string, flags: any) {
    const response = await this.api.put(`/admin/tenants/${tenantId}/features`, flags);
    return response.data;
  }

  // Streaming API Methods
  async createEvent(eventData: {
    title: string;
    description?: string;
    category: string;
    privacy?: 'public' | 'unlisted' | 'private';
    scheduledStart?: Date;
    settings?: any;
  }) {
    const response = await this.api.post('/streaming/events', eventData);
    return response.data;
  }

  async getEvent(eventId: string) {
    const response = await this.api.get(`/streaming/events/${eventId}`);
    return response.data;
  }

  async startEvent(eventId: string) {
    const response = await this.api.post(`/streaming/events/${eventId}/start`);
    return response.data;
  }

  async stopEvent(eventId: string) {
    const response = await this.api.post(`/streaming/events/${eventId}/stop`);
    return response.data;
  }

  async getStreamingConfig(eventId: string) {
    const response = await this.api.get(`/streaming/events/${eventId}/config`);
    return response.data;
  }

  async getStreamStats(eventId: string) {
    const response = await this.api.get(`/streaming/events/${eventId}/stats`);
    return response.data;
  }

  async updateEvent(eventId: string, eventData: any) {
    const response = await this.api.put(`/streaming/events/${eventId}`, eventData);
    return response.data;
  }

  // Theme and Branding API
  async getCurrentTheme() {
    const response = await this.api.get('/theme/current');
    return response.data;
  }

  async getAvailableThemes() {
    const response = await this.api.get('/theme/available');
    return response.data;
  }

  async getThemePresets() {
    const response = await this.api.get('/theme/presets');
    return response.data;
  }

  async setCurrentTheme(themeId: string) {
    const response = await this.api.put('/theme/current', { themeId });
    return response.data;
  }

  async createCustomTheme(data: any) {
    const response = await this.api.post('/theme/custom', data);
    return response.data;
  }

  async updateTheme(themeId: string, updates: any) {
    const response = await this.api.put(`/theme/${themeId}`, updates);
    return response.data;
  }

  async deleteTheme(themeId: string) {
    const response = await this.api.delete(`/theme/${themeId}`);
    return response.data;
  }

  async exportTheme(themeId: string) {
    const response = await this.api.get(`/theme/${themeId}/export`);
    return response.data;
  }

  async importTheme(themeData: any) {
    const response = await this.api.post('/theme/import', themeData);
    return response.data;
  }

  async resetTheme() {
    const response = await this.api.post('/theme/reset');
    return response.data;
  }

  // Tenant-specific theme methods
  async getTenantTheme(tenantId: string) {
    const response = await this.api.get(`/tenants/${tenantId}/theme`);
    return response.data;
  }

  async updateTenantTheme(tenantId: string, themeId: string) {
    const response = await this.api.put(`/tenants/${tenantId}/theme`, { themeId });
    return response.data;
  }

  async resetTenantTheme(tenantId: string) {
    const response = await this.api.post(`/tenants/${tenantId}/theme/reset`);
    return response.data;
  }

  // Branding API
  async getBrandingSettings() {
    const response = await this.api.get('/branding');
    return response.data;
  }

  async updateBrandingSettings(branding: any) {
    const response = await this.api.put('/branding', branding);
    return response.data;
  }

  async getTenantBranding(tenantId: string) {
    const response = await this.api.get(`/tenants/${tenantId}/branding`);
    return response.data;
  }

  async updateTenantBranding(tenantId: string, branding: any) {
    const response = await this.api.put(`/tenants/${tenantId}/branding`, branding);
    return response.data;
  }

  async uploadBrandingAsset(file: File, type: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await this.api.post('/branding/assets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async removeBrandingAsset(assetId: string) {
    const response = await this.api.delete(`/branding/assets/${assetId}`);
    return response.data;
  }

  // Health Check
  async healthCheck() {
    const response = await this.api.get('/health');
    return response.data;
  }

  // Helper method for custom requests
  async request<T = any>(method: string, url: string, data?: any): Promise<T> {
    const response = await this.api.request({
      method,
      url,
      data,
    });
    return response.data;
  }

  // Get the Axios instance for custom usage
  getApi(): AxiosInstance {
    return this.api;
  }
}

// Singleton instance
export const apiService = new ApiService();
export default apiService;
