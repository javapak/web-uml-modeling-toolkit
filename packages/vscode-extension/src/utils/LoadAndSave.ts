import { Node, Edge } from "reactflow";
import { evaluate } from "ts-evaluator";
import * as tsmorph from "ts-morph";
import ts from "typescript";
import { EdgeId, IEdge, INode, Model, ViewModel, ViewModelEdge, ViewModelNode, HandleId} from "../../../core/src/base.metamodel";
import { iNodeViewNodeToRFNode, iEdgeViewEdgeToRFEdge, rfNodeToINode, rfEdgeToViewEdge, rfEdgeToIEdge } from "./MetaModelFormToRFConversions";
import { rfNodeToViewModNode } from "./RFFormToMetaModelConversions";
import * as uuid from 'uuid-int';
import typia from "typia";

export function getINodeOrDeleteINode(someNode: Node, filePathModel: string, retNode?: boolean): INode | undefined | number {
  const Project = new tsmorph.Project();
  const sourceFileModel = Project.addSourceFileAtPath(filePathModel);
  const typeChecker = Project.getTypeChecker();
  const tsTC = typeChecker.compilerObject as unknown as ts.TypeChecker;
  const modelDecl = sourceFileModel.getVariableDeclarationOrThrow('model').compilerNode as unknown as ts.Declaration;
  const model = evaluate({typeChecker: tsTC, node: modelDecl});

  if (model.success) {
    const modelVal: Model = model.value as Model;
    let foundNode: INode | undefined = undefined;
    let foundNodeIndex = 0;
    modelVal.nodes.forEach((node, index) => {
      if (node["@id"] === someNode.id) {
        console.log('SUCCESSFUL ID PAIR FOUND');
        foundNode = node;
        foundNodeIndex = index;

      }
    });
    if (retNode) {
      return foundNode;
    }
    else {
      console.log(foundNodeIndex);
      console.log(JSON.stringify(modelVal.nodes.splice(foundNodeIndex, 1)));
      sourceFileModel.getVariableDeclarationOrThrow('model').getInitializerIfKindOrThrow(tsmorph.SyntaxKind.ObjectLiteralExpression).getProperty('nodes')?.remove();
      sourceFileModel.getVariableDeclarationOrThrow('model').getInitializerIfKindOrThrow(tsmorph.SyntaxKind.ObjectLiteralExpression).addPropertyAssignment({
        name: 'nodes',
        initializer: JSON.stringify(modelVal.nodes.splice(foundNodeIndex, 1)
        ,null, 2),
      });
      sourceFileModel.save();
    }
  }
}

export function getViewNodeAndReplaceOrDelete(someNode: Node, filePathViewModel: string, replace?: boolean) {
  // In the event the optional replace parameter boolean is not provided, we opt to delete the viewModelNode instead. 
  const Project = new tsmorph.Project();
  const sourceFileView = Project.addSourceFileAtPath(filePathViewModel);
  const typeChecker = Project.getTypeChecker();
  const tsTC = typeChecker.compilerObject as unknown as ts.TypeChecker;
  const viewDecl = sourceFileView.getVariableDeclarationOrThrow('viewModel').compilerNode as unknown as ts.Declaration;
  const view = evaluate({typeChecker: tsTC, node: viewDecl});
  let foundNodeIndex = 0;

  if (view.success) {
    const viewval: ViewModel = view.value as ViewModel;

    viewval.viewModelNodes.forEach((node, index) =>  {
        if (node['@id'] === someNode.id) {
          console.log('ViewMod PAIR FOUND at ', index);
          foundNodeIndex = index;
          if (replace) {
            viewval.viewModelNodes[index] = rfNodeToViewModNode(someNode);
            console.log('Replace call successful!');
          }
        }
    });

  console.log('updated ViewNodes...', viewval.viewModelNodes);
  sourceFileView.getVariableDeclarationOrThrow('viewModel').getInitializerIfKindOrThrow(tsmorph.SyntaxKind.ObjectLiteralExpression).getProperty('viewModelNodes')?.remove();
  if (replace) {
    sourceFileView.getVariableDeclarationOrThrow('viewModel').getInitializerIfKindOrThrow(tsmorph.SyntaxKind.ObjectLiteralExpression).addPropertyAssignment({name: 'viewModelNodes', initializer: JSON.stringify(viewval.viewModelNodes, null, 2)});
    sourceFileView.save();
    return;
  }

    
    sourceFileView.getVariableDeclarationOrThrow('viewModel').getInitializerIfKindOrThrow(tsmorph.SyntaxKind.ObjectLiteralExpression).addPropertyAssignment({name: 'viewModelNodes', initializer:JSON.stringify(viewval.viewModelNodes.splice(foundNodeIndex, 1))});
    sourceFileView.save();
  }
}



  

export function loadFromView(filePathViewModel: string, filePathModel: string) {
    const Project = new tsmorph.Project();
    const sourceFileView = Project.addSourceFileAtPath(filePathViewModel);
    const sourceFileModel = Project.addSourceFileAtPath(filePathModel);
    const typeChecker = Project.getTypeChecker();
    const tsTC = typeChecker.compilerObject as unknown as ts.TypeChecker;
  
    const viewModelDecl = sourceFileView.getVariableDeclarationOrThrow('viewModel').compilerNode as unknown as ts.Declaration;
    
  
    const modelDecl = sourceFileModel.getVariableDeclarationOrThrow('model').compilerNode as unknown as ts.Declaration;
    const viewModel = evaluate({node: viewModelDecl, typeChecker: tsTC });
    const model = evaluate({typeChecker: tsTC, node: modelDecl});
  
    if (model.success && viewModel.success) {
      const modelVal = model.value as Model;
      const viewModelVal = viewModel.value as ViewModel;
      const validateAndFormatNodes : Node[] = [];
      const validateAndFormatEdges: Edge[] = [];
      for (let i = 0; i < viewModelVal.viewModelNodes.length; i++) {
        // Unless the user were to modify the source from a text editor, it can be assumed that these two arrays would always be of the same length. 
        // If we need to potentially verify that this is the case though, that can be done.
        console.log('FROM LOAD UTIL!!!!!!', viewModelVal.viewModelNodes[i].handles);
        validateAndFormatNodes.push(iNodeViewNodeToRFNode(modelVal.nodes[i], viewModelVal.viewModelNodes[i]));
      }
  
      for (let i = 0; i  < viewModelVal.viewModelEdges.length; i++) {
        const edgeFormat = iEdgeViewEdgeToRFEdge(modelVal.edges[i], viewModelVal.viewModelEdges[i]);
        console.log('EDGE AFTER CALL IN EXTENSION!!!!!', edgeFormat);
        validateAndFormatEdges.push(edgeFormat);
      }

      console.log('NODES: ' + validateAndFormatNodes + ' EDGES: ' + validateAndFormatEdges);
      return {nodes: validateAndFormatNodes as Node<string, any>[], edges: validateAndFormatEdges};
    }
    
    
  }
export function getModelForDisplay(filePathModel: string) {
  const Project = new tsmorph.Project();
  const sourceFileModel = Project.addSourceFileAtPath(filePathModel);
  const typeChecker = Project.getTypeChecker();
  const tsTC = typeChecker.compilerObject as unknown as ts.TypeChecker;
  try {
    const modelDecl = sourceFileModel.getVariableDeclarationOrThrow('model').compilerNode as unknown as ts.Declaration;
    const model = evaluate({typeChecker: tsTC, node: modelDecl});

    if (model.success) {
      console.log('Success for path: ', filePathModel);
      return model.value as Model;
    }
  }
  catch (error) {
    console.log('A file you called for may have no contents, or is failing to refer to the model definition with the correct convention of "model" for the containing var.');

  }
}

  // good news is this approach appears to work, i was worried about some of the properties that would not map on cast from tsmorph.ts.TypeChecker to ts.TypeChecker, but it seems to be fine. 
// Setting parameters to potentially accept either the whole node and edge state, or single node or edge...going to see if I can do single as this would be a less time costly operation.
export function saveToViewModAndMod(filePathViewModel: string, filePathModel: string, node?: Node, edge?: Edge, nodes?: Node[], edges?: Edge[]) {
    const Project = new tsmorph.Project();
    const sourceFileView = Project.addSourceFileAtPath(filePathViewModel);
    const sourceFileModel = Project.addSourceFileAtPath(filePathModel);
    const typeChecker = Project.getTypeChecker();
    const tsTC = typeChecker.compilerObject as unknown as ts.TypeChecker;
  
    const viewModelDecl = sourceFileView.getVariableDeclarationOrThrow('viewModel').compilerNode as unknown as ts.Declaration;
    
  
    const modelDecl = sourceFileModel.getVariableDeclarationOrThrow('model').compilerNode as unknown as ts.Declaration;
    const viewModel = evaluate({node: viewModelDecl, typeChecker: tsTC });
    const model = evaluate({typeChecker: tsTC, node: modelDecl});
  
  
    if (model.success && viewModel.success) {
      const modelVal  = model.value as Model;
      const viewModelVal = viewModel.value as ViewModel;
      
      if (node && !edge && !nodes && !edges) {
        const modelNodeToAdd = rfNodeToINode(node);
        const viewModelNodeToAdd = rfNodeToViewModNode(node);
        modelVal.nodes.push(modelNodeToAdd);
        viewModelVal.viewModelNodes.push(viewModelNodeToAdd);
        sourceFileModel.getVariableDeclarationOrThrow('model').getInitializerIfKindOrThrow(tsmorph.SyntaxKind.ObjectLiteralExpression).getProperty('nodes')?.replaceWithText(`nodes: ${JSON.stringify(modelVal.nodes, null, 2)}`);
        sourceFileView.getVariableDeclarationOrThrow('viewModel').getInitializerIfKindOrThrow(tsmorph.SyntaxKind.ObjectLiteralExpression).getProperty('viewModelNodes')?.replaceWithText(`viewModelNodes: ${JSON.stringify(viewModelVal.viewModelNodes, null, 2)}`);
        
        sourceFileModel.save();
        sourceFileView.save();
        console.log('model and view mod updated! - ', viewModelVal, modelVal);
  
      }

      if (edges && !nodes && !node && !edge) {
        const viewModelEdges: ViewModelEdge[] = [];
        const modelEdges: IEdge[] = [];
        const id = 0;
        const generator = uuid.default(0);
        
        edges.forEach((edge: Edge) => {
          if (!edge.id || edge.id === '' || !typia.is<EdgeId>(edge.id)) {
          edge.id = `git@repo.techngs.us:${edge.sourceNode?.data.label}/${
          edge.targetNode?.data.label}${generator.uuid()}`;
          }
          
          if (!edge.data['@context']) {
            edge.data = {'@context': ''};
            edge.data['@context'] = 'git@repo.techngs.us:/base.metamodel.ts';
          }
          
          if (!edge.sourceHandle) {
          if (edge.sourceNode?.data.handles.sourceHandles.length === 1) {
          edge.sourceHandle = `${edge.sourceNode?.data.id}/source/${generator.uuid()}` as HandleId;
          }
          }
          if (!edge.targetHandle) {
          if (edge.targetNode?.data.handles.targetHandles.length === 1) {
            edge.targetHandle = `${edge.targetNode?.data.id}/target/${generator.uuid()}` as HandleId;
          }

          if (!edge.markerEnd) {
            edge.markerEnd = 'arrowclosed';
          }

          if (!edge.markerStart) { 
            edge.markerStart = 'arrowclosed';
          }
        }
          viewModelEdges.push(rfEdgeToViewEdge(edge));
          modelEdges.push(rfEdgeToIEdge(edge));
        });

        sourceFileModel.getVariableDeclarationOrThrow('model').getInitializerIfKindOrThrow(tsmorph.SyntaxKind.ObjectLiteralExpression).getProperty('edges')?.replaceWithText(`edges: ${JSON.stringify(modelEdges, null, 2)}`);
        sourceFileView.getVariableDeclarationOrThrow('viewModel').getInitializerIfKindOrThrow(tsmorph.SyntaxKind.ObjectLiteralExpression).getProperty('viewModelEdges')?.replaceWithText(`viewModelEdges: ${JSON.stringify(viewModelEdges, null, 2)}`);

        sourceFileModel.save();
        sourceFileView.save();
        return modelVal;
      }
  
    }
    
  }