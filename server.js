'use strict';

//pull in dependencies
require('dotenv').config();
const express = require('express');
const app = express();
const pg = require('pg')

//setup server constants
const PORT = process.env.PORT || 3000;
const client = new pg.Client(process.env.DATABASE_URL);

//front end configuration
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

//connect to the db
client.connect();
//if there are any issues with the connection, log those
client.on('error', err => console.error(err));

//application routes
//request parameterss :req_param_name is a better tool than using query strings
//e.g. query string: localhost:3000/tasks?id=12345&thing=cool&blah=fun
//with request params: localhost:3000/tasks/12345/cool/fun
app.get('/', getTasks);
app.get('/tasks/:task_id', getOneTask);
app.post('/add', addTask);
app.get('/add',showForm);


//DB: CREATE   READ    UPDATE   DELETE    maps as follows:
//REST: POST   GET     PUT      DELETE

function getTasks(req, res) {
  let SQL = `SELECT * FROM tasks`;
  return client.query(SQL)
    .then(results => {
      res.render('index',{results : results.rows})
    })
    .catch(err => console.error(err));
}

//localhost:333/tasks/12354  <--- that's the id
function getOneTask(req, res) {
  let SQL = 'SELECT * FROM tasks WHERE id=$1';
  let values = [req.params.task_id];

  return client.query(SQL, values)
    .then(result => {
      res.render('pages/detail-view', {task: result.rows[0]});
    })
    .catch(err => console.error(err));
}

function addTask(req,res) {
  //console.log('req body - data from our form:', req.body);

  //destructuring - newer es6 construct used heavily in react development:
  let { title, description, category, contact, status } = req.body;
  //this is equivalent to this.title = req.body.title .... etc.

  let SQL = 'INSERT INTO tasks(title,description,category,contact,status) VALUES ($1,$2,$3,$4,$5);';
  let values = [ title, description, category, contact, status ];

  return client.query(SQL, values)
    .then(() =>res.redirect('/'))
    .catch(err => console.error(err));
}

function showForm(req,res) {
  res.render('pages/add-view');
}

//404 catch all route
app.get('*', (req, res) => res.status(404).send('Page not found'));

//setup server for incoming traffic
app.listen(PORT, () => {
  console.log(`server is up on ${PORT}`);
});
