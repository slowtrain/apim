(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ScopeManagementController', ScopeManagementController);

    ScopeManagementController.$inject = ['$scope', '$uibModal', 'Scopes', 'CommonUtil'];

    function ScopeManagementController($scope, $uibModal, Scopes, CommonUtil) {

        var vm = this;
        vm.loadAll = loadAll;
        vm.authorities = ['ROLE_ADMIN'];
        vm.size = 10;
        vm.page = 0;
        vm.sort = 'id,desc';
        vm.sorting = sorting;
        vm.condition = {
            size: vm.size,
            page: vm.page,
            sort: vm.sort
        };
        vm.pageChanged = pageChanged;
        vm.loadAll();

        function sorting(predicate, option){
            vm.condition.sort = CommonUtil.sorting(vm.condition.sort, predicate, option);
            vm.condition.page = 0;
            vm.currentPage = 1;
            loadAll();
        }

        function loadAll(page) {
            if (page >=0) {
                vm.condition.page = page;
                vm.currentPage = page + 1;
            }
            Scopes.list(vm.condition, onSuccess, onError);
        }

        function pageChanged() {
            vm.condition.page = vm.currentPage - 1;
            loadAll();
        };

        function onSuccess(data, headers) {
            vm.scopes = data;
            vm.totalItems = headers('x-total-count');
        }

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }

        $scope.editScope = function (scope) {
            $uibModal.open({
                templateUrl: 'app/admin/scope-management/scope-management-dialog.html',
                controller: 'ScopeManagementDialogController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'md',
                resolve: {
                    selections: scope
                }
            }).result.then(function (result) {
                if (result == 'create') loadAll(0);
                else loadAll();
            });
        };

        $scope.deleteScope = function (scope) {
            var name = scope.name + " SCOPE을";
            var func = function (result) {
                if (result) Scopes.delete({id: scope.id}, function() { loadAll(0) }, onError);
            }
            CommonUtil.deleteModal(name, func);
        }

    }
})();
