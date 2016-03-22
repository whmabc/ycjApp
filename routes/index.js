var express = require('express');
var router = express.Router();

var settings = require('../models/settings.js');
var DbOpt = require('../models/DbOpt.js');
var memCache = require('../models/MemCache.js');

var url = require('url');

/* GET home page. */
router.get('/', function(req, res, next) {
   var obj = {
            title : settings.SITETITLE ,
            icp : settings.SITEICP
       };
   res.render('index.ejs', obj);
   //res.sendfile('./views/index.html');
});

/* GET news list page. */
router.get('/news', function(req, res, next) {
   var obj = {
            title : settings.SITETITLE ,
            icp : settings.SITEICP
       };
   res.render('news_list', obj);
});

/* GET calendar page. */
router.get('/calendar', function(req, res, next) {
   var obj = {
            title : settings.SITETITLE ,
            icp : settings.SITEICP
       };
   //res.render('calendar', obj);
   res.sendfile('./views/calendar.html');
});

/* GET mobile page. */
router.get('/mobile', function(req, res, next) {
   var obj = {
            title : settings.SITETITLE ,
            icp : settings.SITEICP
       };
   res.render('mobile', obj);
});

/* GET news detail page. */
router.get('/news/:newsId', function(req, res, next) {
   var obj = {
            title : settings.SITETITLE ,
            icp : settings.SITEICP
       };
   res.render('news_detail', obj);
});

/**
 * 用户点击加载更多资讯的时候，获取历史新闻资讯路由
 */
router.get('/getHistoryNews', function (req, res, next) { 
    //解决跨域访问设置
    res.setHeader("Access-Control-Allow-Origin", "*");
    DbOpt.getHistoryNews(req, res);
});

/**
 * 首次获取mini快讯
 */
router.get('/getMinNews', function (req, res, next) { 
    //解决跨域访问设置
    res.setHeader("Access-Control-Allow-Origin", "*");
    
    res.json({datas: memCache.min_News_Datas});
});

/**
 * 获取行情资讯
 */
router.get('/getCurrentHq', function (req, res, next) { 
    //解决跨域访问设置
    res.setHeader("Access-Control-Allow-Origin", "*");
    //DbOpt.getCurHqData(null, null, req, res);
    res.json({datas: memCache.hq_Datas});
});

/**
 * 获取财经日历(财经数据，财经大事，财经假期，财经国债)
 */
router.post('/getCalendarData', function (req, res, next) { 
    DbOpt.getCalendarData(req, res);
    // res.json({calendar_datas: calendar_Datas}, 
    //          {calendar_events: memCache.calendar_Events}, 
    //          {calendar_holidays: calendar_Holidays}, 
    //          {calendar_debts: calendar_debts});
});

module.exports = router;
