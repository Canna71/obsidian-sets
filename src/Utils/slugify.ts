// transforms a string into a slug
export function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(/&/g, "-and-") // Replace & with 'and'
        .replace(/[^\w\-]+/g, "") // Remove all non-word chars
        .replace(/--+/g, "-") // Replace multiple - with single -
        .replace(/^-+/, "") // Trim - from start of text
        .replace(/-+$/, ""); // Trim - from end of text
}

// transforms a slug into a human readable string, capitalizing the first letter of each word
export function unslugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .replace(/-/g, " ")
        .replace(/(?:^|\s)\S/g, function (a) {
            return a.toUpperCase();
        }
        );
}
