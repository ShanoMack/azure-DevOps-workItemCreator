import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/contexts/SettingsContext";
import { SettingsData } from "@/types/azure-devops";

export function SettingsDrawer() {
  const { settings, updateSettings } = useSettings();
  const [formData, setFormData] = useState<Pick<SettingsData, "personalAccessToken">>({
    personalAccessToken: settings.personalAccessToken
  });
  const [open, setOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // Keep existing organization, project, and team values
    updateSettings({
      ...settings,
      personalAccessToken: formData.personalAccessToken,
    });
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Azure DevOps Authentication</SheetTitle>
          <SheetDescription>
            Configure your Azure DevOps Personal Access Token. This token is stored locally in your browser.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="personalAccessToken">Personal Access Token (PAT)</Label>
            <Input
              id="personalAccessToken"
              name="personalAccessToken"
              type="password"
              placeholder="Enter your PAT"
              value={formData.personalAccessToken}
              onChange={handleChange}
            />
            <p className="text-sm text-muted-foreground">
              Your token is stored locally and never sent to our servers.
            </p>
          </div>

          <Button onClick={handleSave} className="mt-4 bg-azure hover:bg-azure-light">
            Save Token
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
