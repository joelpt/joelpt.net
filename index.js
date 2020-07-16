const SCROLL_ANIMATION_SPEED_MS = 600;

const SMART_ZOOM_HEIGHT_FILL_PERCENT = 0.9;
const SMART_ZOOM_WIDTH_FILL_PERCENT = 0.7;

const TOTAL_COLOR_SCHEMES = 5;
const COLOR_SCHEME_ORDER = [1, 5, 2, 4, 3];

$(document).ready(() => {
    initializePage();
    handleBandEvents();
    handleSchemeSwitcherEvents();
});

/* Capture measurements of the page, then rescale it (now and onresize) such that it fits nicely on screen */
function initializePage() {
    // reset scroll position, needed due to possible funky cases with rotations/translates
    window.scroll(0, 0);
    setTimeout(() => window.scroll(0, 0), 100);

    // all links to open in new tabs
    $('a').attr('target', '_blank');

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

    $('#menu td').on('click', onClickBand);
    $('a').on('click', ev => ev.stopPropagation());

    return;

    function onClickBand(ev) {
        const $target = $(ev.target);
        const $band = $target.closest('tr');

        const targetBandId = Number($band.attr('id')[4]);
        focusBand(targetBandId);
    }

    function focusBand(targetBandId) {
        if (targetBandId == 5 || targetBandId == 0) {
            currentBandId = 1;
        } else if (currentBandId !== targetBandId) {
            currentBandId = targetBandId;
        }
        $('body').attr('data-active-band', `band${currentBandId}`);
        $(`.active-band`).removeClass('active-band');
        $(`#band${currentBandId}`).addClass('active-band');

        $({ y: $('#zoomer')[0].scrollTop }).animate({ y: (currentBandId - 1) * 200 }, {
            duration: SCROLL_ANIMATION_SPEED_MS,
            step: (now, fx) => {
                $('#zoomer')[0].scrollTo(0, now);
            }
        });
    }
}

/* Set up the color scheme cycler */
function handleSchemeSwitcherEvents() {
    let currentScheme = 0;

    $('#left-scheme, #right-scheme').on('click', onClickSchemeSwitcher);
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