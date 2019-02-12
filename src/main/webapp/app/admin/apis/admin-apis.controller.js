(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('AdminApiManagementController', AdminApiManagementController);

    AdminApiManagementController.$inject = ['$stateParams', '$scope', '$uibModal', 'AdminApiService', 'Organization', 'CommonUtil', 'Code'];

    function AdminApiManagementController($stateParams, $scope, $uibModal, AdminApiService, Organization, CommonUtil, Code) {

        var vm = this;

        vm.stateParams = $stateParams;
        vm.authorities = ['ROLE_ADMIN'];
        vm.statusFiltering = statusFiltering;
        vm.list = [];

        vm.downloadExcel = downloadExcel;
        vm.showApiStatusPopover = showApiStatusPopover;
        vm.hideApiStatusPopover = hideApiStatusPopover;
        vm.pageChanged = pageChanged;
        vm.loadAll = loadAll;
        vm.condition = {
            apiName: vm.apiName,
            proxy: vm.proxyUrl,
            organization_id: vm.organization ? vm.organization.id : 0,
            apiPrivateOption: vm.isPrivate? vm.isPrivate : null,
            status: vm.state ? vm.state : null,
            size: vm.stateParams.size,
            page: vm.stateParams.page,
            sort: vm.stateParams.sort
        };
        vm.searching = searching;
        vm.sorting = sorting;

        Code.apiStatusTypes().$promise.then(function(response) {
            vm.status = response.map(function(state){
                return {
                    key: state.key,
                    rename: state.key=='UNUSED'? 'DELETED': state.key,
                    name: state.name
                }
            });
        });

        function statusFiltering (status) {
            return status.key.indexOf('RESERVED') < 0;
        }

        function sorting(predicate, option){
            vm.condition.sort = CommonUtil.sorting(vm.condition.sort, predicate, option);
            vm.condition.page = 0;
            vm.currentPage = 1;
            loadAll();
        }

        vm.loadAll();
        loadOrganizations();

        vm.tooltipPopover = {
            templateUrl: 'app/layouts/popover-template/approver-popover.html'
        };

        function searching () {
            vm.currentPage = 1;
            vm.condition = {
                apiName: vm.apiName,
                proxy: vm.proxyUrl,
                organization_id: vm.organization ? vm.organization.id : 0,
                apiPrivateOption: vm.isPrivate? vm.isPrivate : null,
                status: vm.state ? vm.state : null,
                size: vm.stateParams.size,
                page: 0,
                sort: vm.condition.sort //sort는 초기화없이 이전 설정이 계속 유지된다.
            };
            loadAll();
        }

        function showApiStatusPopover(api) {
            if (api.errorText) {
                api.isApiStatusOpen = true;
                vm.errorText = api.errorText;
            } else {
                api.isApiStatusOpen = false;
            }
        }

        function hideApiStatusPopover(api) {
            api.isApiStatusOpen = false;
        }

        function loadOrganizations() {
            Organization.listByTypeForAdmin({type: 'PROVIDER'}).$promise.then(function (response) {
                vm.organizations = response;
            });
        }

        function downloadExcel() {
            var queryString = $.param(vm.condition, true);
            var url = "/api/admin/apis/excel";
            window.open(url + "?" + queryString, "_blank");
        }

        function loadAll(page) {
            if (page >=0) {
                vm.condition.page = page;
                vm.currentPage = page + 1;
            }
            AdminApiService.list(vm.condition, function (response, headers) {
                vm.list = response;
                vm.totalItems = headers('x-total-count');
            });
        }

        function pageChanged() {
            vm.condition.page = vm.currentPage - 1;
            loadAll();
        }

        $scope.showApi = function (api) {
            $uibModal.open({
                templateUrl: 'app/admin/apis/admin-api-management-dialog.html',
                controller: 'AdminApiManagementDialogController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'xl',
                resolve: {
                    selectedApi: api
                }
            }).result.then(function (result) {
                vm.loadAll();
            });
        };

        $scope.delApi = function (api, type) {
            var name = api.name + " API를";
            $uibModal.open({
                templateUrl: 'app/services/common/modal.html',
                controller: 'modalController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'sm',
                resolve: {
                    items: function () {
                        return {
                            data: name,
                            type: type
                        }
                    }
                }
            }).result.then(function (result) {
                if (result) AdminApiService.delete({id: api.id}).$promise.then(function (response) {
                    vm.loadAll(0);
                }, onError);
            });
        };

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }

        $scope.showAppUsed = function (api) {
            $uibModal.open({
                templateUrl: 'app/account/api/api-manage/app-list.html',
                controller: 'AppListController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'md',
                resolve: {
                    selection: {
                        id: api.id,
                        mode: 'admin'
                    }
                }
            }).result.then(function (result) {
                vm.loadAll();
            });
        };
    }
})();
