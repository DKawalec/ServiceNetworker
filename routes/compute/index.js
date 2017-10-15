var app    = require('express');
var router = app.Router();
var cn     = require('./common-neighbours');
var pa     = require('./preferential-attachment');
var hp     = require('./hub-promoted');
var ra     = require('./resource-allocation');

router.use('/cn', cn);
router.use('/pa', pa);
router.use('/hp', hp);
router.use('/ra', ra);

/* GET available algorithms and their urls */
router.get('/', function (req, res) {
  res.status(200).json([{
    name: 'Common Neighbours',
    endpoint: '/cn'
  }, {
    name: 'Preferential Attachment',
    endpoint: '/pa'
  }, {
    name: 'Hub Promoted',
    endpoint: '/hp'
  }, {
    name: 'Resource Allocation',
    endpoint: '/ra'
  }]);
});

module.exports = router;
