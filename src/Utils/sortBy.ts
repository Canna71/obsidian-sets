export function sortBy<T>(key: keyof T, elements: T[]) {
    const result = elements.sort((a:T, b:T)=>{
        if(a[key] < b[key]) return -1;
        if(a[key] > b[key]) return 1;
        return 0;
    })
    return result;
}
