
import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";

interface WorkItemIdChipsProps {
  label?: string;
  ids: string[];
  onIdsChange: (ids: string[]) => void;
  placeholder?: string;
}

export function WorkItemIdChips({
  label = "Work Item IDs",
  ids,
  onIdsChange,
  placeholder = "Enter ID and press Enter"
}: WorkItemIdChipsProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const newId = inputValue.trim();
      if (!ids.includes(newId)) {
        onIdsChange([...ids, newId]);
      }
      setInputValue("");
    }
  };

  const removeId = (idToRemove: string) => {
    onIdsChange(ids.filter(id => id !== idToRemove));
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-2">
      {label && <Label htmlFor="workItemIds">{label}</Label>}
      <div 
        className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[80px] bg-background cursor-text"
        onClick={handleContainerClick}
      >
        {ids.map((id) => (
          <div 
            key={id} 
            className="flex items-center gap-1 px-2 py-1 bg-azure/10 rounded-md border border-azure/30"
          >
            <span className="text-sm">{id}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 rounded-full hover:bg-azure/20"
              onClick={(e) => {
                e.stopPropagation();
                removeId(id);
              }}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove</span>
            </Button>
          </div>
        ))}
        <Input
          ref={inputRef}
          id="workItemIds"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-8"
          placeholder={ids.length === 0 ? placeholder : ""}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Type an ID and press Enter to add it
      </p>
    </div>
  );
}
