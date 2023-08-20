import "solid-js" ;

declare module "*.module.css";
declare module "*.module.scss";
declare module "*.svg";

declare module "solid-js" {
    namespace JSX {
        interface Directives {
            // use:clickOutside
            clickOutside: ()=>void;
        }
    }
}
