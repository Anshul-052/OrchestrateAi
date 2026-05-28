import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Workflow } from '@/lib/types';
import { Play, Plus, Search, Trash2 } from 'lucide-react';
import { cn } from './ui/Button';

interface WorkflowSidebarProps {
  workflows: Workflow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRun: (id: string) => void;
}

export function WorkflowSidebar({ 
  workflows, 
  selectedId, 
  onSelect, 
  onNew, 
  onDelete,
  onRun
}: WorkflowSidebarProps) {
  const [search, setSearch] = useState('');

  const filtered = workflows.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-80 h-full bg-secondary flex flex-col border-r border-border shrink-0">
      <div className="p-4 border-b border-border flex flex-col gap-4">
        <Button onClick={onNew} className="w-full gap-2">
          <Plus size={16} /> New Workflow
        </Button>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search workflows..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.map(w => (
          <div
            key={w.id}
            onClick={() => onSelect(w.id)}
            className={cn(
              "p-3 rounded-lg cursor-pointer transition-all group flex flex-col gap-2",
              selectedId === w.id 
                ? "bg-primary/10 border border-primary/20" 
                : "hover:bg-background border border-transparent"
            )}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-foreground truncate pr-2">{w.name}</h4>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); onRun(w.id); }}
                  className="p-1.5 text-accent hover:bg-accent/10 rounded-md transition-colors"
                  title="Run Workflow"
                >
                  <Play size={14} className="fill-accent" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(w.id); }}
                  className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  title="Delete Workflow"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success"></span>
              {w.status || 'active'} • {w.actions.length} actions
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            No workflows found.
          </div>
        )}
      </div>
    </div>
  );
}
