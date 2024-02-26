import { t } from "elysia";
import { makeCancelAppointment } from "../../use-case/factories/makeCancelAppointment";

export const cancelAppointmentParamsSchema = t.Object({
    appointment_id: t.String({
        error: 'Bad request'
    }),
})

export const cancelAppointmentBodySchema = t.Object({
})

interface CancelAppointmentParams {
    params: {
        appointment_id: string
    },
}

export async function cancelAppointment({
    params: {
        appointment_id,
    },
}: CancelAppointmentParams) {
    const cancelAppointment = makeCancelAppointment()

    const { appointment } = await cancelAppointment.execute({
        appointment_id,
    })

    return { appointment }

}