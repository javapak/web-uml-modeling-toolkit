import { Node } from './types';

export interface TechngsModelEdit {
	readonly nodeAdd: Node;
	readonly nodeDelete: Node;
	readonly posChange: Node;
}

export interface TechngsModelDocumentDelegate {
	getFileData(): Promise<Uint8Array>;
}