var settings = require('../models/settings.js');
/**
 * 比较两个数组，返回当前值有变化的对象列表，
 */
exports.getChangedItem = function (sourceList, targetList) { 
    var changedItems = [];
    for(var i=0; i<sourceList.length; i++){
        for(var j=0; j<targetList.length; j++){
            //找到指定对象
            if(sourceList[i].name == targetList[j].name){
                //如果当前价格变动了，就增加到返回数组里面
                targetList[j].change = 0;//首先假设没有变化
                if(sourceList[i].dq_price != targetList[j].dq_price){
                    //如果上涨
                    if(sourceList[i].dq_price < targetList[j].dq_price)
                    {
                        targetList[j].change = 1;
                    }
                    //如果下跌
                    else{
                        targetList[j].change = -1;
                    }
                    changedItems.push(targetList[j]);
                }
                break;
            }
        }
    }  
    return changedItems;            
};

/**
 * 生成where条件，为简要行情服务，从给定的简要行情列表中生成查询条件
 */
exports.genJyhqCondition = function (condition) {
    var where = " where name in ("; 
    for(var i=0; i<condition.length; i++){
        //第一个是分类信息，从第二个下标开始计算
        for(var j=1; j<condition[i].length; j++){
            where += "'";
            where += condition[i][j].name;
            where += "',"
        }
    }
    //去掉最后一个逗号字符
    where = where.substring(0, where.length-1);
    where += ")";
    return where;
}

/**
 * 生成where条件，为财经日历服务,根据用户选择国家状态列表，返回想要的查询条件
 */
exports.genNationCondition = function (nations) {
    //如果是获取全部指标，则直接让该条件为空
    if(nations[0].checked) return '';
    var where = " and nation in ("; 
    for(var i=1; i<nations.length; i++){
        if(nations[i].checked)
        {
            where += "'";
            where += nations[i].name;
            where += "',";
        }
    }
    //去掉最后一个逗号字符
    where = where.substring(0, where.length-1);
    where += ") ";
    return where;
}

/**
 * 将快讯列表转换成min快讯列表
 */
exports.newsToMinNews = function (news) {
    //如果是获取全部指标，则直接让该条件为空
    var minNews = [];
    for(var i=0; i<news.length; i++){
        if(news[i].type == 0){
            minNews.push(news[i]);
        }
    }
    return minNews;
}

/**
 * 生成where条件，为财经日历服务,根据用户选择重要性状态列表，返回想要的查询条件
 */
exports.genImportantCondition = function (importants) {
    //如果是获取全部指标，则直接让该条件为空
    if(importants[0].checked) return '';
    var where = " and import_index";
    if(importants[1].checked)
    {
        where += " >= "; 
    }
    else
    {
        where += " < ";
    }
    where += settings.IMPORT_THREADHOLD + " ";
    return where;
}

/**
 * 给行情数据添加分类，供前台tab页分类使用
 */
exports.addClass = function (hqData) { 
    var hqSets = settings.JYHQ_LIST;
    for(var i=0; i<hqSets.length; i++){
        for(var j=1; j<hqSets[i].length; j++){
            for(var k=0; k<hqData.length; k++){
                if(hqData[k].name == hqSets[i][j].name){
                    hqData[k].add_class_name = hqSets[i][0].name;
                    break;
                }
            }
        }
    }
    return hqData;
}

