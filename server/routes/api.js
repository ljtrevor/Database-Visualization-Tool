var User = require('../models/user');
var jwt = require('jsonwebtoken');
var config = require('../../config');

var Project = require('../models/project');
var User = require('../models/user');

var dbController = require('../controllers/db');
var projectController = require('../controllers/project');
var userController = require('../controllers/user');

module.exports = function(app,express) {

	//get an instance of the express router
	var apiRouter = express.Router();

	apiRouter.post('/authenticate', userController.authenticate);
	apiRouter.post('/register', userController.register);
	apiRouter.route('/me')
		.get(userController.checkToken, userController.getUser);

	apiRouter.route('/projects')
		.get(userController.checkToken, projectController.getProjects)
		.post(userController.checkToken, projectController.createProject);

	apiRouter.route('/projects/:project_id')
		.delete(userController.checkToken, projectController.deleteProject);

	apiRouter.route('/projects/edit')
		.post(userController.checkToken, projectController.editProject);

	apiRouter.route('/projects/visualize/:project_id')
		.get(userController.checkToken, dbController.visualize);

	return apiRouter;
};
