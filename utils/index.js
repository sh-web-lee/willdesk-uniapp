export default {
	/**
	 * 获取 URL 中的参数
	 * @param {String} name   取哪个字段
	 * @returns {string|null}
	 */
	getUrlKey(name) {
		return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || [
			undefined, ''
		])[1].replace(/\+/g, '%20')) || null
	},
	// 获得apikey
	getApiKey() {
		return process.env.VUE_APP_APIKEY || 'b4319770e45adacef4755abe2ea27a39'
	},
	// 获得环境
	getEnv() {
		return process.env.VUE_APP_ENV || 'dev'
	},
	// 验证email有效性
	checkEmail(email) {
		const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/gi
		return reg.test(email)
	},
	// 校验密码
	checkPwd(pwd) {
		const reg =
			/(?!^(\d+|[a-zA-Z]+|[`~!@#$%^&*()_\-+=<>?:"{}|,.\\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]+)$)^[\w`~!@#$%^&*()_\-+=<>?:"{}|,.\\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]{8,50}$/gi
		return reg.test(pwd)
	},
	checkPhone(phone) {
		const reg = /^[0-9]{3,}$/gi
		return reg.test(phone)
	}
}
