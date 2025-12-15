"use client";
 
import { useState, memo } from "react";
import Image from "next/image";
import { ReportRecord } from "../types";
import { formatTimeLabel } from "../utils";
import { useSignedUrl } from "../hooks/useSignedUrl";
 
interface ReportCardProps {
  report: ReportRecord;
  dateKey: string;
  index: number;
}
 
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);
 
const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);
 
const RobotIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"></rect>
    <circle cx="12" cy="5" r="2"></circle>
    <path d="M12 7v4"></path>
    <line x1="8" y1="16" x2="8" y2="16"></line>
    <line x1="16" y1="16" x2="16" y2="16"></line>
  </svg>
);
 
const ReportCard = memo(function ReportCard({ report, dateKey, index }: ReportCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
 
  const signedImageUrl = useSignedUrl(report.image_url);
  const imageUrl = signedImageUrl || "";
  const isLoadingImage = report.image_url?.startsWith("gs://") && !signedImageUrl;
 
  return (
    <button
      onClick={() => setIsExpanded(!isExpanded)}
      className="w-full bg-sea-sub-blue/60 border border-sea-blue hover:border-sea-gold/50 rounded-2xl p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 shadow-lg transition-all text-left overflow-hidden"
    >
      <div className="flex items-start gap-3 sm:gap-4 w-full">
        {/* Preview Image */}
        <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-sea-blue/30 relative">
          {isLoadingImage ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-t-transparent border-sea-gold rounded-full animate-spin" />
            </div>
          ) : (
            <Image
              src={imageUrl}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 64px, 80px"
              loading="lazy"
            />
          )}
        </div>
 
        <div className="flex-1 min-w-0">
          {/* Employee Name */}
          <div className="flex items-center justify-between gap-2">
             <p className="text-white font-semibold text-sm leading-tight truncate">
                {report.user_email || "Unknown uploader"}
             </p>
          </div>
          <p className="text-xs text-sea-light-gray mt-0.5">
            {formatTimeLabel(report)}
          </p>
 
          {/* Counts */}
          <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-3">
            <div className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-sky-100 text-sky-700 whitespace-nowrap">
              <RobotIcon />
              <span>AI: {report.ai_count}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-600 whitespace-nowrap">
              <UserIcon />
              <span>Manual: {report.manual_count}</span>
            </div>
          </div>
        </div>
 
        {/* Variance Badge - Chevron */}
        <div className="p-1 text-white flex-shrink-0">
          <ChevronDownIcon className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
 
      </div>
      
      {/* Expandable Details */}
      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="px-1 sm:px-4 pb-2 pt-1 border-t border-gray-50/5 mt-1">
            <p className="text-sm leading-relaxed text-sea-light-gray mb-3 mt-2">{report.ai_description}</p>
            {report.notes && (
              <div className="bg-yellow-500/10 border-l-4 border-sea-gold p-3 rounded text-[13px] text-sea-gold flex items-start gap-1.5">
                <span className="font-bold uppercase text-[11px] mt-0.5">Note:</span>
                <span className="flex-1 text-white/90">{report.notes}</span>
              </div>
            )}
          </div>
 
          {imageUrl && !isLoadingImage && (
            <div className="flex flex-wrap gap-3 text-sm mt-2">
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-sea-gold text-sea-blue font-semibold hover:bg-yellow-500 transition-colors"
              >
                Open Image
              </a>
            </div>
          )}
        </div>
      </div>
    </button>
  );
});

export default ReportCard;
