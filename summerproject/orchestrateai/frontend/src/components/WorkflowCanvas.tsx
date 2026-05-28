"use client";

import React, { useMemo, useCallback, useState, useRef } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState,
  ConnectionMode,
  BackgroundVariant,
  ReactFlowProvider,
  addEdge,
  Connection,
  Edge,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import TriggerNode from './nodes/TriggerNode';
import ActionNode from './nodes/ActionNode';
import { Workflow } from '@/lib/types';
import { workflowToFlow } from '@/lib/workflowToFlow';
import { flowToWorkflow } from '@/lib/flowToWorkflow';
import { Button } from './ui/Button';
import { Save } from 'lucide-react';
import { updateWorkflow } from '@/lib/api';

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
};

interface WorkflowCanvasProps {
  workflow: Workflow | null;
  onUpdate?: (workflow: Workflow) => void;
}

function CanvasInner({ workflow, onUpdate }: WorkflowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    return workflow ? workflowToFlow(workflow) : { nodes: [], edges: [] };
  }, [workflow]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync when workflow changes from outside
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback((params: Edge | Connection) => {
    setEdges((eds) => addEdge({
      ...params,
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' }
    }, eds));
  }, [setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const category = event.dataTransfer.getData('application/reactflow-category');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      if (!reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `new_${Date.now()}`,
        type: category,
        position,
        data: { label: type, type: type, config: {} },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const handleSave = async () => {
    if (!workflow) return;
    setIsSaving(true);
    try {
      const updatedDefinition = flowToWorkflow(nodes, edges, workflow);
      const saved = await updateWorkflow(workflow.id, updatedDefinition);
      if (onUpdate) {
        onUpdate(saved);
      }
    } catch (error) {
      console.error("Failed to save workflow:", error);
      alert("Failed to save workflow. See console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!workflow) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-background border-l border-border">
        <div className="text-center text-muted-foreground">
          <div className="text-4xl mb-4">🔀</div>
          <h3 className="text-xl font-semibold mb-2">Select a Workflow</h3>
          <p>Choose a workflow from the sidebar to view or edit.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background relative border-l border-border flex flex-col">
      <div className="absolute top-4 right-4 z-10">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2 shadow-lg">
          <Save size={16} />
          {isSaving ? "Saving..." : "Save Workflow"}
        </Button>
      </div>

      <div className="flex-1" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#334155" />
          <Controls className="!bg-secondary !border-border !rounded-lg overflow-hidden !shadow-lg" />
          <MiniMap 
            nodeColor={(n) => {
              if (n.type === 'trigger') return '#8b5cf6';
              if (n.type === 'action') return '#2dd4bf';
              return '#334155';
            }}
            maskColor="rgba(15, 17, 21, 0.7)"
            className="!bg-secondary !border-border !rounded-lg"
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
