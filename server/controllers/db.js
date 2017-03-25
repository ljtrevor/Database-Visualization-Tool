var mongoose = require('mongoose');
var mysql = require('mysql');
var util = require('util');
var async = require('async');

var Project = require('../models/project');

var dbController;

dbController = (function() {

	function dbController() {}

	dbController.visualize = function(req, res) {
        dbController.getDb(req, function(err, response) {
            if (err) {
                res.status(400).send(err);
            } else {
                res.status(200).json(response);
            }
        });
    }

	dbController.getDb = function(req, getDBcallback) {
		Project.findOne({
            _id: req.params.project_id
		}).exec(function(err, docs) {
			if (err) {
				console.log("Could not find database");
				return err;
			} else {
				dbController.connectToDb(docs, function (err, result) {
					if (err) {
						return getDBcallback(err);
					} else {
						return getDBcallback(err, result);
					}
				});

			}
		});
	};

	dbController.connectToDb = function(project, callbackResponse) {
		console.log("Connecting to mysql");
		var connection = mysql.createConnection({
			host: project.address,
			user: project.username,
			password: project.password,
			database: project.dbname
		});
		connection.connect(function(err) {
			if (err) {
				console.log("Unable to connect to db");
				return callbackResponse(err);
			} else {
				console.log("Connection successful")
			}
		});

		function getTables(callback) {
			var resultArray = {};
			resultArray['tables'] = [];

			var tableQuery = util.format("select table_name from information_schema.tables\
		 	where table_schema=\'%s\'", project.dbname);
		 	connection.query(tableQuery, function(err, rows) {
		 		if (!err) {
		 			async.each(rows, function(row, callbackTables) {
		 				var tableName = row.table_name;
		 				resultArray['tables'].push({'table_name': tableName});
		 				callbackTables();
		 			}, function(err) {
		 				callback(err, resultArray);
		 			});
		 		}
		 	});
		}

		function getColumnsAndPrimaryKeys(resultArray, callback) {
			var table_count = 0;
			resultArray['tables'].forEach(function(table, index) {
				var tableName = table['table_name'];
				resultArray['tables'][index]['columns'] = [];
				resultArray['tables'][index]['primary_keys'] = [];
				var columnQuery = util.format("select column_name, column_key from information_schema.columns\
				where table_schema = \'%s\' and table_name = \'%s\'", project.dbname, tableName);
				connection.query(columnQuery, function(err, cols) {
					if (!err) {
						async.each(cols, function(col, callbackColumns) {
							var columnName = col.column_name;
							var columnKey = col.column_key;
							resultArray['tables'][index]['columns'].push(
								{"column_name": columnName});
							// Check if this column is a primary key
							if (columnKey == 'PRI') {
								resultArray['tables'][index]['primary_keys'].push(
									{"column_name": columnName});
							}
							callbackColumns();
						}, function(err) {
							table_count++;
							if (table_count == resultArray['tables'].length) {
								callback(err, resultArray);
							}
						});
					}
				});
			});
		}

		function getForeignKeys(resultArray, callback) {
			//Count the number of queries needed to find all foreign keys
			var curr_column_count = 0;
			var total_count = 0;
			resultArray['tables'].forEach(function(table, table_index) {
				resultArray['tables'][table_index]['columns'].forEach(function(col, col_index) {
					total_count++;
				});
			});


			resultArray['tables'].forEach(function(table, table_index) {
				var tableName = table['table_name'];
				resultArray['tables'][table_index]['columns'].forEach(function(col, col_index) {
					var colName = col['column_name'];
					var fkQuery = util.format("select referenced_table_name, referenced_column_name\
						from information_schema.key_column_usage where table_name = \'%s\'\
						and column_name=\'%s\'", tableName, colName);
					resultArray['tables'][table_index]['columns'][col_index]['foreign_keys'] = [];
					connection.query(fkQuery, function(err, fks) {
						if (!err) {

							async.each(fks, function(fk, callbackFks) {

								var fkTable = fk.referenced_table_name;
								var fkColumn = fk.referenced_column_name;
								if (fkTable != null && fkColumn != null)
								{
									resultArray['tables'][table_index]['columns'][col_index]['foreign_keys'].push
										({"table_name": fkTable,
										"column_name": fkColumn});
								}
								callbackFks();
							}, function(err) {
								curr_column_count++;
								if (total_count == curr_column_count) {
									callback(err, resultArray);
								}
							});
						} else {
							console.log(err);
						}
					});
				});
			});
		}

		async.waterfall([
			getTables,
			getColumnsAndPrimaryKeys,
			getForeignKeys
			], function (err, result) {
				if (!err) {
					return callbackResponse(err, result);
				} else {
                    return callbackResponse(err);
				}
            }
        );
	}

	return dbController;
})();

module.exports = dbController;
