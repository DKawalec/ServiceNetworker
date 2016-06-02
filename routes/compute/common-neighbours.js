var app        = require('express');
var router     = app.Router();
var jsonParser = require('body-parser').json();

/* GET csv handling site. */
router.post('/', jsonParser, function (req, res) {
  res.status(200).send('OK!');
});

module.exports = router;
