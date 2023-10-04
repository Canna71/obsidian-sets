import { App,  setIcon } from "obsidian";
import { PropertyContext } from "src/obsidian-ex";

function  registerPasswordPropertyType(app: App)  {

    app.metadataTypeManager.registeredTypeWidgets.password = {
    name: () => "Password",
    type: "password",
    default: () => "",
    icon: "lucide-key",
    validate: (e:unknown) => "string" == typeof e,
    render: (element: HTMLElement, metadataField: any, property: PropertyContext) => {
        
        element.className = element.className + " metadata-property"; //metadata-property-value
        
        const propertyValue = element.createDiv({cls: "metadata-property-value"})
        
        const passfield = propertyValue.createEl("input");
            
        const onChange = (e:string) => {
            property.onChange(e);

        };

        passfield.className = "metadata-input-text mod-truncate";
        passfield.setAttr("placeholder", "No value");
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

        // element.appendChild(passfield);

        const copyBtn =  propertyValue.createDiv(
            {cls: "clickable-icon"}
        );
        copyBtn.addEventListener("click", 
            async (evt: MouseEvent) => {
                await navigator.clipboard.writeText(passfield.value);
            }
        )
        setIcon(copyBtn, "copy"); 

    }
    }
    return app.metadataTypeManager.registeredTypeWidgets.password;
}

export default registerPasswordPropertyType;
