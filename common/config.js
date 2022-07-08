import $store from '@/store/index.js'
import { getStorage, setStorage } from '@/utils/common.js'
import tips from '@/common/tips.js'
export default (api, method, param = {}, isNew = false) => {
	const type = 'dev'
	var URL = ''
	switch (type) {
		case 'local':
			URL = 'https://htest.sealapps.com/';
			break;
		case 'dev':
			URL = 'https://htest.sealapps.com/';
			break;
		case 'pro':
			URL = 'https://api.willdesk.com/';
			break;
		default:
			URL = 'https://api.willdesk.com/';
			break;
	}

	URL = isNew ? URL : URL + 'api/';

	let params = {}
	if (param != '') {
		params = typeof param == 'object' ? param : JSON.parse(param);
	}

	let header = {
		'Content-Type': 'application/json'
	};

	// 添加Domain字段
	if (params.no_domain_param != 1) {
		params.Domain = getStorage('SET_SERVICEINFO').Domain
	}
	// 添加authorization
	if (params.no_token_header != 1) {
		header.authorization = $store.state.login.setServiceInfo.token
	}

	return new Promise((resolve, reject) => {
		uni.request({
			url: URL + api,
			method: method,
			header: header,
			data: params,
			success: (res) => {
				switch (res.statusCode) {
					case 200:
						// console.log('请求成功', res);
						resolve(res)
						break
					case 401:
						// console.log('请求失败', res);
						tips.toast(res.data.message)
						reject()
						break
					default:
						resolve(res)
						break
				}
			},
			fail: (err) => {
				console.log('异常失败', err);
				reject(err);
			},
			complete() {
				// 隐藏Loading态
				tips.hideLoading()
			}
		})
	})
}
