
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings } from "@/contexts/SettingsContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Edit, Save } from "lucide-react";
import { StoryType, Task, WorkItem } from "@/types/azure-devops";

export function StoryTypeManager() {
  const { storyTypes, addStoryType, updateStoryType, deleteStoryType } = useSettings();
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newStoryType, setNewStoryType] = useState<Omit<StoryType, "id">>({
    name: "",
    workItemType: "Product Backlog Item",
    tasks: []
  });
  
  const [newTask, setNewTask] = useState<Omit<Task, "id">>({
    name: "",
    activity: "Development",
    hours: 1
  });
  
  const [selectedStoryType, setSelectedStoryType] = useState<StoryType | null>(null);

  const handleAddStoryType = () => {
    if (newStoryType.name) {
      addStoryType(newStoryType);
      setNewStoryType({
        name: "",
        workItemType: "Product Backlog Item",
        tasks: []
      });
    }
  };

  const handleStoryTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewStoryType({
      ...newStoryType,
      name: e.target.value
    });
  };

  const handleWorkItemTypeChange = (value: string) => {
    setNewStoryType({
      ...newStoryType,
      workItemType: value as WorkItem["itemType"]
    });
  };
  
  const handleTaskInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: name === "hours" ? parseFloat(value) || 0 : value
    }));
  };
  
  const handleTaskActivityChange = (value: string) => {
    setNewTask({
      ...newTask,
      activity: value
    });
  };
  
  const handleAddTask = () => {
    if (selectedStoryType && newTask.name) {
      const updatedStoryType = {
        ...selectedStoryType,
        tasks: [
          ...selectedStoryType.tasks,
          { ...newTask, id: Math.random().toString(36).slice(2, 11) }
        ]
      };
      updateStoryType(updatedStoryType);
      setNewTask({
        name: "",
        activity: "Development",
        hours: 1
      });
    }
  };
  
  const handleDeleteTask = (taskId: string) => {
    if (selectedStoryType) {
      const updatedStoryType = {
        ...selectedStoryType,
        tasks: selectedStoryType.tasks.filter(task => task.id !== taskId)
      };
      updateStoryType(updatedStoryType);
    }
  };
  
  const handleSelectStoryType = (storyType: StoryType) => {
    setSelectedStoryType(storyType);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configure your story types</CardTitle>
          <CardDescription>Set up personalised story types and configure the respective work items that will be created when used</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storyTypeName">Story Type Name</Label>
                <Input
                  id="storyTypeName"
                  value={newStoryType.name}
                  onChange={handleStoryTypeChange}
                  placeholder="e.g. Start of Sprint"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workItemType">Work Item Type</Label>
                <Select
                  value={newStoryType.workItemType}
                  onValueChange={handleWorkItemTypeChange}
                >
                  <SelectTrigger id="workItemType">
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
            
            <Button onClick={handleAddStoryType} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Story Type
            </Button>
            
            {storyTypes.length > 0 && (
              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {storyTypes.map((storyType) => (
                    <div 
                      key={storyType.id} 
                      className={`border rounded-md p-3 cursor-pointer ${
                        selectedStoryType?.id === storyType.id ? 'bg-azure/10 border-azure' : ''
                      }`}
                      onClick={() => handleSelectStoryType(storyType)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{storyType.name}</div>
                        <div className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {storyType.workItemType}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {storyType.tasks.length} tasks defined
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {selectedStoryType && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tasks for {selectedStoryType.name}</CardTitle>
            <Button 
              variant="outline" 
              className="text-red-500 border-red-500 hover:bg-red-500/10 hover:text-red-500"  
              size="icon" 
              onClick={() => deleteStoryType(selectedStoryType.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="taskName">Task Name</Label>
                  <Input
                    id="taskName"
                    name="name"
                    value={newTask.name}
                    onChange={handleTaskInputChange}
                    placeholder="Enter a task name"
                  />
                </div>
                <div>
                  <Label htmlFor="taskActivity">Activity</Label>
                  <Select
                    value={newTask.activity}
                    onValueChange={handleTaskActivityChange}
                  >
                    <SelectTrigger id="taskActivity">
                      <SelectValue placeholder="Select activity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Development">Development</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Testing">Testing</SelectItem>
                      <SelectItem value="Documentation">Documentation</SelectItem>
                      <SelectItem value="Deployment">Deployment</SelectItem>
                      <SelectItem value="Requirements">Requirements</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="taskHours">Hours</Label>
                  <Input
                    id="taskHours"
                    name="hours"
                    type="number"
                    step="0.5"
                    min="0"
                    value={newTask.hours}
                    onChange={handleTaskInputChange}
                  />
                </div>
              </div>
              
              <Button onClick={handleAddTask} className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
              
              {selectedStoryType.tasks.length > 0 && (
                <div className="mt-4 border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedStoryType.tasks.map((task) => (
                        <tr key={task.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{task.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{task.activity}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{task.hours}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
