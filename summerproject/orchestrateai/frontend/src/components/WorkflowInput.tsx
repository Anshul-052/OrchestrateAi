import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Workflow } from '@/lib/types';
import { Save, Code } from 'lucide-react';

interface WorkflowInputProps {
  workflow: Workflow | null;
  onSave: (workflow: Partial<Workflow>) => void;
}

export function WorkflowInput({ workflow, onSave }: WorkflowInputProps) {
  const [jsonStr, setJsonStr] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (workflow) {
      setJsonStr(JSON.stringify(workflow, null, 2));
      setError(null);
    } else {
      setJsonStr('');
    }
  }, [workflow]);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonStr);
      onSave(parsed);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Invalid JSON format');
    }
  };

  if (!workflow && !jsonStr) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground p-4 text-center">
        Select a workflow or click New Workflow
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      <div className="p-3 border-b border-border flex items-center justify-between bg-secondary">
        <div className="flex items-center gap-2 font-medium text-sm">
          <Code size={16} /> JSON Definition
        </div>
        <Button size="sm" onClick={handleSave} className="gap-2">
          <Save size={14} /> Save
        </Button>
      </div>
      
      <div className="flex-1 p-4 relative">
        <textarea
          value={jsonStr}
          onChange={e => {
            setJsonStr(e.target.value);
            setError(null);
          }}
          className="w-full h-full bg-secondary text-foreground font-mono text-sm p-4 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          spellCheck={false}
        />
        {error && (
          <div className="absolute bottom-6 left-6 right-6 bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-2 rounded-md">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
