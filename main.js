const express = require('express');
const app = express();
const child_process = require('child_process');
var install = require('install-if-needed');
var fs = require('fs');

app.get('/', (req, res) => res.send('HOMEPAGE NOT CONFIGURED'));

app.get('/:href(*)', (req, res) => {
  res.header('Content-Type', 'application/javascript');
  req.params[0] = req.params[0].replace(/\./g, '');
  console.log(req.params[0].replace(/[/].*/g, ''));
  child_process.execFile(
    'npm',
    ['show', req.params[0].replace(/[/].*/g, ''), 'version'],
    (pkgerr, pkgversion, pkgerror) => {
      fs.readFile(
        'cache/' +
          req.params[0].replace(/\//g, '-') +
          '-' +
          Object.keys(req.query)[0] +
          '-' +
          pkgversion.replace(/\./g, '') +
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
                  console.log([
                    '--require',
                    req.params[0],
                    ...(Object.keys(req.query)[0]
                      ? ['--standalone', Object.keys(req.query)[0]]
                      : [])
                  ]);
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
                      console.log(stdout);
                      fs.writeFile(
                        'cache/' +
                          req.params[0].replace(/\//g, '-') +
                          '-' +
                          Object.keys(req.query)[0] +
                          '-' +
                          pkgversion.replace(/\./g, '') +
                          '.js',
                        stdout,
                        function(err) {
                          res.sendFile(
                            'cache/' +
                              req.params[0].replace(/\//g, '-') +
                              '-' +
                              Object.keys(req.query)[0] +
                              '-' +
                              pkgversion.replace(/\./g, '') +
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
                '-' +
                pkgversion.replace(/\./g, '') +
                '.js',
              { root: __dirname }
            );
          }
        }
      );
    }
  );
});

app.get('/', (req, res) => res.send('HOMEPAGE NOT CONFIGURED'));
app.listen(3001, () => console.log('NPMPak listening on port 3001!'));
