import { Accessor, Component, For, Setter, Show, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { autoUpdate, computePosition, size } from "@floating-ui/dom";

export interface InputSuggestProps {
    value: Accessor<string>,
    setValue: Setter<string>,
    placeholder?: Accessor<string>,
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

    const onInputBlur = () => {
        setTimeout(() => {
            setFocused(false);
        }, 100);
    }

    const onInput = (e: InputEvent) => {
        setSelected(0);
        props.setValue((e.currentTarget as HTMLInputElement).value);
    }

    const isTooltipVisible = () => {
        const ret = focused() && props.options().length > 0;
        if (ret) {
            requestAnimationFrame(() => {
                updatePosition();
            });
        }
        return ret; 
    }

    createEffect(() => {
        const index = selected();
        const element = tooltip?.firstChild!.childNodes[index] as HTMLDivElement;
        if (element) {
            element.scrollIntoView({ block: "nearest" });
        }
    });

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

    const onInputKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            setSelected(selected() + 1);
        }
        if (e.key === "ArrowUp") {
            setSelected(selected() - 1);
        }
        if (e.key === "Enter") {
            props.setValue(props.options()[selected()].value);
        }
    }

    const filteredOptions = () => {
        return props.options().filter(o => o.label.toLowerCase().includes(props.value().toLowerCase()));
    }

    const text = () => {
        // if current value is a valid option, return the label
        const option = props.options().find(o => o.value === props.value());
        if (option) return option.label;
        return props.value();
    }

    onMount(() => {
        //
    });

    onCleanup(() => {
        cleanup && cleanup();
    });

    return (<>
        <input ref={input!}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            type="text"
            value={text()}
            onInput={onInput}
            onkeydown={onInputKeyDown}
            placeholder={props.placeholder?.()}
        />
        <Show when={isTooltipVisible()}>
            <div ref={tooltip!} role="tooltip" class="sets-tooltip suggestion-container">
                <div class="suggestion">
                    <For each={filteredOptions()}>
                        {
                            (option, index) => {
                                return <div classList={{ "suggestion-item": true, "is-selected": selected() === index() }}
                                    onClick={() => { props.setValue(option.value), console.log(option.value) }}
                                    onMouseOver={() => { setSelected(index()) }}
                                >
                                    {option.label}

                                </div>
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
