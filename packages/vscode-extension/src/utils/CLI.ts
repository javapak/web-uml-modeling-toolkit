import * as cp from "child_process";
import { sync } from 'command-exists';

const commandExistsSync = sync;

const execShell = (cmd: string) => {
    let status = false;
    cp.exec(cmd, (err, out) => {
      if (err) {
        console.log(err);
      }
      else {
        status = true;
      }
    });
    return status;
};



 export const doesDockerExist = () => {
    if (commandExistsSync('docker')) {
      execShell('docker run -i -p 7687:7687 -p 7444:7444 -p 3000:3000 memgraph/memgraph-platform');
      return true;
    }
    else {
      return false; 
    }
  };

