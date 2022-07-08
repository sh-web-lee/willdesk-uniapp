<template>
	<view class="portrait" @click="upLoadAvatar">
		<image v-if="avatarSrc != ''" :src="avatarSrc" mode="aspectFill" lazy-load></image>
		<defaultProfile v-else profile='' :name="name" :size="100" :fontSize="32"></defaultProfile>
		<view class="small">
			<image src="/static/setting/camera.svg" mode="aspectFit" lazy-load></image>
		</view>
	</view>
</template>

<script>
	import {
		textToImg
	} from '@/utils/publicMethods.js'
	import defaultProfile from '@/components/defaultProfile.vue'
	import {
		mapActions
	} from 'vuex'

	export default {
		data() {
			return {
				imagePrefix: "https://img.willdesk.com/"
			}
		},
		props: {
			// portrait和small传进来的值只能以 /static 开头
			portrait: {
				type: String,
				default: ""
			},
			name: {
				type: String,
				default: ''
			},
		},
		components: {
			defaultProfile
		},
		onLoad() {
			this.name = 'Text'
		},
		computed: {
			avatarSrc() {
				if (this.portrait != '') {
					return this.portrait.indexOf(this.imagePrefix) == -1 ? this.imagePrefix + this.portrait : this.portrait
				} else {
					return ''
				}
			}
		},
		methods: {
			upLoadAvatar() {
				const _this = this
				uni.chooseImage({
					count: 1, //默认9
					success: function(res) {
						const imgPaths = res.tempFilePaths[0]
						// 显示Loading
						uni.showLoading({
							title: 'Uploading...'
						})
						const params = {
							location: imgPaths,
							url: imgPaths,
							name: imgPaths.substring(imgPaths.lastIndexOf("\/") + 1, imgPaths.length),
							type: 'avatar'
						}
						_this.$emit('upLoadImg', params)
					}
				});
			},
		}
	}
</script>

<style scoped lang="scss">
	.portrait {
		width: 100upx;
		height: 100upx;
		background-color: #D0D0D0;
		border-radius: 50%;
		text-transform: uppercase;
		position: relative;

		font-size: $font-size-lg;
		font-family: SF-Pro;
		font-weight: 600;
		color: #fff;
		line-height: 40upx;

		display: flex;
		align-items: center;
		justify-content: center;

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
			overflow: hidden;

			image {
				border-radius: 0;
				z-index: 2;
			}
		}
	}

	::v-deep .file-picker__box-content {
		border-radius: 50% !important;
	}
</style>
