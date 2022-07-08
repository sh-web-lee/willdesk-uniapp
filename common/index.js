import config from "./config";
import apis from './modules/apis';

const MODE_NAME = 'NAME';

// 请求任务
let task = null;

function Http() {
	uni.showLoading({
		title: "Loading.."
	})
	this.baseUrl = process.env.VUE_APP_API_URL;
	this.mode = MODE_NAME;
	this.apis = apis || [];
	this.interceptor = {
		request: null,
		response: null
	};
	this.options = Object.assign({}, {
			data: {},
			header: {
				'Content-Type': 'application/json',
			},
			method: "POST",
			success() {},
			fail() {},
			complete() {
				// 响应结果拦截(无论成功或失败)
				uni.hideLoading();
			}
		}
	);
}

// 中断请求
Http.prototype.abort = function() {
	if (task) {
		task.abort();
	}
}

Http.prototype.request = (config) => {
	let api = null;

	if (this.mode === MODE_NAME) {
		api = getApi(this.apis, config.name, config.params);
		if (api !== null) {
			delete config.name;
			delete config.params;
			config.url = this.baseUrl + api.uri;
		}
	}

	if (!isFullUrl(config.url)) {
		config.url = this.baseUrl + config.url;
	}

	const params = typeof config.data == 'object' ? config.data : JSON.parse(config.data)
	// 添加公共的shop字段
	if (params.no_domain_param != 1) {
		params.Domain = uni.getStorageSync('setServiceInfo').shop

		config.data = params
	}

	// 添加authorization
	if (params.no_token_header != 1) {
		config.headers.authorization = uni.getStorageSync('setServiceInfo').token
	}

	return config
}

['get', 'post', 'put', 'patch'].forEach((method) => {
	Http.prototype[method] = function(name, data, params) {
		let options = {};

		if (typeof name === "object") {
			options = name;
			return this.request(
				Object.assign(options, {
					method: method.toUpperCase(),
				})
			);
		}

		options.method = method.toUpperCase();
		if (this.mode === MODE_NAME) {
			options.name = name;
			options.data = data;
			options.params = params;
			return this.request(options);
		}

		options.url = name;
		options.data = data;
		if (typeof params === 'object') {
			options = Object.assign({}, options, params);
		}
		return this.request(options);
	};
});

/**
 * http widget class
 */
export class HttpWidget {
	install(Vue) {
		Vue.prototype.$http = new Http();
	}
}

export {
	Http,
};

/**
 * Get api object by name. URI will be replaced by data and params
 * @param  {String} name    Api name
 * @param  {Object} params  Request params
 * @return {Object}
 */
function getApi(apis, name, params) {
	if (apis.length <= 0 || !name) {
		return null;
	}
	let api = apis[name];
	let uri = api.uri;

	let keys = [];
	pathToRegexp(uri, keys);
	if (keys.length > 0) {
		keys.forEach(key => {
			if (!params[key.name]) {
				throw new Error(
					`API name: ${name}. You are using dynamic params but ${ key.name } not existed in your params`
				);
			}

			uri = uri.replace(`:${key.name}`, params[key.name] || "undefined");
		});
	} else {
		let query = {}
		let arr = uri.split('?')[1] == undefined ? [] : uri.split('?')[1].split('&')

		arr.forEach((item, i) => {
			let itemArr = item.split('=')
			if (itemArr[1]) {
				query[itemArr[0]] = itemArr[1]
			}
		})
		query = Object.assign(query, params)
		uri = uri.split('?')[0]
		let queryArr = []
		for (let k in query) {
			queryArr.push(`${k}=${query[k]}`)
		}
		if (queryArr.length)
			uri += '?' + queryArr.join('&')
	}
	return Object.assign(api, {
		uri,
	});
}

function isFullUrl(url) {
	return /(http|https):\/\/([\w.]+\/?)\S*/.test(url);
}
