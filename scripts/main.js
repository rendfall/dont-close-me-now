(function (root) {
    'use strict';

    var REFRESH_DELAY = 11 * 1000; // 11 seconds
    var TRANSITION_DELAY = 1000; // 1000 ms of transition

    var $cover = root.document.getElementById('cover');
    var timeoutID = null;

    function buildImageURL() {
        var width = $cover.clientWidth;
        var height = $cover.clientHeight;

        return 'https://unsplash.it/' + width + '/' + height + '/?random&time=' + Date.now();
    }

    function refreshImage(cb) {
        $cover.classList.add('loading');

        // Force transition delay.
        setTimeout(function () {
            $cover.src = buildImageURL();

            if (typeof cb === 'function') {
                $cover.onload = function () {
                    $cover.classList.remove('loading');
                    cb.apply();
                }
            }
        }, TRANSITION_DELAY);
    }

    function loop() {
        clearTimeout(timeoutID);
        
        refreshImage(function () {
            timeoutID = setTimeout(loop, REFRESH_DELAY);
        })
    }

    root.onload = function () {
        loop();

        $cover.addEventListener('click', function () {
            refreshImage();
        })
    }

    root.addEventListener('blur', function () {
        clearTimeout(timeoutID);
    });

    root.addEventListener('focus', function () {
        loop();
    });

    root.onbeforeunload = function (e) {
        return confirm('Are you sure?');
    }
})(window, undefined);
