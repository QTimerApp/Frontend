"use client";

import { useSettingsStore } from "@/lib/stores/useSettings";
import { SettingRow } from "@/features/settings/Row";
import { Section } from "@/features/settings/Section";
import { Toggle } from "@/components/ui/Toggle";

export function NotificationsTab() {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  return (
    <div>
      <Section title="Solve Milestones">
        <SettingRow label="New personal best" description="Toast when you beat your best time">
          <Toggle value={settings.notifyPB} onChange={(v) => updateSettings({ notifyPB: v })} id="notify-pb" />
        </SettingRow>
        <div className="h-px bg-border/10 mx-4" />
        <SettingRow label="New worst solve" description="Toast when you get your worst time">
          <Toggle value={settings.notifyWorstSolve} onChange={(v) => updateSettings({ notifyWorstSolve: v })} id="notify-worst" />
        </SettingRow>
        <div className="h-px bg-border/10 mx-4" />
        <SettingRow label="New best average" description="Toast when you set a new best Ao5/Ao12/Ao50/Ao100">
          <Toggle value={settings.notifyBestAverage} onChange={(v) => updateSettings({ notifyBestAverage: v })} id="notify-avg" />
        </SettingRow>
      </Section>
      <Section title="General">
        <SettingRow label="Settings changed" description="Toast when settings are saved">
          <Toggle value={settings.notifySettingsChange} onChange={(v) => updateSettings({ notifySettingsChange: v })} id="notify-settings" />
        </SettingRow>
      </Section>
    </div>
  );
}
