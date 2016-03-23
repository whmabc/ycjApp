var settings = require('../models/settings.js');
var url = require('url');
var mysql = require('mysql');
var util = require('../util/util.js');
var memCache = require('../models/MemCache.js');

var DbOpt = {
    //创建数据库连接
    createConnect: function () { 
        var conn = mysql.createConnection({
            host: settings.DBHOST,
            user: settings.DBUSER,
            password: settings.DBPASSWD,
            database: settings.DBNAME,
            port: settings.DBPORT
        });
        return conn;
     },
    //启动时，获取最新简讯列表，放入内存数据库中
    initMemNews : function (limit, fn) { 
        //创建数据库连接对象
        var conn = mysql.createConnection({
            host: settings.DBHOST,
            user: settings.DBUSER,
            password: settings.DBPASSWD,
            database: settings.DBNAME,
            port: settings.DBPORT
        });
        //连接数据库
        conn.connect(function (err) { 
            if(err) {
                conn.end();
                conn = null;
                console.log(err);
                return;
            }
            var sql = "select * from kx_news order by id desc limit " + limit ;
           
            //执行查询操作
            conn.query(sql, function (err, results) { 
                if(err){
                    console.log(err);
                }
                else if(results)//查询到结果
                {
                    returnVal = results;
                }
                conn.end();
                conn = null;
                fn(results);
             });
         });
    },
    //获取指定表所有历史数据，按照指定列降序排列，参数limit为限制条数。
    getHistoryNews: function (req, res) {
        var params = url.parse(req.url, true);
        var limit = Number(params.query.limit);
        var start = params.query.start;
        //创建数据库连接对象
        var conn = mysql.createConnection({
            host: settings.DBHOST,
            user: settings.DBUSER,
            password: settings.DBPASSWD,
            database: settings.DBNAME,
            port: settings.DBPORT
        });
        //连接数据库
        conn.connect(function (err) { 
            if(err) {
                conn.end();
                conn = null;
                console.log(err);
                return;
            }
            var sql = "select * from kx_news where id < '" + start + "' order by id desc ";
            
            if(limit > 0) {
                sql += " limit " + limit;
            }
            //执行查询操作
            conn.query(sql, function (err, results) { 
                var returnVal = [];
                if(err){
                    console.log(err);
                }
                else if(results)//查询到结果
                {
                    returnVal = results;
                }
                conn.end();
                conn = null;
                return res.json({datas: returnVal});
             });
         });
     },//end getHistoryNews
     //查询新生成数据，条件为大于内存里的最大ID。
     getNewMsg: function (field, table, maxId, fn) { 
        var newMsg = [];
        //创建数据库连接对象
        var conn = mysql.createConnection({
            host: settings.DBHOST,
            user: settings.DBUSER,
            password: settings.DBPASSWD,
            database: settings.DBNAME,
            port: settings.DBPORT
        });
        //连接数据库
        conn.connect(function (err) { 
            if(err) {
                conn.end();
                conn = null;
                console.log(err);
                fn(newMsg);
                return;
            }
            var sql = "select * from " + table + " where " + field + " > '" + maxId + "' order by " + field + " desc limit " + settings.MAX_SELECT_COUNT;
            //执行查询操作
            conn.query(sql, function (err, results) { 
                if(err){
                    console.log(err);
                }
                else if(results)//查询到结果
                {
                    newMsg = results;
                }
                conn.end();
                conn = null;
                fn(newMsg);
            });
         });
     },//end checkNewMsg
     //为啥不能用呢？
     getCurNewsData : function (req, res) {  
         return getHistoryNews('id', 'kx_news', req, res);
     },
     //查询当前数据库表最大ID
     getMaxId : function (field, table, fn) { 
        var maxId = '0';
        //创建数据库连接对象
        var conn = mysql.createConnection({
            host: settings.DBHOST,
            user: settings.DBUSER,
            password: settings.DBPASSWD,
            database: settings.DBNAME,
            port: settings.DBPORT
        });
        //连接数据库
        conn.connect(function (err) { 
            if(err) {
                conn.end();
                conn = null;
                console.log(err);
                return fn(maxId);
            }
            var sql = "select max(" + field + ") as '" + field + "' from " + table;
            //执行查询操作
            conn.query(sql, function (err, results) { 
                if(err){
                    console.log(err);
                }
                else if(results)//查询到结果
                {
                    maxId = results[0][field];
                }
                conn.end();
                conn = null;
                fn(maxId);
            });
         });
     },//end getMaxId
     //获取所有当前行情数据，缺省查询简要行情
     getCurHqData : function (fn, yjhq) {
        //是否要查询简要行情
        var jyhq = arguments[1] ? false : true;
        //是否是浏览器查询
        // var res = arguments[3]  ? res : false;
        var curHqData = [];
        //创建数据库连接对象
        var conn = mysql.createConnection({
            host: settings.DBHOST,
            user: settings.DBUSER,
            password: settings.DBPASSWD,
            database: settings.DBNAME,
            port: settings.DBPORT
        });
        //连接数据库
        conn.connect(function (err) { 
            if(err) {
                conn.end();
                conn = null;
                console.log(err);
                fn(curHqData);
                return;
            }
            var sql = "select * from hq_item ";
            if(jyhq){
                sql += util.genJyhqCondition(settings.JYHQ_LIST);
            }
            //执行查询操作
            conn.query(sql, function (err, results) { 
                if(err){
                    console.log(err);
                }
                else if(results)//查询到结果
                {
                    curHqData = util.addClass(results);
                }
                conn.end();
                conn = null;
                // //浏览器查询
                // if(res){
                //     res.json({datas: curHqData});
                // }
                // //定时器轮询
                // else{
                    fn(curHqData);
                // }
            });
         });
     },//end getCurHqData
     //获取财经日历数据。date: $scope.selDate, nation: $scope.nations, important:$scope.importants
    getCalendarData: function (req, res) {
        // var params = url.parse(req.url, true);
        //用户选择的日期
        var selDate = req.body.selDate;
        //用户选择的国家列表
        var nations = req.body.nations;
        //用户选择的重要性列表
        var importants = req.body.importants;
        
        //创建数据库连接对象
        var conn = mysql.createConnection({
            host: settings.DBHOST,
            user: settings.DBUSER,
            password: settings.DBPASSWD,
            database: settings.DBNAME,
            port: settings.DBPORT
        });
        //连接数据库
        conn.connect(function (err) { 
            if(err) {
                conn.end();
                conn = null;
                console.log(err);
                return;
            }
            var sql = "select * from cjrl where date='" + selDate + "' ";
            sql += util.genNationCondition(nations);
            sql += util.genImportantCondition(importants);
            sql += " order by time asc ";
            
            //执行查询操作
            conn.query(sql, function (err, results) { 
                if(err){
                    console.log(err);
                }
                conn.end();
                conn = null;
                return res.json({calendar_datas: results});
             });
         });
     },//end getCalendarData
    //获取内存最新快讯列表
    getMemNews: function (req, res) {
        //获得客户端当前最新Id
        var params = url.parse(req.url, true);
        var newestNewsId = params.query.start;
        var retValue = [];
        if(memCache.news_Datas.length > 0){
            for(var i=0; i<memCache.news_Datas.length; i++){
                //如果内存快讯列表比客户端快讯Id大，则需要更新
                if(memCache.news_Datas[i].id > newestNewsId){
                    retValue.push(memCache.news_Datas[i]);
                }
                else{
                    break;
                }
            }
        }
        return res.json({datas: retValue});
     },//end getMemNews
 };

module.exports = DbOpt;

//等待其他3张表后再完成下面3个数组的查询
            //  calendar_events = [];
            //  calendar_holidays = [];
            // calendar_debts = [];