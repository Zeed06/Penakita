export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  bio: string;
}

export interface Article {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  author: User;
  createdAt: string;
  readTime: number; // in minutes
  topics: string[];
  likes: number;
  comments: number;
  thumbnailUrl?: string;
}

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'John Doe',
  username: '@johndoe',
  avatarUrl: 'https://i.pravatar.cc/150?u=johndoe',
  bio: 'Software Engineer & Writer. Exploring the universe of code.',
};

export const MOCK_ARTICLES: Article[] = [
  {
    id: 'a1',
    title: 'The Future of React Native in 2026',
    subtitle: 'Why Expo and Server Components are changing the game.',
    content: "The mobile app development landscape has significantly shifted in recent years. React Native, coupled with Expo, has matured to a point where the developer experience is practically seamless. Features like File-based routing with Expo Router have introduced a Next.js-like feel to mobile development. The introduction of React Compiler and React Server Components to the mobile ecosystem means that developers can now ship faster and lighter applications without worrying as much about manual memoization...",
    author: {
      id: 'u2',
      name: 'Jane Smith',
      username: '@janesmith',
      avatarUrl: 'https://i.pravatar.cc/150?u=janesmith',
      bio: 'Mobile Dev Expert & Tech Enthusiast',
    },
    createdAt: '2026-03-20T10:00:00Z',
    readTime: 5,
    topics: ['Programming', 'React Native', 'Mobile'],
    likes: 1240,
    comments: 89,
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000',
  },
  {
    id: 'a2',
    title: 'Minimalism in UI Design',
    subtitle: 'Less is more, but harder to achieve.',
    content: "Minimalism isn't just about white space; it's about intentionality. When you strip away the unnecessary, what remains must be perfect. Medium's own interface is a testament to this philosophy. Typography becomes the primary vehicle of emotion and structure. To achieve true minimalism, one must ruthlessly measure every element's contribution to the user's goal...",
    author: {
      id: 'u3',
      name: 'Alex Rivera',
      username: '@arivera',
      avatarUrl: 'https://i.pravatar.cc/150?u=arivera',
      bio: 'UI/UX Designer @ TechCorp',
    },
    createdAt: '2026-03-21T14:30:00Z',
    readTime: 4,
    topics: ['Design', 'UI/UX', 'Productivity'],
    likes: 856,
    comments: 42,
    thumbnailUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=1000',
  },
  {
    id: 'a3',
    title: 'Understanding Monorepos with TypeScript',
    subtitle: 'A practical guide to scaling your codebase.',
    content: "As projects grow, managing dependencies across multiple related packages can become a nightmare. Monorepos solve this by keeping everything in one repository. Tools like Turborepo and npm/yarn/pnpm workspaces have made it easier than ever to share code between your backend (e.g., Hono) and frontend (e.g., React Native). In this article, we explore the benefits...",
    author: CURRENT_USER,
    createdAt: '2026-03-22T08:15:00Z',
    readTime: 8,
    topics: ['TypeScript', 'Architecture', 'WebDev'],
    likes: 312,
    comments: 15,
  }
];

export const MOCK_TOPICS = [
  'For you', 'Following', 'Programming', 'Design', 'Technology', 'Startups', 'Self Improvement'
];
