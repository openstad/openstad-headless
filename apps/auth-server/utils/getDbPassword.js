const getDbPassword = async () => {
    switch(process.env.DB_AUTH_METHOD) {
        case 'azure-auth-token':
            const { getAzureAuthToken } = require('./azure')
            return await getAzureAuthToken()
        default:
            return process.env.DB_PASSWORD
    }
}

module.exports = getDbPassword