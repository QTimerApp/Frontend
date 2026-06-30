"use client";

import { useSettingsStore } from "@/lib/stores/useSettings";
import { SettingRow } from "@/features/settings/Row";
import { Section } from "@/features/settings/Section";
import { Toggle } from "@/components/ui/Toggle";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { SolvesGroupSize } from "@/types/settings";

export function SessionTab() {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  return (
    <div>
      <Section title="Behavior">
        <SettingRow label="Confirm before deleting" description="Show confirmation dialog on delete">
          <Toggle value={settings.confirmDelete} onChange={(v) => updateSettings({ confirmDelete: v })} id="confirm-delete" />
        </SettingRow>
        <div className="h-px bg-border/10 mx-4" />
        <SettingRow label="Solve group size" description="How many solves per average in the solves list">
          <CustomSelect value={String(settings.solvesGroupSize)} options={[
            { label: "Ao5", value: String(SolvesGroupSize.Ao5) },
            { label: "Ao12", value: String(SolvesGroupSize.Ao12) },
            { label: "Ao50", value: String(SolvesGroupSize.Ao50) },
            { label: "Ao100", value: String(SolvesGroupSize.Ao100) },
            { label: "Off", value: String(SolvesGroupSize.Off) },
          ]} onChange={(v) => updateSettings({ solvesGroupSize: v === "off" ? "off" : Number(v) as SolvesGroupSize })} />
        </SettingRow>
        <div className="h-px bg-border/10 mx-4" />
        <SettingRow label="Auto-collapse averages" description="Start with average groups collapsed">
          <Toggle value={settings.autoCollapseAverages} onChange={(v) => updateSettings({ autoCollapseAverages: v })} id="auto-collapse" />
        </SettingRow>
      </Section>
    </div>
  );
}
