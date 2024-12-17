/* eslint-disable no-param-reassign */
import { VSCodeTextField, VSCodeTag, VSCodeButton } from '@vscode/webview-ui-toolkit/react';
import React from 'react';
/* Pass through use states of nodes instead of accessing the dom. This is more in line with the design principles of React
and also retains encapsulation */
const propertyEditor: React.FC<{
  schema: Record<string, any>;
  node: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}> = ({ schema, node }) => {
  const propNames = Object.keys(schema.properties);
  return (
    <aside>
      <h3>Node Property Editor</h3>
      <VSCodeTag>{node.name}</VSCodeTag>
      {propNames.map((propName: string) => (
        <div>
          <p>
            {propName} : {schema.properties[propName].type}
          </p>
          <VSCodeTextField />
        </div>
      ))}
      <br />
      <VSCodeButton name="Save">SAVE</VSCodeButton>
    </aside>
  );
};

export default propertyEditor;
