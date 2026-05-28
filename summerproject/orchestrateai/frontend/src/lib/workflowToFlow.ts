import { Node, Edge, MarkerType } from 'reactflow';
import { Workflow } from './types';

export function workflowToFlow(workflow: Workflow): { nodes: Node[], edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Trigger Node
  nodes.push({
    id: 'trigger',
    type: 'trigger',
    position: { x: 250, y: 50 },
    data: { label: workflow.trigger || 'Select Trigger', type: workflow.trigger },
  });

  // Action Nodes
  let currentY = 200;
  let previousId = 'trigger';

  workflow.actions.forEach((action, index) => {
    const nodeId = action.id;
    
    nodes.push({
      id: nodeId,
      type: 'action',
      position: { x: 250, y: currentY },
      data: { 
        label: action.type,
        config: action.config,
        index: index + 1
      },
    });

    edges.push({
      id: `e-${previousId}-${nodeId}`,
      source: previousId,
      target: nodeId,
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#8b5cf6',
      },
    });

    previousId = nodeId;
    currentY += 150;
  });

  return { nodes, edges };
}
