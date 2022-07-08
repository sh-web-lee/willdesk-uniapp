export default {
	isUndefined(key) {
		// 1、如果整个key值就为undeinfed， 阿里云会返回403错误
		// 2、如果只是key值中某一处为undefined， 阿里云会返回200 需要自行做处理
		if (!key || (typeof key === 'string' && key.indexOf('undefined') !== -1)) {
			return true
		} else {
			return false
		}
	},
	UpdateJSON(oldVal, newVal, json) {
		console.log(json);
		for (var i in json) {
			for (var j in json[i]) {
				if (j == oldVal) {
					json[i][newVal] = json[i][j] //修改属性名为newVal
					delete json[i][oldVal] //删除oldVal
				}
			}
		}
		console.log(json);
		return json
	}
}
