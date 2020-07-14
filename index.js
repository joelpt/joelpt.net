const BAND_SLIDE_SPEED_MS = 300;

const PAGE_ROTATION_BASE_SPEED_MS = 100;
const PAGE_ROTATION_ANGLE_SPEED_MULTIPLIER = 2;
const PAGE_ROTATION_EASING = 'swing';


const SMART_ZOOM_HEIGHT_FILL_PERCENT = 0.9;
const SMART_ZOOM_WIDTH_FILL_PERCENT = 0.7;

const TOTAL_COLOR_SCHEMES = 5;
const COLOR_SCHEME_ORDER = [1, 5, 2, 4, 3];

$(document).ready(() => {
    initializePage();
    handleBandEvents();
    handleSubmenuEvents();
    handleSchemeSwitcherEvents();
});

/* Capture measurements of the page, then rescale it (now and onresize) such that it fits nicely on screen */
function initializePage() {
    // reset scroll position, needed due to possible funky cases with rotations/translates
    window.scroll(0, 0);
    setTimeout(() => window.scroll(0, 0), 100);

    // Keep the menu properly sized regardless of device/aspect ratio/dpi
    let menuHeight = $('#menu').height();
    let menuWidth = $('#menu').width();

    $(window).on('resize orientationchange', e => setTimeout(adjustZoom, 10));

    // remove the .init class so we actually render everything we want the user to see
    $('body').removeClass('init');

    adjustZoom();
    setTimeout(adjustZoom, 0); // failsafe
    setTimeout(adjustZoom, 100); // for iOS

    function adjustZoom() {
        let optimalZoomBasedOnHeight = SMART_ZOOM_HEIGHT_FILL_PERCENT * window.innerHeight / menuHeight;
        let optimalZoomBasedOnWidth = SMART_ZOOM_WIDTH_FILL_PERCENT * window.innerWidth / menuWidth;

        // Zoom to the lesser of the two, to ensure that the entire table is visible
        // both horizontally and vertically regardless of the display's dimensions
        $('#zoomer').css('zoom', Math.min(optimalZoomBasedOnHeight, optimalZoomBasedOnWidth));
    }
}

/* Set up events to do rotation and resizes when the bands are clicked */
function handleBandEvents() {
    let currentBandId = 1;

    $('#menu tr:not(#band5) td').on('click', onClickBand);
    $('a').on('click', ev => ev.stopPropagation());

    $('body').on('swipeup', ev => focusBand(((currentBandId + 4) % 4) + 1));
    $('body').on('swipedown', ev => focusBand(((currentBandId + 6) % 4) + 1));

    return;

    function onClickBand(ev) {
        const $target = $(ev.target);
        const $band = $target.closest('tr');

        const targetBandId = Number($band.attr('id')[4]);
        focusBand(targetBandId);
    }

    function focusBand(targetBandId) {
        currentBandId = (currentBandId === targetBandId) ? 1 : targetBandId; // re-clicking a band resets the page

        $('body').attr('data-active-band', `band${currentBandId}`);
        $(`.active-band`).removeClass('active-band');
        $(`#band${currentBandId}`).addClass('active-band');

        $('body').attr('data-active-submenu', '');
    }
}

/* Set up submenu opening/closing stuff */
function handleSubmenuEvents() {
    $('.submenu-header').on('click', onClickSubmenuHeader);

    return;

    function onClickSubmenuHeader(ev) {
        const $target = $(ev.target);
        const submenuId = Number($target.attr('data-submenu')[7]);

        let currentSubmenuId = $('body').attr('data-active-submenu');

        if (currentSubmenuId !== '') {
            currentSubmenuId = Number(currentSubmenuId[7]);
        }

        if (submenuId === currentSubmenuId) {
            // unexpand submenu
            $('body').attr('data-active-submenu', '');
            return;
        }

        $('body').attr('data-active-submenu', `submenu${submenuId}`);
        $(`.active-submenu`).removeClass('active-submenu');
        $(`#submenu${submenuId}`).addClass('active-submenu');

    }
}

/* Set up the color scheme cycler */
function handleSchemeSwitcherEvents() {
    let currentScheme = 0;

    $('#left-scheme, #right-scheme').on('click', onClickSchemeSwitcher);

    // Disabled for now: too sensitive and will trigger if user attempts pinch-to-zoom leading to confusing results
    // $('body').on('swipeleft', ev => switchScheme((currentScheme + 1) % TOTAL_COLOR_SCHEMES));
    // $('body').on('swiperight', ev => switchScheme((currentScheme + TOTAL_COLOR_SCHEMES - 1) % TOTAL_COLOR_SCHEMES));

    return;

    function onClickSchemeSwitcher(ev) {
        const leftRightDelta = ($(ev.target).attr('id') === 'right-scheme' ? 1 : TOTAL_COLOR_SCHEMES - 1);
        switchScheme((currentScheme + leftRightDelta) % TOTAL_COLOR_SCHEMES);
    }

    function switchScheme(newScheme) {
        currentScheme = newScheme;
        $('body').attr('data-color-scheme', `scheme${currentScheme + 1}`);
    }
}