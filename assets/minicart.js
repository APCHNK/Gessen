class MiniCart {
  constructor(cartEndpoint) {
    this.cartEndpoint = cartEndpoint ? cartEndpoint : "/cart.js";
    this.minicart = document.querySelector("[data-minicart]");
    this.items = document.querySelector("[data-minicart-items]");
    this.item = "data-minicart-item";
    this.close = "data-minicart-close";
    this.open = "data-minicart-open";
    this.plus = "data-minicart-plus";
    this.minus = "data-minicart-minus";
    this.count = "data-minicart-count";
    this.totalCount = document.querySelector("[data-minicart-totalCount]");
    this.remove = "data-minicart-remove";
    this.subtotal = document.querySelector("[data-minicart-subtotal]");
  }

  openCart(target) {
    if (this.minicart && target.hasAttribute(this.open)) {
      this.minicart.classList.add("open");
      this.minicart.classList.remove("close");
    }
  }

  closeCart(target) {
    if (this.minicart && target.hasAttribute(this.close)) {
      this.minicart.classList.remove("open");
      this.minicart.classList.add("close");
    }
  }

  updatTotalCount(total) {
    if (!total){
       this.totalCount.closest('.cart-btn-yas').setAttribute('data-count', 0);
       document.querySelector(".yas-menu-f-minicart .yas-menu-close").click();
      return false;
    } 
    if (this.totalCount) {
      this.totalCount.innerHTML = total;
      this.totalCount.closest('.cart-btn-yas').setAttribute('data-count', total)
    }
  }

  updateSubtotal(total) {
    if (!total) return false;
    if (this.subtotal) {
      this.subtotal.innerHTML = this.moneyFormat(total);
    }
  }

  updateCart(openCart = true) {
    fetch(this.cartEndpoint)
      .then((resp) => resp.json())
      .then((cart) => {
        if (cart) {
          this.updateSubtotal(cart.total_price);
          this.updatTotalCount(cart.item_count);
          let allItems = "";
          for (let item of cart.items) {
            allItems += this.cartItemHTML(item);
          }
          if (this.items) {
            this.items.innerHTML = allItems;
          }
          if (cart.items.length < 1) {
            this.isEmpty();
          } else {
            this.isFilled(openCart);
          }
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  isFilled(openCart = true) {
    if (this.minicart) {
      this.minicart.classList.remove("empty");
      if (openCart) {
        this.minicart.classList.remove("close");
        this.minicart.classList.add("open");
      }
    }
  }

  isEmpty() {
    if (this.minicart) {
      this.minicart.classList.add("empty");
    }
  }

  removeCartItem(target) {
    if (target.hasAttribute(this.remove)) {
      const id =
        this.findAncestor(target, `[${this.item}]`) &&
        this.findAncestor(target, `[${this.item}]`).dataset["minicartItem"];
      if (id) {
        fetch("/cart/change.js", {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: id,
            quantity: 0,
          }),
        })
          .then((resp) => resp.json())
          .then((cart) => {
            this.updateCart();
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }
  }

  minusCartItem(target) {
    if (target.hasAttribute(this.minus)) {
      const id =
        this.findAncestor(target, `[${this.item}]`) &&
        this.findAncestor(target, `[${this.item}]`).dataset["minicartItem"];
      const quantityPicker = target.parentNode;
      const countElem = quantityPicker.querySelector(`[${this.count}]`);
      const newQuantity =
        countElem.value && parseInt(countElem.value) - 1;
      console.log(newQuantity)
      if (id && newQuantity >= 0) {
        fetch("/cart/change.js", {
          method: "post",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `quantity=${newQuantity}&id=${id}`,
        })
          .then(() => {
            this.updateCart();
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    }
  }

  plusCartItem(target) {
    if (target.hasAttribute(this.plus)) {
      const id =
        this.findAncestor(target, `[${this.item}]`) &&
        this.findAncestor(target, `[${this.item}]`).dataset["minicartItem"];

      if (id) {
        fetch("/cart/add.js", {
          method: "post",
          headers: {
            "x-requested-with": "XMLHttpRequest",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `id=${id}&quantity=1`,
        })
          .then((resp) => resp.json())
          .then((data) => {
            
            if (data.status === 422) {

              const parent = target.closest('.yas-menuf-item')
              console.log(parent)
              parent.nextElementSibling.style.display = 'block'





              // document.querySelector('.product-form__error-message-wrapper').toggleAttribute('hidden');
              // document.querySelector('.product-form__error-message-wrapper .product-form__error-message').textContent = data.description;
              // document.querySelector(".yas-menu-f-minicart .yas-menu-close").click();
              
              // document.querySelector('[data-type="add-to-cart-form"] .clavio_button.product-form__submit').style.display = 'flex';
              
              





            } else {
              this.updateCart();
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    }
  }

  cartItemHTML(item) {
    function buildProps(item) {
      if (
        !item ||
        !item.properties ||
        Object.keys(item.properties).length === 0
      )
        return "";

      let result = "";
      for (const [key, value] of Object.entries(item.properties)) {
        result += `<li>${key}: ${value}</li>`;
      }
      return result;
    }

    function buildOptions(item) {
      if (
        !item ||
        !item.options_with_values ||
        item.options_with_values.length === 0
      )
        return "";

      let result = "";
      for (let option of item.options_with_values) {
        if (option.value !== "Default Title") {
          result += `<li>${option.name}: ${option.value}</li>`;
        }
      }
      return result;
    }

    function getImage(image, size = 600, title) {
       if (!image) return "";
     // console.log(image.alt + ' ---' + title)
      if(image.alt == title){
        const ext = image.url.match(/\.(?:jpg|gif|png|webp)/g);
        return image.url.replace(ext[0], `_${size}x` + ext[0]);
      }else{
        const yasAlt = image.alt.substr(0,image.alt.indexOf("?"))
        const ext = yasAlt.match(/\.(?:jpg|gif|png|webp)/g);
         console.log(yasAlt + ' ---' + title)
        return yasAlt.replace(ext[0], `_${size}x` + ext[0]);
      }

    }
 
  /*
   function getImage(itemid, handle) {
   var varImg = ''
    fetch(`/products/pebblebowl`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html');
          let text = html.querySelector('#cart_image_yas-var').textContent;
         
          let massImg = JSON.parse(text);
           varImg = massImg.cart_variant.find((item) => item.id == itemid);  
        })
        .catch((e) => {
          console.error(e);
        });
    
     return varImg.image;
    }
  */
    function buildImage(item) {
         if (!item) return "";    
        //  console.log(item)
          return `<img alt="" class="responsive-image__image blur-up lazyload" data-sizes="auto" src="${getImage(item.featured_image, 300, item.product_title)}" data-src="${getImage(item.featured_image, 300, item.product_title)}" src="${getImage(item.featured_image, 30, item.product_title)}">`; 
    }

    let cartItem = miniCartItem;

    if (cartItem) {
      cartItem = cartItem.replace(/{{itemImage}}/g, buildImage(item));
      cartItem = cartItem.replace(/{{itemVariantId}}/g, item.id);
      cartItem = cartItem.replace(/{{itemTitle}}/g, item.product_title);
      cartItem = cartItem.replace(/{{itemVariant_title}}/g, item.variant_title);
      cartItem = cartItem.replace(/{{itemUrl}}/g, item.url);
      cartItem = cartItem.replace(
        /{{itemComparePrice}}/g,
        item.original_price > item.price
          ? this.moneyFormat(item.original_price)
          : ""
      );
      cartItem = cartItem.replace(
        /{{itemPrice}}/g,
        this.moneyFormat(item.price)
      );
      cartItem = cartItem.replace(/{{itemOptions}}/g, buildOptions(item));
      cartItem = cartItem.replace(/{{itemProps}}/g, buildProps(item));
      cartItem = cartItem.replace(/{{itemQuantity}}/g, item.quantity);
    }
    return cartItem;
  }

  hideOnEscape(e) {
    var keyCode = e.keyCode;
    if (keyCode === 27 && this.minicart) {
      this.minicart.classList.remove("open");
      this.minicart.classList.add("close");
    }
  }

  moneyFormat(amout, customCurrency = "€") {
    if (!amout) return "";
    if (typeof Shopify.formatMoney === "function") {
      const currency = Shopify.money_format.split("{")[0];
      return Shopify.formatMoney(amout, `${currency}{{amount_no_decimals}}`);
    } else {
      const currency = customCurrency;
      return `${currency}${amout / 100}`;
    }
  }

  findAncestor(el, sel) {
    while (
      (el = el.parentElement) &&
      !(el.matches || el.matchesSelector).call(el, sel)
    );
    return el;
  }
}

const mini_cart = new MiniCart();

// Assign mini_cart variable to global usage
window.mini_cart = mini_cart;

// Init Cart Items
mini_cart.updateCart(false);

// Hide MiniCart on Escape keydown
document.addEventListener("keydown", function (e) {
  mini_cart.hideOnEscape(e);
});

// MiniCart Events
document.addEventListener("click", function (e) {
  mini_cart.openCart(e.target);
  mini_cart.removeCartItem(e.target);
  mini_cart.plusCartItem(e.target);
  mini_cart.minusCartItem(e.target);
  mini_cart.closeCart(e.target);
});




















const observeDOM = (callback) => {
  const observer = new MutationObserver((mutations, observer) => {
    mutations.forEach(mutation => {
      callback(mutation);
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
};

const handleCookies = () => {
  const cookies = document.querySelector('[aria-label="cookie bar"]');
  const news = document.querySelector('.newsletter-modal');
  const newsBut = document.querySelector('.newsletter-modal-close');

  if (cookies && news) {
    // Initial check
    if (news.classList.contains('hidden')) {
      cookies.style.marginBottom = '0px';
    }

    if (newsBut) {
      newsBut.addEventListener('click', () => {
        cookies.style.marginBottom = '0px';
      });
    }
  }
};

// Check initially if the cookies element is already in the DOM
handleCookies();

// Observe DOM for changes
observeDOM(() => {
  handleCookies();
});




// newsletter-modal

// newsletter-modal-close align-self-start









document.addEventListener('DOMContentLoaded', () => {
  const element = document.querySelector('.cart-items');
  let isScrollbarVisible = false;
 
  
  const checkScrollbar = () => {

    const hasVerticalScrollbar = element.scrollHeight > element.clientHeight;
    if (hasVerticalScrollbar !== isScrollbarVisible) {
      isScrollbarVisible = hasVerticalScrollbar;
      if (isScrollbarVisible) {
        const yasMenufItems = document.querySelectorAll('.yas-menuf-item');
 

  
        const cartItems = document.querySelectorAll('.yas-menu-f-minicart .cart-items');
        cartItems.forEach(item => {
          item.style.marginRight = '6px';
        });
        yasMenufItems.forEach(item => {
          item.style.paddingRight = '6px';
        });
      } 
    }
  };


  const resizeObserver = new ResizeObserver(() => {
    checkScrollbar();
  });

  resizeObserver.observe(element);

  
  const mutationObserver = new MutationObserver(() => {
    checkScrollbar();
  });

  mutationObserver.observe(element, { childList: true, subtree: true, attributes: true, characterData: true });

  checkScrollbar();
});
