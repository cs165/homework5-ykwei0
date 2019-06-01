const express = require('express');
const bodyParser = require('body-parser');
const googleSheets = require('gsa-sheets');

const key = require('./privateSettings.json');

// TODO(you): Change the value of this string to the spreadsheet id for your
// GSA spreadsheet. See HW5 spec for more information.
const SPREADSHEET_ID = '1SPXO5kfSU0Da90L_4gjwoL9ijxUZ5Jn1bwy-iP-F0rU';

const app = express();
const jsonParser = bodyParser.json();
const sheet = googleSheets(key.client_email, key.private_key, SPREADSHEET_ID);

app.use(express.static('public'));

async function onGet(req, res) {
  const result = await sheet.getRows();
  const rows = result.rows;
  console.log(rows);

  // TODO(you): Finish onGet.
  let nrow = rows.length;
  let ncol = rows[0].length;
  let array = [];
  //let object = {};
  for(let i=1;i<nrow;i++) {
    let object = {};
    for(let j=0;j<ncol;j++) {
      console.log( rows[0][j]+': '+ rows[i][j]);
      object[rows[0][j]] = rows[i][j];
    }
    array.push(object);
  }
  console.log('\n'+'output sheet array');
  console.log(array);
  res.json(array);
}
app.get('/api', onGet);

async function onDelete(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;
  
  // TODO(you): Implement onDelete.
  const result = await sheet.getRows();
  const rows = result.rows;
  let nrow = rows.length;
  let ncol = rows[0].length;
  let flag = -1;
  for(let i=0;i<ncol;i++) {
    if(rows[0][i].toLowerCase()===column.toLowerCase()) {
      flag = i;
      break;
    }
  }
  let response;
  let count = 1;
  if(flag<0) {
    console.log('no match column');
    res.json( { response: 'success'} );
  }
  else {
    for(let i=1;i<nrow;i++) {
      if(rows[i][flag].toLowerCase()===value.toLowerCase()) {
        response = await sheet.deleteRow(i);
        break;
      }
      count++;
    }
    if(count<nrow) {
      console.log('delete success');
      res.json(response);
    }
    else {
      console.log('no match value');
      res.json( { response: 'success'} );
    }
  }
  //res.json( { status: 'unimplemented'} );
}
app.delete('/api/:column/:value',  onDelete);

async function onPost(req, res) {
  const messageBody = req.body;

  // TODO(you): Implement onPost.
  //console.log(messageBody);
  const result = await sheet.getRows();
  const rows = result.rows;
  let nrow = rows.length;
  let ncol = rows[0].length;
  let newrow = [];
  for(let column in messageBody) {
    //console.log(column);
    //console.log(messageBody[column]);
    //find inputColumnValue's position in the fisrt row
    let flag;
    for(let i=0;i<ncol;i++) {
      if(rows[0][i].toLowerCase()===column.toLowerCase()) {
        flag = i;
        break;
      }
    }
    newrow[flag] = messageBody[column];
  }
  console.log(newrow);
  let response = await sheet.appendRow(newrow)
  res.json(response);
  //res.json( { status: 'unimplemented'} );
}
app.post('/api', jsonParser, onPost);

async function onPatch(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;
  const messageBody = req.body;
  //console.log(messageBody);
  // TODO(you): Implement onPatch.
  const result = await sheet.getRows();
  const rows = result.rows;
  let nrow = rows.length;
  let ncol = rows[0].length;
  let cflag, rflag;
  let newrow = [];
  for(let i=0;i<ncol;i++) {
    if(rows[0][i].toLowerCase()===column.toLowerCase()) {
      cflag = i;
      break;
    }
  }
  for(let i=1;i<nrow;i++) {
    if(rows[i][cflag].toLowerCase()===value.toLowerCase()) {
      rflag = i;
      newrow = rows[rflag];
      //console.log(newrow);
      break;
    }
  }
  for(let p in messageBody) {
    //console.log(p);
    let flag;
    for(let i=0;i<ncol;i++) {
     if(rows[0][i].toLowerCase()===p.toLowerCase()) {
        flag = i;
        break;
      }
    }
    newrow[flag] = messageBody[p];
  }
  let response = await sheet.setRow(rflag,newrow);
  res.json(response);
}
app.patch('/api/:column/:value', jsonParser, onPatch);


// Please don't change this; this is needed to deploy on Heroku.
const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`Server listening on port ${port}!`);
});
