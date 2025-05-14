
import { SettingsData, WorkItem, AzureDevOpsApiResponse, ApiError, Task, StoryType } from "../types/azure-devops";

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

/**
 * Apply a set of tasks to multiple work items
 * @param settings The Azure DevOps settings
 * @param workItemIds Array of work item IDs to apply tasks to
 * @param tasks Array of tasks to create for each work item
 * @returns Array of API responses, one per created task
 */
export async function applyTasksToWorkItems(
  settings: SettingsData, 
  workItemIds: number[], 
  tasks: Task[]
): Promise<AzureDevOpsApiResponse[]> {
  try {
    console.log(`Applying ${tasks.length} tasks to ${workItemIds.length} work items`);
    console.log(`Organization: ${settings.organization}`);
    console.log(`Project: ${settings.project}`);
    
    let allResponses: AzureDevOpsApiResponse[] = [];
    
    // For each work item ID, create all the tasks
    for (const workItemId of workItemIds) {
      console.log(`Creating tasks for work item ${workItemId}`);
      const responses = await createChildTasks(settings, workItemId, tasks);
      allResponses = [...allResponses, ...responses];
    }
    
    return allResponses;
  } catch (error) {
    console.error("Error applying tasks to work items:", error);
    throw {
      message: error instanceof Error ? error.message : "Unknown error occurred",
      statusCode: 500
    } as ApiError;
  }
}
