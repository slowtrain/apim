(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ApiGroupDialogController', ApiGroupDialogController);
    ApiGroupDialogController.$inject =['$uibModalInstance', 'selectedApi', '$stateParams', 'ApiGroup', '$uibModal'];

    function ApiGroupDialogController($uibModalInstance, selectedApi, $stateParams, ApiGroup, $uibModal) {

        var vm = this;
        vm.stateParams = $stateParams;
        vm.authorities = ['ROLE_API_CREATE', 'ROLE_ADMIN'];
        vm.loadAll = loadAll;
        vm.pageChanged = pageChanged;
        vm.clear = clear;
        vm.loadAll();

        function loadList(){
            ApiGroup.listByApi({id:selectedApi.id, size: vm.stateParams.size, page: vm.stateParams.page}, function(response, headers){
                vm.groups = response;
                vm.totalItems = headers('x-total-count');
            });
        }

        function onSuccess() {
            vm.loadAll();
        }

        function loadAll(){
            loadList();
            vm.currentPage = eval(vm.stateParams.page)+1;
        }

        function pageChanged() {
            vm.stateParams.page = vm.currentPage - 1;
            loadList();
        };

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }
    }
})();
