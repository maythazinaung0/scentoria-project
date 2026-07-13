// Lets non-React code (like axios interceptors) trigger notifications
// without needing to be inside a React component.
let handler = null;

export function registerNotificationHandler(fn) {
    handler = fn;
}

export function notifyFromOutsideReact(payload) {
    if (handler) handler(payload);
}