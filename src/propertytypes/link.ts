import { App, ButtonComponent, getLinkpath, parseLinktext } from "obsidian";
import { PropertyContext, PropertyInfo } from "src/obsidian-ex";
const linkpath_regex = new RegExp("^\\[\\[(.*)\\]\\]$");

function registerLinkPropertyType(app: App) {
    app.metadataTypeManager.registeredTypeWidgets.link = {
    name: () => "link",
    type: "link",
    default: () => "",
    icon: "lucide-link",
    validate: (e:string) => {
        let match
        if ((match = linkpath_regex.exec(e)) === null) {
            // this.displayErroe("Invalid Link");
            return false;
        }
        const {path, subpath} = parseLinktext(match[1])
        const file = app.metadataCache.getFirstLinkpathDest(
            path,
            ""
        );
        if(!file){
            console.error(`${file} does not exists!`);
            return false;
        }
        // const path2 = getLinkpath(e); 
        console.log(path);
        return true;
    },
    render: app.metadataTypeManager.registeredTypeWidgets.text.render
    }

    return app.metadataTypeManager.registeredTypeWidgets.link;
}

export default registerLinkPropertyType;
