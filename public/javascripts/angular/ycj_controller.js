/**
 * 定义前台主页模块：ycj_app
 */
var ycj_app = angular.module('ycj_app', []);

/**
 * 域名常量
 */
var DOMAIN = 'http://192.168.0.101:3000';

/**
 * socket.io单实例服务
 */
ycj_app.factory('socket', function ($rootScope) {
     var socket = io.connect(DOMAIN);
     return {
         on: function (eventName, callback) { 
             socket.on(eventName, function () { 
                 var args = arguments;
                 $rootScope.$apply(function () { 
                     callback.apply(socket, args);
                  });
              });
          },
          emit: function (eventName, data, callback) { 
              socket.emit(eventName, data, function () { 
                  var args = arguments;
                  $rootScope.$apply(function () { 
                      if(callback){
                          callback.apply(socket, args);
                      }
                   });
               });
          },
     };
 });
 
/**
 * 日期过滤器，去掉数据库里面的年月日字段，只保留时分秒。
*/
ycj_app.filter('dateTrans', function () { 
    return function (dateTime) { 
        return dateTime.slice(dateTime.indexOf(' '));
     };
 });

/**
 * 日期过滤器，去掉数据库里面的年月日字段，只保留时分，秒也不要。
 */
ycj_app.filter('dateTransNoSec', function () { 
    return function (dateTime) { 
        var time =  dateTime.slice(dateTime.indexOf(' '));
        return time.slice(0, time.lastIndexOf(':'));
     };
 });
 
/**
 * 原始内容过滤器，将原始内容包含html标签的内容，按照标签解析。
 */
ycj_app.filter('to_trusted', ['$sce', function ($sce) {  
    return function (text) {  
        return $sce.trustAsHtml(text);  
    }  
}]);
 
/**
 * 新闻资讯控制器，处理快讯业务
 */
ycj_app.controller('newsCtrl', ['$scope', '$http','socket', function ($scope, $http, socket) { 
    //新推送来的的数据
    $scope.datas = [];
    //用户点击加载更多的时候，保存历史数据的数组
    $scope.moreDatas = [];
    //当前页面的总快讯条数
    
    var curPageNewsCount = angular.element('.news-id').length;
    //第一次加载页面的时候，最旧的快讯ID为静态页面最后一条快讯的ID
    var oldestNewsId = angular.element('.news-id').last().html();
    console.log('curPageNewsCount='+curPageNewsCount);
    
    //浏览器快讯页面最大展现新闻数量
    var MAX_MESSAGE_COUNT = 400;
    //第一次访问主页时，获取历史数据的新闻数量
    var MESSAGE_PAGE_COUNT = 50;
    
    //先获取一次历史数据    //这段代码不要了，首次访问不查询数据库，直接读取静态数据
    // $http.get(DOMAIN+'/getHistoryNews?start=0&limit='+MESSAGE_PAGE_COUNT+'&mini=0')
    //     .success(function (result) { 
    //         console.log('getData success');
    //         $scope.datas = result.datas;
    //     });
    
    //用户点击加载更多按钮后的查询数据库操作
    $scope.getMore = function () { 
        if(curPageNewsCount < MAX_MESSAGE_COUNT){
            $http.get(DOMAIN+'/getHistoryNews?start='+oldestNewsId+'&limit='+MESSAGE_PAGE_COUNT)
                .success(function (result) { 
                    console.log('getMoreData success');
                    $scope.moreDatas = $scope.moreDatas.concat(result.datas);
                    //更新最旧新闻ID
                    oldestNewsId = $scope.moreDatas[$scope.moreDatas.length-1].id;
                    //更新当前页面新闻总数
                    curPageNewsCount += result.datas.length;
                });
        }
    }
    //获得当前页面新闻数据
    $scope.getDataCounts = function () { 
        return curPageNewsCount;
    }
    
    //监听后台发来的快讯数据
    socket.on('NewMessage', function (message) {
        curPageNewsCount++;
        //如果超过最大限度，则先删除最后一个数据
        if(curPageNewsCount >= MAX_MESSAGE_COUNT) {
            if($scope.moreDatas.length > 0){
                //先删除moredata
                $scope.moreDatas.pop();
            }
            else if(angular.element('.static-data').length > 0){
                //然后删除首次加载的静态数据
                angular.element('.static-data').last().remove();
            }
            else{
                //最后删除新推送来的数据
                $scope.datas.pop();
            }
        }
        //在头部插入新收到的数据，这里没有处理数组，仅处理单个消息对象
        if($scope.datas.length == 0){
            $scope.datas.unshift(message);
        }else if(message.id > $scope.datas[0].id){
            $scope.datas.unshift(message); 
        }
     });
    
    //获取资讯logo图标路径 
    $scope.getNewsLogo = function (newsType, newsImportant) {  
        var retValue = '';
        //如果是新闻资讯
        if (newsType == 0) {
            //如果重要程度为一般
            if (newsImportant == 0)  retValue = 'nomarlnews';
            else retValue = 'importantnews';
        }
        //如果是财经数据
        else{
             //如果重要程度为一般
            if (newsImportant == 0)  retValue = 'nomarldata';
            else retValue = 'importantdata';
        }
        return retValue;    
    }
    
    //获取资讯logo图标提示信息title 
    $scope.getNewsLogoTips = function (newsType, newsImportant) {  
        var retValue = '';
        //如果是新闻资讯
        if (newsType == 0) {
            //如果重要程度为一般
            if (newsImportant == 0)  retValue = '一般新闻';
            else retValue = '重要新闻';
        }
        //如果是财经数据
        else{
             //如果重要程度为一般
            if (newsImportant == 0)  retValue = '一般数据';
            else retValue = '重要数据';
        } 
        return retValue;    
    }
}]); 

/**
 * 行情控制器，处理行情业务
 */ 
ycj_app.controller('hqCtrl', ['$scope', '$http', 'socket', function ($scope, $http, socket) {
     //获取当前所有行情数据
    $http.get(DOMAIN+'/getCurrentHq').success(function (result) { 
        console.log('getCurrentHq success');
        $scope.data = {};
        $scope.data.zqDatas = filterHqData(result.datas, 'ZQ');
        $scope.data.gjsDatas = filterHqData(result.datas, 'GJS');
        $scope.data.spDatas = filterHqData(result.datas, 'SP');
        $scope.data.whDatas = filterHqData(result.datas, 'WH'); 
    });
    
    //监听后台发来的快讯数据
    socket.on('NewHqData', function (hqDatas) {
        $scope.data.zqDatas = updateHqData($scope.data.zqDatas, hqDatas);
        $scope.data.gjsDatas = updateHqData($scope.data.gjsDatas, hqDatas);
        $scope.data.spDatas = updateHqData($scope.data.spDatas, hqDatas);
        $scope.data.whDatas = updateHqData($scope.data.whDatas, hqDatas);
    });
    
    //更新最新行情数据
    updateHqData = function (source, hqDatas) {
        for(var i=0; i<hqDatas.length; i++){
            for(var j=0; j<source.length; j++){
                if(hqDatas[i].name == source[j].name){
                    source[j] = hqDatas[i];
                    break;
                }
            }
        }
        return source;
    }
    
    //将行情数据分类到各个tab页面
    filterHqData = function (rawDatas, condition) {
        var retValue = [];  
        for(var i=0; i<rawDatas.length; i++){
            if(rawDatas[i].add_class_name == condition)
                retValue.push(rawDatas[i]);
        }
        return retValue;
    } 
    
    //将字符串转换成可以比较大小的数字，当前情况去掉后面的%即可。
    $scope.cton = function (obj) {
        var index = obj.indexOf('%');
        if(index>0)
            return obj.substring(0, index);
        if(index == 0)
            return 0;
        return obj;    
    }
}]);

/**
 * 行情闪烁功能
 */
ycj_app.directive('flash', function () { 
    return {
        $scope : {},
        link : function ($scope, $element, $attrs, $ctrl) { 
            //监听所有行情数据是否发生变化
            $scope.$watch('$scope.data', function (newValue, oldValue) { 
                //监控隐藏元素change，判断涨跌，然后显示相应背景色
                var change = $element[0].firstElementChild.innerHTML;
                if(change > 0){
                    $element.addClass('bred');//上涨了，背景色为红色
                }
                else{
                    $element.addClass('bgreen');//下跌了，背景色为绿色
                }
                //设置定时器，500毫秒后去掉背景色和字体色
                setTimeout(function() {
                    if(change > 0){
                        $element.removeClass('bred');
                    }
                    else{
                        $element.removeClass('bgreen');
                    }
                }, 500);
            }, true);
        }
    };
 });
 
 /**
 * layDate日期插件
 */
ycj_app.directive('layDate', function() {
    return {
        require: '?ngModel',
        restrict : 'A',
        scope:{
            ngModel: '='
        },
        link : function($scope, element, attr, ngModel) {
            if(!ngModel) return;
            //先将该元素的value设置成当前日期
            element.val((new Date).format());
            // 监听鼠标点击事件
            element.on('mousedown', function() {
                //scope.$apply(read);这句话应该不用加
                //更换皮肤
                laydate.skin('yalan');
                laydate({
                        elem : '#' + attr.id,
                        istoday: false,
                        format: attr.format!=undefined&&attr.format!=''?attr.format:'YYYY-MM-DD',
                        istime: attr.istime,
                        choose: function (data) { $scope.$apply(read); }
                });
            });
            //先初始化一次
            read(); 
            // 写入日期数据
            function read() {
                var val = element.val();
                ngModel.$setViewValue(val);
            }
        }
    }
});

/**
 * 财经日历控制器
 */ 
ycj_app.controller('calendarCtrl', ['$scope', '$http', 'socket', function ($scope, $http, socket) { 
   //周对象列表
   $scope.weeks = [];
   //国家对象列表
   $scope.nations = [{name: '全部', checked: true}, 
                     {name: '美国', checked: false}, 
                     {name: '中国', checked: false}, 
                     {name: '欧元区', checked: false}, 
                     {name: '日本', checked: false}, 
                     {name: '英国', checked: false}, 
                     {name: '加拿大', checked: false}, 
                     {name: '澳大利亚', checked: false}, 
                     {name: '瑞士', checked: false}]; 
   //重要性对象列表
   $scope.importants = [{name: '全部', checked: true}, 
                        {name: '重要', checked: false}, 
                        {name: '未公布', checked: false}]; 
   //财经日历数据
   $scope.calendar_datas = [];
   //财经大事
   $scope.calendar_events = [];
   //假期预告
   $scope.calendar_holidays = [];
   //国债
   $scope.calendar_debts = [];
   //周期枚举值
   var weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
   //将日期转换格式：2016-03-10 => 03/10
   $scope.transDate = function (date) { 
       var ret =  date.slice(date.indexOf('-')+1); 
       ret = ret.replace('-', '/');  
       return ret; 
   }
   //将日期转换格式：2016-03-18 => 2016年3月18日
   $scope.transCHNDate = function (date) { 
       var tmpDate = new Date(date);
       var ret = tmpDate.getFullYear() + '年' + (tmpDate.getMonth()+1) + '月' + tmpDate.getDate() + '日';  
       return ret; 
   }
   //监控用户选择的日期是否发生变化，如果有变化，则按照新条件去后台查询
   $scope.$watch('selDate', function (newValue, oldValue) { 
       $scope.weeks = updateWeeks(newValue);
       selectCalendarData();
   });
   //监控用户选择的地区是否发生变化，如果有变化，则按照新条件去后台查询
   $scope.$watch('nations', function (newValue, oldValue) { 
       selectCalendarData();
   }, true);
   //监控用户选择的重要性是否发生变化，如果有变化，则按照新条件去后台查询
   $scope.$watch('importants', function (newValue, oldValue) { 
       selectCalendarData();
   }, true);
   //监听后台发来的财经日历数据
   socket.on('NewCalendarData', function (newMessages) {
       for(var i=0; i<newMessages.length; i++){
           for(var j=0; j<$scope.calendar_datas[j]; j++)
           {
                if(newMessages[i].name == $scope.calendar_datas[j].name)
                {
                    $scope.calendar_datas[j] = newMessages[i];
                    break;
                }
           }
       }
   });
   //点击国家处理方法
   $scope.clickNation = function(nation){
       //如果点击是第一选项，即：全部地区
       if(nation.name == $scope.nations[0].name){
           //对于点击全部地区，状态不变，后面所有国家状态变成false
           $scope.nations[0].checked = true;
           for(var i=1; i<$scope.nations.length; i++){
               $scope.nations[i].checked = false;
           }
           return;
       }
       //更新国家选择状态
       for(var j=1; j<$scope.nations.length; j++){
           if(nation.name == $scope.nations[j].name){
               //点击后，状态取反
               $scope.nations[j].checked = !($scope.nations[j].checked == true);
               //如果全部状态为true，需要变成false
               if($scope.nations[0].checked == true){
                    $scope.nations[0].checked = false;
                }
               break;
           }
       }
       //查看是否所有国家状态都是false，如果是，那么全部的状态需要变成true
       var allUnChecked = true;
       for(var k=1; k<$scope.nations.length; k++){
           if($scope.nations[k].checked == true){
               allUnChecked = false;
               break;
           }
       }
       if(allUnChecked){
           $scope.nations[0].checked = true;
       }
   }
   //点击重要性处理方法
   $scope.clickImportant = function(important){
       //如果点击是第一选项，即：全部重要性
       if(important.name == $scope.importants[0].name){
           //对于点击全部重要性，状态不变，后面所有重要性状态变成false
           $scope.importants[0].checked = true;
           for(var i=1; i<$scope.importants.length; i++){
               $scope.importants[i].checked = false;
           }
           return;
       }
       //更新重要性选择状态
       for(var j=1; j<$scope.importants.length; j++){
           if(important.name == $scope.importants[j].name){
               //点击后，状态取反
               $scope.importants[j].checked = !($scope.importants[j].checked == true);
               //如果全部状态为true，需要变成false
               if($scope.importants[0].checked == true){
                    $scope.importants[0].checked = false;
                }
               break;
           }
       }
       //查看是否所有重要性状态都是false，如果是，那么全部的状态需要变成true
       var allUnChecked = true;
       for(var k=1; k<$scope.importants.length; k++){
           if($scope.importants[k].checked == true){
               allUnChecked = false;
               break;
           }
       }
       if(allUnChecked){
           $scope.importants[0].checked = true;
       }
   }
   //内部方法，更新周期列表
   function updateWeeks(newDate){
       var retWeeks = [];
       var curSelDay = new Date(newDate);//当前选择的日期
       var week = (curSelDay).getDay();//当前日期是星期几
       //修改当前日期为所在周的周日日期，即本周第一天。
       curSelDay.setDate(curSelDay.getDate()-week);
       for(var i=0; i<7; i++){
           var temp = {};
           temp.week = weekday[i];
           temp.day = $scope.transDate(curSelDay.format());
           temp.day_orignal = curSelDay.format();
           temp.curDay = false;
           if(i == week){
               temp.curDay = true;
           }
           retWeeks.push(temp);
           curSelDay.setDate(curSelDay.getDate()+1);
       }
       return retWeeks;
   }
   //内部方法，更新周期列表
   function updateNations(newValue, nations){
       var retNations = nations;
       return;
   }
   //处理用户点击星期时的方法
   $scope.selectedDay = function (week) { 
       for(var i=0; i<7; i++){
           $scope.weeks[i].curDay = false;
           if(weekday[i] == week){
               //更新样式
               $scope.weeks[i].curDay = true;
               //更新laydate插件值
               $scope.selDate = $scope.weeks[i].day_orignal;
           }
       }
   }
   //点击前一周方法
   $scope.preWeek = function (){
       var oldDate = new Date($scope.selDate);
       //更新到前一周的周日
       oldDate.setDate(oldDate.getDate() - 7 - oldDate.getDay());
       $scope.selDate = oldDate.format();
   }
   //点击下一周方法
   $scope.nextWeek = function (){
       var oldDate = new Date($scope.selDate);
       //更新到下一周的周日
       oldDate.setDate(oldDate.getDate() + 7 - oldDate.getDay());
       $scope.selDate = oldDate.format();
   }
   //向后台查询数据 
   function selectCalendarData(){
       var selCondition = {selDate: $scope.selDate, nations: $scope.nations, importants:$scope.importants};
       $http.post(DOMAIN+'/getCalendarData', selCondition)
            .success(function (result) { 
                $scope.calendar_datas = result.calendar_datas;
            })
            .error(function (err) { 
                console.log(err);
            });//end http.post
        $http.post(DOMAIN+'/getCalendarEvent', selCondition)
            .success(function (result) { 
                $scope.calendar_events = result.calendar_events;
            })
            .error(function (err) { 
                console.log(err);
            });//end http.post
        $http.post(DOMAIN+'/getCalendarHoliday', selCondition)
            .success(function (result) { 
                $scope.calendar_holidays = result.calendar_holidays;
            })
            .error(function (err) { 
                console.log(err);
            });//end http.post
        $http.post(DOMAIN+'/getCalendarDebt', selCondition)
            .success(function (result) { 
                $scope.calendar_debts = result.calendar_debts;
            })
            .error(function (err) { 
                console.log(err);
            });//end http.post
   }//end selectCalendarData()
}]);

/**
 * mini快讯控制器，处理mini快讯业务
 */
ycj_app.controller('miniNewsCtrl', ['$scope', '$http', 'socket', function ($scope, $http, socket) { 
    $scope.message = '';
    
    //主页表格里的数据
    $scope.datas = [];
    //浏览器快讯页面最大展现新闻数量
    var MAX_MESSAGE_COUNT = 10;
    
    //先获取一次历史数据
    $http.get(DOMAIN+'/getMinNews').success(function (result) { 
        console.log('getMiniData success');
        $scope.datas = result.datas;
     });
    
    //监听后台发来的快讯数据
    socket.on('NewMiniMessage', function (message) {
        //如果超过最大限度，则先删除最后一个数据
        if($scope.datas.length >= MAX_MESSAGE_COUNT) {
            $scope.datas.pop();
        }
        //在头部插入新收到的数据，这里没有处理数组，仅处理单个消息对象
        if(message.id > $scope.datas[0].id){
            $scope.datas.unshift(message); 
        }
     });
}]); 

/**
 * 给系统Date对象添加格式化方法，外部也可以使用
 * 缺省返回样例：2016-03-17
 */
Date.prototype.format = function(partten)
{
    if(partten ==null||partten=='')
    {
        partten = 'y-m-d';
    }
    var y = this.getYear() + 1900;
    var m = this.getMonth() + 1;
    var d = this.getDate();
    var r = partten.replace(/y+/gi, y);
    r = r.replace(/m+/gi, (m<10?"0":"")+m);
    r = r.replace(/d+/gi, (d<10?"0":"")+d);
    return r; 
}
