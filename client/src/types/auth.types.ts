export type User = {
  id: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  identityNumber: string;
  userType: 'individual' | 'business';
  role: 'bidder' | 'auctioneer' | 'admin' | 'super_admin';
  avatarUrl: string | null;
  isVerified: boolean;
  isBanned: boolean;
  ratingScore: string;
  totalRatings: number;
  createdAt: string;
};

export type LoginResponse = {
    user: User;
    access_token: string;
    refresh_token: string;
    expires_in: number;
};

export type RegisterResponse = {
    user_id: string;
    email: string;
    verification_required: boolean;
}

export type PaginationMeta = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
    meta?: PaginationMeta | unknown;
    timestamp: string;
    path: string;
}