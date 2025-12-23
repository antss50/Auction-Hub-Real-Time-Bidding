export interface RegistrationUser {
  email: string;
  fullName: string;
  phoneNumber: string;
}

export interface RegistrationAuction {
  name: string;
  code: string;
}

export interface RegistrationDocument {
  url: string;
  publicId?: string;
  type?: string;
  sortOrder?: number;
}

export interface RegistrationMedia {
  url: string;
  publicId?: string;
  type?: string;
  sortOrder?: number;
}

export interface Registration {
  id: string;
  userId: string;
  auctionId: string;
  registeredAt: string;
  submittedAt?: string | null;
  confirmedAt?: string | null;
  documentsVerifiedAt?: string | null;
  documentsVerifiedBy?: string | null;
  documentsRejectedAt?: string | null;
  documentsRejectedReason?: string | null;
  depositPaidAt?: string | null;
  withdrawnAt?: string | null;
  withdrawalReason?: string | null;
  checkedInAt?: string | null;
  currentState: 'PENDING_DOCUMENT_REVIEW' | 'DOCUMENTS_VERIFIED' | 'DOCUMENTS_REJECTED' | 'DEPOSIT_PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'WITHDRAWN' | 'DEPOSIT_PAID';
  user: RegistrationUser;
  auction: RegistrationAuction;
  documents?: RegistrationDocument[];
  media?: RegistrationMedia[];
}

export interface RegistrationPagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface RegistrationListResponse {
  success: boolean;
  message: string;
  data: Registration[];
  meta: RegistrationPagination;
}

export interface VerifyDocumentsRequest {
  registrationId: string;
}

export interface VerifyDocumentsResponse {
  id: string;
  documentsVerifiedAt: string;
  documentsVerifiedBy: string;
  currentState: string;
}

export interface RejectDocumentsRequest {
  registrationId: string;
  reason: string;
}

export interface RejectDocumentsResponse {
  id: string;
  documentsRejectedAt: string;
  documentsRejectedReason: string;
  currentState: string;
}

export interface FinalApprovalRequest {
  registrationId: string;
}

export interface FinalApprovalResponse {
  id: string;
  userId: string;
  auctionId: string;
  confirmedAt: string;
  currentState: string;
}

export type RegistrationStatus = 'all' | 'pending_review' | 'confirmed' | 'rejected' | 'withdrawn' | 'deposit_pending';

export interface RegistrationListParams {
  page?: number;
  limit?: number;
  status?: string;
  auctionId?: string;
}
