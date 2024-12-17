import * as vscode from 'vscode';
import { TechngsModelEditorProvider } from './TechngsModelEditorProvider'; 
import { activateBrowserProvider } from './ModelBrowserProvider';

export function activate(context: vscode.ExtensionContext) {
	// Register our custom editor providers
	context.subscriptions.push(TechngsModelEditorProvider.register(context));
	activateBrowserProvider(context);
}
