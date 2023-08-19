import { createSignal } from "solid-js";

type CounterProps = {
    start: number;
    increment: number;
}

export function Counter({ start, increment }:CounterProps) {
    const [val, set] = createSignal(start);

    const handleClick = (e: MouseEvent) => {
        set(val() + increment);
    };

    return <button onClick={handleClick}>{val()}</button>;
}
