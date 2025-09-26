// ChatGPT was used for guidance and clarification

const STRINGS = require("./lang/messages/en/user.js");
const utility = require("./modules/utils.js");

const http = require('http');
const url = require('url');
const fs = require('fs');

const port = process.env.PORT || 8080;

// server class to handle requests
class Server {
    constructor(port) {
        this.port = port;
        this.utils = utility;
        
        // routing table for different endpoints
        this.routes = {
            [STRINGS.datePath]: this.handleGetDate.bind(this),
            [STRINGS.writePath]: this.handleWriteFile.bind(this)
        };
    }

    // start the server and handles requests
    start() {
        const server = http.createServer((req, res) => {
            const q = url.parse(req.url, true);
            let pathname = q.pathname;
            if (pathname.endsWith('/')) {
                pathname = pathname.slice(0, -1);
            }
            
            // check if the path matches any route
            const handler = this.routes[pathname];
            if (handler) {
                handler(res, q);
            } else if (pathname.startsWith(STRINGS.readPath)) {
                this.handleReadFile(res, pathname);
            } else {
                this.errResponse(res, STRINGS.err404, 404);
            }
        });

        // start listening on the specified port
        server.listen(this.port, () => {
            console.log(`Server listening on port ${this.port}`);
        });
    }

    // handler for /getDate endpoint
    handleGetDate(res, q) {
        const name = q.query["name"];
        if (!name) {
            return this.errResponse(res, STRINGS.nameErr);
        }

        const message = STRINGS.message.replace('%1', name) + " " + this.utils.getDate();
        this.handleResponse(res, 200, `<span style='color: blue;'>${message}</span>`);
    }

    // handler for /writeFile endpoint
    handleWriteFile(res, q) {
        const text = q.query["text"];
        if (!text) {
            return this.errResponse(res, STRINGS.textErr);
        }

        fs.appendFile(STRINGS.fileName, text + "\n", (err) => {
            if (err) {
                return this.errResponse(res, STRINGS.fileErr, 500);
            }
            this.handleResponse(res, 200, `${STRINGS.fileSuccess} ${text}`);
        });
    }

    // handler for /readFile endpoint
    handleReadFile(res, pathname) {
        // extracts filename from pathname
        const filename = pathname.substring(STRINGS.readPath.length + 1);

        fs.readFile(filename, "utf8", (err, data) => {
            if (err) {
                return this.errResponse(res, `${STRINGS.readErr} ${filename}`, 404);
            }
            this.handleResponse(res, 200, `<pre>${data}</pre>`);
        });
    }

    // utility to send HTTP responses
    handleResponse(res, statusCode, content) {
        res.writeHead(statusCode, { 'Content-Type': 'text/html' });
        res.end(content);
    }

    // utility to send error responses
    errResponse(res, message, statusCode = 400) {
        this.handleResponse(res, statusCode, message);
    }
}

const server = new Server(port);
server.start();