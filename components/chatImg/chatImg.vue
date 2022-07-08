<template>
	<view class="image">
		<!-- <cache-image v-if="chatItemInfo.seq" :url="imgSrc" :fileMd5="avatarMd5" width="140rpx" height="140rpx" radius="100%"></cache-image> -->
		<image class="chatContent_imgMsg defaultImg" lazy-load
			style="border-radius: 6px;"
			:style="{ 'width': `${width}px`, 'height': `${height}px` }"
			:src="imgSrc"
			mode="aspectFill" 
			@load="imgLoaded" 
			@error="imgError"
			@tap.stop="previewImg(itemMsg ? (itemMsg.ossUrl ? $store.state.ossSetting.host + '/' + itemMsg.ossUrl : itemMsg.blobSrc) : imgSrc)">
		</image>
		<image v-if="!loaded" class="loadingImg" src="/static/status/loading@3x.png" mode=""></image>
		<view class="progress" :style="{width: `${progress}%`}" v-if="progress!==0&&progress!==100"></view>
	</view>
</template>

<script>
	import cacheImage from '@/components/cacheImage/cacheImage.vue'
	import { mapGetters } from 'vuex'
	import md5 from 'js-md5'
	export default {
		name:"chatImg",
		components: {
			cacheImage
		},
		data() {
			return {
				errorImg: require('@/assets/img/errorImg.png'),
				imgSrc: '',
				width: 50,
				height: 50,
				loaded: false,
				progress: 0,
				avatarMd5: '',
				avatar: ''
			};
		},
		props: {
			src: String,
			itemMsg: Object,
			chatItemInfo: Object
		},
		computed: {
			...mapGetters(['uploadFileStatus'])
		},
		watch: {
			src: {
				handler(src) {
					this.imgSrc = src
				},
				immediate: true
			},
			uploadFileStatus: {
				handler(newValue) {
					const filterData = newValue.filter(item => item.seq === this.chatItemInfo.seq)
					if (filterData.length) {
						this.progress = filterData[0].progress
					}
				},
				deep: true
			},
			// 监听头像md5值的变化
			fileMd5(val) {
				// 查找获取图片缓存
				this.getImageCache()
			}
		},
		async created() {
			// this.getImageCache() // 查找获取图片缓存
			const res = await uni.getImageInfo({ src: this.src })
			const innerWidth = (this.$store.state.deviceInfo.screenWidth) * 0.5
			const innerHeight = this.$store.state.deviceInfo.screenHeight * 0.5
			let obj = res[1]
			if (obj) {
			  if (obj.width <= innerWidth && obj.width >= 50) {
					obj.height = obj.height
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
				if (obj.height > innerHeight) {
					obj.width = innerHeight * obj.width / obj.height
					obj.height = innerHeight
				}
				this.width = obj.width
				this.height = obj.height
			}
		},
		methods: {
			// 查找获取图片缓存
			async getImageCache() {
				// #ifdef APP-PLUS
				var result = await this.$util.getImageCache(this.url, this.fileMd5)
				if (result) {
					this.src = result
				} else {
					this.src = this.url
				}
				// #endif
				// #ifndef APP-PLUS
				this.src = this.url
				// #endif
			},
			// 预览图片
			previewImg(img) {
				uni.previewImage({
					urls: [img]
				})
			},
			imgError() {
				this.imgSrc = this.errorImg
			},
			imgLoaded(res) {
				this.loaded = true
				this.$emit('watchImageHeightChange', res)
			},
		}
	}
</script>

<style lang="scss" scoped>
	.image {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.loadingImg {
		width: 50upx;
		height: 50upx;
		animation: loading 0.4s linear infinite;
		position: absolute;
		top: 50%;
		left: 50%;
		margin-top: -25upx;
		margin-left: -25upx;
	}
	@keyframes loading {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
	.defaultImg {
		display: flex;
		background: #e7e9ec;
		position: relative;
	}
	.progress {
		position: absolute;
		bottom: 0;
		left: 0;
		height: 8upx;
		transition: width 0.2s ease;
		background: #52a6ff;
	}
</style>