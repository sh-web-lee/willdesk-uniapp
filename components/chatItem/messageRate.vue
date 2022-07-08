<template>
	<view class="messageRate">
		<view class="content">
			<view class="topBox">
				<view class="portrait">
					<image :src="serviceAvatar" alt="avatar" mode="aspectFill" lazy-load>
						<view class="hiTips" style="background: #3B59FE;">
							<image src="/static/chat/rate/Hi_.svg" mode="aspectFit" lazy-load></image>
						</view>
				</view>
				<view class="title" v-html="rateInfo.title"></view>
			</view>
			<view class="bottom">
				<view class="messageContent" v-html="rateInfo.content"></view>
				<view class="rateStart" v-if="rateInfo.reviewChoose == 'star' ">
					<uni-rate :readonly="true" :value="rateValue" :margin="rateMargin" color="#D0D0D0"
						active-color="orange" />
					<!-- <a-rate v-model="rateValue" :disabled='true' /> -->
				</view>
				<!-- 点赞 点踩评论 -->
				<view v-else class="thumbs">
					<image src="/static/chat/rate/like.svg" mode="aspectFit" lazy-load></image>
					<image src="/static/chat/rate/unlike.svg" mode="aspectFit" lazy-load></image>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		findServiceInfo
	} from '@/utils/publicMethods'

	export default {
		name: 'MessageRate',
		data() {
			return {
				// isStarType: true,
				rateValue: 5,
				rateMargin: uni.upx2px(32)
			}
		},
		props: {
			rateInfo: {
				type: Object
			},
			serviceAvatar: {
				type: String
			},
			username: {
				type: String
			},
			serviceName: {
				type: String
			}
		},
		created() {
			// console.log('---rateInfo---', this.rateInfo)
			// 将AnentName替换成真正的坐席名字
			// style="color:${this.rateInfo.primaryColor};"
			try {
				if (typeof this.rateInfo === 'string') {
					// 兼容旧数据
					this.rateInfo = this.rateInfo.substring(3, this.rateInfo.length - 1)
					this.rateInfo = JSON.parse(this.rateInfo)
				}
				var m = this.rateInfo.title.length
				var n = this.rateInfo.title.indexOf('<')
				var j = this.rateInfo.title.substring(n, m - 1)
				this.rateInfo.title = this.rateInfo.title.replace(/\{(AgentName)\}/g,
					`<span style="color: #3B59FE;">${this.serviceName}</span>`)
			} catch (e) {
				console.log(e)
			}
		},
		watch: {
			rateInfo: {
				handler(newVal) {
					if (typeof newVal === 'string') {
						this.rateInfo = JSON.parse(newVal.slice(3, -1))
						this.rateInfo.title = this.rateInfo.title.replace(/\{(AgentName)\}/g,
							`<span style="color: #3B59FE;">${this.serviceName}</span>`)
					}
				}
			}
		}
	}
</script>

<style lang='scss' scoped>
	.content {
		width: calc(100vw - 50upx * 2 - 32upx * 2 - 20upx * 2);
		/* height: 191px; */
		background: #FFFFFF;
		border-radius: 12upx;
		box-shadow: 0px 2upx 10upx 0px rgba(0, 0, 0, 0.0800);
		box-sizing: border-box;
		/* padding: 16px; */
		overflow: hidden;
	}

	.topBox {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32upx;
		border-radius: 12upx;
		background: #FFF2D8;
		background-image: url('~@/assets/img/bg.png');
		background-repeat: no-repeat;
		background-position: bottom right;
	}

	.portrait {
		width: 74upx;
		height: 74upx;
		border-radius: 50%;
		position: relative;
	}

	.portrait image {
		width: 74upx;
		height: 74upx;
		border-radius: 50%;
		object-fit: cover;
	}

	.messageContent {
		text-align: left;
		font-size: $font-size-lg - 2upx !important;
		font-weight: 400;
	}

	.title {
		width: 63.5%;
		margin-left: 48upx;
		flex: 1;
		font-size: $font-size-lg !important;
		font-weight: bold;

		/* 文本展示换行的设置 */
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		/* 设置对齐方式 */
		word-break: break-all;
		-webkit-line-clamp: 2
			/* overflow: hidden; */
			/* text-overflow: ellipsis; */
	}

	.hiTips {
		width: 44upx;
		height: 34upx;
		background: #3B59FE;
		border-radius: 12upx 12upx 12upx 0px;

		display: flex;
		justify-content: center;
		align-items: center;
		position: absolute;
		bottom: 52upx;
		left: 52upx;

		image {
			width: 16upx;
			height: 14upx;
			border-radius: 0;
		}
	}

	.bottom {
		padding: 32upx;

		.rateStart {
			margin-top: 32upx;
			display: flex;
			align-items: center;
			justify-content: center;
			text-align: center;
		}
	}

	.thumbs {
		padding: 0 75upx;
		margin-top: 32upx;
		display: flex;
		justify-content: space-between;

		image {
			width: 44upx;
			height: 42upx;
			border-radius: 0;
		}
	}

	::v-deep .uni-rate {
		.uni-rate__icon {
			.uni-icons {
				font-size: $font-size-lg + 34upx !important;
			}
		}
	}
</style>
