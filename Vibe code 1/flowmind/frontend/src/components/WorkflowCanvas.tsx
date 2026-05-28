"use client";

import React, { useMemo, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState,
  ConnectionMode,
  BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';
import TriggerNode from './nodes/TriggerNode';
import ActionNode from './nodes/ActionNode';
import { Workflow } from '@/lib/types';
import { workflowToFlow } from '@/lib/workflowToFlow';

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
};

interface WorkflowCanvasProps {
  workflow: Workflow | null;
}

export function WorkflowCanvas({ workflow }: WorkflowCanvasProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    return workflow ? workflowToFlow(workflow) : { nodes: [], edges: [] };
  }, [workflow]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync when workflow changes
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  if (!workflow) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background border-l border-border">
        <div className="text-center text-muted-foreground">
          <div className="text-4xl mb-4">🔀</div>
          <h3 className="text-xl font-semibold mb-2">Select a Workflow</h3>
          <p>Choose a workflow from the sidebar to view or edit.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background relative border-l border-border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
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
  );
}
