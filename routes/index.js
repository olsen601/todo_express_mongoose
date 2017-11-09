var express = require('express');
var router = express.Router();
//var ObjectID = require('mongodb').ObjectID;
var Task = require('../models/task');

/* GET home page. */
router.get('/', function(req, res, next) {

  Task.find( {completed: false})
  .then( (docs) => {
    res.render('index', {title: 'Incomplete Tasks', tasks: docs})
  }).catch( (err) => {
    next(err); //to the error handler
  });

});

router.get('/task/:_id', function(req, res, next) {

  Task.findOne( {_id: req.params._id} )
  .then( (task) => {
    if (task) {
      res.render('task', {title: 'Task', task: task});
    }else{
      res.status(404).send('Task not found');
    }
  })
  .catch((err) => {
    next(err);
  })

});

router.get('/completed', function(req,res, next){

  Task.find( {completed: true} )
    .then( (docs) => {
      res.render('tasks_completed', { title: 'Completed tasks' , tasks: docs });
    }).catch( (err) => {
      next(err);
    });

});

router.post('/add', function(req, res, next) {

var date = new Date().toLocaleString("en-US", {timeZone: "America/Chicago"});

  if (!req.body || !req.body.text) {
    //no task text info, ignore and redirect to home page
    req.flash('error', 'please enter a task');
    res.redirect('/');
  }

  else {
    // Insert into databse. New tasks are assumed to be not completed.
    new Task({text: req.body.text, completed: false, dateCreated: date}).save()
      .then((newTask) => {
        console.log('The new task created is: ', newTask);
        res.redirect('/');
      })
      .catch((err) => {
        next(err);
      });
  }
});

router.post('/done', function(req, res, next){

  var date = new Date().toLocaleString("en-US", {timeZone: "America/Chicago"});

    Task.findOneAndUpdate( { _id : req.body._id}, { $set : { completed: true, dateCompleted: date}} )
      .then((updatedTask) => {
        if (updatedTask) {
          res.redirect('/');
        } else {
          res.status(404).send("Error marking task done: not found");
        }
      }).catch((err) => {
        next(err);
    })

});

router.post('/alldone', function(req, res, next) {

  var date = new Date().toLocaleString("en-US", {timeZone: "America/Chicago"});

  Task.updateMany( { completed : false } , { $set : { completed : true, dateCompleted: date} } )
    .then( (result) => {
      console.log("How many documents were modified? ", result.n);
      req.flash('info', 'All tasks marked as done!');
      res.redirect('/');
    })
    .catch( (err) => {
      next(err);
    })
  });

router.post('/delete', function(req, res, next){

  Task.deleteOne( { _id : req.body._id } )
    .then( (result) => {

      if (result.deletedCount === 1) {
        res.redirect('/');

      } else {
        res.status(404).send('Error deleting task: not found');
      }
    })
    .catch((err) => {
      next(err);
    });

  });

  router.post('/deleteDone', function(req, res, next) {

    Task.deleteMany( {completed: true} )
      .then( (result) => {
        req.flash('info', 'All Completed Tasks Deleted');
        res.redirect('/');
      })
      .catch( (err) => {
        next(err);
      })
    });


module.exports = router;
