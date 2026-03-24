import { create } from 'zustand';
import axiosClient from '../api/axiosClient';

interface ArticleState {
  articles: any[];
  article: any | null;
  loading: boolean;
  fetchArticles: (cursor?: string) => Promise<void>;
  fetchArticleById: (slug: string) => Promise<void>;
  createArticle: (data: any) => Promise<void>;
  likeArticle: (id: string) => Promise<boolean>;
}

export const useArticleStore = create<ArticleState>((set, get) => ({
  articles: [],
  article: null,
  loading: false,

  fetchArticles: async (cursor?: string) => {
    set({ loading: true });
    try {
      const url = `/api/posts?limit=10${cursor ? `&cursor=${cursor}` : ''}`;
      const res = await axiosClient.get(url);
      const newArticles = res.data.items || [];
      
      set((state) => ({ 
        articles: cursor ? [...state.articles, ...newArticles] : newArticles, 
        loading: false 
      }));
    } catch (e) {
      set({ loading: false });
      console.error("FETCH_ARTICLES_ERROR:", e);
    }
  },

  fetchArticleById: async (slug: string) => {
    set({ loading: true });
    try {
      const res = await axiosClient.get(`/api/posts/${slug}`);
      set({ article: res.data.data || res.data, loading: false });
    } catch (e) {
      set({ loading: false });
      console.error("FETCH_ARTICLE_DETAIL_ERROR:", e);
    }
  },

  createArticle: async (data: any) => {
    set({ loading: true });
    try {
      await axiosClient.post('/api/posts', data);
      await get().fetchArticles();
      set({ loading: false });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  likeArticle: async (id: string) => {
    try {
      const res = await axiosClient.post(`/api/posts/${id}/like`);
      const liked = res.data.data?.liked ?? res.data.liked ?? false;
      
      // Update article in detail view
      const current = get().article;
      if (current && current.id === id) {
        set({
          article: {
            ...current,
            isLiked: liked,
            likeCount: liked
              ? (current.likeCount || 0) + 1
              : Math.max((current.likeCount || 0) - 1, 0),
          },
        });
      }
      
      // Update article in list
      set((state) => ({
        articles: state.articles.map((a) =>
          a.id === id
            ? {
                ...a,
                isLiked: liked,
                likeCount: liked
                  ? (a.likeCount || 0) + 1
                  : Math.max((a.likeCount || 0) - 1, 0),
              }
            : a
        ),
      }));
      
      return liked;
    } catch (e) {
      console.error('LIKE_ARTICLE_ERROR:', e);
      throw e;
    }
  },
}));
