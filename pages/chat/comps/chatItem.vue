<template>
	<view class="">
		<uni-swipe-action>
			<view class="chatItem" v-for="(item, index) in dataList" :key="index">
				<uni-swipe-action-item @change="change($event, item)">
					<view class="content-box" @tap.stop="_goChatArea(item)">
						<!-- <view class="left-box flex-row"> -->
						<!-- 用户的基础信息 -->
						<!-- 头像 -->
						<view class="userProfile">
							<defaultProfile :profile="item.firstSendAvatar" :name="item.firstSendName" :size="100"
								:fontSize="32"></defaultProfile>
							<view class="serviceProfile">
								<defaultProfile :profile="item.allocationAvatar" :name="item.allocationName" :size="36"
									:fontSize="20"></defaultProfile>
							</view>
						</view>
						<view class="chatMsg">
							<view class="chatTitle">
								<!-- 名称 -->
								<text>{{item.firstSendName}}</text>
								<!-- 最近消息 -->
								<view v-html="lastMsg(item)"></view>
							</view>
							<!-- </view> -->
							<view class="chatStatus">
								<view>
									<view class="messageDot" v-if="!item.isMsgReply"></view>
									<text
										:style="{color: !item.isMsgReply ? '' : 'rgba(0, 0, 0, 0.6)'}">{{item.lastMsgTime}}</text>
								</view>
								<image src="/static/chat/chat.svg" mode="aspectFit"></image>
							</view>
						</view>
					</view>
					<!-- 滑动出现的内容 -->
					<template v-slot:right>
						<view class="operation" v-for="(option,i) in operationList" :key='i' v-if="type(option)"
							@tap.stop="control(item, option)">
							<view
								:style="{background: background(option,i),width:ListStatus == 'Closed'?'400upx':'200upx' }">
								<image :src="option.icon"></image>
								<text>{{option.text}}</text>
							</view>
						</view>
					</template>
				</uni-swipe-action-item>
			</view>
		</uni-swipe-action>
	</view>
</template>

<script>
	import {
		findServiceInfo,
		getEmojiByAlt,
		getChatListCallTag
	} from '@/utils/publicMethods.js'
	import defaultProfile from '@/components/defaultProfile.vue'
	import {
		mapGetters,
		mapMutations
	} from 'vuex'
	import chat from '@/api/chat.js'

	export default {
		components: {
			defaultProfile
		},
		data() {
			return {
				ListStatus: 'Closed',
				operationList: [{
						icon: '/static/chat/reopen_white.svg',
						text: this.$t('chat').Reopen,
						statusText: 'open',
						name: 'Open',
						status: 1
					},
					{
						icon: '/static/chat/pending_white.svg',
						text: this.$t('chat').Pending,
						statusText: 'wait',
						name: 'Pending',
						status: 2
					},
					{
						icon: '/static/chat/close_white.svg',
						text: this.$t('chat').Close,
						statusText: 'close',
						name: 'Close',
						status: 3
					}
				],
				close: 0,
				operationParams: {}, // 操作请求参数
				selectItem: null, // 滑动操作选中的内容
			}
		},
		props: {
			isarr: {
				type: Array,
				default: () => []
			},
			dataList: {
				type: Array,
				default: () => []
			},
			serviceList: {
				type: Array,
				default: () => []
			}
		},
		computed: {
			...mapGetters({
				serviceInfo: 'login/serviceInfo',
				roomInfo: 'chat/roomInfo'
			}),
			i18n() {
				return this.$t('chat')
			},
			//为了下面的 监听
			tmpVal() {
				return this.$store.state.chat.top_center
			},
			lastMsg() {
				return function(item) {
					// let fileCont = item.lastMsgContext.split('_')[1] || item.lastMsgContext
					if (item.lastMsgType === 1) {
						return getEmojiByAlt(item.lastMsgContext)
					}
					if (item.lastMsgType === 2) { //  图片
						return '[image]'
					}
					if (item.lastMsgType === 6) { // 附件
						return '[attachmentFile]'
					}
					if (item.lastMsgType === 7) {
						let content
						let result
						try {
							content = JSON.parse(item.lastMsgContext.substr(0, item.lastMsgContext.length - 1).replace(
								'[&*', ''))
							if (content.isSolve === 'Yes') {
								result = '[Reply to the review]'
							} else {
								result = '[Send review push]'
							}
						} catch (e) {}
						return result
					}
					if (item.lastMsgType === 8) {
						try {
							return `[Order details for ${JSON.parse(item.lastMsgContext.substr(0, item.lastMsgContext.length - 1).replace('[&?', '')).orderNumber}]`
						} catch (e) {
							return '[Order details for ]'
						}
					}
					if (item.lastMsgType === 9) {
						// 获取坐席名称
						const tag = getChatListCallTag(item.lastMsgContext)
						return tag
					}
					// type 11 newstext 重构
					if (item.lastMsgType === 11) {
						const fileCont = JSON.parse(item.lastMsgContext)
						let context = ''
						try {
							fileCont.forEach(item => {
								if (item.type === 'text') {
									context += item.msg
								} else if (item.type === 'file') {
									context += '[attachmentFile]'
								} else if (item.type === 'img') {
									context += '[image]'
								}
							})
						} catch (err) {
							console.log(err);
						}
						const hyperlinksReg = /(\[&@(\d{4})\])|(\[&(\d+)\])/g
						return context.replace(hyperlinksReg, res => {
							let resContent = ''
							if (/\[&(\d+)\]/.test(res)) {
								const emojiId = res.slice(2, -1)
								resContent =
									`<image src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII="  
										class='emoji-img'
										style="width:22px; 
										height:22px; 
										background-position:0 ${-22 * (emojiId - 1)}px; 
										margin:0 2px;
										background-size: 100%; 
										vertical-align: middle; 
										transform: scale(1)"
									/>`
							}
							if (/\[&@(\d{4})\]/.test(res)) {
								if (this.$store.state.chat.roomInfo.siteId) {
									let serviceInfoName = findServiceInfo(res.slice(3, -1)) ? findServiceInfo(
										res.slice(3, -1)).name : 'You'
									serviceInfoName = serviceInfoName === this.$store.state.login
										.setServiceInfo.userName ? 'You' : serviceInfoName
									resContent =
										`<i contenteditable="false" style="width: 203px; height: 14px; font-size: 12px; font-family: SF-Pro; font-weight: 400; color: #585858; line-height: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">@${serviceInfoName}</i>`
								}
							}
							return resContent
						})
					}
				}
			}
		},
		watch: {
			tmpVal: {
				immediate: true,
				handler(a, b) {
					this.ListStatus = a
				}
			}
		},
		methods: {
			...mapMutations({
				setRoomInfo: 'chat/SET_ROOMINFO'
			}),
			type(option) {
				if (this.ListStatus == 'Closed') {
					return option.name == 'Open' && option.name != this.ListStatus
				} else {
					return option.name != this.ListStatus
				}
			},
			background(option, i) {
				if (this.ListStatus != 'Pending') {
					return i % 2 == 0 ? '$color-primary' : '#585858'
				} else {
					return i != 0 ? '$color-primary' : '#585858'
				}
			},
			/**
			 * 滑动触发获取的内容
			 * @param {Object} e 'right' || 'none'
			 * @param {Object} index
			 */
			change(e, item) {
				if (e === 'right') {
					// console.log('选中的内容', item);
					// this.selectItem = item
				}
			},
			control(item, option) {
				this.operationParams = {
					uid: this.serviceInfo.id,
					uType: this.serviceInfo.uType,
					platform: this.serviceInfo.platform,
					roomId: item.roomId,
					clientId: this.$store.state.clientId,
					event: option.statusText,
					avatar: this.serviceInfo.avatar.indexOf('http') === 0 ? this.serviceInfo.avatar : '',
					username: this.serviceInfo.userName,
					title: item.title
				}
				if (option !== 'allocat') {
					this.operationParams = {
						...this.operationParams,
						...{
							allocationAvatar: this.serviceInfo.avatar.indexOf('http') === 0 ? this.serviceInfo.avatar :
								'',
							allocationUid: this.serviceInfo.id,
							allocationName: this.serviceInfo.userName
						}
					}
				}
				chat.updateSession(this.operationParams).then(res => {
					if (res.data.code === 200) {
						// this.$emit('updateListData', item)
					}
				}).catch(error => {

				})
			},
			// 进入聊天界面
			_goChatArea(itemMsg) {
				// console.log('itemMsg:', itemMsg)
				this.setRoomInfo(itemMsg)
				uni.navigateTo({
					url: '/pages/chat/components/ChatArea?roomId=' + itemMsg.roomId
				})
			}

		}
	}
</script>

<style lang="scss" scoped>
	.operation {
		display: flex;
		align-items: center;
		justify-content: center;


		// max-width: 400upx;
		// min-width: 200upx;

		height: 100%;

		view {
			width: 100%;
			height: 100%;

			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;

			background: $color-primary;
		}

		image {
			width: 30upx;
			height: 30upx;
			margin-bottom: 6upx;
		}

		text {
			font-size: $font-size-lg - 4upx !important;
			font-weight: 600;
			color: #fff;
			text-transform: capitalize;
		}
	}

	$profileBottom: 4upx;

	.chatItem {
		.content-box {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0upx 32upx;
			padding-right: 0;
			// box-shadow: inset 0px -1px 0px 0px rgba(0, 0, 0, 0.10);
			transition: all 0.2s ease;

			&:active {
				background: rgba(#EAEAEA, 0.85);
			}

			.userProfile {
				position: relative;

				.serviceProfile {
					position: absolute;
					border: $profileBottom solid #fff;
					border-radius: 50%;
					right: 0;
					bottom: -$profileBottom;
				}
			}

			.chatStatus {
				display: flex;
				flex-direction: column;
				justify-content: space-around;
				align-items: flex-end;
				padding: 36upx 32upx;

				view {
					display: flex;
					align-items: center;
				}

				text {
					font-size: $font-size-lg - 8upx !important;
					font-weight: 400;
					color: $color-primary;
				}

				image {
					margin-top: 32upx;
					width: 24upx !important;
					height: 24upx !important;
				}
			}

			.chatMsg {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-left: 24upx;
				flex: 1;
				border-bottom: 1upx solid #EAEAEA;
			}

			.chatTitle {
				max-width: 408upx;
				width: 83.7%;
				display: flex;
				flex-direction: column;
				align-items: flex-start;
				justify-content: flex-start;

				// padding: 8upx 0;

				view,
				text {
					width: 100%;

					/*强制文字在一行文本框内*/
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				view {
					// display: flex;
					// align-items: center;
					font-size: $font-size-lg - 8upx !important;
					color: rgba(0, 0, 0, 0.6) !important;
					font-weight: 400;

					margin-top: 14upx;
					font-family: emoji;
				}

				text {
					font-size: $font-size-lg - 2upx !important;
					font-weight: 600;
				}
			}

			.messageDot {
				width: 12upx;
				height: 12upx;
				background: #3B59FE;
				border-radius: 50%;
				margin-right: 12upx;
			}
		}

		.messageDot {
			width: 12upx;
			height: 12upx;
			background: $color-primary;
			border-radius: 50%;
			margin-right: 12upx;
		}
	}
</style>
