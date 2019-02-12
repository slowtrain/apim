(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('GatewayMonitoringController', GatewayMonitoringController);

    GatewayMonitoringController.$inject = ['$rootScope', '$interval', 'CommonUtil', '$scope', 'Gateway', '$uibModal', 'Principal', 'ParseLinks', 'AlertService', '$state', 'JhiLanguageService'];

    function GatewayMonitoringController($rootScope, $interval, CommonUtil, $scope, Gateway, $uibModal, Principal, ParseLinks, AlertService, $state, JhiLanguageService) {

        var vm = this;

        vm.authorities = ['ROLE_PLAN_VIEW'];
        vm.loadAll = loadAll;
        vm.loadAll();

        vm.currentDate = new Date();

        /*currentDate();
        function currentDate() {
            var interval = $interval(function () {
                vm.currentDate = new Date();
                $rootScope.$on('$stateChangeSuccess', function(){$interval.cancel(interval);});
            }, 1000);
        }*/

        function loadAll() {
            Gateway.healthcheck().$promise.then(function (response) {
                vm.results = response;
            }).catch(onError);
        }

        function onSuccess(result) {
            vm.loadAll();
        }

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }

    }
})();
