
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

    const selectedConfig = projectConfigs.find(pc => pc.id === projectConfigId);
    if (!selectedConfig && projectConfigs.length > 0) {
      toast.error("Please select a project configuration");
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
      // Use the selected project config or fall back to the global settings
      const configToUse = selectedConfig 
        ? {
            ...settings,
            organization: selectedConfig.organization,
            project: selectedConfig.project,
            path: selectedConfig.path
          }
        : settings;

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
        <CardTitle>Apply Task Breakdown to Work Items</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {projectConfigs.length > 0 && (
            <div className="space-y-2">
              <label className="font-medium text-sm" htmlFor="projectConfig">Project Configuration</label>
              <Select
                value={projectConfigId}
                onValueChange={setProjectConfigId}
              >
                <SelectTrigger id="projectConfig">
                  <SelectValue placeholder="Select project configuration" />
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
                Select which project configuration to use
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="storyType">Story Type</label>
            <Select 
              value={storyTypeId} 
              onValueChange={value => setStoryTypeId(value)}
            >
              <SelectTrigger id="storyType">
                <SelectValue placeholder="Select story type" />
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
          
          <WorkItemIdChips
            ids={workItemIds}
            onIdsChange={setWorkItemIds}
            placeholder="Type work item ID and press Enter"
          />
          
          <Button 
            type="submit" 
            className="w-full bg-azure hover:bg-azure-light" 
            disabled={loading || !isConfigured || !storyTypeId || workItemIds.length === 0}
          >
            {loading ? "Applying..." : "Apply Tasks to Work Items"}
          </Button>
          
          {!isConfigured && (
            <p className="text-center text-sm text-muted-foreground">
              Please configure your Azure DevOps settings first.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
