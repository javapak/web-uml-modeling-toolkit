import * as tsmorph from 'ts-morph'; 
import { Node} from 'reactflow';
import "../../../core/src/base.metamodel"
import * as path from 'path';
import { rfNodeToINode } from "./MetaModelFormToRFConversions";

export function getNonce() {
  // simple function to generate nonce that is required to run scripts inside of a webview i-frame. 
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

export function nodePropsToFormSchema(nodeProps: string[]) {
  const schema = {type: 'object', properties: {}};
  nodeProps.forEach((prop) => {
    const split = getNameAndTypeSplitOfNodeProp(prop);
    schema.properties = Object.assign(schema.properties, {[split[0]]: { type: split[1]}} );
  });
  console.log('!!!!SCHEMA TEST!!!!', schema);
  return schema;
}

function getNameAndTypeSplitOfNodeProp(prop: string): string[] {
  return prop.replaceAll(" ", "").split(":");
}

export function getNodeProps(someNode: Node) {
  console.log("------- getNodeProps -------");
  const Project = new tsmorph.Project();
  const sourceFileMetaModel = Project.addSourceFileAtPath(path.join(__dirname, '../src/base.metamodel.ts').replace('out/', ''));
  const modelDecl = sourceFileMetaModel.getInterfaceOrThrow(rfNodeToINode(someNode).type);
  console.log(modelDecl.getProperty('data')?.getFullText());

  return modelDecl.getProperty('data')?.getFullText().split('{').pop()?.split('}')[0].split(','); // Get all of the defined types within the data object (in simpler terms, fetch all text inbetween { } and separate each field by comma)...


  //console.log(modelDecl);
/*
  const model = evaluate({typeChecker: tsTC, node: modelDecl});
  if (model.success) {
    console.log(JSON.stringify(model.value, null, 2));
  }*/
}



  
