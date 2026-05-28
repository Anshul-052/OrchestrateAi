export interface ActionConfig {
  type: string;
  [key: string]: any;
}

export interface WorkflowAction {
  id: string;
  type: string;
  config?: ActionConfig;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  trigger: string;
  actions: WorkflowAction[];
  status?: 'active' | 'inactive';
  createdAt?: string;
}

export interface ExecutionLog {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  startedAt: string;
  completedAt?: string;
  logs: LogEntry[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  nodeId: string;
  message: string;
  level: 'info' | 'warn' | 'error' | 'success';
}

export interface RunHistoryItem {
  id: string;
  workflowId: string;
  status: string;
  createdAt: string;
  duration?: number;
}
