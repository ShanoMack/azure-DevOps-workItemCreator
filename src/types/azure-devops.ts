
export interface SettingsData {
  personalAccessToken: string;
  organization: string;
  project: string;
  team?: string;
  projectConfigs?: ProjectConfig[];
}

export interface ProjectConfig {
  id: string;
  name: string;
  organization: string;
  project: string;
}

export interface WorkItem {
  title: string;
  description: string;
  acceptanceCriteria: string;
  itemType:
  | "Bug"
  | "Bug QA"
  | "Bug Staging"
  | "Epic"
  | "Feature"
  | "Impediment"
  | "Ops Epic"
  | "Ops Feature"
  | "PBI Defect"
  | "PBI Feature"
  | "PBI Hotfix"
  | "PBI Spike"
  | "Product Backlog Item"
  | "Task"
  | "Theme"
  | "Untracked Epic"
  | "Untracked Feature"
  | "User Story";
  parentId?: number;
}

export interface Task {
  id: string;
  name: string;
  activity: string;
  hours: number;
}

export interface StoryType {
  id: string;
  name: string;
  workItemType: WorkItem["itemType"];
  tasks: Task[];
}

export interface AzureDevOpsApiResponse {
  id: number;
  url: string;
  fields: {
    "System.Title": string;
    "System.Description": string;
    "System.State": string;
  };
  success?: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}
