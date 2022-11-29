const fs = require('fs');
const csv = require('csvtojson');

function parseData(filepath) {
    return new Promise((resolve, reject) => {
        csv({
            noheader: true,
            output: 'csv'
        })
        .fromFile(filepath)
        .then((result) => {
            resolve(result);
        });
    });
}

module.exports = parseData;