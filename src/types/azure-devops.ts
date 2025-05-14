
export interface SettingsData {
  personalAccessToken: string;
  organization: string;
  project: string;
  team?: string;
  path?: string;
  projectConfigs?: ProjectConfig[];
}

export interface ProjectConfig {
  id: string;
  name: string;
  organization: string;
  project: string;
  path: string;
}

export interface WorkItem {
  title: string;
  description: string;
  acceptanceCriteria: string;
  itemType: "Feature" | "Product Backlog Item" | "Bug" | "Task" | "Epic";
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
