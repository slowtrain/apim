(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ReportBillingUsingController', ReportBillingUsingController);

    ReportBillingUsingController.$inject = ['Billing', '$scope', 'ReportBilling', '$uibModal', 'Principal'];

    function ReportBillingUsingController(Billing, $scope, ReportBilling, $uibModal, Principal) {
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
        vm.months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        vm.years = [];
        vm.requestYear = new Date().getYear()+1900;

        for (var i=4; i > -1; i--) {
            if(vm.requestYear > 2016+i) vm.years.push(vm.requestYear-i);
        }

        vm.requestMonth = new Date().getMonth()+1;

        vm.alertMessage = '먼저 날짜를 선택하신 후 조회하세요.';
        vm.condition = {};  // 검색조건

        vm.showApiTrend = showApiTrend;
        vm.tooltipControl = tooltipControl;

        vm.billingPolicyPopover = {
            templateUrl: 'app/layouts/popover-template/billing-policy-popover.html'
        };

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

        vm.clickSearchButton = function (allMode) {
            if(allMode) { vm.page = 0; vm.currentPage=1; vm.selectedOrganization=null; }
            vm.user = Principal.identity();
            var orgId = vm.user.$$state.value.organization.id;
            var condition = $.extend({filterOrgId: vm.selectedOrganization? vm.selectedOrganization.id: null, orgId: orgId, page: vm.page, size: vm.size, sort: vm.sort}, vm.condition);
            ReportBilling.query(condition, function(response, headers) {
                vm.metricsList = response.billingMetrics;
                if (allMode){
                    if (!vm.metricsList || vm.metricsList.length == 0) {
                        vm.success = false;
                        vm.alertMessage = '데이터가 존재하지 않습니다.';
                    } else {
                        vm.success = true;
                        vm.totalItems = headers('x-total-count');
                        vm.organizationList = response.organizations;
                        //var organizationMap = {};
                        //vm.organizationList = [];
                        //vm.metricsList.forEach(function (m) {
                        //    if (organizationMap.hasOwnProperty(m.orgId)) return;
                        //    organizationMap[m.orgId] = {id: m.orgId};
                        //    vm.organizationList.push({
                        //        id: m.orgId,
                        //        name: m.orgName
                        //    });
                        //});
                        //vm.selectedOrganization = vm.organizationList[0];
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

        //selectBox에서 선택값 변동이 일어난 경우
        vm.selectingOrg = function(){
            vm.page = 0; vm.currentPage = 1;
            vm.clickSearchButton();
        };

        vm.downloadExcel = function () {
            //시간 포맷 문제 때문에 변환 작업 수행
            var condition = $.extend({filterOrgId: vm.selectedOrganization? vm.selectedOrganization.id: null}, vm.condition);
            if (condition.fromTime) condition.fromTime = condition.fromTime.toISOString();
            if (condition.toTime) condition.toTime = condition.toTime.toISOString();

            var queryString = $.param(condition, true);
            window.open('api/reports/billings/excel?' + queryString, "_blank");
        };


     // datePicker settings
        var today = new Date();
        vm.condition.fromTime = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 0, 0, 0);
        vm.condition.toTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);

        vm.setToTime = function() {
            var after365Dates = new Date(vm.condition.fromTime.getTime() + (365*60*60*24*1000));
            if (vm.condition.toTime > after365Dates) vm.condition.toTime = after365Dates;
            else if (vm.condition.toTime < vm.condition.fromTime) vm.condition.toTime = vm.condition.fromTime;
            $scope.toDateOptions.maxDate = after365Dates > new Date() ? new Date() : after365Dates;
            $scope.toDateOptions.minDate = vm.condition.fromTime;
        };

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
        };

        $scope.fromDateOptions = {
            showWeeks: false,
            maxDate: new Date(),
            minDate: new Date(2016, 12, 1)
        };

        $scope.toDateOptions = {
            showWeeks: false,
            maxDate: new Date(),
            minDate: vm.condition.fromTime
        };

        // 특정 기관, 앱, APPI에 해당하는 trend 정보 팝업으로 보여준다.
        function showApiTrend(metrics) {
            vm.condition.orgId = metrics.orgId;
            vm.condition.appId = metrics.appId;
            vm.condition.apiId = metrics.apiId;
            ReportBilling.trend(vm.condition).$promise.then(function (response) {
                var apiTrendModalInstance = $uibModal.open({
                    templateUrl: 'app/templates/modal/trend-chart.html',
                    controller: 'ApiTrendModalController',
                    controllerAs: 'vm',
                    size: 'lg',
                    resolve: {
                        items: function () {
                            return {
                                metrics: metrics,
                                trend: response,
                                condition: vm.condition
                            }
                        }
                    }
                });
            });
        }
    }
})();

/**
 *  api trend를 표현하기 위한 controller
 * */
(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ApiTrendModalController', ApiTrendModalController);

    ApiTrendModalController.$inject = ['$uibModalInstance', 'items'];

    function ApiTrendModalController($uibModalInstance, items) {
        var vm = this;

        vm.title = '[' + items.metrics.orgName + '] ' + items.metrics.appName;
        vm.data = [{
            key: items.metrics.apiName,
            values: items.trend
        }];
        vm.condition = items.condition;

        vm.ok = ok;
        vm.downloadExcel = downloadExcel;

        vm.options = {
            chart: {
                type: 'multiBarChart',
                height: 200,
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 45,
                    left: 45
                },
                clipEdge: true,
                duration: 0, // IE에서의 작동오류로 인해 0 설정
                stacked: true,
                showControls: false,
                xAxis: {
                    showMaxMin: true,
                    tickFormat: function (d) {
                        var format = '%m / %d';
                        return d3.time.format(format)(new Date(d));
                    },
                    rotateLabels: -16
                },
                yAxis: {
                    tickFormat: function (d) {
                        return d3.format(',5d')(d);
                    }
                },
                x: function (d) {
                    return d[0];
                },
                y: function (d) {
                    return d[1];
                }
            }
        };

        function downloadExcel() {
            //시간 포맷 문제 때문에 변환 작업 수행
            var condition = $.extend({}, vm.condition);
            if (condition.fromTime) condition.fromTime = condition.fromTime.toISOString();
            if (condition.toTime) condition.toTime = condition.toTime.toISOString();

            var queryString = $.param(condition, true);
            window.open('api/reports/billings/trend/excel?' + queryString, "_blank");
        }

        function ok() {
            $uibModalInstance.close();
        }
    }
})();
