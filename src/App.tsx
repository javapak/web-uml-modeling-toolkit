
import '@mantine/core/styles.css'
import { MantineProvider, DEFAULT_THEME, Grid, Tabs, Center, Button } from '@mantine/core';
import FlowProvider from './FlowProvider';
import React, { useEffect, useState } from "react";
import ClassNode from './node-types/ClassNode.tsx';
import { getClassImpl } from './util/uml/ClassImpl';
import NodePanel from './NodePanel.tsx';
import { ReactFlowProvider } from 'reactflow';

async function waitForCheerpJ() {
   await (window as any).cheerpjInit();
}


function App({lib}: {lib: any}) {
  const [cheerpjLoaded, setCheerpjLoaded] = useState(false);
  const [output, setOutput] = useState<string | null>(null);


  useEffect(() => {
    const scriptId = "cheerpj-script";

    // Prevent multiple script injections
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.src = "https://cjrtnc.leaningtech.com/3.1/cj3loader.js";
      script.id = scriptId;
      script.async = true;

      script.onload = () => {
        console.log("CheerpJ script loaded! Waiting for initialization...");

        // Polling method to check for cheerpjInit
        const checkCheerpJ = setInterval(async () => {
          if ((window as any).cheerpjInit) {
            clearInterval(checkCheerpJ);
            await waitForCheerpJ();
            setCheerpjLoaded(true);
            console.log("CheerpJ initialized successfully!");
          }
        }, 10); // Check every 500ms
      };

      script.onerror = () => {
        console.error("Failed to load CheerpJ script.");
      };

      document.head.appendChild(script);
    } else {
      console.log("CheerpJ script already exists.");
    }
  }, []);

  useEffect(() => {
    if (lib) {
      console.log("UML lib successfully loaded via CheerpJ.");
    }
  }, [lib]);
  return (      
      <div>
        <Tabs defaultValue="flow">
          <Grid grow overflow='hidden'>
            <Grid.Col>
                <NodePanel />
            </Grid.Col>
            <Grid.Col span={11}>
              <Center>
                <Tabs.Tab value="flow" style={{display: 'inline'}}>Node Editor</Tabs.Tab>
                <Tabs.Tab value="table" style={{display: 'inline'}}>Table Editor</Tabs.Tab>
              </Center>
              <Tabs.Panel value="flow">
                <Center>
                  {lib ? <ReactFlowProvider><FlowProvider lib={lib} /></ReactFlowProvider> : null}
                </Center>
              </Tabs.Panel>
              <Center>
                <Tabs.Panel value="table">Table Editor Content</Tabs.Panel>
              </Center>
            </Grid.Col>
            <Grid.Col span={1}>Property Editor</Grid.Col>

          </Grid>
        </Tabs>
    </div>
  )
}

export default App
