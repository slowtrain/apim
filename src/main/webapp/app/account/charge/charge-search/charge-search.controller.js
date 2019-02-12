(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ChargeSearchController', ChargeSearchController);

    ChargeSearchController.$inject = ['Billing', '$scope', '$rootScope', 'BillingCharge', 'AdminReportService', '$uibModalStack', '$uibModal'];

    function ChargeSearchController(Billing, $scope, $rootScope, BillingCharge, AdminReportService, $uibModalStack, $uibModal) {
        // number input에 대한 키보드 입력을 막음
        $("[type='number']").keydown(function (e) {
            e.preventDefault();
        });

        var vm = this;
        vm.size = 10;
        vm.page = 0;
        vm.currentPage = vm.page+1;
        vm.pageChanged = pageChanged;

        vm.success = false;
        vm.alertMessage = '먼저 날짜를 선택하신 후 조회하세요.';
        vm.condition = {};  // 검색조건

        vm.tooltipControl = tooltipControl;

        vm.billingPolicyPopover = {
            templateUrl: 'app/layouts/popover-template/billing-policy-popover.html'
        };

        vm.bankName = "";
        vm.accountNumber = "";

        if ($rootScope.account){
            vm.user = $rootScope.account; //login 정보 사용하기 위해.
            vm.isAdmin = $rootScope.account.authorities.indexOf('ROLE_ADMIN') > -1;
        }else vm.user={login: '-1'} //비로그인자에게 -1 부여.

        vm.clickSearchButton = function (allMode) {
            if(allMode) { vm.page = 0; vm.currentPage=1; vm.selectedOrganization=null; }
            var condition = $.extend({page: vm.page, size: vm.size, sort: vm.sort}, vm.condition);
            if (condition.chargeMonth) condition.chargeMonth = condition.chargeMonth.getFullYear()+""+(condition.chargeMonth.getMonth()<9?"0"+(condition.chargeMonth.getMonth()+1) : condition.chargeMonth.getMonth()+1);
            BillingCharge.queryUsing(condition, function(response, headers) {
                vm.metricsList = response;
                if (allMode){
                    if (!vm.metricsList || vm.metricsList.length == 0) {
                        vm.success = false;
                        vm.alertMessage = '데이터가 존재하지 않습니다.';
                    } else {
                        vm.success = true;
                        vm.totalItems = headers('x-total-count');
                        vm.organizationList = response.organizations;
                    }
                }else{
                    vm.totalItems = headers('x-total-count');
                }
            });
        };

        function pageChanged() {
            vm.page = vm.currentPage - 1;
            vm.clickSearchButton();
        };

        // datePicker settings
        var today = new Date();
        vm.condition.chargeMonth = new Date(today.getFullYear(), today.getMonth()-1, today.getDate(), 0, 0, 0);

        vm.clickSearchButton(true);

        $scope.openDatePicker = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            vm.dateOpen = !vm.dateOpen;
        };

        $scope.dateOptions = {
                datepickerMode:"month"
                ,minMode:"month"
        }

        function tooltipControl(m) {
            if (m.tooltipOpen) m.tooltipOpen = false;
            else {
                vm.metricsList.forEach(function (metric) {
                    metric.tooltipOpen = false;
                });
                Billing.showDetail({id: m.billingPolicyId, orgId: m.orgId}).$promise.then(function (response) {
                    vm.billingPolicy = response;
                    m.tooltipOpen = true;
                });
            }
        }

        vm.showAccount = function(metrics, event){
            vm.bankName = metrics.bankName;
            vm.accountNumber = metrics.accountNumber;
            $uibModal.open({
                templateUrl: 'app/account/charge/charge-search/account-info.html',
                scope: $scope,
                backdrop: 'static',
                size: 'md'
            });
        }

        vm.showApps = function(apiId, orgId) {
            BillingCharge.usedAppList({id : apiId, orgId : orgId}).$promise.then(function(response){
                vm.apps = response;
                $uibModal.open({
                    templateUrl: 'app/account/charge/charge-search/api-app-list.html',
                    scope: $scope,
                    backdrop: 'static',
                    size: 'md'
                });
            });
        }

        vm.clear = function() {
            $uibModalStack.dismissAll();
        }

        vm.downloadExcel = function () {
            var condition = $.extend({orgId: vm.user.organization != null ? vm.user.organization.id : null, page: vm.page, size: vm.size, sort: vm.sort}, vm.condition);
            if (condition.chargeMonth) condition.chargeMonth = condition.chargeMonth.getFullYear()+""+(condition.chargeMonth.getMonth()<9?"0"+(condition.chargeMonth.getMonth()+1) : condition.chargeMonth.getMonth()+1);

            var queryString = $.param(condition, true);
            window.open('api/charge/excel/using?' + queryString, "_blank");
        };
    }
})();
