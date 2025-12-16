export interface ReportRecord {
    id?: string;
    ai_count?: number | null;
    created_at?: string | null;
    date_str?: string | null;
    image_url?: string | null;
    manual_count?: number | null;
    month_str?: string | null;
    notes?: string | null;
    ai_description?: string | null;
    timestamp_iso?: string | null;
    user_email?: string | null;
    variance?: number | null;
  }
  
  export interface ReportBatch {
    user_email: string;
    created_at: string; // ISO timestamp
    image_count: number;
    batch_id?: string;
  }

  export interface TotalsSummary {
    ai: number;
    manual: number;
    variance: number;
  }
  
  export interface FiltersState {
    userEmail: string;
    startDate: string;
    endDate: string;
  }
  
  export type GroupedReport = {
    dateKey: string;
    readable: string;
    records: ReportRecord[];
  };

  export interface AuthUser {
    uid: string;
    email?: string | null;
    displayName?: string | null;
  }

  export interface ReportSession {
    id: string;
    user_email: string;
    timestamp: string;
    reports: ReportRecord[];
    summary: {
        ai: number;
        manual: number;
        variance: number;
    };
  }
