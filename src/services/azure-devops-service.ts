
import { SettingsData, WorkItem, AzureDevOpsApiResponse, ApiError, Task } from "../types/azure-devops";

export async function createWorkItem(
  settings: SettingsData,
  workItem: WorkItem
): Promise<AzureDevOpsApiResponse> {
  try {
    // Base64 encode the PAT with empty username (standard for Azure DevOps)
    const encodedPat = btoa(`:${settings.personalAccessToken}`);
    
    // Construct the API URL
    const apiUrl = `https://dev.azure.com/${settings.organization}/${settings.project}/_apis/wit/workitems/$${workItem.itemType}?api-version=6.0`;
    
    console.log(`Creating ${workItem.itemType} in Azure DevOps`);
    console.log(`Organization: ${settings.organization}`);
    console.log(`Project: ${settings.project}`);
    console.log(`Title: ${workItem.title}`);
    
    if (workItem.parentId) {
      console.log(`Parent ID: ${workItem.parentId}`);
    }
    
    // Simulate a successful API response
    return {
      id: Math.floor(Math.random() * 10000),
      url: `https://dev.azure.com/${settings.organization}/${settings.project}/_workitems/edit/${Math.floor(Math.random() * 10000)}`,
      fields: {
        "System.Title": workItem.title,
        "System.Description": workItem.description,
        "System.State": "New"
      },
      success: true
    };
  } catch (error) {
    console.error("Error creating work item:", error);
    throw {
      message: error instanceof Error ? error.message : "Unknown error occurred",
      statusCode: 500
    } as ApiError;
  }
}

export async function createChildTasks(
  settings: SettingsData,
  parentId: number,
  tasks: Task[]
): Promise<AzureDevOpsApiResponse[]> {
  try {
    console.log(`Creating ${tasks.length} tasks for parent ID: ${parentId}`);
    
    // In a real implementation, we would loop through the tasks and create them
    const responses = tasks.map(task => {
      return {
        id: Math.floor(Math.random() * 10000),
        url: `https://dev.azure.com/${settings.organization}/${settings.project}/_workitems/edit/${Math.floor(Math.random() * 10000)}`,
        fields: {
          "System.Title": task.name,
          "System.Description": "",
          "System.State": "New"
        },
        success: true
      };
    });
    
    return responses;
  } catch (error) {
    console.error("Error creating child tasks:", error);
    throw {
      message: error instanceof Error ? error.message : "Unknown error occurred",
      statusCode: 500
    } as ApiError;
  }
}

export async function createBulkWorkItems(
  settings: SettingsData,
  parentId: number | undefined,
  itemType: WorkItem["itemType"],
  titles: string[]
): Promise<AzureDevOpsApiResponse[]> {
  try {
    console.log(`Creating ${titles.length} ${itemType}s${parentId ? ` with parent ID: ${parentId}` : ''}`);
    
    // In a real implementation, we would loop through the titles and create them
    const responses = titles.map(title => {
      return {
        id: Math.floor(Math.random() * 10000),
        url: `https://dev.azure.com/${settings.organization}/${settings.project}/_workitems/edit/${Math.floor(Math.random() * 10000)}`,
        fields: {
          "System.Title": title,
          "System.Description": "",
          "System.State": "New"
        },
        success: true
      };
    });
    
    return responses;
  } catch (error) {
    console.error("Error creating bulk work items:", error);
    throw {
      message: error instanceof Error ? error.message : "Unknown error occurred",
      statusCode: 500
    } as ApiError;
  }
}
