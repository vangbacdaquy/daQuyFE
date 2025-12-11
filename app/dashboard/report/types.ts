export interface ReportRecord {
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
