// src/services/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080';

export class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      credentials: 'include',
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 204) {
        // no content
        return {} as T;
      }

      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      const payload: any = isJson
        ? await response.json().catch(() => null)
        : await response.text().catch(() => null);

      if (!response.ok) {
        const message =
          (payload && (payload.message || payload.error)) ||
          `HTTP error! status: ${response.status}`;
        throw new Error(message);
      }

      return payload as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /** Get authentication token from session storage */
  private static getAuthToken(): string | null {
    // Try several places because the login flow stores different shapes
    // 1. sessionStorage.userSession -> { session: { access_token } }
    // 2. sessionStorage.userSession -> { access_token } (future-proof)
    // 3. sessionStorage.access_token (explicit key we set at login)
    // 4. CamelCase accessToken variant
    try {
      const raw = sessionStorage.getItem('userSession');
      if (raw) {
        const parsed: any = JSON.parse(raw);
        const direct = parsed?.access_token || parsed?.accessToken;
        const nested = parsed?.session?.access_token || parsed?.session?.accessToken;
        if (typeof direct === 'string' && direct.length > 10) return direct;
        if (typeof nested === 'string' && nested.length > 10) return nested;
      }
    } catch (e) {
      console.warn('Failed to parse userSession for token', e);
    }
    const fallback = sessionStorage.getItem('access_token');
    if (fallback && fallback.length > 10) return fallback;
    return null;
  }

  /** Update profile */
  static async updateProfile(data: {
    date_of_birth?: string;
    primary_skill?: string;
    skill_to_learn?: string;
    bio?: string;
  }): Promise<ApiResponse<PersonalDataOut>> {
    const token = this.getAuthToken();
    if (!token) throw new Error('Authentication required');

    console.log('Sending profile update data:', data);

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Profile update response status:', response.status);
      
      if (!response.ok) {
        let errorData;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
          }
        } else {
          const textError = await response.text();
          errorData = { message: textError || `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error('Profile update error details:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Profile update success:', result);
      return result;
      
    } catch (error) {
      console.error('Profile update request failed:', error);
      throw error;
    }
  }

  /** Upload profile picture */
  static async uploadProfilePicture(data: {
    image_data: string;
    file_name: string;
    content_type: string;
  }): Promise<ApiResponse<any>> {
    const token = this.getAuthToken();
    if (!token) throw new Error('Authentication required');

    const response = await fetch(`${API_BASE_URL}/api/profile-picture/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to upload profile picture');
    }

    return response.json();
  }

  static async getCurrentProfile(): Promise<ApiResponse<PersonalDataOut>> {
    const token = this.getAuthToken();
    if (!token) throw new Error('Authentication required');

    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to get profile');
    }

    return response.json();
  }

  /** Skip profile picture upload */
  static async skipProfilePicture(): Promise<ApiResponse<any>> {
    const token = this.getAuthToken();
    if (!token) throw new Error('Authentication required');

    const response = await fetch(`${API_BASE_URL}/api/profile-picture/skip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to skip profile picture');
    }

    return response.json();
  }

  // ---------- Auth ----------
  static async signup(data: UnifiedSignupRequest) {
    return this.request<LoginWithProfileApiResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async completeProfile(_data: any) {
    throw new Error('completeProfile removed: unified signup flow is active');
  }

  static async login(data: LoginRequest) {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getSkills() {
    return this.request<SkillsResponse>('/api/skills');
  }

  static async testConnection() {
    return this.request('/test/supabase');
  }

  // ---------- Account Deletion ----------
  static async deleteAccount(): Promise<ApiResponse<undefined>> {
    const token = this.getAuthToken();
    if (!token) throw new Error('Authentication required');

    const response = await fetch(`${API_BASE_URL}/auth/account`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 200 || response.status === 204) {
      let payload: any = undefined;
      try { payload = await response.json(); } catch (_) {}
      return (payload || { status: 'success', message: 'Account deleted' }) as ApiResponse<undefined>;
    }

    let errMsg = 'Failed to delete account';
    try {
      const j = await response.json();
      errMsg = j.message || errMsg;
    } catch (_) {}
    throw new Error(errMsg);
  }

  // ---------- Posts ----------
  static async createPost(data: CreatePostRequest): Promise<ApiResponse<PostOut>> {
    const token = this.getAuthToken();
    if (!token) {
      console.warn('[createPost] No auth token found in sessionStorage');
      throw new Error('Authentication required');
    }
    console.debug('[createPost] Using token (first 16 chars):', token.substring(0,16));
    console.debug('[createPost] Payload:', data);

    return this.request<ApiResponse<PostOut>>('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
  }

  // Updated getPosts method - now returns properly typed enhanced posts
  static async getPosts(): Promise<ApiResponse<EnhancedPostResponse[]>> {
    const token = this.getAuthToken();
    
    return this.request<ApiResponse<EnhancedPostResponse[]>>('/api/posts', {
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` , 'Content-Type': 'application/json'} : {}),
      },
    });
  }
}

// ------ Types ------
export interface PersonalDataOut {
  id: string;
  user_id: string;
  date_of_birth: string;
  primary_skill: string;
  skill_to_learn: string;
  bio: string;
  profile_picture_url?: string;
  full_name?: string; 
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data?: T;
}

export interface SignupRequest {
  email: string;
  password: string;
  username: string;
}

// Legacy SignupResponse removed (unified flow)

// Legacy ProfileData removed

// Legacy CompleteProfileRequest removed

// Legacy ProfileCompleteResponse removed

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    session?: any;
    profile?: any;
    message: string;
    next_step: string;
  };
}

export interface SkillsResponse {
  status: string;
  message: string;
  data: {
    skills: string[];
    total: number;
  };
}

/* Posts */
export interface PostOut {
  id: string;
  user_id?: string;
  content?: string;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string | null;
}

export interface CreatePostRequest { 
  content: string; 
  image_url?: string | null; 
}

// Enhanced API response for posts with profile data
export interface EnhancedPostResponse {
  id: string;
  user_id: string;
  content?: string;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string | null;
  // Enhanced profile fields
  author_name: string;
  author_avatar?: string | null;
  author_role: string;
  author_primary_skill?: string | null;
  is_own_post: boolean;
}

export interface UnifiedSignupRequest {
  email: string;
  password: string;
  username?: string;
  date_of_birth: string; // DD/MM/YYYY or YYYY-MM-DD
  primary_skill?: string;
  skill_to_learn?: string;
  bio?: string;
}

export interface LoginWithProfileApiResponse {
  status: string;
  message: string;
  data: {
    session: any;
    profile: PersonalDataOut;
    username?: string | null;
    message: string;
    next_step: string; // "dashboard"
  };
}

// All legacy multi-step signup interfaces removed

export const handleApiError = (error: any) => {
  if (typeof error?.message === 'string' && error.message.includes('Failed to fetch')) {
    return 'Backend server tidak tersedia. Pastikan server berjalan di port 8080.';
  }
  return error?.message || 'Terjadi kesalahan yang tidak diketahui';
};