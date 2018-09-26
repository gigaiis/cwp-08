const http = require('http');
const net = require('net');
const hostname = '127.0.0.1';
const port = 3000;
const tcp_port = 8124;
const connection = new net.Socket();

const handlers = {
    '/workers': workers,
    '/workers/add': add,
    '/workers/remove': remove
};

function workers(req, res, payload, cb) {
    
}

function add(req, res, payload, cb) {
    
}

function remove(req, res, payload, cb) {
    
}

connection.connect(tcp_port, function () {
    console.log('Connected to the TCP server');
});

const server = http.createServer((req, res) => {
    parseBodyJson(req, (err, payload) => {
        const handler = getHandler(req.url);
        handler(req, res, payload, (err, result) => {
            if (err) {
                res.writeHead(err.code, {'Content-Type' : 'application/json'});
                res.end( JSON.stringify(err) );
                return;
            }
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(result, null, "\t"));
        });
    });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

function getHandler(url) {
    console.log(url);
    return handlers[url] || notFound;
}

function notFound(req, res, payload, cb) {
    cb({code: 404, message: 'Not found'});
}

function parseBodyJson(req, cb) {
    let body = [];
    req.on('data', function (chunk) {
        body.push(chunk);
    }).on('end', function () {
        body = Buffer.concat(body).toString();
        if (body !== "") {
            params = JSON.parse(body);
            cb(null, params);
        }
        else cb(null, null);
    });
}