angular.module('projectCtrl', ['projectService', 'visualizeService'])

   .controller('projectController', ['$scope', '$location', 'Projects', 'Visualize',
    function($scope, $location, Projects, Visualize) {

        $scope.formProjectData = {};
        $scope.projectData = {};
        $scope.projectData.data = [];

        $scope.editProjectData = {};
        $scope.isEditingProject = false;
        $scope.editingId;

        $scope.message = '';

        var updateProjects = function() {
            Projects.get().then(function(data) {
                $scope.projectData = data.data;
            });
        }

        updateProjects();

        $scope.createProject = function() {
            Projects.create($scope.formProjectData)
                .success(function(data) {
                    updateProjects();
                    $scope.message = '';
                    $scope.formProjectData = {};
                })
                .error(function(data, err) {
                    $scope.message = "Could not create new project! Please try again.";
                });
        }

        $scope.deleteProject = function(id) {
            Projects.delete(id)
            .success(function(data) {
                updateProjects();
                $scope.message = '';
            })
            .error(function(data, err) {
                $scope.message = "Could not delete project. Please try again";
            });
        }

        $scope.editingId;
        $scope.editProject = function(id) {
            if ($scope.isEditingProject){
                $scope.isEditingProject = false;
                $scope.editProjectData.project_id = $scope.editingId;
                Projects.edit($scope.editProjectData)
                .success(function(data) {
                    updateProjects();
                    $scope.editProjectData = {};
                    $scope.editingId = null;
                    $scope.message = '';
                })
                .error(function(data, err) {
                    $scope.message = 'Could not edit project. Please try again.';
                });
            }else {
                $scope.editingId = id;
                $scope.isEditingProject = true;
                for (var p in $scope.projectData){
                    if (id == $scope.projectData[p]._id)
                    {
                        $scope.editProjectData.title = $scope.projectData[p].title;
                        $scope.editProjectData.address = $scope.projectData[p].address;
                        $scope.editProjectData.dbname = $scope.projectData[p].dbname;
                        $scope.editProjectData.username = $scope.projectData[p].username;
                        $scope.editProjectData.password = $scope.projectData[p].password;
                        break;
                    }
                }
            }
        }

        $scope.cancelEdit = function() {
            editingId = null;
            $scope.editProjectData = {};
            $scope.isEditingProject = false;
        }

        $scope.visualizeProject = function(id) {
            Projects.visualize(id)
            .success(function(data) {
                $scope.message = '';
                Visualize.setDatabaseInfo($scope.projectData);
                Visualize.setDatabaseObject(data);
                $location.path('/visualize');
            })
            .error(function(data, err) {
                $scope.message = "Could not connect to database! Please try again.";
            });
        }
    }]);
