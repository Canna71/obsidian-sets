import { Component, Show } from "solid-js";
import { useApp } from "./components/AppProvider";
import { BoardItem } from "./components/BoardItem";
import { SetViewProps } from "./components/GridView";
import { useSet } from "./components/SetProvider";
import { CardItem } from "./components/CardItem";
import needsLink from "src/Utils/needsLink";
import MiniLink from "./components/MiniLink";

const GalleryView: Component<SetViewProps> = (props) => {
    const { definition } = useSet()!;
    // get db
    const { app, db } = useApp()!;

    const numOfColumns = definition().gallery?.numColumns || 3;
    const transclude = () => definition().gallery?.transclude || [];
    // style={`grid-template-columns: repeat(${numOfColumns}, 1fr)`}
    return (
        <div class="sets-gallery-view">
            <div class="sets-gallery-grid" >
                {props.data.map((data, i) =>
                    <div class="sets-gallery-item">
                        <CardItem data={data} attributes={props.attributes} transclude={transclude()} />
                        <Show when={needsLink(props.attributes)}>
                            <div class="sets-gallery-mini-link">
                                <MiniLink data={data} />
                            </div>
                        </Show>
                    </div>
                )}
            </div>
        </div>
    )

}

export default GalleryView;
