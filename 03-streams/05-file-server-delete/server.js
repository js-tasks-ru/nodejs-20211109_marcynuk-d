const fs = require('fs');
const http = require('http');
const path = require('path');

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  if (pathname.split('/').length >= 2) {
    res.statusCode = 400;
    res.end('Subfolders are not supported');
    return;
  }

  switch (req.method) {
    case 'DELETE':
      fs.unlink(filepath, (error) => {
        if (!error) {
          res.statusCode = 200;
          res.end('all good');
        } else {
          if (error.code === 'ENOENT') {
            res.statusCode = 404;
            res.end('File not found');
          } else {
            res.statusCode = 500;
            res.end('Something went wrong');
          }
        }
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
