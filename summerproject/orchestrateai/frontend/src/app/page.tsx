"use client";

import React, { useState } from 'react';
import { useWorkflows } from '@/hooks/useWorkflows';
import { WorkflowSidebar } from '@/components/WorkflowSidebar';
import { WorkflowCanvas } from '@/components/WorkflowCanvas';
import { WorkflowInput } from '@/components/WorkflowInput';
import { ExecutionLog } from '@/components/ExecutionLog';
import { WorkflowHeader } from '@/components/WorkflowHeader';
import { RunHistory } from '@/components/RunHistory';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, PlayCircle, Code2, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function HeroSection({ onNew, onGenerate }: { onNew: () => void, onGenerate: (prompt: string) => Promise<void> }) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      await onGenerate(prompt);
    } finally {
      setIsGenerating(false);
    }
  };

  const templates = [
    "Summarize my internship emails and notify me",
    "Extract deadlines from assignment circulars",
    "Send a daily AI study digest at 8 AM"
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-background border-l border-border relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full text-center space-y-8 z-10 p-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-sm font-medium text-muted-foreground mb-4">
          <Zap size={16} className="text-accent" />
          <span>OrchestrateAi Workflow Automation engine v2.0</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          Orchestrate Your Logic, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            Visually.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Describe what you want to automate, and AI will build the workflow instantly.
        </p>

        <form onSubmit={handleGenerate} className="relative w-full max-w-2xl mx-auto mt-8 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex items-center bg-secondary rounded-xl border border-border shadow-2xl">
            <input
              type="text"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. Summarize my internship emails and notify me..."
              disabled={isGenerating}
              className="flex-1 bg-transparent px-6 py-5 outline-none text-lg text-foreground placeholder:text-muted-foreground disabled:opacity-50"
            />
            <Button 
              type="submit" 
              disabled={!prompt.trim() || isGenerating}
              className="mr-2 rounded-lg gap-2"
            >
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              Generate
            </Button>
          </div>
        </form>

        <div className="flex flex-wrap justify-center gap-3 pt-4">
          {templates.map(t => (
            <button
              key={t}
              onClick={() => {
                setPrompt(t);
                // Option: trigger immediately or let user press enter. Let's set it so they can see it.
              }}
              className="px-4 py-2 rounded-full border border-border bg-secondary/50 hover:bg-secondary text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Button onClick={onNew} variant="outline" size="lg" className="gap-2 text-base h-12 px-8 rounded-full bg-transparent border-border/50">
            <Code2 size={20} />
            Build Manually
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const { workflows, loading, saveWorkflow, deleteWorkflow, generateFromPrompt } = useWorkflows();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [runningWorkflowId, setRunningWorkflowId] = useState<string | null>(null);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  const selectedWorkflow = workflows.find(w => w.id === selectedId) || null;

  const handleNew = () => {
    const newWf = {
      name: 'New Workflow',
      trigger: 'webhook',
      actions: []
    };
    saveWorkflow(newWf).then(saved => setSelectedId(saved.id));
  };

  const handleGenerate = async (prompt: string) => {
    try {
      const saved = await generateFromPrompt(prompt);
      setSelectedId(saved.id);
    } catch (err) {
      alert("Failed to generate workflow. Make sure your AI provider keys are set correctly in the backend.");
      console.error(err);
    }
  };

  const handleRun = async (id?: string) => {
    const wfId = id || selectedId;
    if (!wfId) return;
    
    setRunningWorkflowId(null);
    setTimeout(() => {
      setRunningWorkflowId(wfId);
    }, 50);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      <WorkflowHeader 
        workflow={selectedWorkflow} 
        onRun={() => handleRun()} 
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <WorkflowSidebar
          workflows={workflows}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onNew={handleNew}
          onDelete={setDeleteModalId}
          onRun={handleRun}
        />

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Main Top Area: Canvas + Panels */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Visual Canvas or Hero */}
            <div className="flex-1 relative">
              {selectedWorkflow ? (
                <WorkflowCanvas workflow={selectedWorkflow} />
              ) : (
                <HeroSection onNew={handleNew} onGenerate={handleGenerate} />
              )}
            </div>

            {/* Right Side Panels: JSON Editor & History */}
            <AnimatePresence>
              {selectedWorkflow && (
                <motion.div 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 400, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="w-[400px] flex flex-col border-l border-border bg-background shrink-0"
                >
                  <div className="flex-1 overflow-hidden">
                    <WorkflowInput workflow={selectedWorkflow} onSave={saveWorkflow} />
                  </div>
                  <div className="h-64 border-t border-border overflow-hidden">
                    <RunHistory workflowId={selectedWorkflow.id} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Execution Log Panel */}
          <AnimatePresence>
            {runningWorkflowId && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: '16rem', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="w-full shrink-0 absolute bottom-0 left-0 right-0 z-20"
              >
                <ExecutionLog 
                  executionId={runningWorkflowId} 
                  onClose={() => setRunningWorkflowId(null)} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteModalId}
        onClose={() => setDeleteModalId(null)}
        onConfirm={() => {
          if (deleteModalId) {
            deleteWorkflow(deleteModalId);
            if (selectedId === deleteModalId) setSelectedId(null);
          }
        }}
        title="Delete Workflow"
        description="Are you sure you want to delete this workflow? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
