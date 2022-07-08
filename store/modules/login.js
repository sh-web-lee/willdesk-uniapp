import request from "@/common/config.js"
import {
	getStorage,
	setStorage
} from '@/utils/common.js'

const state = {
	setServiceInfo: getStorage('SET_SERVICEINFO') || {}
}

const mutations = {
	SET_SERVICEINFO(state, data) {
		setStorage('SET_SERVICEINFO', data)
		state.setServiceInfo = data || {}
	}
}

const getters = {
	serviceInfo: state => state.setServiceInfo
}

const actions = {
	login({
		commit
	}, form) {
		return new Promise((resolve, reject) => {
			form.no_token_header = 1
			form.no_domain_param = 1
			request('cs_login', 'POST', form).then(res => {
				if (res.data.Code === 200 && res.data.Message === 'OK') {
					uni.setStorageSync('SET_SERVICEINFO', form)

					commit('SET_SERVICEINFO', {
						// TODO
						id: res.data.CustomerServiceId,
						uType: 2,
						platform: uni.getSystemInfoSync().platform === 'ios' ? 2 : 3,
						siteIds: res.data.SiteIds,
						userName: res.data.Name,
						email: res.data.Email,
						pwd: form.Password,
						avatar: res.data.Profile,
						color: res.data.FacesColor,
						Domain: res.data.Domain,
						token: res.data.AccessToken,
						brand: res.data.Brand,
						storeurl: res.data.StoreUrl,
						role: res.data.Role,
						faqUrl: res.data.IsFAQ == '1' ? res.data.JumpUrl[0] : '',
						shopId: res.data.ShopId,
						reviews: res.data.Reviews,
						IsReviews: res.data.IsReviews,
						locationIsLock: res.data.setItems[0].setValue == 'true',
						isSystemShop: res.data.setItems[1].setValue == 'true',
						IsLogin: true
					})
				}
				resolve(res);
			}).catch(err => {
				console.log('err', err);
				reject(err)
			})
		})
	},
	loginOut({
		commit
	}, form) {
		return new Promise((resolve, reject) => {
			uni.clearStorage()
			commit('SET_SERVICEINFO', {})
			resolve()
		})
	}
}

export default {
	namespaced: true,
	state,
	mutations,
	actions,
	getters
}
