export async function logToServer(message: string, context: any = {}) {
    try {
        await fetch('/api/openstad/api/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, context }),
        });
    } catch (err) {
        console.warn('Kon log niet naar server sturen', err);
    }
}