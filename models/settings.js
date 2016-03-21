/**
 * Created by 2016/3/11
 * 保存网站配置文件
 */

module.exports = {
    //数据库配置
    //数据库名称
    DBHOST : '120.27.45.108',
    DBNAME : '58ycj',
    DBUSER : 'root',
    DBPASSWD: '3821407linxue',
    DBPORT : '3306',
    MAX_SELECT_COUNT: 100,
    
    //站点基础信息配置
    //站点名称
    SITETITLE : '58云财经',
    //站点域名
    SITEDOMAIN : 'http://www.58ycj.com',
    //站点备案号
    SITEICP : '沪ICP备13089151号',
    //静态资源版本戳
    SITEVERSION : 'V1.0.0',
    //管理员个人邮箱
    SYSTEMMAIL : '',
    //关键词
    SITEKEYWORDS : '财经, 快讯, 58云财经',
    //站点描述
    SITEDISCRIPTION : '全球财经资讯,图形化数据解读,闪电资讯 决策先人一步, 58云财经为您第一时间发布数据,计算机自动为您解读,数据影响一目了然.非农,失业率看58云财经最快!',

    //错误信息
    system_illegal_param : '非法参数',
    
    //轮训新数据周期
    COLLECT_INTERVAL : 5000,
    
    //简要行情列表
    JYHQ_LIST : [
        //证券，股指
        [{name: 'ZQ'}, {name: '上证指数'}, {name: '深证成指'}, {name: '创业板指数'}, {name: '恒生指数'}, {name: '纳斯达克'}, {name: '伦敦FTSE指数'}],
        //贵金属
        [{name: 'GJS'}, {name: '100克金条'}, {name: '铂金9995'}, {name: '现货白银9995'}, {name: '黄金T+D'}, {name: '白银T+D'}, {name: '台湾黄金'}],
        //商品，期货
        [{name: 'SP'}, {name: 'CBOT黄豆'}, {name: 'CBOT玉米'}, {name: '布伦特原油'}, {name: 'CBOT小麦'}, {name: '美国原油期货'}, {name: 'LME铜'}],
        //外汇
        [{name: 'WH'}, {name: '美元指数'}, {name: '欧元美元'}, {name: '英镑美元'}, {name: '美元人民币'}, {name: '美元日元'}, {name: '欧元人民币'}]
    ],
    
    //指标重要性的阈值，重要的指标含当前值。
    IMPORT_THREADHOLD : 3,
    
    //mini快讯显示最大条数
    MAX_MINI_NEWS_COUNT : 10
};
