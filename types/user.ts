export interface UserProfile {
  name: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  pronouns?: string;
  wcaId?: string;
  wcaConnected?: boolean;
  showWcaOnProfile?: boolean;
  profileHidden?: boolean;
  memberSince: string;
  events?: string[];
  totalSolves: number;
  followers: number;
  following: number;
  recentPosts: number;
}
