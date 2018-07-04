const express = require('express');
const app = express();
const child_process = require('child_process');
var install = require('install-if-needed');
var fs = require('fs');

app.get('/', (req, res) => res.send('HOMEPAGE NOT CONFIGURED'));

app.get('/:href(*)', (req, res) => {
  req.params[0] = req.params[0].replace(/\./g, '');
  fs.readFile(
    'cache/' +
      req.params[0].replace(/\//g, '-') +
      '-' +
      Object.keys(req.query)[0] +
      '.js',
    (err, data) => {
      if (err) {
        install(
          {
            dependencies: [req.params[0].replace(/[/].*/g, '')]
          },
          function(err) {
            if (err) {
              console.error('There was an error installing.');
              res.send('//Failed, ' + err);
            } else {
              child_process.execFile(
                'browserify',
                [
                  '--require',
                  req.params[0],
                  ...(Object.keys(req.query)[0]
                    ? ['--standalone', Object.keys(req.query)[0]]
                    : [])
                ],
                function(error, stdout, stderr) {
                  fs.writeFile(
                    'cache/' +
                      req.params[0].replace(/\//g, '-') +
                      '-' +
                      Object.keys(req.query)[0] +
                      '.js',
                    stdout,
                    function(err) {
                      res.sendFile(
                        'cache/' +
                          req.params[0].replace(/\//g, '-') +
                          '-' +
                          Object.keys(req.query)[0] +
                          '.js',
                        { root: __dirname }
                      );
                      if (err) {
                        return console.log(err);
                      }
                    }
                  );
                }
              );
            }
          }
        );
      } else {
        res.sendFile(
          'cache/' +
            req.params[0].replace(/\//g, '-') +
            '-' +
            Object.keys(req.query)[0] +
            '.js',
          { root: __dirname }
        );
      }
    }
  );
});

app.get('/', (req, res) => res.send('HOMEPAGE NOT CONFIGURED'));
app.listen(3001, () => console.log('NPMPak listening on port 3001!'));
