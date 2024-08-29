export default function useUserActivity({ projectId, userId }) {
    let self = this;
    const { data, error, isLoading } = self.useSWR(
        {
            projectId,
            userId
        },
        'userActivity.fetch'
    );

    let activities = data || [];

    if (error) {
        const event = new window.CustomEvent('osc-error', {
            detail: new Error(error),
        });
        document.dispatchEvent(event);
    }

    return { data: activities, error, isLoading };
}
