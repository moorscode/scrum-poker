<template>
	<div class="theme">
		<link :href=styleSheetURL type="text/css" rel="stylesheet" />
		Theme: <select @change="onChange($event)" v-model="theme">
			<option value="default">Default</option>
			<option value="default-dark">Default (dark)</option>
		</select>
	</div>
</template>

<script>
export default {
	name: "ThemePicker",
	data() {
		return {
			theme: window.localStorage.getItem( "theme" ) || "default",
		};
	},
	methods: {
		onChange() {
			window.localStorage.setItem( "theme", this.theme );
		},
	},
	computed: {
		styleSheetURL() {
			return "/css/" + this.theme + ".css";
		},
	},
};
</script>
