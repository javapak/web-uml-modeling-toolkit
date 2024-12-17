/* eslint-disable no-case-declarations */
import * as vscode from 'vscode';
import { TechngsModelDocument } from './TechngsModelDocument';
import { WebviewCollection } from './WebviewCollection';
import { disposeAll } from './dispose';
import path from 'path';
import { compile } from './utils/CompileTimeValidation';
import { getNonce, getNodeProps, nodePropsToFormSchema} from './utils/util';
import { saveToViewModAndMod, loadFromView, getViewNodeAndReplaceOrDelete, getINodeOrDeleteINode, getModelForDisplay } from './utils/LoadAndSave';
import ts from 'typescript';
import { Edge, Node } from 'reactflow';
import { allocateToDatabase, executeUserQueries } from './utils/Cypher';
import { doesDockerExist } from './utils/CLI';
import { ModelBrowserProvider } from './ModelBrowserProvider';
import { MessageTypes } from "../../vscode-model-webview/src/enums";


export class TechngsModelEditorProvider implements vscode.CustomEditorProvider<TechngsModelDocument> {

	private static newFileId = 1;
	

	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		vscode.commands.registerCommand('techngs.model.new', () => {
			const workspaceFolders = vscode.workspace.workspaceFolders;
			if (!workspaceFolders) {
				vscode.window.showErrorMessage("Creating new tchmd files currently requires opening a workspace");
				return;
			}

			const uri = vscode.Uri.joinPath(workspaceFolders[0].uri, `new-${TechngsModelEditorProvider.newFileId++}.mts`)
				.with({ scheme: 'untitled' });

			vscode.commands.executeCommand('vscode.openWith', uri, TechngsModelEditorProvider.viewType);
		});

		return vscode.window.registerCustomEditorProvider(
			TechngsModelEditorProvider.viewType,
			new TechngsModelEditorProvider(context),
			{
				webviewOptions: {
					retainContextWhenHidden: true,
				},
				supportsMultipleEditorsPerDocument: false,
			});
	}

	private static readonly viewType = 'techng.model';

	/**
	 * Tracks all known webviews
	 */
	private readonly webviews = new WebviewCollection();

	constructor(
		private readonly _context: vscode.ExtensionContext
	) { }

	//#region CustomEditorProvider

	async openCustomDocument(
		uri: vscode.Uri,
		openContext: { backupId?: string },
		_token: vscode.CancellationToken
	): Promise<TechngsModelDocument> {
		const treeView = vscode.window.createTreeView('modExp', {treeDataProvider: new ModelBrowserProvider()});
		console.log(treeView.visible);
		const document: TechngsModelDocument = await TechngsModelDocument.create(uri, openContext.backupId, {
			getFileData: async () => {
				const webviewsForDocument = Array.from(this.webviews.get(document.uri));
				if (!webviewsForDocument.length) {
					throw new Error('Could not find webview to save for');
				}
				const panel = webviewsForDocument[0];
				const response = await this.postMessageWithResponse<number[]>(panel, 'init', {});
				return new Uint8Array(response);
			}
		});
		const listeners: vscode.Disposable[] = [];

		listeners.push(document.onDidChange(e => {
			// Tell VS Code that the document has been edited by the user.
			this._onDidChangeCustomDocument.fire({
				document,
				...e,
			});
		}));

		listeners.push(document.onDidChangeContent(e => {
			// Update all webviews when the document changes
			for (const webviewPanel of this.webviews.get(document.uri)) {
				this.postMessage(webviewPanel, 'update', {
					edits: e.edits,
					content: e.content,
				});
			}
		})); 

		document.onDidDispose(() => disposeAll(listeners));

		return document;
	}

	async resolveCustomEditor(
		document: TechngsModelDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
		// Add the webview to our internal set of active webviews
		this.webviews.add(document.uri, webviewPanel);

		// Setup initial content for the webview
		webviewPanel.webview.options = {
			enableScripts: true,
		};
		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview, document.documentData.toString);

		webviewPanel.webview.onDidReceiveMessage(e => this.onMessage(document, e));
		

		// Wait for the webview to be properly ready before we init
		webviewPanel.webview.onDidReceiveMessage(message => { 
			const decoder = new TextDecoder();
			const viewModelPath = document.uri.fsPath;
			const modelPath = document.uri.fsPath.replace('views', 'models').replace('.cts', '.mts');
			switch (message.type) {
				case MessageTypes.EDGES_CHANGE:
					console.log(message.data.edges);
					const edges: Edge[] = []; 
					const currEdges: Edge[] = message.data.edges;
					currEdges.forEach((ed: Edge) => {
						ed.data = {'@context': undefined};
						console.log('FROM EDGESCHANGE!!!!! ', ed);
						edges.push(ed);
					});


					saveToViewModAndMod(viewModelPath, modelPath, undefined, undefined, undefined, edges);
					break;
				case MessageTypes.NODE_ADD: 
					console.log('This node should be added: ', message.data.node);
					saveToViewModAndMod(viewModelPath, modelPath, message.data.node);
					break;

				case MessageTypes.APP_LOAD_COMPLETE: 
					console.log('ready call was received...');
					// eslint-disable-next-line no-case-declarations
					allocateToDatabase(modelPath);
					const viewModelAndModel = loadFromView(viewModelPath, modelPath);
					console.log('MODPATH!!!!', modelPath);
					const model = getModelForDisplay(modelPath);
					this.postMessage(webviewPanel, "init", { dockerInstalled: doesDockerExist(), nodes: viewModelAndModel?.nodes as Node<any, string>[], edges: viewModelAndModel?.edges as Edge<any>[], model});
					break;

				case MessageTypes.STYLE_CHANGE:
					getViewNodeAndReplaceOrDelete(message.data.node, viewModelPath, true);
					break;

				case MessageTypes.POSITION_CHANGE:
					console.log(message);
					getViewNodeAndReplaceOrDelete(message.data.node, viewModelPath, true);
					break;

				case MessageTypes.NODE_DELETE: 
					getViewNodeAndReplaceOrDelete(message.data.node, viewModelPath);
					getINodeOrDeleteINode(message.data.node, modelPath);
					break;
				
				case MessageTypes.NODE_SELECT:
					const props = getNodeProps(message.data.node);
					const inode = getINodeOrDeleteINode(message.data.node, modelPath, true);
					console.log('FROM GET INODE', inode);
					if (props) {
					this.postMessage(webviewPanel, "NodeSelectionResponse", { schema: nodePropsToFormSchema(props), node: inode });

					}
					break;
				case MessageTypes.CYPHER:
					const retVal = executeUserQueries(message.data.queries);
					console.log(retVal);
					this.postMessage(webviewPanel, "queryReturn", {retVal});
 
			}

		
		}); 
	}

	private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<vscode.CustomDocumentEditEvent<TechngsModelDocument>>();
	public readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;

	public saveCustomDocument(document: TechngsModelDocument, cancellation: vscode.CancellationToken): Thenable<void> {
		return document.save(cancellation);
	}

	public saveCustomDocumentAs(document: TechngsModelDocument, destination: vscode.Uri, cancellation: vscode.CancellationToken): Thenable<void> {
		return document.saveAs(destination, cancellation);
	}

	public revertCustomDocument(document: TechngsModelDocument, cancellation: vscode.CancellationToken): Thenable<void> {
		return document.revert(cancellation);
	}

	public backupCustomDocument(document: TechngsModelDocument, context: vscode.CustomDocumentBackupContext, cancellation: vscode.CancellationToken): Thenable<vscode.CustomDocumentBackup> {
		return document.backup(context.destination, cancellation);
	}


	//#endregion

	/**
	 * Get the static HTML used for in our editor's webviews.
	 */
	private getHtmlForWebview(webview: vscode.Webview, jsonString : () => string): string {
		const nonce = getNonce();
		const webviewPath = 'packages/vscode-model-webview/dist';
		console.log('There was atleast an attempt to get the webview...');
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const manifest = require(path.join(this._context.extensionPath, webviewPath, 'manifest.json'));
		const mainStyle = manifest['index.css']['file'];
		const mainScript = manifest['index.html']['file'];
		const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._context.extensionUri, webviewPath, mainStyle));
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._context.extensionUri, webviewPath, mainScript));

		return /* html */`<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
			<meta name="theme-color" content="#000000">
			<title>React App</title>
			<link rel="stylesheet" type="text/css" href="${styleUri}">
			<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} blob:; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
			<base href="${webview.asWebviewUri(vscode.Uri.joinPath(this._context.extensionUri, webviewPath))}/">
		</head>
		<body>
			<noscript>You need to enable JavaScript to run this app.</noscript>
			<div id="root"></div>
			
			<script nonce="${nonce}" src="${scriptUri}"></script>



		</body>
		</html>`;
	}

	private _requestId = 1;
	private readonly _callbacks = new Map<number, (response: any) => void>();

	private postMessageWithResponse<R = unknown>(panel: vscode.WebviewPanel, type: string, body: any): Promise<R> {
		const requestId = this._requestId++;
		const p = new Promise<R>(resolve => this._callbacks.set(requestId, resolve));
		panel.webview.postMessage({ type, requestId, body });
		return p;
	}

	private postMessage(panel: vscode.WebviewPanel, type: string, body: any): void {
		panel.webview.postMessage({ type, body });
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	private onMessage(document: TechngsModelDocument, message: any) {
	}
}

