
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsDrawer } from "@/components/SettingsDrawer";
import { WorkItemForm } from "@/components/WorkItemForm";
import { BulkWorkItemForm } from "@/components/BulkWorkItemForm";
import { TaskBreakdownForm } from "@/components/TaskBreakdownForm";
import { StoryTypeManager } from "@/components/StoryTypeManager";
import { ProjectConfigForm } from "@/components/ProjectConfigForm";
import { useSettings } from "@/contexts/SettingsContext";
import { Card } from "@/components/ui/card";
import { Settings, ListPlus, Files, Copy, FolderCog } from "lucide-react";

const Index = () => {
  const { settings, isConfigured, selectedProjectConfig, projectConfigs } = useSettings();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b shadow-sm py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-azure">Azure DevOps Work Item Creator</h1>
        <SettingsDrawer />
      </header>

      <main className="flex-1 container mx-auto p-6 max-w-6xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Work Item Management</h2>
          <p className="text-gray-600">
            Create and manage work items in your Azure DevOps projects
          </p>
          
          {isConfigured ? (
            <div className="mt-2 px-3 py-2 bg-green-50 text-green-700 rounded-md inline-flex items-center text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {selectedProjectConfig 
                ? `Ready to create work items in ${selectedProjectConfig.name}` 
                : `Ready to create work items (select a project configuration)`}
            </div>
          ) : (
            <div className="mt-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-md inline-flex items-center text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {!settings.personalAccessToken && projectConfigs.length === 0 && 
                "Settings needed - Add PAT in settings and create project configurations"}
              {!settings.personalAccessToken && projectConfigs.length > 0 && 
                "PAT needed - Click the gear icon to add your Personal Access Token"}
              {settings.personalAccessToken && projectConfigs.length === 0 && 
                "Project configs needed - Add at least one project configuration"}
            </div>
          )}
        </div>

        <Tabs defaultValue="single" className="w-full">
          <TabsList className="mb-6 grid grid-cols-5 w-full">
            <TabsTrigger value="single" className="flex items-center">
              <ListPlus className="h-4 w-4 mr-2" />
              Single Work Item
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center">
              <Files className="h-4 w-4 mr-2" />
              Bulk Creation
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center">
              <Copy className="h-4 w-4 mr-2" />
              Task Breakdown
            </TabsTrigger>
            <TabsTrigger value="story-types" className="flex items-center">
              <ListPlus className="h-4 w-4 mr-2" />
              Story Types
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center">
              <FolderCog className="h-4 w-4 mr-2" />
              Project Config
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="single">
            <WorkItemForm />
          </TabsContent>
          
          <TabsContent value="bulk">
            <BulkWorkItemForm />
          </TabsContent>
          
          <TabsContent value="tasks">
            <TaskBreakdownForm />
          </TabsContent>
          
          <TabsContent value="story-types">
            <StoryTypeManager />
          </TabsContent>
          
          <TabsContent value="config">
            <ProjectConfigForm />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-white border-t py-4 px-6 text-center text-sm text-gray-500">
        <p>Azure DevOps Work Item Creator - Your local tool for managing work items</p>
      </footer>
    </div>
  );
};

export default Index;