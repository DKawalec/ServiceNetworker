var app = require('express');
// var path = require('path');
var router = app.Router();
var csv = require('csv');
var fs = require('fs');

/* GET csv handling site. */
router.get('/', function (req, res, next) {
  res.render('csv', {});
});

/* POST csv users listing. */
router.post('/', function (req, res, next) {
  if (req.files && req.files.csvFile) { 
    if (req.files.csvFile.extension === 'csv') {
      var fileName = req.files.csvFile.name,
      filePath = req.files.csvFile.path;
      
      fs.readFile(filePath, {encoding: 'utf-8'}, function (err, data) {
        if (err) res.status(400).send('Error processing file');
        else {
          csv.parse(data, {comment: '//', delimiter: ';', rowDelimiter: '\n'}, function (err, output) {
            if (err) res.status(400).send('Error parsing CSV file. Check file syntax before trying again');
            else {
              var transformedData = transformData(output); 
              csv.stringify(transformedData, {}, function (err, output) {
                if (err) res.status(400).send('The CSV file seemed fine, but data transformation failed. Check file formatting or contact the developer');
                else {
                  var resultFilePath,
                    path = filePath.split('\\');
                  path[1] = 'result_'+path[1];
                  resultFilePath = path.join('//');
                  fs.writeFile(resultFilePath, output, function (err) {
                    if (err) res.status(400).send('Error writing results file. This is embarassing.');
                    else {
                      res.status(200).download(resultFilePath, 'result.csv');
                      fs.unlinkSync(filePath);
                    }
                  });
                }
              })
            }
          });
        }
      });
    } 
    else res.status(400).send('Wrong file type! Only CSV files are accepted.');
  } else res.status(400).send('No file was sent.');
});

function transformData(array) {
  var chunk,
    result = [],
    i;
  for (i = 0; i < array.length; i++) {
    if (array[i].length === 3) chunk = [];
    chunk.push(array[i]);
    if (array[i].length === 2) result = result.concat(parseChunk(chunk));
  }
  return result;
}

function parseChunk(chunk) {
  var user, servId,
    result = [],
    topRow = chunk[0],
    servName, servTime, commTime, inputSize, outputSize,
    i, j, k;
  user = topRow[0];
  servId = topRow[1];
  for (i = 1; i < chunk.length-1; i++) {
    servName = chunk[i][0];
    inputSize = parseInt(chunk[i][2]);
    j = 3 + inputSize;
    outputSize = parseInt(chunk[i][j]);
    servTime = chunk[i][j+outputSize+1];
    commTime = chunk[i][j+outputSize+2];
    /* remember kids, this is the BAD way to code */
    for (outputSize += j; j < outputSize; j++)
      if (chunk[i][j+1] !== '#End')
        result.push([servName, chunk[i][j+1], servTime, undefined, commTime, servId, user]);
    /* check all results and add service execution time if needed */
    for (k = 0; k < result.length; k++)
      if (result[k][1] === servName) result[k][3] = servTime;
  }
  return result;
};

module.exports = router;
