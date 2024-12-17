export type Node = {
	id: string, 
	data: { label: string }, 
	position: { x: number, y: number },
	type: string
}

export type Edge = {
	id: string;
	type?: string;
	source: string;
	target: string;
	sourceHandle?: string | null;
	targetHandle?: string | null;
	label?: string | object;
	labelStyle?: object;
	labelShowBg?: boolean;
	labelBgStyle?: object;
	labelBgPadding?: [number, number];
	labelBgBorderRadius?: number;
	style?: object;
	animated?: boolean;
	hidden?: boolean;
	deletable?: boolean;
	focusable?: boolean;
	data?: object;
	className?: string;
	sourceNode?: Node;
	targetNode?: Node;
	selected?: boolean;
}