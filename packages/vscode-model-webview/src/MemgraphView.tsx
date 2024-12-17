/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';
import './style.css';
import ReactFlow, {
  Background,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  NodeOrigin,
  Node,
  Edge,
  useReactFlow,
} from 'reactflow';

import useForceLayout from './useForceLayout';

type ForceProps = {
  strength?: number;
  distance?: number;
  initNodes: Node[];
  initEdges: Edge[];
};

const nodeOrigin: NodeOrigin = [0.5, 0.5];

const defaultEdgeOptions = { style: { stroke: '#ff66aa', strokeWidth: 3 } };

function ForceGraph({ initNodes, initEdges, strength, distance }: ForceProps) {
  const { project } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

  useForceLayout({ strength, distance });

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeOrigin={nodeOrigin}
      defaultEdgeOptions={defaultEdgeOptions}
      contentEditable={false}
      elementsSelectable={false}
      nodesConnectable={false}
      fitView
    >
      <Background />
    </ReactFlow>
  );
}

function MemgraphView({ initNodes, initEdges, strength, distance }: ForceProps) {
  return (
    <ReactFlowProvider>
      <ForceGraph initNodes={initNodes} initEdges={initEdges} strength={strength} distance={distance} />
    </ReactFlowProvider>
  );
}

export default MemgraphView;
