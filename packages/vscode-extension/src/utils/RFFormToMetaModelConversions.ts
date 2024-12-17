import { XYPosition } from "reactflow";
import typia from "typia";
import { ViewModelNode, LinkedDataContext, NodeId, ViewModelHandle } from "../../../core/src/base.metamodel";
import { Node } from "reactflow";

export const rfNodeToViewModNode = (inputRFNode: Node): ViewModelNode => {
    /** 
    * @param inputRFNode - input RF Node to be transformed to type ViewModelNode.
    * @returns ViewModelNode - Returns resulting transformation from RF Node form to ViewModelNode. 
    */
   return ({
    '@context': typia.assert<LinkedDataContext>(inputRFNode.data['@context']),
    nodeLink: typia.assert<NodeId>(inputRFNode.data.nodeLink),
    '@id': typia.assert<NodeId>(inputRFNode.id),
    position: typia.assert<XYPosition>(inputRFNode.position),
    style: inputRFNode.style,
    handles: typia.assert<ViewModelHandle[]>(Object.assign(inputRFNode.data.handles.sourceHandles, inputRFNode.data.handles.targetHandles))
   });
  };


const handlesToViewModelHandles = (inputRFNode: Node): ViewModelHandle[] => {
  const sourceHandles: ViewModelHandle[] = inputRFNode.data.handles.sourceHandles;
  const targetHandles: ViewModelHandle[] = inputRFNode.data.handles.targetHandles;
  const handles: ViewModelHandle[] = Object.assign(sourceHandles, targetHandles);
  return handles;
};


