import React, { CSSProperties, memo, useState } from 'react';
import { NodeResizer } from '@reactflow/node-resizer';
import '@reactflow/node-resizer/dist/style.css';
import { Handle, Position } from 'reactflow';
import NodeToolBar from './NodeToolBar';
import { ViewModelHandle, XYPosition } from '../../../core/src/base.metamodel';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// unused props will be checked elsewhere...
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// updating to create stateful encapsulation without accessing dom nodes.
const DynamicNodeCall = memo(
  // eslint-disable-next-line @typescript-eslint/no-shadow
  (Node: {
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: {
      label: string;
      value: string | number;
      id: string;
      handles: ViewModelHandle[];
      nodeStore?: { [k: string]: any }; // This stands to make dynamic property storage possible. Validating numerous types of data is a tedious process.
    };
    isConnectable?: boolean;
    selected?: boolean;
    id: string;
    style?: CSSProperties;
    shape?: CSSProperties;
    position: XYPosition;
  }) => {
    const keepAspectRatio = true;
    const [visible, setVisible] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [style, setStyle] = useState(Node.style);
    
    return (

      <>
        <NodeToolBar node={Node} />
        <NodeResizer nodeId={Node.data.id} isVisible={Node.selected} keepAspectRatio={keepAspectRatio} />
        <p>{Node.data.label}</p>

        {Node.data.handles.map((viewModHandle) => (
          <Handle type={viewModHandle.type} position={viewModHandle.position} />
        ))}


      </>
    );
  }
);

export default DynamicNodeCall;
