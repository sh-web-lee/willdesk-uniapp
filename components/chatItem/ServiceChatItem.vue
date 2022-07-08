<template>
	<view class="chatItem">
		<view class="chatItemInfo">
			<!-- <view class="user">
				<view class="currentTime">
					{{ chatItemInfo.sendTime | formatTime }}
				</view>
				<view class="splitSymbol">-</view>
				<view class="username">
					{{ userName }}
				</view>
			</view> -->
			<view class="chatContentContainer">
				<!-- messageState 0 发送中 1 成功 2失败 -->
				<message-state @reSend="reSend" :currentState.sync="chatItemInfo.messageState"></message-state>
				<!-- 文字内容 -->
				<template v-if="chatItemInfo.type === 11">
					<view class="chatContent" :class="transClass(chatItemInfo)">
						<view class="chatContent_msg" v-for="(itemMsg, index) of chatItemInfo.content" :key="index"
							v-if="transNewHtml(itemMsg)">
							<template
								v-if="(itemMsg.type === 'text' || itemMsg.type === 'emoji' || itemMsg.type === 'call')">
								<view class="chatContent_textMsg" v-html="transNewHtml(itemMsg)"></view>
							</template>

							<template v-else-if="itemMsg.type === 'img'">
								<view class="chatContentImg"
									:style="{height:chatItemInfo.size?chatItemInfo.size.height+'px':'', width:chatItemInfo.size?chatItemInfo.size.width+'px':''}">
									<!-- :style="{width: `${itemMsg.width || 50 }px`, height: `${itemMsg.height || 50}px`}" -->
									<!-- + '?x-oss-process=image/resize,p_50/format,webp/quality,q_50' -->
									<chatImg
										:src="itemMsg.ossUrl ? $store.state.ossSetting.host + '/' + itemMsg.ossUrl + '?x-oss-process=image/resize,p_50/format,webp/quality,q_50' : itemMsg.blobSrc"
										:itemMsg="itemMsg" @watchImageHeightChange="imgLoaded"
										:chatItemInfo="chatItemInfo"></chatImg>
									<loading v-if="imgLoading" class="loading"
										:style="{transform:`translate(-50%,-50%) scale(0.4)`}"></loading>
								</view>
							</template>

							<template v-else-if="itemMsg.type === 'file'">
								<!-- 附件内容 -->
								<view class="chatContentFile">
									<!-- <svg-icon class="attachmentIcon" name="attachment-chat" width="16px" height="16px"></svg-icon> -->
									<!-- <image src="../../static/chat/attachment-chat.svg" mode=""></image> -->
									<!-- @click="downloadFile" -->
									<span class="fileContent">{{ attachmentNewSrc(itemMsg) }}</span>
									<text @click.stop class="download" :href="downloadURL"
										:download="downloadSrc(itemMsg)" target="_blank" style="display:none;"></text>
									<view class="downloadProgress" v-if="isDownloading">
										<view class="cancelDownload" @click="cancelDownloadFunc('Cancel download')">
											<svg-icon width="16px" height="16px" name="close-download"></svg-icon>
										</view>
										<progress-bar class="progressBar" :progress="progress"></progress-bar>
									</view>
								</view>
							</template>
						</view>
					</view>
				</template>
				<template v-else>
					<!-- 文字内容 -->
					<view class="chatContent" :class="transClass(chatItemInfo)"
						v-if="textType.includes(chatItemInfo.type)">
						<view class="chatContent_msg">
							<view v-html="transHyperName(chatItemInfo)"></view>
						</view>
					</view>
					<!-- 图片内容 -->
					<view class="chatContent" :class="transClass(chatItemInfo)"
						v-else-if="imgType.includes(chatItemInfo.type)">
						<view class="chatContentImg"
							:style="{height:chatItemInfo.size?chatItemInfo.size.height+'px':'', width:chatItemInfo.size?chatItemInfo.size.width+'px':''}">
							<image :src="chatItemInfo.blob ? chatItemInfo.blob : chatItemInfo.src" @load="imgLoaded"
								@error="imgError"
								@tap.stop="previewImg(chatItemInfo.blob ? chatItemInfo.blob : chatItemInfo.src)" />
							<loading v-if="imgLoading" class="loading"
								:style="{transform:`translate(-50%,-50%) scale(0.4)`}"></loading>
						</view>
					</view>
					<!-- 附件内容 -->
					<view class="chatContent" :class="transClass(chatItemInfo)"
						v-else-if="fileType.includes(chatItemInfo.type)">
						<view class="chatContentFile">
							<svg-icon class="attachmentIcon" name="attachment-chat" width="16px" height="16px">
							</svg-icon>
							<span class="fileContent" @click="downloadFile">{{ attachmentSrc(chatItemInfo) }}</span>
							<text @click.stop class="download" :href="downloadURL" :download="downloadSrc(chatItemInfo)"
								target="_blank" style="display:none;"></text>
							<view class="downloadProgress" v-if="isDownloading">
								<view class="cancelDownload" @click="cancelDownloadFunc('Cancel download')">
									<svg-icon width="16px" height="16px" name="close-download"></svg-icon>
								</view>
								<progress-bar class="progressBar" :progress="progress"></progress-bar>
							</view>
						</view>
					</view>

					<!-- 评价内容 -->
					<view v-else-if="rateType.includes(chatItemInfo.type)">
						<message-rate :rateInfo='chatItemInfo.rateData || chatItemInfo.content' :serviceAvatar='avatar'
							:serviceName='userName'></message-rate>
					</view>
				</template>
			</view>
		</view>
		<view class="avatar">
			<!-- 如果其他坐席消息为空，则说明当前消息是本坐席消息 -->
			<!-- <image :src="avatar" alt="" /> -->
			<defaultProfile v-if="nextTime || (!nextChatItemInfo || nextChatItemInfo.senderUidType!==2)" :profile="avatar" :name="userName" :size="50" :fontSize="10"></defaultProfile>
		</view>
	</view>
</template>

<script>
	import {
		mixin
	} from '@/mixins/chatItem/chatItem.js'
	import {
		basename
	} from 'path'
	import {
		textToImg,
		findServiceInfo
	} from '@/utils/publicMethods'
	// 引入组件
	import MessageState from './MessageState'
	import MessageRate from './messageRate'
	import defaultProfile from '@/components/defaultProfile.vue'
	import chatImg from '@/components/chatImg/chatImg.vue'
	import {
		mapGetters,
		mapMutations
	} from 'vuex'
	export default {
		name: 'serviceChatItem',
		mixins: [mixin],
		components: {
			MessageState,
			MessageRate,
			defaultProfile,
			chatImg
		},
		props: {
			// 坐席信息
			serviceInfo: {
				type: Object,
				require: true
			},
			chatItemInfo: {
				type: Object
			},
			nextChatItemInfo: {
				type: Object
			},
			nextTime: {
				type: String
			},
			userInfo: {
				type: Object
			},
			sessionInfo: {
				type: Object
			}
		},
		data() {
			return {
				// 消息类型
				// 1、文本 2、图片 3、视频（暂无） 4、音频（暂无） 5、操作（标急，打开，等待，关闭） 6、附件 7、评论组件 8、订单 9、@人
				msgType: {},
				sendMsgParams: {
					// 一条websockt发送体的唯一标识
					seq: (Math.random() * 1000000).toString().replace('.', ''),
					// 发送类型
					action: 'sendmsg',
					// 发送体
					data: {
						// 发送者头像 文字头像base64格式不能传！
						avatar: '',
						// websocket链接唯一标识
						clientId: this.$store.state.clientId,
						// 暂时用不到
						isNote: false,
						// 发送内容
						message: null,
						// 发送类型
						msgType: 'text', // 默认字段为文本
						// 发送平台
						platform: uni.getSystemInfoSync().platform === 'ios' ? 2 : 3, // 1、PC 2、app-ios 3、app-Android
						// 房间id
						roomId: '',
						// 店铺id
						siteId: this.$store.state.chat.roomInfo.siteId, // 登录页面cs_login接口获得
						// 用户类型 1、C端用户 2、B端坐席 3、平台客服
						uType: this.$store.state.login.setServiceInfo.uType,
						// 发送者id
						uid: this.$store.state.login.setServiceInfo.id + '',
						// 发送者姓名
						username: this.$store.state.login.setServiceInfo.userName
					}
				}
			}
		},
		created() {
			// console.log('创建', this.chatItemInfo)
			// ts 官网搬的枚举代码
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
			// if (typeof(this.chatItemInfo.content) !== 'string' && this.chatItemInfo.type !== 7) {
			// 	const checkData = this.chatItemInfo.content
			// 	checkData.map(async (item, index) => {
			// 		if (item.type === 'img') {
			// 			const src = this.chatItemInfo.blob ? item.blobSrc : this.$store.state.ossSetting.host + '/' + item.ossUrl
			// 			const obj = (await uni.getImageInfo({ src }))[1]
			// 			const width = obj.width
			// 			const height = obj.height
			// 			this.width2Height.set(index, {width, height})
			// 			const computedWatchers = this._computedWatchers
			// 			if (computedWatchers) {
			// 				Object.keys(computedWatchers).forEach((computed) => {
			// 					computedWatchers[computed].update()
			// 				})
			// 			}
			// 			this.$forceUpdate()
			// 		}
			// 	})
			// }
		},
		computed: {
			imgError(e) {
				if (this.chatItemInfo.type === 11) {
					console.log(e);
					// this.chatItemInfo.content[index].blobSrc = this.loadImg
				}
			},
      avatar() {
        // textToImg()
        return this.$store.state.login.setServiceInfo.avatar
        // return (findServiceInfo(this.chatItemInfo.senderUid).profile ? findServiceInfo(this.chatItemInfo.senderUid).profile : findServiceInfo(this.chatItemInfo.senderUid).name)
      },
      userName() {
        try {
          return this.$store.state.login.setServiceInfo.userName
          // return findServiceInfo(this.chatItemInfo.senderUid).name
        } catch (e) {
          return ''
        }
      },
			attachmentNewSrc() {
				return function(itemMsg) {
					if (itemMsg && itemMsg.fileName) { // 附件名从fileName获取
						return basename(itemMsg.fileName)
					} else { //  兼容历史消息，历史消息附件名从msg获取
						const _index = itemMsg.msg.indexOf('_')
						return basename(itemMsg.msg.slice(_index + 1))
					}
				}
			},
			attachmentSrc() {
				return function(chatItemInfo) {
					const chatCont = chatItemInfo.content.includes('_') ? chatItemInfo.content.split('_')[1] :
						chatItemInfo.content
					// return basename(chatItemInfo.src)
					if (basename(chatCont).lastIndexOf('.') !== -1 && basename(chatCont).split('.').length > 2) {
						return basename(chatCont).substr(0, basename(chatCont).lastIndexOf('.'))
					} else {
						return basename(chatCont)
					}
				}
			},
			downloadSrc() {
				return function(itemMsg) {
					const host = this.$store.state.ossSetting.host
					return host + '/' + itemMsg.msg
				}
			},
			// 输入框重构 消息内容解析
			transNewHtml() {
				return function(item) {
					if (!item) {
						return
					}
					const hyperlinksReg =
						/((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+|(\[&@(\d+)\])|(\[&(\d+)\])|(\[&&\*((\w|-)+)\])|(😀|😄|😁|😆|😅|🤣|😂|🙂|🙃|😉|😊|😇|🥰|😍|🤩|😘|😗|😚|😙|😋|😛|😜|🤪|😝|🤑|🤗|🤭|🤫|🤔|🤐|🤨|😐|😑|😶|😏|😒|🙄|😬|🤥|😌|😔|😪|🤤|😴|😷|🤒|🤕|🤢|🤮|🤧|🥵|🥶|🥴|😵|🤯|🤠|🥳|😎|🤓|🧐|😕|😟|🙁|☹️|😮|😯|😲|😳|🥺|😦|😧|😨|😰|😥|😢|😭|😱|😖|😣|😞|😓|😩|😫|🥱|😤|😡|😠|🤬|👿|💀|💩|👹|👺|😺|😸|😹|😻|😼|😽|🙀|😿|😾|🙈|🙉|🙊|💋|💌|💘|💝|💖|💗|💓|💞|💕|💟|❣️|❣|💔|❤️|🧡|💛|💚|💙|💜|🤎|💯|💢|💥|💫|💦|💨|🕳️|💣|👋|🤚|🖐|✋|🖖|👌|🤏|✌|🤞|🤟|🤘|🤙|👈|👉|👆|🖕|👇|☝️|👍|👎|✊|👊|🤛|🤜|🍇|🍉|🍍|🍊|🍓|🍋|🍑|🍌|🥝|🙍|🙅|🙆|💁|🙋|🧏|🙇|🤦|🤷|🌹|🥀|🌻|❗|❓)/g
					let resContent = ''
					return item.msg.replace(hyperlinksReg, (res) => {
						if (/((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/.test(res)) {
							resContent = `<a href="${res}" target="_black">${res}</a>`
						}
						if (/\[&@(\d+)\]/.test(res)) {
							let serviceInfoName = findServiceInfo(res.replace(/\D/g, '')).name
							serviceInfoName = serviceInfoName === this.$store.state.login.setServiceInfo
								.userName ?
								'You' : serviceInfoName
							resContent =
								`<span data-cid="${res}" style="padding:2px 8px; margin:2px 4px; font-style: normal; background-color:#ffd16b; color:#292929; display:inline-block; border-radius:8px;">@${serviceInfoName}</span>`
						}
						if (/\[&(\d+)\]/.test(res)) {
							const emojiId = res.slice(2, -1)
							resContent =
								`<image 
									src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII=" 
									class='emoji-img'
									style="width:22px; height:22px;  background-size: 100%; background-position:0 ${-22 * (emojiId - 1)}px;  margin:4px 2px; vertical-align: middle;  transform: scale(1)" alt="">`
						}
						if (/😀|😄|😁|😆|😅|🤣|😂|🙂|🙃|😉|😊|😇|🥰|😍|🤩|😘|😗|😚|😙|😋|😛|😜|🤪|😝|🤑|🤗|🤭|🤫|🤔|🤐|🤨|😐|😑|😶|😏|😒|🙄|😬|🤥|😌|😔|😪|🤤|😴|😷|🤒|🤕|🤢|🤮|🤧|🥵|🥶|🥴|😵|🤯|🤠|🥳|😎|🤓|🧐|😕|😟|🙁|☹️|😮|😯|😲|😳|🥺|😦|😧|😨|😰|😥|😢|😭|😱|😖|😣|😞|😓|😩|😫|🥱|😤|😡|😠|🤬|👿|💀|💩|👹|👺|😺|😸|😹|😻|😼|😽|🙀|😿|😾|🙈|🙉|🙊|💋|💌|💘|💝|💖|💗|💓|💞|💕|💟|❣️|❣|💔|❤️|🧡|💛|💚|💙|💜|🤎|💯|💢|💥|💫|💦|💨|🕳️|💣|👋|🤚|🖐|✋|🖖|👌|🤏|✌|🤞|🤟|🤘|🤙|👈|👉|👆|🖕|👇|☝️|👍|👎|✊|👊|🤛|🤜|🍇|🍉|🍍|🍊|🍓|🍋|🍑|🍌|🥝|🙍|🙅|🙆|💁|🙋|🧏|🙇|🤦|🤷|🌹|🥀|🌻|❗|❓/.test(res)) {
							resContent =
								`<text class="wd-cus-emoji">${res}</text>`
						}
						return resContent
					})
				}
			},
			transHyperName() {
				return function(chatItemInfo) {
					try {
						const hyperlinksReg = /(((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+)|(\[&(\d+)\])|(\[&@(\d{4})\])/g
						let resContent = ''
						return chatItemInfo.content.replace(hyperlinksReg, res => {
							if (/((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/.test(res)) {
								resContent = `<a href="${res}" target="_black">${res}</a>`
							}
							if (/\[&@(\d{4})\]/.test(res)) {
								const serviceInfoName = findServiceInfo(res.slice(3, -1)).name
								resContent =
									`<span data-cid="${res}" style="padding:2px 8px; margin:2px 4px; font-style: normal; background-color:#ffd16b; color:#292929; display:inline-block; border-radius:8px;">@${serviceInfoName}</span>`
							}
							if (/\[&(\d+)\]/.test(res)) {
								const emojiId = res.slice(2, -1)
								resContent =
									`<image src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII="  
										class='emoji-img'
										style="width:22px; height:22px; 
										background-position:0 ${-22 * emojiId}px; margin:0 2px;} vertical-align: middle; 
										transform: scale(1)" 
										alt="">`
							}
							return resContent
						})
					} catch (err) {
						return chatItemInfo.content
					}
				}
			},
			transClass() {
				return function(item) {
					let name = ''
					const emojiRegx = /😀|😄|😁|😆|😅|🤣|😂|🙂|🙃|😉|😊|😇|🥰|😍|🤩|😘|😗|😚|😙|😋|😛|😜|🤪|😝|🤑|🤗|🤭|🤫|🤔|🤐|🤨|😐|😑|😶|😏|😒|🙄|😬|🤥|😌|😔|😪|🤤|😴|😷|🤒|🤕|🤢|🤮|🤧|🥵|🥶|🥴|😵|🤯|🤠|🥳|😎|🤓|🧐|😕|😟|🙁|☹️|😮|😯|😲|😳|🥺|😦|😧|😨|😰|😥|😢|😭|😱|😖|😣|😞|😓|😩|😫|🥱|😤|😡|😠|🤬|👿|💀|💩|👹|👺|😺|😸|😹|😻|😼|😽|🙀|😿|😾|🙈|🙉|🙊|💋|💌|💘|💝|💖|💗|💓|💞|💕|💟|❣️|❣|💔|❤️|🧡|💛|💚|💙|💜|🤎|💯|💢|💥|💫|💦|💨|🕳️|💣|👋|🤚|🖐|✋|🖖|👌|🤏|✌|🤞|🤟|🤘|🤙|👈|👉|👆|🖕|👇|☝️|👍|👎|✊|👊|🤛|🤜|🍇|🍉|🍍|🍊|🍓|🍋|🍑|🍌|🥝|🙍|🙅|🙆|💁|🙋|🧏|🙇|🤦|🤷|🌹|🥀|🌻|❗|❓/g
					if (item.type === 11 && /\[&@(\d{4})\]/.test(item.content)) {
						name += 'callItem'
					}
					if (item.type === 11 && /\[&(.?)\*((\w|-)+)\]/.test(item.content[0].msg)) {
						name += 'imageItem'
					}
					if (item.content[0].msg) {
						const emojiRep = item.content[0].msg.replace(emojiRegx, '')
						if (item.type === 11 && item.content.length === 1 && emojiRep.length === 0) {
							name += 'wd-cus-singleEmoji'
						}
					}
					return name
				}
			}
		},
		methods: {
			...mapMutations({
				send: 'socket/socketSend', // 发送socket消息
				setCsListMap: 'chat/SET_CSLISTMAP'
			}),
			imgLoaded(res) {
				// console.log('图片加载完成', res.detail.height);
				this.$emit('watchImageHeightChange', res.detail)
			},
			async getImageInfo(src) {
				const width = (await uni.getImageInfo({
					src
				}))[1].height
				const height = (await uni.getImageInfo({
					src
				}))[1].width
				return {
					width,
					height
				}
			},
			previewImg(img) {
				uni.previewImage({
					urls: [img]
				})
			},
			// 重新发送的回调
			reSend() {
				if (this.chatItemInfo.type === 7) {
					this.chatItemInfo.content = '[&*' + JSON.stringify(this.chatItemInfo.content) + ']'
				}
				if (this.chatItemInfo.type === 11) {
					this.sendMsgParams.data.content = JSON.stringify(this.chatItemInfo.content)
					// this.$bus.$emit('reSendMsg', this.chatItemInfo.seq)
				}
				this.sendMsgParams.seq = (Math.random() * 1000000).toString().replace('.', '')
				this.sendMsgParams.data.roomId = this.$store.state.chat.roomInfo.roomId
				this.sendMsgParams.data.clientId = this.$store.state.clientId
				this.sendMsgParams.data.msgType = this.msgType[this.chatItemInfo.type]
				this.sendMsgParams.data.message = this.chatItemInfo.content
				this.sendMsgParams.data.sendTime = new Date().getTime()
				this.sendMsgParams.data.avatar = this.$store.state.login.setServiceInfo.avatar
				this.sendMsgParams.data.msgType = this.msgType[this.chatItemInfo.type]
				this.send(JSON.stringify(this.sendMsgParams)) // 重新发
				this.$emit('resendMessage', this.chatItemInfo.seq, this.sendMsgParams.seq) // 清除旧的那条
				this.sendMsgParams.data.message = ''
				this.sendMsgParams.seq = ''
			}

		}
	}
</script>

<style scoped lang="less">
	@import url("@/mixins/chatItem/chatItem.less");

	.chatItem {
		margin-left: 0 !important;
	}

	.chatItemInfo {
		margin-left: 0 !important;

		.user {
			justify-content: flex-end;
		}

		.chatContentContainer {
			display: flex;
			justify-content: flex-end;

			.chatContent {
				border-radius: 12upx;
				background-color: #3B59FE;
				// display: flex;
				// align-items: flex-end;
			}

			.chatContentImg {
				border-radius: 12upx;
				overflow: hidden;
			}

		}
	}

	.callItem {
		background-color: #ffecc1 !important;
	}

	a:hover {
		text-decoration: underline;
	}

	.avatar image {
		object-fit: cover;
	}

	.chatContent_textMsg {
		display: flex;
		align-items: center;
		color: #fff;
		font-size: 30upx;
		flex-wrap: wrap;
		font-family: emoji;
	}

	.chatContent_imgMsg {}
</style>
