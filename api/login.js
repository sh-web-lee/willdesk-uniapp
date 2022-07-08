import request from '@/common/config.js'

// no_token_header = 1 不用加请求头
// no_domain_param = 1 不会自动加店铺参数
export default {
	// 查看Email是否存在
	authEmailDomain(param = {}) {
		param.no_token_header = 1
		param.no_domain_param = 1
		return request('auth_email_domain', 'POST', JSON.stringify(param))
	},
	// 忘记密码
	csResetPasswprd(params = {}) {
		params.no_token_header = 1
		params.no_domain_param = 1
		return request("reset_password", 'POST', JSON.stringify(params));
	},
}
