"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useSettingsStore } from "@/lib/stores/useSettings";
import { filterSolves, DEFAULT_FILTERS } from "@/lib/utils/solve-search";
import type { SolveFilters } from "@/types/solve-search";
import { SolveSearchBar } from "./SolveSearchBar";
import { Solve } from "./Solve";
import { Average } from "./Average";
import { useSolveActions } from "@/lib/hooks/useSolveActions";
import { Loading } from "@/components/ui/Loading";
import { useSession } from "@/lib/contexts/Session";

function Solves() {
  const groupSize = useSettingsStore((s) => s.settings.solvesGroupSize);
  const autoCollapse = useSettingsStore((s) => s.settings.autoCollapseAverages);
  const { session, solves } = useSession();
  const [collapsedIndices, setCollapsedIndices] = useState<number[]>([]);
  const [filters, setFilters] = useState<SolveFilters>(DEFAULT_FILTERS);

  const { handleSolveDeleteClick, handleAverageDeleteClick, handleSolveClick, handleAverageClick } =
    useSolveActions(session?.name, session?.eventId);

  const groupSizeRef = useRef(groupSize);
  groupSizeRef.current = groupSize;
  const autoCollapseRef = useRef(autoCollapse);
  autoCollapseRef.current = autoCollapse;

  useEffect(() => {
    setCollapsedIndices([]);
  }, [autoCollapse]);

  const noGrouping = groupSize === "off";

  const solvesReversed = useMemo(() => (solves ? [...solves].reverse() : undefined), [solves]);

  const filteredSolves = useMemo(
    () => (solvesReversed ? filterSolves(solvesReversed, filters) : undefined),
    [solvesReversed, filters]
  );

  const collapsedSet = useMemo(() => new Set(collapsedIndices), [collapsedIndices]);

  const overflow = useMemo(() => {
    if (!filteredSolves || noGrouping) return null;
    const n = groupSize as number;
    const remainder = filteredSolves.length % n;
    return remainder > 0 ? filteredSolves.slice(0, remainder) : null;
  }, [filteredSolves, groupSize, noGrouping]);

  const groups = useMemo(() => {
    if (!filteredSolves || noGrouping) return [];
    const n = groupSize as number;
    const result: { index: number; solves: typeof filteredSolves }[] = [];
    const start = filteredSolves.length % n;
    for (let i = start; i < filteredSolves.length; i += n) {
      result.push({ index: i, solves: filteredSolves.slice(i, i + n) });
    }
    return result;
  }, [filteredSolves, groupSize, noGrouping]);

  const isCollapsed = (index: number) => {
    const inSet = collapsedSet.has(index);
    return autoCollapseRef.current ? !inSet : inSet;
  };

  const toggleCollapsed = (index: number) => {
    const n = groupSizeRef.current;
    if (n === "off") return;
    setCollapsedIndices((prev) =>
      prev.some((i) => index >= i && index < i + n)
        ? prev.filter((i) => index < i || index >= i + n)
        : [...prev, index]
    );
  };

  if (solves === undefined) {
    return <Loading variant="card" />;
  }

  if (solves.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-8">
        <span className="text-xs text-muted">No solves yet</span>
      </div>
    );
  }

  if (noGrouping) {
    return (
      <div className="flex flex-col flex-1 overflow-y-auto">
        <SolveSearchBar filters={filters} onChange={setFilters} resultCount={filteredSolves?.length ?? 0} />
        <div className="flex-1 overflow-y-auto py-2">
              {filteredSolves && filteredSolves.length > 0 ? (
            filteredSolves.map((solve, i) => (
              <Solve
                key={solve.id}
                index={i}
                solve={solve}
                eventId={session?.eventId}
                onDelete={() => handleSolveDeleteClick(solve.id)}
                onSelect={handleSolveClick}
              />
            ))
          ) : (
            <div className="flex items-center justify-center py-8">
              <span className="text-xs text-muted">No solves match filters</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  const n = groupSize as number;

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <SolveSearchBar filters={filters} onChange={setFilters} resultCount={filteredSolves?.length ?? 0} />
      <div className="flex-1 overflow-y-auto py-2">
        {filteredSolves && filteredSolves.length > 0 ? (
          <>
            {overflow &&
              overflow.map((solve, offset) => (
                <Solve
                  key={solve.id}
                  index={offset}
                  solve={solve}
                  eventId={session?.eventId}
                  onDelete={() => handleSolveDeleteClick(solve.id)}
                  onSelect={handleSolveClick}
                />
              ))}
            {overflow && groups.length > 0 && (
              <div className="border-t border-border/30 mx-3 my-1" />
            )}
            {groups.map(({ index: groupIndex, solves: groupSolves }) => (
              <div key={groupIndex}>
                <Average
                  solves={groupSolves}
                  index={groupIndex}
                  groupSize={n}
                  collapsed={isCollapsed(groupIndex)}
                  onToggle={() => toggleCollapsed(groupIndex)}
                  onDelete={() => handleAverageDeleteClick(groupSolves)}
                  onClick={() => handleAverageClick(groupSolves, n)}
                  eventId={session?.eventId}
                />
                {!isCollapsed(groupIndex) &&
                  groupSolves.map((solve, offset) => (
                    <Solve
                      key={solve.id}
                      index={groupIndex + offset}
                      solve={solve}
                      eventId={session?.eventId}
                      onDelete={() => handleSolveDeleteClick(solve.id)}
                      onSelect={handleSolveClick}
                    />
                  ))}
              </div>
            ))}
          </>
        ) : (
          <div className="flex items-center justify-center py-8">
            <span className="text-xs text-muted">No solves match filters</span>
          </div>
        )}
      </div>
    </div>
  );
}

export { Solves };
