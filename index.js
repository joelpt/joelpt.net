const BAND_SLIDE_SPEED_MS = 300;

const PAGE_ROTATION_BASE_SPEED_MS = 100;
const PAGE_ROTATION_ANGLE_SPEED_MULTIPLIER = 2;
const PAGE_ROTATION_EASING = 'swing';
const BAND_ROTATION_DEGREES = [-30, 0, -90, -120];

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

    // Keep the menu properly sized regardless of device/aspect ratio/dpi
    let menuHeight = $('#menu').height();
    let menuWidth = $('#menu').width();

    function adjustZoom() {
        let optimalZoomBasedOnHeight = 0.85 * window.innerHeight / menuHeight;
        let optimalZoomBasedOnWidth = 0.7 * window.innerWidth / menuWidth;

        // Zoom to the lesser of the two, to ensure that the entire table is visible
        // both horizontally and vertically regardless of the display's dimensions
        $('body').css('zoom', Math.min(optimalZoomBasedOnHeight, optimalZoomBasedOnWidth));
    }

    $(window).on('resize', adjustZoom);

    // remove the .init class so we actually render everything we want the user to see
    $('body').removeClass('init');

    adjustZoom();
    setTimeout(adjustZoom(), 0); // failsafe
}

/* Set up events to do rotation and resizes when the bands are clicked */
function handleBandEvents() {
    let currentBandId = 'band1';
    let currentRotationDegrees = BAND_ROTATION_DEGREES[0];

    $('#menu tr:not(#band5) td').on('click', onClickBand);
    return;

    /* Animate rotating the page to specified degrees */
    function rotatePage(degrees) {
        if (currentRotationDegrees === degrees) return;

        $({ deg: currentRotationDegrees }).animate({ deg: degrees }, {
            duration: PAGE_ROTATION_BASE_SPEED_MS + PAGE_ROTATION_ANGLE_SPEED_MULTIPLIER * Math.abs(currentRotationDegrees - degrees),
            easing: PAGE_ROTATION_EASING,
            step: (now) => $('#rotator').css('transform', 'rotate(' + now + 'deg)')
        });

        currentRotationDegrees = degrees;
    }

    /* Handle clicks within a band */
    function onClickBand(e) {
        const $target = $(e.target);
        const $band = $target.closest('tr');

        const targetBandId = $band.attr('id');
        currentBandId = (currentBandId === targetBandId) ? 'band1' : targetBandId; // re-clicking a band resets the page

        if (currentBandId !== 'band1') {
            $band.find('.bullets').slideDown(BAND_SLIDE_SPEED_MS);
        }

        $(`#menu tr:not(#${currentBandId}) .bullets`).slideUp(BAND_SLIDE_SPEED_MS);

        rotatePage(BAND_ROTATION_DEGREES[parseInt(currentBandId.charAt(4)) - 1]);

        $(`.active-band`).removeClass('active-band')
        $(`#${currentBandId}`).addClass('active-band');
    }
}

/* Set up the color scheme cycler */
function handleSchemeSwitcherEvents() {

    let currentScheme = 0,
        lastScheme;

    $('#left-scheme, #right-scheme').on('click', (e) => {
        lastScheme = currentScheme;
        const leftRightDelta = ($(e.target).attr('id') === 'right-scheme' ? 1 : TOTAL_COLOR_SCHEMES - 1);
        currentScheme = (currentScheme + leftRightDelta) % TOTAL_COLOR_SCHEMES;

        $('body').removeClass(`scheme-${COLOR_SCHEME_ORDER[lastScheme]}`).addClass(`scheme-${COLOR_SCHEME_ORDER[currentScheme]}`);
    });
}