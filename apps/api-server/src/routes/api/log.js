
const express = require('express');
const router = express.Router({mergeParams: true});

router.post('/', (req, res) => {
    const { message, context } = req.body;
    console.error('[admin-client-log]', message, context || {});
    res.status(200).json({ status: 'ok' });
});

module.exports = router;
