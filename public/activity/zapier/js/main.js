/* global requirejs */
requirejs.config({
	baseUrl: "../../../vendor",
	paths: {
		postmonger: "postmonger.min",
		jquery: "jquery.min",
		activity: "../activity/zapier/js/activity"
	}
});	

requirejs( ['activity'], function(activity) {
	console.log( 'REQUIRE LOADED' );
});
	
requirejs.onError = function( err ) {
	console.log( "REQUIRE ERROR: ", err );
	if( err.requireType === 'timeout' ) {
		console.log( 'modules: ' + err.requireModules );
	}
	throw err;
};