(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ChargeAccountController', ChargeAccountController);

    ChargeAccountController.$inject = ['Billing', '$scope', '$rootScope', 'BillingCharge', 'AdminReportService', 'CommonUtil', '$uibModal'];

    function ChargeAccountController(Billing, $scope, $rootScope, BillingCharge, AdminReportService, CommonUtil, $uibModal) {
        // number input에 대한 키보드 입력을 막음
        $("[type='number']").keydown(function (e) {
            e.preventDefault();
        });

        var vm = this;
        vm.size = 10;
        vm.page = 0;
        vm.sort = ['api.organization.name,asc', 'api.name,asc'];
        vm.currentPage = vm.page+1;
        vm.pageChanged = pageChanged;

        vm.success = false;
        vm.alertMessage = '먼저 날짜를 선택하신 후 조회하세요.';
        vm.condition = {};  // 검색조건
        vm.metricsList = {};

        if ($rootScope.account){
            vm.user = $rootScope.account; //login 정보 사용하기 위해.
            vm.isAdmin = $rootScope.account.authorities.indexOf('ROLE_ADMIN') > -1;
        }else vm.user={login: '-1'} //비로그인자에게 -1 부여.

        vm.clickSearchButton = function (allMode) {
            if(allMode) { vm.page = 0; vm.currentPage=1;}
            var condition = $.extend({orgId: vm.user.login != '-1'? vm.user.organizationId: null, page: vm.page, size: vm.size, sort: vm.sort}, vm.condition);
            BillingCharge.accountSelect(condition, function(response, headers) {
                vm.metricsList = response;
                vm.metricsList.forEach(function (metric) {
                    metric.orgWithdrawalTemp = {};
                    if(metric.orgWithdrawal != null){
                        metric.orgWithdrawalTemp.id = metric.orgWithdrawal.id;
                        metric.orgWithdrawalTemp.bankName = metric.orgWithdrawal.bankName;
                        metric.orgWithdrawalTemp.maskingAccountNumber = metric.orgWithdrawal.maskingAccountNumber;
                    }
                });
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

        vm.clickUpdateButton = function(){
            if(vm.metricsList.length == undefined || vm.metricsList.length == 0){
                CommonUtil.onError("데이터가 존재하지 않습니다.");
                return;
            }

            var metricsSaveList = [];
            vm.metricsList.forEach(function (metric) {
                if(metric.orgWithdrawal == null){
                    if(metric.orgWithdrawalTemp.id != null){
                        metricsSaveList.push({id : metric.id, orgWithdrawal : {id : metric.orgWithdrawalTemp.id}});
                    }
                }else if(metric.orgWithdrawal.id != metric.orgWithdrawalTemp.id){
                    metricsSaveList.push({id : metric.id, orgWithdrawal : {id : metric.orgWithdrawalTemp.id}});
                }
            });

            if(metricsSaveList.length == 0){
                CommonUtil.onError("변경내역이 없습니다.");
                return;
            }

            BillingCharge.accountUpdate(metricsSaveList, function (result) {
                var params = {
                        title : '변경 확인',
                        message : "저장되었습니다.",
                        callback : vm.clickSearchButton
                };
                CommonUtil.modalOne(params);
            });
        };

        vm.changeAlias = function(metrics, event){
            metrics.m.organization.orgWithdrawals.forEach(function (orgWithdrawal) {
                if(orgWithdrawal.id == metrics.m.orgWithdrawalTemp.id){
                    metrics.m.orgWithdrawalTemp.bankName = orgWithdrawal.bankName;
                    metrics.m.orgWithdrawalTemp.maskingAccountNumber = orgWithdrawal.maskingAccountNumber;
                }
            });
        };

        function pageChanged() {
            vm.page = vm.currentPage - 1;
            vm.clickSearchButton();
        };

        vm.clickSearchButton(true);
    }
})();
