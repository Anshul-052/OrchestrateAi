import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Zap } from 'lucide-react';
import { cn } from '../ui/Button';

const TriggerNode = ({ data, selected }: NodeProps) => {
  return (
    <div className={cn(
      "px-4 py-3 shadow-lg rounded-xl bg-secondary border-2 min-w-[200px] transition-all duration-200",
      selected ? "border-primary shadow-primary/20" : "border-border hover:border-muted"
    )}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
          <Zap size={20} className="fill-primary/20" />
        </div>
        <div>
          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">Trigger</div>
          <div className="text-sm font-medium text-foreground">{data.label}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-primary border-none" />
    </div>
  );
};

export default memo(TriggerNode);
