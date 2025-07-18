class MCartAddons extends HTMLElement {
  constructor() {
    super();
    this.selectors = {
      cartDiscountCode: '[name="discount"]',
      cartDiscountCodeNoti: "[data-discount-noti]",
      saveAddonButton: ".m-cart-addon--save",
      triggerAddonButton: ".m-cart-addon--trigger-button",
    };

    this.cartWrapper = document.querySelector(".m-cart-drawer");
    this.isCartPage = MinimogSettings.templateName === "cart";
    if (this.isCartPage) {
      this.cartWrapper = document.querySelector(".m-cart__footer--wrapper");
    }
    this.cartOverlay = this.cartWrapper.querySelector(".m-cart__overlay");
    this.domNodes = queryDomNodes(this.selectors, this);
    this.discountCodeKey = "minimog-discount-code";
    this.init();
  }

  init() {
    const { cartDiscountCode, cartDiscountCodeNoti } = this.domNodes;
    addEventDelegate({
      selector: this.selectors.triggerAddonButton,
      context: this,
      handler: (e, addonButton) => {
        e.preventDefault();
        if (this.isCartPage) {
          const addonCurrentActive = document.querySelector(".m-cart-addon__body.open");
          if (addonCurrentActive) addonCurrentActive.classList.remove("open");
        }
        const { open: addonTarget } = addonButton.dataset;
        const addonNode = this.cartWrapper.querySelector(`#m-addons-${addonTarget}`);
        this.removeActiveAllButton();
        addonButton.classList.add("active");
        addonNode && addonNode.classList.add("open");
        this.cartOverlay && this.cartOverlay.classList.add("open");
        this.openAddon = addonNode;
      },
    });
    if (cartDiscountCode) {
      const code = localStorage.getItem(this.discountCodeKey);
      if (code) {
        cartDiscountCode.value = code;
        if (cartDiscountCodeNoti) {
          cartDiscountCodeNoti.style.display = "inline";
        }
      }
    }
    this.saveAddonValue();
  }

  removeActiveAllButton() {
    const triggerButtons = this.querySelectorAll(this.selectors.triggerAddonButton);
    triggerButtons && triggerButtons.forEach((button) => button.classList.remove("active"));
  }

  close(event) {
    event.preventDefault();
    this.openAddon.classList.remove("open");
    this.cartOverlay && this.cartOverlay.classList.remove("open");
    this.removeActiveAllButton();
    this.openAddon = null;
  }

  saveAddonValue() {
    addEventDelegate({
      event: "click",
      context: this.cartWrapper,
      selector: this.selectors.saveAddonButton,
      handler: (event, target) => {
        event.preventDefault();
        const { cartDiscountCode, cartDiscountCodeNoti } = this.domNodes;
        if (target.dataset.action === "coupon" && cartDiscountCode) {
          const code = cartDiscountCode.value;
          localStorage.setItem(this.discountCodeKey, code);
          if (code !== "" && cartDiscountCodeNoti) {
            cartDiscountCodeNoti.style.display = "inline";
          } else {
            cartDiscountCodeNoti.style.display = "none";
          }
          this.close(event);
        }
        if (target.dataset.action === "note") {
          this.updateCartNote();
          this.close(event);
        }
      },
    });
  }
}

customElements.define("m-cart-addons", MCartAddons);
