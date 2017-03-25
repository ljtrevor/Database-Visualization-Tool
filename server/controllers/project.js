var User = require('../models/user');
var Project = require('../models/project');

var ProjectController;

ProjectController = (function() {

	function ProjectController() {}

	ProjectController.getProjects = function(req, res) {
	    Project.find({
	    	bellatrix_username: req.decoded.username
	    }, function (err, projects) {
	        if (err) {
	            res.status(400).send(err);
	        } else {
	        	res.json(projects);
	    	}
	    });
	}

	ProjectController.createProject = function (req, res) {
	    Project.create({
	        title: req.body.title,
	        address: req.body.address,
	        dbname: req.body.dbname,
	        username: req.body.username,
	        password: req.body.password,
	        bellatrix_username: req.decoded.username
	    }, function (err, project) {
	        if (err) {
	            res.status(400).send(err);
	        } else {
	        	ProjectController.getProjects(req, res);
	    	}
	    });
	}

	ProjectController.deleteProject = function(req, res) {
        Project.remove({
            _id : req.params.project_id
        }, function (err, project) {
            if (err) {
                res.status(400).send(err);
            } else {
            	ProjectController.getProjects(req, res);
        	}
        });
    }

	ProjectController.editProject = function(req, res) {
        Project.update(
            {_id : req.body.project_id},
            {title: req.body.title,
            address: req.body.address,
            dbname: req.body.dbname,
            username: req.body.username,
            password: req.body.password},{}, function (err, project) {
                if (err) {
                    res.status(400).send(err);
                } else {
                	ProjectController.getProjects(req, res);
                }
        });
    }

	return ProjectController;
})();

module.exports = ProjectController;
