import * as ts from "typescript";
import * as vscode from "vscode";

export function getNonce() {
  // simple function to generate nonce that is required to run scripts inside of a webview i-frame. 
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}



/* Using the typescript compiler API, we can run our files for typechecking.
We can likely safely call this on every post message the extension receives, as they typically indicate a manipulation of the file. 
We can then show an error dialogue with the list of errors that need to be resolved before the viewport can be loaded, or for changes to be saved.
*/
export function compile(fileNames: string[], options: ts.CompilerOptions): boolean {
  //At a more abstract level, we run the compiler with fill emission disabled so we do not yield js out, and check the length of the diagnostics array. If the length > 0, there are type errors present. 

    /** 
  * @param {string[]} fileName - Absolute path of the TS file to have default exports extracted from. This can accept multiple paths for multiple files. 
  * @param {ts.CompilerOptions} options - The compiler options for the TypeScript compiler. This is the same as the compiler options you would manipulate in a tsconfig. 
  * @returns {boolean} - Returns true if no type errors are present after compilation. 
   */

  const program = ts.createProgram(fileNames, options);
  const emitResult = program.emit();

  const allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);
  
  const errArray : string[] = [];

  allDiagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
      errArray.push(`(${line + 1},${character + 1}): ${message}`);
      console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
    }
  });
  console.log(allDiagnostics);

  if (allDiagnostics.length === 0) {
    return true;
  }
  else {
  const messageOptions = {modal: true, detail: errArray.join()};
  vscode.window.showErrorMessage("Type checking validation failed. Fix the following to load the model view.", messageOptions);
  return false;
  }
}


export function transform(fileName : string[], options: ts.CompilerOptions) : any {
  /** 
  * @param fileName Absolute path of the TS file to have default exports extracted from. This can accept multiple paths for multiple files. 
  * @param options The compiler options for the TypeScript compiler. This is the same as the compiler options you would manipulate in a tsconfig. 
  * @description Returns JSON object from the default exported object using the TS Compiler API.
   */
  const program = ts.createProgram(fileName, options); 
  const checker = program.getTypeChecker(); // Using the type checker we can get the exported objects from the source. 
  const source = program.getSourceFile(fileName[0]);
  
  if (source) {
    const sourceSymbol = checker.getSymbolAtLocation(source);
    if (sourceSymbol) {
    const exports = checker.getExportsOfModule(sourceSymbol);
      if (exports) {
        const defaultExportSymbol = exports.find(e => e.escapedName === "default");
        if (defaultExportSymbol && defaultExportSymbol.declarations) {
        const defaultExportType = checker.getTypeOfSymbolAtLocation(
          defaultExportSymbol,
          defaultExportSymbol.declarations[0],
        );

        const viewModelSymbol = checker.getAliasedSymbol(defaultExportSymbol);
        const viewModelDecl = viewModelSymbol.declarations![0] as ts.VariableDeclaration;
        const viewModelLit = viewModelDecl.initializer as ts.ObjectLiteralExpression;

        for (const prop of defaultExportType.getProperties()) {
          const propType = checker.getTypeOfSymbolAtLocation(prop, prop.declarations![0]);
          console.log(prop.name); 
          console.log(checker.typeToString(propType));  // Log the property types to console. Not really necessary but still neat. 
        }
        
        

        for (const prop of viewModelLit.properties) {
          console.log(prop.name!.getText()); // log property name. 
          console.log((prop as ts.PropertyAssignment).initializer.getText()); // log literal property value. 
        }
        return JSON.parse(viewModelLit.getFullText().replaceAll("'", "\""));
        }
      }
    }
  }
}