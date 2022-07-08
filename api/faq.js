import request from '@/common/config.js'

export default {
	// 获取店铺review配置
	GetReviewConfiguration(param = {}) {
		return request('get_review_configuration', 'POST', JSON.stringify(param))
	},
	// 获取用户信息
	newCustomerServiceDetail(param = {}) {
		param.no_domain_param = 1
		return request('v1/api/customer/detail', 'POST', JSON.stringify(param), true)
	},
	// 获取Notes
	newGetNotesListApi(param = {}) {
		param.no_domain_param = 1
		return request('v1/imroom/notes/list', 'POST', JSON.stringify(param), true)
	},
	// 获取店铺简略信息
	shopInfo(param = {}) {
		param.no_domain_param = 1
		return request('get_shop_simpleInfo', 'POST', JSON.stringify(param))
	},
}
