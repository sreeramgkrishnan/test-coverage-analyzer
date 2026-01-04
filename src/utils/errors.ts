export class AppError extends Error {
    constructor(public message: string, public statusCode: number) {
        super(message);
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}

export const handleError = (err: AppError, res: any) => {
    const status = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ message });
};