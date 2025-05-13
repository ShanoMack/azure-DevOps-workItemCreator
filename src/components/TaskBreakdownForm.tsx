
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
import { StoryType } from "@/types/azure-devops";
import { useSettings } from "@/contexts/SettingsContext";
import { createChildTasks } from "@/services/azure-devops-service";
import { toast } from "sonner";

export function TaskBreakdownForm() {
  const { settings, isConfigured, storyTypes } = useSettings();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    workItemIds: "",
    selectedStoryTypeId: ""
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleStoryTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      selectedStoryTypeId: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConfigured) {
      toast.error("Please configure Azure DevOps settings first");
      return;
    }
    
    if (!formData.workItemIds.trim()) {
      toast.error("Please enter at least one work item ID");
      return;
    }
    
    if (!formData.selectedStoryTypeId) {
      toast.error("Please select a story type");
      return;
    }
    
    const workItemIds = formData.workItemIds
      .split(/[\s,]+/)
      .map(id => id.trim())
      .filter(id => /^\d+$/.test(id))
      .map(id => parseInt(id));
    
    if (workItemIds.length === 0) {
      toast.error("Please enter at least one valid work item ID");
      return;
    }
    
    const selectedStoryType = storyTypes.find(s => s.id === formData.selectedStoryTypeId);
    if (!selectedStoryType) {
      toast.error("Selected story type not found");
      return;
    }
    
    setLoading(true);
    
    try {
      // For each work item ID, create the tasks from the selected story type
      const promises = workItemIds.map(async workItemId => {
        return await createChildTasks(
          settings,
          workItemId,
          selectedStoryType.tasks
        );
      });
      
      await Promise.all(promises);
      
      toast.success(
        <div className="flex flex-col">
          <span>Successfully applied task breakdown to {workItemIds.length} work items!</span>
        </div>
      );
      
      setFormData({
        ...formData,
        workItemIds: ""
      });
    } catch (error: any) {
      toast.error(`Failed to apply task breakdown: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const selectedStoryType = storyTypes.find(s => s.id === formData.selectedStoryTypeId);

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>Apply Task Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="workItemIds">Work Item IDs</Label>
            <Textarea
              id="workItemIds"
              name="workItemIds"
              value={formData.workItemIds}
              onChange={handleInputChange}
              placeholder="Enter work item IDs (separated by spaces or commas)"
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              These work items will get the task breakdown applied to them
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="storyType">Story Type</Label>
            <Select 
              value={formData.selectedStoryTypeId} 
              onValueChange={handleStoryTypeChange}
            >
              <SelectTrigger id="storyType">
                <SelectValue placeholder="Select a story type" />
              </SelectTrigger>
              <SelectContent>
                {storyTypes.map(storyType => (
                  <SelectItem key={storyType.id} value={storyType.id}>
                    {storyType.name} ({storyType.workItemType}) - {storyType.tasks.length} tasks
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedStoryType && selectedStoryType.tasks.length > 0 && (
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-2">Tasks to be created ({selectedStoryType.tasks.length}):</h3>
              <ul className="list-disc pl-5 space-y-1">
                {selectedStoryType.tasks.map(task => (
                  <li key={task.id} className="text-sm">
                    {task.name} - {task.activity} ({task.hours} hours)
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-azure hover:bg-azure-light" 
            disabled={loading || !isConfigured || !formData.selectedStoryTypeId || !formData.workItemIds.trim()}
          >
            {loading ? "Applying..." : "Apply Task Breakdown"}
          </Button>
          
          {!isConfigured && (
            <p className="text-center text-sm text-muted-foreground">
              Please configure your Azure DevOps settings first.
            </p>
          )}
          
          {storyTypes.length === 0 && (
            <p className="text-center text-sm text-amber-500">
              You need to create story types before you can apply task breakdowns.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
