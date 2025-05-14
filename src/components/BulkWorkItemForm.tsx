
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkItem } from "@/types/azure-devops";
import { useSettings } from "@/contexts/SettingsContext";
import { createBulkWorkItems } from "@/services/azure-devops-service";
import { toast } from "sonner";

export function BulkWorkItemForm() {
  const { settings, isConfigured, projectConfigs, selectedProjectConfig } = useSettings();
  const [loading, setLoading] = useState(false);
  const [projectConfigId, setProjectConfigId] = useState<string | undefined>(
    selectedProjectConfig?.id || undefined
  );
  
  // For bulk creation
  const [bulkData, setBulkData] = useState({
    parentId: "",
    itemType: "Product Backlog Item" as WorkItem["itemType"],
    titles: ""
  });
  
  const handleBulkInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBulkData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (value: string) => {
    setBulkData(prev => ({
      ...prev,
      itemType: value as WorkItem["itemType"]
    }));
  };
  
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConfigured) {
      toast.error("Please configure Azure DevOps settings first");
      return;
    }
    
    if (!bulkData.titles.trim()) {
      toast.error("Please enter at least one title");
      return;
    }

    const selectedConfig = projectConfigs.find(pc => pc.id === projectConfigId);
    if (!selectedConfig && projectConfigs.length > 0) {
      toast.error("Please select a project configuration");
      return;
    }
    
    const titles = bulkData.titles
      .split("\n")
      .map(line => line.trim())
      .filter(line => line !== "");
    
    if (titles.length === 0) {
      toast.error("Please enter at least one valid title");
      return;
    }
    
    setLoading(true);
    
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

      const parentId = bulkData.parentId ? parseInt(bulkData.parentId) : undefined;
      const results = await createBulkWorkItems(
        configToUse,
        parentId,
        bulkData.itemType,
        titles
      );
      
      toast.success(
        <div className="flex flex-col">
          <span>Successfully created {results.length} work items!</span>
        </div>
      );
      
      setBulkData({
        ...bulkData,
        titles: ""
      });
    } catch (error: any) {
      toast.error(`Failed to create work items: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>Bulk Work Item Creation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleBulkSubmit} className="space-y-6">
          {projectConfigs.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="projectConfig">Project Configuration</Label>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="parentId">Parent ID (Optional)</Label>
              <Input
                id="parentId"
                name="parentId"
                value={bulkData.parentId}
                onChange={handleBulkInputChange}
                placeholder="Enter parent work item ID"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Leave empty if you don't want to link to a parent
              </p>
            </div>
            
            <div>
              <Label htmlFor="itemType">Work Item Type</Label>
              <Select 
                value={bulkData.itemType} 
                onValueChange={handleSelectChange}
              >
                <SelectTrigger id="itemType">
                  <SelectValue placeholder="Select work item type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Feature">Feature</SelectItem>
                  <SelectItem value="Epic">Epic</SelectItem>
                  <SelectItem value="Product Backlog Item">Product Backlog Item</SelectItem>
                  <SelectItem value="Bug">Bug</SelectItem>
                  <SelectItem value="Task">Task</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="titles">Work Item Titles (one per line)</Label>
            <Textarea
              id="titles"
              name="titles"
              value={bulkData.titles}
              onChange={handleBulkInputChange}
              placeholder="Enter each work item title on a new line"
              rows={8}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-azure hover:bg-azure-light" 
            disabled={loading || !isConfigured || !bulkData.titles.trim() || (projectConfigs.length > 0 && !projectConfigId)}
          >
            {loading ? "Creating..." : "Create Work Items"}
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
