const fs = require('fs');
const path = require('path');
const json2csv = require('json2csv');
const parser = require('./utils/parser');
const _ = require('lodash');
const XLSX = require('xlsx');
// XLSX.set_fs(fs);

// if(!fs.existsSync(path.join(__dirname,'csv')))
//     fs.mkdirSync(path.join(__dirname,'csv'))
// if(!fs.existsSync(path.join(__dirname,'csv','a')))
//     fs.mkdirSync(path.join(__dirname,'csv','a'))
// if(!fs.existsSync(path.join(__dirname,'csv','b')))
//     fs.mkdirSync(path.join(__dirname,'csv','b'))
// if(!fs.existsSync(path.join(__dirname,'output')))
//     fs.mkdirSync(path.join(__dirname,'output'))

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('Input base folder', folder => {
    base
});

const a_files = fs.readdirSync(path.join(__dirname, 'csv', 'a'));
const b_files = fs.readdirSync(path.join(__dirname, 'csv', 'b'));

const c_files = fs.readdirSync(path.join(__dirname, 'csv', 'c'));
const target_files = fs.readdirSync(path.join(__dirname, 'csv', 'd'));


let base_data = [];
let target_data = [];

async function loadBaseData(filepath) {
    let data = await parser(filepath);
    return indexing(data, 'Respondent ID');
}

async function loadTargets() {
    let target_data = [];
    for (const file of target_files) {
        let data = await parser(path.join(__dirname, 'csv', 'd', file));
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
    // let flatten = json2csv.parse(result, {objects: false, arrays: true});

    // let lines = flatten.split('\n');
    // lines.splice(0,1);
    // let _fp = path.join(__dirname, 'output', `test.csv`.toLocaleLowerCase());
    // fs.writeFileSync(_fp, lines.join('\n'));
}

async function start() {
    base_data = await loadBaseData(path.join(__dirname, 'csv', 'c', c_files[0]));
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


// console.log(data);

let highestMatchCount = 0;

// if (a_files.length > 0 && b_files.length > 0) {
//     a_files.forEach((a) => {
//         let file1 = path.join(__dirname, 'csv', 'a', a)

//         b_files.forEach((b) => {
//             let file2 = path.join(__dirname, 'csv', 'b', b);

//             async function runMerger() {
//                 let merged = [];
//                 let part1 = await parser(file1);
//                 let part2 = await parser(file2);
//                 let part1Filename = path.basename(file1, '.csv');
//                 let part2Filename = path.basename(file2, '.csv');

//                 let part1Keys = part1[0];
//                 let part2Keys = part2[0];
//                 console.log(part2);

//                 let part1PrimaryKeyIndex = part1Keys.indexOf('Respondent ID');
//                 let part2PrimaryKeyIndex = part2Keys.indexOf('Participant ID');
//                 if(part2PrimaryKeyIndex < 0){
//                     part2PrimaryKeyIndex = part2Keys.indexOf('Respondent ID');
//                 }

//                 for(let i=0; i<part1.length; i++){
//                     if(i < 1){
//                         /**
//                          * APPEND COLUMN HEADERS
//                          */
//                         merged.push([...part1Keys, ...part2Keys]);
//                     }else{
//                         /**
//                          * LOOP THROUGH PART 1 DATA
//                          */
//                         let part1CurrentRow = part1[i];
//                         let matchCount = 0;
//                         for(let j=1; j<part2.length; j++){
//                              /**
//                              * LOOP THROUGH PART 2 DATA
//                              */
//                             let part2CurrentRow = part2[j];

//                             /**
//                              * CHECK PRIMARY KEYS ARE MATCHED THEN APPEND TO "merged" VARIABLE
//                              */
//                             let pk1 = part1CurrentRow[part1PrimaryKeyIndex];
//                             let pk2 = part2CurrentRow[part2PrimaryKeyIndex];

//                             if(pk1 === pk2 && pk1 !== ""){                
//                                 matchCount++;
//                                 merged.push([...part1CurrentRow, ...part2CurrentRow]);
//                             }
//                         }
//                         if(highestMatchCount < matchCount){
//                             highestMatchCount = matchCount;
//                         }
                        
//                     }
//                 }

//                 let flattenArray = json2csv.parse(merged, {objects: false, arrays: true});

//                 let lines = flattenArray.split('\n');
//                 lines.splice(0,1);
//                 let _fp = path.join(__dirname, 'output', `${part1Filename} - ${part2Filename}.csv`.toLocaleLowerCase());
//                 fs.writeFileSync(_fp, lines.join('\n'));
//             }

//             runMerger();
//         });
//     });
// }