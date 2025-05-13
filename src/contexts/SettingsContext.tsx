
import React, { createContext, useContext, useState, useEffect } from "react";
import { SettingsData, ProjectConfig, StoryType, Task } from "../types/azure-devops";
import { v4 as uuidv4 } from "uuid";

interface SettingsContextType {
  settings: SettingsData;
  updateSettings: (newSettings: SettingsData) => void;
  isConfigured: boolean;
  projectConfigs: ProjectConfig[];
  addProjectConfig: (config: Omit<ProjectConfig, "id">) => void;
  updateProjectConfig: (config: ProjectConfig) => void;
  deleteProjectConfig: (id: string) => void;
  selectProjectConfig: (id: string) => void;
  selectedProjectConfig: ProjectConfig | null;
  storyTypes: StoryType[];
  addStoryType: (storyType: Omit<StoryType, "id">) => void;
  updateStoryType: (storyType: StoryType) => void;
  deleteStoryType: (id: string) => void;
}

const defaultSettings: SettingsData = {
  personalAccessToken: "",
  organization: "",
  project: "",
  team: "",
  projectConfigs: [],
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  isConfigured: false,
  projectConfigs: [],
  addProjectConfig: () => {},
  updateProjectConfig: () => {},
  deleteProjectConfig: () => {},
  selectProjectConfig: () => {},
  selectedProjectConfig: null,
  storyTypes: [],
  addStoryType: () => {},
  updateStoryType: () => {},
  deleteStoryType: () => {},
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
  const [projectConfigs, setProjectConfigs] = useState<ProjectConfig[]>(() => {
    const savedConfigs = localStorage.getItem("ado-project-configs");
    return savedConfigs ? JSON.parse(savedConfigs) : [];
  });
  
  const [selectedProjectConfig, setSelectedProjectConfig] = useState<ProjectConfig | null>(null);
  
  const [storyTypes, setStoryTypes] = useState<StoryType[]>(() => {
    const savedStoryTypes = localStorage.getItem("ado-story-types");
    return savedStoryTypes ? JSON.parse(savedStoryTypes) : [];
  });

  useEffect(() => {
    localStorage.setItem("ado-settings", JSON.stringify(settings));
    
    // Check if the required settings are filled
    setIsConfigured(
      !!settings.personalAccessToken &&
      !!settings.organization &&
      !!settings.project
    );
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("ado-project-configs", JSON.stringify(projectConfigs));
  }, [projectConfigs]);
  
  useEffect(() => {
    localStorage.setItem("ado-story-types", JSON.stringify(storyTypes));
  }, [storyTypes]);

  const updateSettings = (newSettings: SettingsData) => {
    setSettings(newSettings);
  };
  
  const addProjectConfig = (config: Omit<ProjectConfig, "id">) => {
    const newConfig = { ...config, id: uuidv4() };
    setProjectConfigs([...projectConfigs, newConfig]);
  };
  
  const updateProjectConfig = (config: ProjectConfig) => {
    setProjectConfigs(projectConfigs.map(c => c.id === config.id ? config : c));
  };
  
  const deleteProjectConfig = (id: string) => {
    setProjectConfigs(projectConfigs.filter(c => c.id !== id));
    if (selectedProjectConfig?.id === id) {
      setSelectedProjectConfig(null);
    }
  };
  
  const selectProjectConfig = (id: string) => {
    const config = projectConfigs.find(c => c.id === id) || null;
    setSelectedProjectConfig(config);
    if (config) {
      setSettings({
        ...settings,
        organization: config.organization,
        project: config.project,
      });
    }
  };
  
  const addStoryType = (storyType: Omit<StoryType, "id">) => {
    const newStoryType = { ...storyType, id: uuidv4() };
    setStoryTypes([...storyTypes, newStoryType]);
  };
  
  const updateStoryType = (storyType: StoryType) => {
    setStoryTypes(storyTypes.map(s => s.id === storyType.id ? storyType : s));
  };
  
  const deleteStoryType = (id: string) => {
    setStoryTypes(storyTypes.filter(s => s.id !== id));
  };

  return (
    <SettingsContext.Provider 
      value={{ 
        settings, 
        updateSettings, 
        isConfigured,
        projectConfigs,
        addProjectConfig,
        updateProjectConfig,
        deleteProjectConfig,
        selectProjectConfig,
        selectedProjectConfig,
        storyTypes,
        addStoryType,
        updateStoryType,
        deleteStoryType
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
