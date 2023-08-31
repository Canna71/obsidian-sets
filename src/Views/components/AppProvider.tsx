import { App } from "obsidian";
import { createContext, useContext, JSX } from "solid-js";
import { VaultDB } from "src/Data/VaultDB";

const AppContext = createContext<AppContext>();

export interface AppContext {
    app: App,
    db: VaultDB
}

export function AppProvider(props:{app:AppContext, children?: JSX.Element}) {
    
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
