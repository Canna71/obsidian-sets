import "solid-js" ;
import { ResizeEvent } from "./Views/components/HeaderRow";

declare module "*.module.css";
declare module "*.module.scss";
declare module "*.svg";

declare module "solid-js" {
    namespace JSX {
        interface Directives {
            // use:clickOutside
            clickOutside: ()=>void;
            
            draggable: boolean;
            sortable: boolean;
            headerResize: (ev:ResizeEvent)=>void;
        }
    }
}
