import { Accessor, onCleanup } from "solid-js";

export default function clickOutside(el:Element, accessor: Accessor<()=>void>) {
  const onClick = (e: MouseEvent) => !el.contains(e.target as Node) && accessor()?.();
  document.body.addEventListener("click", onClick);

  onCleanup(() => document.body.removeEventListener("click", onClick));
}
