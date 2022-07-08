import Vue from 'vue'
import App from './App'

// 语言包
import messages from '@/common/lang/index.js'
import store from '@/store/index'
// 引入moment
import moment from 'moment'

// 公共样式
import '@/assets/css/resetUni.scss'
import '@/assets/css/resetPublic.scss'
import uView from '@/uni_modules/uview-ui'

// 组件
import NavBar from '@/components/navBar/navBar.vue'
import Tabbar from '@/components/tabBar/tabBar.vue'
import tips from '@/common/tips.js'
import VueI18n from 'vue-i18n'
import Loading from '@/components/Loading.vue'
import svgIcon from '@/components/svgIcon.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import utils from '@/utils/utils.js'

Vue.use(uView)
var i18nConfig = {}

// 获取设备基础信息
uni.getSystemInfo({
	success: (res) => {
		store.commit('GET_DEVICEINFO', res)
		i18nConfig = {
			lazy: true,
			// locale: res.language,
			locale: 'en',
			messages,
			// 隐藏警告
			silentTranslationWarn: true
		}
		console.log('%c 设备信息:', 'background-color:#0f0;', res)
	}
});

const msg = (title, duration = 1500, mask = false, icon = 'none') => {
	if (Boolean(title) === false) {
		return;
	}
	uni.showToast({
		title,
		duration,
		mask,
		icon
	});
}

const prePage = () => {
	let pages = getCurrentPages();
	let prePage = pages[pages.length - 2];
	// #ifdef H5
	return prePage;
	// #endif
	return prePage.$vm;
}

Vue.component('view-navbar', NavBar) // 注册组件
Vue.component('view-tabbar', Tabbar) // 注册组件
Vue.component('Loading', Loading) // 注册组件
Vue.component('svgIcon', svgIcon) // 注册组件
Vue.component('ProgressBar', ProgressBar) // 注册组件

Vue.prototype.$moment = moment
Vue.prototype.$store = store
Vue.prototype.$msg = {
	msg,
	prePage
};

Vue.config.devtools = true

// VUE2
// #ifdef VUE2
// 国际化
Vue.use(VueI18n)
const i18n = new VueI18n(i18nConfig)
Vue.config.productionTip = false
Vue.prototype._i18n = i18n
App.mpType = 'app'
new Vue({
	store,
	i18n,
	...App
}).$mount()
// #endif

// VUE3
// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
import {
	createI18n
} from 'vue-i18n'
const i18n = createI18n(i18nConfig)
Vue.prototype._i18n = i18n
Vue.prototype.$tips = tips
Vue.prototype.$utils = utils

export function createApp() {
	const app = createSSRApp(App)
	app.use(i18n, store)
	return {
		app
	}
}
// #endif
