
type Query = unknown;

export function matches(query: Query, metadata: any) {
    if(!metadata) return false;
    if(metadata["type"] === "note") return true;
}
