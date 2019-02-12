(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ChargeAdjustController', ChargeAdjustController);

    ChargeAdjustController.$inject = ['Billing', '$scope', 'BillingCharge', 'AdminReportService', 'CommonUtil', '$uibModal'];

    function ChargeAdjustController(Billing, $scope, BillingCharge, AdminReportService, CommonUtil, $uibModal) {
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
        vm.metricsList = {};

        vm.clickSearchButton = function (allMode) {
            if(allMode) { vm.page = 0; vm.currentPage=1; vm.selectedOrganization=null; }
            var condition = $.extend({page: vm.page, size: vm.size, sort: vm.sort}, vm.condition);
            if (condition.chargeMonth) condition.chargeMonth = condition.chargeMonth.getFullYear()+""+(condition.chargeMonth.getMonth()<9?"0"+(condition.chargeMonth.getMonth()+1) : condition.chargeMonth.getMonth()+1);
            BillingCharge.queryProviding(condition, function(response, headers) {
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

        vm.clickUpdateButton = function(){
            if(vm.metricsList.length == undefined || vm.metricsList.length == 0){
                CommonUtil.onError("데이터가 존재하지 않습니다.");
                return;
            }

            var metricsSaveList = [];
            vm.metricsList.forEach(function (metric) {
                if(metric.updateFlag == true){
                    metricsSaveList.push(metric);
                }
            });

            if(metricsSaveList.length == 0){
                CommonUtil.onError("변경내역이 없습니다.");
                return;
            }

            BillingCharge.update(metricsSaveList, function (result) {
                CommonUtil.onError("저장되었습니다.", '', 'modify', vm.clickSearchButton, '변경 확인');
            });
        };

        vm.changeAmount = function(metrics, event){
            metrics.m.updateFlag = true;
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
    }
})();
