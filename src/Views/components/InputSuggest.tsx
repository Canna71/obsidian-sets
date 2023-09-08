import { Accessor, Component, For, Setter, Show, createSignal, onCleanup, onMount } from "solid-js";
import { autoUpdate, computePosition, size } from "@floating-ui/dom";

export interface InputSuggestProps {
    value: Accessor<string>,
    setValue: Setter<string>,
    // onChange: (e: Event) => void,
    // getOptions: (inputVal: string) => {value: string, label: string}[]
    options: Accessor<{ value: string, label: string }[]>
}

const InputSuggest: Component<InputSuggestProps> = (props) => {
    let input: HTMLInputElement;
    let tooltip: HTMLDivElement;
    let cleanup: () => void;

    const [focused, setFocused] = createSignal(false);
    const [selected, setSelected] = createSignal(0);

    const onInputFocus = () => {
        setFocused(true);
        cleanup = autoUpdate(
            input,
            tooltip,
            updatePosition
        );
    }

    function updatePosition() {
        computePosition(input, tooltip, {
            placement: 'bottom-start',
            strategy: 'fixed',
            // tooltip should be the same width as the input
            middleware: [
                size({
                    apply({ availableWidth, availableHeight, elements }) {
                        // Do things with the data, e.g.
                        Object.assign(elements.floating.style, {
                            minWidth: `${input.offsetWidth}px`,
                            maxWidth: `${availableWidth}px`,
                            maxHeight: `${availableHeight}px`,
                        });
                    },
                }),
            ]


        }).then(({ x, y }) => {
            Object.assign(tooltip.style, {
                left: `${x}px`,
                top: `${y}px`,
            });
        });
    }



    onMount(() => {
        
    });

    onCleanup(() => {
        cleanup && cleanup();
    });

    return (<>
        <input ref={input!}
            onFocus={onInputFocus}
            onBlur={() => { setFocused(false) }}
            type="text"
            value={props.value()}
            onInput={(e) => { props.setValue(e.target.value) }} />
        {/* <Choice value={scopeSpecifier()} onChange={onFolderChange} /> */}
        <Show when={focused()}>
            <div ref={tooltip!} role="tooltip" class="sets-tooltip suggestion-container">
                <div class="suggestion">
                <For each={props.options()}>
                    {
                        (option, index) => {
                            return <div classList={{"suggestion-item":true, "is-selected":selected()===index()}} onClick={() => { props.setValue(option.value) }}>{option.label}</div>
                        }
                    }
                </For>
                </div>
            </div>
        </Show>
    </>
    )
}

export default InputSuggest;
