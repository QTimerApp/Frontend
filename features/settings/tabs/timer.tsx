"use client";

import { useSettingsStore } from "@/lib/stores/useSettings";
import { SettingRow } from "@/features/settings/Row";
import { Section } from "@/features/settings/Section";
import { Toggle } from "@/components/ui/Toggle";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { InspectionMode, TimerActivation, StartDelay } from "@/types/settings";

export function TimerTab() {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  return (
    <div>
      <Section title="Controls">
        <SettingRow label="Manual entry" description="Type in times manually (e.g. 357, 1:23.45)">
          <Toggle value={settings.manualEntry} onChange={(v) => updateSettings({ manualEntry: v })} id="manual-entry" />
        </SettingRow>
        <div className="h-px bg-border/10 mx-4" />
        <SettingRow label="Timer activation" description="How to start and stop the timer">
          <CustomSelect value={settings.timerActivation} options={[
            { label: "Spacebar", value: TimerActivation.Spacebar },
            { label: "Click / Tap", value: TimerActivation.Click },
            { label: "Both", value: TimerActivation.Tap },
          ]} onChange={(v) => updateSettings({ timerActivation: v as TimerActivation })} />
        </SettingRow>
        <div className="h-px bg-border/10 mx-4" />
        <SettingRow label="Start delay" description="Delay before timer starts after releasing space">
          <CustomSelect value={settings.startDelay} options={[
            { label: "Off", value: StartDelay.Off },
            { label: "150ms", value: StartDelay.Ms150 },
            { label: "300ms", value: StartDelay.Ms300 },
            { label: "500ms", value: StartDelay.Ms500 },
          ]} onChange={(v) => updateSettings({ startDelay: v as StartDelay })} />
        </SettingRow>
        <div className="h-px bg-border/10 mx-4" />
        <SettingRow label="Sound effects" description="Beeps for timer start and inspection">
          <Toggle value={settings.soundEnabled} onChange={(v) => updateSettings({ soundEnabled: v })} id="sound-enabled" />
        </SettingRow>
        <div className="h-px bg-border/10 mx-4" />
        <SettingRow label="Auto-start" description="Start timer automatically after scramble appears">
          <Toggle value={settings.autoStart} onChange={(v) => updateSettings({ autoStart: v })} id="auto-start" />
        </SettingRow>
      </Section>
      <Section title="Inspection">
        <SettingRow label="Inspection time" description="WCA-style inspection countdown">
          <CustomSelect value={settings.inspection} options={[
            { label: "Off", value: InspectionMode.Off },
            { label: "15 seconds", value: InspectionMode.FifteenSeconds },
          ]} onChange={(v) => updateSettings({ inspection: v as InspectionMode })} />
        </SettingRow>
      </Section>
      <Section title="Multiphase">
        <SettingRow label="Split phases" description="Divide a solve into timed segments (press Space during solve)">
          <CustomSelect value={String(settings.multiphase)} options={[
            { label: "Off", value: "0" },
            { label: "2 phases", value: "2" },
            { label: "3 phases", value: "3" },
            { label: "4 phases", value: "4" },
            { label: "5 phases", value: "5" },
          ]} onChange={(v) => updateSettings({ multiphase: parseInt(v, 10) })} />
        </SettingRow>
      </Section>
    </div>
  );
}
