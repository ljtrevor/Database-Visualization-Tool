angular.module('projectService', ['ngRoute'])
    .factory('Projects', ['$http', function($http) {
        return {
            get : function() {
                return $http.get('/api/projects');
            },
            create : function(projectData){
                return $http.post('/api/projects', projectData);
            },
            delete : function(id) {
                return $http.delete('/api/projects/' + id);
            },
            edit : function(projectData) {
                return $http.post('/api/projects/edit', projectData);
            },
            visualize : function(id) {
                return $http.get('/api/projects/visualize/' + id);
            }
        }
    }]);