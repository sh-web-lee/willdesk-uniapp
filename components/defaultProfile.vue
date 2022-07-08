<template>
	<view class="defalut-profile-box">
		<!-- 有头像 -->
		<block v-if="profile">
			<view class="u-profile profile" :style="{ 'width': `${size}upx`, 'height': `${size}upx` }">
				<image class="img" :src="profile + '?x-oss-process=image/resize,p_50/format,webp/quality,q_50'" mode="aspectFill" lazy-load></image>
				<cacheImage v-if="avatarMd5" :url="avatar" :fileMd5="avatarMd5" width="140rpx" height="140rpx" radius="100%"></cacheImage>
			</view>
		</block>
		<!-- 没有头像 -->
		<block v-else>
			<view class="d-profile">
				<!-- 有名称 -->
				<view class="default-profile profile" :style="{ 'background': defaultProfile.color, 'width': `${size}upx`, 'height': `${size}upx`, 'fontSize': `${fontSize}upx` }" v-if="name">
					{{ defaultProfile.name }}
				</view>
				<!-- 没有名称 -->
				<view class="default-profile profile" :style="{ 'width': `${size}upx`, 'height': `${size}upx` }" v-else>
					<image class="img" src="/static/default1.svg" mode="aspectFit" lazy-load></image>
				</view>
			</view>
		</block>
	</view>
</template>

<script>
	import cacheImage from '@/components/cacheImage/cacheImage.vue'
	import { createName, createColors } from '@/utils/publicMethods.js'
	export default {
		name:"defaultProfile",
		components: [cacheImage],
		data() {
			return {
				avatarMd5: '',
				avatar: ''
			};
		},
		props: {
			// 头像链接
			profile: {
				type: String,
				default: ''
			},
			// 名称
			name: {
				type: String,
				default: ''
			},
			// 坐席头像
			serviceProfile: {
				type: String,
				default: ''
			},
			// 坐席名称
			serviceName: {
				type: String,
				default: ''
			},
			// 图片大小
			size: {
				type: Number || String,
				default: 36
			},
			// 字体大小
			fontSize: {
				type: Number || String,
				default: 16
			},
			// 有边框的边框颜色
			borderWidth: {
				type: Number || String,
				default: 0
			}
		},
		computed: {
			defaultProfile() {
				// console.log();
				const name = createName(this.name)
				const color = createColors(this.name)
				return { name, color }
			}
		}
	}
</script>

<style scoped lang="scss">
	.defalut-profile-box {
		background: #D0D0D0;
		position: relative;
		border-radius: 50%;
		.profile {
			.img {
				width: 100%;
				height: 100%;
				border-radius: 50%;
			}
		}
		.default-profile {
			color: #fff;
			display: flex;
			align-items: center;
			justify-content: center;
			font-weight: bold;
			border-radius: 50%;
		}
	}
</style>