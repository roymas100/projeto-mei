declare module "bun" {
    interface Env {
        PORT: string;
        CANCELLATION_URL: string;
    }
}