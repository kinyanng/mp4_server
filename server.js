// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');
var User = require('./models/user');
var Task = require('./models/task');
var bodyParser = require('body-parser');
var router = express.Router();

// Replace this with your Mongolab URL
mongoose.connect('mongodb://admin:ksmew3nZ7GbepqTr@ds030829.mlab.com:30829/mp4');

// Create our Express application
var app = express();

// Use environment defined port or 4000
var port = process.env.PORT || 4000;

// Allow CORS so that backend and frontend could pe put on different servers
var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Intercept OPTIONS method
    if (req.method == 'OPTIONS') {
        res.sendStatus(200);
    }
    else {
        next();
    }
};
app.use(allowCrossDomain);

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// All our routes will start with /api
app.use('/api', router);

// Default route here
var homeRoute = router.route('/');

homeRoute.get(function (req, res) {
    res.json({message: 'Hello World!'});
});

function getParam(param) {
    return eval('(' + param + ')');
}

function getErrorMessage(error) {
    var message = "Error: ";

    if (!error.errors) {
        message += error.message;
    }
    else {
        var isFirstError = true;
        for (var key in error.errors) {
            if (error.errors.hasOwnProperty(key)) {
                message += (isFirstError ? "" : " " ) + error.errors[key].message;
                isFirstError = false;
            }
        }
    }

    return message;
}

// Add more routes here
var usersRoute = router.route('/users');
// Get
usersRoute.get(function (req, res) {
    if (req.query.count == 'true') {
        // Count number of users matched where
        User.count(getParam(req.query.where))
            .exec(function (error, count) {
                if (error) {
                    res.status(500);
                    res.json({
                        message: getErrorMessage(error),
                        data: []
                    });
                }
                else {
                    res.json({
                        message: "OK",
                        data: count
                    });
                }
            });
    }
    else {
        User.find(getParam(req.query.where))
            .select(getParam(req.query.select))
            .skip(req.query.skip)
            .limit(req.query.limit)
            .sort(getParam(req.query.sort))
            .exec(function (error, users) {
                if (error) {
                    res.status(500);
                    res.json({
                        message: getErrorMessage(error),
                        data: []
                    });
                }
                else {
                    res.json({
                        message: "OK",
                        data: users
                    });
                }
            });
    }
});
// Post
usersRoute.post(function (req, res) {
    var user = new User();
    user.name = req.body.name;
    user.email = req.body.email;

    user.save(function (error) {
        if (error) {
            res.status(500);
            res.json({
                message: error.code == 11000 ? "This email already exists" : getErrorMessage(error), // 11000 = duplicate key
                data: []
            });
        }
        else {
            res.status(201);
            res.json({
                message: "User added",
                data: user
            });
        }
    });
});

// --------------------------------------------------
var userDetailsRoute = router.route('/users/:id');
// Get
userDetailsRoute.get(function (req, res) {
    User.findById(req.params.id, function (error, user) {
        if (error) {
            res.status(500);
            res.json({
                message: getErrorMessage(error),
                data: []
            });
        }
        else if (user == null) {
            res.status(404);
            res.json({
                message: "User not found",
                data: []
            });
        }
        else {
            res.json({
                message: "OK",
                data: user
            });
        }
    });
});
// Put
userDetailsRoute.put(function (req, res) {
    User.findById(req.params.id, function (error, user) {
        if (error) {
            res.status(500);
            res.json({
                message: getErrorMessage(error),
                data: []
            });

            return;
        }
        else if (user == null) {
            res.status(404);
            res.json({
                message: "User not found",
                data: []
            });

            return;
        }

        user.email = req.body.email;
        user.name = req.body.name;
        user.pendingTasks = req.body.pendingTasks;

        user.save(function (error) {
            if (error) {
                res.status(500);
                res.json({
                    message: error.code == 11000 ? "This email already exists" : getErrorMessage(error), // 11000 = duplicate key
                    data: []
                });
            }
            else {
                res.json({
                    message: "User updated",
                    data: user
                });
            }
        });
    });
});
// Delete
userDetailsRoute.delete(function (req, res) {
    User.findByIdAndRemove(req.params.id, function (error, user) {
        if (error) {
            res.status(500);
            res.json({
                message: getErrorMessage(error),
                data: []
            });
        }
        else if (user == null) {
            res.status(404);
            res.json({
                message: "User not found",
                data: []
            });
        }
        else {
            res.json({
                message: "User deleted",
                data: []
            });
        }
    });
});

// --------------------------------------------------
var tasksRoute = router.route('/tasks');
// Get
tasksRoute.get(function (req, res) {
    if (req.query.count == 'true') {
        // Count number of tasks matched where
        Task.count(getParam(req.query.where))
            .exec(function (error, count) {
                if (error) {
                    res.status(500);
                    res.json({
                        message: getErrorMessage(error),
                        data: []
                    });
                }
                else {
                    res.json({
                        message: "OK",
                        data: count
                    });
                }
            });
    }
    else {
        Task.find(getParam(req.query.where))
            .select(getParam(req.query.select))
            .skip(req.query.skip)
            .limit(req.query.limit)
            .sort(getParam(req.query.sort))
            .exec(function (error, tasks) {
                if (error) {
                    res.status(500);
                    res.json({
                        message: getErrorMessage(error),
                        data: []
                    });
                }
                else {
                    res.json({
                        message: "OK",
                        data: tasks
                    });
                }
            });
    }
});
// Post
tasksRoute.post(function (req, res) {
    var task = new Task();
    task.name = req.body.name;
    task.deadline = req.body.deadline;
    task.description = req.body.description;
    task.assignedUser = req.body.assignedUser;
    task.assignedUserName = req.body.assignedUserName;

    task.save(function (error) {
        if (error) {
            res.status(500);
            res.json({
                message: getErrorMessage(error),
                data: []
            });
        }
        else {
            res.status(201);
            res.json({
                message: "Task added",
                data: task
            });
        }
    });
});

// --------------------------------------------------
var taskDetailsRoute = router.route('/tasks/:id');
// Get
taskDetailsRoute.get(function (req, res) {
    Task.findById(req.params.id, function (error, task) {
        if (error) {
            res.status(500);
            res.json({
                message: getErrorMessage(error),
                data: []
            });
        }
        else if (task == null) {
            res.status(404);
            res.json({
                message: "Task not found",
                data: []
            });
        }
        else {
            res.json({
                message: "OK",
                data: task
            });
        }
    });
});
// Put
taskDetailsRoute.put(function (req, res) {
    Task.findById(req.params.id, function (error, task) {
        if (error) {
            res.status(500);
            res.json({
                message: getErrorMessage(error),
                data: []
            });

            return;
        }
        else if (task == null) {
            res.status(404);
            res.json({
                message: "Task not found",
                data: []
            });

            return;
        }

        task.name = req.body.name;
        task.deadline = req.body.deadline;
        task.description = req.body.description;
        task.assignedUser = req.body.assignedUser;
        task.assignedUserName = req.body.assignedUserName;
        task.completed = req.body.completed;

        task.save(function (error) {
            if (error) {
                res.status(500);
                res.json({
                    message: getErrorMessage(error),
                    data: []
                });
            }
            else {
                res.json({
                    message: "Task updated",
                    data: task
                });
            }
        });
    });
});
// Delete
taskDetailsRoute.delete(function (req, res) {
    Task.findByIdAndRemove(req.params.id, function (error, task) {
        if (error) {
            res.status(500);
            res.json({
                message: getErrorMessage(error),
                data: []
            });
        }
        else if (task == null) {
            res.status(404);
            res.json({
                message: "Task not found",
                data: []
            });
        }
        else {
            res.json({
                message: "Task deleted",
                data: []
            });
        }
    });
});


// Start the server
app.listen(port);
console.log('Server running on port ' + port);
