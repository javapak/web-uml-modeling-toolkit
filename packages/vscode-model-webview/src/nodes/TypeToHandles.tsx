import { Position } from "reactflow";

const TypeToHandles = new Map<string, any>([
  ['Action', { sourceHandles: [{ position: Position.Bottom }], targetHandles: [{ position: Position.Top }] }],
  ['Actor', { sourceHandles: [{ position: Position.Bottom }], targetHandles: [{ position: Position.Top }] }],
  [
    'Decision',
    {
      sourceHandles: [{ position: Position.Bottom }, { position: Position.Right }],
      targetHandles: [{ position: Position.Top }],
    },
  ],

  ['StartFlowPoint', { sourceHandles: [{ position: Position.Bottom }], targetHandles: [] }],
  ['FinalFlowPoint', { sourceHandles: [], targetHandles: [{ position: Position.Top }] }],
  ['UseCase', { sourceHandles: [{ position: Position.Bottom }], targetHandles: [{ position: Position.Top }] }],
]);

export default TypeToHandles;
