import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { RunHistoryItem } from '@/lib/types';
import { History, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from './ui/Badge';

export function RunHistory({ workflowId }: { workflowId: string }) {
  const [history, setHistory] = useState<RunHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getRunHistory(workflowId).then(data => {
      if (mounted) {
        setHistory(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [workflowId]);

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground text-sm">Loading history...</div>;
  }

  return (
    <div className="h-full bg-background border-l border-border flex flex-col">
      <div className="p-3 border-b border-border flex items-center gap-2 font-medium text-sm bg-secondary">
        <History size={16} /> Run History
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {history.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            No runs yet.
          </div>
        ) : (
          <div className="space-y-2">
            {history.map(run => (
              <div key={run.id} className="p-3 rounded-lg border border-border bg-secondary hover:bg-background transition-colors text-sm flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs text-muted-foreground">{run.id}</div>
                  <Badge variant={run.status === 'success' ? 'success' : 'destructive'}>
                    {run.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                  <div>{new Date(run.createdAt).toLocaleString()}</div>
                  <div>{run.duration}s</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
