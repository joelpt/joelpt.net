const SMART_ZOOM_HEIGHT_FILL_PERCENT = 1.0; // Rescale the page so it fits within this percent of the screen height
const SMART_ZOOM_WIDTH_FILL_PERCENT = 0.67; // Rescale the page so it fits within this percent of the screen width

const TOTAL_COLOR_SCHEMES = 5; // Number of defined color schemes (in the CSS)
const COLOR_SCHEME_ORDER = [1, 5, 2, 4, 3]; // Order of (CSS defined, 1-based) color schemes within the switcher rotation

const BAND_SCROLL_Y_INCREMENT_PX = 280; // How much further down the page we scroll for each consecutive band
const SCROLL_ANIMATION_SPEED_MS = 0.65 * getCssVar('--band-animation-speed').slice(0, -2); // How quickly we scroll to focus after a band click

// https://gist.github.com/joepie91/2664c85a744e6bd0629c#gistcomment-2833431
const delay = ms => new Promise(fn => setTimeout(fn, ms));

$(init);

function init() {
    initializePage();
    handleBandEvents();
    handleSchemeSwitcherEvents();
}

function initializePage() {
    // reset scroll position, needed due to possible funky cases with rotations/translates
    window.scroll(0, 0);
    delay(100).then(() => window.scroll(0, 0), 100);

    // all links to open in new tabs
    $('a').attr('target', '_blank');

    // Keep the menu properly sized regardless of device/aspect ratio/dpi
    let menuHeight = $('#menu').height();
    let menuWidth = $('#menu').width();

    $(window).on('resize orientationchange', _ => delay(10).then(adjustZoom));

    // Reveal the natural height of the bullet lists, and write that directly into the CSS variables that control open band heights
    $('body').addClass('init2');

    $('.bullets').each((_, e) => {
        const $e = $(e);
        const height = Math.ceil($e.height());
        const bandId = $e.closest('tr').attr('id').slice(-1);
        setCssVar(`--band-${bandId}-open-height`, `${height}px`);
    });

    $('body').removeClass('init2');

    // remove the .init class so we actually render everything we want the user to see
    $('body').removeClass('init');

    adjustZoom();
    delay(0).then(adjustZoom); // failsafe
    delay(100).then(adjustZoom); // for iOS

    function adjustZoom() {
        let optimalZoomBasedOnHeight = SMART_ZOOM_HEIGHT_FILL_PERCENT * window.innerHeight / menuHeight;
        let optimalZoomBasedOnWidth = SMART_ZOOM_WIDTH_FILL_PERCENT * window.innerWidth / menuWidth;

        // Zoom to the lesser of the two, to ensure that the entire table is visible
        // both horizontally and vertically regardless of the display's dimensions
        let optimal = Math.min(optimalZoomBasedOnHeight, optimalZoomBasedOnWidth);

        $('#zoomer').css('zoom', optimal);
    }
}

function handleBandEvents() {
    let currentBandId = 1;

    $('#menu td').on('click', onClickBand);
    $('a')
        .on('click', ev => ev.stopPropagation())
        .on('focus', onFocusLink);;
    return;

    function onClickBand(ev) {
        const $target = $(ev.target);
        const $band = $target.closest('tr');
        const targetBandId = Number($band.attr('id')[4]);

        focusBand(targetBandId);
    }

    function onFocusLink(ev) {
        const $target = $(ev.target);
        const $band = $target.closest('tr');
        const targetBandId = Number($band.attr('id')[4]);

        if (targetBandId !== currentBandId) {
            focusBand(targetBandId);
        }
    }

    function focusBand(targetBandId) {
        if (targetBandId === 5 || targetBandId === 0 || currentBandId === targetBandId) {
            currentBandId = 1;
        } else {
            currentBandId = targetBandId;
        }

        $('body').attr('data-active-band', `band${currentBandId}`);
        $(`.active-band`).removeClass('active-band');
        $(`#band${currentBandId}`).addClass('active-band');

        $({ y: $('#zoomer')[0].scrollTop }).animate({ y: (currentBandId - 1) * BAND_SCROLL_Y_INCREMENT_PX }, {
            duration: SCROLL_ANIMATION_SPEED_MS,
            step: (now, fx) => {
                $('#zoomer')[0].scrollTo(0, now);
            }
        });
    }
}

function handleSchemeSwitcherEvents() {
    let currentScheme = 0;

    $('#left-scheme, #right-scheme, #scheme-sample-box').on('click', onClickSchemeSwitcher);
    return;

    function onClickSchemeSwitcher(ev) {
        const leftRightDelta = ($(ev.target).attr('id') === 'left-scheme' ? TOTAL_COLOR_SCHEMES - 1 : 1);
        switchScheme((currentScheme + leftRightDelta) % TOTAL_COLOR_SCHEMES);
    }

    function switchScheme(newScheme) {
        currentScheme = newScheme;
        $('body').attr('data-color-scheme', `scheme${currentScheme + 1}`);
    }
}

function getCssVar(key, container = ':root') {
    return $(container).css(key).trim();
}

function setCssVar(key, value, container = ':root') {
    $(container).css(key, value);
}