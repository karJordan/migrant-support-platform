// Reads the { errors: { field: [messages] } } shape returned by the
// backend's inputValidation middleware, and flattens it to one
// message per field for display under each input.
export function parseFieldErrors(failure: unknown): Record<string, string> | null {
    if (
        typeof failure === "object" &&
        failure !== null &&
        "errors" in failure &&
        typeof (failure as Record<string, unknown>).errors === "object"
    ) {
        const errors = (failure as { errors: Record<string, string[]> }).errors;
        const flattened: Record<string, string> = {};

        for (const [field, messages] of Object.entries(errors)) {
            flattened[field] = messages[0];
        }

        return flattened;
    }

    return null;
}