import { Accessor, Component } from "solid-js";

export type ToggleProps = {
    value: Accessor<boolean>;
    onChange: (value: boolean) => void;
};

export const Toggle: Component<ToggleProps> = (props) => {
    let el: HTMLDivElement;
    const onClick = (e) => {
        props.onChange(!props.value());
    };

    return (
        // <div ref={el!}></div>
        <div class="checkbox-container"
            classList={{ "is-enabled": props.value() }}
            onClick={onClick}
        >
            <input type="checkbox" tabIndex={0} checked={props.value()} />
        </div>
    );
};

