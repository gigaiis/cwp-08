const net = require('net');
const fs = require('fs');
const childProcess = require('child_process');
const port = 8124;

let seed = 0;
let workers = [];

const server = net.createServer((client) => {
    client.setEncoding('utf8');
    client.on('data', hand);
    function hand(data, err) {
        console.log(data);
        let req = JSON.parse(data);
        if (req.key === 'worker')
            if (req.method === 'start') {
                if (req.interval !== undefined) {
                    let d = Date.now();
                    let id = d + seed++;
                    let file = `./files/${id}.json`;
                    let proc = childProcess.spawn('node', ['worker.js', file, req.interval], { detached: true } );
                    workers.push( { proc : proc, id : id, startedOn : d, file : file } );                       
                    let res = { id : id, startedOn : d, meta : 'add' };
                    console.log('start: ' + res);
                    client.write(JSON.stringify(res));
                }
            } else if (req.method === 'get') {
                let w = [];
                for (let i = 0; i < workers.length; i++) {
                    let numb = fs.readFileSync(workers[i].file);
                    w.push( { id : workers[i].id, startedOn : workers[i].startedOn, numbers : numb } );
                }
                let res = { meta: 'get', workers : w };               
                client.write(JSON.stringify(res));
            } else if (req.method === 'remove') {
                if (req.id !== undefined) {
                    let ind = workers.findIndex(worker => worker.id == req.id);
                    console.log('remove: ' + ind);
                    let numb = fs.readFileSync(workers[ind].file);
                    let res = { meta : 'remove', id :  workers[ind].id, startedOn : workers[ind].startedOn, numbers : numb };
                    client.write(JSON.stringify(res));
                    fs.appendFile(workers[ind].file, "]");
                    process.kill(workers[ind].proc.pid);
                    workers.splice(ind, 1);
                }
            }
    };

    client.on('end', () => {
        console.log(`Client ${client.id} disconnected`);
    });
});

server.listen(port, () => {
    console.log(`Server listening on localhost:${port}`);
});