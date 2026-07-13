// Laravel validation failures are always 422 with { message, errors: { field: [...] } }.
// Anything else (network error, 500, etc.) has no field-level errors — just a message.
export function getFieldErrors(err) {
    return err.response?.status === 422 ? (err.response.data.errors ?? {}) : {};
}

export function getErrorMessage(err) {
    return err.response?.data?.message || 'Something went wrong. Please try again.';
}