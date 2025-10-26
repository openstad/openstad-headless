export const retrieveArg = (argToRetrieve) => {
    const givenArgs = process.argv
    const totalArgWithKeyAndValue = givenArgs.find(arg => arg.startsWith(argToRetrieve))
    let valueFromArg = null
    if (totalArgWithKeyAndValue) {
        valueFromArg = totalArgWithKeyAndValue.split("=")[1]
    }
    return valueFromArg
}

export const getDbPassword = async () => {
	switch(process.env.DB_AUTH_METHOD) {
		case 'azure-auth-token':
			const { getAzureAuthToken } = require('../src/util/azure')
			return await getAzureAuthToken()
		default:
			return process.env.DB_PASSWORD
	}
}