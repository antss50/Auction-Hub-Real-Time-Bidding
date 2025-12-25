export interface TimeSeriesPoint {
    date: string;
    gmv: number;
    revenue: number;
    auctionCount: number;
}

export interface DashboardSummary {
    totalGmv: number;
    totalRevenue: number;
    avgBids: number;
    successRatePercentage: number;
    totalAuctions: number;
    successfulAuctions: number;
}

export interface DashboardAnalyticsData {
    summary: DashboardSummary;
    timeSeries: TimeSeriesPoint[];
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface AnalyticsParams {
    startDate?: string;
    endDate?: string;
    assetType?: string;
    provinceId?: string;
}