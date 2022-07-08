import request from '@/common/config.js'

// no_token_header = 1 不用加请求头
// no_domain_param = 1 不会自动加店铺参数
export default {
	// 个人信息页修改坐席信息
	modifyAccountInfo(param = {}) {
		param.no_token_header = 1
		return request('update_account', 'POST', JSON.stringify(param))
	}
}
