import { DragEvent, memo, useCallback, useMemo, useRef, useState } from "react";
import ReactFlow, { Background, Controls, NodeChange, applyNodeChanges,applyEdgeChanges, Edge, Node, EdgeChange, useReactFlow, NodeTypes, } from "reactflow";
import 'reactflow/dist/style.css';
import ClassImpl from "./node-types/ClassNode";



  const types = {Class: ClassImpl};
  export default function FlowProvider({lib}: {lib: any}) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const { screenToFlowPosition } = useReactFlow();
  const reactFlowWrapper = useRef<any>(null);


  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds: Edge[]) => applyEdgeChanges(changes, eds)),
    [],
  );
 
  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
 
  const onDrop = useCallback((event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow') 
 
      // check if the dropped element is valid
      if (!type) {
        return;
      }
 
      // project was renamed to screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode: Node = {
        id: crypto.randomUUID(),
        type,
        position,
        data: { label: `${type} node`, lib },
      };
 
      setNodes((nds) => nds.concat(newNode));
    }, [nodes, screenToFlowPosition])

  

  return (
    <div style={{ height: '90vh', width: '80vw' }} ref={reactFlowWrapper}>
      
      <ReactFlow
        nodes={nodes}
        nodeTypes={types as NodeTypes}
        onNodesChange={onNodesChange}
        edges={edges}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}