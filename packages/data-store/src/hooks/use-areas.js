export default function useAreas() {
    let self = this;


    const { data, error, isLoading } = self.useSWR(
        {},
        'areas.fetch'
    );

    let areas = data || [];
    if (error) {
        const event = new window.CustomEvent('osc-error', {
            detail: new Error(error),
        });
        document.dispatchEvent(event);
    }

    return { data: areas, error, isLoading };
}
