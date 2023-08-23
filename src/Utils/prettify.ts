export function prettify(str: string) {
    const words = str.match(/([^-]+)/g) || [];
    words.forEach(function (word, i) {
        words[i] = word[0].toUpperCase() + word.slice(1);
    });
    return words.join(" ");
}
