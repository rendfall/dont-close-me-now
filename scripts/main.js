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
        API_URL: 'https://picsum.photos'
    };

    function buildImageSource() {
        return `${APP_CONFIG.API_URL}/${window.outerWidth}/${window.outerHeight}/?time=${Date.now()}`;
    }

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

    class Slider {
        constructor() {
            this.$image = new Image();
            this.isCancelRequested = false;
            this.loopId = null;

            this.setupListeners();
        }

        onLoaded() {}
        onError() {}
        onLoading() {}

        setupListeners() {
            this.$image.addEventListener('load', (event) => {
                if (this.isCancelRequested) {
                    return;
                }

                this.onLoaded(event.target.src);
                this.startLoop();
            });

            this.$image.addEventListener('error', (error) => {
                if (this.isCancelRequested) {
                    return;
                }

                this.onError(error);
                this.startLoop();
            });
        }

        get image$() {
            const api = {
                onLoaded: (fn) => {
                    this.onLoaded = fn;
                    return api;
                },
                onError: (fn) => {
                    this.onError = fn;
                    return api;
                },
                onLoading: (fn) => {
                    this.onLoading = fn;
                    return api;
                }
            };

            return api;
        }

        startLoop() {
            const src = buildImageSource();

            this.loopId = window.setTimeout(() => {
                this.onLoading(src);
                this.$image.src = src;
            }, APP_CONFIG.REFRESH_INTERVAL);
        }

        stopLoop() {
            this.$image.src = '';
            this.isCancelRequested = true;
            window.clearTimeout(this.loopId);
            this.loopId = null;
        }

        render($target) {
            $target.appendChild(this.$image);
        }
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
            this.closePreventer = null;

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
            const slider = new Slider();

            slider.render(sliderLayer.$);

            this.slider = slider;
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

                this.startSlider();
            });
        }

        startSlider() {
            this.slider.image$
                .onLoading((src) => {
                    this.switchLayer(LAYERS.LOADER);
                })
                .onLoaded((src) => {
                    this.switchLayer(LAYERS.SLIDER);
                })
                .onError((error) => {
                    console.error(error);
                });

            this.slider.startLoop();
        }

        stopSlider() {
            this.slider.stopLoop();
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        new App();
    }, {
        passive: true,
        once: true
    });
}
