import SetsPlugin from "src/main";
import { App, PluginSettingTab, Setting } from "obsidian";
import { render } from "solid-js/web";
import FolderSelect from "./Views/components/FolderSelect";
import { Setter, createEffect, createSignal } from "solid-js";


export class SetsSettingsTab extends PluginSettingTab {
	plugin: SetsPlugin;

	constructor(app: App, plugin: SetsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

        // setting for Sets folder, using FolderSelect
        const setsSelect = new Setting(containerEl)
            .setName("Sets Folder")
            .setDesc("The folder where Sets will store its data.")
            .controlEl

            const [setsRoot, setSetsRoot] = createSignal(this.plugin.settings.setsRoot);
            
            createEffect(() => {
                this.plugin.settings.setsRoot = setsRoot();
                this.plugin.saveSettings();
            }) 
        
            render(() => <FolderSelect 
                value={setsRoot}
                setValue={setSetsRoot}           
            />, setsSelect);
            // .addText(text => text
            //     .setValue(this.plugin.settings.setsRoot)
            //     .onChange(async (value) => {
            //         this.plugin.settings.setsRoot = value;
            //         await this.plugin.saveSettings();
            //     }
            // ));

            // setting for the typeSetSuffix
            new Setting(containerEl)
            .setName("Type Set Suffix")
            .setDesc("The suffix that will be added to the name of the type set.")
            .addText(text => text
                .setValue(this.plugin.settings.typeSetSuffix)
                .onChange(async (value) => {
                    this.plugin.settings.typeSetSuffix = value;
                    await this.plugin.saveSettings();
                }
            ));
		
            // add a settings for typeAttributeKey
            new Setting(containerEl)
            .setName("Type Attribute Key")
            .setDesc("The name of the attribute that will be used to store the type of a note.")
            .addText(text => text
                .setValue(this.plugin.settings.typeAttributeKey)
                .onChange(async (value) => {
                    this.plugin.settings.typeAttributeKey = value;
                    await this.plugin.saveSettings();
                }   
            ));

            // add a settings for collectionAttributeKey
            new Setting(containerEl)
            .setName("Collection Attribute Key")
            .setDesc("The name of the attribute that will be used to store the collection of a note.")
            .addText(text => text
                .setValue(this.plugin.settings.collectionAttributeKey)
                .onChange(async (value) => {
                    this.plugin.settings.collectionAttributeKey = value;
                    await this.plugin.saveSettings();
                }
            ));

            // add a setting for topResults
            new Setting(containerEl)
            .setName("Top Results")
            .setDesc("The number of notes to show in the views")
            .addText(text => text
                .setValue(this.plugin.settings.topResults.toString())
                .onChange(async (value) => {
                    this.plugin.settings.topResults = parseInt(value);
                    await this.plugin.saveSettings();
                }
            ));

       
	}

    private createToggle(containerEl: HTMLElement, name: string, desc: string, prop: string) {
		new Setting(containerEl)
			.setName(name)
			.setDesc(desc)
			.addToggle(bool => bool
				.setValue((this.plugin.settings as any)[prop] as boolean)
				.onChange(async (value) => {
					(this.plugin.settings as any)[prop] = value;
					await this.plugin.saveSettings();
					this.display();
				})
			);
	}
}
