<template>
	<view class="chat">
		<!-- 头部内容 -->
		<view-navbar class="nav-box" dbclick>
			<template slot="left">
				<view class="example-body">
					<!-- 显示出来的all文本 -->
					<view class="top_left" @click="showModule('showLeft')">
						<image src="/static/all.svg" mode="aspectFit" lazy-load></image>
						<!-- <text>{{i18n[left_mes]}}</text> -->
					</view>
				</view>
			</template>
			<template slot="text">
				<!-- <view class="top_center" @click="maskTouchend"> -->
				<view class="top_center" @click.stop="showModule('popup','top')">
					<text>{{i18n[top_center]}}</text>
					<!-- <text v-if="inboxList[left_mes][top_center] != undefined">({{inboxList[left_mes][top_center]}})</text> -->
					<image :src="!type['popup'].isShow ? '/static/arrow_bottom.svg' : '/static/arrow_top.svg'"
						mode="aspectFit" lazy-load>
					</image>
				</view>
			</template>
		</view-navbar>
		<!-- 列表内容 -->
		<!-- <scroll-view scroll-y="true" class="scroll-chat" v-if="renderList.length" :show-scrollbar="false"
			:style="{ 'height': `calc(100vh - ${navHeight})`, 'marginTop': `${navHeight}px` }">
			
		</scroll-view> -->
		<reconnectStatus v-if="reconnectStatus"></reconnectStatus>
		<view class="scroll-chat" v-if="renderList.length" :style="{ 'height': `calc(100vh - ${navHeight})` }">
			<view class="chat-box">
				<chatItem :dataList="renderList" :serviceList="ServiceList"></chatItem>
				<loading v-if="chatParams.showload" :status="chatParams.loading" endText="It's the end~"></loading>
			</view>
		</view>

		<!-- v-if="!renderList.length && !chatParams.firstLoad" -->
		<empty text="No conversations found." v-if="!chatParams.firstLoad && !renderList.length"></empty>
		<!-- 顶部弹窗 -->
		<uni-popup ref="popup" background-color="#fff" @change="popupChange($event)">
			<view class="popup_content" :style="{'marginTop': `${navHeight}px`}">
				<view v-for="(item,key,i) in inboxList[left_mes]" :key='i'
					@click="changeShow('CHANGE_TOP','top_center','popup',key)">
					<list :class="key == top_center? 'imageFocus' : ''"
						:iconSrc='key == top_center? `/static/chat/${key}1.svg` : `/static/chat/${key}.svg`'
						:title="i18n[key]" :rightText="item.toString()" v-if="typeList.indexOf(key) != -1"></list>
				</view>
			</view>

		</uni-popup>
		<!-- 点击左上角图标文字才出现的组件 -->
		<uni-drawer ref="showLeft" mode="left">
			<!-- 顶部的关闭 -->
			<view class="close" :style="{marginTop:$store.state.deviceInfo.statusBarHeight+'px'}">
				<view class="top_inbox">
					<text>{{i18n.inbox}}</text>
					<image @click="closeModule('showLeft')" src="/static/guanbi.svg" mode="aspectFit">
					</image>
				</view>
				<!-- 组件内容 -->
				<view v-for="(item,key,i) in inboxList" :key="i"
					@click="changeShow('CHANGE_LEFT_MES','left_mes','showLeft',key)">
					<list :class="key == left_mes? 'imageFocus' : ''" :title="i18n[key]"
						:rightText="item.total.toString()" isShowRightArrow></list>
				</view>
			</view>
		</uni-drawer>
		<view-tabbar :current="0" ref="tabBar"></view-tabbar>
	</view>
</template>

<script>
	// components
	import Tabbar from '@/components/tabBar/tabBar.vue'
	import chatItem from './comps/chatItem.vue'
	import list from '@/components/list/list.vue'
	import loading from '@/components/loading/loading.vue'
	import empty from '@/components/emptyBox/emptyBox.vue'
	import reconnectStatus from '@/components/reconnectStatus/reconnectStatus.vue'
	// public methods 
	import chat from '@/api/chat.js'
	import faq from '@/api/faq.js'
	// modules
	import S from '@/network/socket.js'
	import uniPopup from '@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue'
	import {
		mapGetters,
		mapMutations
	} from 'vuex'

	export default {
		components: {
			'view-tabbar': Tabbar,
			chatItem,
			list,
			loading,
			empty,
			reconnectStatus,
			uniPopup
		},
		data() {
			return {
				top_center: this.$store.state.chat.top_center,
				left_mes: this.$store.state.chat.left_mes,
				selectStatus: 1,
				// dis: false,
				type: {
					popup: {
						name: 'popup',
						isShow: false,
					},
					showLeft: {
						name: 'showLeft',
						isShow: false
					}
				},
				// barHeight: 1, //获取手机状态栏的高度
				// defaultIndex:[0,0]
				typeList: ['Open', 'Pending', 'Closed'],
				inboxList: {
					all: {
						total: 0
					},
					mention: {
						total: 0
					},
					assigned: {
						total: 0
					},
					unassigned: {
						total: 0
					},
				},
				imRoomParams: {}, // 房间请求参数信息
				ServiceListParam: {}, // 坐席请求参数
				chatParams: {
					noMore: false, // 是否还有更多数据
					loading: 'loading', // 是否加载更多数据
					loaded: true, // 是否加载完正在请求的数据
					showload: false, // 是否展示正在加载
					firstLoad: true, // 是否是首次加载数据
				}, // 聊天记录配置
				chatList: [], // 聊天列表内容数据
				ServiceList: [],
				navHeight: 44, // 头部高度
				socket: null,
				innerAudioContext: null,
				reconnecting: false, // 重连状态
				touchNum: 0
			}
		},
		onShow() {
			uni.hideTabBar({
				animation: false
			})
			// 当修改信息成功时，值为1，回到chat页面就会获取聊天列表的数据内容
			// if (this.$store.state.SETTING_NUM == 1) {
			// 	this.getChatList()
			// 	this.$store.commit('change_setting', 0)
			// }
			if (this.serviceInfo.change_setting == 1) {
				this.getChatList()
				this.serviceInfo.change_setting = 0
			}

			this.getImRoomCount()
		},
		// 页面加载完成
		async onLoad() {
			if (!this.serviceInfo.IsLogin) {
				uni.redirectTo({
					url: '/pages/login/login'
				});
			} else {
				this.initDefaultData() // 默认配置信息
				await this.getServiceList() // 获取坐席列表信息
				this.getChatList() // 获取聊天列表的数据内容
				this.$nextTick(() => {
					this.initBox()
					this.SOCKET() // 打开socket连接
				})
			}
		},
		onPullDownRefresh() {
			this.getImRoomCount();
			this.initDefaultData() // 默认配置信息
			this.getChatList() // 获取聊天列表的数据内容
			// 部分机型下拉刷新不关闭刷新，需要增加定时器关闭下拉刷新
			setTimeout(() => {
				uni.stopPullDownRefresh()
			}, 3000)
		},
		onReachBottom() {
			// 如果没有更多数据且不是正在加载的状态则不再触发加载更多
			if (this.chatParams.noMore && this.chatParams.loaded) {
				return
			} else {
				this.imRoomParams.page++
				this.getChatList()
			}
		},
		created() {
			// 调用api 为了获取手机状态栏的 高度
			// this.getSysteminfo();
			this.getImRoomCount();
			this.getRatingInfo()
			// 设置语音
			this.innerAudioContext = uni.createInnerAudioContext();
			this.innerAudioContext.src = 'https://img.willdesk.com/default/uniapp/ding.wav';
		},
		computed: {
			...mapGetters({
				topSelect: 'chat/top_center',
				leftSelect: 'chat/left_mes',
				message: 'socket/message',
				socketUpdate: 'socket/socketUpdate',
				reconnectStatus: 'socket/reconnectStatus',
				serviceInfo: 'login/serviceInfo'
			}),
			// 渲染的聊天信息列表
			renderList() {
				return this.chatList.filter(item => item.status === this.selectStatus)
			},
			i18n() {
				return this.$t('chat')
			},
		},
		watch: {
			reconnectStatus(status) {
				this.reconnecting = status
			},
			topSelect(newVal) {
				this.top_center = newVal
				this.initDefaultData()
				this.getChatList()
			},
			leftSelect(newVal) {
				this.left_mes = newVal
				this.initDefaultData()
				this.getChatList()
			},
			// 新消息语音提醒
			message(newVal) {
				// try {
				// 	this.innerAudioContext.play()
				// } catch (err) {}
			},
			// 新消息处理
			socketUpdate(newValue) {
				const data = this.$store.state.socket.socketUpdateData
				if (data.imReocrdInfo.senderUidType === 1) {
					this.innerAudioContext.play()
				}
				const roomId = data.imRoomInfo.roomId
				const result = this.chatList.filter(item => item.roomId === roomId)
				if (result.length === 0) {
					this.createRoom(data)
				} else {
					// 把改变的数据放到首位
					const findRoomIndex = this.chatList.findIndex(item => {
						return item.roomId === data.imRoomInfo.roomId
					})
					if (findRoomIndex != -1) {
						var findItem = this.chatList.splice(findRoomIndex, 1)
						findItem[0].status = data.imRoomInfo.status
						findItem[0].lastMsgContext = data.imRoomInfo.lastMsgContext
						findItem[0].lastMsgType = data.imRoomInfo.lastMsgType
						findItem[0].checked = false
						findItem[0].lastMsgTime = this.timeRule(data.imReocrdInfo.sendTime)
						this.chatList = [...findItem, ...this.chatList]
					}
				}
				// 操作更新需要重新获取消息数量
				if (data.action === 'operate') {
					this.getImRoomCount()
				}
				//消息列表有变化调用tababr的方法计算未回复数量
				this.$refs.tabBar.tabbarNum()
				// 对蓝点的显示做判断 
				if (!data.imRoomInfo.isMsgReply) {
					//  当c端发消息来时，
					this.chatList.forEach(item => {
						if (item.roomId == data.imRoomInfo.roomId) {
							//  对应的会话 显示未回复，显示蓝点，
							item.isMsgReply = false
						}
					})
				} else {
					// 当b端发送时
					this.chatList.forEach(item => {
						if (item.roomId == data.imRoomInfo.roomId) {
							// 对应的会话 显示回复， 不显示蓝点
							item.isMsgReply = true
							// 如果是新的c端发来的消息  回复后重新获取一下
							if (item.allocationAvatar == '') {
								this.getChatList()
							}
						}
					})
				}
				// console.log('???',data);
				this.sortByKey(this.chatList, 'sendTime')
			}
		},
		methods: {
			...mapMutations({
				SOCKET: 'socket/store_active_socket',
				setCsListMap: 'chat/SET_CSLISTMAP'
			}),
			maskTouchend() {
				this.touchNum++
				setTimeout(() => {
					if (this.touchNum == 1) {
						console.log('单击')
						this.showModule('popup', 'top')
					}
					if (this.touchNum >= 2) {
						console.log('双击')
						uni.pageScrollTo({
							scrollTop: 0,
							duration: 300
						})
					}
					this.touchNum = 0
				}, 250)
			},
			sortByKey(array, key) {
				return array.sort(function(a, b) {
					a = Number(a)
					b = Number(b)
					var x = a[key]
					var y = b[key]
					return ((x < y) ? -1 : ((x > y) ? 1 : 0))
				})
			},
			async createRoom(data) {
				// const customerOldLength = this.chatList.length * 1
				// const csListMap = this.$store.state.chat.csListMap
				// const record = data.imReocrdInfo
				// if (!csListMap.get(info.siteId)) {
				// 	this.csListParams.siteId = info.siteId
				// 	await this.newGetCustomerServiceListApi(this.csListParams).then(res => {
				// 		csListMap.set(info.siteId, res.data.data)
				// 		this.$store.commit('setCsListMap', csListMap)
				// 	})
				// }
				const info = data.imRoomInfo
				if (info.allocationUid === '0' || info.allocationUid === '') {
					info.allocationName = 'Unassigned'
					info.allocationAvatar = ''
				}
				const roomParams = {
					checked: false,
					id: info.id,
					message: data.imReocrdInfo.content,
					lastMsgContext: info.lastMsgContext,
					lastMsgTime: this.timeRule(info.lastMsgTime),
					lastMsgType: info.lastMsgType,
					processedTime: this.timeRule(info.lastMsgTime),
					status: info.status,
					read: info.IsRead,
					isMark: info.isMark,
					svg: 'c-3-chat',
					time: info.lastMsgTime,
					roomId: info.roomId,
					firstSendUid: info.firstSendUid,
					firstSendUidType: info.firstSendUidType,
					siteId: info.siteId,
					firstSendName: info.firstSendName,
					firstSendProfile: info.firstSendProfile ? '' : '',
					allocationAvatar: info.allocationAvatar,
					allocationName: info.allocationName,
					allocationUid: '0'
				}
				this.chatList.unshift(roomParams)
			},
			// 配置页面的基础信息
			initBox() {
				let stastuBarHeight = this.$store.state.deviceInfo.statusBarHeight
				// 获取页面的box基础信息
				const query = uni.createSelectorQuery().in(this)
				const select = query.select('.nav-box')
				select.boundingClientRect(data => {
					// this.navHeight = stastuBarHeight + data.height
					this.navHeight = data.height
				}).exec()
			},
			/**
			 * 初始化页面的基础数据
			 */
			initDefaultData() {
				this.chatList = []
				this.chatParams = {
					noMore: false, // 是否还有更多数据
					loading: 'loading', // 是否加载更多数据
					loaded: true, // 是否加载完正在请求的数据
					showload: false, // 是否展示正在加载
					firstLoad: true // 是否第一次加载
				}
				let status
				let leftStatus
				switch (this.top_center) {
					case 'Open':
						status = 1
						break
					case 'Pending':
						status = 2
						break
					case 'Closed':
						status = 3
						break
					default:
						status = 1
						break
				}
				this.selectStatus = status
				leftStatus = this.left_mes
				this.imRoomParams = {
					uid: this.$store.state.login.setServiceInfo.id,
					uType: this.$store.state.login.setServiceInfo.uType,
					platform: this.$store.state.login.setServiceInfo.platform,
					siteIds: this.$store.state.login.setServiceInfo.siteIds,
					status: status,
					sortName: leftStatus,
					page: 1,
					pageSize: 20,
					keyword: ''
				}
				this.ServiceListParam = {
					uid: this.$store.state.login.setServiceInfo.id + '',
					uType: this.$store.state.login.setServiceInfo.uType,
					platform: this.$store.state.login.setServiceInfo.platform,
					siteId: this.$store.state.login.setServiceInfo.shopId + '',
				}
			},
			/**
			 * 获取聊天信息内容
			 */
			getChatList() {
				this.chatParams.showload = true
				this.chatParams.loaded = false
				// 房间聊天数据内容
				chat.getImRoomList(this.imRoomParams).then(res => {
					// console.log('聊天内容', res.data.data);
					this.chatParams.loaded = true
					if (res.data.code === 200) {
						let list = res.data.data.list
						list.forEach(item => {
							item.lastMsgTime = this.timeRule(item.lastMsgTime)
						})
						if (this.imRoomParams.page === 1) {
							this.chatList = list
							uni.pageScrollTo({
								scrollTop: 0,
								duration: 200
							})
						} else {
							this.chatList = [...this.chatList, ...list]
						}
						// 没有更多数据了
						if (list.length < this.imRoomParams.pageSize) {
							this.chatParams.noMore = true
							this.chatParams.loading = 'end'
						}
					} else {
						this.$tips.toast(res.data.message)
					}
					this.chatParams.firstLoad = false
				}).catch(err => {
					this.chatParams.loaded = true
					this.chatParams.firstLoad = false
				})
			},
			/**
			 * 滚动数据触底
			 */
			chatScrollBottom() {
				console.log('触底');
			},
			getServiceList() {
				// 房间的坐席数据
				chat.getCustomerServiceList(this.ServiceListParam).then(res => {
					// console.log('坐席信息', res);
					this.ServiceList = res.data.data
					this.setCsListMap({
						ShopId: this.ServiceListParam.siteId,
						data: this.ServiceList
					})
				})
			},
			// 时间展示规则
			timeRule(t) {
				var nowTime = this.$moment(new Date())
				var time = this.$moment(parseInt(t))

				// const num = time.month()
				// const month = Object.keys(this.i18n.month)[num]
				if (nowTime.year() == time.year()) {
					if (nowTime.date() == time.date()) {
						// 今天展示规则
						return time.format('HH:mm')
					} else {
						// 今年非今天的展示规则
						// const lang = this.$store.state.deviceInfo.language
						// const arr = ['zh-CN', 'zh-Hans-CN', 'zh-TW', 'zh-Hant-CN']
						// if (arr.includes(lang)) {
						// 	return time.format(this.i18n.month[month] + 'D')
						// } else {
						// 	return time.format(this.i18n.month[month] + ',D')
						// }
						return time.format('MMM,D')
					}
				} else {
					// 往年展示规则
					return time.format('y,MMM,D')
				}
			},
			// 获取会话数量
			async getImRoomCount() {
				const param = {
					uid: this.$store.state.login.setServiceInfo.id,
					uType: this.$store.state.login.setServiceInfo.uType,
					platform: this.$store.state.login.setServiceInfo.platform,
					siteIds: this.$store.state.login.setServiceInfo.siteIds
				}

				const {
					data: res
				} = await chat.newImRoomCount(param)

				for (var i in res.data) {
					for (var j in res.data[i]) {
						if (j == 'openCount') {
							res.data[i]['Open'] = res.data[i][j]
							delete res.data[i]['openCount']
						}
						if (j == 'closeCount') {
							res.data[i]['Closed'] = res.data[i][j]
							delete res.data[i]['closeCount']
						}
						if (j == 'waitCount') {
							res.data[i]['Pending'] = res.data[i][j]
							delete res.data[i]['waitCount']
						}
					}
				}
				const ren = {
					all: {},
					mention: {},
					assigned: {},
					unassigned: {}
				}
				this.inboxList = {
					...ren,
					...res.data
				}
				// 停止下拉样式
				uni.stopPullDownRefresh()
			},
			// 打开组件
			showModule(e, direction = '') {
				this.type[e].isShow = !this.type[e].isShow
				if (this.type[e].isShow) {
					if (e == 'showLeft') {
						this.closeModule('popup')
					} else {
						this.closeModule('showLeft')
					}
					this.$refs[e].open(direction)
				} else {
					this.$refs[e].close()
				}
			},
			// 关闭组件
			closeModule(type) {
				this.type[type].isShow = false
				this.$refs[type].close()
			},
			popupChange(e) {
				this.type['popup'].isShow = e.show
				this.closeModule('showLeft')
			},
			// 变化顶部抽屉/菜单显示
			changeShow(commitModules, params, type, val) {
				// if (val == 'Closed') {
				// 	val = 'Close'
				// }
				this.$store.commit(`chat/${commitModules}`, val)
				this[params] = this.$store.state.chat[params]
				this.closeModule(type)
			},
			// 发起请求获取评论组件相关信息
			getRatingInfo() {
				console.log('发起请求获取评论组件相关信息')
				// 查询数据
				faq.GetReviewConfiguration().then((res) => {
					if (res.data.Code === 200) {
						const ratingInfo = {}
						ratingInfo.primaryColor = res.data.PrimaryColor
						ratingInfo.askSendReview = res.data.Configuration[0].AskSendReview
						ratingInfo.autoSendReview = res.data.Configuration[0].AutoSendReview
						ratingInfo.content = res.data.Configuration[0].ReviewContent
						ratingInfo.title = res.data.Configuration[0].ReviewTitle
						ratingInfo.startReview = JSON.parse(res.data.Configuration[0].StartReviews)
						ratingInfo.thumbsReview = JSON.parse(res.data.Configuration[0].ThumbsReviews)
						ratingInfo.reviewChoose = res.data.Configuration[0].ReviewChoose
						// 存储信息至vuex中
						this.$store.commit('SET_RATINGINFO', ratingInfo)
					}
				}).catch(err => {
					console.log(err)
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.bg {
		position: absolute;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.5);
		z-index: 9;
	}

	.center_ {
		background-color: #fff;
		padding: 10upx 0upx;
		border-radius: 0px 0px 16upx 16upx;
	}

	.close {
		// margin-top: 112upx;

		.top_inbox {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 24upx 32upx;

			text {
				height: $font-size-lg + 8upx;
				font-size: $font-size-lg;
				font-family: SF-Pro;
				font-weight: bold;
				color: #000;
				line-height: $font-size-lg + 8upx;
			}

			image {
				width: 30upx;
				height: 30upx;
			}
		}

		::v-deep .list {
			.rightText {
				text {
					font-size: $font-size-lg - 4upx !important;
				}
			}
		}
	}

	.chat {
		width: 100vw;
		height: 100vh;
		position: relative;
	}

	.top_left {
		display: flex;
		align-items: center;
		padding: 26upx 32upx;

		image {
			width: 30upx !important;
			height: 30upx !important;
		}

		text {
			max-width: 260upx;
			margin-left: 12upx;
			font-size: $font-size-lg - 8upx !important;
		}
	}

	.top_center {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 100%;
		padding: 0 32upx;

		uni-image view,
		uni-image div {
			display: none !important;
		}

		uni-image {
			margin-left: 12upx;
			width: 16upx !important;
			height: 10upx !important;
		}
	}

	.scroll-chat {
		position: relative;
	}

	.chat-box {
		padding-bottom: calc(105upx + env(safe-area-inset-bottom));
	}

	::v-deep .navBarBox {
		border-bottom: 1upx solid rgba(0, 0, 0, 0.0800);
	}

	// 弹窗 Open,Pending,Close
	::v-deep .uni-popup {
		.top {
			top: calc(var(--navHeight) + 0px);
		}

		z-index: 11 !important;

		uni-view[name="content"],
		.popup_content,
		.uni-popup__wrapper {
			// margin-top: 88upx;
			border-radius: 0px 0px 16upx 16upx !important;
		}
	}

	::v-deep .status-bar {
		position: relative;
	}

	:root {
		--navHeight: navHeight
	}
</style>
