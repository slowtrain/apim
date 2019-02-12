(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ProviderUserController', ProviderUserController);

    ProviderUserController.$inject = [];

    function ProviderUserController() {
        var vm = this;
        var swiper = new Swiper('.provider-use-container', {
            pagination: '.swiper-pagination',
            paginationClickable: true,
            autoplay: 3000
        });
    }
})();
