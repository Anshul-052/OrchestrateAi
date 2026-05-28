import { Workflow, ExecutionLog, RunHistoryItem } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function mapBackendToFrontend(data: any): Workflow {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    trigger: data.definition?.trigger?.type || 'unknown',
    actions: data.definition?.actions || [],
    status: 'active',
    createdAt: data.created_at,
  };
}

function mapFrontendToBackend(workflow: Partial<Workflow>) {
  return {
    name: workflow.name || 'Untitled Workflow',
    description: workflow.description || '',
    definition: {
      trigger: {
        type: workflow.trigger || 'unknown',
        config: {}
      },
      actions: workflow.actions || []
    }
  };
}

export const api = {
  async getWorkflows(): Promise<Workflow[]> {
    const res = await fetch(`${API_URL}/api/workflows`);
    if (!res.ok) throw new Error('Failed to fetch workflows');
    const data = await res.json();
    return data.map(mapBackendToFrontend);
  },

  async getWorkflow(id: string): Promise<Workflow | null> {
    const res = await fetch(`${API_URL}/api/workflows/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch workflow');
    const data = await res.json();
    return mapBackendToFrontend(data);
  },

  async saveWorkflow(workflow: Partial<Workflow>): Promise<Workflow> {
    const method = workflow.id ? 'PUT' : 'POST';
    const url = workflow.id ? `${API_URL}/api/workflows/${workflow.id}` : `${API_URL}/api/workflows`;
    
    const payload = mapFrontendToBackend(workflow);

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Save workflow failed:', errorText);
      throw new Error(`Failed to save workflow: ${res.statusText}`);
    }
    const data = await res.json();
    return mapBackendToFrontend(data);
  },

  async deleteWorkflow(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/workflows/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete workflow');
  },

  async runWorkflow(id: string): Promise<{ executionId: string }> {
    const res = await fetch(`${API_URL}/api/workflows/${id}/run`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to run workflow');
    return res.json();
  },

  async getRunHistory(workflowId: string): Promise<RunHistoryItem[]> {
    const res = await fetch(`${API_URL}/api/workflows/${workflowId}/runs`);
    if (!res.ok) throw new Error('Failed to fetch run history');
    return res.json();
  },

  async generateWorkflow(prompt: string): Promise<Partial<Workflow>> {
    const res = await fetch(`${API_URL}/api/workflows/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Generate workflow failed:', errorText);
      throw new Error(`Failed to generate workflow: ${res.statusText}`);
    }
    const data = await res.json(); // returns WorkflowDefinition
    return {
      name: 'Generated Workflow',
      description: `Generated from: "${prompt}"`,
      trigger: data.trigger?.type || 'unknown',
      actions: data.actions || []
    };
  }
};
