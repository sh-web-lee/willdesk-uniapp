<template>
	<view class="portrait">
		<uni-file-picker :readonly="portrait_readonly" :value="portraitSrc" :imageStyles="imageStyles"
			file-mediatype="image" v-if="portrait_readonly"></uni-file-picker>
		<image :src="portraitSrc" mode="aspectFill" lazy-load v-else></image>
		<view class="small" v-show="small !== ''">
			<uni-file-picker :readonly="small_readonly" limit="1" :del-icon="false" disable-preview
				:imageStyles="imageStylesSmall" file-mediatype="image" v-if="small == '/static/setting/camera.svg'">
				<image :src="small" mode="aspectFit" lazy-load></image>
			</uni-file-picker>
			<image :src="small" mode="aspectFit" lazy-load v-else></image>
		</view>
	</view>
</template>

<script>
	import {
		textToImg
	} from '@/utils/publicMethods.js'

	export default {
		data() {
			return {
				imageStyles: {
					width: uni.upx2px(100),
					height: uni.upx2px(100),
					border: false,
					borderStyle: {
						radius: "50%" // 边框圆角，不支持百分比
					},
				},
				imageStylesSmall: {
					width: uni.upx2px(40),
					height: uni.upx2px(40),
					border: false,
				},
			}
		},
		props: {
			// portrait和small传进来的值只能以 /static 开头
			portrait: {
				type: String,
				default: "/static/default.svg"
			},
			small: {
				type: String,
				default: ''
			},
			name: {
				type: String,
				default: ''
			},
			portrait_readonly: {
				type: Boolean,
				default: false
			},
			small_readonly: {
				type: Boolean,
				default: false
			}
		},
		onLoad() {
			this.name = 'Text'
		},
		computed: {
			portraitSrc() {
				if (this.portrait == '' && this.name != '') {
					return textToImg(this.name)
				} else {
					if (this.portrait_readonly) {
						let arr = [{
							url: this.portrait,
							extname: this.portrait.substring(this.portrait.lastIndexOf(".") + 1, this.portrait
								.length),
							name: this.portrait.substring(this.portrait.lastIndexOf("\/") + 1, this.portrait
								.length)
						}]
						return arr
					} else {
						return this.portrait
					}
				}
			},
			smallSrc() {
				if (this.small_readonly) {
					let arr = [{
						url: this.small,
						extname: this.small.substring(this.small.lastIndexOf(".") + 1, this.small
							.length),
						name: this.small.substring(this.small.lastIndexOf("\/") + 1, this.small
							.length)
					}]
					return arr
				} else {
					return this.small
				}
			}
		}
	}
</script>

<style scoped lang="scss">
	.portrait {
		width: 100upx;
		height: 100upx;
		line-height: 100upx;
		background-color: #D0D0D0;
		border-radius: 50%;
		position: relative;

		font-size: $font-size-lg;
		font-family: SF-Pro;
		font-weight: 600;
		color: #fff;
		line-height: 40upx;

		display: flex;
		align-items: center;
		justify-content: center;

		overflow: hidden;

		image {
			border-radius: 50%;
		}

		.small {
			width: 40upx;
			height: 40upx;

			background: #fff;
			border-radius: 50%;

			position: absolute;
			right: -10upx;
			bottom: 0;

			display: flex;
			align-items: center;
			justify-content: center;

			z-index: 1;

			image {
				width: 90%;
				height: 90%;
				border-radius: 50%;
			}
		}
	}
</style>
