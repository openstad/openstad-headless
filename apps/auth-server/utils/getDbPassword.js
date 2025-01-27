const getDbPassword = async () => {
    switch(process.env.DB_AUTH_METHOD) {
        default:
            return process.env.DB_PASSWORD
    }
}

module.exports = getDbPassword