
import { memo } from "react";
import { TotalsSummary } from "../types";
import { formatNumber } from "../utils";

interface ReportSummaryProps {
  totals: TotalsSummary;
}

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

const RobotIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>
);

const ChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
);

const ReportSummary = memo(function ReportSummary({ totals }: ReportSummaryProps) {
  const isVariance = totals.variance !== 0;

  return (
    <div className="bg-sea-blue/20 border border-sea-blue/50 rounded-xl p-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 sm:gap-8 shadow-inner overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-sea-gold/5 to-transparent pointer-events-none" />

      {/* Manual Count */}
      <div className="flex items-center gap-3 flex-1 min-w-[120px]">
        <div className="w-8 h-8 rounded-full bg-sea-sub-blue flex items-center justify-center text-sea-light-gray shrink-0">
          <UserIcon />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-sea-light-gray font-medium">Manual</p>
          <p className="text-lg font-bold text-white leading-none mt-0.5">{formatNumber(totals.manual)}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-8 bg-gradient-to-b from-transparent via-sea-blue to-transparent" />

      {/* AI Count */}
      <div className="flex items-center gap-3 flex-1 min-w-[120px]">
        <div className="w-8 h-8 rounded-full bg-sea-sub-blue flex items-center justify-center text-sea-light-gray shrink-0">
          <RobotIcon />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-sea-light-gray font-medium">AI Count</p>
          <p className="text-lg font-bold text-sea-gold leading-none mt-0.5">{formatNumber(totals.ai)}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-8 bg-gradient-to-b from-transparent via-sea-blue to-transparent" />

      {/* Variance */}
      <div className="flex items-center gap-3 flex-1 min-w-[120px]">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors bg-red-500/10 text-red-400`}>
          <ChartIcon />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-sea-light-gray font-medium">Variance</p>
          <p className={`text-lg font-bold leading-none mt-0.5 ${isVariance ? "text-red-400" : "text-white-400"}`}>
            {totals.variance > 0 ? "+" : ""}{formatNumber(totals.variance)}
          </p>
        </div>
      </div>
    </div>
  );
});

export default ReportSummary;
