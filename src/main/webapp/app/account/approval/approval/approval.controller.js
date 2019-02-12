(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ApprovalController', ApprovalController);

    ApprovalController.$inject = ['$stateParams', '$uibModal', 'Approval', 'CommonUtil'];

    function ApprovalController($stateParams, $uibModal, Approval, CommonUtil) {
        var vm = this;
        vm.stateParams = $stateParams;
        vm.authorities = ['ROLE_HASLOGIN'];
        vm.showDetail = showDetail;
        vm.pageChanged = pageChanged;
        vm.decide = decide;
        vm.approvalTypes = [{type: 'API', name: 'API'}, {type: 'APP', name: 'APP'}, {type: 'USER', name: 'USER'}, {type: 'ORGANIZATION', name: 'ORG'}];
        vm.loadAll = loadAll;
        vm.condition = {
            approvalType: vm.approvalType,
            requester: vm.requester,
            login: vm.login,
            title: vm.title,
            size: vm.stateParams.size,
            page: vm.stateParams.page,
            sort: vm.stateParams.sort
        };
        vm.loadAll();
        vm.approvertooltipIsOpen = false;
        vm.showApproverPopover = showApproverPopover;
        vm.hideApproverPopover = hideApproverPopover;
        vm.sorting = sorting;
        vm.searching = searching;

        vm.tooltipPopover = {
            templateUrl: 'app/layouts/popover-template/approver-popover.html'
        };

        function searching () {
            vm.currentPage = 1;
            vm.condition = {
                approvalType: vm.approvalType,
                requester: vm.requester,
                login: vm.login,
                title: vm.title,
                size: vm.stateParams.size,
                page: 0,
                sort: vm.condition.sort
            };
            loadAll();
        }

        function sorting(predicate, option){
            vm.condition.sort = CommonUtil.sorting(vm.condition.sort, predicate, option);
            vm.condition.page = 0;
            vm.currentPage = 1;
            loadAll();
        }

        function showApproverPopover(approval) {
            if (approval.approvers) {
                approval.isApproverOpen = true;
                vm.approvers = approval.approvers;
            } else {
                approval.isApproverOpen = false;
            }
        }

        function hideApproverPopover(approval) {
            if (approval.approvers) {
                approval.isApproverOpen = false;
            }
        }

        function pageChanged() {
            vm.condition.page = vm.currentPage - 1;
            loadAll();
        }

        function loadAll() { 
            Approval.list(vm.condition, function (response, headers) {
                vm.Approvals = response;
                vm.totalItems = headers('x-total-count');
            });
        }

        function decide(approval, mode) {
            Approval.delegate({id: approval.id}).$promise.then(function (response) {
                if (response.delegate) response.delegate.creator = response.creator;
                showDialog(approval, mode, response.delegate);
            });
        }

        function showDialog(approval, mode, response) {
            $uibModal.open({
                templateUrl: 'app/account/approval/approval/approval-dialog.html',
                controller: 'ApprovalDialogController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'md',
                resolve: {
                    selections: {
                        obj: approval,
                        mode: mode,
                        data: response
                    }
                }
            }).result.then(function (result) {
                loadAll();
            });
        }

        function showDetail(approval) {
            Approval.delegate({id: approval.id}).$promise.then(function (response) {
                if (approval.type == 'APP') {
                    $uibModal.open({
                        templateUrl: 'app/app-management/app-manage/app-view.html',
                        controller: 'AppViewController',
                        controllerAs: 'vm',
                        backdrop: 'static',
                        size: 'md',
                        resolve: {
                            selectApp: response.delegate
                        }
                    }).result.then(function (result) {
                        vm.loadAll();
                    });
                } else if (approval.type == 'API') {
                    $uibModal.open({
                        templateUrl: 'app/admin/apis/admin-api-management-dialog.html',
                        controller: 'AdminApiManagementDialogController',
                        controllerAs: 'vm',
                        backdrop: 'static',
                        size: 'xl',
                        resolve: {
                            selectedApi: response.delegate
                        }
                    }).result.then(function (result) {
                        vm.loadAll();
                    });
                } else if (approval.type == 'USER') {
                    $uibModal.open({
                        templateUrl: 'app/services/common/user-modal.html',
                        controller: 'UserModalController',
                        controllerAs: 'vm',
                        backdrop: 'static',
                        size: 'md',
                        resolve: {
                            selections: {
                                delegate: response.delegate,
                                type: approval.type
                            }
                        }
                    }).result.then(function (result) {
                        vm.loadAll();
                    });
                }else {
                    $uibModal.open({
                        templateUrl: 'app/account/settings/org-setting/org-detail-view.html',
                        controller: 'OrgSettingController',
                        controllerAs: 'vm',
                        backdrop: 'static',
                        size: 'md',
                        resolve: {
                            selectedOrg: response.delegate
                        }
                    }).result.then(function (result) {
                        vm.loadAll();
                    });
                }
            });
        }
    }
})();
