
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
          <div className="space-y-10">
            {groupedReports.map((group) => (
              <div key={group.dateKey} className="relative">
                {/* <span className="absolute left-0 top-1 h-4 w-4 rounded-full border-2 border-sea-gold bg-sea-sub-blue" />
                <span className="absolute left-1.5 sm:left-2 top-5 bottom-0 w-px bg-gradient-to-b from-sea-gold/70 via-sea-blue/60 to-transparent" aria-hidden /> */}

                <div className="bg-sea-blue/40 border border-sea-blue rounded-full inline-flex items-center gap-3 px-4 py-1 text-sm text-sea-gold font-semibold">
                  {group.readable}
                  <span className="text-xs text-sea-light-gray">{group.records.length} item{group.records.length === 1 ? "" : "s"}</span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {group.records.map((report, index) => (
                    <ReportCard
                      key={`${group.dateKey}-${report.image_url}`}
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
