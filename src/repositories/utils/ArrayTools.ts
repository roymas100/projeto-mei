interface K {
    [k: string]: unknown
}

interface Filter {
    gt?: any
    gte?: any
    // equals?: string | 
    // in?: string[] | 
    // notIn?: string[] | 
    // lt?: string | StringFieldRefInput<$PrismaModel>
    // lte?: string | StringFieldRefInput<$PrismaModel>
    // contains?: string | StringFieldRefInput<$PrismaModel>
    // startsWith?: string | StringFieldRefInput<$PrismaModel>
    // endsWith?: string | StringFieldRefInput<$PrismaModel>
    // mode?: QueryMode
    // not?: NestedStringFilter<$PrismaModel> | string
}

interface Where {
    [K: string]: string | Date | number | boolean | Filter
}

interface OrderBy {
    [K: string]: 'asc' | 'desc'
}

interface Select {
    [K: string]: boolean
}

interface ToolsArgs {
    where?: any,
    orderBy?: any,
    select?: any,
}

export class ArrayTools<Scheme extends K> {
    private items

    constructor(
        items: Scheme[]
    ) {
        this.items = items
    }

    private orderBy(arr: Scheme[], orderBy: OrderBy) {
        return arr.sort((a, b) => {
            for (const key in orderBy) {
                const order = orderBy[key as keyof typeof orderBy];
                if (a[key as keyof Scheme] !== b[key as keyof Scheme]) {
                    return order === 'asc'
                        ? (a[key as keyof Scheme] < b[key as keyof Scheme] ? -1 : 1)
                        : (a[key as keyof Scheme] > b[key as keyof Scheme] ? -1 : 1);
                }
            }
            return 0;
        })
    }

    private where(items: Scheme[], where: Where) {
        const newItems = items.filter(item => {
            let pass = true

            for (const key in where) {
                if (typeof where[key] === 'object') {
                    const filter = where[key] as Filter
                    for (const filterKey in filter) {
                        switch (filterKey) {
                            case 'gte':
                                pass = pass && item[key as keyof Scheme] >= filter[filterKey]
                                break;
                            case 'gt':
                                pass = pass && item[key as keyof Scheme] > filter[filterKey]
                                break;
                            default:
                                break;
                        }
                    }
                } else {
                    pass = pass && item[key] === where[key]
                }


            }

            return pass
        })

        return newItems
    }

    private select(items: Scheme[], select: Select) {
        const newItems = items.map(item => {
            const arrItem = Object.entries(item)

            return arrItem.reduce((sum, item) => ({
                ...sum,
                [item[0]]: select[item[0]] ? item[1] : undefined
            }), {} as Scheme)
        })

        return newItems
    }

    findMany(
        {
            where,
            select,
            orderBy
        }: ToolsArgs): Scheme[] {
        let items = this.items

        if (where) {
            items = this.where(items, where)
        }

        if (orderBy) {
            items = this.orderBy(items, orderBy)
        }

        if (select) {
            items = this.select(items, select)
        }

        return items
    }

    findFirst(payload: ToolsArgs) {
        return this.findMany(payload)[0]
    }
}