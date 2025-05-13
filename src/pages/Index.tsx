
import { SettingsDrawer } from "@/components/SettingsDrawer";
import { WorkItemForm } from "@/components/WorkItemForm";
import { useSettings } from "@/contexts/SettingsContext";

const Index = () => {
  const { settings, isConfigured } = useSettings();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b shadow-sm py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-azure">Azure DevOps Work Item Creator</h1>
        <SettingsDrawer />
      </header>

      <main className="flex-1 container mx-auto p-6 max-w-3xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Create Work Item</h2>
          <p className="text-gray-600">
            Quickly add features, backlog items, bugs, or tasks to your Azure DevOps project.
          </p>
          
          {isConfigured ? (
            <div className="mt-2 px-3 py-2 bg-green-50 text-green-700 rounded-md inline-flex items-center text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Connected to {settings.organization}/{settings.project}
            </div>
          ) : (
            <div className="mt-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-md inline-flex items-center text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Settings needed - click the gear icon to configure
            </div>
          )}
        </div>

        <WorkItemForm />
      </main>

      <footer className="bg-white border-t py-4 px-6 text-center text-sm text-gray-500">
        <p>Azure DevOps Work Item Creator - Your local tool for managing work items</p>
      </footer>
    </div>
  );
};

export default Index;
