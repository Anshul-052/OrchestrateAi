import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Settings, Play, Filter, Clock, FileJson } from 'lucide-react';
import { cn } from '../ui/Button';

const ActionNode = ({ data, selected }: NodeProps) => {
  const isLogic = ['filter', 'delay', 'formatter'].includes(data.type);
  
  const Icon = data.type === 'filter' ? Filter : 
               data.type === 'delay' ? Clock : 
               data.type === 'formatter' ? FileJson : Play;

  const colorClass = isLogic ? 'text-yellow-500' : 'text-accent';
  const bgClass = isLogic ? 'bg-yellow-500/20' : 'bg-accent/20';
  const borderClass = isLogic ? 'border-yellow-500' : 'border-accent';
  const shadowClass = isLogic ? 'shadow-yellow-500/20' : 'shadow-accent/20';
  const handleBgClass = isLogic ? '!bg-yellow-500' : '!bg-accent';

  return (
    <div className={cn(
      "px-4 py-3 shadow-lg rounded-xl bg-secondary border-2 min-w-[200px] transition-all duration-200",
      selected ? `${borderClass} ${shadowClass}` : "border-border hover:border-muted"
    )}>
      <Handle type="target" position={Position.Top} className={cn("w-3 h-3 border-none", handleBgClass)} />
      
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", bgClass, colorClass)}>
            <Icon size={16} className={isLogic ? "" : "fill-accent/20"} />
          </div>
          <div>
            <div className={cn("text-xs font-semibold uppercase tracking-wider mb-0.5", colorClass)}>
              {isLogic ? 'Logic' : 'Action'} {data.index}
            </div>
            <div className="text-sm font-medium text-foreground">{data.label}</div>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-foreground transition-colors p-1">
          <Settings size={16} />
        </button>
      </div>

      <Handle type="source" position={Position.Bottom} className={cn("w-3 h-3 border-none", handleBgClass)} />
    </div>
  );
};

export default memo(ActionNode);
