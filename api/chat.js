import request from '@/common/config.js'

// no_token_header = 1 不用加请求头
// no_domain_param = 1 不会自动加店铺参数
export default {
	// 房间会话列表新接口
	getImRoomList(param = {}) {
		return request('v1/imroom/list', 'POST', JSON.stringify(param), true)
	},
	// 获取坐席列表
	getCustomerServiceList(param = {}) {
		return request('v1/customer/service/public/list', 'POST', JSON.stringify(param), true)
	},
	gettest(param = {}) {
		return request('get_chat_list', 'POST', JSON.stringify(param))
	},
	newImRoomCount(param = {}) {
		return request('v1/imroom/count', 'POST', JSON.stringify(param), true)
	},
	updateSession(param = {}) {
		return request('v1/imroom/operate', 'POST', JSON.stringify(param), true)
	},
	
	//未回复消息的接口
	newGetUnReplyNumber (params = {}) {
		return request('v1/imroom/noreply','POST', JSON.stringify(params), true)
	},
	// 获取房间聊天记录
	getRoomChatHistory(param = {}) {
		return request('v1/imroom/record/list', 'POST', JSON.stringify(param), true)
	},
	// 获取房间指定时间段内的聊天记录条数
	getRoomChatHistoryCount(param = {}) {
		return request('v1/imroom/record/count', 'POST', JSON.stringify(param), true)
	},
	
	//添加note
	 newNotesEditApi (param = {}) {
	    return request('v1/imroom/notes/edit','POST', JSON.stringify(param))
	},
}
