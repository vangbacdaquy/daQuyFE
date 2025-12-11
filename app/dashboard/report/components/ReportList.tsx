
import ReportCard from "./ReportCard";
import { GroupedReport } from "../types";
import { formatDisplayDate } from "../utils";

interface ReportListProps {
  groupedReports: GroupedReport[];
  fetching: boolean;
  reportsCount: number;
  lastUpdated: string | null;
}

export default function ReportList({
  groupedReports,
  fetching,
  reportsCount,
  lastUpdated,
}: ReportListProps) {
  return (
    <>
      <div className="flex items-center justify-between text-xs text-sea-light-gray">
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

        {groupedReports.length === 0 && !fetching ? (
          <div className="bg-sea-blue/30 border border-sea-blue rounded-lg px-6 py-10 text-center text-sm text-sea-light-gray">
            No reports for the selected filters. Try expanding your date range or removing the email filter.
          </div>
        ) : (
          <div className="space-y-8">
            {groupedReports.map((group) => (
              <div key={group.dateKey} className="relative pb-2">
                
                {/* Sticky Date Header 
                    Top offset adjusted to close gap with filter bar.
                    Nav (64px) + Filter (~56px) = ~120px. 
                    Using top-[7.4rem] (~118px) to ensure slight overlap/no gap.
                */}
                <div className="sticky top-[7.4rem] z-30 py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 mb-4 bg-sea-sub-blue/95 backdrop-blur-md border-y border-sea-blue/50 shadow-lg shadow-black/10 flex items-center justify-between transition-[top]">
                  <div className="flex items-center gap-3">
                    <span className="text-sea-gold font-bold text-lg tracking-wide">{group.readable}</span>
                    <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 text-[10px] font-bold text-sea-blue bg-sea-gold/90 rounded-full">
                      {group.records.length}
                    </span>
                  </div>
                  <div className="h-px w-16 bg-gradient-to-l from-sea-gold/30 to-transparent" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {group.records.map((report, index) => (
                    <ReportCard
                      key={report.id || `${group.dateKey}-${index}`}
                      report={report}
                      dateKey={group.dateKey}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
