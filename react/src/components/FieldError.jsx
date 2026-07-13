export default function FieldError({ errors, field }) {
    const messages = errors?.[field];
    if (!messages || messages.length === 0) return null;

    return (
        <p className="text-red-600 text-xs mt-1">{messages[0]}</p>
    );
}