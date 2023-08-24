import { App } from "obsidian";
import { createContext, useContext, JSX } from "solid-js";

const AppContext = createContext<App>();

export function AppProvider(props:{app:App, children?: JSX.Element}) {
    
    // async function  openNote(note: TFile, paneType: PaneType | boolean = false) {
    //     const leaf = props.app.workspace.getLeaf(paneType);
    //     await leaf.openFile(note);
    // }

     
  
    return (
      <AppContext.Provider value={props.app}>
        {props.children}
      </AppContext.Provider>
    );
  }

export function useApp() { return useContext(AppContext); }
