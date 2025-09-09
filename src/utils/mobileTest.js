/**
 * Mobile Testing Utilities
 * Test viewport responsiveness and mobile-specific features
 */

export const MOBILE_VIEWPORTS = {
  MOBILE_SMALL: { width: 375, height: 667, name: 'iPhone SE' },
  MOBILE_MEDIUM: { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
  MOBILE_LARGE: { width: 430, height: 932, name: 'iPhone 14 Pro Max' },
  TABLET_SMALL: { width: 768, height: 1024, name: 'iPad Mini' },
  TABLET_LARGE: { width: 834, height: 1194, name: 'iPad Pro 11"' }
};

export const isMobileViewport = () => {
  return window.innerWidth < 768;
};

export const getViewportInfo = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  let deviceType = 'desktop';
  let gridColumns = 3;
  
  if (width < 640) {
    deviceType = 'mobile';
    gridColumns = 1;
  } else if (width < 768) {
    deviceType = 'mobile-large';
    gridColumns = 1;
  } else if (width < 1024) {
    deviceType = 'tablet';
    gridColumns = 2;
  }
  
  return {
    width,
    height,
    deviceType,
    gridColumns,
    isMobile: deviceType.includes('mobile'),
    isTablet: deviceType === 'tablet'
  };
};

// Test touch capabilities
export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Test if running on mobile browser
export const isMobileBrowser = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
};

// Validate minimum touch target size (48px)
export const validateTouchTargets = () => {
  const buttons = document.querySelectorAll('button, [role="button"], a, input, select');
  const issues = [];
  
  buttons.forEach((element, index) => {
    const rect = element.getBoundingClientRect();
    if (rect.width < 48 || rect.height < 48) {
      issues.push({
        element: element.tagName + (element.className ? '.' + element.className.split(' ')[0] : ''),
        size: `${Math.round(rect.width)}x${Math.round(rect.height)}px`,
        minRequired: '48x48px'
      });
    }
  });
  
  return {
    passed: issues.length === 0,
    issues,
    totalElements: buttons.length
  };
};

// Test for horizontal overflow on mobile
export const checkHorizontalOverflow = () => {
  const body = document.body;
  const html = document.documentElement;
  
  const bodyScrollWidth = body.scrollWidth;
  const htmlScrollWidth = html.scrollWidth;
  const windowWidth = window.innerWidth;
  
  return {
    hasOverflow: bodyScrollWidth > windowWidth || htmlScrollWidth > windowWidth,
    bodyWidth: bodyScrollWidth,
    htmlWidth: htmlScrollWidth,
    viewportWidth: windowWidth
  };
};

// Run complete mobile test suite
export const runMobileTestSuite = () => {
  const viewport = getViewportInfo();
  const touchTargets = validateTouchTargets();
  const overflow = checkHorizontalOverflow();
  const isMobile = isMobileViewport();
  
  const report = {
    timestamp: new Date().toISOString(),
    viewport,
    isMobileDevice: isMobileBrowser(),
    isTouchDevice: isTouchDevice(),
    tests: {
      touchTargets: {
        passed: touchTargets.passed,
        issues: touchTargets.issues.length,
        details: touchTargets.issues
      },
      horizontalOverflow: {
        passed: !overflow.hasOverflow,
        details: overflow
      },
      singleColumnLayout: {
        expected: isMobile,
        actual: viewport.gridColumns === 1,
        passed: isMobile ? viewport.gridColumns === 1 : true
      }
    }
  };
  
  console.group('📱 Mobile Test Suite Results');
  console.log('Viewport Info:', viewport);
  console.log('Touch Targets Test:', touchTargets.passed ? '✅ PASSED' : '❌ FAILED', touchTargets);
  console.log('Horizontal Overflow Test:', !overflow.hasOverflow ? '✅ PASSED' : '❌ FAILED', overflow);
  console.log('Single Column Layout:', report.tests.singleColumnLayout.passed ? '✅ PASSED' : '❌ FAILED');
  console.groupEnd();
  
  return report;
};

// Add to window for console testing
if (typeof window !== 'undefined') {
  window.mobileTest = {
    run: runMobileTestSuite,
    checkTouchTargets: validateTouchTargets,
    checkOverflow: checkHorizontalOverflow,
    getInfo: getViewportInfo,
    VIEWPORTS: MOBILE_VIEWPORTS
  };
}
