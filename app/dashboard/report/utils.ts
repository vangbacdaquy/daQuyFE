
import { ReportRecord } from "./types";

export const toDateInputValue = (date: Date) => date.toISOString().split("T")[0];

export const PRESET_RANGES = [
  { label: "Today", days: 0 },
  { label: "Last 7 days", days: 6 },
  { label: "Last 30 days", days: 29 },
] as const;

export const getDefaultDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 6);

  return {
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end),
  };
};

export const normalizeReports = (payload: unknown): ReportRecord[] => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload as ReportRecord[];
  }

  if (typeof payload === "object") {
    const candidates = ["data", "items", "reports"] as const;
    for (const key of candidates) {
      const value = (payload as Record<string, unknown>)[key];
      if (Array.isArray(value)) {
        return value as ReportRecord[];
      }
    }
  }

  return [];
};

export const formatDisplayDate = (value?: string | null) => {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
};

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);

const getDateKey = (report: ReportRecord) => {
  if (report.date_str) {
    return report.date_str;
  }
  if (report.timestamp_iso) {
    return report.timestamp_iso.split("T")[0];
  }
  if (report.created_at) {
    const parsed = new Date(report.created_at);
    if (!Number.isNaN(parsed.valueOf())) {
      return parsed.toISOString().split("T")[0];
    }
  }
  return "Unknown";
};

const formatDateHeading = (value: string) => {
  if (value === "Unknown") {
    return "Date unavailable";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(parsed);
};

export const formatTimeLabel = (report: ReportRecord) => {
  const value = report.timestamp_iso || report.created_at;
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
};

const getReportTime = (report: ReportRecord) => {
  const value = report.timestamp_iso || report.created_at;
  if (!value) return 0;
  return new Date(value).getTime();
};

export const groupReportsByDate = (records: ReportRecord[]) => {
  const map = new Map<string, ReportRecord[]>();
  
  // More efficient grouping - avoid creating intermediate arrays
  for (const record of records) {
    const key = getDateKey(record);
    const existing = map.get(key);
    if (existing) {
      existing.push(record);
    } else {
      map.set(key, [record]);
    }
  }

  const sortedKeys = Array.from(map.keys()).sort((a, b) => {
    if (a === "Unknown") return 1;
    if (b === "Unknown") return -1;
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return sortedKeys.map((key) => {
    const groupRecords = map.get(key) ?? [];
    // Records are expected to be pre-sorted from API/store.
    
    return {
      dateKey: key,
      readable: formatDateHeading(key),
      records: groupRecords,
    };
  });
};

export const truncateNotes = (value?: string | null, maxLength = 160) => {
  if (!value) {
    return null;
  }
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength)}…`;
};
