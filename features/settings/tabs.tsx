"use client";

import { SettingsTab } from "@/types/settings";
import { GeneralTab } from "./tabs/general";
import { TimerTab } from "./tabs/timer";
import { ScrambleTab } from "./tabs/scramble";
import { SessionTab } from "./tabs/session";
import { StatisticsTab } from "./tabs/statistics";
import { NotificationsTab } from "./tabs/notifications";
import { ThemesTab } from "./tabs/themes";

export const TAB_COMPONENTS: Record<SettingsTab, React.FC> = {
  [SettingsTab.General]: GeneralTab,
  [SettingsTab.Themes]: ThemesTab,
  [SettingsTab.Timer]: TimerTab,
  [SettingsTab.Scramble]: ScrambleTab,
  [SettingsTab.Session]: SessionTab,
  [SettingsTab.Statistics]: StatisticsTab,
  [SettingsTab.Notifications]: NotificationsTab,
};
