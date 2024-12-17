import { IEdge, INode, Model } from "../../../core/src/base.metamodel";
import * as tsmorph from 'ts-morph';
import { evaluate } from 'ts-evaluator';
import ts from "typescript";
import * as neo4j from 'neo4j-driver';

export function executeUserQueries(queries: string) {
  console.log(queries);
  const driver = neo4j.driver("bolt://localhost:7687",
  neo4j.auth.basic("", ""));
  try {
  const records = driver.executeQuery(queries);
  if (queries.includes('RETURN') || queries.includes('return')) {
    return records;
  }
  else return undefined;
  }
  catch (error) {
    return error;
  }
}

function generateMergeQueriesNodes(nodes: INode[]): string {
    const queries: string[] = [];
    for (const node of nodes) {
            const { "@id": id, type, name, data } = node;
            const properties = JSON.stringify(data || {});
  
      const query = `
        Merge (${type}:\`${name}\` { id: "${id}", name: "${name}", properties: ${properties} })
      `;
  
      queries.push(query);
    }
  
    return queries.join('\n');
  }

function generateMergeQueriesEdges(edges: IEdge[]): string {
  const queries: string[] = [];
  for (const edge of edges) {
    for (const edge of edges) {
      const query = `
      MATCH
      (a),
      (b)
      WHERE
      a.id = '${edge.sourceLink}' AND b.id = '${edge.targetLink}'
      CREATE (a)-[r:${edge.type} {id: a.id + '<->' + b.id}]->(b)
      RETURN type(r), r.name
    `;

    queries.push(query);
  }
      
    }
    return queries.join('\n');
}

function getUpdateQueries(filePathModel: string) {
  const Project = new tsmorph.Project();
  const sourceFileModel = Project.addSourceFileAtPath(filePathModel);
  const typeChecker = Project.getTypeChecker().compilerObject as unknown as ts.TypeChecker;
  const modelCompNode = sourceFileModel.getVariableDeclarationOrThrow('model').compilerNode as unknown as ts.Declaration;
  const modelVal = evaluate({typeChecker, node: modelCompNode});

  if (modelVal.success) {
    const model : Model = modelVal.value as Model;
    const nodeQueries = generateMergeQueriesNodes(model.nodes);
    const edgeQueries = generateMergeQueriesEdges(model.edges);
    return {nodeQueries, edgeQueries};
  }
}

export function getAllNodes() {
  const driver = neo4j.driver("bolt://localhost:7687",
  neo4j.auth.basic("", ""));
  const nodes = driver.executeQuery('MATCH (n)');
  return nodes;
}

export function getAllEdges() {
  const driver = neo4j.driver("bolt://localhost:7687",
  neo4j.auth.basic("", ""));
  const edges = driver.executeQuery('MATCH (r)');
}

export function allocateToDatabase(filePathModel: string) { 

  const driver = neo4j.driver("bolt://localhost:7687",
  neo4j.auth.basic("", ""));
  console.log('connect call made...');
  const queries = getUpdateQueries(filePathModel); 
    if (queries) {
    try {
    console.log('trying to exec queries...');
    driver.executeQuery(queries.nodeQueries);
    driver.executeQuery(queries.edgeQueries);
    }
    catch (error) {
      console.log(error);
    }
  }
}
    
  



 