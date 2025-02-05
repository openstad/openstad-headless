module.exports = function (app) {
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'UP',
            message: 'Server is healthy',
            timestamp: new Date().toISOString(),
        });
    });

}