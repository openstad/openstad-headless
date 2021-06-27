const hat = require('hat');
const ExternalCsrfToken = require("../../../models").ExternalCsrfToken;

const outputUser = (req, res, next) => {
    res.json(req.userObject);
};

exports.all = (req, res, next) => {
    res.json({
        total: req.totalCodeCount,
        data: req.users
    });
};

exports.show = [
    outputUser
];

exports.create = [
    outputUser
];

exports.update = [
    outputUser
];

exports.delete = [
    (req, res, next) => {
        res.json({'message': 'Deleted!'})
    }
]

exports.csrfSessionToken = [
    (req, res, next) => {
        const rack = hat.rack();
        const token = rack();

        new ExternalCsrfToken({
            token: token,
        })
        .save()
        .then((response) => {
            console.log('token', token)
            res.json({'token': token})
        })
        .catch((err) => {
            next(err);
        });
    }
]
