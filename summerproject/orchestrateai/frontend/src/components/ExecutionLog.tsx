import React from 'react';
import { useExecutionStream } from '@/hooks/useExecutionStream';
import { Badge } from './ui/Badge';
import { Activity, CheckCircle2, XCircle, Clock, Info } from 'lucide-react';
import { cn } from './ui/Button';

interface ExecutionLogProps {
  executionId: string | null;
  onClose: () => void;
}

export function ExecutionLog({ executionId, onClose }: ExecutionLogProps) {
  const { logs, status } = useExecutionStream(executionId);

  if (!executionId) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity size={16} className="text-primary animate-pulse" />;
      case 'success': return <CheckCircle2 size={16} className="text-success" />;
      case 'failed': return <XCircle size={16} className="text-destructive" />;
      default: return <Clock size={16} className="text-muted-foreground" />;
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info': return <Info size={14} className="text-primary" />;
      case 'success': return <CheckCircle2 size={14} className="text-success" />;
      case 'warn': return <Info size={14} className="text-amber-500" />;
      case 'error': return <XCircle size={14} className="text-destructive" />;
      default: return <Info size={14} />;
    }
  };

  return (
    <div className="h-64 border-t border-border bg-secondary flex flex-col shadow-2xl relative z-10">
      <div className="flex items-center justify-between p-3 border-b border-border bg-background">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Activity size={16} /> Live Execution Log
          </h3>
          <Badge variant={
            status === 'success' ? 'success' : 
            status === 'failed' ? 'destructive' : 
            status === 'running' ? 'default' : 'outline'
          }>
            {status.toUpperCase()}
          </Badge>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <XCircle size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm">
        {logs.map(log => (
          <div key={log.id} className="flex gap-4 items-start p-2 rounded-md hover:bg-background transition-colors">
            <div className="text-muted-foreground shrink-0 w-24">
              {new Date(log.timestamp).toLocaleTimeString()}
            </div>
            <div className="shrink-0 mt-0.5">
              {getLevelIcon(log.level)}
            </div>
            <div className="flex-1">
              <span className="text-muted-foreground mr-2">[{log.nodeId}]</span>
              <span className={cn(
                log.level === 'error' && "text-destructive",
                log.level === 'success' && "text-success",
                log.level === 'warn' && "text-amber-500",
                log.level === 'info' && "text-foreground"
              )}>
                {log.message}
              </span>
            </div>
          </div>
        ))}
        {logs.length === 0 && status === 'running' && (
          <div className="text-muted-foreground italic p-2">Waiting for logs...</div>
        )}
      </div>
    </div>
  );
}
