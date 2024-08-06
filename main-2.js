// Utility functions
function normalizeWheel(event) {
    let spinX = 0, spinY = 0, pixelX = 0, pixelY = 0;
    if ('detail' in event) spinY = event.detail;
    if ('wheelDelta' in event) spinY = -event.wheelDelta / 120;
    if ('wheelDeltaY' in event) spinY = -event.wheelDeltaY / 120;
    if ('wheelDeltaX' in event) spinX = -event.wheelDeltaX / 120;
    if ('axis' in event && event.axis === event.HORIZONTAL_AXIS) {
        spinX = spinY;
        spinY = 0;
    }
    pixelX = spinX * 10;
    pixelY = spinY * 10;
    if ('deltaY' in event) pixelY = event.deltaY;
    if ('deltaX' in event) pixelX = event.deltaX;
    if (event.deltaMode) {
        if (event.deltaMode === 1) {
            pixelX *= 40;
            pixelY *= 40;
        } else {
            pixelX *= 800;
            pixelY *= 800;
        }
    }
    if (pixelX && !spinX) spinX = pixelX < 1 ? -1 : 1;
    if (pixelY && !spinY) spinY = pixelY < 1 ? -1 : 1;
    return { spinX, spinY, pixelX, pixelY };
}

function setTransform(element, value, axis = 'y') {
    if (axis === 'y') {
        element.style.transform = `translate3d(0, ${value}px, 0)`;
    } else {
        element.style.transform = `translate3d(${value}px, 0, 0)`;
    }
}

// Scroll Manager class
class ScrollManager {
    constructor(options = {}) {
        this.options = Object.assign({
            selector: '[data-scroll]',
            selectorChild: '[data-scroll-item]',
            horizontal: false,
            snap: false
        }, options);

        this.container = document.querySelector(this.options.selector);
        this.sections = Array.from(this.container.querySelectorAll(this.options.selectorChild));
        this.currentSectionIndex = 0;

        this.init();
    }

    init() {
        this.updateSectionPositions();
        this.setupEvents();
    }

    setupEvents() {
        window.addEventListener('resize', this.updateSectionPositions.bind(this));
        window.addEventListener('wheel', this.onWheel.bind(this), { passive: true });

        const hammer = new Hammer(this.container);
        hammer.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
        hammer.on('swipeup', () => this.scrollToNext());
        hammer.on('swipedown', () => this.scrollToPrevious());

        window.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    updateSectionPositions() {
        this.sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            section.dataset.offsetTop = rect.top + window.pageYOffset;
            section.dataset.offsetLeft = rect.left + window.pageXOffset;
        });
    }

    scrollToNext() {
        if (this.currentSectionIndex < this.sections.length - 1) {
            this.currentSectionIndex++;
            this.scrollTo(this.currentSectionIndex);
        }
    }

    scrollToPrevious() {
        if (this.currentSectionIndex > 0) {
            this.currentSectionIndex--;
            this.scrollTo(this.currentSectionIndex);
        }
    }

    scrollTo(index) {
        const section = this.sections[index];
        if (section) {
            const offsetTop = parseFloat(section.dataset.offsetTop);
            const offsetLeft = parseFloat(section.dataset.offsetLeft);

            if (this.options.horizontal) {
                window.scrollTo({ left: offsetLeft, behavior: 'smooth' });
            } else {
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
        }
    }

    onWheel(event) {
        const normalized = normalizeWheel(event);
        const delta = this.options.horizontal ? normalized.pixelX : normalized.pixelY;

        if (delta > 0) {
            this.scrollToNext();
        } else {
            this.scrollToPrevious();
        }
    }

    onKeyDown(event) {
        switch (event.code) {
            case 'ArrowUp':
                this.scrollToPrevious();
                break;
            case 'ArrowDown':
                this.scrollToNext();
                break;
            case 'PageUp':
                this.scrollToPrevious();
                break;
            case 'PageDown':
                this.scrollToNext();
                break;
        }
    }
}

// Initialize scroll manager
document.addEventListener('DOMContentLoaded', () => {
    new ScrollManager({
        selector: '[data-scroll]',
        selectorChild: '[data-scroll-item]',
        horizontal: false,
        snap: true
    });
});
