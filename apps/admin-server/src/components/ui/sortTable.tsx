const sortFunctions = {
    'date-added': (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    'date-modified': (a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    'id': (a: any, b: any) => b.id - a.id,
    'type': (a: any, b: any) => b.type.toLowerCase().localeCompare(a.type.toLowerCase()),
    'resource': (a: any, b: any) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()),
    'voted-yes': (a: any, b: any) => b.resource?.yes || 0 - a.resource?.yes || 0,
    'voted-no': (a: any, b: any) => b.resource?.no || 0 - a.resource?.no || 0,
    'name': (a: any, b: any) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
};

export const sortTable = (sortType: string, el: React.MouseEvent<HTMLElement, MouseEvent>, data: Array<any>) => {
    const sortFunction = sortFunctions[sortType as keyof typeof sortFunctions];
    if (!sortFunction) {
        return;
    }

    const filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(button => button.classList.remove('font-bold'));
    filterButtons.forEach(button => button.classList.remove('text-black'));

    el.currentTarget.classList.toggle('--up');
    el.currentTarget.classList.add('font-bold');
    el.currentTarget.classList.add('text-black');

    const direction = el.currentTarget.classList.contains('--up') ? 'up' : 'down';

    const sortedWidgets = [...data].sort((a: any, b: any) => {
        const result = sortFunction(a, b);
        return direction === 'up' ? result : -result;
    });

    return sortedWidgets;
};

export const searchTable = (setData: Function, delay: number = 500) => {
    let timerId: NodeJS.Timeout;

    const debouncedSearchTable = (searchTerm: string, data: Array<any> = [], originalData: Array<any> = []) => {
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            if (searchTerm.length >= 3) {
                const searchResult = data.filter(item =>
                    Object.values(item).some(val =>
                        String(val).toLowerCase().includes(searchTerm.toLowerCase())
                    )
                );
                setData(searchResult);
            } else {
                setData(originalData);
            }
        }, delay);
    };

    return debouncedSearchTable;
};
