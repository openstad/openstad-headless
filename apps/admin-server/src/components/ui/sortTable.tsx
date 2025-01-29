const sortFunctions = {
    'date-added': (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    'createdAt': (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    'date-modified': (a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    'id': (a: any, b: any) => b.id - a.id,
    'seqnr': (a: any, b: any) => b.seqnr - a.seqnr,
    'resourceId': (a: any, b: any) => b.resourceId - a.resourceId,
    'type': (a: any, b: any) => b.type.toLowerCase().localeCompare(a.type.toLowerCase()),
    'resource': (a: any, b: any) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()),
    'voted-yes': (a: any, b: any) => b.resource?.yes || 0 - a.resource?.yes || 0,
    'voted-no': (a: any, b: any) => b.resource?.no || 0 - a.resource?.no || 0,
    'name': (a: any, b: any) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
    'url': (a: any, b: any) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
    'email': (a: any, b: any) => { let aEmail = a?.email || ''; let bEmail = b?.email || ''; return aEmail.toLowerCase().localeCompare(bEmail.toLowerCase()) },
    'postcode': (a: any, b: any) => { let aPostcode = a?.postcode || ''; let bPostcode = b?.postcode || ''; return aPostcode.toLowerCase().localeCompare(bPostcode.toLowerCase()) },
    'code': (a: any, b: any) => b.code - a.code,
    'ip': (a: any, b: any) => b.ip - a.ip,
    'userId': (a: any, b: any) => b.userId - a.userId,
    'endDate': (a: any, b: any) => new Date(b.config?.project?.endDate).getTime() - new Date(a.config?.project?.endDate).getTime(),
    'votesIsActive': (a: any, b: any) => ( b.config.votes.isActive ? 1 : -1 ) - ( a.config.votes.isActive ? 1 : -1 ),
    'commentsIsActive': (a: any, b: any) => ( b.config.comments.canComment ? 1 : -1 ) - ( a.config.comments.canComment ? 1 : -1 ),
    'addToNewResources': (a: any, b: any) => ( b.addToNewResources ? 1 : -1 ) - ( a.addToNewResources ? 1 : -1 ),
};

export const sortTable = (sortType: string, el: React.MouseEvent<HTMLElement, MouseEvent>, data: Array<any>) => {

    const sortFunction = sortFunctions[sortType as keyof typeof sortFunctions];
    if (!sortFunction) {
        return data;
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

export const searchTable = (setData: Function, type?: string, delay: number = 250) => {
    let timerId: NodeJS.Timeout;
    const debouncedSearchTable = (searchTerm: string, data: Array<any> = [], originalData: Array<any> = []) => {
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            if (searchTerm.length >= 1) {
                const searchResult = data.filter(item => {
                    if (type) {
                        const value = item[type];
                        return String(value || '').toLowerCase().includes(searchTerm.toLowerCase());
                    } else {
                        return Object.values(item).some(val =>
                          String(val || '').toLowerCase().includes(searchTerm.toLowerCase())
                        );
                    }
                });
                setData(searchResult);
            } else {
                setData(originalData);
            }
        }, delay);
    };

    return debouncedSearchTable;
};
