
jQuery(function($) {

	/*jQuery(".tborder  tbody[id$='_e'], .tborder tbody[id$='_e']").fancyCollapses({easing:"easeInOutQuart",speed:"normal"});
	
	if(jQuery().fancyCollapses){
        jQuery(".tborder  tbody[id$='_e']").fancyCollapses({easing: "easeInOutQuart", speed: "normal"});
		jQuery(".tborder5  tbody[id$='_e']").fancyCollapses({collapser: ".tborder .tcat .expander", easing: "easeInOutQuart", speed: "normal"});
		if ($('.thead > .expcolimage').not('.all-radius')) {
		jQuery('.thead > .expcolimage').click(function () {
			$(this).parent().toggleClass('all-radius');
		});
		} else {
			jQuery('.thead > .expcolimage').click(function () {
				jQuery(this).parent().toggleClass('no-radius');
			});
		}
	}*/


	
	jQuery(".width_fluid").hide();
    jQuery(".width_fixed").click(function() {
        jQuery(".mainwidth").animate({width: '96%'},{easing: 'easeInQuint'});
        jQuery(this).hide();
        jQuery(".width_fluid").show();
        jQuery.cookie("width","fluid", {expires: 365});
        return false;
    });
    jQuery(".width_fluid").click(function() {
        jQuery(".mainwidth").animate({width: '960px'},{easing: 'easeOutQuint'});
        jQuery(this).hide();
        jQuery(".width_fixed").show();
        $.cookie("width","fixed", {expires: 365});
        return false;
    });
    if($.cookie("width") == "fluid") {
        jQuery(".width_fixed").hide();
        jQuery(".width_fluid").show();
        jQuery(".mainwidth").css({width: '96%'});
    };
	}