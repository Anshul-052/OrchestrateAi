import React from 'react';
import { Node } from 'reactflow';
import { X } from 'lucide-react';

interface NodeConfigPanelProps {
  node: Node;
  onClose: () => void;
  onUpdate: (id: string, newConfig: any) => void;
  workflowId: string;
}

export function NodeConfigPanel({ node, onClose, onUpdate, workflowId }: NodeConfigPanelProps) {
  const isWebhook = node.type === 'trigger' && node.data.type === 'webhook';
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const webhookUrl = `${API_URL}/api/webhooks/${workflowId}`;

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(node.id, { ...node.data.config, prompt: e.target.value });
  };

  return (
    <div className="absolute right-4 top-20 w-80 bg-secondary border border-border rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border bg-background">
        <h3 className="font-semibold text-foreground">
          {node.type === 'trigger' ? 'Trigger Settings' : 'Action Settings'}
        </h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X size={16} />
        </button>
      </div>
      
      <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[60vh]">
        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Node Type: {node.data.label}
        </div>

        {isWebhook && (
          <div className="flex flex-col gap-2">
            <label className="text-sm text-foreground">Webhook URL</label>
            <p className="text-xs text-muted-foreground mb-1">
              Send a POST request to this URL to trigger this workflow.
            </p>
            <input 
              type="text" 
              readOnly 
              value={webhookUrl}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs text-foreground cursor-copy"
              onClick={(e) => {
                (e.target as HTMLInputElement).select();
                navigator.clipboard.writeText(webhookUrl);
              }}
            />
          </div>
        )}

        {node.type === 'action' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm text-foreground">AI Instructions</label>
            <p className="text-xs text-muted-foreground mb-1">
              Tell the Universal AI Node what to do with the data from previous steps, or specify an API it should call.
            </p>
            <textarea 
              value={node.data.config?.prompt || ''}
              onChange={handlePromptChange}
              placeholder="e.g., Send a slack message to #general with the summary..."
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground h-32 resize-none outline-none focus:border-primary transition-colors"
            />
          </div>
        )}
      </div>
    </div>
  );
}
