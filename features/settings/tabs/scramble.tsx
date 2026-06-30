"use client";

import { useSettingsStore } from "@/lib/stores/useSettings";
import { SettingRow } from "@/features/settings/Row";
import { Section } from "@/features/settings/Section";
import { Toggle } from "@/components/ui/Toggle";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { ScrambleImageSize } from "@/types/settings";

export function ScrambleTab() {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  return (
    <div>
      <Section title="Display">
        <SettingRow label="Show 2D preview" description="Visual scramble representation">
          <Toggle value={settings.showScrambleImage} onChange={(v) => updateSettings({ showScrambleImage: v })} id="show-scramble" />
        </SettingRow>
        <div className="h-px bg-border/10 mx-4" />
        <SettingRow label="Preview size" description="Size of the visual scramble">
          <CustomSelect value={settings.scrambleImageSize} options={[
            { label: "Small", value: ScrambleImageSize.Small },
            { label: "Medium", value: ScrambleImageSize.Medium },
            { label: "Large", value: ScrambleImageSize.Large },
          ]} onChange={(v) => updateSettings({ scrambleImageSize: v as ScrambleImageSize })} />
        </SettingRow>
        <div className="h-px bg-border/10 mx-4" />
        <SettingRow label="Multi-line scrambles" description="Split long scrambles across lines for big cubes and Megaminx">
          <Toggle value={settings.multiline} onChange={(v) => updateSettings({ multiline: v, rainbowScramble: v ? settings.rainbowScramble : false })} id="multiline" />
        </SettingRow>
        <div className="h-px bg-border/10 mx-4" />
        <SettingRow label="Rainbow lines" description="Color each line differently so you don't get lost on long scrambles">
          <Toggle value={settings.rainbowScramble} onChange={(v) => updateSettings({ rainbowScramble: v })} id="rainbow-scramble" disabled={!settings.multiline} />
        </SettingRow>
      </Section>
    </div>
  );
}
