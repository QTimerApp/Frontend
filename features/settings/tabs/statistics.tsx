"use client";

import { useSettingsStore } from "@/lib/stores/useSettings";
import { SettingRow } from "@/features/settings/Row";
import { Section } from "@/features/settings/Section";
import { Toggle } from "@/components/ui/Toggle";
import type { Settings } from "@/types/settings";

export function StatisticsTab() {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  function toggleStat(key: keyof Settings, value: boolean) {
    updateSettings({ [key]: value } as Partial<Settings>);
  }

  return (
    <div>
      <Section title="Visible Averages">
        <SettingRow label="Ao5" description="Average of 5">
          <Toggle value={settings.displayStatAo5} onChange={(v) => toggleStat("displayStatAo5", v)} id="stat-ao5" />
        </SettingRow>
        <div className="h-px bg-border/10 mx-4" />
        <SettingRow label="Ao12" description="Average of 12">
          <Toggle value={settings.displayStatAo12} onChange={(v) => toggleStat("displayStatAo12", v)} id="stat-ao12" />
        </SettingRow>
        <div className="h-px bg-border/10 mx-4" />
        <SettingRow label="Ao50" description="Average of 50">
          <Toggle value={settings.displayStatAo50} onChange={(v) => toggleStat("displayStatAo50", v)} id="stat-ao50" />
        </SettingRow>
        <div className="h-px bg-border/10 mx-4" />
        <SettingRow label="Ao100" description="Average of 100">
          <Toggle value={settings.displayStatAo100} onChange={(v) => toggleStat("displayStatAo100", v)} id="stat-ao100" />
        </SettingRow>
      </Section>
    </div>
  );
}
