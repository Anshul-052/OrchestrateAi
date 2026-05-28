import { Node, Edge } from 'reactflow';
import { Workflow, WorkflowAction } from './types';

export function flowToWorkflow(
  nodes: Node[],
  edges: Edge[],
  existingWorkflow: Workflow
): Workflow {
  // Find the trigger node
  const triggerNode = nodes.find(n => n.type === 'trigger');
  
  if (!triggerNode) {
    throw new Error("Workflow must have a trigger node");
  }

  const actions: WorkflowAction[] = [];
  
  // Traverse from the trigger node
  let currentNodeId = triggerNode.id;
  
  while (true) {
    // Find the edge going out of the current node
    const outgoingEdge = edges.find(e => e.source === currentNodeId);
    
    if (!outgoingEdge) {
      break; // No more actions in the chain
    }
    
    const nextNode = nodes.find(n => n.id === outgoingEdge.target);
    if (!nextNode) {
      break;
    }
    
    if (nextNode.type === 'action') {
      actions.push({
        id: nextNode.id.startsWith('new_') ? nextNode.id : nextNode.id,
        type: nextNode.data.type || nextNode.data.label,
        config: nextNode.data.config || {},
      });
    }
    
    currentNodeId = nextNode.id;
  }

  return {
    ...existingWorkflow,
    trigger: triggerNode.data.type || triggerNode.data.label,
    actions: actions,
  };
}
