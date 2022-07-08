<template>
	<view class="options">
		<view v-for="(item,i) in dataList" :key='i'>
			<view class="option1" :class="i+1 == dataList.length ? 'optionEnd' : ''">
				<view class="option2" @click="_click(item)">
					<image :src="item.icon" mode="aspectFit"></image>
					<view class="option3">
						<text>{{item.content}}</text>
						<image src="/static/arrow_right.svg" mode="aspectFit" v-if="item.status == 'arrow'"></image>
						<switch @change="switchChange" v-else-if="item.status == 'switch'" />
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		throttle
	} from '@/utils/publicMethods.js'
	let throttleFunc = null
	export default {
		name: "options",
		data() {
			return {

			};
		},
		props: {
			// dataList: [{
			// 	content: '文本内容',
			// 	icon: '左侧图片链接，只能以 /static 开头(例：/static/default.svg)',
			// 	status: '如果是switch,就填switch;如果不显示任何组件或图片则不填;如果是右箭头则填arrow',
			// 	methods: '对应的点击方法，引用方法需要在引用组件时加上对应的方法，例： <options @方法名='方法名'></options>',
			// 	args: '方法要带的参数，可不填',
			// }, {
			// 	...
			// }]
			dataList: {
				type: Array
			}
		},
		created() {
			throttleFunc = throttle(500)
		},
		methods: {
			_click(item) {
				throttleFunc(() => {
					if (item.status == 'switch') {} else {
						this.$emit(item.methods, item.args)
					}
				})
			},
			switchChange: function(e) {
				throttleFunc(() => {
					// console.log('switch 发生 change 事件，携带值为', e.detail.value)
					this.$emit('switchChange', e.detail.value)
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.options {
		>:first-child {
			.option3 {
				border-bottom: 1upx solid #EAEAEA;
			}
		}

		.option1 {
			.option2 {
				// margin: 16upx;
				// padding: 0 32upx;
				// background: rgba(0, 0, 0, 0.04);
				// border-radius: 12upx;
				height: 94upx;
				background: #fff;
				padding-left: 32upx;
				display: flex;
				// flex-direction: row;
				align-items: center;
				// justify-content: space-between;

				image {
					&:first-child {
						width: 52upx;
						height: 52upx;

						margin-right: 32upx;
					}

					&:last-child {
						width: 12upx;
						height: 20upx;
					}
				}


				&:active {
					background: #EAEAEA;
				}

				.option3 {
					display: flex;
					align-items: center;
					flex: 1;
					padding-right: 32upx;
					height: 100%;

					text {
						font-size: $font-size-lg - 2upx !important;
						font-weight: 400;
						flex: 1;
					}
				}
			}
		}
	}

	.optionEnd {
		margin-top: 32upx;
		padding-top: 16upx;
		margin-bottom: 0px;
	}
</style>
