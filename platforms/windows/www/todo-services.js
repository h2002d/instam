angular.module('todo.services', [])

    .factory("SQLService", function ($q) {

        var db;
        var task='';
        var deltask;

        function createDB() {
            try {
                db = window.openDatabase("todoDB", "1.0", "ToDoApp", 10*1024*1024);
                db.transaction(function(tx){
                    tx.executeSql("CREATE TABLE IF NOT EXISTS tasks (task_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, task_name VARCHAR(100),task_image NVARCHAR(MAX))",[]);
                });
            } catch (err) {
                alert("Error processing SQL: " + err);
            }
            console.log('database created');
        }

        function setTasks(tname,timage){
            return promisedQuery("INSERT INTO tasks(task_name,task_image) VALUES ('" + tname + "','"+timage+"')", defaultResultHandler, defaultErrorHandler);
        }

        function delTasks(tid){
            return promisedQuery("DELETE FROM tasks where task_id = " + tid, defaultResultHandler, defaultErrorHandler);
        }

        function UpdateTasks(tname, tid,timage){
            return promisedQuery("UPDATE tasks SET task_name='" + tname + "',task_image='"+timage+"' WHERE task_id = " + tid, defaultResultHandler, defaultErrorHandler);
        }

        function getTasks(){
            return promisedQuery('SELECT * FROM tasks', defaultResultHandler, defaultErrorHandler);
        }

        function defaultResultHandler(deferred) {
            return function(tx, results) {
                var len = results.rows.length;
                var output_results = [];

                for (var i=0; i<len; i++){
                    var t = {'task_id':results.rows.item(i).task_id,'task_name':results.rows.item(i).task_name,'task_image':results.rows.item(i).task_image};
                    output_results.push(t);
                }

                deferred.resolve(output_results);
            }
        }

        function defaultErrorHandler(deferred) {
            return function(tx, results) {
                var len = 0;
                var output_results = '';
                deferred.resolve(output_results);
            }
        }

        function promisedQuery(query, successCB, errorCB) {
            var deferred = $q.defer();
            db.transaction(function(tx){
                tx.executeSql(query, [], successCB(deferred), errorCB(deferred));
            }, errorCB);
            return deferred.promise;
        }

        return {
            setup: function() {
                return createDB();
            },
            set: function(t_name,t_image) {
                return setTasks(t_name,t_image);
            },
            del: function(taskid) {
                return delTasks(taskid);
            },
            edit: function(t_name,taskid,t_image) {
                return UpdateTasks(t_name, taskid,t_image);
            },
            all: function() {
                return getTasks();
            }
        }
    });