"use client";

import { useSettingsStore } from "@/lib/stores/useSettings";
import { SettingRow } from "@/features/settings/Row";
import { Section } from "@/features/settings/Section";
import { Toggle } from "@/components/ui/Toggle";

export function GeneralTab() {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  return (
    <div>
      <Section title="Display">
        <SettingRow label="Show stats panel" description="Display statistics below the timer">
          <Toggle value={settings.showStatsPanel} onChange={(v) => updateSettings({ showStatsPanel: v })} id="show-stats-panel" />
        </SettingRow>
        <div className="h-px bg-border/10 mx-4" />
        <SettingRow label="Hide time during solve" description="Blindfold training mode">
          <Toggle value={settings.hideTimeDuringSolve} onChange={(v) => updateSettings({ hideTimeDuringSolve: v })} id="hide-time" />
        </SettingRow>
      </Section>
    </div>
  );
}
