<template>
	<view class="customerReview">
		<view class="content">
			<view class="topBox">
				<view class="portrait">
					<image :src="rateInfo.serviceAvatar" alt=""  mode="aspectFill" lazy-load>
						<view class="hiTips" style="background: #3B59FE;">
							<image src="/static/chat/rate/Hi_.svg" mode="aspectFit" lazy-load></image>
						</view>
				</view>
				<view class="title" v-html="rateInfo.title"></view>
			</view>
			<view class="bottom">
				<view class="messageContent" v-html="rateInfo.content"></view>

				<!-- 点赞 点踩评论 -->
				<view v-if="rateInfo.reviewChoose == 'thumbs'" class="thumbs">
					<svg-icon width="26px" height="26px" :name="rateInfo.thumbs ? 'like' : 'like2' "></svg-icon>
					<svg-icon width="26px" height="26px" :name="rateInfo.thumbs ? 'unlike2' : 'unlike' "></svg-icon>
				</view>
				<view class="rateStart" v-else>
					<!-- <uni-rate v-model="rateInfo.starMount" :readonly="true" /> -->
					<uni-rate :readonly="true" v-model="rateInfo.starMount" :margin="rateMargin"
						active-color="orange" />
				</view>
				<transition name="fade">
					<view class="reviewContent" v-show="showReviewContent">
						<view class="reviewTextArea">
							<uni-easyinput type="textarea" disabled v-model="value" :maxLength=500
								v-model.trim='rateInfo.feedBack'></uni-easyinput>
						</view>
					</view>
				</transition>
			</view>
		</view>
	</view>
</template>
<script>
	export default {
		name: 'customerReview',
		data() {
			return {
				showReviewContent: false,
				rateMargin: uni.upx2px(32)
			}
		},
		props: {
			rateInfo: {
				type: String
			},
			customerAvatar: {
				type: String
			}
		},
		created() {
			this.rateInfo = this.rateInfo.substring(3, this.rateInfo.length - 1)
			this.rateInfo = JSON.parse(this.rateInfo)
			this.rateInfo.title = this.rateInfo.title.replace(/\{(AgentName)\}/g,
				`<span style="color: #3B59FE;">${this.rateInfo.username}</span>`)
			this.showReviewContent = this.rateInfo.showReviewContent
			// console.log('rateInfo:???', this.rateInfo)
		},
		watch: {
			rateInfo: {
				handler(newVal) {
					if (typeof newVal === 'string') {
						this.rateInfo = JSON.parse(newVal.slice(3, -1))
						this.rateInfo.title = this.rateInfo.title.replace(/\{(AgentName)\}/g,
							`<span style="color: #3B59FE;">${this.rateInfo.username}</span>`)
					}
				}
			}
		},
		methods: {}
	}
</script>
<style scoped lang='less'>
	.content {
		width: calc(100vw - 26px * 2 - 16px * 2 - 10px * 2);
		// height: 191px;
		background: #FFFFFF;
		border-radius: 6px;
		box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.08);
		/* padding: 16px; */
		overflow: hidden;
	}

	.topBox {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		padding: 16px;
		// border-bottom: 1px solid #E7E7E7;
		border-radius: 6px;
		background: #FFF2D8;
		background-image: url('~@/assets/img/bg.png');
		background-repeat: no-repeat;
		background-position: bottom right;
	}

	.portrait {
		width: 74upx;
		height: 74upx;
		border-radius: 50%;
	}

	.portrait>image {
		display: flex;
		width: 74upx;
		height: 74upx;
		border-radius: 50%;
		object-fit: cover;
	}

	.messageContent {
		text-align: left;
	}

	.title {
		text-align: left;
		margin-left: 20px;
		font-size: 16px;
		font-family: SF-Pro;
		font-weight: bold;
		color: #292929;
		line-height: 24px;
	}

	.hiTips {
		width: 44upx;
		height: 34upx;
		background: #3B59FE;
		border-radius: 8px 8px 8px 0px;

		display: flex;
		justify-content: center;
		align-items: center;

		position: relative;
		top: -52px;
		left: 28px;

		image {
			width: 16upx;
			height: 14upx;

		}
	}

	.bottom {
		padding: 16px;

		view {
			font-size: 14px;
			font-family: SF-Pro;
			font-weight: 400;
			color: #292929;
			line-height: 20px;
		}

		.rateStart {
			display: flex;
			align-items: center;
			justify-content: center;
			margin-top: 32upx;

		}


		::v-deep .anticon svg {
			width: 26px;
			height: 26px;
		}
	}


	.reviewContent {
		text-align: left;
		font-size: 14px;
		font-family: SF-Pro;
		font-weight: bold;
		color: #292929;
		line-height: 20px;
		/* margin-top: 32upx; */
	}

	::v-deep .ant-radio-wrapper {
		margin-right: 48px;
		font-size: 14px;
		font-family: SF-Pro;
		font-weight: 400;
		color: #000000;
		line-height: 14px;
	}

	p {
		margin-bottom: 12px;
		font-weight: bold;

	}

	.reviewTextArea {
		position: relative;
		margin-top: 32upx;
		/*隐藏滚动条，当IE下溢出，仍然可以滚动*/
		-ms-overflow-style: none;
		/*火狐下隐藏滚动条*/
		scrollbar-width: none;
	}

	::v-deep .uni-easyinput__content {
		background-color: #fff !important;
		color: #000000;
	}

	::v-deep .ant-input::-webkit-scrollbar {
		display: none;
	}

	::v-deep .ant-input {
		padding: 8px 16px;

		height: 100px;
		resize: none;
		font-family: SF-Pro;
		font-weight: 400;
		color: #292929;
	}

	::v-deep .ant-radio-checked .ant-radio-inner {
		width: 16px;
		height: 16px;
		border-color: #3B59FE;
	}

	.textMountTips {
		position: absolute;
		color: red;
		right: 3px;
		top: 151px;
		font-weight: 400;
		font-size: 12px;
	}

	.thumbs {
		width: 100%;
		padding: 0 78px;
		margin-top: 16px;
		display: flex;
		justify-content: space-between;
	}

	.ant-input:focus,
	.ant-input:hover {
		outline: 0;
		box-shadow: none;
		border-color: rgb(202, 202, 202);
	}

	::v-deep .uni-rate {
		.uni-rate__icon {
			.uni-icons {
				font-size: 66upx !important;
			}
		}
	}
</style>
