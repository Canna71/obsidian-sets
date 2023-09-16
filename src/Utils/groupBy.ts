// function to group an array of objects by key
export function groupBy<T>(array: T[], fn: (el: T) => string|number|symbol):Record<string|number|symbol,T[]> {
    return array.reduce((result, currentValue) => {
        // create an array for this key if it doesn't exist
        const key = fn(currentValue);
        result[key] = result[key] || [] as T[];
        // push the current value into the array for this key
        result[key].push(currentValue);
        return result;
    }, {} as Record<string|number|symbol,T[]>);
}
