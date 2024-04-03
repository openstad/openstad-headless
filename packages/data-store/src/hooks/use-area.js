export default function useArea({ projectId, areaId }) {
    let self = this;

    const { data, error, isLoading } = self.useSWR(
        { projectId },
        'area.fetch'
    );

    let area = data || [];

    if (error) {
        const event = new window.CustomEvent('osc-error', {
            detail: new Error(error),
        });
        document.dispatchEvent(event);
    }

    return { data: area, error, isLoading };
}
