(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('AdminBillingController', AdminBillingController);

    AdminBillingController.$inject = ['Billing', '$scope', 'ReportBilling', 'AdminReportService', '$uibModal'];

    function AdminBillingController(Billing, $scope, ReportBilling, AdminReportService, $uibModal) {
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
            var condition = $.extend({auth: 'admin', filterOrgId: vm.selectedOrganization? vm.selectedOrganization.id: null, page: vm.page, size: vm.size, sort: vm.sort}, vm.condition);
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
            var condition = $.extend({auth: 'admin', filterOrgId: vm.selectedOrganization? vm.selectedOrganization.id: null}, vm.condition);
            if (condition.fromTime) condition.fromTime = condition.fromTime.toISOString();
            if (condition.toTime) condition.toTime = condition.toTime.toISOString();

            var queryString = $.param(condition, true);
            window.open('api/admin/reports/billings/excel?' + queryString, "_blank");
            /*
             $http({
             method: 'GET',
             url: 'api/metrics/excel',
             params: vm.condition,
             responseType: 'arraybuffer'
             }).success(function (data, status, headers) {
             headers = headers();

             var filename = headers['x-filename'];
             var contentType = headers['content-type'];

             var linkElement = document.createElement('a');
             try {
             var blob = new Blob([data], {type: contentType});
             var url = window.URL.createObjectURL(blob);

             linkElement.setAttribute('href', url);
             linkElement.setAttribute("download", filename);

             var clickEvent = new MouseEvent("click", {
             "view": window,
             "bubbles": true,
             "cancelable": false
             });
             linkElement.dispatchEvent(clickEvent);
             } catch (ex) {
             console.log(ex);
             }
             }).error(function (data) {
             console.log(data);
             });
             */
        };
        // vm.downloadExcel = function () {
        //     delete vm.condition.fromTime;
        //     delete vm.condition.toTime;
        //
        //     $.get("/api/metrics/excel", vm.condition);
        // };
        //////////////////////////////////////////////////////////////////////////////

        // datePicker settings
        var today = new Date();
        vm.condition.fromTime = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 0, 0, 0);
        vm.condition.toTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);

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

        // 특정 기관, 앱, APPI에 해당하는 trend 정보 팝업으로 보여준다.
        function showApiTrend(metrics) {
            vm.condition.orgId = metrics.orgId;
            vm.condition.appId = metrics.appId;
            vm.condition.apiId = metrics.apiId;

            var condition = $.extend({auth: 'admin'}, vm.condition);
            ReportBilling.trend(condition).$promise.then(function (response) {
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
            window.open('api/admin/reports/billings/trend/excel?' + queryString, "_blank");
        }

        function ok() {
            $uibModalInstance.close();
        }
    }
})();
