import { create } from 'zustand';
import axiosClient from '../api/axiosClient';

interface Comment {
  id: string;
  content: { text: string; markups?: any[] };
  author: {
    id: string;
    fullName?: string;
    username?: string;
    avatarUrl?: string;
  };
  parentId?: string;
  createdAt: string;
  replies?: Comment[];
}

interface CommentState {
  comments: Comment[];
  loading: boolean;
  submitting: boolean;
  fetchComments: (postId: string) => Promise<void>;
  addComment: (postId: string, text: string, parentId?: string) => Promise<void>;
}

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: [],
  loading: false,
  submitting: false,

  fetchComments: async (postId: string) => {
    set({ loading: true });
    try {
      const res = await axiosClient.get(`/api/posts/${postId}/comments?limit=50`);
      const items = res.data.items || res.data.data || res.data || [];
      set({ comments: Array.isArray(items) ? items : [], loading: false });
    } catch (e) {
      set({ loading: false });
      console.error('FETCH_COMMENTS_ERROR:', e);
    }
  },

  addComment: async (postId: string, text: string, parentId?: string) => {
    set({ submitting: true });
    try {
      await axiosClient.post(`/api/posts/${postId}/comments`, {
        content: { text, markups: [] },
        ...(parentId ? { parentId } : {}),
      });
      // Refresh comments after adding
      await get().fetchComments(postId);
      set({ submitting: false });
    } catch (e) {
      set({ submitting: false });
      throw e;
    }
  },
}));
