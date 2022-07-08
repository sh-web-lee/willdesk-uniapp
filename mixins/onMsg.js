import inbox from '@/api/inbox'
import { idCallTag, getCallTag, getEmojiByAlt, throttle, displayOrder } from '@/utils/publicMethods'
// 混入,接收websocket,用于NavThree和setting组件
const onMsg = {
  data () {
    return {
      customer: [],
      // 异步队列
      asyncSessionId: []
    }
  },
  watch: {
    // 解决在created没拿到数据,防止在beforeDestroy把空的数据存入vuex
    '$store.state.cusListLoading' (newVal) {
      if (!newVal) {
        this.customer = this.$store.state.cusList
        // // 通过loading判断是否在3级导航
        // if (this.loading != undefined) {
        //   if (this.customer.filter((i) => i.status == 'open').length != 0) {
        //     console.log('选择顾客')
        //     this.selectCustomer(this.customer, 0)
        //   }
        // }
      }
    },
    // 套餐页面和会话列表共用
    'customer.length': {
      handler (newValue, oldValue) {
        if (newValue != oldValue) {
          this.$store.commit('setAllLength', newValue)
        }
      }
    }
  },
  methods: {
    // 时间展示规则
    timeRule (t) {
      // 时间展示规则
      var nowTime = this.$moment(new Date())
      var time = this.$moment(parseInt(t))
      if (nowTime.year() == time.year()) {
        if (nowTime.date() == time.date()) {
          // 今天展示规则
          return time.format('HH:mm')
        } else {
          // 今年非今天的展示规则
          return time.format('MMM,D')
        }
      } else {
        // 往年展示规则
        return time.format('y,MMM,D')
      }
    },
    // 根据会话id获取会话信息
    getCusById (id) {
      return this.customer.find((item) => item.id == id)
    },

    // 坐席分配
    assignSession (isCurrentPage, cus, cid, isAutoAssign = false) {
      const service = cid != 0 ? this.$store.state.serviceInfoList.find(item => item.id == cid) : { id: 0, name: '', profile: '' }
      if (isCurrentPage) {
        inbox.assignSession({
          Id: cus.id,
          CustomerServiceId: service.id
        }).then((res) => {
          if (res.data.Code == 200) {
            const obj = {
              id: service.id,
              name: service.name,
              profile: service.profile
            }
            this.$set(cus, 'assignedService', obj)
          }
        })
        if (isAutoAssign) {
          window.$ws.send(
            JSON.stringify({
              format: 'operation',
              type: 'autoAssign',
              data: service.id + '',
              sid: cus.id + ''
              // timeStamp: timestamp + '',
              // target: this.userInfo.cusId,
              // cid: this.$store.state.serviceInfo.id + '',
              // cname: this.$store.state.serviceInfo.userName,
              // uname: this.userInfo.cusName,
            })
          )
        }
      } else {
        const obj = {
          id: service.id,
          name: service.name,
          profile: service.profile
        }
        this.$set(cus, 'assignedService', obj)
      }
    },

    // 坐席认领，回复和修改状态会触发
    addHr (cus, isCurrentPage, cid, call = false, arr = []) {
      // 是否当前页面
      if (isCurrentPage) {
        // 坐席认领接口
        const claimSession = (service) => {
          if (!cus.hrId.includes(service.id)) {
            inbox.claimSession({
              SessionId: cus.id,
              CustomerServiceId: service.id
            }).then((res) => {
              if (res.data.Code == 200) {
                cus.hrId.push(service.id * 1)
                cus.hrName.push(service.name)
                cus.hrImg.push(service.profile)
              } else {
                this.$message.$error('request error!')
              }
            })
          }
        }
        if (call) {
          // console.log('本页面坐席@!')
          for (const i of arr) {
            claimSession(i)
          }
        } else {
          // console.log('本页面坐席回复!')
          claimSession(this.$store.state.serviceInfo)
        }
      } else {
        // 非本页面
        if (cus.read == false) {
          cus.read = true
        }
        if (call) {
          // console.log('非本页面坐席@')
          for (const i of arr) {
            if (!cus.hrId.includes(i.id * 1)) {
              const service = this.$store.state.serviceInfoList.find(item => item.id == i.id)
              cus.hrId.push(i.id * 1)
              cus.hrName.push(i.name)
              cus.hrImg.push(service.profile)
            }
          }
        } else {
          // console.log('非本页面坐席回复!')
          if (!cus.hrId.includes(cid * 1)) {
            const service = this.$store.state.serviceInfoList.find(item => item.id == cid)
            cus.hrId.push(service.id * 1)
            cus.hrName.push(service.name)
            cus.hrImg.push(service.profile)
          }
        }
      }
    },

    // 坐席修改紧急程度
    updateSessionUrgency (isCurrentPage, cus, isUrgent) {
      if (isCurrentPage) {
        inbox.updateSessionUrgency({
          Id: cus.id,
          IsUrgent: isUrgent == 'true' ? '1' : '0'
        }).then(() => {
          cus.isUrgent = isUrgent == 'true'
        })
      } else {
        // 非本页面的坐席修改紧急程度
        // console.log('非本页面坐席修改紧急程度')
        cus.isUrgent = isUrgent == 'true'
      }
    },
    // 坐席修改会话状态
    updateSessionStatus (isCurrentPage, cus, status) {
      // 本页面的坐席修改状态,加上id判断防止并发
      if (isCurrentPage) {
        inbox.updateSession({
          Id: cus.id,
          Status: status
        }).then(() => {
          // 更新信息
          cus.status = status
          if (status == 'open') {
            cus.isClosed = false
          }
          // pending或closed后,选中当前status的下一个会话
          if (status == 'pending' || status == 'closed' || status == 'closing') {
            if (this.navThreeTitle == 'All') {
              this.selectCustomer(this.customer, 0)
            } else if (this.navThreeTitle == 'Mentions') {
              this.selectCustomer(this.mentions_cus, 0)
            } else if (this.navThreeTitle == 'Assigned to me') {
              this.selectCustomer(this.assign_cus, 0)
            } else if (this.navThreeTitle == 'Unassigned') {
              this.selectCustomer(this.unassign_cus, 0)
            }
          }
        }).catch()
      } else {
        // 非本页面的坐席修改状态
        cus.status = status
      }
    },
    // 数组排序方法
    compare (key) {
      return function (a, b) {
        const value1 = a[key]
        const value2 = b[key]
        return value2 - value1
      }
    }
  },

  created () {
    // console.log('--created session--', this.asyncSessionId)
    // this.$nextTick(() => {
    //   // 列表更新完才拿,防止拿了空的数据
    //   if (!this.$store.state.cusListLoading) {
    //     this.customer = this.$store.state.cusList
    //     // 3级导航页面
    //     if (this.loading != undefined) {
    //       // 记录上一次的状态
    //       this.switchMenu(this.$store.state.navThreeTitle, this.$store.state.navThreeTopNav, false)
    //       if (this.active_cus_is_null) {
    //         let list = this.customer
    //         if (this.$store.state.navThreeTitle == 'Mentions') {
    //           list = this.mentions_cus
    //         } else if (this.$store.state.navThreeTitle == 'Assigned to me') {
    //           list = this.assign_cus
    //         } else if (this.$store.state.navThreeTitle == 'Unassigned') {
    //           list = this.unassign_cus
    //         }
    //         if (list.filter((i) => i.status == this.topNavChecked).length != 0) {
    //           console.log('选择顾客1')
    //           this.selectCustomer(list, 0)
    //         }
    //       } else {
    //         this.emitSelectCus(this.checkedCus)
    //       }
    //     }
    //   }
    // })
  },
  mounted () {
    // web重连
    this.$bus.$on('reloadGetCusList', () => {
      // 重新初始化列表
      this.customer = []
      this.$nextTick(() => {
        this.$store.state.cusList.forEach((item) => {
          this.customer.push(item)
        })
      })
      // 通过loading判断是否在3级导航重连
      if (this.loading != undefined) {
        // 在navThree重连,选中上一次会话
        this.$nextTick(() => {
          // this.loading = false
          this.reConnect = false
          if (this.$store.state.lastCheckedId != 0) {
            this.emitSelectCus(this.customer.find((item) => {
              return item.id == this.$store.state.lastCheckedId
            }))
          } else {
            this.selectCustomer(this.customer, 0)
          }
        })
      } else {
        // 在设置页面重连,记录之前的选中转态
        // this.$nextTick(() => {
        //   if (this.$store.state.lastCheckedId != 0) {
        //     this.customer.find((item) => {
        //       return item.id == this.$store.state.lastCheckedId
        //     }).checked = true
        //   }
        // })
      }
    })

    const throttleDing = throttle(500)
    // websocket 接收用户信息
    // this.$bus.$on('onMessage', (data) => {
    //   // 消息未读数
    //   let numberUnread = this.$store.state.numberUnread
    //   console.log('newData', data)
    //   // 消息声音提醒
    //   throttleDing(() => {
    //     this.$bus.$emit('remindMsg')
    //   })
    //   // 在会话列表中展示订单相关信息
    //   let msg = data.contentType == 'order' ? displayOrder(data.content) : getEmojiByAlt(getCallTag(data.content, true), true)
    //   if (data.contentType == 'rate') {
    //     msg = '[Reply to the review]'
    //   }
    //
    //   // open和pending的老用户
    //   let cus = this.customer.find((i) => i.status != 'closed' && i.cusId == data.uid)
    //   console.log('-readSessionCus-----', cus)
    //   if (cus != undefined) {
    //     cus.time = data.time
    //     cus.processedTime = this.timeRule(data.time)
    //     cus.message = msg
    //     // 状态修改
    //     if (cus.status == 'pending') {
    //       cus.status = 'open'
    //       inbox.updateSession({
    //         Id: cus.id,
    //         Status: 'open'
    //       })
    //     }
    //     // 已读修改,未读加1
    //     if (cus.read == true) {
    //       cus.read = false
    //       inbox.readSession({
    //         Id: cus.id,
    //         Read: 0
    //       })
    //       numberUnread += 1
    //       this.$store.commit('setNumberUnread', numberUnread)
    //     }
    //     return
    //   }
    //
    //   // // closed老用户
    //   // cus = this.customer.find((i) => i.status == 'closed' && i.cusId == data.uid && i.isClosed == false)
    //   // console.log('--oldCus--', cus)
    //   // if (cus != undefined) {
    //   //   // 用户reopen //对公司客服超时时间是172800000ms/48小时，对外3600000ms/1小时
    //
    //   //   const time = this.$store.state.shop.indexOf('willdesk-customer-support') != -1 ? 172800000 : 3600000
    //   //   // 相隔时间小于1小时
    //   //   if (data.time - cus.time < time) {
    //   //     console.log('---oldUser---')
    //   //     // if (data.time - cus.time < 2) {
    //   //     cus.time = data.time
    //   //     cus.processedTime = this.timeRule(data.time)
    //   //     cus.message = msg
    //   //     // 状态修改
    //   //     cus.status = 'open'
    //   //     inbox.updateSession({
    //   //       Id: cus.id,
    //   //       Status: 'open'
    //   //     })
    //   //     // 已读修改
    //   //     cus.read = false
    //   //     inbox.readSession({
    //   //       Id: cus.id,
    //   //       Read: 0
    //   //     })
    //   //     numberUnread += 1
    //   //     this.$store.commit('setNumberUnread', numberUnread)
    //   //     // 如果当前选中和websocket推过来的一样,需要再触发一次选择顾客事件
    //   //     if (this.checkedCus.cusId == cus.cusId) {
    //   //       this.emitSelectCus(this.checkedCus)
    //   //     }
    //   //   } else {
    //   //     console.log('新开窗口')
    //   //     // 48小时外 ,先打断点
    //   //     cus.isClosed = true
    //   //     inbox.closed_session({
    //   //       Id: cus.id * 1,
    //   //       CustomerId: cus.cusId * 1,
    //   //       UserName: cus.cusName,
    //   //       TimeStamp: cus.time * 1,
    //   //       IsClosed: false
    //   //     }).then((res) => {
    //   //       numberUnread += 1
    //   //       this.$store.commit('setNumberUnread', numberUnread)
    //   //       this.customer.push({
    //   //         id: cus.id,
    //   //         cusName: cus.cusName,
    //   //         cusId: cus.cusId,
    //   //         time: data.time,
    //   //         processedTime: this.timeRule(data.time),
    //   //         message: msg,
    //   //         hrId: [],
    //   //         hrImg: [],
    //   //         hrColor: [],
    //   //         hrName: [],
    //   //         checked: false,
    //   //         read: false,
    //   //         svg: 'c-3-chat',
    //   //         status: 'open',
    //   //         isClosed: false,
    //   //         isUrgent: false,
    //   //         assignedService: {}
    //   //       })
    //   //       cus.id = data.time
    //   //     }).catch((err) => {
    //   //       console.log(err)
    //   //     })
    //   //   }
    //   //   return
    //   // }
    //
    //   // closed老用户
    //   // cus = this.customer.find((i) => i.status == 'closed' && i.cusId == data.uid && i.isClosed == false)
    //   // console.log('--oldCus--', cus)
    //   // // 四十八小时之内 reopen
    //   // if (cus != undefined) {
    //   //   console.log('---oldUser---')
    //   //   // if (data.time - cus.time < 2) {
    //   //   cus.time = data.time
    //   //   cus.processedTime = this.timeRule(data.time)
    //   //   cus.message = msg
    //   //   // 状态修改
    //   //   cus.status = 'open'
    //   //   inbox.updateSession({
    //   //     Id: cus.id,
    //   //     Status: 'open'
    //   //   })
    //   //   // 已读修改
    //   //   cus.read = false
    //   //   inbox.readSession({
    //   //     Id: cus.id,
    //   //     Read: 0
    //   //   })
    //   //   numberUnread += 1
    //   //   this.$store.commit('setNumberUnread', numberUnread)
    //   //   // 如果当前选中和websocket推过来的一样,需要再触发一次选择顾客事件
    //   //   if (this.checkedCus.cusId == cus.cusId) {
    //   //     this.emitSelectCus(this.checkedCus)
    //   //   }
    //
    //   //   return
    //   // }
    //   // // 四十八小时之外 新建窗口
    //   // cus = this.customer.find((i) => i.status == 'closed' && i.cusId == data.uid && i.isClosed == true)
    //   // if (cus != undefined) {
    //   //   console.log('新开窗口')
    //   //   // 48小时外 ,先打断点
    //   //   cus.isClosed = true
    //   //   inbox.closed_session({
    //   //     Id: cus.id * 1,
    //   //     CustomerId: cus.cusId * 1,
    //   //     UserName: cus.cusName,
    //   //     TimeStamp: cus.time * 1,
    //   //     IsClosed: false
    //   //   }).then((res) => {
    //   //     numberUnread += 1
    //   //     this.$store.commit('setNumberUnread', numberUnread)
    //   //     this.customer.push({
    //   //       id: cus.id,
    //   //       cusName: cus.cusName,
    //   //       cusId: cus.cusId,
    //   //       time: data.time,
    //   //       processedTime: this.timeRule(data.time),
    //   //       message: msg,
    //   //       hrId: [],
    //   //       hrImg: [],
    //   //       hrColor: [],
    //   //       hrName: [],
    //   //       checked: false,
    //   //       read: false,
    //   //       svg: 'c-3-chat',
    //   //       status: 'open',
    //   //       isClosed: false,
    //   //       isUrgent: false,
    //   //       assignedService: {}
    //   //     })
    //   //     cus.id = data.time
    //   //   }).catch((err) => {
    //   //     console.log(err)
    //   //   })
    //   //   return
    //   // }
    //
    //   // 新用户,新增列表,获取列表id 新用户和close状态的用户都走这个接口
    //   inbox.matchSession({
    //     CustomerId: data.uid,
    //     UserName: data.cusName
    //   }).then((res) => {
    //     // console.log('---storageList--', this.customer)
    //     // id
    //     // 存在 ,把状态改open
    //     // 异步数组判断消息是否来自同一用户
    //     // // const sessionLsit = this.$store.state.sessionList
    //     // console.log('---sessionID--', res.data.SessionId)
    //     // close状态处理
    //     // 需要先将数组按照最新时间从上往下排序
    //     // console.log('---sortedArray---', this.customer.sort(this.compare('time')))
    //     cus = this.customer.sort(this.compare('time')).find((i) => i.status == 'closed' && i.cusId == data.uid)
    //
    //     if (cus != undefined) {
    //       // 一小时内重新打开close的会话
    //       if (res.data.Action == 'open') {
    //         cus.time = data.time
    //         cus.processedTime = this.timeRule(data.time)
    //         cus.message = msg
    //
    //         // const sessionID = res.data.SessionId
    //         // inbox.updateSession({
    //         //   Id: sessionID,
    //         //   Status: 'open'
    //         // })
    //         // 状态修改
    //         cus.status = 'open'
    //         // 已读修改
    //         cus.read = false
    //         // inbox.readSession({
    //         //   Id: sessionID,
    //         //   Read: 0
    //         // })
    //         numberUnread += 1
    //         console.log('----end----')
    //
    //         this.$store.commit('setNumberUnread', numberUnread)
    //         // 如果当前选中和websocket推过来的一样,需要再触发一次选择顾客事件
    //         if (this.checkedCus.cusId == cus.cusId) {
    //           this.emitSelectCus(this.checkedCus)
    //         }
    //         console.log('----end----')
    //
    //         return
    //         // 一小时以外的新建会话,并且保留原有的close
    //       } else if (res.data.Action == 'new') {
    //         // numberUnread += 1
    //         // this.$store.commit('setNumberUnread', numberUnread)
    //         // 将原来的close状态的会话保存
    //         // 先将原来的close会话修改
    //         const oldSession = res.data.OldSession
    //         // this.customer.forEach((item, index) => {
    //         //   if (item.cusId == data.uid) {
    //         //     this.customer[index].id = oldSession.Id
    //         //     // this.customer[index].assignedService = {}
    //         //     this.customer[index].processedTime = this.timeRule(data.time)
    //         //     // this.customer[index].cusName = oldSession.Customer
    //         //     this.customer[index].time = data.time
    //         //     // this.customer[index].cusId = oldSession.ChatId
    //         //     this.customer[index].read = false
    //         //     this.customer[index].isClosed = true
    //         //     this.customer[index].status = 'close'
    //         //     this.customer[index].checked = false
    //         //     this.customer[index].isUrgent = false
    //         //   }
    //         // })
    //         console.log('--cusInfo--', cus)
    //         numberUnread += 1
    //         this.$store.commit('setNumberUnread', numberUnread)
    //         this.customer.push({
    //           id: cus.id,
    //           cusName: cus.cusName,
    //           cusId: cus.cusId,
    //           time: data.time,
    //           processedTime: this.timeRule(data.time),
    //           message: msg,
    //           hrId: [],
    //           hrImg: [],
    //           hrColor: [],
    //           hrName: [],
    //           checked: false,
    //           read: false,
    //           svg: 'c-3-chat',
    //           status: 'open',
    //           isClosed: false,
    //           isUrgent: false,
    //           assignedService: {}
    //         })
    //         cus.id = oldSession.Id
    //         // 修改close的会话 并且转为open
    //         // this.customer.push({
    //         //   id: cus.id,
    //         //   cusName: cus.cusName,
    //         //   cusId: cus.Id,
    //         //   time: data.time,
    //         //   processedTime: this.timeRule(data.time),
    //         //   message: msg,
    //         //   hrId: [],
    //         //   hrImg: [],
    //         //   hrColor: [],
    //         //   hrName: [],
    //         //   checked: false,
    //         //   read: false,
    //         //   svg: 'c-3-chat',
    //         //   status: 'open',
    //         //   isClosed: false,
    //         //   isUrgent: false,
    //         //   assignedService: {}
    //         // })
    //         // cus.id = data.time
    //
    //         return
    //       }
    //     }
    //     // 真正的新用户进来发送消息
    //     if (this.asyncSessionId.indexOf(res.data.SessionId) > -1) {
    //       // 同一个新用户连发消息
    //       const cus = this.getCusById(res.data.SessionId)
    //       console.log('-cus--', cus)
    //       cus.time = data.time
    //       cus.processedTime = this.timeRule(data.time)
    //       cus.message = msg
    //     } else {
    //       // 不同的新用户
    //       numberUnread += 1 // 消息提醒加1
    //       this.$store.commit('setNumberUnread', numberUnread)
    //       // 把id加入异步数组
    //       console.log('---异步数组---', this.asyncSessionId)
    //       this.asyncSessionId.push(res.data.SessionId)
    //       this.customer.push({
    //         id: res.data.SessionId,
    //         cusName: data.cusName,
    //         cusId: data.uid,
    //         time: data.time,
    //         processedTime: this.timeRule(data.time),
    //         message: msg,
    //         hrId: [],
    //         hrImg: [],
    //         hrName: [],
    //         checked: false,
    //         read: false,
    //         svg: 'c-3-chat',
    //         status: 'open',
    //         isClosed: false,
    //         isUrgent: false,
    //         assignedService: {}
    //       })
    //     }
    //   })
    // })

    // websocket 接收多坐席信息
    // TODO
    this.$bus.$on('sendMsgSuccess1', (data) => {
      if (data.contentType == 'autoAssign' || data.contentType == 'typing') {
        return
      }
      console.log('接收多坐席消息')
      const cus = this.getCusById(data.id)
      // 消息提醒减1
      if (cus.read == false) {
        const numberUnread = this.$store.state.numberUnread - 1
        this.$store.commit('setNumberUnread', numberUnread)
        // 修改已读状态
        cus.read = true
        inbox.readSession({
          Id: cus.id,
          Read: 1
        })
      }
      // 时间更新
      cus.time = data.time
      cus.processedTime = this.timeRule(data.time)

      if (data.type == 'Reply from server') {
        // 自己参与的会话才声音提醒
        // if (this.$store.state.serviceInfo.id != data.cid && cus.hrId.includes(this.$store.state.serviceInfo.id * 1)) {
        //   // 消息声音提醒
        //   throttleDing(() => {
        //     this.$bus.$emit('remindMsg')
        //   })
        // }
        // const isCurrentPage = this.$store.state.latestReplyTime == data.time && this.$store.state.serviceInfo.id == data.cid
        // // 坐席reopen,发送已经判断会话是否有真正关闭,这里不用判断直接reopen
        // if (cus.status == 'closed') {
        //   if (isCurrentPage) {
        //     inbox.updateSession({
        //       Id: data.id,
        //       Status: 'open'
        //     }).then(() => {
        //       cus.status = 'open'
        //     })
        //   } else {
        //     cus.status = 'open'
        //   }
        // }
        // // 没有分配下，自动分配第一个回复的坐席
        // if (!cus.assignedService.name) {
        //   this.assignSession(isCurrentPage, cus, data.cid, true)
        // }
        // // 信息更新
        // if (data.contentType == 'rate') {
        //   cus.message = '[Send review push]'
        // } else {
        //   cus.message = getEmojiByAlt(getCallTag(data.content, true), true)
        // }
        // // tag:坐席回复的普通信息，不带@
        // if (data.contentType == 'text' || data.contentType == 'img' || data.contentType == 'attachment') {
        //   this.addHr(cus, isCurrentPage, data.cid)
        // } else if (data.contentType == 'call') {
        //   // tag:坐席回复的带@的信息
        //   this.addHr(cus, isCurrentPage, data.cid, true, idCallTag(data.content))
        // }
      } else if (data.type == 'operation') {
        const isCurrentPage = this.$store.state.operationTime == data.time && this.$store.state.serviceInfo.id == data.cid
        // tag:坐席修改会话状态
        if (data.contentType == 'text') {
          // 修改会话状态
          this.updateSessionStatus(isCurrentPage, cus, data.content)
          // 没有分配下，自动分配第一个回复的坐席
          if (!cus.assignedService.name) {
            this.assignSession(isCurrentPage, cus, data.cid, true)
          }
        } else if (data.contentType == 'urgent') {
          // tag:坐席修改紧急程度
          this.updateSessionUrgency(isCurrentPage, cus, data.content)
          // 没有分配下，自动分配第一个回复的坐席
          if (!cus.assignedService.name) {
            this.assignSession(isCurrentPage, cus, data.cid, true)
          }
        } else if (data.contentType == 'assign') {
          // tag:坐席分配会话
          this.assignSession(isCurrentPage, cus, data.content)
        }
      }
    })
  },
  beforeDestroy () {
    this.$bus.$off('onMessage')
    this.$bus.$off('sendMsgSuccess')
    this.$bus.$off('reloadGetCusList')
    // 当列表更新完成时才更新vuex,防止还没加载完切换页面,把空的数据存到vuex
    if (!this.$store.state.cusListLoading) {
      this.$store.commit('setCusList', this.customer)
    }
  }
}

export default onMsg
