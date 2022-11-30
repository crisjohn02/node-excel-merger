const fs = require('fs');
const path = require('path');
const parser = require('./utils/parser');
const _ = require('lodash');
const XLSX = require('xlsx');

// node index 
console.log(__dirname)

const args = process.argv.slice(2);


let target_folder, base_folder, output_file;
base_folder = args[0] || 'base';
target_folder = args[1] || 'target';
output_file = args[2] || 'output/output.xlsx';


let _tmp_targets = fs.readdirSync(path.join(target_folder));
for (const t of _tmp_targets) {
    if (path.extname(t) !== '.csv') {
        // convert excel to csv files
        const wb = XLSX.readFile(path.join(target_folder, t));
        XLSX.writeFile(wb, path.join(target_folder, path.parse(t).name + '.csv'), { bookType: 'csv'} )
        fs.rmSync(path.join(target_folder, t))
    }
}

let _tmp_base = fs.readdirSync(path.join(base_folder));
let tmp_file = _tmp_base[0]
if (path.extname(tmp_file) !== '.csv') {
    // convert base excel to csv
    const wb = XLSX.readFile(path.join(base_folder, tmp_file));
    XLSX.writeFile(wb, path.join(base_folder, path.parse(tmp_file).name + '.csv'), { bookType: 'csv'} )
    fs.rmSync(path.join(base_folder, tmp_file))
}

const headers_list = [];
const files_list = [];

const c_files = fs.readdirSync(path.join(base_folder));
const target_files = fs.readdirSync(path.join(target_folder));


let base_data = [];
let target_data = [];

async function loadBaseData(file) {
    let data = await parser(path.join(base_folder, file));
    return indexing(data, 'Respondent ID', path.parse(file).name);
}

async function loadTargets() {
    let target_data = [];
    for (const file of target_files) {
        let data = await parser(path.join(target_folder, file));
        d = indexing(data, 'Participant ID', path.parse(file).name);
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
    
    result.unshift(_.flatten(formatHeaders()));
    
    const worksheet = XLSX.utils.aoa_to_sheet(result);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet);
    XLSX.writeFile(workbook, path.join(output_file), {compression: true});
}

function formatHeaders() {
    return headers_list.map((value, key) => {
        value[0] = value[0] + ' - ' + files_list[key];
        return value;
    });
}

async function start() {
    base_data = await loadBaseData(c_files[0]);
    target_data = await loadTargets();
    merge(base_data, target_data);
}

start();

function indexing(data, index, filename) {
    let header = _.head(data);
    headers_list.push(header);
    files_list.push(filename);
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