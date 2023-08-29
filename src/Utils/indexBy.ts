export function indexBy<T>(key: keyof T, elements: T[]) {
    const result: Record<any,T> = {};
    for (const element of elements) {
        result[element[key] as any] = element;
    }
    return result;
}

//   export function indexBy<S extends keyof T, T extends Record<S, string>>(key: S, elements: T[]) {
//     const result: {[key: string]: T} = {};
//     for(const element of elements) {
//       result[element[key]] = element;
//     }
//     return result;
//   }
