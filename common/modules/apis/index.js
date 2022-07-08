import login from './login'

const modules = {
	login,
}

function parseUrl() {
	let res = {}
	for (let key in modules) {
		let item = modules[key]
		for (let k in item) {
			res[k] = item[k]
			res[k].uri = key + '/' + item[k].uri
		}
	}
	return res
}

export default modules
