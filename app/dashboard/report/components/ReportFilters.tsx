
import { ChangeEvent, FormEvent, useState } from "react";
import { AuthUser, FiltersState } from "../types";
import { PRESET_RANGES, toDateInputValue } from "../utils";
import { motion, AnimatePresence } from "framer-motion";

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

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
);

export default function ReportFilters({
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
    <div className="space-y-4">
      {/* Header / Toggle Bar */}
      <div className="flex items-center justify-between gap-3">
        {/* Quick Presets (Always Visible) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 mask-linear-fade">
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

        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
            isOpen || isFiltered 
              ? "bg-sea-sub-blue text-sea-gold border-sea-gold/50" 
              : "bg-transparent text-sea-light-gray border-transparent hover:bg-sea-blue/30"
          }`}
        >
          <FilterIcon />
          <span className="hidden sm:inline">Filters</span>
          <ChevronDown className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Collapsible Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={(e) => { e.preventDefault(); onApplyFilters(e); setIsOpen(false); }}
            className="overflow-hidden"
          >
            <div className="bg-sea-blue/20 border border-sea-blue/50 rounded-2xl p-4 sm:p-5 space-y-5 backdrop-blur-sm shadow-inner">
              
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {/* User Select */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-sea-gold font-semibold">
                    <UserIcon /> User
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
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-sea-light-gray pointer-events-none w-4 h-4" />
                  </div>
                </div>

                {/* Start Date */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-sea-gold font-semibold">
                    <CalendarIcon /> From
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
                    <CalendarIcon /> To
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

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3 border-t border-white/5">
                <button
                  type="submit"
                  disabled={fetching || dateMismatch}
                  className="flex-1 bg-sea-gold text-sea-blue font-bold px-4 py-2.5 rounded-xl hover:bg-yellow-500 transition-all shadow-lg shadow-sea-gold/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {fetching ? "Applying..." : "Apply Filters"}
                </button>
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium text-sea-light-gray hover:text-white hover:bg-white/5 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
