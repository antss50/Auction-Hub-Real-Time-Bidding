// src/types/auction.ts

export interface ApiAuctionItem {
  id: string;
  name: string;
  startingPrice: string;       
  depositAmountRequired: string; 
  auctionStartAt: string;
}

export interface AuctionItem {
  id: string;
  name: string;
  startingPrice: number;       
  deposit: number;             
  time: string;                
  image: string;               
  status?: "now" | "upcoming" | "completed"; 
  location: string;            
}

export interface AuctionResponse {
  ongoing: AuctionItem[];
  upcoming: AuctionItem[];
  past: AuctionItem[];
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
};

export interface AuctionDetail {
    id: string;
    name: string;
    code: string;
    status: string;
    assetType: string;
    assetAddress: string;
    assetDescription: string;
    saleStartAt: string;
    saleEndAt: string;
    auctionStartAt: string;
    auctionEndAt: string;
    depositEndAt: string;
    startingPrice: string;
    bidIncrement: string;
    depositAmountRequired: string;
    saleFee: string;
    owner: Owner;
    images: { url: string; sortOrder: number }[];
    attachments: Attachment[];
};

export interface Owner {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
};

export interface Attachment {
    url: string;
    type: 'document' | 'video';
};

export interface BankInfo {
    bank_name: string;
    account_number: string;
    account_name: string;
    transfer_content: string;
}

export interface PaymentInitiationData {
    paymentId: string;      
    amount: number;         
    paymentUrl: string;     
    qrCode: string;         
    bankInfo: BankInfo;
    deadline: string;      
    status: string;         
    message?: string;       
}

export interface PaymentVerificationResult {
    verified: boolean;
    paymentId: string;
    sessionId: string;
    amount: number;
    status: string; 
    message: string;
    contractId?: string; // Dùng cho bước thanh toán cuối cùng (Winner)
}