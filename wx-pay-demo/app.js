//app.js
var get3rdSession = require('./config').get3rdSession;

App({
  data: {
    uid: '20170808abc',
    token: 'abc123',
    openid: '',
    wx_version: "", //微信版本号
    iPhone_vs: "",    //手机系统型号
    str_version: "",  // 版本号字符串
  },
  /**
  * 生命周期函数--监听小程序初始化
  */
  onLaunch: function () {
    //小程序初始化，提示兼容性
    this.getPhoneSysInfo();
  },

  /**
   * 登录
   */
  wxLogin: function () {
    var that = this;
    wx.login({
      success: function (res) {
        that.sendAppCodeFunction(res.code);
      },
      fail: function (res) {
        if (wx.hideLoading) {
          wx.hideLoading();
        }
        wx.showModal({
          title: '提示',
          content: '登陆失败',
          showCancel: false,
          confirmText: "知道了",
          confirmColor: "#ffbe00",
        })
      }
    })
  },

  /**
     * 调用后台接口，传递code参数
     */
  sendAppCodeFunction: function (code) {
    var that = this;
    wx.request({
      url: get3rdSession,
      method: "get",
      data: {
        js_code: code,
        key: that.data.key,
        t: Math.random(),
      },
      success: function (res) {
        if (res.data.code == 200) {
          var json = JSON.parse(res.data.msg);
          that.data.openid = json.openid;
          wx.setStorageSync("userjson", json);
        }
        else {
          app.showToast('未能正常获取', '');
        }
      },
      fail: function (res) {

      }
    })
  },

  /**
   * 弹框提示授权用户信息
   */
  getUserInfo: function (cb) {
    var that = this;
    if (wx.authorize) {
      wx.authorize({
        scope: 'scope.userInfo',
        success: function (res) {
          if (wx.showLoading) {
            wx.showLoading({
              title: '加载中',
              mask: true,
            })
          }
          that.getUserAuth();
        },
        fail: function (res) {
          if (wx.openSetting) {
            wx.openSetting({
              success: function () {
                wx.authorize({
                  scope: 'scope.userInfo',
                  success: function () {
                    if (wx.showLoading) {
                      wx.showLoading({
                        title: '加载中',
                        mask: true,
                      })
                    }
                    that.getUserAuth();
                  }
                })
              }
            })
          }
          else {
            app.getPhoneSysInfo();
          }
        }
      })
    }
    else {
      app.getPhoneSysInfo();
    }
  },

  /**
     * 得到授权获取用户信息
     */
  getUserAuth: function () {
    var that = this;
    wx.getUserInfo({
      lang: "zh_CN",
      success: function (res) {
        console.log(res)
        wx.setStorageSync("userInfo", res.userInfo);
        wx.setStorageSync("authoriseUserInfo", true);
        //设置用户昵称，头像
        that.setData({
          avatarUrl: res.userInfo.avatarUrl,
        })
      },
      fail: function (res) {
        if (wx.hideLoading) {
          wx.hideLoading();
        }
        //设置用户昵称，头像
        that.setData({
          avatarUrl: "../../img/airfit.png",
        })
      }
    })

  },

  /**
   * 获取设备信息
   */
  getSystemInfo: function () {
    var that = this;
    var contentWidth = "";
    var contentHeight = "";
    wx.getSystemInfo({
      success: function (res) {
        contentHeight = res.windowHeight;
        contentWidth = res.windowHeight;
      },
    })
    var appObj = { mob_width: contentWidth, mob_height: contentHeight };
    return appObj;
  },

  /**
    * 获取系统信息
    @wx_version:微信版本号
    @iPhone_vs:手机版本
    */
  getPhoneSysInfo: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        var v1 = res.version.split(".");
        var v2 = v1[0] + v1[1] + v1[2];
        var spsys = res.system.split(' ');
        if (spsys[0] === 'Android') {
          //安卓版本下于6.5.8，提示不支持
          if (v1[0] <= 6 && v1[1] <= 5 && v1[2] <= 8) {
            that.data.wx_version = v2;
            that.data.iPhone_vs = spsys[0];
            that.data.str_version = res.version;
            that.userAuthorizeJianRong();
          }
        }
        else {
          //ios版本小于 6.5.10，提示不支持
          if (v1[0] <= 6 && v1[1] <= 5 && v1[2] <= 10) {
            that.data.wx_version = v2;
            that.data.iPhone_vs = spsys[0];
            that.data.str_version = res.version;
            that.userAuthorizeJianRong();
          }
        }
      },
    })
  },

  /**
     * 用户授权兼容性 处理方法
     * @str_version:微信版本号
     */
  userAuthorizeJianRong: function () {
    wx.showModal({
      title: '提示',
      showCancel: false,
      confirmText: "知道了",
      confirmColor: "#555",
      content: '您当前的微信版本(' + this.data.str_version + ')过低，可能会出现不兼容问题，请升级到最新版本微信，谢谢。'
    })
  },


  /**
   * 全局模态框 提示方法
   * @titles:模态框标题
   * @tiptext:模态框提示内容
   */
  GBshowModalTip: function (titles, tiptext) {
    wx.showModal({
      title: titles,
      showCancel: false,
      content: tiptext,
      confirmText: '确定',
      confirmColor: "#555",
      success: function () {
        wx.setStorageSync('loginNavto', true);
        wx.navigateTo({
          url: '../../mine/mineinfo/mineinfo',
        })
      }
    })
  },

  /**
   * 全局提示 showToast
   * @title:提示内容
   * @icon:提示框icon
   */
  showToast: function (title, icon) {
    wx.showToast({
      title: title,
      icon: icon,
    })
  },


  /**
   * 全局加载提示 showToast
   * @title:提示内容
   */
  showLoading: function (title) {
    if (wx.showLoading) {
      wx.showLoading({
        title: title,
        mask: true,
      })
    }
  },

  /**
   * 隐藏加载提示
   */
  hideLoading: function () {
    if (wx.hideLoading) {
      wx.hideLoading();
    }
  },

  /**
   *  选择本地图片，添加头像 
   */
  chooseImage: function (res) {
    var that = this;
    if (wx.chooseImage) {
      wx.chooseImage({
        success: function (res) {
          var tempFiles = res.tempFiles;
          if (!tempFiles) {
            app.getPhoneSysInfo();
          }
          else {
            console.log(tempFiles)
            //单张图片 1M以内  （1M=1024KB  1Kb=1024B）
            var sizeRule = 1024 * 1024;
            var imgSize = tempFiles[0].size;
            if (imgSize > sizeRule) {
              wx.showModal({
                title: '提示',
                content: '请添加1M以内的图片',
                showCancel: false,
                confirmText: "知道了",
                confirmColor: "#ffbe00",
              })
            }
            else {
              that.setData({
                userimg: tempFiles[0].path
              })
            }
          }
        },
        fail: function () {

        }
      })
    }
    else {
      app.getPhoneSysInfo();
    }
  },


})
