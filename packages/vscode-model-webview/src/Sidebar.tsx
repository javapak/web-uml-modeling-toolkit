import React from 'react';
import { VSCodePanels, VSCodePanelView, VSCodePanelTab, VSCodeTextField } from '@vscode/webview-ui-toolkit/react';
import './index.css';
import ActivityNodes from './ActivityNodes';
import GeneralNodes from './GeneralNodes';

const Sidebar: React.FC<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, react/function-component-definition
}> = () => (
  <aside>
    <VSCodePanels>
      <VSCodePanelTab title="Behavioral Nodes" id="tab-1">
        BEHAVIORAL
      </VSCodePanelTab>
      <VSCodePanelTab title="Structural Nodes">STRUCTURAL</VSCodePanelTab>
      <VSCodePanelTab title="General Nodes">GENERAL</VSCodePanelTab>
      <VSCodePanelView id="view-1">
        <ActivityNodes />
      </VSCodePanelView>
      <VSCodePanelView id="view-2">
        <div>placeholder...</div>
      </VSCodePanelView>
      <VSCodePanelView id="view-3">
        <GeneralNodes />
      </VSCodePanelView>
    </VSCodePanels>
  </aside>
);

export default Sidebar;
