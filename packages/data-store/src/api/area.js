export default {
    fetch: async function ({ projectId }) {

        let url = `/api/project/${projectId}/area`;
        return this.fetch(url);
    },
}