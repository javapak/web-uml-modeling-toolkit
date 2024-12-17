/* eslint-disable no-param-reassign */
import React, { CSSProperties, useState } from 'react';
import { NodeToolbar, XYPosition } from 'reactflow';
import { Palette, PencilSquare, TypeBold, TypeItalic } from 'react-bootstrap-icons';
import { Block } from '@uiw/react-color';
import { VSCodeTextField } from '@vscode/webview-ui-toolkit/react';
import VSCodeAPI from '../VSCodeWrapper'

type Node<T = any, U extends string = string> = {
  type?: U;
  data: T & { label: string; value: string | number; id: string };
  isConnectable?: boolean;
  selected?: boolean;
  id: string;
  style?: CSSProperties;
  position: XYPosition;
};

/* Pass through use states of nodes instead of accessing the dom. This is more in line with the design principles of React
and also retains encapsulation */
const toolBar: React.FC<{
  node: Node;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}> = ({ node }) => {
  const [visible, setVisible] = useState(false);
  const [visibleInputField, setVisibleInput] = useState(false);
  const [hex, setHex] = useState('#fff');
  const [italics, italicsToggle] = useState(false);
  const [bold, boldToggle] = useState(false);
  const palClick = () => {
    setVisible(!visible);
  };

  if (!node.style) {
    node.style = { fontWeight: '', fontStyle: '', backgroundColor: '' };
  }

  return (
    <NodeToolbar nodeId={node.data.id} isVisible={node.selected}>
      {visible ? (
        <Block
          color={hex}
          onChange={(color) => {
            setHex(color.hex);
            // why is no-param-reassign a lint warning?? is this bad practice? i think i could see that in terms of encapsulation or OOP...

            node.style.backgroundColor = color.hex;
            VSCodeAPI.postReactFlowNodeStyleChange(node)
          }}
          className="colPicker"
        />
      ) : null}
      <Palette onClick={palClick} title="Color selector." style={{ padding: 10 }} />
      <TypeBold
        style={{ padding: 10 }}
        onClick={() => {
          // const div = document.getElementById(node.id); This is a no no. The establishment of stateful props will make reloading data so much easier later.
          // Fixed, but if anyone joins me to work on this later, please don't use the above method to make visual changes to DOM nodes.
          if (!bold) {
            boldToggle(true);
            node.style.fontWeight = 'bold';
          } else {
            node.style.fontWeight = 'normal';
            boldToggle(false);
          }
          window.postMessage({ type: 'NodeFontWeightChange', node });
        }}
        title="Toggle label text bold."
      />
      <PencilSquare style={{ padding: 10 }} onClick={() => setVisibleInput(!visibleInputField)} />
      {visibleInputField ? <VSCodeTextField placeholder={node.data.label} value={node.data.label} /> : null}
    </NodeToolbar>
  );
};

export default toolBar;
