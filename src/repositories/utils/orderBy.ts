
export function customOrderBy<T, V>(arr: T[], orderBy?: V | V[]) {
    return orderBy ? arr.sort((a, b) => {
        for (const key in orderBy) {
            const order = orderBy[key as keyof typeof orderBy];
            if (a[key as keyof T] !== b[key as keyof T]) {
                return order === 'asc' ? (a[key as keyof T] < b[key as keyof T] ? -1 : 1) : (a[key as keyof T] > b[key as keyof T] ? -1 : 1);
            }
        }
        return 0;
    }) : arr
}