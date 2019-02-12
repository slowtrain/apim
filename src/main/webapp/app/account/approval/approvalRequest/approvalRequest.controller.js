(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ApprovalRequestController', ApprovalRequestController);

    ApprovalRequestController.$inject = ['$stateParams', '$state', '$uibModal', 'Approval', 'CommonUtil'];

    function ApprovalRequestController($stateParams, $state, $uibModal, Approval, CommonUtil) {

        var vm = this;
        vm.stateParams = $stateParams;
        vm.authorities = ['ROLE_HASLOGIN'];
        vm.showDetail = showDetail;
        vm.approvalCancel = approvalCancel;
        vm.pageChanged = pageChanged;
        vm.sorting = sorting;
        vm.loadAll = loadAll;

        vm.approvalTypes = [{type: 'API', name: 'API'}, {type: 'APP', name: 'APP'}, {type: 'USER', name: 'USER'}, {type: 'ORGANIZATION', name: 'ORG'}];
        vm.status = [{key: 'PROCESSING', text: '승인진행중'}, {key: 'CLOSED', text: '완료'}];

        vm.condition = {
            approvalType: vm.approvalType,
            title: vm.title,
            state: vm.state,
            size: vm.stateParams.size,
            page: vm.stateParams.page,
            sort: vm.stateParams.sort
        };
        vm.loadAll();

        vm.searching = searching;
        function searching () {
            vm.currentPage = 1;
            vm.condition = {
                approvalType: vm.approvalType,
                title: vm.title,
                state: vm.state,
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

        function pageChanged() {
            vm.condition.page = vm.currentPage - 1;
            loadAll();
        }

        function loadAll() {
            Approval.mine(vm.condition, function (response, headers) {
                vm.Approvals = response;
                // decision이 없는 경우는 승인이 진행되고 있다는 의미
                vm.Approvals.forEach(function (approval) {
                    if (approval.decision) return;
                    approval.decision = {name: "승인 진행 중"};
                });
                vm.totalItems = headers('x-total-count');
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

        function approvalCancel(approval) {
            $uibModal.open({
                templateUrl: 'app/services/common/modal.html',
                controller: 'modalController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'sm',
                resolve: {
                    items: function () {
                        return {
                            data: approval,
                            type: 'cancel'
                        }
                    }
                }
            }).result.then(function (result) {
                if (result) {
                    Approval.cancel({id: approval.id}, {detailComment: result}, onSuccess, onError);
                }
            });
        }

        function onSuccess() {
            CommonUtil.onError('완료되기까지 시간이 걸릴 수 있습니다.<br/>새로고침 버튼을 눌러 확인하십시오.', '', '', null, '취소처리 안내');
            vm.loadAll();
        }

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }
    }
})();
