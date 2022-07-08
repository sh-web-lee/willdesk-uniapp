<template>
	<view class="chatItem">
		<view class="avatar" @click="viewMore">
			<defaultProfile v-if="nextTime || (!nextChatItemInfo || nextChatItemInfo.senderUidType!==1)"
				:profile="userInfo.avatar" :name="userInfo.firstSendName" :size="50" :fontSize="30" />
			<!-- <image :src="userAvatar(userInfo)" /> -->
		</view>
		<view class="chatItemInfo">
			<!-- <view class="user">
        <view class="username">
          {{ userInfo.firstSendName }}
        </view>
        <view class="splitSymbol">-</view>
        <view class="currentTime">
          {{ chatItemInfo.sendTime | formatTime }}
        </view>
      </view> -->
			<view class="chatContentContainer">
				<!-- 文字chat-item -->
				<view class="chatContent" v-if="chatItemInfo.type=='1'" :class="transClass(chatItemInfo)">
					<view class="chatInter" v-html="transHtml(chatItemInfo.content)"></view>
				</view>
				<!-- 图片chat-item -->
				<!-- :style="{height:chatItemInfo.size?chatItemInfo.size.height+'px':'', width:chatItemInfo.size?chatItemInfo.size.width+'px':''}" -->
				<view class="chatContentImg" v-else-if="chatItemInfo.type=='2'">
					<chatImg :src="chatItemInfo.content" @watchImageHeightChange="imgLoaded"></chatImg>
				</view>
				<!-- 附件内容 -->
				<view class="chatContent chatContentFile" v-else-if="chatItemInfo.type =='6'">
					<!-- <svg-icon class="attachmentIcon" name="attachment-chat" width="16px" height="16px"></svg-icon> -->
					<!-- @click="downloadFile" -->
					<!-- <span class="fileContent">{{baseSrc(chatItemInfo)}}</span> -->
					<!-- :href="downloadURL" :download="downloadSrc(chatItemInfo)" -->
					<image src="@/static/chat/attach-files.svg" mode=""></image>
					<text @click.stop class="fileContent" @click="downloadSrc(chatItemInfo)"
						target="_blank">{{baseSrc(chatItemInfo)}}</text>
					<view class="downloadProgress" v-if="isDownloading">
						<!-- <progress-bar class="progressBar" :progress="progress"></progress-bar> -->
						<view class="cancelDownload" @click="cancelDownloadFunc('Cancel download')">
							<svg-icon width="16px" height="16px" name="close-download"></svg-icon>
						</view>
					</view>
				</view>
				<!-- 订单信息 -->
				<view class="customer-order" v-else-if="chatItemInfo.type =='8'">
					<!-- 订单信息 -->
					<view class="orderInfo">
						<!-- 订单状态 -->
						<view class="orderStatus">
							<view class="orderTitle">
								<text>Order：<span>{{ chatItemInfo.content.orderNumber }}</span></text>
							</view>
							<text>{{ chatItemInfo.content.createDate}}</text>
						</view>
						<view class="orderDetail">
							<view class="detailNumber">
								<view class="detailNumber_key">Total amount</view>
								<view class="detailNumber_value">{{ chatItemInfo.content.totalAmount }}</view>
							</view>
							<view class="detailAmount">
								<view class="detailAmount_key">Total items</view>
								<view class="detailAmount_value">{{ chatItemInfo.content.totalNumber }}</view>
							</view>
						</view>
					</view>
				</view>
				<!-- 评价信息 -->
				<view v-else-if="chatItemInfo.type == '7'">
					<!-- require('@/assets/img/default_avatar.png') -->
					<customer-review :rateInfo='chatItemInfo.content' :customerAvatar="userInfo.avatar || ''" />
				</view>
				<!-- 附件内容 -->
				<view class="chatContent" :class="transClass(chatItemInfo)" v-else-if="chatItemInfo.type == '12'">
					<view class="chatContentFile" @tap="downloadFile(chatItemInfo)">
						<!-- <svg-icon class="attachmentIcon" name="attach-files" width="16px" height="16px"></svg-icon> -->
						<image src="@/static/attach-files.svg" mode="" style="margin-right: 6px;"></image>
						<text class="fileContent">{{ attachmentSrc(chatItemInfo) }}</text>
						<a @click.stop class="download" :href="downloadURL" target="_blank" style="display:none;"></a>
						<view class="downloadProgress" v-if="isDownloading">
							<view class="cancelDownload" @click="cancelDownloadFunc('Cancel download')">
								<svg-icon width="16px" height="16px" name="close-download"></svg-icon>
							</view>
							<progress-bar class="progressBar" :progress="progress"></progress-bar>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mixin
	} from '@/mixins/chatItem/chatItem.js'
	import CustomerReview from './CustomerReview'
	import {
		textToImg
	} from '@/utils/publicMethods'
	import {
		basename
	} from 'path'
	import defaultProfile from '@/components/defaultProfile.vue'
	import chatImg from '@/components/chatImg/chatImg.vue'
	export default {
		name: 'customerChatItem',
		mixins: [mixin],
		components: {
			CustomerReview,
			defaultProfile,
			chatImg
		},
		data() {
			return {
				width2Height: new Map()
			}
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
		async created() {
			if (this.chatItemInfo.type == '8') {
				this.chatItemInfo.content = JSON.parse(this.chatItemInfo.content.substr(0, this.chatItemInfo.content
					.length - 1).replace('[&?', ''))
			}
			// if (this.chatItemInfo.type === 2) {
			// 	const src = this.chatItemInfo.content
			// 	const obj = (await uni.getImageInfo({ src }))[1]
			// 	console.log(obj);
			// 	const width = obj.width
			// 	const height = obj.height
			// 	this.width2Height.set(0, {width, height})
			// 	const computedWatchers = this._computedWatchers
			// 	if (computedWatchers) {
			// 		Object.keys(computedWatchers).forEach((computed) => {
			// 			computedWatchers[computed].update()
			// 		})
			// 	}
			// 	this.$forceUpdate()
			// }
		},
		computed: {
			computedWH() {
				return function(index) {
					const innerWidth = (this.$store.state.deviceInfo.screenWidth - 52 - 20 - 32 - 32)
					let obj = this.width2Height.get(index)
					if (obj) {
						if (obj.width <= innerWidth && obj.width >= 50) {
							obj.width = obj.width
						}
						if (obj.width < 50) {
							obj.height = 50 * obj.height / obj.width
							obj.width = 50
						}
						if (obj.width > innerWidth) {
							obj.height = innerWidth * obj.height / obj.width
							obj.width = innerWidth
						}
						return {
							width: `${obj.width}px`,
							height: `${obj.height}px`
						}
					} else {
						return {
							width: `${50}px`,
							height: `${50}px`
						}
					}
				}
			},
			baseSrc() {
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
			userAvatar() {
				// textToImg(item.firstSendName)
				return function(item) {
					return item.avatar
				}
			},
			// downloadSrc() {
			// 	return function(chatItemInfo) {
			// 		const chatCont = basename(chatItemInfo.content)
			// 		if (chatCont.lastIndexOf('.') !== -1 && basename(chatCont).split('.').length > 2) {
			// 			const lastIndexOf = chatItemInfo.content.lastIndexOf('.')
			// 			return chatItemInfo.content.substr(0, lastIndexOf)
			// 		} else {
			// 			return chatItemInfo.content
			// 		}
			// 	}
			// },
			transHtml() {
				return function(item) {
					const hyperlinksReg = /((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+|(\[&(\d+)\])|(😀|😄|😁|😆|😅|🤣|😂|🙂|🙃|😉|😊|😇|🥰|😍|🤩|😘|😗|😚|😙|😋|😛|😜|🤪|😝|🤑|🤗|🤭|🤫|🤔|🤐|🤨|😐|😑|😶|😏|😒|🙄|😬|🤥|😌|😔|😪|🤤|😴|😷|🤒|🤕|🤢|🤮|🤧|🥵|🥶|🥴|😵|🤯|🤠|🥳|😎|🤓|🧐|😕|😟|🙁|☹️|😮|😯|😲|😳|🥺|😦|😧|😨|😰|😥|😢|😭|😱|😖|😣|😞|😓|😩|😫|🥱|😤|😡|😠|🤬|👿|💀|💩|👹|👺|😺|😸|😹|😻|😼|😽|🙀|😿|😾|🙈|🙉|🙊|💋|💌|💘|💝|💖|💗|💓|💞|💕|💟|❣️|❣|💔|❤️|🧡|💛|💚|💙|💜|🤎|💯|💢|💥|💫|💦|💨|🕳️|💣|👋|🤚|🖐|✋|🖖|👌|🤏|✌|🤞|🤟|🤘|🤙|👈|👉|👆|🖕|👇|☝️|👍|👎|✊|👊|🤛|🤜|🍇|🍉|🍍|🍊|🍓|🍋|🍑|🍌|🥝|🙍|🙅|🙆|💁|🙋|🧏|🙇|🤦|🤷|🌹|🥀|🌻|❗|❓)/g
					let resContent = ''
					return item.replace(hyperlinksReg, res => {
						if (/((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/.test(res)) {
							resContent = `<text href="${res}" target="_black">${res}</text>`
						}
						if (/\[&(\d+)\]/.test(res)) {
							const emojiId = res.slice(2, -1)
							resContent =
								`<image src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII="  style="background:url(${require('@/assets/emojiLib/emoji.png')}) 0 0 no-repeat; width:22px; height:22px; background-position:0 ${-22 * emojiId}px; margin:0 2px;} vertical-align: middle; transform: scale(1)" alt="">`
						}
						if (/😀|😄|😁|😆|😅|🤣|😂|🙂|🙃|😉|😊|😇|🥰|😍|🤩|😘|😗|😚|😙|😋|😛|😜|🤪|😝|🤑|🤗|🤭|🤫|🤔|🤐|🤨|😐|😑|😶|😏|😒|🙄|😬|🤥|😌|😔|😪|🤤|😴|😷|🤒|🤕|🤢|🤮|🤧|🥵|🥶|🥴|😵|🤯|🤠|🥳|😎|🤓|🧐|😕|😟|🙁|☹️|😮|😯|😲|😳|🥺|😦|😧|😨|😰|😥|😢|😭|😱|😖|😣|😞|😓|😩|😫|🥱|😤|😡|😠|🤬|👿|💀|💩|👹|👺|😺|😸|😹|😻|😼|😽|🙀|😿|😾|🙈|🙉|🙊|💋|💌|💘|💝|💖|💗|💓|💞|💕|💟|❣️|❣|💔|❤️|🧡|💛|💚|💙|💜|🤎|💯|💢|💥|💫|💦|💨|🕳️|💣|👋|🤚|🖐|✋|🖖|👌|🤏|✌|🤞|🤟|🤘|🤙|👈|👉|👆|🖕|👇|☝️|👍|👎|✊|👊|🤛|🤜|🍇|🍉|🍍|🍊|🍓|🍋|🍑|🍌|🥝|🙍|🙅|🙆|💁|🙋|🧏|🙇|🤦|🤷|🌹|🥀|🌻|❗|❓/.test(res)) {
							resContent =
								`<text class="wd-cus-emoji">${res}</text>`
						}
						return resContent
					})
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
					if (item.content) {
						const emojiRep = item.content.replace(emojiRegx, '')
						if (item.type === 1 && emojiRep.length === 0) {
							name += 'wd-cus-singleEmoji'
						}
					}
					return name
				}
			},
			// 附件解析
			attachmentSrc() {
				return function(chatItemInfo) {
					const fileObj = JSON.parse((chatItemInfo.content))
					if (fileObj[0].title) return fileObj[0].title
				}
			},
		},
		methods: {
			imgLoaded(res) {
				this.$emit('watchImageHeightChange', res.detail)
			},
			previewImg(img) {
				uni.previewImage({
					urls: [img]
				})
			},
			viewMore() {
				uni.navigateTo({
					url: '/pages/details/details'
				});
			},
			downloadSrc(chatItemInfo) {
				const fileObj = JSON.parse(chatItemInfo.content)
				uni.downloadFile({
					url: fileObj[0].url,
					success(data) {
						console.log('data:', data)
						if (data.statusCode === 200) {
							//文件保存到本地
							uni.saveFile({
								tempFilePath: data.tempFilePath, //临时路径
								success: function(res) {
									uni.showToast({
										icon: 'none',
										mask: true,
										title: '文件已保存：' + res.savedFilePath, //保存路径
										duration: 3000,
									});
									setTimeout(() => {
										//打开文档查看
										uni.openDocument({
											filePath: res.savedFilePath,
											success: function(res) {
												// console.log('打开文档成功');
											}
										});
									}, 3000)
								}
							});
						}
					}
				})
			},
			
			downloadFile(chatItemInfo) {
				const fileObj = JSON.parse(chatItemInfo.content)
				uni.downloadFile({
					url: fileObj[0].url,
					success(data) {
						console.log('data:', data)
						if (data.statusCode === 200) {
							//文件保存到本地
							uni.saveFile({
								tempFilePath: data.tempFilePath, //临时路径
								success: function(res) {
									uni.showToast({
										icon: 'none',
										mask: true,
										title: '文件已保存：' + res.savedFilePath, //保存路径
										duration: 3000,
									});
									setTimeout(() => {
										//打开文档查看
										uni.openDocument({
											filePath: res.savedFilePath,
											success: function(res) {
												// console.log('打开文档成功');
											}
										});
									}, 1000)
								}
							});
						}
					}
				})
			}
		}
	}
</script>

<style scoped lang="less">
	// 预编译文件通过import引用只在局部生效，而css会全局生效，而直接style的src中引入都只在局部生效,但是src引用会覆盖下面的样式
	@import url("@/mixins/chatItem/chatItem.less");

	.chatItem {
		margin-right: 0 !important;
	}

	.chatItemInfo {
		margin-right: 0 !important;

		.user {
			justify-content: flex-start;
		}

		.chatContentContainer {
			.chatContent {
				border-radius: 12upx;
				background: #e4e4e4;
			}

			.chatInter {
				display: flex;
				align-items: center;
			}

			.chatContentImg {
				border-radius: 12upx;
			}
		}
	}

	.downloadProgress {
		right: unset;
		left: 0;

		.progressBar {
			margin-left: 0;
			margin-right: 8px;
		}
	}

	.customer-order {
		width: 100%;
	}

	// 订单信息展示样式
	.orderInfo {
		max-width: 85.3%;
		background: #FFFFFF;
		box-shadow: 0px 2upx 10upx 0px rgba(0, 0, 0, 0.0800);
		border-radius: 12upx;
	}

	.orderStatus {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1upx solid rgba(0, 0, 0, 0.13);
		padding: 32upx;
	}

	.orderStatus {
		text {
			font-size: 24upx !important;
			font-weight: 400;
			color: rgba(0, 0, 0, 0.6);

			&:first-child {
				font-size: 26upx !important;
				font-weight: 600;
				color: #000;
			}
		}
	}

	.orderDetail {
		display: flex;
		justify-content: space-between;
		padding: 32upx;
	}

	.detailAmount view:nth-of-type(1),
	.detailNumber view:nth-of-type(1) {
		font-size: 28upx;
		font-weight: 400;
		color: rgba(0, 0, 0, 0.5);
	}

	.detailAmount view:nth-of-type(2),
	.detailNumber view:nth-of-type(2) {
		text-align: center;
		margin-top: 7upx;
		font-size: 30upx;
		font-weight: 600;
		color: #000;
	}
	.fileContent span {
		font-size: 30upx;
		flex-wrap: wrap;
		font-family: SF-Pro;
	}
</style>
