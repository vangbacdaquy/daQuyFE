
import { ChangeEvent, FormEvent } from "react";
import { AuthUser, FiltersState } from "../types";
import { PRESET_RANGES, toDateInputValue } from "../utils";

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
  return (
    <form
      onSubmit={onApplyFilters}
      className="bg-sea-blue/20 border border-sea-blue rounded-2xl p-4 space-y-4"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col">
          <span className="text-xs uppercase tracking-wide text-sea-light-gray mb-1">
            User Email
          </span>
          <select
            name="userEmail"
            value={filters.userEmail}
            onChange={onInputChange}
            className="bg-sea-blue/40 border border-sea-blue rounded-lg px-3 py-2.5 text-white placeholder:text-sea-gray focus:outline-none focus:ring-2 focus:ring-sea-gold"
          >
            <option value="">All Users</option>
            {users.map((user) => (
              <option key={user.uid} value={user.email!}>
                {user.email}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col">
          <span className="text-xs uppercase tracking-wide text-sea-light-gray mb-1">
            Start Date
          </span>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            max={filters.endDate || undefined}
            onChange={onInputChange}
            className="bg-sea-blue/40 border border-sea-blue rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sea-gold"
          />
        </label>
        <label className="flex flex-col">
          <span className="text-xs uppercase tracking-wide text-sea-light-gray mb-1">
            End Date
          </span>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            min={filters.startDate || undefined}
            onChange={onInputChange}
            className="bg-sea-blue/40 border border-sea-blue rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sea-gold"
          />
        </label>
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wide text-sea-light-gray">Quick range</span>
          <div className="flex flex-wrap gap-2">
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
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                    matchesCurrent
                      ? "bg-sea-gold text-sea-blue border-sea-gold"
                      : "border-sea-blue text-sea-light-gray hover:border-sea-gold"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="submit"
          disabled={fetching || dateMismatch}
          className="w-full bg-sea-gold text-sea-blue font-semibold px-4 py-2.5 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Apply Filters
        </button>
        <button
          type="button"
          onClick={onResetFilters}
          className="w-full border border-sea-gray text-sea-light-gray px-4 py-2.5 rounded-lg hover:border-sea-gold hover:text-white transition-colors"
        >
          Reset
        </button>
      </div>
    </form>
  );
}
