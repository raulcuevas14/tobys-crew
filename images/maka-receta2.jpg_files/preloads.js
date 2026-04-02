
    (function() {
      var cdnOrigin = "https://cdn.shopify.com";
      var scripts = ["/cdn/shopifycloud/checkout-web/assets/c1/polyfills.CgsWKOqO.js","/cdn/shopifycloud/checkout-web/assets/c1/app.DDilPCRa.js","/cdn/shopifycloud/checkout-web/assets/c1/dist-vendor.Su8YeOq-.js","/cdn/shopifycloud/checkout-web/assets/c1/browser.C57MJvX2.js","/cdn/shopifycloud/checkout-web/assets/c1/approval-scopes-FullScreenBackground.rgRO66R4.js","/cdn/shopifycloud/checkout-web/assets/c1/shared-unactionable-errors.BrfCZE88.js","/cdn/shopifycloud/checkout-web/assets/c1/actions-shop-discount-offer.BjL7BXpQ.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-alternativePaymentCurrency.CcLCtH1U.js","/cdn/shopifycloud/checkout-web/assets/c1/utils-proposal.Bt6tr7G7.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useHasOrdersFromMultipleShops.DJ4jeE9t.js","/cdn/shopifycloud/checkout-web/assets/c1/locale-es.BCeEWceU.js","/cdn/shopifycloud/checkout-web/assets/c1/page-OnePage.BgjMkv90.js","/cdn/shopifycloud/checkout-web/assets/c1/Captcha-PaymentButtons.W0uattm4.js","/cdn/shopifycloud/checkout-web/assets/c1/Menu-LocalPickup.Cel4l-fd.js","/cdn/shopifycloud/checkout-web/assets/c1/timeout-trigger-MarketsProDisclaimer.DhgWl3q9.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-NoAddressLocation.DbE2nZVi.js","/cdn/shopifycloud/checkout-web/assets/c1/shopPaySessionTokenStorage-Page.DNHFs70H.js","/cdn/shopifycloud/checkout-web/assets/c1/icons-OffsitePaymentFailed.ClbqAFGi.js","/cdn/shopifycloud/checkout-web/assets/c1/icons-ShopPayLogo.CJwb3Jvr.js","/cdn/shopifycloud/checkout-web/assets/c1/BuyWithPrimeChangeLink-VaultedPayment.D1gVaipk.js","/cdn/shopifycloud/checkout-web/assets/c1/DeliveryMacros-ShippingGroupsSummaryLine.DiZcJyPv.js","/cdn/shopifycloud/checkout-web/assets/c1/MerchandisePreviewThumbnail-StackedMerchandisePreview.D8b5XLl0.js","/cdn/shopifycloud/checkout-web/assets/c1/Map-PickupPointCarrierLogo.CCOzBgwX.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks.DFbP5moB.js","/cdn/shopifycloud/checkout-web/assets/c1/PostPurchaseShouldRender-AddDiscountButton.C669_7Sv.js","/cdn/shopifycloud/checkout-web/assets/c1/graphql-RememberMeDescriptionText.Dm6OPo9u.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-ShopPayOptInDisclaimer.D6wJNVSh.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-MobileOrderSummary.SYynQIJW.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-OrderEditVaultedDelivery.CwxSFTje.js","/cdn/shopifycloud/checkout-web/assets/c1/captcha-SeparatePaymentsNotice.C8Wu_iby.js","/cdn/shopifycloud/checkout-web/assets/c1/StockProblems-StockProblemsLineItemList.C9BpA151.js","/cdn/shopifycloud/checkout-web/assets/c1/redemption-useShopCashCheckoutEligibility.CGk6O7Te.js","/cdn/shopifycloud/checkout-web/assets/c1/negotiated-ShipmentBreakdown.DvdRPUZO.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-MerchandiseModal.CfFP3W7w.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-shipping-options.BG2729L1.js","/cdn/shopifycloud/checkout-web/assets/c1/graphql-DutyOptions.Db-zWrU0.js","/cdn/shopifycloud/checkout-web/assets/c1/DeliveryInstructionsFooter-ShippingMethodSelector.E4-kWn9i.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-SubscriptionPriceBreakdown.DiEMCa5C.js"];
      var styles = ["/cdn/shopifycloud/checkout-web/assets/c1/assets/app.au8IBghB.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/FullScreenBackground.DQj8kWSJ.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useHasOrdersFromMultipleShops.DThU5sg-.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/OnePage.ChVObE-q.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/LocalPickup.BhtheElV.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/AddDiscountButton.oEoBAbtG.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/MobileOrderSummary.Cko1fUoG.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/OrderEditVaultedDelivery.CSQKPDv7.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/NoAddressLocation.BrcQzLuH.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/DutyOptions.LcqrKXE1.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/VaultedPayment.OxMVm7u-.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PickupPointCarrierLogo.cbVP6Hp_.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Page.BYM12A8B.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/OffsitePaymentFailed.CpFaJIpx.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/StackedMerchandisePreview.D6OuIVjc.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/ShippingMethodSelector.B0hio2RO.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/SubscriptionPriceBreakdown.BSemv9tH.css"];
      var fontPreconnectUrls = [];
      var fontPrefetchUrls = [];
      var imgPrefetchUrls = ["https://cdn.shopify.com/s/files/1/0675/1118/9817/files/Group_1_3x_f9ad3ffc-0f39-42c6-9d40-e51b9eb439af_x320.png?v=1671648820"];

      function preconnect(url, callback) {
        var link = document.createElement('link');
        link.rel = 'dns-prefetch preconnect';
        link.href = url;
        link.crossOrigin = '';
        link.onload = link.onerror = callback;
        document.head.appendChild(link);
      }

      function preconnectAssets() {
        var resources = [cdnOrigin].concat(fontPreconnectUrls);
        var index = 0;
        (function next() {
          var res = resources[index++];
          if (res) preconnect(res, next);
        })();
      }

      function prefetch(url, as, callback) {
        var link = document.createElement('link');
        if (link.relList.supports('prefetch')) {
          link.rel = 'prefetch';
          link.fetchPriority = 'low';
          link.as = as;
          if (as === 'font') link.type = 'font/woff2';
          link.href = url;
          link.crossOrigin = '';
          link.onload = link.onerror = callback;
          document.head.appendChild(link);
        } else {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.onloadend = callback;
          xhr.send();
        }
      }

      function prefetchAssets() {
        var resources = [].concat(
          scripts.map(function(url) { return [url, 'script']; }),
          styles.map(function(url) { return [url, 'style']; }),
          fontPrefetchUrls.map(function(url) { return [url, 'font']; }),
          imgPrefetchUrls.map(function(url) { return [url, 'image']; })
        );
        var index = 0;
        function run() {
          var res = resources[index++];
          if (res) prefetch(res[0], res[1], next);
        }
        var next = (self.requestIdleCallback || setTimeout).bind(self, run);
        next();
      }

      function onLoaded() {
        try {
          if (parseFloat(navigator.connection.effectiveType) > 2 && !navigator.connection.saveData) {
            preconnectAssets();
            prefetchAssets();
          }
        } catch (e) {}
      }

      if (document.readyState === 'complete') {
        onLoaded();
      } else {
        addEventListener('load', onLoaded);
      }
    })();
  