{
    const ONE_SECOND = 1e3;
    const LAYERS = {
        LOADER: 'loader',
        CLICK_IT: 'click-it',
        OFFLINE: 'offline',
        SLIDER: 'slider'
    };
    const APP_CONFIG = {
        REFRESH_INTERVAL: 6 * ONE_SECOND,
        API_URL: 'https://unsplash.it'
    };

    // function fadeIn(layer, display = 'block'){
    //     layer.setStyle({
    //         opacity: 0,
    //         display
    //     });
    //
    //     (function fade() {
    //         const currentValue = layer.getStyle('opacity');
    //         const nextValue = Number.parseFloat(currentValue) + 0.1;
    //
    //         if (nextValue <= 1) {
    //             layer.setStyle({ opacity: nextValue });
    //             requestAnimationFrame(fade);
    //         }
    //     })();
    // }
    //
    // function fadeOut(layer, display = 'block'){
    //     layer.setStyle({
    //         opacity: 1,
    //         display
    //     });
    //
    //     (function fade() {
    //         const currentValue = layer.getStyle('opacity');
    //         const nextValue = Number.parseFloat(currentValue) - 0.1;
    //
    //         if (nextValue >= 0) {
    //             layer.setStyle({ opacity: nextValue });
    //             requestAnimationFrame(fade);
    //         }
    //     })();
    // }

    function getRandomImageSrc() {
        return `${APP_CONFIG.API_URL}/${window.outerWidth}/${window.outerHeight}/?random&time=${Date.now()}`;
    }

    class CloseBrowserPreventer {
        constructor() {
            this.confirmationMessage = 'Do you really want to close?';
        }

        enable() {
            window.addEventListener('beforeunload', this.handler);
        }

        disable() {
            window.removeEventListener('beforeunload', this.handler);
        }

        handler(evt) {
            evt.returnValue = this.confirmationMessage;
            return this.confirmationMessage;
        }
    }

    class Layer {
        constructor(id) {
            this.id = id;
            this.$ = document.getElementById(id);
            this.hide();
        }

        on(eventName, fn) {
            this.$.addEventListener(eventName, fn);
        }

        hide() {
            this.$.style.zIndex = -9999;
        }

        show() {
            this.$.style.zIndex = 9999;
        }

        setStyle(obj) {
            Object.assign(this.$.style, obj);
        }

        getStyle(name) {
            return this.$.style[name];
        }

        destroy() {
            this.$.remove();
        }
    }

    class App {
        constructor() {
            this.layers = new Map();
            this.currentLayer = null;
            this.loopId = null;
            this.closePreventer = null;
            this.$image = null;

            this.setupLayers();
            this.setupCloseBrowserPreventer();
            this.setupUserClickRequest();
            this.setupSlider();
            this.initialize();
        }

        setupLayers() {
            Object.values(LAYERS)
                .forEach((id) => {
                    this.layers.set(id, new Layer(id));
                });
        }

        setupSlider() {
            const sliderLayer = this.layers.get(LAYERS.SLIDER);
            const $image = new Image();
            sliderLayer.$.appendChild($image);

            // sliderLayer.on('click', () => {
            //     if (this.loopId === null) {
            //         this.nextImage();
            //     } else {
            //         this.resetLoop();
            //     }
            // });

            $image.addEventListener('load', () => {
                this.switchLayer(LAYERS.SLIDER);
                this.nextImage();
            });

            this.$image = $image;
        }

        switchLayer(layerId) {
            const currentLayerId = this.currentLayer && this.currentLayer.id;
            if (currentLayerId === layerId) {
                return;
            }

            const nextLayer = this.layers.get(layerId);
            this.currentLayer = nextLayer;

            this.layers.forEach((layer) => {
                if (layer.id === nextLayer.id) {
                    layer.show();
                } else {
                    layer.hide();
                }
            });
        }

        nextImage() {
            this.resetLoop();
            this.loopId = window.setTimeout(() => {
                this.renderImage();
            }, APP_CONFIG.REFRESH_INTERVAL);
        }

        resetLoop() {
            window.clearTimeout(this.loopId);
            this.loopId = null;
        }

        renderImage() {
            this.switchLayer(LAYERS.LOADER);
            this.$image.src = getRandomImageSrc();
        }

        setupCloseBrowserPreventer() {
            this.closePreventer = new CloseBrowserPreventer();
            this.closePreventer.enable();
        }

        initialize() {
            this.switchLayer(LAYERS.CLICK_IT);
        }

        setupUserClickRequest() {
            const clickItLayer = this.layers.get(LAYERS.CLICK_IT);

            clickItLayer.on('click', () => {
                this.switchLayer(LAYERS.LOADER);
                clickItLayer.destroy();
                this.nextImage();
            });
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        new App();
    }, {
        passive: true,
        once: true
    });
}
