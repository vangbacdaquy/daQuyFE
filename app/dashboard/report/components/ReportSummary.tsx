
import { TotalsSummary } from "../types";
import { formatNumber } from "../utils";

interface ReportSummaryProps {
  totals: TotalsSummary;
}

export default function ReportSummary({ totals }: ReportSummaryProps) {
  return (
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
  );
}
