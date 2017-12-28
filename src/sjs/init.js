'use strict';

(function($) {

	$(document).ready(function() {
        accordions.init();
        anchors.init();
        inputInteractedClasses.init();
        popups.init();
        tabs.init();
	});

	$(window).on('resize', function () {
		if ($(window).width() !== global.windowWidth) {
			global.windowWidth = $(window).width();

		}
	});

	$(window).on('load', function () {

	});

}(jQuery));