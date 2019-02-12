(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('apiRegisterController', apiRegisterController);

    apiRegisterController.$inject = [];

    function apiRegisterController() {
        var vm = this;
        var swiper = new Swiper('.api-register-container', {
            pagination: '.swiper-pagination',
            paginationClickable: true,
            autoplay: 50000
        });
    }
})();
