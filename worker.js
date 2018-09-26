if (process.argv.length != 4) process.exit(0);

const fs = require('fs');
const path = process.argv[2];
const X = 1000 * parseInt(process.argv[3]);
const min = 0;
const max = 10000;

console.log('Path = ' + path);
console.log('X = ' + X);
fs.exists(path, (res) => {
    if (res) readJSON();
    else fs.writeFile(path, '[]', () => readJSON());
});

function readJSON() {
    fs.readFile(path, 'utf8', (err, data) => {
        let arr = JSON.parse(data);
        setTimeout(function push() {
            arr.push(Math.floor(Math.random() * (max - min)) + min);
            let dat = JSON.stringify(arr);
            // console.log(dat);
            fs.writeFile(path, dat, (err) => {
                if (err) console.error(err);
                setTimeout(push, X);
            });
        }, X); 
    });
}