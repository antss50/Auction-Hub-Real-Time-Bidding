// src/types/auction.ts

export interface ApiAuctionItem {
  id: string;
  name: string;
  startingPrice: string;       
  depositAmountRequired: string; 
  auctionStartAt: string;
  images: any;
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