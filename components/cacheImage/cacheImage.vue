<template>
	<view class="wrap">
		<image :src="src" :style="{width: width,height:height,borderRadius:radius}"></image>
	</view>
</template>

<script>
	import md5 from 'js-md5'
	export default {
		props: {
			url: {
				type: String,
				default () {
					return ''
				}
			},
			fileMd5: {
				type: String,
				default () {
					return ''
				}
			},
			width: {
				type: String,
				default () {
					return '';
				}
			},
			height: {
				type: String,
				default () {
					return '';
				}
			},
			radius: {
				type: String,
				default () {
					return '';
				}
			}
		},
		data() {
			return {
				src: '' // 图片地址
			}
		},
		watch: {
			// 监听头像md5值的变化
			fileMd5(val) {
				// 查找获取图片缓存
				this.getImageCache()
			}
		},
		created() {
			// 查找获取图片缓存
			this.getImageCache()
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
			}
		}
	}
</script>

<style scoped lang="scss">
	.wrap {}
</style>
