import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Workflow } from '@/lib/types';

export function useWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflows = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getWorkflows();
      setWorkflows(data);
      setError(null);
    } catch (err) {
      setError('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const saveWorkflow = async (workflow: Partial<Workflow>) => {
    const saved = await api.saveWorkflow(workflow);
    setWorkflows(prev => {
      const exists = prev.find(w => w.id === saved.id);
      if (exists) return prev.map(w => w.id === saved.id ? saved : w);
      return [...prev, saved];
    });
    return saved;
  };

  const deleteWorkflow = async (id: string) => {
    await api.deleteWorkflow(id);
    setWorkflows(prev => prev.filter(w => w.id !== id));
  };

  const generateFromPrompt = async (prompt: string) => {
    // 1. Generate workflow definition from API
    const generatedData = await api.generateWorkflow(prompt);
    // 2. Save it to DB
    const saved = await saveWorkflow(generatedData);
    return saved;
  };

  return {
    workflows,
    loading,
    error,
    refresh: fetchWorkflows,
    saveWorkflow,
    deleteWorkflow,
    generateFromPrompt
  };
}
