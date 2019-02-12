(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ClusterShareController', ClusterShareController);

    ClusterShareController.$inject = ['CommonUtil', '$uibModalInstance', 'selections', 'Org', 'Gateway', 'AlertService', 'JhiLanguageService'];

    function ClusterShareController(CommonUtil, $uibModalInstance, selections, Org, Gateway, AlertService, JhiLanguageService) {

        var vm = this;
        vm.languages = null;
        vm.authorities = ['ROLE_ADMIN'];

        vm.save = save;

        Org.providers().$promise.then(function (response) {
            vm.orgList = response;
            Gateway.sharingOrgs({clusterId: selections.cluster.id}).$promise.then(function (result) {
                vm.sharingOrgs = result;
                vm.orgList.forEach(function (org) {
                    org.checked = false;
                    vm.sharingOrgs.forEach(function (sharing) {
                        if (sharing.id == org.id) org.checked = true;
                    });
                });
            });
        });

        vm.clear = clear;

        function save() {
            vm.checkedList = vm.orgList.filter(function (org) {
                return org.checked == true;
            });
            Gateway.shareCluster({clusterId: selections.cluster.id}, vm.checkedList, onSuccess, onError);
        }

        JhiLanguageService.getAll().then(function (languages) {
            vm.languages = languages;
        });

        function clear() {
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
