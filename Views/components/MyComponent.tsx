import { Counter } from "./Counter";

type MyComponentProps = {
    name: string;
}

export function MyComponent(props:MyComponentProps) {
    return (
        <div>
            <h3>Hello, {props.name}</h3>
            <Counter start={42} increment={3} />
        </div>
    );
}
