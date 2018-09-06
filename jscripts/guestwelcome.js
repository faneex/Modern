!function($) {
    var myDiv,
        closeButton;

    function init() {
        myDiv = $(".guestwelcome");
        closeButon = $("#closeButton");

        if (Cookie.get("CloseAlertt") != "Close") {
            myDiv.show();
        }

        closeButon.click(onClose);
    }

    function onClose(e) {
        Cookie.set("CloseAlertt", "Close", 259200);
        myDiv.hide();
    }

    $(init);
}(jQuery);