/**
 * 获取需要的storage
 * @param {String} key 获取的storage关键值
 */
export const getStorage = (key) => {
	const val = uni.getStorageSync(key)
	if (val) {
		return val
	} else {
		return false
	}
}

export const setStorage = (key, value) => {
	uni.setStorageSync(key, value)
}