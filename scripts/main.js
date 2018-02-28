((root, undefined) => {
    const ONE_SECOND = 1e3;

    class App {
        static get CONFIG() {
            return {
                REFRESH_DELAY: 6, // Seconds;
                API_URL: 'https://unsplash.it'
            }
        };

        constructor(id) {
            this.$image = root.document.getElementById(id);
            this.$state = root.document.getElementById('state');
            this.loop = null;
            this.isLoopRunning = false;

            this.setupListeners();
            this.initialize();
        }

        setupListeners() {
            root.addEventListener('beforeunload', (evt) => {
                const confirmationMessage = 'Do you really want to close?';
                evt.returnValue = confirmationMessage;
                return confirmationMessage;
            });

            root.addEventListener('click', () => {
                this.isLoopRunning
                    ? this.stopLoop()
                    : this.startLoop();
            })
        }

        initialize() {
            this.startLoop();
        }

        buildImageUrl() {
            const { clientWidth, clientHeight } = this.$image;
            const now = Date.now();
            return `https://unsplash.it/${clientWidth}/${clientHeight}/?random&time=${now}`;
        }

        renderImage(src) {
            const { $image } = this;

            $image.classList.add('loading');
            $image.addEventListener('load', () => {
                $image.classList.remove('loading');
            });
            $image.src = src;
        }

        startLoop() {
            const { REFRESH_DELAY } = App.CONFIG;

            let accumulatedTime = 0;
            let lastTime = 0;

            const nextStep = (deltaTime) => {
                accumulatedTime += (deltaTime - lastTime) / ONE_SECOND;
                lastTime = deltaTime;

                if (accumulatedTime > REFRESH_DELAY) {
                    this.clockTick(lastTime / ONE_SECOND);
                    accumulatedTime = 0;
                }

                this.loop = root.requestAnimationFrame(nextStep);
            };

            this.clockTick(0);
            this.loop = root.requestAnimationFrame(nextStep);
            this.isLoopRunning = true;
            this.$state.classList.remove('paused');
        }

        stopLoop() {
            window.cancelAnimationFrame(this.loop);
            this.isLoopRunning = false;
            this.$state.classList.add('paused');
        }

        clockTick(time) {
            const imageSrc = this.buildImageUrl();
            this.renderImage(imageSrc);
        }
    }

    root.addEventListener('DOMContentLoaded', () => {
        new App('image');
    }, {
        passive: true,
        once: true
    });
})(this);
