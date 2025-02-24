import { useEffect, useState } from "react";
import App from "./App";
import { Center, DEFAULT_THEME, MantineProvider } from "@mantine/core";

async function runLibraryAsync(jarPath: string) {
    return await (window as any).cheerpjRunLibrary(jarPath)
}

async function waitForCheerpJ() {
    await (window as any).cheerpjInit();
 }
export default function Root() {
    const [lib, setLib] = useState<any>(null);
    const [cheerpjLoaded, setCheerpjLoaded] = useState<boolean>(false);
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
        if (cheerpjLoaded) {
            runLibraryAsync("/app/final_secure_repacked_fullDeps.jar").then((res) => {
                setLib(res)
            });
        }
    }, [cheerpjLoaded]);
    useEffect(() => {
        if (lib) {
            console.log("lib set");
        }
    }, [lib]);
    return(
        lib ? <MantineProvider defaultColorScheme='dark' theme={DEFAULT_THEME}><App lib={lib} /></MantineProvider>:<MantineProvider defaultColorScheme='dark' theme={DEFAULT_THEME}><Center h='100vh'>Loading CheerpJ</Center></MantineProvider>
    );
}