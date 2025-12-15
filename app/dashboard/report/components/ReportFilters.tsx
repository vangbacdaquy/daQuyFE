
import { ChangeEvent, FormEvent, useState, memo } from "react";
import { AuthUser, FiltersState } from "../types";
import { PRESET_RANGES, toDateInputValue } from "../utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Filter, 
  Calendar, 
  User, 
  ChevronDown, 
  RotateCcw 
} from "lucide-react";

interface ReportFiltersProps {
  filters: FiltersState;
  fetching: boolean;
  users: AuthUser[];
  onInputChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onApplyFilters: (event: FormEvent<HTMLFormElement>) => void;
  onResetFilters: () => void;
  onApplyPresetRange: (days: number) => void;
  dateMismatch: boolean;
}

const ReportFilters = memo(function ReportFilters({
  filters,
  fetching,
  users,
  onInputChange,
  onApplyFilters,
  onResetFilters,
  onApplyPresetRange,
  dateMismatch,
}: ReportFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Check if current filters differ from defaults (basic logic)
  const isFiltered = filters.userEmail !== "";

  return (
    <>
      {/* Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-sea-blue/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="sticky top-16 z-40 -mx-4 sm:-mx-6 mb-6">
        {/* Header / Toggle Bar */}
        <div className="bg-sea-sub-blue/95 backdrop-blur-md border-y border-sea-blue/50 py-3 px-4 sm:px-6 flex items-center justify-between gap-3 shadow-md transition-all relative z-50">
          {/* Quick Presets (Always Visible) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mask-linear-fade flex-1">
            {PRESET_RANGES.map((preset) => {
              const end = new Date();
              const start = new Date();
              start.setDate(start.getDate() - preset.days);
              const matchesCurrent =
                filters.startDate === toDateInputValue(start) && filters.endDate === toDateInputValue(end);

              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onApplyPresetRange(preset.days)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                    matchesCurrent
                      ? "bg-sea-gold text-sea-blue border-sea-gold shadow-[0_0_10px_rgba(255,215,0,0.3)]"
                      : "bg-sea-blue/30 border-sea-blue text-sea-light-gray hover:border-sea-gold/50 hover:text-white"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Actions: Reset & Toggle */}
          <div className="flex items-center gap-2 shrink-0 ml-2">
             <button
                type="button"
                onClick={onResetFilters}
                className="p-2 rounded-lg text-sea-light-gray hover:text-white hover:bg-white/5 transition-colors group"
                title="Reset Filters"
             >
                <RotateCcw size={18} className="transition-transform group-hover:-rotate-180" />
             </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                isOpen || isFiltered 
                  ? "bg-sea-sub-blue text-sea-gold border-sea-gold/50" 
                  : "bg-transparent text-sea-light-gray border-transparent hover:bg-sea-blue/30"
              }`}
            >
              <Filter size={16} />
              <span className="hidden sm:inline">Filters</span>
              <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={(e) => { e.preventDefault(); /* Auto-apply handles fetch */ }}
              className="overflow-hidden bg-sea-blue/90 border-b border-sea-blue/50 backdrop-blur-md shadow-lg"
            >
              <div className="p-4 sm:p-5 pb-6 space-y-5">
                
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {/* User Select */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-sea-gold font-semibold">
                      <User size={14} /> User
                    </label>
                    <div className="relative">
                      <select
                        name="userEmail"
                        value={filters.userEmail}
                        onChange={onInputChange}
                        className="w-full appearance-none bg-sea-sub-blue/50 border border-sea-blue rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sea-gold focus:ring-1 focus:ring-sea-gold transition-colors cursor-pointer"
                      >
                        <option value="">All Users</option>
                        {users.map((user) => (
                          <option key={user.uid} value={user.email!}>
                            {user.displayName || user.email}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-sea-light-gray pointer-events-none" />
                    </div>
                  </div>

                  {/* Start Date */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-sea-gold font-semibold">
                      <Calendar size={14} /> From
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      max={filters.endDate || undefined}
                      onChange={onInputChange}
                      className="w-full bg-sea-sub-blue/50 border border-sea-blue rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sea-gold focus:ring-1 focus:ring-sea-gold transition-colors [color-scheme:dark]"
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-sea-gold font-semibold">
                      <Calendar size={14} /> To
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={filters.endDate}
                      min={filters.startDate || undefined}
                      onChange={onInputChange}
                      className="w-full bg-sea-sub-blue/50 border border-sea-blue rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sea-gold focus:ring-1 focus:ring-sea-gold transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </>
  );
});

export default ReportFilters;
