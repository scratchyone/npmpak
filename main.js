const express = require('express');
const app = express();
const child_process = require('child_process');
var install = require('install-if-needed');
var fs = require('fs');

app.get('/', (req, res) => res.send('HOMEPAGE NOT CONFIGURED'));
app.get(/^\/(.+)/, (req, res) => {
  req.params[0] = req.params[0].replace(/\./g, '');
  fs.readFile(
    'cache/' + req.params[0].replace(/\//g, '-') + '.js',
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
                ['--require', req.params[0]],
                function(error, stdout, stderr) {
                  res.send(stdout);
                  fs.writeFile(
                    'cache/' + req.params[0].replace(/\//g, '-') + '.js',
                    stdout,
                    function(err) {
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
        res.send(data);
      }
    }
  );
});
app.listen(3001, () => console.log('NPMPak listening on port 3001!'));
