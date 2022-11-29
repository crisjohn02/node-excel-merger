const fs = require('fs');
const path = require('path');
const json2csv = require('json2csv');
const parser = require('./utils/parser');
const _ = require('lodash');
const XLSX = require('xlsx');


let target_folder, base_folder
target_folder = 'csv';
base_folder = 'base';


const c_files = fs.readdirSync(path.join(__dirname, base_folder));
const target_files = fs.readdirSync(path.join(__dirname, target_folder));


let base_data = [];
let target_data = [];

async function loadBaseData(filepath) {
    let data = await parser(filepath);
    return indexing(data, 'Respondent ID');
}

async function loadTargets() {
    let target_data = [];
    for (const file of target_files) {
        let data = await parser(path.join(__dirname, target_folder, file));
        d = indexing(data, 'Participant ID');
        target_data.push(d);
    }
    return target_data;
}

async function merge(base, targets) {
    let result = [];
    for (const b of base) {
        let ds = [];
        ds.push(b.data);
        targets.forEach((t, index) => {
            let row = _.head(t.filter(x => x.key == b.key));
            if (!row) {
                row = {data: Array(headers_list[index + 1].length).fill(null)};
            }
            ds.push(row.data);
        });
        result.push(_.flatten(ds));
    }
    
    result.unshift(_.flatten(headers_list));
    const worksheet = XLSX.utils.aoa_to_sheet(result);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet);
    XLSX.writeFile(workbook, "output/test.xlsx", {compression: true});
}

async function start() {
    base_data = await loadBaseData(path.join(__dirname, base_folder, c_files[0]));
    target_data = await loadTargets();
    merge(base_data, target_data);
}

start();

const headers_list = [];


function indexing(data, index) {
    let header = _.head(data);
    headers_list.push(header);
    let key = _.indexOf(header, index);
    data.shift();
    let result = _.map(data, (d) => {
        return {
            key: d[key],
            data: d
        };
    });
    return result;
}