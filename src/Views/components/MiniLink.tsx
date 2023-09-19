// solidjs component for rendering a link to a file
// without the possibility to edit the file name

// Path: src/Views/components/MiniLink.tsx
// Compare this snippet from src/Views/components/FileName.tsx:

import { Component, createEffect, createSignal, JSX, onMount, onCleanup } from "solid-js";
import { ObjectData } from "src/Data/ObjectData";
import { useApp } from "./AppProvider";
import { setIcon } from "obsidian";

export interface MiniLinkProps {
    data: ObjectData;
}


const MiniLink: Component<MiniLinkProps> = (props) => {
    const { app } = useApp()!;
    let link: HTMLAnchorElement | null = null;
    
    const linkText = () => {
        return app.metadataCache.fileToLinktext(props.data.file, "/")
    }

    onMount(() => {
        if(link) setIcon(link, "link");
    })

    return (
        <a 
        ref={link!}
        data-href={linkText()}
        href={linkText()}
        class="internal-link sets-filename-link"
        target="_blank"
        title={props.data.file.basename}
        rel="noopener"></a>
    )
}

export default MiniLink;
