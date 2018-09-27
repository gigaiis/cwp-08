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
    connection.write(JSON.stringify( { key : 'worker', method : 'get' } ));
	connection.on('data', (data) => {
	    let d = JSON.parse(data);
	    if (d.do === 'get') {
	        d.workers.forEach((element) => {
	            let b = new Buffer(element.numbers);
	            element.numbers = b.toString();
	        });
	        cb(null, d);
	    }
	});
}

function add(req, res, payload, cb) {
    if (payload.x !== undefined) {
        connection.write(JSON.stringify( { key : 'worker', method : 'start', interval : payload.x } ));
        connection.on('data', (data) => {
            let d = JSON.parse(data);
            if (d.do = 'add') cb(null, d);
        });
    }
    else cb( { code: 404, message: `Key \'x\' not found` } );
}

function remove(req, res, payload, cb) {
    if (payload.id !== undefined) {
        connection.write(JSON.stringify( { key : 'worker', method : 'remove', id : payload.id } ));
        connection.on('data', (data) => {
            let d = JSON.parse(data);
            if (d.do === 'remove') {
            	// console.log('remove recv: ' + data);
            	let b;
            	if (d.numbers === undefined) b = [];
                else b = new Buffer(d.numbers);
                cb(null, { id: d.id, startedOn: d.startedOn, numbers: b.toString() } );
            }
        });
    }
    else cb( { code: 404, message: `Key \'id\' not found` } );
}

connection.connect(tcp_port, function () {
    console.log('Connected to the TCP server');
});

const server = http.createServer((req, res) => {
    parseBodyJson(req, (err, payload) => {
        const handler = getHandler(req.url);
        handler(req, res, payload, (err, result) => {
            if (err) {
                res.writeHead(err.code, {'Content-Type': 'application/json'});
                res.end( JSON.stringify(err) );
                return;
            }
            res.writeHead(200, {'Content-Type': 'application/json'} );
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