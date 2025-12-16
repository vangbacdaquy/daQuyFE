import { useEffect, useRef, useMemo } from "react";
import ReportCard from "./ReportCard";
import { ReportSession } from "../types";
import { formatDisplayDate, formatDateHeading } from "../utils";
import { Bot, UserCheck, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ReportListProps {
  sessions: ReportSession[];
  fetching: boolean;
  reportsCount: number;
  lastUpdated: string | null;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

export default function ReportList({
  sessions,
  fetching,
  reportsCount,
  lastUpdated,
  hasMore,
  loadingMore,
  onLoadMore,
}: ReportListProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  const groupedSessions = useMemo(() => {
    const map = new Map<string, ReportSession[]>();
    
    sessions.forEach(session => {
        try {
            const dateKey = new Date(session.timestamp).toISOString().split('T')[0];
            const existing = map.get(dateKey) ?? [];
            existing.push(session);
            map.set(dateKey, existing);
        } catch (e) {
            console.warn("Invalid timestamp in session", session);
        }
    });

    const sortedKeys = Array.from(map.keys()).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return sortedKeys.map(key => ({
        dateKey: key,
        readable: formatDateHeading(key),
        sessions: map.get(key) || []
    }));
  }, [sessions]);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target || !hasMore || fetching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, loadingMore, fetching, onLoadMore]);

  return (
    <>
      <div className="flex items-center justify-between text-xs text-sea-light-gray mb-4">
        <span>{reportsCount} report{reportsCount === 1 ? "" : "s"} found</span>
        {lastUpdated && (
          <span>Last updated {formatDisplayDate(lastUpdated)}</span>
        )}
      </div>

      <div className="relative">
        {fetching && (
          <div className="absolute inset-0 bg-sea-sub-blue/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg border border-sea-blue">
            <div className="flex items-center gap-3 text-sea-gold">
              <div className="w-6 h-6 border-2 border-t-transparent border-sea-gold rounded-full animate-spin" />
              <span className="text-sm">Fetching reports…</span>
            </div>
          </div>
        )}

        {sessions.length === 0 && !fetching ? (
          <div className="bg-sea-blue/30 border border-sea-blue rounded-lg px-6 py-10 text-center text-sm text-sea-light-gray">
            No reports for the selected filters. Try expanding your date range or removing the email filter.
          </div>
        ) : (
          <div className="space-y-8">
            {groupedSessions.map((group) => (
              <div key={group.dateKey} className="relative pb-2">
                 {/* Sticky Date Header */}
                <div className="sticky top-[7.4rem] z-30 py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 bg-sea-sub-blue/95 backdrop-blur-md border-y border-sea-blue/50 shadow-lg shadow-black/10 flex items-center justify-between transition-[top]">
                  <div className="flex items-center gap-3">
                    <span className="text-sea-gold font-bold text-lg tracking-wide">{group.readable}</span>
                    <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 text-[10px] font-bold text-sea-blue bg-sea-gold/90 rounded-full">
                      {group.sessions.reduce((acc, s) => acc + s.reports.length, 0)}
                    </span>
                  </div>
                  <div className="h-px w-16 bg-gradient-to-l from-sea-gold/30 to-transparent" />
                </div>

                <div className="space-y-6 mt-4">
                    {group.sessions.map((session) => (
                    <div key={session.id} className="pb-2">
                        
                        {/* Session Header */}
                        <div className="sticky top-[10.6rem] z-20 bg-sea-sub-blue/95 backdrop-blur-md py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 border-y border-sea-blue/30 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-sea-blue flex items-center justify-center text-sea-gold font-bold shadow-inner text-sm sm:text-base ring-2 ring-sea-blue/50 shrink-0">
                                    {session.user_email.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-sm text-sea-light-gray">
                                    <span className="font-bold text-sea-gold">{session.user_email.split('@')[0]}</span>
                                    {" uploaded "}
                                    <span className="font-bold text-white">{session.reports.length} images</span>
                                    {" at "}
                                    <span>{new Date(session.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs sm:text-sm pl-11 sm:pl-0">
                                <div className="flex items-center gap-1.5 bg-sea-blue/20 px-2 py-1 rounded sm:bg-transparent sm:p-0" title="AI Count">
                                    <Bot className="w-3.5 h-3.5 text-sea-light-gray" />
                                    <span className="font-bold text-sea-gold">{session.summary.ai}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-sea-blue/20 px-2 py-1 rounded sm:bg-transparent sm:p-0" title="Manual Count">
                                    <UserCheck className="w-3.5 h-3.5 text-sea-light-gray" />
                                    <span className="font-bold text-white">{session.summary.manual}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-sea-blue/20 px-2 py-1 rounded sm:bg-transparent sm:p-0" title="Variance">
                                    {session.summary.variance > 0 ? (
                                        <TrendingUp className="w-3.5 h-3.5 text-sea-light-gray" />
                                    ) : session.summary.variance < 0 ? (
                                        <TrendingDown className="w-3.5 h-3.5 text-sea-light-gray" />
                                    ) : (
                                        <Minus className="w-3.5 h-3.5 text-sea-light-gray" />
                                    )}
                                    <span className={`font-bold ${session.summary.variance === 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {session.summary.variance > 0 ? '+' : ''}{session.summary.variance}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Reports Grid */}
                        <div className="pt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {session.reports.map((report, index) => (
                            <ReportCard
                            key={report.id || `${session.id}-${index}`}
                            report={report}
                            dateKey={session.timestamp}
                            index={index}
                            />
                        ))}
                        </div>
                    </div>
                    ))}
                </div>
              </div>
            ))}

            {hasMore && (
              <div 
                ref={observerTarget}
                className="flex justify-center pt-4 pb-8 min-h-[50px]"
              >
                {loadingMore && (
                    <div className="flex items-center gap-2 text-sea-gold">
                      <div className="w-5 h-5 border-2 border-t-transparent border-sea-gold rounded-full animate-spin" />
                      <span className="text-sm font-medium">Loading more...</span>
                    </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
