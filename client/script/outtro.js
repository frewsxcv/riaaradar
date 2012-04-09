    return {
        init: function () {
            if ($.support.cors) {
                registerActions();
            } else {
                alert('Sorry, your browser doesn\'t support CORS');
            }
        }
    };
}());
