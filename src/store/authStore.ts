import { create } from 'zustand';
import axiosClient from '../api/axiosClient';
import * as SecureStore from 'expo-secure-store';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure Google Sign-In is now moved into the googleLogin action to avoid crashing Expo Go on startup.

interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  googleLogin: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,

  login: async (data) => {
    set({ loading: true });
    try {
      const res = await axiosClient.post('/auth/login', { ...data, clientType: 'mobile' });
      const { accessToken } = res.data;
      await SecureStore.setItemAsync('token', accessToken);
      
      // Fetch profile immediately after login to populate user state
      const profileRes = await axiosClient.get('/api/settings/profile', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      set({ 
        user: profileRes.data.data || profileRes.data, 
        token: accessToken, 
        loading: false 
      });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  register: async (data) => {
    set({ loading: true });
    try {
      // Production API uses fullName instead of name
      const { name, ...rest } = data;
      const res = await axiosClient.post('/auth/register', { ...rest, fullName: name });
      
      // Note: Registration might not return tokens if email verification is required
      // But if it does (for some APIs), we handle it. 
      // Based on contract, it returns { message, data: { id, email ... } }
      // So we probably can't login immediately.
      
      set({ loading: false });
      return res.data;
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  logout: async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (e) {
      // Ignore logout errors
    }
    await SecureStore.deleteItemAsync('token');
    set({ user: null, token: null });
  },

  fetchCurrentUser: async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        set({ user: null, token: null, loading: false });
        return;
      }
      const res = await axiosClient.get('/api/settings/profile');
      set({ user: res.data.data || res.data, token, loading: false });
    } catch (e) {
      await SecureStore.deleteItemAsync('token');
      set({ user: null, token: null, loading: false });
    }
  },

  resendVerification: async (email: string) => {
    try {
      await axiosClient.post('/auth/resend-verification', { email });
    } catch (e) {
      throw e;
    }
  },

  googleLogin: async () => {
    // Check if we are in environment with native Google Sign-In support (Dev Build)
    if (!GoogleSignin.signIn) {
      throw new Error('Google Sign-In tidak didukung di Expo Go. Gunakan Development Build.');
    }

    set({ loading: true });
    try {
      // Configure on-demand
      GoogleSignin.configure({
        webClientId: 'YOUR_GOOGLE_CLIENT_ID',
      });

      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      
      if (!idToken) throw new Error('Gagal mendapatkan ID Token dari Google');
      
      const res = await axiosClient.post('/auth/google/token', {
        idToken,
        clientType: 'mobile',
      });
      
      const { accessToken } = res.data;
      await SecureStore.setItemAsync('token', accessToken);
      
      // Fetch profile
      const profileRes = await axiosClient.get('/api/settings/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      set({
        user: profileRes.data.data || profileRes.data,
        token: accessToken,
        loading: false,
      });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  updateProfile: async (data) => {
    set({ loading: true });
    try {
      const res = await axiosClient.put('/api/settings/profile', data);
      set({ user: res.data.data || res.data, loading: false });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  }
}));
