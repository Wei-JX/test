var app = getApp();
var create_course_order = require('../../config').create_course_order; //创建订单
var order_sgin = require('../../config').order_sgin; //获取微信支付签名

Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconColor_a: "#06af32",
    iconColor_b: "#dedede",
    cprice: "125.00",
    cname: "瑜伽",
    tname: "老顽童",
    cid: "", //课程ID
    paytype: '1',   //支付类型：1:微信支付，2:余额支付
    orderid: '', //订单ID
    ordertype: '0', //订单类型，课程0，教室1，会员卡2， 余额3，商品4
    openid: '',
    iPhoneHintView: false,
    iHintText: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   

  },

  /**
   * 支付方式选择
   */
  upPayMethod: function (res) {
    if (res.currentTarget.dataset.ptype == 'wx') {
      this.setData({
        iconColor_a: "#06af32",
        iconColor_b: "#dedede",
        paytype: '1'
      })
    }
    if (res.currentTarget.dataset.ptype == 'yue') {
      this.setData({
        iconColor_a: "#dedede",
        iconColor_b: "#06af32",
        paytype: '2',
      })
    }
  },

  /**
   * 事件绑定，发起支付创建商品订单
   * @cid:商品id
   * @paytype:支付类型，根据业务设计自行定义。例：1:微信支付，2:余额支付
   * @orderid:此订单号不是开发者服务器生成，是由开发者服务器请求微信服务器所返回的订单id
   * @uid:请求头，根据后台设计自行取舍
   * @token:请求头，根据后台设计自行取舍
   */
  launchPayMethod: function (res) {
    var that = this;
    console.log('**********请配置合法域名**********')
    console.log('支付金额：' + that.data.cprice + '¥')
    console.log('课程：' + that.data.cname + '教练：' + that.data.tname)
    console.log(res.currentTarget.dataset.paytype == 1 ? '支付方式：微信支付' : '支付方式：余额支付')
    return;
    wx.request({
      url: create_course_order,
      method: "post",
      header: {
        "content-type": "application/x-www-form-urlencoded",
        "yamon-com-uid": app.data.uid,
        "yamon-com-token": app.data.token,
      },
      data: {
        cid: that.data.cid,
        paytype: that.data.paytype,
      },
      success: function (res) {
        if (res.data.code == 200) {
          //更新支付订单orderid
          that.setData({
            orderid: res.data.extra,
          })
          that.getWeixinPayParameter();
        }
        else {
          that.showiPhoneHintInterac(true, '请稍后重试');
        }
      },
      fail: function (res) {
        that.showiPhoneHintInterac(true, '请稍后重试');
      },
    })
  },

  /**
   * 核对订单/订单签名，返回发起微信支付5个参数
   * 此过程仍是开发者服务器请求微信服务器并返回发起支付的5个参数，经过开发者服务器返回到前端
   * @openid:用户id
   * @orderid:订单id
   * @ordertype:订单类型，可根据后台业务调整
   * @paytype:支付类型，根据业务设计自行定义。例：1:微信支付，2:余额支付
   * @uid:请求头，根据后台设计自行取舍
   * @token:请求头，根据后台设计自行取舍
   */
  getWeixinPayParameter: function () {
    var that = this;
    wx.request({
      url: order_sgin,
      method: 'post',
      header: {
        "content-type": "application/x-www-form-urlencoded",
        "yamon-com-uid": app.data.uid,
        "yamon-com-token": app.data.token,
      },
      data: {
        openid: app.data.openid,
        orderid: that.data.orderid,
        ordertype: that.data.ordertype,
        paytype: that.data.paytype,
      },
      success: function (res) {
        if (res.data.code == 200) {
          that.launchWeixinPayMethod(res.data.extra);
        }
      },
      fail: function (res) {

      }
    })
  },

  /**
   * 发起微信支付
   * 此过程为前端直接请求微信服务器
   * @timeStamp:时间戳
   * @nonceStr:随机字符串
   * @package:统一下单接口返回的 prepay_id 参数值
   * @signType:签名算法，暂支持 MD5
   * @paySign:签名
   */
  launchWeixinPayMethod: function (res) {
    wx.requestPayment({
      timeStamp: res.timeStamp,
      nonceStr: res.nonceStr,
      package: res.package,
      signType: 'MD5',
      paySign: res.paySign,
      success: function (res) {
        //支付成功，返回页面
        wx.navigateBack({});
      },
      fail: function (res) {
        if (res.errMsg === 'requestPayment:fail cancel') {
          if (wx.canIUse('showToast.image')) {
            wx.showToast({
              title: '支付取消',
              image: "../img/payfail.png",
            })
          }
          else {
            wx.showToast({
              title: '支付取消',
              icon: 'success',
            })
          }
        }
        else {
          if (wx.canIUse('showToast.image')) {
            wx.showToast({
              title: '支付失败',
              image: "../img/payfail.png",
            })
          }
          else {
            wx.showToast({
              title: '支付失败',
              icon: 'success',
            })
          }
        }
      },
      complete: function (res) {
        if (res.errMsg === 'requestPayment:fail cancel') {
          if (wx.canIUse('showToast.image')) {
            wx.showToast({
              title: '支付取消',
              image: "../img/payfail.png",
            })
          }
          else {
            wx.showToast({
              title: '支付取消',
              icon: 'success',
            })
          }
        }
      },
    })
  },

  /**
   * 设置支付提示
   * @state:状态，iPhoneHintView是否渲染
   * @txt：提示内容
   */
  showiPhoneHintInterac: function (state, txt) {
    var that = this;
    that.setData({
      iPhoneHintView: state,
      iHintText: txt,
    })
    setTimeout(function () {
      that.setData({
        iPhoneHintView: false,
        iHintText: '',
      })
    }, 1000)
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
})