function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// (async () => {
//   let textDom = document.querySelector('[data-welcome-content]');

//   if (!textDom) return;

//   let textNode = textDom.textContent,
//     targetWidth = textDom.offsetWidth,
//     fit = textNode.length;

//   textDom.textContent = '';
//   textDom.style.display = 'inline';




//   // Get number of chars per line
//   for (let i = 0; i < fit; ++i) {
//     await sleep(1000);
//     textDom.textContent += textNode[i];
//     if (textDom.getBoundingClientRect().width > targetWidth) {
//       console.log('Loop condition');
//       fit = i - 1;
//       break;
//     }
//   }
//   let linesCount = Math.ceil(textNode.length / fit);
//   textDom.removeAttribute('style');


//   // Render text & wrap each line in <span>
//   let newTextDom = '';
//   for (let i = 0; i < linesCount; ++i) {
//     newTextDom += `
//       <span>
//         ${textNode.replace(/(\r\n|\n|\r)/gm, ' ').slice((i * fit), ((i + 1) * fit))}
//         ${i < linesCount ? '- ' : ''} 
//       </span>`
//   }
//   textDom.innerHTML = newTextDom;
// })();

(() => {
  // If password - no welcome section settings
  if (window.location.pathname === window.routes.password) return;

  // if shop - remove hash
  window.scroll(0, 0);
  if ((window.location.hash === '#shop') || (sessionStorage.getItem('liveSession') === 'true')) {
    history.replaceState(null, null, ' ');
    let welcomeSection = document.querySelector('.preheader');
    if (!welcomeSection) return;
    welcomeSection.classList.add('d-none');
    document.body.classList.remove('overflow-hidden');
  }
})();

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}
function detectBrowser() {
  if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
    return 'safari';
  }
}
// if (detectBrowser() === 'safari') document.documentElement.classList.add('safari');

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute('role', 'button');
  summary.setAttribute('aria-expanded', summary.parentNode.hasAttribute('open'));

  if (summary.nextElementSibling.getAttribute('id')) {
    summary.setAttribute('aria-controls', summary.nextElementSibling.id);
  }

  summary.addEventListener('click', (event) => {
    event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
  });

  if (summary.closest('header-drawer')) return;
  summary.parentElement.addEventListener('keyup', onKeyUpEscape);
});

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function () {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function (event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(":focus-visible");
} catch (e) {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT', 'TAB', 'ENTER', 'SPACE', 'ESCAPE', 'HOME', 'END', 'PAGEUP', 'PAGEDOWN']
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener('keydown', (event) => {
    if (navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener('mousedown', (event) => {
    mouseClick = true;
  });

  window.addEventListener('focus', () => {
    if (currentFocusedElement) currentFocusedElement.classList.remove('focused');

    if (mouseClick) return;

    currentFocusedElement = document.activeElement;
    currentFocusedElement.classList.add('focused');

  }, true);
}

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
  });
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach((video) => video.pause());
  document.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== 'ESCAPE') return;

  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector('summary');
  openDetailsElement.removeAttribute('open');
  summaryElement.setAttribute('aria-expanded', false);
  summaryElement.focus();
}

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true })

    this.querySelectorAll('button').forEach(
      (button) => button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }
}

customElements.define('quantity-input', QuantityInput);

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

/*
 * Shopify Common JS
 *
 */
if ((typeof window.Shopify) == 'undefined') {
  window.Shopify = {};
}

Shopify.bind = function (fn, scope) {
  return function () {
    return fn.apply(scope, arguments);
  }
};

Shopify.setSelectorByValue = function (selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function (target, eventName, callback) {
  target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on' + eventName, callback);
};

Shopify.postLink = function (path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for (var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function (country_domid, province_domid, options) {
  this.countryEl = document.getElementById(country_domid);
  this.provinceEl = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

  Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler, this));

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function () {
    var value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function () {
    var value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function (e) {
    var opt = this.countryEl.options[this.countryEl.selectedIndex];
    var raw = opt.getAttribute('data-provinces');
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function (selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function (selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  }
};

class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector('details');

    if (navigator.platform === 'iPhone') document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);

    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach(summary => summary.addEventListener('click', this.onSummaryClick.bind(this)));
    this.querySelectorAll('button').forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
  }

  onKeyUp(event) {
    if (event.code.toUpperCase() !== 'ESCAPE') return;

    const openDetailsElement = event.target.closest('details[open]');
    if (!openDetailsElement) return;

    openDetailsElement === this.mainDetailsToggle ? this.closeMenuDrawer(event, this.mainDetailsToggle.querySelector('summary')) : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const parentMenuElement = detailsElement.closest('.has-submenu');
    const isOpen = detailsElement.hasAttribute('open');
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function addTrapFocus() {
      trapFocus(summaryElement.nextElementSibling, detailsElement.querySelector('button'));
      summaryElement.nextElementSibling.removeEventListener('transitionend', addTrapFocus);
    }

    if (detailsElement === this.mainDetailsToggle) {
      if (isOpen) event.preventDefault();
      isOpen ? this.closeMenuDrawer(event, summaryElement) : this.openMenuDrawer(summaryElement);
    } else {
      setTimeout(() => {
        detailsElement.classList.add('menu-opening');
        summaryElement.setAttribute('aria-expanded', true);
        parentMenuElement && parentMenuElement.classList.add('submenu-open');
        !reducedMotion || reducedMotion.matches ? addTrapFocus() : summaryElement.nextElementSibling.addEventListener('transitionend', addTrapFocus);
      }, 100);
    }
  }

  openMenuDrawer(summaryElement) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });
    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event === undefined) return;

    this.mainDetailsToggle.classList.remove('menu-opening');
    this.mainDetailsToggle.querySelectorAll('details').forEach(details => {
      details.removeAttribute('open');
      details.classList.remove('menu-opening');
    });
    this.mainDetailsToggle.querySelectorAll('.submenu-open').forEach(submenu => {
      submenu.classList.remove('submenu-open');
    });
    document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
    removeTrapFocus(elementToFocus);
    this.closeAnimation(this.mainDetailsToggle);
  }

  onFocusOut(event) {
    setTimeout(() => {
      if (this.mainDetailsToggle.hasAttribute('open') && !this.mainDetailsToggle.contains(document.activeElement)) this.closeMenuDrawer();
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }

  closeSubmenu(detailsElement) {
    const parentMenuElement = detailsElement.closest('.submenu-open');
    parentMenuElement && parentMenuElement.classList.remove('submenu-open');
    detailsElement.classList.remove('menu-opening');
    detailsElement.querySelector('summary').setAttribute('aria-expanded', false);
    removeTrapFocus(detailsElement.querySelector('summary'));
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute('open');
        if (detailsElement.closest('details[open]')) {
          trapFocus(detailsElement.closest('details[open]'), detailsElement.querySelector('summary'));
        }
      }
    }

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define('menu-drawer', MenuDrawer);

class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
  }

  openMenuDrawer(summaryElement) {
    this.header = this.header || document.getElementById('shopify-section-header');
    this.borderOffset = this.borderOffset || this.closest('.header-wrapper').classList.contains('header-wrapper--border-bottom') ? 1 : 0;
    document.documentElement.style.setProperty('--header-bottom-position', `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`);
    this.header.classList.add('menu-open');

    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });

    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus) {
    super.closeMenuDrawer(event, elementToFocus);
    this.header.classList.remove('menu-open');
  }
}

customElements.define('header-drawer', HeaderDrawer);

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="ModalClose-"]').addEventListener(
      'click',
      this.hide.bind(this, false)
    );
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide();
    });
    if (this.classList.contains('media-modal')) {
      this.addEventListener('pointerup', (event) => {
        if (event.pointerType === 'mouse' && !event.target.closest('deferred-media, product-model')) this.hide();
      });
    } else {
      this.addEventListener('click', (event) => {
        if (event.target === this) this.hide();
      });
    }
  }

  connectedCallback() {
    if (this.moved) return;
    this.moved = true;
    document.body.appendChild(this);
  }

  show(opener) {
    this.openedBy = opener;
    const popup = this.querySelector('.template-popup');
    document.body.classList.add('overflow-hidden');
    this.setAttribute('open', '');
    if (popup) popup.loadContent();
    trapFocus(this, this.querySelector('[role="dialog"]'));
    window.pauseAllMedia();
  }

  hide() {
    document.body.classList.remove('overflow-hidden');
    document.body.dispatchEvent(new CustomEvent('modalClosed'));
    this.removeAttribute('open');
    removeTrapFocus(this.openedBy);
    window.pauseAllMedia();
  }
}
customElements.define('modal-dialog', ModalDialog);

class Overlay extends HTMLElement {
  constructor() {
    super();

    this.options = {
      toggleClass: 'hidden'
    }
  }
  _show() {
    this.classList.remove(this.options.toggleClass);
  }
  _hide() {
    this.classList.add(this.options.toggleClass);
  }
}
customElements.define('custom-overlay', Overlay);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('button');

    if (!button) return;
    button.addEventListener('click', () => {
      const modal = document.querySelector(this.getAttribute('data-modal'));
      if (modal) modal.show(button);
    });
  }
}
customElements.define('modal-opener', ModalOpener);

class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener('click', this.loadContent.bind(this));
  }

  loadContent(focus = true) {
    window.pauseAllMedia();
    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div');
      content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));

      this.setAttribute('loaded', true);
      const deferredElement = this.appendChild(content.querySelector('video, model-viewer, iframe'));
      if (focus) deferredElement.focus();
    }
  }
}
customElements.define('deferred-media', DeferredMedia);

class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange);
  }

  connectedCallback() {
    this.onVariantChange();
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);
    this.updatePickupAvailability();

    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
      this.setUnavailable();
    } else {
      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
      this.updateShareUrl();
    }
    // Update option color label
    this.updateOptionColor();
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }

  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;

    const slider = Flickity.data(document.querySelector('[data-product-media]'));
    slider.select(this.currentVariant.featured_media.position - 1);
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
    window.history.replaceState({}, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateShareUrl() {
    const shareButton = document.getElementById(`Share-${this.dataset.section}`);
    if (!shareButton || !shareButton.updateUrl) return;
    shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`);
  }
  updateOptionColor() {
    this.options.forEach((option, index) => {
      document.querySelector(`[data-option-label="${index}"]`).textContent = option;
    });
  }
  updateVariantInput() {
    const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector('pickup-availability');
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute('available');
      pickUpAvailability.innerHTML = '';
    }
  }

  renderProductInfo() {
    fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html')
        const destination = document.getElementById(`price-${this.dataset.section}`);
        const source = html.getElementById(`price-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`);
        if (source && destination) destination.innerHTML = source.innerHTML;

        const price = document.getElementById(`price-${this.dataset.section}`);

        if (price) price.classList.remove('visibility-hidden');
        this.toggleAddButton(!this.currentVariant.available, window.variantStrings.soldOut);

        const newPrice = html.querySelector('.btn-name');
        if (newPrice) {
          document.querySelector('.btn-name').textContent = html.querySelector('.btn-name').textContent;
        }

        const addButton = document.getElementById(`product-form-${this.dataset.section}`).querySelector('[name="add"]');
        const notification = document.getElementById(`product-form-${this.dataset.section}`).querySelector('[data-notification]');
        if (!this.currentVariant.available) {
          notification.classList.remove('d-none');
          addButton.classList.add('d-none');
        } else {
          notification.classList.add('d-none');
          addButton.classList.remove('d-none');
        }
      });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(`product-form-${this.dataset.section}`);
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');
    if (!addButton) return;

    if (disable) {
      addButton.setAttribute('disabled', 'disabled');
      // if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute('disabled');
      // addButtonText.textContent = 'wtf';
      // addButtonText.textContent = window.variantStrings.addToCart;
    }
  }

  setUnavailable() {
    const button = document.getElementById(`product-form-${this.dataset.section}`);
    const addButton = button.querySelector('[name="add"]');
    const addButtonText = button.querySelector('[name="add"] > span');
    const price = document.getElementById(`price-${this.dataset.section}`);

    if (!addButton) return;
    addButtonText.textContent = window.variantStrings.unavailable;
    addButton.classList.remove('btn', 'btn--primary');

    if (price) price.classList.add('visibility-hidden');
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}

customElements.define('variant-selects', VariantSelects);

class VariantRadios extends VariantSelects {
  constructor() {
    super();
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
    });
  }
}

customElements.define('variant-radios', VariantRadios);

document.addEventListener('DOMContentLoaded', () => {
  // (() => {
  //   window.scroll(0,0);
  // })();
  (() => {
    window.iosTapIndicator = () => {
      if (detectBrowser() === 'safari') {
        console.log('Init');
        document.documentElement.classList.add('isSafari');
        document.querySelectorAll('.active-state, .link, .btn, .btn--outline, .btn--primary').forEach(el => {
          el.addEventListener('touchstart', () => {
            el.classList.add('active-state--active')
            setTimeout(() => {
              el.classList.remove('active-state--active')
            }, 400);
          })
          el.addEventListener('touchend', () => {
            el.classList.remove('active-state--active')
          })
        })
      }
    }
    window.iosTapIndicator();
  })();

  // Header Action
  (() => {
    const header = document.querySelector('.header');

    if (header === null) return;

    function headerHeight() {
      let headerTemp = document.querySelector('header.header');
      window.headerHeight = headerTemp.offsetHeight;
      document.documentElement.style
        .setProperty('--header-height', `${window.headerHeight}px`)
    }
    window.setHeaderHeight = headerHeight;
    headerHeight();
    window.addEventListener('resize', headerHeight);

    const btns = header.querySelectorAll('[data-header-toggle]');

    btns.forEach(btn => {
      let btnWrapper = btn.parentElement;

      let toggleBtns = (btn) => {
        btnWrapper.classList.toggle('z-stack-2');

        btn.classList.toggle('btn--outline');
        btn.classList.toggle('text-primary');

        if (btn.classList.contains('header__burger--cart')) {
          // setTimeout(() => {
          btn.querySelector('.header__burger__open').classList.toggle('d-none')
          // });

        }
      }

      btn.addEventListener('click', () => {
        // custom header secondary popup
        document.querySelectorAll('.hm-second-wrap').forEach(el => {
          el.classList.add('hidden');
        });
        // end custom header secondary popup
        let isOpened = btnWrapper.classList.contains('open');
        header.classList.remove('headroom--unpinned');

        !isOpened
          ? header.classList.add('header--fixed')
          : btnWrapper.classList.toggle('open');

        setTimeout(() => {
          isOpened
            ? header.classList.remove('header--fixed')
            : btnWrapper.classList.toggle('open');

          isOpened && header.classList.remove('secondary-open');

          isOpened
            ? setTimeout(() => {
              toggleBtns(btn)
            }, 400)
            : toggleBtns(btn);
        });

        document.body.classList.toggle('overflow-hidden');
      });
    });
    function customEmitEvent(element, eventInterface = 'MouseEvent', eventName = 'click') {
      var event; // The custom event that will be created
      if(null === element) {
          return;
      }
      if(document.createEvent){
          event = document.createEvent(eventInterface);
          event.initEvent(eventName, true, true);
          event.eventName = eventName;
          element.dispatchEvent(event);
      } else {
          event = document.createEventObject();
          event.eventName = eventName;
          event.eventType = eventName;
          element.fireEvent("on" + event.eventType, event);
      }
    }  
    const btnClose = header.querySelectorAll('[data-header-close]');
    btnClose.forEach(btn => {
      btn.addEventListener('click', () => {
        customEmitEvent(document.querySelector('.header__burger--menu'), 'MouseEvent', 'click');
      });
    });
    const btnCartClose = header.querySelectorAll('[data-hcart-close]');
    btnCartClose.forEach(btn => {
      btn.addEventListener('click', () => {
        customEmitEvent(document.querySelector('.header__burger--cart'), 'MouseEvent', 'click');
      });
    });
    // header secondary popup
    const header_second_urls = header.querySelectorAll('.hm-second-link');
    header_second_urls.forEach(btn => {
      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        const rel = document.querySelector(ev.target.closest('a').getAttribute('href'));
        if(null !== rel) {
          rel.classList.remove('hidden');
          header.classList.add('secondary-open');
        } else {
          header.classList.remove('secondary-open');
        }
      });
    });
    // end header secondary popup
  })();
  // Footer Action
  !(function() {
    // footer secondary popup
    const mainFooter = document.querySelector('.shopify-section.footer');
    if (mainFooter === null) return;

    function footerHeight() {
      let footerTemp = document.querySelector('.shopify-section.footer');
      window.footerHeight = footerTemp.offsetHeight;
      document.documentElement.style
        .setProperty('--footer-height', `${window.footerHeight}px`)
    }
    window.setFooterHeight = footerHeight;
    footerHeight();
    window.addEventListener('resize', footerHeight);
    const fm_modal = document.querySelector('.fm-modal');
    const footer_second_urls = document.querySelectorAll('.fm-second-link');
    const closeModal = () => {
      document.querySelectorAll('.hm-second-wrap').forEach(el => {
        el.classList.add('hidden');
      });
      mainFooter.classList.remove('secondary-open');
      fm_modal.classList.add('d-none');
      document.body.classList.remove('overflow-hidden');
    };
    fm_modal.addEventListener('click', function(evt) {
      if(!evt.target.closest('.hm-second-wrap')) {
       closeModal();
      }
    });
    footer_second_urls.forEach(btn => {
      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        const rel = document.querySelector(ev.target.closest('a').getAttribute('href'));
        if(null !== rel) {
          rel.classList.remove('hidden');
          mainFooter.classList.add('secondary-open');
          fm_modal.classList.remove('d-none');
        } else {
          mainFooter.classList.remove('secondary-open');
          fm_modal.classList.add('d-none');
        }
        document.body.classList.add('overflow-hidden');
      });
    });
    const btnClose = mainFooter.querySelectorAll('[data-fm-second-close]');
    btnClose.forEach(btn => {
      btn.addEventListener('click', (ev) => {
        closeModal();
      });
    });
    // end footer secondary popup
  })();
  (() => {
    let vh;
    function calcVh() {
      vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);

      const preheader = document.querySelector('.preheader__inner');
      if (preheader) preheader.style.height = `${vh * 100}px`;
    }
    calcVh();
    window.addEventListener('resize', calcVh);
  })();

  // Header desktop
  (() => {
    if (document.querySelector('.preheader') !== null) {
      const headerScroll = {
        selectors: {
          header: document.querySelector('.header'),
          logo: document.querySelector('[data-header-logo]'),
          navigation: document.querySelector('.header__buttons'),
          newLogo: document.querySelector('.header__logo')
        },
        handle: () => {
          let percent = 100.0 - (window.pageYOffset / headerScroll.selectors.header.offsetTop * 100.00);

          if (Number.isNaN(percent) || (percent === Infinity) || (percent < 0)) percent = 0;

          if (percent >= 66) {
            headerScroll.selectors.newLogo.classList.remove('header-animate', 'events-none')
            headerScroll.selectors.navigation.classList.remove('header-animate', 'events-none')
            headerScroll.selectors.newLogo.classList.add('header__translate-animate')
            headerScroll.selectors.navigation.classList.add('header__translate-animate')

          } else if (percent <= 66) {
            headerScroll.selectors.newLogo.classList.add('header-animate', 'events-none')
            headerScroll.selectors.navigation.classList.add('header-animate', 'events-none')
            headerScroll.selectors.newLogo.classList.remove('header__translate-animate')
            headerScroll.selectors.navigation.classList.remove('header__translate-animate')
          }

          (headerScroll.selectors.header.offsetTop + 10) > window.innerHeight
            ? document.querySelector('.header').classList.remove('header--fixed')
            : document.querySelector('.header').classList.add('header--fixed');

        },
        eventListeners: () => {
          document.addEventListener('scroll', debounce(headerScroll.handle, 15));
          const wheelHandle = (e) => {
            if (window.location.hash === '#shop' || (sessionStorage.getItem('liveSession') === 'true')) return;

            if (e.wheelDelta < 0 || (e?.touches?.length > 0)) {
              document.querySelector('[data-launch-animation]').click();
              // sessionStorage.setItem('liveSession', 'true');
            }
            document.removeEventListener('wheel', wheelHandle);
            document.removeEventListener('touchmove', wheelHandle);
          }
          document.addEventListener('wheel', wheelHandle);
          document.addEventListener('touchmove', wheelHandle);
        },
        init: () => {
          setTimeout(() => {
            // if (window.location.hash === '#shop') return;
            window.scroll(0, 0);
          }, 200);
          headerScroll.option = {
            isFirstLoad: true,
            isSafari: window.detectBrowser() === 'safari',
            minMobile: parseInt(headerScroll.selectors.logo.dataset.widthMobile)
          };
          // headerScroll.vars = {
          // headerWidth: headerScroll.selectors.logo.scrollWidth,
          // 32 - 2rem container margin + 4px*2 gaps
          // step: (window.innerWidth - 40 - headerScroll.selectors.logo.scrollWidth) / 100
          // };
          headerScroll.handle();
          headerScroll.eventListeners();
        }
      };
      headerScroll.init();
      window.headerScroll = headerScroll;
    }

    if (window.location.pathname === window.routes.root) {
      if (sessionStorage.getItem('liveSession') === 'true') {
        window.scroll(0, 0);
      }
      sessionStorage.removeItem('liveSession');
    } else {
      console.log('Added');
      sessionStorage.setItem('liveSession', 'true');
    }
  })();

  // FadeIn on content load
  (() => {
    setTimeout(() => {
      document.body.style.opacity = 1;
    }, 200);
  })();

  // Init anchor links
  (() => {
    const links = document.querySelectorAll('a[href]')

    if (links.length < 1) return;

    // Safari polyfill
    if (window.detectBrowser() === 'safari') {
      let url = 'https://unpkg.com/smoothscroll-polyfill@0.4.4/dist/smoothscroll.min.js';
      let script = document.createElement('script');
      script.src = url;
      document.getElementsByTagName('head')[0].appendChild(script);
    }

    function scrollTo(offset, callback) {
      const fixedOffset = offset.toFixed();
      const onScroll = function () {
        if (window.pageYOffset.toFixed() === fixedOffset) {
          window.removeEventListener('scroll', onScroll)
          callback()
        }
      }

      window.addEventListener('scroll', onScroll)
      onScroll()
      // window.scrollTo({
      //   top: offset,
      //   behavior: 'smooth'
      // })
    }

    links.forEach(link => {
      let href = link.getAttribute('href');
      // if ((href[0] === '#' && href.length > 1) || (href[1] === '#' && href.length > 2)) {
      if (href[0] === '#' && href.length > 1 && !(link.classList.contains('hm-second-link') || link.classList.contains('fm-second-link'))) {
        link.addEventListener('click', e => {
          e.preventDefault();

          window.setHeaderHeight();
          window.setFooterHeight();

          let wrapper = link.closest('[data-header-nav]');
          if (wrapper) {
            let toggle = wrapper.querySelector('[data-header-toggle]');
            wrapper.classList.remove('open');
            wrapper.classList.remove('z-stack-2');
            toggle.classList.add('btn--outline');
            toggle.classList.remove('text-primary');
          }

          let target = document.querySelector(`${link.getAttribute('href')}`);

          if (link.hasAttribute('data-launch-animation')) {
            let slideTransitionDelay = 650,
              linkParent = link.closest('section');

            linkParent.classList.add('animate--leave');

            setTimeout(() => {
              // sessionStorage.setItem('liveSession', 'true');
              document.querySelector('.preheader').classList.add('d-none');
              window.headerScroll.handle();
              AOS.refresh();

              let targetUpdated = document.querySelector(`${link.getAttribute('href')}`);
              // window.scroll(0, (targetUpdated.getBoundingClientRect().top + window.pageYOffset));

              setTimeout(() => {
                linkParent.classList.remove('animate--leave');
              }, 300);
              setTimeout(() => {
                document.body.classList.remove('overflow-hidden');
              }, 500);
            }, slideTransitionDelay)

            return;
          }

          setTimeout(() => {
            if (window.innerWidth > 768) {
              window.scrollTo({
                top: target.getBoundingClientRect().top + window.pageYOffset,
                behavior: 'smooth'
              })
            } else {
              scrollTo(target.getBoundingClientRect().top + window.pageYOffset, () => {
                let targetUpdated = document.querySelector(`${link.getAttribute('href')}`);
                window.scrollTo({
                  top: targetUpdated.getBoundingClientRect().top + window.pageYOffset,
                  behavior: 'smooth'
                })
              })
            }
            document.body.classList.remove('overflow-hidden');
          });
        });
      }
    });
  })();

  // PDP Media
  (() => {
    const btns = document.querySelectorAll('[data-product-media-nav]'),
      slideDOM = document.querySelector('[data-product-media]');

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        let slider = Flickity.data(slideDOM);

        btn.dataset.productMediaNav === 'next'
          ? slider.next()
          : slider.previous();
      });
    });
  })();


  (() => {
    AOS.init({
      offset: 60,
      once: true
    });

    window.addEventListener('resize', () => {
      const debouncedAOSrefresh = debounce(AOS.refresh, 1200);
      debouncedAOSrefresh();
    })
  })();

  // Custom load more
  class LoadMore extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.options = {
        collection: this.dataset.paginate,
        container: this.dataset.paginateCollectionContainer,
        // Section renders 16 products. AJAX only 8. So offset for ajax is 3.
        page: 3
      };

      this.parsedUrl = `collections/${this.options.collection}?view=ajax-8&page=${this.options.page}`;

      this._bindEevents();
    }
    _bindEevents() {
      this.addEventListener('click', this._loadHandle)
    }
    _loadHandle() {
      this.classList.add('loading')

      fetch(this.parsedUrl, {
        method: 'GET',
      }).then(res => {
        return res.text()
      }).then(res => {
        let dom = new DOMParser().parseFromString(res, 'text/html');

        // End of pagination
        if (!dom.querySelector('[data-pagination-next]'))
          this.classList.add('d-none');

        document.querySelector(this.options.container).innerHTML += dom.body.innerHTML;
        this.options.page += 1;
        AOS.refreshHard();
      });
    }
  }
  customElements.define('load-more', LoadMore);

  // Accordion
  (() => {
    const accordions = document.querySelectorAll('[data-accordion]');

    accordions.forEach(accordion => {
      let btn = accordion.querySelector('[data-accordion-toggle]'),
        content = accordion.querySelector('[data-accordion-content]');

      btn.addEventListener('click', () => {
        let active = document.querySelector('.accordion [aria-expanded="true"]');
        if (active && (btn !== active)) {
          active.setAttribute('aria-expanded', 'false');
          active.nextElementSibling.style.maxHeight = null;
          active.closest('.accordion').classList.remove('active');
        }

        content.style.maxHeight
          ? (content.style.maxHeight = null, btn.setAttribute('aria-expanded', 'false'), btn.closest('.accordion').classList.remove('active'))
          : (content.style.maxHeight = content.scrollHeight + 'px', btn.setAttribute('aria-expanded', 'true'), btn.closest('.accordion').classList.add('active'));
      });
      content.addEventListener('click', (e) => {
        e.stopPropagation();
        let active = document.querySelector('.accordion [aria-expanded="true"]');
        if (active) {
          active.setAttribute('aria-expanded', 'false');
          content.style.maxHeight = null;
          active.closest('.accordion').classList.remove('active');
        }

      });
    });
  })();

  // Notification
  (() => {
    const notificationTrigger = document.querySelector('[data-notification-trigger]'),
      notificationWrapper = document.querySelector('[data-notification-wrapper]'),
      notificationInput = document.querySelector('[data-notification-input]'),
      notificationSubmit = document.querySelector('[data-notification-submit]'),
      notificationStatus = document.querySelector('[data-notification-status]');

    if (!notificationTrigger) return;


    notificationTrigger.addEventListener('click', () => {
      notificationTrigger.classList.toggle('d-none');
      notificationWrapper.classList.toggle('d-none');

      // Load jQuery
      (() => {
        let jqueryScript = document.createElement('script');
        jqueryScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.1/jquery.min.js';
        jqueryScript.crossorigin = 'anonymous';
        // jqueryScript.onload = () => {
        //   console.log('Loaded');
        // }
        document.head.prepend(jqueryScript);
      })();
    });

    const notificationFormSubmit = () => {
      let parentForm = notificationTrigger.closest('form'),
        getActiveVariant = notificationTrigger.closest('form').querySelector('[name="id"]').value;

      if (!parentForm.reportValidity()) return;

      $.ajax({
        type: "POST",
        url: "https://a.klaviyo.com/onsite/components/back-in-stock/subscribe",
        data: {
          a: "U9irXF",
          email: notificationInput.value,
          variant: getActiveVariant,
          platform: "shopify"
        },
        success: function () {
          notificationWrapper.classList.add('transparent-0', 'events-none');
          notificationStatus.classList.remove('d-none');
        }
      })
    }
    notificationInput.addEventListener('keydown', (e) => {
      if (e.code === 'Enter') notificationFormSubmit();
    });
    notificationSubmit.addEventListener('click', notificationFormSubmit);
  })();

  // Contact form submit
  (() => {

    function ajaxFormInit(form) {
      var form_type = form.querySelector("[name=form_type]").value,
        form_inner = form.querySelector('[data-form-inner]'),
        alertDom = form.querySelector('[data-alert="status"]'),
        alert_msgs = form.querySelector('.form-alerts'),
        messageBox = document.querySelector('.main-password-section__message');

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var action = form.getAttribute("action");

        if (alert_msgs) {
          var alert_msg = JSON.parse(alert_msgs.innerHTML)
        }

        fetch(action, {
          method: 'POST',
          body: new FormData(form)
        }).then(function (response) {
          console.log(response);
          console.log(response.status);
          if(form.id === 'contact_form') {
            var form_check = form.getAttribute('action');
            var forms = document.querySelectorAll('form[action="' + form_check + '"');
            null !== forms && forms.forEach(function (fm) {
              var form_inner = fm.querySelector('[data-form-inner]'),
              alertDom = fm.querySelector('[data-alert="status"]'),
              messageBox = fm.querySelector('.main-password-section__message');
              alertDom.classList.remove('d-none');
              form_inner.classList.add('transition--hide');
              alertDom.innerHTML = alert_msg.success;
              
              if (messageBox) {
                messageBox.classList.add('reveal');
              }
            });
          } else {
            alertDom.classList.remove('d-none');
            form_inner.classList.add('transition--hide');
            alertDom.innerHTML = alert_msg.success;
            
            if (messageBox) {
              messageBox.classList.add('reveal');
            }
          }

        }).catch(function (err) {
          console.error(err);

          alertDom.classList.remove('d-none');
          form_inner.classList.add('transition--hide');
          alertDom.innerHTML = alert_msg.error;
        });
      });
    }

    // Init Shopify Forms
    document.querySelectorAll("[name=form_type]").forEach(function (el) {
      if (el.value !== 'customer') return;

      ajaxFormInit(el.closest("form"));
    });
  })();

  class RelatedProducts extends HTMLElement {
    constructor() {
      super();

      const OPTION_ACTIVE = 'data-option-active',
        COLOR_ACTIVE_CLASS = 'active-product',
        SIZE_ACTIVE_CLASS = 'input--dummy',
        SWATCH_ACTIVE_CLASS = 'swatch-product';

      this.selectors = this.querySelectorAll('[data-related-product]');

      this.selectors.forEach(btn => {
        btn.addEventListener('click', () => {
          let oldActive = btn.parentElement.querySelector(`[${OPTION_ACTIVE}="true"]`);
          oldActive.setAttribute(OPTION_ACTIVE, 'false');
          oldActive.classList.remove(COLOR_ACTIVE_CLASS);
          oldActive.classList.remove(SIZE_ACTIVE_CLASS);

          btn.setAttribute(OPTION_ACTIVE, 'true');
          if(btn.dataset.color) {
            btn.classList.add(COLOR_ACTIVE_CLASS);
          } else if (btn.dataset.size) {
            btn.classList.add(SIZE_ACTIVE_CLASS);
          }

          this.handleRedirect();
        })
      });
      const allColors = this.querySelectorAll('[data-related-product][data-color]');
      allColors.forEach(elm => {
        const currentColor = elm.dataset.color ? elm.dataset.color : false;
        let rs = window.relatedProducts.find((el) => {
          if (currentColor)
            return el.color === currentColor;
        });
        if(rs && rs.swatch_images && rs.swatch_images !== "") {
          elm.dataset.swatch = rs.swatch_images;
          elm.children[0].style.backgroundImage = "url('" + rs.swatch_images + "')";
        }
      });
    }
    handleRedirect() {
      this.activeParams = {
        color: this.querySelector('[data-color][data-option-active="true"]')?.dataset.color,
        size: this.querySelector('[data-size][data-option-active="true"]')?.dataset.size
      }
      let elToRedirect = window.relatedProducts.find((el) => {
        if (!this.activeParams.color)
          return el.size === this.activeParams.size;

        if (!this.activeParams.size)
          return el.color === this.activeParams.color;

        return el.color === this.activeParams.color && el.size === this.activeParams.size;
      });

      if (!elToRedirect) {
        console.log('No matching results');

        return;
      }
      window.location.href = elToRedirect.url;
    }
  }
  customElements.define('related-products', RelatedProducts);

  window.firstLoad = false;

  if (window.routes.password) {
    sessionStorage.removeItem('liveSession');
  }
});

// First we get the viewport height and we multiple it by 1% to get a value for a vh unit
let vh = window.innerHeight * 0.01;
// Then we set the value in the --vh custom property to the root of the document
document.documentElement.style.setProperty('--vh', `${vh}px`);
!(function() {
  const container = document.querySelector('.product__media-list');
  if(null === container) {
    return;
  }
  const component = document.querySelector('.product__info-wrapper');
  let scrollPosition = window.pageYOffset;
  let componentHeight = component.clientHeight;
  let position;
  navAndBreadcrumbsHeight = 50;
  let viewportHeight = window.innerHeight;
  const calcPlacement = () => {
    var t, e, n, r;
    if (window.innerWidth < 768) {
      component.removeAttribute("style");
    } else {
      t = component.getBoundingClientRect();
    }
    // init
    e = container.getBoundingClientRect();
    r = (n = window.scrollY) >= scrollPosition;
    // scrollPosition = window.pageYOffset;
    componentHeight = component.clientHeight;
    viewportHeight = window.innerHeight;
    //
    if (componentHeight <= viewportHeight - navAndBreadcrumbsHeight) {
      setPosition("sticky", navAndBreadcrumbsHeight);
    } else {
      const scrollTreasholdForRelativePosition = Math.max(componentHeight - viewportHeight + navAndBreadcrumbsHeight, 0);
      if (r && Math.abs(t.top - navAndBreadcrumbsHeight) >= scrollTreasholdForRelativePosition) {
        setPosition("sticky", viewportHeight - componentHeight);
      } else if (!r && t.top >= navAndBreadcrumbsHeight) {
        setPosition("sticky", navAndBreadcrumbsHeight);
      } else {
        setPosition("relative", -1 * e.y + t.top);
      }
    }
    scrollPosition = Math.max(n, 0);
  }
  const setPosition = (t, navAndBreadcrumbsHeight) => {
    position = t;
    component.style.position = t;
    component.style.top = navAndBreadcrumbsHeight + "px";
  }
  calcPlacement();
  document.addEventListener("scroll", function() {
    calcPlacement();
  });
  window.addEventListener("resize", function() {
    calcPlacement();
  });
})();