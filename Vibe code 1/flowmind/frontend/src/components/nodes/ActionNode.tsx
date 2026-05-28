import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Settings, Play } from 'lucide-react';
import { cn } from '../ui/Button';

const ActionNode = ({ data, selected }: NodeProps) => {
  return (
    <div className={cn(
      "px-4 py-3 shadow-lg rounded-xl bg-secondary border-2 min-w-[200px] transition-all duration-200",
      selected ? "border-accent shadow-accent/20" : "border-border hover:border-muted"
    )}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-accent border-none" />
      
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
            <Play size={16} className="fill-accent/20" />
          </div>
          <div>
            <div className="text-xs font-semibold text-accent uppercase tracking-wider mb-0.5">
              Action {data.index}
            </div>
            <div className="text-sm font-medium text-foreground">{data.label}</div>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-foreground transition-colors p-1">
          <Settings size={16} />
        </button>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-accent border-none" />
    </div>
  );
};

export default memo(ActionNode);
