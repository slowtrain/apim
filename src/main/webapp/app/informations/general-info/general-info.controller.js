(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('GeneralInfoController', GeneralInfoController);

    GeneralInfoController.$inject = ['CommonConstants', '$rootScope', '$compile', '$timeout', 'GeneralInfo', '$state', '$stateParams', '$scope', 'Api', '$uibModal', 'CommonUtil'];

    function GeneralInfoController(CommonConstants, $rootScope, $compile, $timeout, GeneralInfo, $state, $stateParams, $scope, Api, $uibModal, CommonUtil) {

        var vm = this;

        $scope.$on('$stateChangeSuccess', function () {
            vm.class = $state.current.name == 'privacy-policy' || $state.current.name == 'portal-terms' ? 'col-md-10' : 'col-md-12';
            $timeout(loadAll);
        });

        function loadAll() {
            vm.contents = GeneralInfo.allContents({kind: $state.current.name, useYn:'Y'}, onSuccess, onError);
        }

        function onSuccess(response) {
            if (response[0]) $('#contentsBody').html(response[0].contentsBody);
        }

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }
    }
})();
