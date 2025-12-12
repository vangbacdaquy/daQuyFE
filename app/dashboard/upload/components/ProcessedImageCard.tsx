"use client";

import { useState } from "react";
import Image from "next/image";

interface ProcessedItem {
  imageURL: string;
  gsUri: string;
  imageID: string;
  ai_count: number;
  counting_logic: string;
  layout_type?: string;
  item_type?: string;
  manual_count?: number;
  notes?: string;
}

interface ProcessedImageCardProps {
  item: ProcessedItem;
  index: number;
  onFieldChange: (
    index: number,
    field: "manual_count" | "notes",
    value: string | number
  ) => void;
}

export function ProcessedImageCard({
  item,
  index,
  onFieldChange,
}: ProcessedImageCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const toggleEdit = () => {
    if (!isEditing) {
      // If entering edit mode, ensure card is expanded so inputs are visible
      setIsExpanded(true);
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="flex flex-col border border-sea-sub-blue bg-sea-blue rounded-lg overflow-hidden transition-all duration-200 hover:border-sea-gold/50">
      {/* --- Top Row: Preview, Summary Info, Actions --- */}
      <div className="flex items-center p-3 gap-4">
        {/* Preview Image */}
        <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-black border border-sea-sub-blue">
          <Image
            src={item.imageURL}
            alt={`Processed image ${item.imageID}`}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>

        {/* Main Info */}
        <div className="flex-grow flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs text-sea-gray font-mono uppercase tracking-wide">
              ID: {item.imageID.slice(0, 8)}...
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-medium text-white">AI Count:</span>
              <span className="text-lg font-bold text-sea-gold">
                {item.ai_count}
              </span>
            </div>
            {(item.item_type || item.layout_type) && (
              <div className="flex gap-2 mt-1">
                {item.item_type && (
                  <span className="px-2 py-0.5 rounded text-xs bg-sea-sub-blue text-sea-light-gray border border-sea-gray/30">
                    {item.item_type}
                  </span>
                )}
                {item.layout_type && (
                  <span className="px-2 py-0.5 rounded text-xs bg-sea-sub-blue text-sea-light-gray border border-sea-gray/30">
                    {item.layout_type}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Quick Stats (visible when collapsed if data exists) */}
          {!isExpanded && item.manual_count !== undefined && (
            <div className="hidden sm:block text-sm text-sea-light-gray">
              Manual:{" "}
              <span className="text-white font-semibold">
                {item.manual_count}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleEdit}
            className={`p-2 rounded-md transition-colors ${
              isEditing
                ? "bg-sea-gold text-sea-blue"
                : "text-sea-gray hover:text-white hover:bg-white/10"
            }`}
            title={isEditing ? "Save & Finish" : "Edit Details"}
          >
            {isEditing ? (
              // Save Icon (Floppy Disk)
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
            ) : (
              // Pencil Icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            )}
          </button>

          <button
            onClick={toggleExpand}
            className="p-2 text-sea-gray hover:text-white hover:bg-white/10 rounded-md transition-colors"
            title={isExpanded ? "Collapse" : "Expand Details"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* --- Expanded Section: Description & Form --- */}
      {isExpanded && (
        <div className="border-t border-sea-sub-blue bg-black/20 p-4 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: AI Data */}
            <div>
              <h4 className="text-xs font-bold text-sea-gray uppercase mb-2">
                Counting Logic
              </h4>
              <p className="text-sm text-sea-light-gray leading-relaxed">
                {item.counting_logic || "No logic details available."}
              </p>
            </div>

            {/* Column 2: User Inputs / Data */}
            <div className="space-y-4">
              {/* Manual Count Field */}
              <div>
                <label
                  htmlFor={`manual_count_${index}`}
                  className="block text-xs font-bold text-sea-gray uppercase mb-2"
                >
                  Manual Count
                </label>
                {isEditing ? (
                  <input
                    id={`manual_count_${index}`}
                    type="number"
                    value={item.manual_count ?? ""}
                    onChange={(e) =>
                      onFieldChange(index, "manual_count", e.target.value)
                    }
                    className="w-full p-2 text-sm border border-zinc-600 rounded-md bg-zinc-800 text-white focus:ring-2 focus:ring-sea-gold focus:border-transparent outline-none transition-all"
                    placeholder="Enter corrected count"
                  />
                ) : (
                  <div className="text-sm text-white font-medium pl-1">
                    {item.manual_count !== undefined ? (
                      item.manual_count
                    ) : (
                      <span className="text-zinc-500 italic">Not set</span>
                    )}
                  </div>
                )}
              </div>

              {/* Notes Field */}
              <div>
                <label
                  htmlFor={`notes_${index}`}
                  className="block text-xs font-bold text-sea-gray uppercase mb-2"
                >
                  Notes
                </label>
                {isEditing ? (
                  <textarea
                    id={`notes_${index}`}
                    value={item.notes || ""}
                    onChange={(e) =>
                      onFieldChange(index, "notes", e.target.value)
                    }
                    rows={3}
                    className="w-full p-2 text-sm border border-zinc-600 rounded-md bg-zinc-800 text-white focus:ring-2 focus:ring-sea-gold focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Add notes here..."
                  />
                ) : (
                  <div className="text-sm text-white pl-1 whitespace-pre-wrap">
                    {item.notes || (
                      <span className="text-zinc-500 italic">
                        No notes added
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}