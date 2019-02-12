(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ApprovalHistoryController', ApprovalHistoryController);

    ApprovalHistoryController.$inject = ['$filter', '$stateParams', '$uibModal', '$scope', 'Approval', 'CommonUtil'];

    function ApprovalHistoryController($filter, $stateParams, $uibModal, $scope, Approval, CommonUtil) {

        var vm = this;
        vm.stateParams = $stateParams;
        vm.authorities = ['ROLE_HASLOGIN'];
        vm.status = [{key: 'PROCESSING', text: '승인진행중'}, {key: 'CLOSED', text: '완료'}];
        vm.showDetail = showDetail;
        vm.pageChanged = pageChanged;
        vm.showApprovalHistoryDetail = showApprovalHistoryDetail;
        vm.showApprover = showApprover;
        vm.sorting = sorting;

        initParam();
        vm.loadAll = loadAll;
        vm.condition = {
            state: (vm.state)? vm.state.key : null,
            requester: vm.requester,
            fromDate: vm.fromDate,
            toDate: vm.toDate,
            login: vm.login,
            size: vm.stateParams.size,
            page: vm.stateParams.page,
            sort: vm.stateParams.sort
        };

        $('input[id=time]').on('focus blur keyup keypress keydown', (function(event){
            event.preventDefault();
        })); //날짜의 수동입력 제한

        vm.loadAll();
        vm.searching = searching;

        function searching () {
            vm.currentPage = 1;
            vm.condition = {
                state: (vm.state)? vm.state.key : null,
                requester: vm.requester,
                fromDate: vm.fromDate,
                toDate: vm.toDate,
                login: vm.login,
                size: vm.stateParams.size,
                page: 0,
                sort: vm.condition.sort
            };
            loadAll();
        }

        function initParam() {
            var currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            // 시작날짜는 7일전으로 한다.
            vm.fromDate = new Date(currentDate.getTime() - (7*60*60*24*1000));
            vm.fromDateOpen = false;
            vm.toDate = currentDate;
            vm.toDateOpen = false;
        }

        //sorting
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
            Approval.historyList(vm.condition, function (response, headers) {
                vm.approvalHistories = response;
                // decision이 없는 경우는 승인 진행 상태임
                vm.approvalHistories.forEach(function (approval) {
                    if (approval.decision) return;
                    approval.decision = {name: "승인 진행 중"};
                });
                vm.totalItems = headers('x-total-count');
            });
        }

        function showApprovalHistoryDetail(idx) {
            vm.show_index = idx;
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
                } else {
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

        function showApprover(approvalHistory) {
            $uibModal.open({
                templateUrl: 'app/services/common/approver-modal.html',
                controller: 'ApproverController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    data: approvalHistory
                }
            }).result.then(function (result) {
                vm.loadAll();
            });
        }

        $scope.openFromDatePicker = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            vm.fromDateOpen = !vm.fromDateOpen;
            vm.toDateOpen = false;
        };

        $scope.openToDatePicker = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            vm.toDateOpen = !vm.toDateOpen;
            vm.fromDateOpen = false;
        }

        $scope.fromDateOptions = {
            showWeeks: false,
            maxDate: new Date(),
            minDate: new Date(2016, 12, 1)
        };

        $scope.toDateOptions = {
            showWeeks: false,
            maxDate: new Date(),
            minDate: vm.fromDate
        };

        $scope.setTime = function() {
            $scope.toDateOptions.minDate = vm.fromDate;
            if (vm.toDate < vm.fromDate) vm.toDate = vm.fromDate;
        }

    }
})();
