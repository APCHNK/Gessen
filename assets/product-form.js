if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector('form');
        this.form.querySelector('[name=id]').disabled = false;
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        this.submitButton = this.querySelector('[type="submit"]');
        if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');

        let backinstok = document.querySelector('.back_instok-yas .back_instok-btn');
        backinstok.addEventListener('click', this.backinstok.bind(this));
        let backinstokSubmit = document.querySelector('.back_instok-yas .back_instok-sub');
        backinstokSubmit.addEventListener('click', this.backinstokSubmit.bind(this));
        
        this.hideErrors = this.dataset.hideErrors === 'true';
      }

      backinstok(evt){
        evt.preventDefault();
        console.log(evt)
        evt.target.setAttribute('click', '');
      }
      backinstokSubmit(evt){
        evt.preventDefault();
        let emailBack = document.querySelector('.back_instok-form input').value;
        let variantId = document.querySelector('.product-variant-id[name="id"]').value;
        $.ajax({
            type: "POST",
            url: "https://a.klaviyo.com/onsite/components/back-in-stock/subscribe",
            data: {
                a: "U9irXF", // Klaviyo account public token
                email: emailBack, // Email address entered in form
                variant: variantId, // ID of the out of stock product variant about which customer wants to be notified.
                platform: "shopify", 
            },
            success: function(response){
                console.log(response)
                if(response.success){
                  document.querySelector('.back_instok-form').classList.add('succses');
                  document.querySelector('.back_instok-form-alert').innerHTML = 'Notification registered.'
                }
            }
        })

      }

      
      onSubmitHandler(evt) {
        evt.preventDefault();
        if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

        this.handleErrorMessage();

        this.submitButton.setAttribute('aria-disabled', true);
        this.submitButton.classList.add('loading');
        this.querySelector('.loading__spinner').classList.remove('hidden');

        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];

        const formData = new FormData(this.form);
        if (this.cart) {
          formData.append(
            'sections',
            this.cart.getSectionsToRender().map((section) => section.id)
          );
          formData.append('sections_url', window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
        }
        config.body = formData;

        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            console.log(response.status)
            if (response.status) {
              publish(PUB_SUB_EVENTS.cartError, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                errors: response.errors || response.description,
                message: response.message,
              });
              this.handleErrorMessage(response.description);

              const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
              if (!soldOutMessage) return;
              this.submitButton.setAttribute('aria-disabled', true);
              this.submitButton.querySelector('span').classList.add('hidden');
              soldOutMessage.classList.remove('hidden');
              this.error = true;
              return;
            } else if (!this.cart) {
              //window.location = window.routes.cart_url;
              let mini_carts = new MiniCart();
              mini_carts.updateCart();
              document.querySelector('.cart-btn-yas').click();
              return;
            }

            if (!this.error)
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                cartData: response,
              });
            this.error = false;
            const quickAddModal = this.closest('quick-add-modal');
            if (quickAddModal) {
              document.body.addEventListener(
                'modalClosed',
                () => {
                  setTimeout(() => {
                    this.cart.renderContents(response);
                  });
                },
                { once: true }
              );
              quickAddModal.hide(true);
            } else {
              this.cart.renderContents(response);
            }
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            this.submitButton.classList.remove('loading');
            if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
            if (!this.error) this.submitButton.removeAttribute('aria-disabled');
            this.querySelector('.loading__spinner').classList.add('hidden');
          });
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;
        
         if(document.querySelector('[data-type="add-to-cart-form"] .clavio_button.product-form__submit') != null){
        document.querySelector('[data-type="add-to-cart-form"] .clavio_button.product-form__submit').style.display = 'flex'
           }
        this.errorMessageWrapper =
          this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
        if (!this.errorMessageWrapper) return;
        this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

        this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }
    }
  );
}
