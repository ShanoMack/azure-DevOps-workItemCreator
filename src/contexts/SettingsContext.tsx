
import React, { createContext, useContext, useState, useEffect } from "react";
import { SettingsData } from "../types/azure-devops";

interface SettingsContextType {
  settings: SettingsData;
  updateSettings: (newSettings: SettingsData) => void;
  isConfigured: boolean;
}

const defaultSettings: SettingsData = {
  personalAccessToken: "",
  organization: "",
  project: "",
  team: "",
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  isConfigured: false,
});

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsData>(() => {
    const savedSettings = localStorage.getItem("ado-settings");
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    localStorage.setItem("ado-settings", JSON.stringify(settings));
    
    // Check if the required settings are filled
    setIsConfigured(
      !!settings.personalAccessToken &&
      !!settings.organization &&
      !!settings.project
    );
  }, [settings]);

  const updateSettings = (newSettings: SettingsData) => {
    setSettings(newSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isConfigured }}>
      {children}
    </SettingsContext.Provider>
  );
}
