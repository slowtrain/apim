(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('GatewayDialogController', GatewayDialogController);

    GatewayDialogController.$inject = ['CommonUtil', '$uibModalInstance', 'selections', 'Gateway', 'AlertService', 'JhiLanguageService'];

    function GatewayDialogController(CommonUtil, $uibModalInstance, selections, Gateway, AlertService, JhiLanguageService) {

        var vm = this;
        vm.languages = null;
        vm.authorities = ['ROLE_ADMIN'];

        vm.mode = (selections.mode == undefined) ? "update" : "register";
        vm.ApiName = (selections.cluster == undefined) ? "gateway.cluster" : (vm.mode == "update" && selections.gateway == undefined) ? "gateway.cluster" : "gateway";

        vm.save = save;

        vm.clear = clear;

        vm.cluster = (vm.mode == "update") ? angular.copy(selections.cluster) : {};
        vm.gateway = (vm.mode == "update") ? angular.copy(selections.gateway) : {};

        function save() {
            if (vm.mode == "register") {
                if (vm.ApiName == "gateway") Gateway.create({clusterId: selections.cluster.id}, vm.gateway, onSuccess, onError);
                else Gateway.createCluster(vm.cluster, onSuccess, onError);
            } else {
                if (vm.ApiName == "gateway") Gateway.update({clusterId: selections.cluster.id, gatewayId: selections.gateway.id}, vm.gateway, onSuccess, onError);
                else Gateway.updateCluster({clusterId: selections.cluster.id}, vm.cluster, onSuccess, onError);
            }
        }

        JhiLanguageService.getAll().then(function (languages) {
            vm.languages = languages;
        });

        function clear() {
            vm.cluster = (vm.mode == "update") ? selections.cluster : {};
            vm.gateway = (vm.mode == "update") ? selections.gateway : {};
            $uibModalInstance.dismiss('cancel');
        }

        function onSuccess(result) {
            vm.isSaving = false;
            $uibModalInstance.close(result);
        }

        function onError(error) {
            vm.isSaving = false;
            CommonUtil.onError(error.data.description);
        }
    }
})();
