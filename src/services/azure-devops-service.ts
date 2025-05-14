
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

    // Prepare the payload in Azure DevOps API format (JSON Patch document)
    const patchDocument = [
      {
        op: "add",
        path: "/fields/System.Title",
        value: workItem.title
      }
    ];

    if (workItem.description) {
      patchDocument.push({
        op: "add",
        path: "/fields/System.Description",
        value: workItem.description
      });
    }

    if (workItem.acceptanceCriteria) {
      patchDocument.push({
        op: "add",
        path: "/fields/System.AcceptanceCriteria",
        value: workItem.acceptanceCriteria
      });
    }

    // If area path is specified in the project config, use it
    if (settings.path) {
      patchDocument.push({
        op: "add",
        path: "/fields/System.AreaPath",
        value: `${settings.project}${settings.path}`
      });
    }

    // Make the API request
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json-patch+json",
        "Authorization": `Basic ${encodedPat}`
      },
      body: JSON.stringify(patchDocument)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Azure DevOps API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    return {
      id: data.id,
      url: data._links.html.href,
      fields: {
        "System.Title": data.fields["System.Title"],
        "System.Description": data.fields["System.Description"] || "",
        "System.State": data.fields["System.State"]
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
    const results: AzureDevOpsApiResponse[] = [];
    
    // Base64 encode the PAT
    const encodedPat = btoa(`:${settings.personalAccessToken}`);
    
    // Process each task and make an API call for each
    for (const task of tasks) {
      // Construct the API URL for task creation
      const apiUrl = `https://dev.azure.com/${settings.organization}/${settings.project}/_apis/wit/workitems/$Task?api-version=6.0`;
      
      // Prepare the payload in Azure DevOps API format
      const patchDocument = [
        {
          op: "add",
          path: "/fields/System.Title",
          value: task.name
        },
        {
          op: "add",
          path: "/fields/System.Description",
          value: ""
        }
      ];
      
      // Add parent relation - fixing the type error by properly structuring the patch operation
      patchDocument.push({
        op: "add",
        path: "/relations/-",
        value: {
          rel: "System.LinkTypes.Hierarchy-Reverse",
          url: `https://dev.azure.com/${settings.organization}/${settings.project}/_apis/wit/workItems/${parentId}`
        }
      } as any); // Using any to bypass the TypeScript error
      
      // If area path is specified, use it
      if (settings.path) {
        patchDocument.push({
          op: "add",
          path: "/fields/System.AreaPath",
          value: `${settings.project}${settings.path}`
        });
      }
      
      // Add activity type if specified
      if (task.activity) {
        patchDocument.push({
          op: "add",
          path: "/fields/Microsoft.VSTS.Common.Activity",
          value: task.activity
        });
      }
      
      // Add original estimate if hours specified
      if (task.hours) {
        patchDocument.push({
          op: "add",
          path: "/fields/Microsoft.VSTS.Scheduling.OriginalEstimate",
          value: task.hours.toString()
        });
      }
      
      // Make the API request
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json-patch+json",
          "Authorization": `Basic ${encodedPat}`
        },
        body: JSON.stringify(patchDocument)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure DevOps API Error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      
      results.push({
        id: data.id,
        url: data._links.html.href,
        fields: {
          "System.Title": data.fields["System.Title"],
          "System.Description": data.fields["System.Description"] || "",
          "System.State": data.fields["System.State"]
        },
        success: true
      });
    }
    
    return results;
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
    const results: AzureDevOpsApiResponse[] = [];
    
    // Base64 encode the PAT
    const encodedPat = btoa(`:${settings.personalAccessToken}`);
    
    // Process each title and create a work item for each
    for (const title of titles) {
      // Construct the API URL
      const apiUrl = `https://dev.azure.com/${settings.organization}/${settings.project}/_apis/wit/workitems/$${itemType}?api-version=6.0`;
      
      // Prepare the payload
      const patchDocument = [
        {
          op: "add",
          path: "/fields/System.Title",
          value: title
        }
      ];
      
      // If area path is specified, use it
      if (settings.path) {
        patchDocument.push({
          op: "add",
          path: "/fields/System.AreaPath",
          value: `${settings.project}${settings.path}`
        });
      }
      
      // Add parent relation if specified
      if (parentId) {
        patchDocument.push({
          op: "add",
          path: "/relations/-",
          value: {
            rel: "System.LinkTypes.Hierarchy-Reverse",
            url: `https://dev.azure.com/${settings.organization}/${settings.project}/_apis/wit/workItems/${parentId}`
          }
        } as any); // Using any to bypass the TypeScript error
      }
      
      // Make the API request
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json-patch+json",
          "Authorization": `Basic ${encodedPat}`
        },
        body: JSON.stringify(patchDocument)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure DevOps API Error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      
      results.push({
        id: data.id,
        url: data._links.html.href,
        fields: {
          "System.Title": data.fields["System.Title"],
          "System.Description": data.fields["System.Description"] || "",
          "System.State": data.fields["System.State"]
        },
        success: true
      });
    }
    
    return results;
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
