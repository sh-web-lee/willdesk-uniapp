import S from '@/network/socket.js'
import $store from '@/store/index.js'
import { throttle } from '@/utils/publicMethods.js'

const state = {
	SOCKET: null,
	message: 0,
	socketUpdate: 0, // 监听是否更新socket
	socketUpdateData: null ,// 更新的socket数据
	typingData: null, // 更新用户是否输入中
	reconnectStatus: false, // 是否正在重连
	reconnect_times: 0 // 重连的次数
}
const getters = {
	message: state => state.message,
	socketUpdate: state => state.socketUpdate,
	typingData: state => state.typingData,
	reconnectStatus: state => state.reconnectStatus,
	reconnect_times: state => state.reconnect_times
}
const mutations = {
	// 记录重连的次数
	store_set_reconnect_times(state, times) {
		state.reconnect_times++
	},
	store_set_message(state, data) {
		state.message++
	},
	// 更新的socket数据
	store_set_socketUpdateData(state, data) {
		state.socketUpdateData = data
	},
	// 随机数 用于判断是否更新socket数据
	store_set_socketUpdate(state, data) {
		state.socketUpdate = data
	},
	// 设置是否重连的状态
	store_set_reconnectStatus(state, status) {
		state.reconnectStatus = status
	},
	/**
	 * 开启socket
	 * @param {Object} state
	 * @param {Object} status
	 */
	store_active_socket(state, status) {
		const info = $store.state.login.setServiceInfo
		const link = `wss://tws.sealapps.com/ws?platform=${info.platform}&uid=${info.id}&uType=${info.uType}&siteId=${info.shopId}`
		state.SOCKET = new S(link, {
			heartbeatTimes: 10000,
			reconnectTimes: 3000
		})
	},
	store_socket_close(state, status) {
		state.SOCKET.closeByControl = true
		state.SOCKET.close()
	},
	/**
	 * 发送socket消息
	 * @param {Object} commit
	 * @param {Object} data
	 */
	socketSend(state, data) {
		state.SOCKET.send(data)
	},
	socketOnMessage(state, res) {
		const result = JSON.parse(res.data)
		let data, code, action;
		// 参数错误 clientId状态错误,重新连接
		if (result.response && result.response.code === 1003) {
			// window.$ws.close()
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
				// 收到消息
				case 'sendmsg':
					if (code === 200) {
						state.socketUpdateData = data
						state.socketUpdate = (Math.random() * 1000000).toString().replace('.', '')
						const throttleDing = throttle(500)
						if (data.imReocrdInfo.senderUidType === 1) {
							throttleDing(() => {
								state.message++
							})
						}
					}
					break
					// 房间操作
				case 'operate':
					if (code === 200) {
						state.socketUpdateData = data
						state.socketUpdate = (Math.random() * 1000000).toString().replace('.', '')
					}
					break
					// 消息发送中
				case 'tipmsg':
					if (code === 200) {
						state.typingData = data
					}
					break
			}
		}
	}
}
const actions = {

}
export default {
	namespaced: true,
	state,
	getters,
	mutations,
	actions
}
