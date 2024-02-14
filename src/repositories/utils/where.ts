export function customWhere<T, V>(arr: T[], where?: V) {
    return where ? arr.find(item => {
        const entries = Object.entries(where)

        return entries.every(([key, value]) => item[key as keyof T] === value)
    }) : arr[0]
}