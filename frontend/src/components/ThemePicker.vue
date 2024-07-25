<template>
	<div class="theme container">
		<link :href=styleSheetURL type="text/css" rel="stylesheet" />
		Theme: <select @change="onChange($event)" v-model="theme">
		    <option v-for="entry in themes" :value="entry.value" v-bind:key="entry.value">{{entry.text}}</option>
		    <option v-for="entry in themes" :value="entry.value + ':dark'" v-bind:key="entry.value + ':dark'">{{entry.text}} (dark)</option>
		</select>
	</div>
</template>

<script>
export default {
	name: "ThemePicker",
	data() {
		return {
			theme: window.localStorage.getItem( "theme" ) || "default",
			themes: [
				{ value: "default", text: "Default" },
				{ value: "rounded", text: "Rounded" },
				{ value: "old-skool", text: "Old Skool" },
				{ value: "mos", text: "MOS" },
			],
		};
	},
	created() {
		this.onChange();
	},
	methods: {
		onChange() {
			window.localStorage.setItem( "theme", this.theme );

			const parts = this.theme.split( ":" );
			if ( parts[ 1 ] ) {
				document.body.setAttribute( "data-theme", parts[ 1 ] );
			} else {
				document.body.removeAttribute( "data-theme" );
			}
		},
	},
	computed: {
		styleSheetURL() {
			const parts = this.theme.split( ":" );

			return "/css/" + parts[ 0 ] + ".css";
		},
	},
};
</script>
