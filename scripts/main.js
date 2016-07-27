(function (root, undefined) {
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
        root.setTimeout(function () {
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
        root.clearTimeout(timeoutID);
        
        refreshImage(function () {
            timeoutID = root.setTimeout(loop, REFRESH_DELAY);
        });
    }

    root.onload = function () {
        loop();

        $cover.addEventListener('click', function () {
            loop();
        });
    }

    root.addEventListener('blur', function () {
        root.clearTimeout(timeoutID);
    });

    root.addEventListener('focus', function () {
        loop();
    });

    root.onbeforeunload = function (e) {
        return 'Do you really want to close?';
    }
})(window);
