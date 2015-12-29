var app  = require('express'),
  // path = require('path'),
  router = app.Router(),
  fs     = require('fs'),
  q      = require('q');

router.get('/', function (req, res) {
  res.status(400).send('Choose archive type');
});

router.get('/nos/:name', function (req, res) {
  fs.readFile('archive\\nos\\' + req.params.name + '.json', 'utf8', function (err, data) {
    if (err) res.status(500).send(err);
    else res.status(200).json({graph: { nodes: JSON.parse(data) } });
  });
});

router.get('/nos', function (req, res) {
  fs.readdir('archive\\nos', function(err, result) {
    if (err) res.status(500).send(err);
    else res.status(200).send(result);
  });
});

router.get('/dnos/:name', function (req, res) {
  fs.readFile('archive\\dnos\\' + req.params.name + '.json', 'utf8', function (err, data) {
    if (err) res.status(500).send(err);
    else res.status(200).json(JSON.parse(data));
  });
});

router.get('/dnos/', function (req, res) {
  fs.readdir('archive\\dnos', function(err, result) {
    if (err) res.status(500).send(err);
    else res.status(200).send(result);
  });
});

module.exports = router;