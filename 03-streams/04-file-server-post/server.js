const fs = require('fs');
const http = require('http');
const path = require('path');
const LimitSizeStream = require('./LimitSizeStream');

const ONE_MG = 1048576;

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

  if (fs.existsSync(filepath)) {
    res.statusCode = 409;
    res.end('File already exist');
    return;
  }

  switch (req.method) {
    case 'POST':
      const stream = fs.createWriteStream(filepath);
      const limitStream = new LimitSizeStream({ limit: ONE_MG });

      req.pipe(limitStream).pipe(stream);

      limitStream.on('error', (err) => {
        if (err.code === 'LIMIT_EXCEEDED') {
          fs.unlinkSync(filepath);
          res.statusCode = 413;
          res.end('Limit exceeded');
        }
      });

      stream.on('error', () => {
        res.statusCode = 500;
        res.end('Something went wrong');
      });

      stream.on('finish', () => {
        res.statusCode = 201;
        res.end('File created');
      });

      req.on('aborted', () => {
        fs.unlinkSync(filepath);
        stream.destroy();
        res.end('Lost connection');
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
