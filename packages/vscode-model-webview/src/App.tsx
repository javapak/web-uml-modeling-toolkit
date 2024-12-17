/* eslint-disable no-param-reassign */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/no-unknown-property */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Connection as ReactFlowConnection,
  Node as ReactFlowNode,
  Edge as ReactFlowEdge,
  XYPosition as ReactFlowPosition,
  Handle as ReactFlowHandle,
} from 'reactflow';
import './style.css';
// eslint-disable-next-line camelcase
import './index.css';
import {
  VSCodeDivider,
  VSCodeDropdown,
  VSCodeOption,
  VSCodePanels,
  VSCodePanelTab,
  VSCodePanelView,
  VSCodeTextArea,
} from '@vscode/webview-ui-toolkit/react';
import { stratify, tree } from 'd3-hierarchy';
import SubFlowGroup from './SubFlowGroup';
import DynamicNodeCall from './nodes/BaseNodeShape';
import VSCodeAPI from './VSCodeWrapper';
import Sidebar from './Sidebar';
import PropertyEditor from './nodes/PropertyEditor';
import MemgraphView from './MemgraphView';
import CypherEditor from './CypherEditor';
import { UserCreatedNodes, ViewModelHandle } from '../../core/src/base.metamodel'

// will use post mesages and event listeners on window instead of window vars.
type Handle = {
  '@context': string;
  '@id': string;
  type: string;
};

let id = 0;
// eslint-disable-next-line no-plusplus
const getId = (type: string) => `git@repo.techngs.us:${id++}/${type}`;

function DnDFlow() {
  const reactFlowWrapper = useRef(null);
  const nodeStateVar: ReactFlowNode[] = [];
  const edgeStateVar: ReactFlowEdge[] = [];
  const [nodes, setNodes, onNodesChange] = useNodesState(nodeStateVar);
  const [edges, setEdges, onEdgesChange] = useEdgesState(edgeStateVar);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [lastClickedNode, setLastClickedNode] = useState(null);
  const [nodeBg, setNodeBg] = useState('');
  const [nodeFontWeight, setNodeFontWeight] = useState('');
  const [nodeFontStyle, setNodeFontStyle] = useState('');
  const [currSelectionSchema, setCurrentSelectionSchema] = useState(null);
  const [currentSelectionINode, setCurrentSelectionINode] = useState(null);
  const [mergeQueries, setMergeQueries] = useState('');
  const [nodeLength, setNodeLength] = useState(0);
  const [edgeLength, setEdgeLength] = useState(0);
  const [queryNodes, setQueryNodes] = useState(null);
  const [queryEdges, setQueryEdges] = useState(null);
  const [queryResponse, setQueryResponse] = useState(undefined);
  // const [lastDraggedNode, setLastDraggedNode] = useState(null);

  const nodesDefined: Record<string, any> = {};
  UserCreatedNodes.forEach((viewModNode) => {
    nodesDefined[`${viewModNode.type}`] = DynamicNodeCall;
  });

  const nodeTypes = useMemo(
    () => (nodesDefined),
    []
  );

  // extension -> webview messages
  window.addEventListener('message', (event: MessageEvent<any>) => {
    // Check if the message is from the extension
    const addNode = event.data.node;
    switch (event.data.type) {
      case 'NodeChange':
        setNodes(event.data); // Handle changes if the user edits the nodes via text editor. (same with edges)
        break;

      case 'EdgeChange':
        setEdges(event.data);
        break;

      case 'NodeColorChange':
        addNode.position = { x: event.data.node.xPos, y: event.data.node.yPos };
        setNodeBg(event.data.node.style.backgroundColor);
        break;

      case 'NodeFontWeightChange':
        addNode.position = { x: event.data.node.xPos, y: event.data.node.yPos };
        setNodeFontWeight(event.data.node.style.fontWeight);
        break;

      case 'NodeFontStyleChange':
        addNode.position = { x: event.data.node.xPos, y: event.data.node.yPos };
        setNodeFontStyle(event.data.node.style.fontStyle);
        break;

      case 'NodeSelectionResponse':
        setCurrentSelectionSchema(event.data.body.schema);
        setCurrentSelectionINode(event.data.body.node);
        console.log(event.data.body.node);
        break;

      case 'RequestQueriesResponse':
        setMergeQueries(event.data.body.queries);
        break;

      case 'queryReturn':
        setQueryResponse(event.data.body.retVal);
        break;

      case 'init':
        // Mapping the source file data structures to a form that ReactFlow can load.
        console.log('Docker status result: ', event.data.body.dockerInstalled);
        try {
          console.log('FROM APP ON LOAD!!!!!', event);
          console.log(event.data.body.edges);
          setNodes(event.data.body.nodes);
          setEdges(event.data.body.edges);
          setQueryNodes(event.data.body.model.nodes);
          setQueryEdges(event.data.body.model.edges);
        } catch (error) {
          // If for some reason the model containment reference does not have the same amount of elements as the view-model containment reference, we have to handle this.
          /*
          console.log(error);
          */
        }
        break;

      default:
        break;
    }
  });

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === lastClickedNode.id) {
          // it's important that you create a new object here
          // in order to notify react flow about the change
          // eslint-disable-next-line no-param-reassign
          node.style = { ...node.style, backgroundColor: nodeBg };
        }

        return node;
      })
    );
  }, [nodeBg, setNodes]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === lastClickedNode.id) {
          // it's important that you create a new object here
          // in order to notify react flow about the change
          // eslint-disable-next-line no-param-reassign
          node.style = { ...node.style, fontWeight: nodeFontWeight, backgroundColor: nodeBg, fontStyle: nodeFontStyle };
        }
        VSCodeAPI.postReactFlowNodeStyleChange(node);
        return node;
      })
    );
  }, [nodeFontWeight, nodeFontStyle, nodeBg, setNodes]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    // A convoluted way to remove the no assignment to parameters linting error...
    event.dataTransfer.dropEffect.replace(event.dataTransfer.dropEffect.valueOf(), 'move');
  }, []);

  const onConnect = useCallback((connection: ReactFlowConnection) => {
    setEdges((eds: ReactFlowEdge[]) => addEdge(connection, eds));
  }, []);

  // Will call VSCodeAPI when built...
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const onNodeDragStop = (event: React.MouseEvent<Element, MouseEvent>, node: ReactFlowNode) => {
    VSCodeAPI.postReactFlowNodePositionChange(node);
  };

  /* to pass data to ext...
  function dataToExtension() {
    return JSON.stringify({ nodes, edges });
  }
  */

  const onNodeClick = (event: React.MouseEvent<Element, MouseEvent>, node: ReactFlowNode<unknown, string>) => {
    setLastClickedNode(node);
    console.log(node.type);
    VSCodeAPI.postReactFlowNodeSelect(node);
  };

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position: ReactFlowPosition = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      let nodeStyle;
      let nodeHandles: ViewModelHandle[];
      UserCreatedNodes.forEach((viewModNode) => {
        if (type === viewModNode.type) {
          nodeStyle = viewModNode.style;
          nodeHandles = viewModNode.handles;
        }
      })

      const newNode = {
        id: getId(type),
        type,
        position,
        style: nodeStyle,
        data: {
          label: `${type} node`,
          nodeLink: getId(type),
          '@context': 'git@repo.techngs.us:technergetics/techngs-metamodel/base.metamodel',
          handles: nodeHandles
        },
      };

      setNodes((nds: ReactFlowNode[]) => nds.concat(newNode));
      setLastClickedNode(newNode);
      VSCodeAPI.postReactFlowNodeAdd(newNode);
    },
    [reactFlowInstance]
  );

  useEffect(() => {
    VSCodeAPI.postAppLoadComplete();
  }, []);

  const onNodeDeselect = () => {
    setCurrentSelectionSchema(null);
  };

  useEffect(() => {
    if (nodeLength === 0) {
      setNodeLength(nodes.length);
    } else if (nodes.length > nodeLength) {
      console.log('Add call...');
      setNodeLength(nodes.length);
    } else if (nodeLength > nodes.length) {
      console.log('Delete call...');
      setCurrentSelectionSchema(null);
      VSCodeAPI.postReactFlowNodeDelete(lastClickedNode);
      setNodeLength(nodes.length);
    }
  }, [nodes.length]);

  useEffect(() => {
    VSCodeAPI.postReactFlowEdgesChange(edges);
    console.log(edges);
  }, [edges]);

  // Will change to pass through single edges eventually, not of major importance right now...
  return (
    <VSCodePanels>
      <VSCodePanelTab title="Visual model editor.">EDITOR</VSCodePanelTab>
      <VSCodePanelTab title="Query the model with OpenCypher."> QUERY</VSCodePanelTab>
      <VSCodePanelView>
        <div>
          <div className="dndflow">
            <div className="background" />
            <ReactFlowProvider>
              <div className="reactflow-wrapper" ref={reactFlowWrapper}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  defaultNodes={[]}
                  defaultEdges={[]}
                  onNodesChange={onNodesChange}
                  onNodeDragStop={onNodeDragStop}
                  onNodeClick={onNodeClick}
                  onEdgesChange={onEdgesChange}
                  onPaneClick={onNodeDeselect}
                  onConnect={onConnect}
                  onInit={setReactFlowInstance}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  fitView
                  nodeTypes={nodeTypes}
                >
                  <Background color="#575757" />
                  <Controls />
                  <MiniMap />
                </ReactFlow>
              </div>
            </ReactFlowProvider>
            {!currSelectionSchema ? <Sidebar /> : null}
            {lastClickedNode && currSelectionSchema && currentSelectionINode ? (
              <PropertyEditor schema={currSelectionSchema} node={currentSelectionINode} />
            ) : null}
          </div>
        </div>
      </VSCodePanelView>
      <VSCodePanelView>
        {queryResponse ? <p>${JSON.stringify(queryResponse)}</p> : null}
        {queryNodes ? (
          <>
            <div style={{ height: 500, width: 1200 }}>
              {' '}
              <MemgraphView initNodes={nodes} initEdges={edges} strength={-1000} distance={150} />
            </div>
            <VSCodeDivider />
            <CypherEditor />
          </>
        ) : (
          <div>Loading...</div>
        )}
      </VSCodePanelView>
    </VSCodePanels>
  );
}

export default DnDFlow;
