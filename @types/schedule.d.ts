// declare interface Schedule {
//     start_of_shift: string
//     end_of_shift: string
//     duration_per_appointment: string
//     user_company_user_id: string
//     user_company_company_id: string
//     recurrency_type: $Enums.Recurrency_type
//     dates: string
//     priority?: number
//     name: string
//     intervals: Interval[]
// }

declare interface Interval {
    name: string,
    duration: string
    start: string
}
