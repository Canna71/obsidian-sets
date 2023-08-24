
import { createSignal, createContext, useContext, JSX, Accessor } from "solid-js";



export interface GridStateContext {
    state: Accessor<GridState>;
    onHover: (what: string) => void;
    onExit: () => void;
}
const GridContext = createContext<GridStateContext>();
export interface GridState {
    hovering?: string;
}

export function GridProvider(props:{gridState:GridState, children?: JSX.Element}) {
    
    const [state, setState] = createSignal(props.gridState);
    const gridState = {
        state,
          onHover: (what: string) => {
            setState(state => ({...state, hovering:what}));
          },
          onExit: () => {
            setState(state => ({...state, hovering:undefined}));
          }
        }
      ;
     
  
    return (
      <GridContext.Provider value={gridState as GridStateContext}>
        {props.children}
      </GridContext.Provider>
    );
  }

export function useGrid() { return useContext(GridContext); }
