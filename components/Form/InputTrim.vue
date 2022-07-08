<template>
	<input :type="type" value="" />
</template>

<script>
	export default ({
		data() {
			return {}
		},
		props: {
			type: {
				type: String,
				default: 'text'
			},
			modal: {
				type: String,
				default: ''
			}
		}
	})
</script>

<style>
</style>
