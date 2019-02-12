(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('orgUserController', orgUserController);

    orgUserController.$inject = ['$scope', '$timeout'];

    function orgUserController($scope, $timeout) {
        var vm = this;
        vm.ViewTabs = ViewTabs;

        angular.element(document).ready(function() {
            vm.swiper = new Swiper('.org-use-container', {
                pagination: '.swiper-pagination',
                paginationClickable: true,
                // autoplay: 3000,
                nextButton: '.swiper-button-next',
                prevButton: '.swiper-button-prev',
                autoplayDisableOnInteraction: true
            });
        });


        /*vm.swiper2 = new Swiper('.none-org-use-container', {
            pagination: '.none-swiper-pagination',
            paginationClickable: true,
            autoplay: 3000,
            autoplayDisableOnInteraction: true
        });*/
        function ViewTabs(){
            vm.tabs = !vm.tabs;
            if (vm.tabs) {
                $scope.vm.swiper.stopAutoplay();
                $scope.vm.swiper.startAutoplay();
            } else {
                $scope.vm.swiper2.stopAutoplay();
                $scope.vm.swiper2.startAutoplay();
            }
        }
    }
})();
