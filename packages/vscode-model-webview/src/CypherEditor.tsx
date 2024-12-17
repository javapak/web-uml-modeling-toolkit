/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/button-has-type */
import React, { useRef, useState } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';
import VSCodeAPI from './VSCodeWrapper';

function CypherEditor() {
  const [code, setCode] = React.useState(``);
  return (
    <>
      <CodeEditor
        value={code}
        language="cypher"
        placeholder="Enter your cypher queries here. Specify a valid return statement to see visual results in the viewport, otherwise none will occur."
        onChange={(evn: any) => setCode(evn.target.value)}
        padding={15}
        data-color-mode="dark"
        style={{
          fontSize: 12,
          fontFamily: 'Arial',
        }}
      />
      <VSCodeButton
        onClick={(event) => {
          VSCodeAPI.postCypherQuery(code);
        }}
      >
        RUN
      </VSCodeButton>
    </>
  );
}

export default CypherEditor;
