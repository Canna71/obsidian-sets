import { ButtonComponent } from "obsidian";
import { PropertyContext, PropertyInfo } from "src/obsidian-ex";

const passwordPropertyType = {
    name: () => "password",
    type: "password",
    default: () => "",
    icon: "lucide-key",
    validate: (e:unknown) => "string" == typeof e,
    render: (element: HTMLElement, metadataField: any, property: PropertyContext) => {
        
        const passfield = document.createElement("input");

        const onChange = (e:string) => {
            console.log(`onChange: `, e);
            property.onChange(e);

        };

        passfield.className = "metadata-input-longtext mod-truncate";
        passfield.setAttr("placeholder", "No Value");
        // div.contentEditable = "true";
        passfield.tabIndex = 0;
        passfield.type = "password";
        passfield.value = metadataField.value || "";

        passfield.addEventListener("keydown", (e: KeyboardEvent) => {
            // const text = div.textContent;
            // div.innerText = '•'.repeat(text?.length || 0);
            if (!e.isComposing)
                if ("Enter" === e.key) {
                    if (e.shiftKey)
                        return;
                    if (e.defaultPrevented)
                        return;
                    e.preventDefault();
                    onChange(passfield.value);
                    // i.ctx.blur()
                } else if (e.key === "Escape") {
                    e.preventDefault();
                    // i.render(),
                    // i.ctx.blur()
                }

        });
        passfield.addEventListener("blur", (e) => {
            if (!e.defaultPrevented) {
                onChange(passfield.value.trimEnd());
            }
        });

        element.appendChild(passfield);

        const copyBtn = new ButtonComponent(element);
        copyBtn.setIcon("copy");
        copyBtn.onClick(async (evt: MouseEvent) => {
            console.log(passfield.value);
            await navigator.clipboard.writeText(passfield.value);
        });

    }
};

export default passwordPropertyType;
