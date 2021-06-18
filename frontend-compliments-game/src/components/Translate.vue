<template>
	<div class="translate">
		<p>
			Translate this page in
			your preferred language:
		</p>
		<span id="google_translate_element"/>
	</div>
</template>

<script>
/* global google */

export default {
	name: "Translate",
	mounted() {
		this.$nextTick( () => {
			this.googleTranslateInit();
		} );
	},
	methods: {

		googleTranslateInit: function() {
			const checkIfGoogleLoaded = setInterval( () => {
				if ( google.translate.TranslateElement !== null ) {
					clearInterval( checkIfGoogleLoaded );

					this.googleTranslateElement( "google_translate_element" );
				}
			}, 100 );
		},

		googleTranslateElement: function( id ) {
			// eslint-disable-next-line no-new
			new google.translate.TranslateElement( {
				pageLanguage: "en",
				layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
			}, id );
		},
	},
};

</script>
