import typia from "typia";
import { EdgeId, EdgeReferenceType, HandleId, IEdge, INode, LinkedDataContext, LinkedDataId, NodeId, NodeReferenceType, ViewModelEdge, ViewModelHandle, ViewModelNode, XYPosition } from "../../../core/src/base.metamodel";
import { Edge, EdgeMarker, MarkerType, Node } from "reactflow";

export const rfNodeToINode = ({
    id,
    type,
    data
  }: Node) => ({
    type: typia.assert<NodeReferenceType>(type),
    "@id": typia.assert<NodeId>(id),
    "@context": typia.assert<LinkedDataContext>(data['@context']),
    name: data.label
  });
  
  export const assignInterfaceType = ({});
  
  export type NodeViewNodeToRFNodeInput = {
    inputINode: INode,
    inputViewNode: ViewModelNode,
  }
  
  export const iNodeViewNodeToRFNode = (inputINode: INode, inputViewNode: ViewModelNode): Node<any, string> => ({
      id: typia.assert<NodeId>(inputINode['@id']),
      type: typia.assert<NodeReferenceType>(inputINode.type),
      position: typia.assert<XYPosition>(inputViewNode.position),
      data: {
        label: inputINode.name,
        '@context': typia.assert<LinkedDataContext>(inputINode["@context"]),
        nodeLink: typia.assert<NodeId>(inputViewNode.nodeLink),
        handles: typia.assert<ViewModelHandle[]>(inputViewNode.handles),
      },
      style: inputViewNode.style,
  });

  export const rfEdgeToIEdge = (input: Edge): IEdge => ({
    type: typia.assert<EdgeReferenceType>('Undefined'),
    '@id': typia.assert<EdgeId>(input.id),
    '@context': typia.assert<LinkedDataContext>(input.data['@context']),
    sourceType: typia.assert<NodeReferenceType>(input.source.split('/')[1]),
    targetType: typia.assert<NodeReferenceType>(input.target.split('/')[1]),
    sourceLink: typia.assert<NodeId>(input.source),
    targetLink: typia.assert<NodeId>(input.target)
  });

  export const rfEdgeToViewEdge = (input: Edge): ViewModelEdge => {
    console.log(input.id);
    return ({
    edgeLink: typia.assert<LinkedDataId>(input.id),
    sourceID: typia.assert<NodeId>(input.source),
    targetID: typia.assert<NodeId>(input.target),
    markerStart: typia.assert<EdgeMarker>({type: input.markerStart?.toString()}),
    markerEnd: typia.assert<EdgeMarker>({type: input.markerEnd?.toString()}),
    "@context": typia.assert<LinkedDataContext>(input.data['@context']),
    "@id": typia.assert<EdgeId>(input.id)
  });};
  
  export const iEdgeViewEdgeToRFEdge = (inputIEdge: IEdge, inputViewEdge: ViewModelEdge): Edge => ({
    id: typia.assert<EdgeId>(inputIEdge["@id"]),
    source: typia.assert<NodeId>(inputIEdge.sourceLink),
    target: typia.assert<NodeId>(inputIEdge.targetLink),
  });


