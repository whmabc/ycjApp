
var settings = require('../models/settings.js');
var DbOpt = require('../models/DbOpt.js');
var io = require('socket.io');
var util = require('../util/util.js');
var memCache = require('../models/MemCache.js');

/**
 * 启动socket连接，检查数据库发现有新内容后，推送给所有客户端
 */
exports.sendNewMsg = function (server) {
   var socketIO = io.listen(server); 
   //先初始化min快讯内存数据库
   DbOpt.getMinNews(settings.MAX_MINI_NEWS_COUNT, function (minNews) {  
        memCache.min_News_Datas = minNews;
        //获取快讯当前最大值，然后启动定时器函数，轮询数据库，如果有新快讯数据，发送给所有已经连接的客户端，每次发送一条数据
        DbOpt.getMaxId('id', 'kx_news', function (init_maxId) {
            //保存当前新闻的最大值
            var g_newsMaxId = '0';
            //启动后先更新一次当前最大值 
            g_newsMaxId = init_maxId;
            //启动定时器，轮询检测新增加的数据。
            setInterval(function () { 
                DbOpt.getMaxId('id', 'kx_news', function (maxId) {
                    //如果有新增数据
                    if(maxId > g_newsMaxId)
                    {
                        //用旧的maxId值去获取新数据
                        DbOpt.getNewMsg('id', 'kx_news', g_newsMaxId, function (newMsg) { 
                            if(newMsg.length > 0)
                            {
                                //console.log('timeinterval success get ' + newMsg.length + ' datas');
                                //循环每条数据，依次发送给客户端
                                for(var i=newMsg.length-1; i>=0; i--)
                                {
                                    socketIO.emit('NewMessage', newMsg[i]);
                                    //更新内存数据库miniNews列表
                                    memCache.min_News_Datas.pop();
                                    memCache.min_News_Datas.unshift(newMsg[i]);
                                }
                            }//end if (newMsg.length > 0)
                        });
                        //更新当前最大值 
                        g_newsMaxId = maxId;
                    }//end if(maxId > g_newsMaxId)
                });
            }, settings.COLLECT_INTERVAL);//end setInterval
        });
    });
    
    //获取行情当前最大值，然后启动定时器函数，轮询数据库，如果有新行情数据，发送给所有已经连接的客户端
    DbOpt.getCurHqData(function (init_hqData) {
       var g_curHqData = init_hqData;
       memCache.hq_Datas = init_hqData;
        //启动定时器，轮询检测新增加的数据。
        setInterval(function () { 
            DbOpt.getCurHqData(function (hqData) {
                //找到变化的行情列表
                var changedItems = util.getChangedItem(g_curHqData, hqData);
                //如果有变化的行情数据，就发送给客户端
                if(changedItems.length > 0){
                    socketIO.emit('NewHqData', changedItems);
                    //更新当前行情数据
                    g_curHqData = hqData;
                    //更新内存数据库行情列表
                    memCache.hq_Datas = hqData;
                }
            });
        }, settings.COLLECT_INTERVAL);
    });
    
   //获取财经日历当前最大值，然后启动定时器函数，轮询数据库，如果有新财经日历数据，发送给所有已经连接的客户端，每次发送一条数据
   DbOpt.getMaxId('id', 'cjrl', function (init_maxId) {
        //启动后先更新一次当前最大值 
        var g_calendarMaxId = '0';
        g_calendarMaxId = init_maxId;
        //启动定时器，轮询检测新增加的数据。
        setInterval(function () { 
            DbOpt.getMaxId('id', 'cjrl', function (maxId) {
                //如果有新增数据
                if(maxId > g_calendarMaxId)
                {
                    //用旧的maxId值去获取新数据
                    DbOpt.getNewMsg('id', 'cjrl', g_calendarMaxId, function (newMsg) { 
                        if(newMsg.length > 0)
                        { 
                             //循环每条数据，依次发送给客户端
                            for(var i=newMsg.length-1; i>=0; i--)
                            {
                                socketIO.emit('NewCalendarData', newMsg[i]);
                                //更新内存数据库财经日历数据列表
                                // for(var j=0; j<memCache.calendar_Datas.length;j ++){
                                //     if(newMsg[i].name == memCache.calendar_Datas[j].name){
                                //         memCache.calendar_Datas[j] = newMsg[i];
                                //         break;
                                //     }
                                // }
                            }
                        }//end if (newMsg.length > 0)
                    });
                    //更新当前最大值 
                    g_calendarMaxId = maxId;
                }//end if(maxId > g_calendarMaxId)
            });
        }, settings.COLLECT_INTERVAL);//end setInterval
    });
}