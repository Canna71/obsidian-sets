import { App, parseLinktext } from "obsidian";
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
            return false;
        }
        const {path} = parseLinktext(match[1])
        const file = app.metadataCache.getFirstLinkpathDest(
            path,
            ""
        );
        if(!file){
            console.error(`${file} does not exists!`);
            return false;
        }
        return true;
    },
    render: app.metadataTypeManager.registeredTypeWidgets.text.render
    }

    return app.metadataTypeManager.registeredTypeWidgets.link;
}

export default registerLinkPropertyType;
