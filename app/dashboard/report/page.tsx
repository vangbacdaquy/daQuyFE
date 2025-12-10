"use client";
 
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
 
interface ReportRecord {
  ai_count?: number | null;
  created_at?: string | null;
  date_str?: string | null;
  image_url?: string | null;
  manual_count?: number | null;
  month_str?: string | null;
  notes?: string | null;
  timestamp_iso?: string | null;
  user_email?: string | null;
  variance?: number | null;
}
 
interface TotalsSummary {
  ai: number;
  manual: number;
  variance: number;
}
 
interface FiltersState {
  userEmail: string;
  startDate: string;
  endDate: string;
}
 
const getDefaultDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 6);
 
  const format = (date: Date) => date.toISOString().split("T")[0];
 
  return {
    startDate: format(start),
    endDate: format(end),
  };
};
 
const normalizeReports = (payload: unknown): ReportRecord[] => {
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
 
const formatDisplayDate = (value?: string | null) => {
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
 
const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
 
export default function ReportPage() {
  const router = useRouter();
  const { user, loading, getJwt } = useAuth();
 
  const [{ userEmail, startDate, endDate }, setFilters] = useState<FiltersState>(() => ({
    userEmail: "",
    ...getDefaultDateRange(),
  }));
 
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
 
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);
 
  const fetchReports = useCallback(
    async (override?: Partial<FiltersState>) => {
      if (!user) {
        return;
      }
 
      const params = {
        userEmail,
        startDate,
        endDate,
        ...override,
      };
 
      if (params.startDate && params.endDate && params.startDate > params.endDate) {
        setError("Start date must be before end date.");
        return;
      }
 
      setFetching(true);
      setError(null);
 
      try {
        const token = await getJwt();
        if (!token) {
          throw new Error("Unable to get authentication token");
        }
 
        const query = new URLSearchParams();
        if (params.userEmail.trim()) {
          query.set("user_email", params.userEmail.trim());
        }
        if (params.startDate) {
          query.set("start_date", params.startDate);
        }
        if (params.endDate) {
          query.set("end_date", params.endDate);
        }
 
        const queryString = query.toString();
        const response = await fetch(`/api/reports${queryString ? `?${queryString}` : ""}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
 
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error || "Failed to fetch reports");
        }
 
        setReports(normalizeReports(payload));
        setLastUpdated(new Date().toISOString());
      } catch (err) {
        console.error("Report fetch error", err);
        const message = err instanceof Error ? err.message : "Unexpected error";
        setError(message);
        setReports([]);
      } finally {
        setFetching(false);
      }
    },
    [user, userEmail, startDate, endDate, getJwt]
  );
 
  useEffect(() => {
    if (!loading && user) {
      fetchReports();
    }
  }, [loading, user, fetchReports]);
 
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sea-blue">
        <div className="w-16 h-16 border-4 border-t-transparent border-sea-gold rounded-full animate-spin" />
      </div>
    );
  }
 
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
 
  const handleApplyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetchReports();
  };
 
  const handleResetFilters = () => {
    const defaults = { userEmail: "", ...getDefaultDateRange() };
    setFilters(defaults);
    fetchReports(defaults);
  };
 
  const dateMismatch = Boolean(startDate && endDate && startDate > endDate);
 
  const totals = useMemo<TotalsSummary>(
    () =>
      reports.reduce<TotalsSummary>(
        (acc, report) => {
          const ai = Number(report.ai_count ?? 0);
          const manual = Number(report.manual_count ?? 0);
          const variance =
            typeof report.variance === "number" && !Number.isNaN(report.variance)
              ? report.variance
              : manual - ai;
 
          return {
            ai: acc.ai + ai,
            manual: acc.manual + manual,
            variance: acc.variance + variance,
          };
        },
        { ai: 0, manual: 0, variance: 0 }
      ),
    [reports]
  );
 
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-sea-sub-blue rounded-lg shadow-xl border border-sea-gold/20 min-h-[600px]">
        <div className="p-6 border-b border-sea-blue">
          <h2 className="text-xl font-semibold text-sea-gold">Daily Reports</h2>
          <p className="text-sm text-sea-light-gray mt-1">
            Review AI vs manual counts for every upload. Use filters to narrow down by uploader or date range.
          </p>
        </div>
 
        <div className="p-6 space-y-6">
          <form
            onSubmit={handleApplyFilters}
            className="grid gap-4 lg:grid-cols-[2fr,1fr,1fr,auto] items-end"
          >
            <label className="flex flex-col">
              <span className="text-xs uppercase tracking-wide text-sea-light-gray mb-1">
                User Email
              </span>
              <input
                type="email"
                name="userEmail"
                value={userEmail}
                onChange={handleInputChange}
                placeholder="anyone@example.com"
                className="bg-sea-blue/40 border border-sea-blue rounded-md px-3 py-2 text-white placeholder:text-sea-gray focus:outline-none focus:ring-2 focus:ring-sea-gold"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-xs uppercase tracking-wide text-sea-light-gray mb-1">
                Start Date
              </span>
              <input
                type="date"
                name="startDate"
                value={startDate}
                max={endDate || undefined}
                onChange={handleInputChange}
                className="bg-sea-blue/40 border border-sea-blue rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sea-gold"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-xs uppercase tracking-wide text-sea-light-gray mb-1">
                End Date
              </span>
              <input
                type="date"
                name="endDate"
                value={endDate}
                min={startDate || undefined}
                onChange={handleInputChange}
                className="bg-sea-blue/40 border border-sea-blue rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sea-gold"
              />
            </label>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={fetching || dateMismatch}
                className="flex-1 bg-sea-gold text-sea-blue font-semibold px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 border border-sea-gray text-sea-light-gray px-4 py-2 rounded-md hover:border-sea-gold hover:text-white transition-colors"
              >
                Reset
              </button>
            </div>
          </form>
 
          {dateMismatch && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-100 text-sm px-4 py-2 rounded-md">
              Start date cannot be after end date.
            </div>
          )}
 
          {error && (
            <div className="bg-red-900/30 border border-red-500/40 text-red-100 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
 
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-sea-blue/40 border border-sea-blue rounded-xl p-4">
              <p className="text-sea-light-gray text-xs uppercase">Manual Count</p>
              <p className="text-2xl font-semibold text-white mt-2">{formatNumber(totals.manual)}</p>
            </div>
            <div className="bg-sea-blue/40 border border-sea-blue rounded-xl p-4">
              <p className="text-sea-light-gray text-xs uppercase">AI Count</p>
              <p className="text-2xl font-semibold text-white mt-2">{formatNumber(totals.ai)}</p>
            </div>
            <div className="bg-sea-blue/40 border border-sea-blue rounded-xl p-4">
              <p className="text-sea-light-gray text-xs uppercase">Variance</p>
              <p className={`text-2xl font-semibold mt-2 ${totals.variance === 0 ? "text-white" : totals.variance > 0 ? "text-green-300" : "text-red-300"}`}>
                {formatNumber(totals.variance)}
              </p>
            </div>
          </div>
 
          <div className="flex items-center justify-between text-xs text-sea-light-gray">
            <span>{reports.length} report{reports.length === 1 ? "" : "s"} found</span>
            {lastUpdated && (
              <span>Last updated {formatDisplayDate(lastUpdated)}</span>
            )}
          </div>
 
          <div className="relative overflow-x-auto border border-sea-blue rounded-lg">
            {fetching && (
              <div className="absolute inset-0 bg-sea-sub-blue/70 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="flex items-center gap-3 text-sea-gold">
                  <div className="w-6 h-6 border-2 border-t-transparent border-sea-gold rounded-full animate-spin" />
                  <span className="text-sm">Fetching reports…</span>
                </div>
              </div>
            )}
 
            <table className="min-w-full divide-y divide-sea-blue">
              <thead className="bg-sea-blue/70">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-sea-gold">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-sea-gold">Uploaded By</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-sea-gold">Manual</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-sea-gold">AI</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-sea-gold">Variance</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-sea-gold">Notes</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-sea-gold">Image</th>
                </tr>
              </thead>
              <tbody className="bg-sea-sub-blue divide-y divide-sea-blue">
                {reports.length === 0 && !fetching ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-sea-light-gray">
                      No reports for the selected filters.
                    </td>
                  </tr>
                ) : (
                  reports.map((report, index) => {
                    const variance =
                      typeof report.variance === "number" && !Number.isNaN(report.variance)
                        ? report.variance
                        : Number(report.manual_count ?? 0) - Number(report.ai_count ?? 0);
                    const imageUrl = report.image_url || "";
                    const canOpenImage = imageUrl.startsWith("http");
 
                    return (
                      <tr key={`${report.timestamp_iso ?? report.date_str ?? index}`} className="hover:bg-sea-blue/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-white whitespace-nowrap">
                          {formatDisplayDate(report.timestamp_iso || report.created_at || report.date_str)}
                        </td>
                        <td className="px-4 py-3 text-sm text-sea-light-gray whitespace-nowrap">
                          {report.user_email || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-white text-right">
                          {formatNumber(Number(report.manual_count ?? 0))}
                        </td>
                        <td className="px-4 py-3 text-sm text-white text-right">
                          {formatNumber(Number(report.ai_count ?? 0))}
                        </td>
                        <td
                          className={`px-4 py-3 text-sm text-right font-semibold ${
                            variance === 0 ? "text-white" : variance > 0 ? "text-green-300" : "text-red-300"
                          }`}
                        >
                          {formatNumber(variance)}
                        </td>
                        <td className="px-4 py-3 text-sm text-sea-light-gray max-w-xs">
                          {report.notes?.length ? report.notes : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {imageUrl ? (
                            canOpenImage ? (
                              <a
                                href={imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sea-gold hover:text-yellow-400 underline"
                              >
                                View
                              </a>
                            ) : (
                              <span className="text-sea-light-gray text-xs break-all">{imageUrl}</span>
                            )
                          ) : (
                            <span className="text-sea-light-gray">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
 
 