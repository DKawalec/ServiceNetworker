var app    = require('express');
var router = app.Router();
var common = require('./common-neighbours');

router.use('/cn', common);

/* GET available algorithms and their urls */
router.get('/', function (req, res) {
  res.status(200).json([{
    name: 'Common Neighbours',
    endpoint: '/cn',
    method: 'POST'
  }]);
});

module.exports = router;
