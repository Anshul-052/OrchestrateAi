import React from 'react';

const triggerTypes = [
  { type: 'gmail.new_email', label: 'New Email' },
  { type: 'schedule.daily', label: 'Daily Schedule' },
  { type: 'file.uploaded', label: 'File Uploaded' },
];

const actionTypes = [
  { type: 'summarize', label: 'Summarize Text' },
  { type: 'notify', label: 'Send Notification' },
  { type: 'save_to_drive', label: 'Save to Drive' },
  { type: 'extract_deadline', label: 'Extract Deadline' },
  { type: 'send_email', label: 'Send Email' },
];

export function WorkflowEditorSidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string, isTrigger: boolean) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow-category', isTrigger ? 'trigger' : 'action');
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-secondary border-r border-border p-4 flex flex-col gap-6 overflow-y-auto shrink-0">
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Triggers</h3>
        <div className="flex flex-col gap-2">
          {triggerTypes.map((t) => (
            <div
              key={t.type}
              className="p-3 bg-background border border-border rounded-md cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors text-sm font-medium flex items-center justify-center text-center"
              onDragStart={(event) => onDragStart(event, t.type, true)}
              draggable
            >
              {t.label}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Actions</h3>
        <div className="flex flex-col gap-2">
          {actionTypes.map((a) => (
            <div
              key={a.type}
              className="p-3 bg-background border border-border rounded-md cursor-grab active:cursor-grabbing hover:border-accent/50 transition-colors text-sm font-medium flex items-center justify-center text-center"
              onDragStart={(event) => onDragStart(event, a.type, false)}
              draggable
            >
              {a.label}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
