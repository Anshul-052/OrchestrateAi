import React from 'react';
import { Workflow } from '@/lib/types';
import { Play, Settings } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface WorkflowHeaderProps {
  workflow: Workflow | null;
  onRun: () => void;
}

export function WorkflowHeader({ workflow, onRun }: WorkflowHeaderProps) {
  if (!workflow) {
    return (
      <header className="h-14 border-b border-border bg-background flex items-center px-6">
        <h1 className="font-bold text-xl text-primary tracking-tight">OrchestrateAi</h1>
      </header>
    );
  }

  return (
    <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="font-bold text-xl text-primary tracking-tight mr-4">OrchestrateAi</h1>
        <div className="h-6 w-px bg-border"></div>
        <h2 className="font-semibold text-foreground">{workflow.name}</h2>
        <Badge variant={workflow.status === 'active' ? 'success' : 'outline'}>
          {workflow.status || 'active'}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="gap-2">
          <Settings size={14} /> Settings
        </Button>
        <Button onClick={onRun} size="sm" className="gap-2 shadow-primary/20 shadow-lg">
          <Play size={14} className="fill-current" /> Run Workflow
        </Button>
      </div>
    </header>
  );
}
