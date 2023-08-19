/* eslint-disable @typescript-eslint/ban-types */
import { debounce, ItemView,  WorkspaceLeaf } from "obsidian";
import { createSignal } from "solid-js";
import { render } from "solid-js/web";

import { SetsSettings } from "src/Settings";
import { getSetsSettings } from "src/main";
export const SETS_VIEW = "Sets-view";

function Counter({start, increment}) {
    const [val, set] = createSignal(start);

    const handleClick = (e:MouseEvent) => {
        set(val()+increment);
    }

    return <button onClick={handleClick}>{val()}</button>
}

function MyComponent(props) {
    return (
        <div>
            <h3>Hello, {props.name}</h3>
            <Counter start={42} increment={3} />
        </div>
    );
}


export class SetsView extends ItemView {
    settings: SetsSettings;
   
    state = {

    };

    

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
        // this.settings = (this.app as any).plugins.plugins["obsidian-Sets"].settings as SetsSettings;
        this.settings = getSetsSettings();
        this.state = {

        };
        this.icon = "sigma";
        console.log(`view ${SETS_VIEW} loaded`);
    }

    getViewType() {
        return SETS_VIEW;
    }

    getDisplayText() {
        return "Sets";
    }

    override onResize(): void {
        super.onResize();
        this.handleResize();
    }

    handleResize = debounce(() => {
        this.render();
    }, 300);




    render() {
        console.log(`rendering...`);
        const { contentEl } = this;
        contentEl.empty();
        render(() => <MyComponent name="Solid!" />, contentEl)
    }



    async onOpen() {
        

        this.render();

    }

    async onClose() {

    }
}
