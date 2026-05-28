import { useState, useEffect, useCallback } from 'react';
import { LogEntry } from '@/lib/types';

export function useExecutionStream(workflowId: string | null) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');

  const addLog = useCallback((log: Omit<LogEntry, 'id' | 'timestamp'>) => {
    setLogs(prev => [...prev, {
      ...log,
      id: `log_${Date.now()}_${Math.random()}`,
      timestamp: new Date().toISOString()
    }]);
  }, []);

  useEffect(() => {
    if (!workflowId) {
      setLogs([]);
      setStatus('idle');
      return;
    }

    setLogs([]);
    setStatus('running');
    
    let abortController = new AbortController();

    const runStream = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API_URL}/api/workflows/${workflowId}/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortController.signal
        });

        if (!res.ok) {
          throw new Error('Failed to start execution');
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            
            // Keep the last partial line in the buffer
            buffer = lines.pop() || '';
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.substring(6).trim();
                if (!dataStr) continue;
                
                try {
                  const data = JSON.parse(dataStr);
                  addLog({
                    nodeId: data.node_id || 'system',
                    message: data.message || 'Executing...',
                    level: data.status === 'error' ? 'error' : 
                           data.status === 'completed' ? 'success' : 'info'
                  });
                } catch (e) {
                  console.error('Failed to parse SSE data', dataStr);
                }
              }
            }
          }
        }
        setStatus('success');
      } catch (error: any) {
        if (error.name === 'AbortError') return;
        addLog({ nodeId: 'system', message: `Execution failed: ${error.message}`, level: 'error' });
        setStatus('failed');
      }
    };

    runStream();

    return () => {
      abortController.abort();
    };
  }, [workflowId, addLog]);

  return { logs, status };
}
