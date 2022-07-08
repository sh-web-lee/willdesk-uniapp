<template>
	<view class="badge">
		<view v-if="text">
			<view class="Num"><text>{{text > 99 ? "99+" : text}}</text></view>
			<slot></slot>
		</view>
		<view v-else>
			<slot></slot>
		</view>
	</view>
</template>

<script>
	export default {
		name: "badge",
		props: {
			text: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {

			};
		}
	}
</script>

<style lang="scss">
	.badge {
		position: relative;
		z-index: 11;

		.Num {
			min-width: 20upx;
			min-height: 20upx;
			padding: 1upx 10upx;
			background: #F22;
			border-radius: 20upx;

			position: absolute;
			top: 0%;
			right: -50%;
			z-index: 12;
			transform: translate(0%, -50%);
			display: flex;
			align-items: center;
			justify-content: center;

			text {
				font-family: SF-Pro;
				font-weight: bold;
				font-size: $font-size-lg - 8upx !important;
				color: #fff;
			}
		}
	}
</style>
