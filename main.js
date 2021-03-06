const express = require('express');
const app = express();
const child_process = require('child_process');
var install = require('install-if-needed');
var fs = require('fs');

app.get('/', (req, res) =>
  res.send(
    `<link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet"><style>*{font-family: 'Roboto', sans-serif;}</style><h1><a id="NPMPak_0"></a>NPMPak</h1>
<p>Easy Browserify CDN for fast prototyping. It supports bundle and standalone.</p>
<h5><a id="How_does_it_work_3"></a>How does it work?</h5>
<ol>
<li>It runs npm show</li>
<li>It checks if up to date cached version exists.</li>
<li>If it doesn’t, it downloads the package from npm.</li>
<li>Then it runs browserify on the package.</li>
<li>It saves the result to file, and sends.</li>
</ol>
<h2><a id="API_10"></a>API</h2>
<h4><a id="GET_package_12"></a>GET /:package</h4>
<p>Get module in bundled mode.<br>
Demo: <a href="https://npmpak.scratchyone.com/uuid">https://npmpak.scratchyone.com/uuid</a></p>
<h4><a id="GET_packagename_16"></a>GET /:package?:name</h4>
<p>Get module in standalone mode.<br>
Demo: <a href="https://npmpak.scratchyone.com/uuid?uuidv1">https://npmpak.scratchyone.com/uuid?uuidv1</a></p>`
  )
);

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

app.listen(3001, () => console.log('NPMPak listening on port 3001!'));
