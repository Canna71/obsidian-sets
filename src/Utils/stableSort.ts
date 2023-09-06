export function stableSort<T>(arr: T[], cmp?:(a:T, b:T) => number) {
    // Set the default comparator if none is provided
    cmp = cmp ? cmp : (a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    };
    // Create a new array of tuples (T, number) to track the original index of each element
    const stabilizedThis = arr.map((el, index) => [el, index]) as [T, number];
    // Create a stable comparator that uses the original index to break ties
    const stableCmp = (a, b) => {
        const order = cmp!(a[0], b[0]);
        if (order != 0) return order;
        return a[1] - b[1];
    }
    // Sort the array of tuples
    stabilizedThis.sort(stableCmp);
    // Copy the original elements into the original array
    for (let i=0; i<arr.length; i++) {
      arr[i] = stabilizedThis[i][0];
    }
    return arr;
  }
  