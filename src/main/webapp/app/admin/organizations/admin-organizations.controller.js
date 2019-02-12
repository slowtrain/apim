(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('AdminOrganizationController', AdminOrganizationController);

    AdminOrganizationController.$inject = ['$uibModalStack', '$scope', 'Organization', '$uibModal', 'AlertService', 'CommonUtil'];

    function AdminOrganizationController($uibModalStack, $scope, Organization, $uibModal, AlertService, CommonUtil) {
        var vm = this;
        vm.authorities = ['ROLE_ADMIN'];
        vm.Orgs = [];
        vm.fileDown = CommonUtil.fileDown;
        vm.fileSize = CommonUtil.fileSize;

        vm.totalItems = null;
        vm.size = 10;
        vm.page = 0;
        vm.sort = 'id,desc';
        vm.pageChanged = pageChanged;
        vm.sorting = sorting;
        vm.condition = {
            type: vm.searchingOrgType,
            name: (vm.searchingColumn == 'name') ? vm.searchingText : '',
            licenseNumber: (vm.searchingColumn == 'licenseNumber') ? vm.searchingText : '',
            size: vm.size,
            page: vm.page,
            sort: vm.sort
        };

        vm.activate = activate;
        vm.accountNumberSearch = accountNumberSearch;
        vm.getAccountNumber = getAccountNumber;
        vm.clear = clear;

        vm.loadAll = loadAll;
        vm.searching = searching;
        vm.detailView = detailView;
        vm.downloadExcel = downloadExcel;
        vm.loadAll();

        vm.orgTypes = [{name: "PROVIDER", ko: "제공기관"}, {name: "PARTNER", ko: "이용기관"}];
        vm.searchColumns = [{name: "name", ko: "기관이름"}, {name: "licenseNumber", ko: "사업자등록번호"}];

        function sorting(predicate, option){
            vm.condition.sort = CommonUtil.sorting(vm.condition.sort, predicate, option);
            vm.condition.page = 0;
            vm.currentPage = 1;
            loadAll();
        }

        function getChangeSet(id) {
            Organization.changeSet({id: id}).$promise.then(function (response) {
                vm.changeSets = response.changeSets;
            });
        }

        function activate(org) {
            if (org.state == 'ACTIVE') {
                var func = function (result) {
                    if (result) Organization.activateForAdmin({orgId: org.id, mode: 'deactivate'}, loadAll, onError);
                };
                CommonUtil.onError("해당기관이 가진 API, APP의 상태도<br/>비활성화 됩니다.<br/>그래도 비활성화 하시겠습니까?", 'sm', 'orgDeactivate', func, "비활성 처리 안내");
            }
            else Organization.activateForAdmin({orgId: org.id, mode: 'activate'}, loadAll, onError);
        }

        function searching () {
            vm.currentPage = 1;
            vm.condition = {
                type: vm.searchingOrgType,
                name: (vm.searchingColumn == 'name') ? vm.searchingText : '',
                licenseNumber: (vm.searchingColumn == 'licenseNumber') ? vm.searchingText : '',
                size: vm.size,
                page: 0,
                sort: vm.condition.sort
            };
            loadAll();
        }

        function pageChanged() {
            vm.condition.page = vm.currentPage - 1;
            loadAll();
        }

        function clear() {
            $uibModalStack.dismissAll();
        }

        function detailView(org) {
            vm.Org = org;
            getChangeSet(org.id);
            $uibModal.open({
                templateUrl: 'app/admin/organizations/org-detail-view.html',
                scope: $scope,
                backdrop: 'static',
                size: 'md'
            });
        }

        vm.accountNumberPopover = {
                templateUrl: 'app/layouts/popover-template/account-number-popover.html'
        };

        function getAccountNumber(withdrawal) {
            /*if (!vm.loginPassword || vm.loginPassword.trim() =='') {
                vm.tooltipIsOpen = true;
                $('#loginPassword').focus();
                return;
            }*/
            var params = {
                    withdrawalId:withdrawal.id,
                    password: vm.loginPassword,
                    history: withdrawal.history? withdrawal.history : false
                }
                Organization.getAccountNumber(params, function(result){
                    vm.thisAccountNumber = result.accountNumber;
                    vm.loginPassword = null;
                    vm.initSearch = false;
                }, function(error) { withdrawal.isOpen = false; onError(error); });
        }

        function accountNumberSearch(withdrawal) {
            vm.initSearch = true;
            vm.loginPassword = '';
            getAccountNumber(withdrawal);
        }

        // 검색 결과를 excel로 다운로드 받는다.
        function downloadExcel() {
            var url = '/api/admin/organizations/search/excel';
            var queryString = $.param(vm.condition, true);
            window.open(url + '?' + queryString, '_blank');
        }

        function loadAll(page) {
            if (page >=0) {
                vm.condition.page = page;
                vm.currentPage = page + 1;
            }
            Organization.searchForAdmin(vm.condition, onSuccess, onError);
        }

        function onSuccess(data, headers) {
            vm.totalItems = headers('X-Total-Count');
            vm.Orgs = data;
        }

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }

        $scope.checkedAll = function () {
            vm.Orgs.filter(function (org) {
                org.checked = $scope.orgAllCheck;
            });
        };
        $scope.orgManageModal = function (org) {
            $uibModal.open({
                templateUrl: 'app/admin/organizations/orgManagementEdit-dialog.html',
                controller: 'OrgManagementEditDialogController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    selectOrg: org
                }
            }).result.then(function (result) {
                    if (result == 'create') loadAll(0);
                    else loadAll();
            });
        };

        $scope.orgTotalDelete = function () {
            vm.Orgs.filter(function (org) {
                return org.checked;
            }).forEach(function (org) {
                org.checked = false;
                $scope.orgDeleteModal(org);
            });
            $scope.orgAllCheck = false;
        };
        $scope.orgDeleteModal = function (org, type) {
            var name = "[ " + org.name + " ]" + " : 선택하신 기관의 모든 정보가 삭제됩니다. 그래도 ";
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
                if (result) Organization.deleteForAdmin({orgId: org.id}, function() { loadAll(0) }, onError);
            });
        };
    }
})();
