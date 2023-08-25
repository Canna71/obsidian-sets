
import { createSignal, createContext, useContext, JSX, Accessor } from "solid-js";
import { FieldDefinition } from "./renderCodeBlock";



export interface GridStateContext {
    state: Accessor<GridState>;
    onHover: (what: string) => void;
    onExit: () => void;
}
const GridContext = createContext<GridStateContext>();
export interface GridState {
    hovering?: string;
    fields?: FieldDefinition[];
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
          },
          shift: (key: string, place: string) => {
            setState(state => {
                if(key === place) return state;
                const fields = state.fields || [];
                const sourceIndex = fields.findIndex(f => f.key === key);
                const moved = fields[sourceIndex];
                const others = fields.filter(f => f !== moved);
                const where = others.findIndex(f => f.key === place);
                const insertIndex = sourceIndex > where ? where : where + 1;
                others.splice(insertIndex,0,moved); 
                return {...state, fields: others}
            })
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
