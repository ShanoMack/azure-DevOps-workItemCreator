
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StoryType, Task } from "@/types/azure-devops";
import { useSettings } from "@/contexts/SettingsContext";
import { applyTasksToWorkItems } from "@/services/azure-devops-service";
import { toast } from "sonner";
import { WorkItemIdChips } from "./WorkItemIdChips";

export function TaskBreakdownForm() {
  const { settings, isConfigured, storyTypes, projectConfigs, selectedProjectConfig } = useSettings();
  const [loading, setLoading] = useState(false);
  const [storyTypeId, setStoryTypeId] = useState<string | undefined>(undefined);
  const [workItemIds, setWorkItemIds] = useState<string[]>([]);
  const [projectConfigId, setProjectConfigId] = useState<string | undefined>(
    selectedProjectConfig?.id || undefined
  );

  const selectedStoryType = storyTypes.find(s => s.id === storyTypeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConfigured) {
      toast.error("Please configure Azure DevOps settings first");
      return;
    }
    
    if (!storyTypeId) {
      toast.error("Please select a story type");
      return;
    }
    
    if (workItemIds.length === 0) {
      toast.error("Please enter at least one work item ID");
      return;
    }

    if (!projectConfigId) {
      toast.error("Please select a project");
      return;
    }

    const selectedConfig = projectConfigs.find(pc => pc.id === projectConfigId);
    if (!selectedConfig) {
      toast.error("Invalid project name");
      return;
    }
    
    setLoading(true);
    
    const ids = workItemIds.map(id => parseInt(id)).filter(id => !isNaN(id));
    
    if (ids.length === 0) {
      toast.error("No valid work item IDs provided");
      setLoading(false);
      return;
    }
    
    try {
      // Use the selected project config with the global PAT
      const configToUse = {
        personalAccessToken: settings.personalAccessToken,
        organization: selectedConfig.organization,
        project: selectedConfig.project
      };

      const storyType = storyTypes.find(s => s.id === storyTypeId);
      
      if (!storyType) {
        throw new Error("Story type not found");
      }
      
      await applyTasksToWorkItems(configToUse, ids, storyType.tasks);
      
      toast.success(
        <div className="flex flex-col">
          <span>Tasks created successfully!</span>
          <span className="text-sm text-muted-foreground">
            Applied {storyType.tasks.length} tasks to {ids.length} work items
          </span>
        </div>
      );
    } catch (error: any) {
      toast.error(`Failed to create tasks: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>Add tasks to existing working items</CardTitle>
        <CardDescription>Add a batch of predefined tasks to the provided work item IDs based on the selected story type</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-medium text-sm" htmlFor="projectConfig">Project Name</label>
              <Select
                value={projectConfigId}
                onValueChange={setProjectConfigId}
              >
                <SelectTrigger id="projectConfig">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projectConfigs.map(config => (
                    <SelectItem key={config.id} value={config.id}>
                      {config.name} ({config.organization}/{config.project})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                  Select which project the board item(s) will be created within
              </p>
            </div>

            <div className="space-y-2">
              <label className="font-medium text-sm" htmlFor="storyType">Story Type</label>
              <Select 
                value={storyTypeId} 
                onValueChange={value => setStoryTypeId(value)}
              >
                <SelectTrigger id="storyType">
                  <SelectValue placeholder="Select a story type" />
                </SelectTrigger>
                <SelectContent>
                  {storyTypes.map(storyType => (
                    <SelectItem key={storyType.id} value={storyType.id}>
                      {storyType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedStoryType && (
                <p className="text-sm text-muted-foreground">
                  Contains {selectedStoryType.tasks.length} tasks
                </p>
              )}
            </div>
          </div>

          <WorkItemIdChips
            ids={workItemIds}
            onIdsChange={setWorkItemIds}
            placeholder="Type work item ID and press Enter"
          />
          
          <Button 
            type="submit" 
            className="w-full bg-azure hover:bg-azure-light" 
            disabled={loading || !isConfigured || !storyTypeId || workItemIds.length === 0 || !projectConfigId}
          >
            {loading ? "Adding..." : "Add tasks to Work Items"}
          </Button>
          
          {!isConfigured && (
            <p className="text-center text-sm text-muted-foreground">
              {!settings.personalAccessToken ? 
                "Please add your Personal Access Token in settings first." : 
                "Please add at least one project configuration first."}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
