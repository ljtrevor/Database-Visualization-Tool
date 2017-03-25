angular.module('visualizeService', ['ngRoute'])
    .factory('Visualize', ['$http', function($http) {
        var databaseInfo = {};
        var databaseObject = {};
        return {
            setDatabaseInfo: function(data) {
                databaseInfo = data;
            },
            getDatabaseInfo: function() {
                return databaseInfo;
            },
            setDatabaseObject: function(data) {
                databaseObject = data;
            },
            getDatabaseObject: function() {
                return databaseObject;
            }
        }
        
    }]);