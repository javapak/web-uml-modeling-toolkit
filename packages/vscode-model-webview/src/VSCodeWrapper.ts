/* eslint-disable @typescript-eslint/no-explicit-any */
import { Node as ReactFlowNode, Edge as ReactFlowEdge } from 'reactflow';
import { MessageTypes } from './enums';


interface VSCodeApi {
  postMessage: (message: any) => void;
}

declare const acquireVsCodeApi: () => VSCodeApi;
// Enumerate string literals defining different post message types for data handling...

class VSCodeWrapper {
  private readonly vscodeApi: VSCodeApi = acquireVsCodeApi();

  /**
   * Send message to the extension framework.
   * @param message
   */

  // Add methods here based on given types instead of calling them by literal or even through
  public postAppLoadComplete(): void {
    this.vscodeApi.postMessage({ type: MessageTypes.APP_LOAD_COMPLETE });
  }

  public postReactFlowNodeAdd(nodeAdded: ReactFlowNode): void {
    this.vscodeApi.postMessage({ type: MessageTypes.NODE_ADD, data: { node: nodeAdded } });
  }

  public postReactFlowNodeSelect(nodeSelected: ReactFlowNode): void {
    this.vscodeApi.postMessage({ type: MessageTypes.NODE_SELECT, data: { node: nodeSelected } });
  }

  public postReactFlowEdgesChange(edges: ReactFlowEdge[]): void {
    this.vscodeApi.postMessage({ type: MessageTypes.EDGES_CHANGE, data: { edges } });
  }

  public postReactFlowNodeDelete(nodeDeleted: ReactFlowNode): void {
    this.vscodeApi.postMessage({ type: MessageTypes.NODE_DELETE, data: { node: nodeDeleted } });
  }

  public postReactFlowNodeStyleChange(nodeChanged: ReactFlowNode) {
    this.vscodeApi.postMessage({ type: MessageTypes.STYLE_CHANGE, data: { node: nodeChanged } });
  }

  public postReactFlowNodePositionChange(nodeChanged: ReactFlowNode) {
    this.vscodeApi.postMessage({ type: MessageTypes.POSITION_CHANGE, data: { node: nodeChanged } });
  }

  public postCypherQuery(queries: string) {
    this.vscodeApi.postMessage({ type: MessageTypes.CYPHER, data: { queries } });
  }

  /**
   * Add listener for messages from extension framework.
   * @param callback called when the extension sends a message
   * @returns function to clean up the message eventListener.
   */
  // No opportunity to use this. Need to leave in class though for now...
  // eslint-disable-next-line class-methods-use-this
  public onMessage(callback: (message: any) => void): () => void {
    window.addEventListener('message', callback);
    return () => window.removeEventListener('message', callback);
  }
}

// Singleton to prevent multiple fetches of VsCodeAPI.
const VSCodeAPI: VSCodeWrapper = new VSCodeWrapper();

export default VSCodeAPI;
