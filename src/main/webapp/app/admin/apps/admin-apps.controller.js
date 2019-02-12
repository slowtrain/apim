(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('AdminAppManagementController', AdminAppManagementController);

    AdminAppManagementController.$inject = ['$state', 'Organization', '$stateParams', '$scope', '$uibModal', 'AdminAppService', 'CommonUtil', 'Code'];

    function AdminAppManagementController($state, Organization, $stateParams, $scope, $uibModal, AdminAppService, CommonUtil, Code) {
        var vm = this;

        vm.state = $state;
        vm.stateParams = $stateParams;
        vm.authorities = ['ROLE_ADMIN'];
        vm.appStatus = Code.appStatusTypes();
        vm.statusFiltering = statusFiltering;
        vm.organizations = Organization.listByTypeForAdmin();
        vm.initTab = false;
        vm.list = [];
        vm.termContent = "약관을 선택해주세요.";
        vm.termPopover = {
            templateUrl: 'app/layouts/popover-template/content-popover.html'
        };

        vm.show = show;
        vm.loadAll = loadAll;
        vm.pageChanged = pageChanged;
        vm.sorting = sorting;
        vm.closeTerm = closeTerm;
        vm.showTermsContent = showTermsContent;
        vm.downloadExcel = downloadExcel;
        vm.redeploy = redeploy;
        vm.getDeployFailList = getDeployFailList;
        vm.searching = searching;

        vm.condition = {
            appName: vm.appName,
            status: vm.status ? vm.status : null,
            organization_id: vm.organization ? vm.organization.id : 0,
            size: vm.stateParams.size,
            page: vm.stateParams.page,
            sort: vm.stateParams.sort
        };

        vm.loadAll();

        vm.appDeployStatus = {
            templateUrl: 'app/layouts/popover-template/app-deploystatus-popover.html'
        };

        function statusFiltering (status) {
            return status.key.indexOf('RESERVED') < 0;
        }

        function getDeployFailList(app){
            if(!app.openDeployStatus){
                app.openDeployStatus = true;
                AdminAppService.deployFailList({id: app.id}).$promise.then(function(response){
                    app.deployFailOrgs = response;
                }).catch(function(error){
                    CommonUtil.onError(error.data.description);
                });
            }else app.openDeployStatus = false;

        }
        function redeploy(app) {
            if (app.status == 'DELETE_FAIL') {
                AdminAppService.delete({id: app.id}, vm.loadAll, onError);
                var func = function(result){
                    loadAll();
                };
                CommonUtil.onError('삭제를 다시 시도합니다.<br/>결과는 잠시 후 새로고침으로 확인하십시오.', '', 'redeploy', func, '삭제 재처리');
            } else AdminAppService.redeploy({id: app.id}, underRedeploy, onError);
        }

        function underRedeploy() {
            var func = function(result){
                loadAll();
            };
            CommonUtil.onError('재배포를 시도합니다.<br/>결과는 잠시 후 새로고침으로 확인하십시오.', '', 'redeploy', func, '재배포');
        }

        function sorting(predicate, option){
            vm.condition.sort = CommonUtil.sorting(vm.condition.sort, predicate, option);
            vm.condition.page = 0;
            vm.currentPage = 1;
            loadAll();
        }

        function searching () {
            vm.currentPage = 1;
            vm.condition = {
                appName: vm.appName,
                status: vm.status ? vm.status : null,
                organization_id: vm.organization ? vm.organization.id : 0,
                size: vm.stateParams.size,
                page: 0,
                sort: vm.condition.sort //sort는 초기화없이 이전 설정이 계속 유지된다.
            };
            loadAll();
        }

        function pageChanged() {
            vm.condition.page = vm.currentPage - 1;
            loadAll();
        }

        function downloadExcel() {
            var queryString = $.param(vm.condition, true);
            var url = '/api/admin/apps/excel';
            window.open(url + "?" + queryString, '_blank');
        }

        function loadAll(page) {
            if (page >=0) {
                vm.condition.page = page;
                vm.currentPage = page + 1;
            }
            AdminAppService.list(vm.condition, function (response, headers) {
                vm.list = response;
                vm.totalItems = headers('x-total-count');
            });
        }

        function show(app) {
            $uibModal.open({
                templateUrl: 'app/app-management/app-manage/app-view.html',
                controller: 'AppViewController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'md',
                resolve: {
                    selectApp: app
                }
            }).result.then(function (result) {
                vm.loadAll();
            });
        }

        $scope.delApp = function (app, type) {
            var name = app.name + " 앱을";
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
                    if (result) {
                        AdminAppService.delete({id: app.id}, vm.loadAll, onError);
                        var func = function(result){
                            loadAll();
                        };
                        CommonUtil.onError('결과는 잠시 후 새로고침으로 확인하십시오.<br/>[삭제 처리 실패]가 발생했을 경우,<br/>재처리를 시도하십시오.', '', 'redeploy', func, '삭제안내');
                    }
            });
        };

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }

        function showTermsContent(api) {
            if (api.termsOfUse) {
                Api.getTermsContent({id: api.termsOfUse.id}).$promise.then(function (response) {
                    vm.isTermsOpen = true;
                    vm.termContent = response.content;
                });
            } else {
                vm.isTermsOpen = false;
            }
        }

        function closeTerm() {
            vm.isTermsOpen = false;
        }
    }
})();
