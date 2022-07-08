import $store from '@/store/index.js'
import { throttle } from '@/utils/publicMethods.js'
class S {
	constructor(url, options) {
		this.debug = true
		this.isOpenSocket = false // 是否存在打开的socket 避免重复连接
		this.url = url // socket连接地址
		this.socketTask = null
		this.heartbeatData = {
			action: 'heartbeat',
			seq: '',
			data: {}
		} // 心跳数据
		this.heartbeatInterval = null // 检测服务端连接是否还连接
		this.heartbeatTimes = 10000 // 多少时间执行心跳 默认10000ms
		this.heartbeatReceived = false // 检测心跳是否正常

		this.reconnnectTimeout = null // 进行重连实例
		this.reconnectTimes = 3000 // 多久之后再次重连 默认3000ms
		this.reconnectStatus = false // 是否正在重连
		this.reconnects = 0 // 重连的次数
		
		this.socketMsgQueue = [] // 要发的消息列表
		
		this.errorTimes = 0 // 错误次数
		this.closeByControl = false // 是否人为关闭
		this.initOption(options) // 配置传入参数
		try {
			this.log('---- 准备SOCKET连接 ----')
			return this.connectSocketInit()
		} catch (e) {
			this.log('--- SOCKET重连 ----')
			this.reconnect();
		}
	}
	log(str) {
		this.debug && console.log(str)
	}
	initOption (options) {
		for (var key in this) {
			if (typeof options[key] !== 'undefined') {
				this[key] = options[key]
			}
		}
	}
	getSocketError() {
		uni.onSocketError(res => {
			this.reconnect()
		})
	}
	// 创建socket连接
	connectSocketInit() {
		const _this = this
		this.closeByControl = false
		// 监听SOKCTE异常状态
		// this.getSocketError()
		this.socketTask = uni.connectSocket({
			url: this.url + `&t=${new Date().getTime()}`,
			success() {
				_this.log('---- 正在建立SOCKET连接... ----')
				return _this.socketTask
			},
			fail() {
				_this.log('---- 建立SOCKET连接失败 ----')
				return _this.socketTask
			}
		})
		// socket连接
		this.socketTask.onOpen(res => {
			this.log('---- SOCKET连接已打开 ----')
			// 连接是重连后的打开的状态
			if (this.reconnectStatus) {
				// 记录重连的次数
				this.reconnects++
				$store.commit('socket/store_set_reconnect_times', this.reconnects)
			}
			// 关闭还是重连状态
			this.reconnectStatus = false
			$store.commit('socket/store_set_reconnectStatus', this.reconnectStatus)
			clearTimeout(this.heartbeatInterval)
			clearTimeout(this.reconnnectTimeout)
			this.isOpenSocket = true
		})
		// socket异常
		this.socketTask.onError(error => {
			this.log('---- SOCKET连接异常 ----')
			this.reconnect()
		})
		// socket收到消息
		this.socketTask.onMessage(res => {
			$store.commit('socket/socketOnMessage', res)
			// this.log('---- SOCKET收到消息 ----')
			const result = JSON.parse(res.data)
			let data, code, action, clientId;
			// 心跳相关逻辑处理 start ------------
			if (result.action === 'heartbeat') {
				if (result.response.code === 200) {
					this.heartbeatReceived = true
				} else {
					this.heartbeatReceived = false
				}
			}
			if (result.seq) {
				data = result.response.data
				code = result.response.code
				action = result.action
			} else {
				try {
					action = result.data.action
				} catch (error) {
					action = result.action
				}
				data = result.data
				code = result.code
			}
			if (data) {
				switch (action) {
					// 建立SOCKET连接收到消息 存储收到的clientID
					case 'enter':
						clientId = result.data.clientId
						$store.commit('SET_CLIENTID', clientId)
						const heartData = {
							// TODO 自己生成一个
							clientId: clientId,
							uid: $store.state.login.setServiceInfo.id + '',
							uType: $store.state.login.setServiceInfo.uType,
							platform: $store.state.login.setServiceInfo.platform
						}
						this.heartbeatData.seq = (Math.random() * 1000000).toString().replace('.', '')
						this.heartbeatData.data = heartData
						this.ping() // 开启心跳检测
						if (this.socketMsgQueue.length) {
							this.socketMsgQueue.map(item => {
								item.data.clientId = result.data.clientId
								this.send(JSON.stringify(item))
							})
						}
						this.socketMsgQueue = []
						break
				}
			}
			// end ------------
		})
		// socket关闭
		this.socketTask.onClose(res => {
			this.log('---- SOCKET连接已关闭 ----')
			// 重连
			if (!this.closeByControl) {
				this.reconnect()
			}
		})
	}
	// 开启心跳检测
	ping() {
		this.log('---- SOCKET心跳开启 ----')
		clearInterval(this.heartbeatInterval)
		this.send(JSON.stringify(this.heartbeatData))
		this.heartbeatReceived = false
		this.heartbeatInterval = setInterval(() => {
			// 正常收发心跳
			// this.isOpenSocket && 
			if (this.heartbeatReceived) {
				this.heartbeatData.seq = (Math.random() * 1000000).toString().replace('.', '')
				this.send(JSON.stringify(this.heartbeatData))
				this.heartbeatReceived = false
			} else {
				this.errorTimes++
				// 心跳异常 进行重连
				if (this.errorTimes > 1) {
					this.log('---- SOCKET心跳异常 关闭连接 ----')
					this.errorTimes = 0
					this.reconnect()
				} else {
					// 再发一次 第二次还是不成功重发
					this.heartbeatData.seq = (Math.random() * 1000000).toString().replace('.', '')
					this.send(JSON.stringify(this.heartbeatData))
					this.heartbeatReceived = false
				}
			}
		}, this.heartbeatTimes)
	}
	// 发送消息
	send(message) {
		const _this = this
		return new Promise((resolve, reject) => {
			this.socketTask.send({
				data: message,
				async success(res) {
					// _this.log('---- SOCKET消息发送成功 ----')
					resolve(true)
				},
				async fail(error) {
					_this.log('---- SOCKET消息发送失败 ----')
					// 把消息放到失败队列
					const sendMessage = JSON.parse(message)
					const filterSend = _this.socketMsgQueue.filter(item => item.seq === sendMessage.seq)
					if (!filterSend[0]) {
						if (sendMessage.action==='sendmsg') {
							_this.socketMsgQueue.push(sendMessage)
						}
					}
					reject(error)
				}
			})
		})
	}
	// 重连
	reconnect() {
		this.log('---- SOCKET正在重连 ----')
		this.reconnectStatus = true
		$store.commit('socket/store_set_reconnectStatus', this.reconnectStatus)
		// 停止心跳
		clearInterval(this.heartbeatInterval)
		// 如果不是自己关闭的，进行重连
		this.reconnnectTimeout = setTimeout(() => {
			this.isOpenSocket = false
			this.connectSocketInit()
			clearTimeout(this.reconnnectTimeout)
		}, this.reconnectTimes)
	}
	// 关闭
	close() {
		clearInterval(this.heartbeatInterval)
		this.isOpenSocket = false
		this.socketTask.close()
	}
}
module.exports = S
