import { App, SuggestModal } from "obsidian";



export class NameValueSuggestModal extends SuggestModal<{ name: string, value: string }> {
    private data: { name: string; value: string; }[];
    onChoice: (item: {
        name: string; value: string;
    }) => void;

    constructor(app: App, data: { name: string, value: string }[], onChoice: (item: { name: string, value: string }
    ) => void) {
        super(app);
        this.data = data;
        this.onChoice = onChoice;
    }

    // Returns all available suggestions.
    getSuggestions(query: string): { name: string, value: string }[] {
        return this.data.filter((item) =>
            item.name.toLowerCase().includes(query.toLowerCase())
        );
    }

    // Renders each suggestion item.
    renderSuggestion(item: { name: string, value: string }, el: HTMLElement) {
        el.createEl("div", { text: item.name });
    }

    // Perform action on the selected suggestion.
    onChooseSuggestion(item: { name: string, value: string }) {
        this.onChoice(item);
    }
}