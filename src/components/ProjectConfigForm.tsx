
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/contexts/SettingsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { ProjectConfig } from "@/types/azure-devops";

export function ProjectConfigForm() {
  const { 
    projectConfigs, 
    addProjectConfig, 
    updateProjectConfig, 
    deleteProjectConfig,
    selectProjectConfig,
    selectedProjectConfig
  } = useSettings();
  
  const [newConfig, setNewConfig] = useState<Omit<ProjectConfig, "id">>({
    name: "",
    organization: "",
    project: "",
    path: ""
  });

  const handleAddConfig = () => {
    if (newConfig.name && newConfig.organization && newConfig.project) {
      addProjectConfig(newConfig);
      setNewConfig({
        name: "",
        organization: "",
        project: "",
        path: ""
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Project Configurations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="name">Configuration Name</Label>
              <Input
                id="name"
                name="name"
                value={newConfig.name}
                onChange={handleInputChange}
                placeholder="Team A"
              />
            </div>
            <div>
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                name="organization"
                value={newConfig.organization}
                onChange={handleInputChange}
                placeholder="your-organization"
              />
            </div>
            <div>
              <Label htmlFor="project">Project</Label>
              <Input
                id="project"
                name="project"
                value={newConfig.project}
                onChange={handleInputChange}
                placeholder="Your-Project"
              />
            </div>
            <div>
              <Label htmlFor="path">Path (Optional)</Label>
              <Input
                id="path"
                name="path"
                value={newConfig.path}
                onChange={handleInputChange}
                placeholder="\Your\Path"
              />
            </div>
          </div>
          
          <Button onClick={handleAddConfig} className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Configuration
          </Button>
          
          {projectConfigs.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Saved Configurations</h3>
              <div className="space-y-2">
                {projectConfigs.map((config) => (
                  <div 
                    key={config.id} 
                    className={`border rounded-md p-3 flex justify-between items-center ${
                      selectedProjectConfig?.id === config.id ? 'bg-azure/10 border-azure' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{config.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {config.organization}/{config.project}{config.path ? config.path : ''}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => selectProjectConfig(config.id)}
                      >
                        Select
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon"
                        onClick={() => deleteProjectConfig(config.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
