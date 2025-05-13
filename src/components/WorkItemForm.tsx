
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
import { WorkItem } from "@/types/azure-devops";
import { useSettings } from "@/contexts/SettingsContext";
import { createWorkItem } from "@/services/azure-devops-service";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

export function WorkItemForm() {
  const { settings, isConfigured } = useSettings();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<WorkItem>({
    title: "",
    description: "",
    acceptanceCriteria: "",
    itemType: "Product Backlog Item",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      itemType: value as WorkItem["itemType"],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConfigured) {
      toast.error("Please configure Azure DevOps settings first");
      return;
    }
    
    if (!formData.title) {
      toast.error("Title is required");
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await createWorkItem(settings, formData);
      
      toast.success(
        <div className="flex flex-col">
          <span>Work item created successfully!</span>
          <span className="text-sm text-muted-foreground">ID: {result.id}</span>
        </div>
      );
      
      // Reset form after successful submission
      setFormData({
        title: "",
        description: "",
        acceptanceCriteria: "",
        itemType: formData.itemType, // Keep the same item type for consecutive submissions
      });
    } catch (error: any) {
      toast.error(`Failed to create work item: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full mx-auto">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="itemType">Work Item Type</Label>
            <Select 
              value={formData.itemType} 
              onValueChange={handleSelectChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select work item type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Feature">Feature</SelectItem>
                <SelectItem value="Product Backlog Item">Product Backlog Item</SelectItem>
                <SelectItem value="Bug">Bug</SelectItem>
                <SelectItem value="Task">Task</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter description"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="acceptanceCriteria">Acceptance Criteria</Label>
            <Textarea
              id="acceptanceCriteria"
              name="acceptanceCriteria"
              value={formData.acceptanceCriteria}
              onChange={handleInputChange}
              placeholder="Enter acceptance criteria"
              rows={5}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-azure hover:bg-azure-light" 
            disabled={loading || !isConfigured}
          >
            {loading ? "Creating..." : "Create Work Item"}
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
