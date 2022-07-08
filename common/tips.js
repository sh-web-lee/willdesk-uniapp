export default {
	loading: () => {
		uni.showLoading({
			mask: true
		})
	},
	hideLoading: () => {
		uni.hideLoading()
	},
	// toast: (tipsText) => {
	// 	uni.showToast({
	// 		title: tipsText,
	// 		icon: 'none',
	// 		mask: true
	// 	})
	// },
	toast: (title, duration = 1500, mask = true, icon = 'none') => {
		if (Boolean(title) === false) {
			return;
		}
		uni.showToast({
			title,
			duration,
			mask,
			icon
		});
	},
	hideToast: () => {
		uni.hideToast()
	}
}
