// config.js
/**
 * 小程序后端接口配置文件
 * @t:测试环境服务，根据后台设计自行取舍
 * @c:正式环境服务，根据后台设计自行取舍
 */
var state = "t";

var fun = "project";
if (state == "t") {
  fun = "project_t";
}

var host = "https://www.daxiong.com";  //开发者服务器域名,必须https

var config = {
  // 下面接口配合 Server 工作
  host,

  //获取openid、session_key
  get3rdSession: `${host}/${fun}/m_user/get3rdSession`,  //  https://www.daxiong.com/project/m_user/get3rdSession
  
  /***************************** 支付相关 *****************************/
  //创建支付订单
  create_course_order: `${host}/${fun}/order/create_course_order`,
 
  
  //获取微信、支付宝支付签名
  order_sgin: `${host}/${fun}/order/order_sgin`,

};
//对外把对象config返回
module.exports = config
























