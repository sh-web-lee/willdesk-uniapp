import Vue from 'vue'
import Vuex from 'vuex'
import request from "@/common/config.js"
import moment from "moment"

import md5 from 'js-md5'

Vue.use(Vuex);

import login from './modules/login';
import setting from './modules/setting.js'
import chat from './modules/chat.js'
import socket from './modules/socket.js'
import {
	setStorage,
	getStorage
} from '@/utils/common.js'

const modules = {
	login,
	setting,
	chat,
	socket
}

export default new Vuex.Store({
	modules,
	state: {
		// 设备基础信息
		deviceInfo: {},
		// oss阿里云存储签证信息
		ossSetting: {},
		clientId: '', // SOCKET唯一ID
		ratingInfo: {}, // 评论组件信息
		msgNum: 0,
		SETTING_NUM: 0, //作为判断使用，勿删
		uploadFileStatus: [], // 上传状态集合，用于记录所有图片上传进度状态
	},
	mutations: {
		CHANGE_NUM(state, value) {
			state.msgNum = value
		},
		GET_DEVICEINFO(state, data) {
			state.deviceInfo = data || {}
			setStorage('DEVICEINFO', data)
		},
		SET_OSSSETTING(state, data) {
			state.ossSetting = data || {}
		},
		SET_CLIENTID(state, clientId) {
			state.clientId = clientId
			setStorage('CLIENTID', clientId)
		},
		SET_RATINGINFO(state, data) {
			state.ratingInfo = data
		},
		change_setting(state, val) {
			state.SETTING_NUM = val
		}
	},
	getters: {
		clientId: state => state.clientId,
		uploadFileStatus: state => state.uploadFileStatus,
		deviceInfo: state => state.deviceInfo
	},
	actions: {
		OSSUpload({
			commit,
			state
		}, Num = 0) {
			return new Promise((resolve, reject) => {
				// 先判断oss签证是否过期
				const time = new Date().getTime()
				// 后端设置2小时，前端验证1.5小时
				if (Math.floor(time / 1000) > state.ossSetting.expire || state.ossSetting.expire ==
					undefined) {
					// 签证过期
					// 请求新的Token
					request('get_oss_token', 'POST', ).then(res => {
						const data = JSON.parse(res.data.Data);
						data.time = new Date().getTime();
						commit('SET_OSSSETTING', data);
						resolve(data);
					}).catch(err => {
						console.log('err', err);
						if (Num > 1) {
							reject(err);
						} else {
							this.OSSUpload({
								commit
							}, Num++)
						}
					})
				} else {
					// 签证未过期
					const data = state.ossSetting
					resolve(data)
				}
			})
		},
		uploadImg({
			commit,
			state,
			dispatch
		}, form) {
			// 如果ossSetting为null或undefined，则重新获取
			if (state.ossSetting.hasOwnProperty('dir')) {
				dispatch('OSSUpload', null, {
					root: true
				})
			}

			const time = new Date().getTime(); // timeStamp
			const shopId = state.login.setServiceInfo.shopId;
			const ossSetting = state.ossSetting;
			const host = ossSetting.host;
			const formatTime = moment(time).format('YYYY/MM/DD');

			const fileType = form.name.substr(form.name.lastIndexOf('.'), form.name.length)
			form.name = form.name.substr(0, form.name.lastIndexOf('.'))
			const fileName = md5(time + '_' + form.name) + fileType

			const key = `${ossSetting.dir}/${form.type}/${shopId}/${formatTime}/${fileName}`

			return new Promise((resolve, reject) => {
				const fileTask = uni.uploadFile({
					url: host, //仅为示例，非真实的接口地址
					filePath: form.location,
					name: 'file', // 必须填file
					headers: {
						'content-type': 'multipart/form-data'
					},
					formData: {
						'key': key,
						'Signature': ossSetting.signature,
						'policy': ossSetting.policy,
						'OSSAccessKeyId': ossSetting.accessid,
						'success_action_status': '200',
						'callback': ossSetting.callback
					},
					success: res => {
						resolve([res, key]);
					},
					fail: e => {
						reject(e)
					},
					complete() {
						// 响应结果拦截(无论成功或失败)
					}
				});
				fileTask.onProgressUpdate((res) => {
					const filterIndex = state.uploadFileStatus.findIndex(item => item.seq ===
						form.seq)
					if (filterIndex !== -1) {
						// 有正在上传的记录，修改上传的记录值
						state.uploadFileStatus[filterIndex].progress = res.progress
					} else {
						// 没有记录直接新增
						state.uploadFileStatus.push({
							seq: form.seq,
							progress: res.progress
						})
					}
					if (res.progress === 100) {
						fileTask.offProgressUpdate()
					}
				})
			})
		}
	}
})
