import * as vscode from 'vscode';
import { getModelForDisplay } from './utils/LoadAndSave';


export function activateBrowserProvider(context: vscode.ExtensionContext) {
  vscode.window.registerTreeDataProvider('modExp', new ModelBrowserProvider);
} 
export class ModelBrowserProvider implements vscode.TreeDataProvider<TreeItem> {
  onDidChangeTreeData?: vscode.Event<TreeItem|null|undefined>|undefined;

  data: TreeItem[] = [];

  constructor() {
    const thenablePaths = vscode.workspace.findFiles('**/models/*.mts');

    thenablePaths.then((value) => {
      value.forEach((val) => {
        console.log('HI FROM BROWSER PROVIDER', val);
        const children: TreeItem[] = [];
        getModelForDisplay(val.fsPath)?.nodes.forEach((node) => {
          children.push(new TreeItem(node.name));
        });
        this.data.push(new TreeItem(val.fsPath, ));
      });
  });




}

  getTreeItem(element: TreeItem): vscode.TreeItem|Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: TreeItem|undefined): vscode.ProviderResult<TreeItem[]> {
    if (element === undefined) {
      return this.data;
    }
    return element.children;
  }
}

class TreeItem extends vscode.TreeItem {
  children: TreeItem[]|undefined;

  constructor(label: string, children?: TreeItem[]) {
    super(
        label,
        children === undefined ? vscode.TreeItemCollapsibleState.None :
                                 vscode.TreeItemCollapsibleState.Expanded);
    this.children = children;
  }
}
