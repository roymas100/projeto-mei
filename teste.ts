

// function orderBy(arr: any, orderBy: any) {
//     return arr.sort((a: any, b: any) => {
//         for (const key in orderBy) {
//             const order = orderBy[key as keyof typeof orderBy];
//             if (a[key] !== b[key]) {
//                 return order === 'asc'
//                     ? (a[key] < b[key] ? -1 : 1)
//                     : (a[key] > b[key] ? -1 : 1);
//             }
//         }
//         return 0;
//     })
// }

import { parse } from "date-fns";


// const data = [
//     {
//         id: 1,
//         pamonhas: 1,
//         cebolas: 1
//     },
//     {
//         id: 2,
//         pamonhas: 2,
//         cebolas: 2
//     },
//     {
//         id: 2,
//         pamonhas: 3,
//         cebolas: 3
//     },
// ]

// console.log(orderBy(data, {
//     id: 'asc',
//     cebolas: 'desc'
// }))

console.log(parse('Sat', 'eee', new Date()))