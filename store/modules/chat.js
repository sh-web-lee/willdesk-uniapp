import request from "@/common/config.js"
import { setStorage, getStorage } from '@/utils/common.js'

const state = {
	top_center: 'Open',
	left_mes: 'all',
	csListMap: new Map(),
	roomInfo: getStorage('ROOMINFO') || {},
	latestReplyTime: 0 	,// 最后回复时间
	emojiPosition: '',
	chatHistory: [], // 历史聊天数据
}

const getters = {
	top_center: state => state.top_center,
	left_mes: state => state.left_mes,
	emoji_Position: state => state.emojiPosition,
	roomInfo: state => state.roomInfo,
	chatHistory: state => {
		const history = getStorage('CHATHISTORYDATA')
		if (history) {
			history.map(item => {
				if (item.roomId === state.roomInfo.roomId) {
					state.chatHistory = item.record
				}
			})
		} else {
			state.chatHistory = []
		}
	}
}

const mutations = {
	CHANGE_TOP(state, value) {
		state.top_center = value
	},
	CHANGE_LEFT_MES(state, value) {
		state.left_mes = value
	},
	SET_CSLISTMAP(state, result) {
		const csList = new Map()
		csList.set(result.ShopId, result.data)
		state.csListMap = csList
	},
	SET_ROOMINFO(state, roomInfo) {
		setStorage('ROOMINFO', roomInfo)
		state.roomInfo = roomInfo
	},
	SET_LASTREPLYTIME(state, val) {
		state.latestReplyTime = val
	},
	SET_EMOJIPOSITION(state, val) {
		state.emojiPosition = val
	},
	SET_CHATHISTORY(state, setObject) {
		state.chatHistory = setObject.record
		const keys = 'CHATHISTORYDATA'
		let history = getStorage(keys)
		if (history) {
			const findIndex = history.findIndex(item => item.roomId === setObject.roomId)
			if (findIndex !== -1) {
				history[findIndex].record  = setObject.record
			} else {
				history.push(setObject)
			}
		} else {
			history = []
			history.push(setObject)
		}
		setStorage(keys, history)
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