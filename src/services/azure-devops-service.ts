
import { SettingsData, WorkItem, AzureDevOpsApiResponse, ApiError } from "../types/azure-devops";

export async function createWorkItem(
  settings: SettingsData,
  workItem: WorkItem
): Promise<AzureDevOpsApiResponse> {
  try {
    // In a real implementation, this would make an actual API call to Azure DevOps
    // For now, we'll simulate the API call
    
    // Base64 encode the PAT with empty username (standard for Azure DevOps)
    const encodedPat = btoa(`:${settings.personalAccessToken}`);
    
    // Construct the API URL
    const apiUrl = `https://dev.azure.com/${settings.organization}/${settings.project}/_apis/wit/workitems/$${workItem.itemType}?api-version=6.0`;
    
    // This is where you would make the actual API call
    // For demonstration, we'll simulate a successful response
    
    console.log(`Creating ${workItem.itemType} in Azure DevOps`);
    console.log(`Organization: ${settings.organization}`);
    console.log(`Project: ${settings.project}`);
    console.log(`Title: ${workItem.title}`);
    
    // In a real implementation, this would be the actual API call:
    /*
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json-patch+json",
        "Authorization": `Basic ${encodedPat}`
      },
      body: JSON.stringify([
        {
          op: "add",
          path: "/fields/System.Title",
          value: workItem.title
        },
        {
          op: "add",
          path: "/fields/System.Description",
          value: workItem.description
        },
        {
          op: "add",
          path: "/fields/Microsoft.VSTS.Common.AcceptanceCriteria",
          value: workItem.acceptanceCriteria
        }
      ])
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
    */
    
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
