<template>
	<view class="chatArea" :style="{ 'height': $store.state.deviceInfo.windowHeight }">
		<view-navbar class="header" back more>
			<template slot="text">
				<text>{{ roomInfo.firstSendName || '' }}</text>
			</template>
		</view-navbar>
		<reconnectStatus v-if="reconnectStatus"></reconnectStatus>
		<view class="chatArea-content">
			<view class="chatBox" @click="closeOtherBox">
				<scroll-view :scroll-y="scrollVisiable" class="chatBox-list"
					:style="{'height': `calc(${$store.state.deviceInfo.windowHeight}px - ${navHeight}px - ${inputHeight}px - ${keyboardHeight}px)`, 'overflow-anchor': 'auto'}"
					@scrolltoupper="scrolltoupper" :scroll-anchoring='true' :scroll-top="scrollTop" @scroll="chatScroll"
					:scroll-into-view="scrollItem">
					<loading v-if="chatParams.showload" :status="chatParams.loading"></loading>
					<view class="chatList-area">
						<view class="chat-list-item" v-for="(item, key) in chatHistory" :id="'chat' + key" :key="key">
							<view class="time-lag" v-if="renderMessageDate(item, key)">{{renderMessageDate(item, key)}}
							</view>
							<component :is="msgTypeComputed(item)" :userInfo.sync="roomInfo"
								:serviceInfo.sync="serviceInfo" :chatItemInfo="item" :sessionInfo="item"
								:nextChatItemInfo="chatHistory[key+1]"
								:nextTime="chatHistory[key+1]?renderMessageDate(chatHistory[key+1], key+1):''"
								@resendMessage='resendMessage' @watchImageHeightChange="changeScrollTop">
							</component>
						</view>
					</view>
				</scroll-view>
			</view>
			<view class="chatInput">
				<view class="inputBox" @touchmove.stop.prevent="stopPenetrate">
					<textarea :hold-keyboard="true" placeholder="Type message..." id="textarea" auto-height="true"
						v-model="textMsg" @focus="onEditorFocus" @tap="closeEmoji" @input="inputing" @blur="onEditorBlur"
						class="inputTextArea" maxlength="1000"></textarea>
					<!-- <editor id="editor" placeholder="Type message..." @ready="onEditorReady" @focus="onEditorFocus" @click="closeEmoji" @input="onEditorChange('text')"></editor> -->
				</view>
				<view class="inputHandler">
					<view class="inputHandler-quick">
						<view class="emoji-handler" @click="pickEmoji">
							<image :src="!emojiStatus ? '/static/emoji.svg' : '/static/emojiActive.svg'"
								mode="aspectFit" lazy-load>
							</image>
						</view>
						<!-- <view class="file-handler" @click="upLoadFile()">
							<image src="/static/file.svg"></image>
						</view> -->
						<view class="file-handler" @click="upLoadImg()">
							<image src="/static/loadImage.svg" style="width: 46upx;height: 40upx;"></image>
						</view>
						<view class="rate-handler" @click="sendTyping()">
							<image src="/static/rate.svg"></image>
						</view>
					</view>
					<view class="sendMsg" @click="sendMsg()">
						<image v-if="editorIsEmpty" src="/static/send.svg"></image>
						<image v-else src="/static/sendActive.svg"></image>
					</view>
				</view>
				<!-- 表情 -->
				<emojiBox :isShow="emojiStatus" :keyboardHeight="keyboardHeight" @chooseEmoji='insertEmoji'></emojiBox>
			</view>
		</view>
	</view>
</template>

<script>
	import ServiceChatItem from '@/components/chatItem/ServiceChatItem.vue'
	import CustomerChatItem from '@/components/chatItem/CustomerChatItem.vue'
	import SessionState from '@/components/chatItem/SessionState.vue'
	import timeLine from '@/components/chatItem/timeLine.vue'
	import messageRate from '@/components/chatItem/messageRate.vue'
	import emojiBox from '@/components/emojiBox.vue'
	import loading from '@/components/loading/loading.vue'
	import reconnectStatus from '@/components/reconnectStatus/reconnectStatus.vue'
	let throttleFunc = null
	import {
		guid,
		transformTag,
		throttle
	} from '@/utils/publicMethods.js'
	import {
		mapGetters,
		mapMutations,
		mapActions
	} from 'vuex'
	import chat from '@/api/chat.js'
	let textarea
	export default {
		components: {
			ServiceChatItem,
			CustomerChatItem,
			SessionState,
			timeLine,
			messageRate,
			emojiBox,
			loading,
			reconnectStatus
		},
		data() {
			return {
				sendContext: '',
				navHeight: 44, // 头部高度
				inputHeight: 0, // 输入框高度
				scrollTop: 0, // 滚动的头部高度
				scrollInner: 0, // 可滚动的区域高度
				scrollHeight: 0, // 滚动区域的高度
				scrollPosition: 0, // 当前滚动的位置
				scrollVisiable: false, // 是否可以滚动
				chatHistory: [], // 聊天记录
				recordHistory: [], // 历史记录
				msgsType: {
					1: 'customer-chat-item',
					2: 'service-chat-item',
					5: 'session-state'
				},
				chatParams: {
					page: 1, // 页码
					pageSize: 20, // 每页的条数
					sendTime: 0, // 最后时间

					noMore: false, // 是否还有更多数据
					loading: 'loading', // 是否加载更多数据
					loaded: true, // 是否加载完正在请求的数据
					showload: false, // 是否展示正在加载
					firstLoad: true, // 是否是首次加载数据
				}, // 聊天页面 相关数据
				roomId: '', // 当前房间ID
				roomInfo: null, // 当前房间的信息
				editorIsEmpty: true, // 	编辑器输入框是否为空
				// 消息发送请求体类型
				msgType: {},
				serviceInfoAvatar: '', //	坐席头像
				// 发送者姓名
				username: this.$store.state.login.setServiceInfo.userName,
				// 消息发送请求体
				sendMsgParams: {
					seq: (Math.random() * 1000000).toString().replace('.', ''),
					action: 'sendmsg',
					data: {
						avatar: this.$store.state.chat.roomInfo.alloucationAvatar,
						clientId: this.$store.state.clientId,
						isNote: false,
						message: null,
						msgType: 'text', // 默认字段为文本
						platform: uni.getSystemInfoSync().platform === 'ios' ? 2 : 3, // 1、PC 2、app-ios 3、app-Android
						roomId: '',
						siteId: this.$store.state.chat.roomInfo.siteId, // 登录页面cs_login接口获得
						// toUid: null,
						// toUidType: 1, // 1、C端用户 2、B端坐席 3、平台客服
						uType: this.$store.state.login.setServiceInfo.uType, // 1、C端用户 2、B端坐席 3、平台客服
						uid: this.$store.state.login.setServiceInfo.id + '',
						username: this.$store.state.login.setServiceInfo.userName
					}
				},
				emojiStatus: false,
				emoji_position: '',
				reconnecting: false, // 是否正在重连中
				fileObj: {},
				scrollItem: '',
				lastChatID: '', // 最后一条数据的ID，用于维持页面的滚动跳转问题
				upLoadImgArr: [], // 本地上传成功的图片
				chatCount: 10000,
				// 输入框内容
				textMsg: '',
				// 软键盘高度
				keyboardHeight: 0
			}
		},
		created() {
			this.msgType[this.msgType.text = 1] = 'text'
			this.msgType[this.msgType.image = 2] = 'image'
			this.msgType[this.msgType.video = 3] = 'video'
			this.msgType[this.msgType.voice = 4] = 'voice'
			this.msgType[this.msgType.operate = 5] = 'operate'
			this.msgType[this.msgType.attachment = 6] = 'attachment'
			this.msgType[this.msgType.rate = 7] = 'rate'
			this.msgType[this.msgType.ordder = 8] = 'order'
			this.msgType[this.msgType.call = 9] = 'call'
			this.msgType[this.msgType.news = 10] = 'news'
			this.msgType[this.msgType.newstext = 11] = 'newstext'
			throttleFunc = throttle(100)
		},
		onShow() {},
		async onLoad(options) {
			this.roomId = options.roomId
			this.roomInfo = this.$store.state.chat.roomInfo
			this.initChatAreaHeight()
			await this.checkChatHistory()
			this.getChatHistory()
			// uni.onKeyboardHeightChange(res => {
			// 	this.keyboardHeight = res.height
			// })
			// const _this = this
			// 获取键盘高度
			uni.onKeyboardHeightChange(res => {
				console.log('this.deviceInfo:', this.deviceInfo)
				if (res.height > 0 && res.height != this.deviceInfo.keyboardHeight) {
					let list = this.deviceInfo
					list.keyboardHeight = res.height
					this.keyboardHeight = res.height;
					this.$store.commit('GET_DEVICEINFO', list)
				}
			})
			// this.keyboardHeight = uni.getStorageSync('DEVICEINFO').keyboardHeight || 0;
		},
		computed: {
			...mapGetters({
				serviceInfo: 'login/serviceInfo',
				socketUpdate: 'socket/socketUpdate',
				reconnectStatus: 'socket/reconnectStatus',
				reconnectTimes: 'socket/reconnect_times',
				deviceInfo: 'deviceInfo'
			}),
			'msgTypeComputed'() {
				return function(item) {
					if (item.type == 5) {
						return this.msgsType[5]
					} else {
						if (item.senderUidType == 1) {
							return this.msgsType[1]
						} else {
							return this.msgsType[2]
						}
					}
				}
			},
		},
		watch: {
			// 重连成功
			reconnectTimes(newVal) {
				this.getChatHistory('reconnect')
			},
			/**
			 * 重连状态
			 * @param {Object} status
			 */
			reconnectStatus(status) {
				this.reconnecting = status
			},
			// 输入框内容, 已废弃 editor组件，改用textarea
			sendContext(val) {
				if (val !== '<p><br></p>') {
					this.editorIsEmpty = false
				} else {
					this.editorIsEmpty = true
				}
			},
			// 新消息处理
			socketUpdate(newValue) {
				const data = this.$store.state.socket.socketUpdateData
				if (data.imRoomInfo.roomId !== this.roomInfo.roomId) {
					return
				}
				const roomInfo = this.roomInfo
				const serviceInfo = this.$store.state.login.setServiceInfo
				if (data.imReocrdInfo.senderUidType !== 1) {
					// this.$bus.$emit('changeUrgentState', data)
					// 事件类型
					const event = data.event
					// // 分配的坐席的id
					const allocationUid = data.imRoomInfo.allocationUid
					// 判断新邀请来的坐席是否在坐席列表里
					const imReocrdInfo = data.imReocrdInfo
					let haveService
					// 转成对象
					const csListMap = Object.fromEntries(this.$store.state.chat.csListMap.entries())
					for (const key in csListMap) {
						// 循环判断店铺下是否有这个坐席
						haveService = csListMap[key].filter(cs => cs.id === imReocrdInfo.senderUid)
						if (haveService.length > 0) break
					}
					// 如果没有 重新获取接口
					if (haveService.length === 0) {
						const csListParams = {
							uid: serviceInfo.id,
							uType: serviceInfo.uType,
							platform: serviceInfo.platform,
							siteId: roomInfo.siteId
						}
						chat.getCustomerServiceList(csListParams).then(res => {
							// 如果存在这个店铺保存的坐席列表
							// 替换掉
							if (this.$store.state.chat.csListMap.has(roomInfo.siteId)) {
								for (const key in csListMap) {
									if (key === roomInfo.siteId) {
										csListMap[key] = res.data.data
									}
								}
							} else {
								csListMap[roomInfo.siteId] = res.data.data
							}
							this.setCsListMap({
								ShopId: roomInfo.siteId,
								data: csListMap
							})
						})
					}
				}
				if (data.imReocrdInfo.type == 5) {

				} else {
					if ((data.imRoomInfo.firstSendUid === data.imReocrdInfo.senderUid) && (data.imRoomInfo
							.firstSendUidType === data.imReocrdInfo.senderUidType)) {
						// 用户
						this.addChatItem(this.msgsType[1], data.imReocrdInfo)
					} else {
						// 客服
						// let filterList = this.chatHistory.filter(item => item.messageState === 0)
						let filterList = this.chatHistory.filter(item => item.messageState === 0)
						if (filterList.length) {
							filterList.map(item => {
								if ((item.seq && (item.seq === data.seq || item.seq === data.imReocrdInfo.seq)) ||
									(item.src === data.imReocrdInfo.content)) {
									item.messageState = 1
								}
							})
						} else {
							this.addChatItem(this.msgsType[2], data.imReocrdInfo)
						}
					}
				}
			},

			emojiStatus(val) {
				setTimeout(() => {
					this.$nextTick(() => {
						const query = uni.createSelectorQuery().in(this)
						query.select('.chatInput').boundingClientRect()
						query.exec(data => {
							this.inputHeight = data[0].height
						})
					})
				}, 210)
			},

			// textarea输入框
			textMsg(val) {
				this.editorIsEmpty = val.length > 0 ? false : true
			},
			keyboardHeight(newHeight) {
				console.log('newHeight:', newHeight)
			}
		},
		methods: {
			...mapActions(['uploadImg']),
			...mapMutations({
				SOCKET: 'socket/store_active_socket',
				send: 'socket/socketSend', // 发送socket消息
				setCsListMap: 'chat/SET_CSLISTMAP',
				updateChatHistory: 'chat/SET_CHATHISTORY'
			}),
			stopPenetrate() {
				return true
			},
			resendMessage(seq, newSeq) {
				this.chatHistory.map((item, index) => {
					if (item.seq === seq) {
						item.seq = newSeq
						this.chatHistory.splice(index, 1)
						this.chatHistory.push(item)
						this.chatScroll2Bottom()
					}
				})
			},
			renderMessageDate(message, index) {
				if (index === 0) {
					return this.formatTime(message.sendTime)
				} else {
					if (message.sendTime - this.chatHistory[index - 1].sendTime > 3 * 60 * 1000) {
						return this.formatTime(message.sendTime)
					}
				}
				return '';
			},
			formatTime(time) {
				// 当日时间
				if (this.$moment(parseInt(time)).isSame(new Date().getTime(), 'day')) {
					return this.$moment(parseInt(time)).format('HH:mm')
					// 今年之前的时间
				} else if (this.$moment(parseInt(time)).isBefore(new Date().getTime(), 'year')) {
					// 返回格式：Sep 25,2019（月，日，年），XX：XXam/pm；
					return this.$moment(parseInt(time)).format('MMM DD,YYYY, HH:mm')
					// 今年的时间 格式：Sep 25（月，日），XX：XXam/pm；
				} else {
					return this.$moment(parseInt(time)).format('MMM DD, HH:mm')
				}
			},
			changeScrollTop(data) {
				// if (this.chatParams.page === 1) {
				// 	console.log('谁先', data.height - 50);
				// this.scrollTop += (data.height - 50)
				// 	this.scrollHeight += (data.height - 50)
				// }
			},
			// 点击聊天面板，关闭其他打开状态
			closeOtherBox() {
				this.emojiStatus = false
			},
			// 排序算法
			sortByKey(array, key) {
				return array.sort(function(a, b) {
					var x = a[key]
					var y = b[key]
					return ((x < y) ? -1 : ((x > y) ? 1 : 0))
				})
			},
			// 添加聊天记录
			addChatItem(type, item, typingType = -1) {
				const exist = this.chatHistory.filter(msg => ((msg.msgId && item.msgId) && (msg.msgId === item.msgId)))
				if (exist[0]) {
					return
				}
				// 判断当前是否是用户正在输入，同时坐席端是否有typing态
				item.content = (item.content && item.type == 11) ? JSON.parse(item.content) : item.content
				this.chatHistory.push(item)
				if (this.scrollInner - this.scrollPosition < 400) {
					this.chatScroll2Bottom()
				}
				// 添加排序，防止因为网络延迟导致的聊天错乱
				this.sortByKey(this.chatHistory, 'sendTime')

				// 判断是否滚动到底部
				// this.scrollTop = this.scrollHeight - this.navHeight - this.inputHeight
			},
			chatScroll2Bottom(type) {
				// 滚动到底部
				this.scrollItem = ''
				if (type === 'scroll') {
					this.scrollVisiable = true
					this.scrollItem = `chat${this.chatHistory.length - 1}`
				} else {
					this.$nextTick(() => {
						this.scrollVisiable = true
						this.scrollItem = `chat${this.chatHistory.length - 1}`
					})
				}
			},
			/**
			 * 聊天记录滚动
			 * @param {Object} e
			 */
			chatScroll(e) {
				// mark:scroll
				throttleFunc(() => {
					this.scrollPosition = e.detail.scrollHeight - e.detail.scrollTop
					// this.scrollTop = e.detail.scrollTop
					// if (e.detail.scrollHeight - ) {
					// 	console.log('计算距离', e.detail.scrollHeight - this.scrollHeight);
					// 	this.scrollTop = e.detail.scrollTop + (e.detail.scrollHeight - this.scrollHeight)
					// 	this.scrollHeight = e.detail.scrollHeight
					// }
				})
			},
			// 聊天记录触顶
			scrolltoupper() {
				if (this.chatParams.noMore || !this.chatParams.loaded) {
					return
				} else {
					this.chatParams.page++
					this.getChatHistory()
				}
			},
			/**
			 * 用户去重历史数据与新数据 [ 目前通过msgUuid:唯一标识 ]进行过滤
			 * @filterKey [String] 筛选数据的唯一标识
			 * @list [Array] 聊天中的历史数据
			 */
			filterHistorySameData(filterKey, list) {
				var obj = {}
				list = list.reduce((newArr, next) => {
					// eslint-disable-next-line
					obj[next[filterKey]] ? '' : (obj[next[filterKey]] = true && newArr.push(next))
					return newArr
				}, [])
				return list
			},
			// 数据处理
			dataHandler(list, type) {
				list.map(item => {
					if (item.senderUidType == 2) {
						try {
							if (item.type == 7) {
								let r
								if (typeof item.content === 'string') {
									r = item.content.substr(0, item.content.length - 1).replace('[&*', '')
									item.content = JSON.parse(r)
								}
							} else if (item.type == 6) {
								item.src = item.content
								if (typeof item.content === 'string') { 
									item.content = JSON.parse(item.content)
								}
							} else if (item.type == 5) {
								if (typeof item.content === 'string') {
									item.content = JSON.parse(item.content)
								}
							} else if (item.type == 9) {

							} else if (item.type == 8) {
								let r
								if (typeof item.content === 'string') {
									r = item.content.substr(0, item.content.length - 1).replace('[&*', '')
									item.content = JSON.parse(r)
								}
							} else if (item.type == 11) {
								if (typeof item.content === 'string') {
									item.content = JSON.parse(item.content)
								}
							} else {
								item.content = JSON.parse(item.content)
							}
						} catch (err) {
							console.log('错误信息', err, item, type);
						}
					}
				})
				return list
			},
			// 获取聊天记录内容
			async getChatHistory(types) {
				if (types !== 'reconnect') {
					this.chatParams.showload = true
					this.chatParams.loaded = false
				}
				const params = {
					firstSendUid: this.roomInfo.firstSendUid,
					firstSendUuidType: this.roomInfo.firstSendUidType,
					page: this.chatParams.page,
					pageSize: this.chatParams.pageSize,
					platform: this.serviceInfo.platform,
					roomId: this.roomId,
					sendTime: this.chatParams.page === 1 ? 0 : this.chatHistory[0].sendTime,
					uType: this.serviceInfo.uType,
					uid: this.serviceInfo.id
				}
				// 重连的数据进行校验数据对比替换
				if (types === 'reconnect') {
					params.page = 1
					params.sendTime = 0
				}
				let res = {
					data: {
						code: 200,
						data: {
							list: []
						}
					}
				}
				// 历史模式直接在历史数据取值
				if (this.recordHistory.length) {
					if (this.chatParams.page === 1) {
						this.chatHistory = []
					}
					res.data.data.list = this.recordHistory.slice(this.chatParams.pageSize * (this.chatParams.page -
						1), this.chatParams.page * this.chatParams.pageSize)
				} else {
					res = await chat.getRoomChatHistory(params).catch(err => {
						if (types !== 'reconnect') {
							this.chatParams.showload = false
							this.chatParams.firstLoad = false
						}
					})
				}
				// 根据数据来源不同处理内容
				if (types === 'reconnect') {
					if (res.data.code === 200) {
						let list = this.dataHandler(res.data.data.list).reverse()
						const chatHistory = this.filterHistorySameData('seq', [...this.chatHistory, ...list])
						this.chatHistory = this.filterHistorySameData('msgId', chatHistory)
						this.sortByKey(this.chatHistory, 'sendTime')
						// 还在转圈的数据变为失败
						this.chatHistory.map(item => {
							if (item.messageState == 0) {
								item.messageState = 2
							}
						})
					}
				} else {
					this.chatParams.showload = false // 数据加载完成 不展示loading
					this.chatParams.firstLoad = false // 数据加载完成 不是第一次加载了
					if (res.data.code === 200) {
						let list = this.dataHandler(res.data.data.list).reverse()
						this.chatHistory = [...list, ...this.chatHistory] // 存起来的数据
						if (list.length < this.chatParams.pageSize) {
							this.chatParams.noMore = true
							this.chatParams.loading = 'end'
						}
						if (list.length) {
							this.scrollVisiable = false
							this.$nextTick(() => {
								setTimeout(() => {
									// mark:scroll
									let query = uni.createSelectorQuery()
									query.select('.chatList-area').boundingClientRect()
									query.select('.chatBox-list').boundingClientRect()
									query.exec(data => {
										// - uni.upx2px(70)
										this.scrollTop = data[0].height - this
											.scrollHeight
										this.scrollHeight = data[0].height
										this.scrollInner = data[1].height
										this.scrollVisiable = true
										this.chatParams.loaded = true
									})
								}, 300) // 因为ios的回弹效果，设置300毫秒延迟获取高度
							})
						}
					}
				}
			},
			async checkChatHistory() {
				const loadSuccess = true // 是否正常读取服务端历史数据
				const history = uni.getStorageSync('CHATHISTORYDATA')
				let minTime = '0'
				let maxTime = '0'
				let recordHistory = []
				if (history && history.length) {
					const findIndex = history.findIndex(item => item.roomId === this.roomId)
					if (findIndex !== -1) {
						recordHistory = history[findIndex].record
						this.chatHistory = this.dataHandler(recordHistory.slice(0, 20)).reverse()
						this.chatScroll2Bottom('scroll')
						minTime = history[findIndex].record[0].sendTime
					}
				}
				// 进来界面直接服务端拉取全部的历史记录直接
				const params = {
					uid: this.serviceInfo.id,
					uType: this.serviceInfo.uType,
					platform: this.serviceInfo.platform,
					roomId: this.roomId,
					minTime: minTime,
					maxTime: '0'
				}
				const res = await chat.getRoomChatHistoryCount(params)
				const total = res.data.code === 200 && res.data.data.total ? res.data.data.total : 0
				let roomRecord = {
					roomId: this.roomId,
					record: []
				}
				// 如果中间有相应缺失数据，就把这些数据给请求回来，然后合并到历史记录中
				console.log(`新的数据总共${total}条`);
				if (total && total !== 1) {
					const params_list = {
						firstSendUid: this.roomInfo.firstSendUid,
						firstSendUuidType: this.roomInfo.firstSendUidType,
						page: 1,
						pageSize: total,
						platform: this.serviceInfo.platform,
						roomId: this.roomId,
						sendTime: '0',
						uType: this.serviceInfo.uType,
						uid: this.serviceInfo.id
					}
					const res_list = await chat.getRoomChatHistory(params_list)
					if (res_list.data.code === 200) {
						// 缺失的数据和历史数据组合到一起
						roomRecord.record = this.filterHistorySameData('sendTime', [...res_list.data.data.list, ...recordHistory])
						this.updateChatHistory(roomRecord)
						this.recordHistory = roomRecord.record
					}
				} else {
					// 走老的那一套 请求服务数据
					this.recordHistory = recordHistory
				}
			},
			// 基础页面宽高配置
			initChatAreaHeight() {
				const _this = this
				const height = uni.getSystemInfoSync().safeArea.height
				this.$nextTick(() => {
					let stastuBarHeight = this.$store.state.deviceInfo.statusBarHeight
					// 获取页面的box基础信息
					const query = uni.createSelectorQuery().in(this)
					query.select('.header').boundingClientRect()
					query.select('.chatInput').boundingClientRect()
					query.exec(data => {
						this.navHeight = data[0].height
						this.inputHeight = data[1].height
					})
				})
			},

			// 编辑器focus时触发
			onEditorFocus(e) {
				this.chatScroll2Bottom()
				// this.emojiStatus = false
				const query = uni.createSelectorQuery().in(this)
				query.select('.chatInput').boundingClientRect()
				query.exec(data => {
					this.inputHeight = data[0].height
				})
				this.keyboardHeight = uni.getStorageSync('DEVICEINFO').keyboardHeight;
			},

			// 编辑器blur时触发
			onEditorBlur() {
				this.keyboardHeight = 0
			},
			closeEmoji() {
				this.emojiStatus = false
			},
			// textarea输入内容
			inputing(e) {
				// console.log('eeeee', this.textMsg)
				const query = uni.createSelectorQuery().in(this)
				query.select('.chatInput').boundingClientRect()
				query.exec(data => {
					this.inputHeight = data[0].height
				})
				uni.getSystemInfo({
					success(res) {
						console.log('res:', res)
					}
				})
			},
			// 编辑器内容改变时触发
			onEditorChange(type) {
				const _this = this
				this.editorCtx.getContents({
					success: function(data) {
						_this.sendContext = data.html
					}
				})
			},
			// 编辑器初始化完成时触发
			onEditorReady() {
				uni.createSelectorQuery().select('#editor').context((res) => {
					this.editorCtx = res.context
				}).exec()
			},

			// 选择文件
			upLoadFile() {
				const _this = this
				uni.chooseFile({
					count: 1,
					type: 'all',
					success(res) {
						const uuid = guid()
						let fileMsg = {}
						res.tempFiles.map(item => {
							console.log('图片信息', item);
							fileMsg.msg = `[&*${uuid}]`,
								fileMsg.type = 'file',
								fileMsg.fileName = item.name,
								fileMsg.blobUrl = item.path
						})
						_this.sendMsg([fileMsg])
					}
				})
			},

			// 选择图片
			upLoadImg() {
				const _this = this
				const promiseList = []
				uni.chooseImage({
					count: 1,
					success: function(res) {
						const serviceInfo = _this.$store.state.login.setServiceInfo
						_this.sendMsgParams.seq = (Math.random() * 1000000).toString().replace('.', '')
						_this.sendMsgParams.data.siteId = _this.$store.state.chat.roomInfo.siteId
						_this.sendMsgParams.action = 'sendmsg'

						res.tempFiles.map((item, index) => {
							const uuid = guid()
							// 本地上传成功后，处理发送格式，直接发送
							const nameIndex = item.path.lastIndexOf('/')
							const itemImgObj = {
								msg: `[&*${uuid}]`,
								blobSrc: item.path,
								fileName: item.name || item.path.slice(nameIndex + 1),
								type: 'img'
							}
							promiseList[index] = itemImgObj
						})


						const timestamp = new Date().getTime() + ''

						_this.sendMsgParams.data.username = serviceInfo.userName
						_this.sendMsgParams.data.avatar = serviceInfo.avatar

						_this.$store.commit('chat/SET_LASTREPLYTIME', timestamp)
						_this.sendMsgParams.data.roomId = _this.$store.state.chat.roomInfo.roomId
						_this.sendMsgParams.data.clientId = _this.$store.state.clientId

						_this.sendMsgParams.data.message = JSON.stringify(promiseList)
						_this.sendMsgParams.data.msgType = 'newstext'

						let sendMsg = {
							seq: _this.sendMsgParams.seq,
							content: promiseList,
							roomId: _this.sendMsgParams.data.roomId,
							status: 1,
							createAt: '',
							isNote: false,
							msgId: (Math.random() * 1000000).toString().replace('.', ''),
							sendTime: new Date().getTime(),
							type: _this.msgType[_this.sendMsgParams.data.msgType],
							updateAt: '',
							allocationUid: serviceInfo.id,
							alloucationName: serviceInfo.userName,
							senderUid: serviceInfo.id,
							senderUidType: serviceInfo.uType,
							isVisible: true,
							src: '',
							// 0 转圈，1 成功， 2 失败
							messageState: 0,
							blob: true,
							isNewChatHistory: true
						}
						// 发送至消息展示窗口
						_this.chatHistory.push(sendMsg)
						_this.chatScroll2Bottom()
						const uploadList = []
						// 上传阿里云
						promiseList.forEach((item, index) => {
							const uploadData = {}
							uploadList[index] = new Promise((resolve, reject) => {
								const params = {
									location: item.blobSrc,
									url: [item.blobSrc],
									name: item.fileName,
									type: 'chat',
									seq: sendMsg.seq // 用来作为唯一值来进行上传进度处理
								}
								_this.uploadImg(params).then(([res, key]) => {
									uploadData.msg = item.msg
									uploadData.ossUrl = key
									uploadData.type = 'img'
									uploadData.blobSrc = item.blobSrc
									resolve(uploadData)
								}).catch(err => {
									_this.chatHistory[_this.chatHistory.length - 1]
										.messageState = 2
								})
							})
						})

						Promise.all(uploadList).then(res => {
							_this.sendMsgParams.data.message = JSON.stringify(res)
							_this.send(JSON.stringify(_this.sendMsgParams))
						}).catch(e => {
							// this.$bus.$emit('toChatArea', {}, e.seq)
						})

					}
				})
			},

			// 选择表情
			pickEmoji() {
				// this.emojiStatus = !this.emojiStatus
				const query = uni.createSelectorQuery().in(this)
				query.select('.chatInput').boundingClientRect()
				query.exec(data => {
					this.inputHeight = data[0].height
				})
				setTimeout(() => {
					this.emojiStatus = !this.emojiStatus
				}, 100);
			},

			// 插入表情
			insertEmoji(item) {
				const _this = this
				this.textMsg += item
			},
			// 发送评论组件
			sendTyping() {
				this.sendMsgParams.seq = (Math.random() * 1000000).toString().replace('.', '')
				// 如果是真正关闭的会话窗口不允许发送消息
				this.sendMsgParams.data.msgType = this.msgType[7]
				this.sendMsgParams.data.message = '[&*' + JSON.stringify(this.$store.state.ratingInfo) + ']'
				this.sendMsgParams.data.clientId = this.$store.state.clientId
				this.sendMsgParams.data.roomId = this.$store.state.chat.roomInfo.roomId
				this.send(JSON.stringify(this.sendMsgParams))
				const toAreaParams = {
					seq: this.sendMsgParams.seq,
					content: this.$store.state.ratingInfo,
					roomId: this.sendMsgParams.data.roomId,
					status: 1,
					createAt: '',
					isNote: false,
					msgId: (Math.random() * 1000000).toString().replace('.', ''),
					sendTime: new Date().getTime(),
					type: this.msgType[this.sendMsgParams.data.msgType],
					updateAt: '',
					allocationUid: this.$store.state.login.setServiceInfo.id,
					alloucationName: this.$store.state.login.setServiceInfo.userName,
					senderUid: this.$store.state.login.setServiceInfo.id,
					senderUidType: this.$store.state.login.setServiceInfo.uType,
					isVisible: true,
					src: '',
					// 0 转圈，1 成功， 2 失败
					messageState: 0
				}
				// this.chatHistory.push(toAreaParams)
				this.chatScroll2Bottom()
				this.sendMsgParams.seq = ''
				this.serviceInfoAvatar = this.$store.state.login.setServiceInfo.avatar
			},

			// 获取输入框发送内容, 消息处理，按指定格式发送
			getEditorContent() {
				// const promiseList = []
				let content = ''
				this.editorCtx.getContents({
					success: function(data) {
						data.delta.ops.map((item, index) => {
							const itemData = {}
							if (item.attributes && item.attributes.class === 'insertImage') { //图片
								content += '`' + item.attributes.alt + '`'
							} else if (item.attributes && item.attributes.class.includes('emoji')) {
								content += item.attributes.alt
							} else {
								content += item.insert
							}
						})
					}
				})
				return content
			},

			// 消息发送
			sendMsg() {
				let content = ''

				// 禁止发送空白消息
				if (this.textMsg.trim().length === 0) {
					this.textMsg = ''
					return
				}

				const timestamp = new Date().getTime() + ''

				const serviceInfo = this.$store.state.login.setServiceInfo
				this.sendMsgParams.seq = (Math.random() * 1000000).toString().replace('.', '')
				this.sendMsgParams.data.siteId = this.$store.state.chat.roomInfo.siteId
				this.sendMsgParams.action = 'sendmsg'

				const sendList = this.textMsg.trim().split('`')
				const callReg = /\[&@(\d+)\]/gi
				const emojiReg = /\[&(\d+)\]/gi
				const imgReg = /\[&(.?)\*((\w|-)+)\]/gi
				const fileReg = /\[&&\*((\w|-)+)\]/gi
				const promiseList = []
				sendList.forEach((item, index) => {
					const itemData = {}
					itemData.msg = item
					if (callReg.test(item)) { // @内容
						itemData.type = 'text'
					} else if (emojiReg.test(item)) { // 表情
						itemData.type = 'text'
					} else if (fileReg.test(item)) { // 附件
						const file = getFileByAlt(item, loadFiles || this.$refs.divTextarea
							.filesObj).file
						itemData.fileName = file.name
						itemData.type = 'file'
					} else if (imgReg.test(item)) { // 图片
						const file = getFileByAlt(item, _this.fileObj)
						itemData.type = 'img'
						itemData.blobSrc = file.blob
						itemData.fileName = file.file
					} else {
						itemData.type = 'text'
					}
					promiseList[index] = itemData
				})

				this.sendMsgParams.data.username = serviceInfo.userName
				this.sendMsgParams.data.avatar = serviceInfo.avatar

				this.$store.commit('chat/SET_LASTREPLYTIME', timestamp)
				this.sendMsgParams.data.roomId = this.$store.state.chat.roomInfo.roomId
				this.sendMsgParams.data.clientId = this.$store.state.clientId

				this.sendMsgParams.data.message = JSON.stringify(promiseList)
				this.sendMsgParams.data.msgType = 'newstext'


				let sendMsg = {
					seq: this.sendMsgParams.seq,
					content: promiseList,
					roomId: this.sendMsgParams.data.roomId,
					status: 1,
					createAt: '',
					isNote: false,
					msgId: (Math.random() * 1000000).toString().replace('.', ''),
					sendTime: new Date().getTime(),
					type: this.msgType[this.sendMsgParams.data.msgType],
					updateAt: '',
					allocationUid: serviceInfo.id,
					alloucationName: serviceInfo.userName,
					senderUid: serviceInfo.id,
					senderUidType: serviceInfo.uType,
					isVisible: true,
					src: '',
					// 0 转圈，1 成功， 2 失败
					messageState: 0,
					blob: true,
					isNewChatHistory: true
				}


				this.chatHistory.push(sendMsg)
				this.chatScroll2Bottom()

				this.send(JSON.stringify(this.sendMsgParams))

				this.textMsg = ''
			},
		},
		beforeDestroy() {
			// 隐藏键盘
			uni.hideKeyboard()
			uni.offKeyboardHeightChange(res => {})
		}
	}
</script>

<style lang="scss" scoped>
	.header {
		box-shadow: 0px 1px 0px 0px rgba(0, 0, 0, 0.02);
	}

	:root {}

	.chatArea {
		// height: 100vh;
		display: flex;
		flex-direction: column;

		.chatListItem {
			margin-top: 42upx;
		}

		.chat-more {
			width: 16upx;
			height: 30upx;
		}

		.chatArea-content {
			display: flex;
			flex-direction: column;
			position: relative;

			.chatBox {
				position: relative;
				background: #F8F8F8;

				.chatList-area {
					// padding: 0 0 32upx;
				}
			}

			.chatInput {
				width: 100vw;
				position: fixed;
				left: 0;
				bottom: 0;
				z-index: 1;
				background: #fff;
				border-top: 1upx solid rgba(0, 0, 0, 0.0800);
				transition: height 0.2s ease;
				// padding-bottom: constant(safe-area-inset-bottom);
				// padding-bottom: env(safe-area-inset-bottom);

				.inputBox {
					padding: 29upx 32upx;
					box-sizing: border-box;

					#editor {
						min-height: 42upx;
						max-height: 200upx;
						box-sizing: border-box;
						overflow: auto;
						height: initial;
					}

					#textarea {
						min-height: 42upx;
						max-height: 200upx;
						box-sizing: border-box;
						overflow: auto;
						height: initial;
						font-family: Segoe UI Emoji;
						font-size: $font-size-lg;
					}
				}

				.inputHandler {
					padding: 30upx 32upx;
					display: flex;

					.inputHandler-quick {
						flex: 1;
						display: flex;

						&>view {
							margin-right: 42upx;
							width: 40upx;
							height: 40upx;
						}
					}

					.sendMsg {
						width: 40upx;
						height: 40upx;
					}
				}
			}
		}
	}

	/deep/ .emoji {
		width: 22px;
		height: 22px;
		margin: 2upx 2upx 0upx;
		border-radius: initial !important;
		vertical-align: middle;
		background-size: 100% !important;
		background-image: url('@/assets/emojiLib/emojiLibs.png');
		background-repeat: no-repeat;
	}

	.time-lag {
		padding: 42upx 0;
		font-size: 24upx;
		color: rgba(#000, 0.6);
		text-align: center;
	}

	::v-deep .navBar {
		.navBarBox {
			.content {
				/*强制文字在一行文本框内*/
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}
	}

	.chatBox-list {
		position: relative;
		transition: all .3s;
	}

	.chat-list-item {
		&:last-child {
			padding-bottom: 32upx;
		}
	}

	::v-deep .navBarBox {
		border-bottom: 1upx solid rgba(0, 0, 0, 0.0800);
	}
</style>
