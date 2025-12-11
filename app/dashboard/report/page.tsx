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
import {
  ReportRecord,
  TotalsSummary,
  FiltersState,
  GroupedReport,
  AuthUser,
} from "./types";
import {
  getDefaultDateRange,
  normalizeReports,
  groupReportsByDate,
  toDateInputValue,
} from "./utils";
import ReportFilters from "./components/ReportFilters";
import ReportSummary from "./components/ReportSummary";
import ReportList from "./components/ReportList";
import { motion } from "framer-motion";

export default function ReportPage() {
  const router = useRouter();
  const { user, loading, getJwt } = useAuth();

  const [filters, setFilters] = useState<FiltersState>(() => ({
    userEmail: "",
    ...getDefaultDateRange(),
  }));

  // Debounce: Store the filters used for fetching separately
  const [debouncedFilters, setDebouncedFilters] = useState<FiltersState>(filters);

  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // Debounce Effect: Update debouncedFilters after delay
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [filters]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await getJwt();
        if (!token) return;

        const response = await fetch("/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    if (user) {
      fetchUsers();
    }
  }, [user, getJwt]);

  const fetchReports = useCallback(
    async (filtersToUse: FiltersState) => {
      if (!user) {
        return;
      }

      // Check for valid date range before fetching
      if (
        filtersToUse.startDate &&
        filtersToUse.endDate &&
        filtersToUse.startDate > filtersToUse.endDate
      ) {
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
        if (filtersToUse.userEmail.trim()) {
          query.set("user_email", filtersToUse.userEmail.trim());
        }
        if (filtersToUse.startDate) {
          query.set("start_date", filtersToUse.startDate);
        }
        if (filtersToUse.endDate) {
          query.set("end_date", filtersToUse.endDate);
        }

        const queryString = query.toString();
        const response = await fetch(
          `/api/reports${queryString ? `?${queryString}` : ""}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error || "Failed to fetch reports");
        }

        setReports(normalizeReports(payload));
        setLastUpdated(new Date().toISOString());
      } catch (err) {
        console.error("Report fetch error", err);
        const message =
          err instanceof Error ? err.message : "Unexpected error";
        setError(message);
        setReports([]);
      } finally {
        setFetching(false);
      }
    },
    [user, getJwt]
  );

  // Trigger fetch when debounced filters change
  useEffect(() => {
    if (!loading && user) {
      fetchReports(debouncedFilters);
    }
  }, [loading, user, debouncedFilters, fetchReports]);

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Force immediate update to debounced filters (bypassing timer)
    setDebouncedFilters(filters);
  };

  const handleResetFilters = () => {
    const defaults = { userEmail: "", ...getDefaultDateRange() };
    setFilters(defaults);
    // Immediate reset
    setDebouncedFilters(defaults);
  };

  const handleApplyPresetRange = (days: number) => {
    const endDateValue = toDateInputValue(new Date());
    const startDateBase = new Date();
    startDateBase.setDate(startDateBase.getDate() - days);
    const range = {
      startDate: toDateInputValue(startDateBase),
      endDate: endDateValue,
    };

    setFilters((prev) => {
      const next = { ...prev, ...range };
      return next;
    });
    // For presets, we usually want immediate feedback, but letting it debounce is also fine.
    // If you want immediate:
    // setDebouncedFilters(prev => ({ ...prev, ...range }));
  };

  const dateMismatch = Boolean(
    filters.startDate && filters.endDate && filters.startDate > filters.endDate
  );

  const totals = useMemo<TotalsSummary>(
    () =>
      reports.reduce<TotalsSummary>(
        (acc, report) => {
          const ai = Number(report.ai_count ?? 0);
          const manual = Number(report.manual_count ?? 0);
          const variance =
            typeof report.variance === "number" &&
            !Number.isNaN(report.variance)
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

  const groupedReports = useMemo<GroupedReport[]>(
    () => groupReportsByDate(reports),
    [reports]
  );

  if (loading || !user) {
    return (
      <div className="min-h-screen px-4 py-6 space-y-6 max-w-7xl mx-auto">
        <div className="h-40 bg-white/5 rounded-xl animate-pulse border border-white/5" />
        <div className="space-y-4">
             {[1, 2, 3].map(i => (
                 <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
             ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="pb-24" // Bottom padding for mobile nav
    >
      <div className="bg-sea-sub-blue/50 backdrop-blur-md rounded-2xl shadow-xl border border-sea-gold/10 min-h-[600px]">
        <div className="p-6 border-b border-sea-blue bg-sea-blue/50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-sea-gold flex items-center gap-2">
            Daily Reports
          </h2>
          <p className="text-sm text-sea-light-gray mt-1">
            Review and track jewelry counts.
          </p>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <ReportFilters
            filters={filters}
            fetching={fetching}
            users={users}
            onInputChange={handleInputChange}
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
            onApplyPresetRange={handleApplyPresetRange}
            dateMismatch={dateMismatch}
          />

          {dateMismatch && (
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="bg-red-500/10 border border-red-500/50 text-red-200 text-sm px-4 py-2 rounded-lg"
            >
              Start date cannot be after end date.
            </motion.div>
          )}

          {error && (
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}

          <ReportSummary totals={totals} />

          <ReportList
            groupedReports={groupedReports}
            fetching={fetching}
            reportsCount={reports.length}
            lastUpdated={lastUpdated}
          />
        </div>
      </div>
    </motion.div>
  );
}
