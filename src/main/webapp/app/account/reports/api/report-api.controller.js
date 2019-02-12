(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ReportApiController', ReportApiController);

    ReportApiController.$inject = ['$scope', 'Metrics', 'ReportService'];

    function ReportApiController($scope, Metrics, ReportService) {
        // number input에 대한 키보드 입력을 막음 ---> ie 호환성 문제로 주석처리, html에서 다른 코딩으로 대체함
        //$("[type='number']").keydown(function (e) {
        //    e.preventDefault();
        //});

        var vm = this;

        vm.checkingRange = function(){
            if(vm.condition.limit <1 || vm.condition.limit >15) {
                vm.rangeViolation = true;
                vm.condition.limit = null;
            }else vm.rangeViolation = false;
        };
        vm.forChart = {
            valueName: 'completedCount'
        };
        vm.condition = {
            groupBy: 'ORGANIZATION',
            limit: 10
        };  // 검색조건
        vm.isAutoMode = false;
        vm.isPartner = isPartner;

        vm.options = {
            chart: {
                type: 'stackedAreaChart',
                height: 490,
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 40,
                    left: 40
                },
                x: function (d) {
                    return d[0];
                },
                y: function (d) {
                    return d[1][vm.forChart.valueName];
                },
                useVoronoi: false,
                clipEdge: true,
                duration: 100,
                useInteractiveGuideline: true,
                xAxis: {
                    showMaxMin: true,
                    tickFormat: function (d) {
                        var format = vm.condition.daily ? '%Y/%m/%d' : '%Y/%m/%d %Hh';
                        return d3.time.format(format)(new Date(d));
                    },
                    rotateLabels: 16,
                    rotateYLabel: true,
                    tickValues: function (d) {
                        if (!d) return [];
                        // X축 라벨 위치를 맞추기 위한 작업
                        var extent = d3.extent(d[0].values, function (v) {
                            return v[0];
                        });
                        var step = vm.condition.daily ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
                        var gap = extent[1] - extent[0];
                        var labelCount = parseInt(gap / step);
                        if (labelCount < 1) return extent;
                        labelCount = Math.min(labelCount, 6);
                        var stepSize = parseInt(gap / labelCount / step) * step;
                        return d3.range(extent[0], extent[1], stepSize);
                    }
                },
                yAxis: {
                    tickFormat: function (d) {
                        return d3.format(',5d')(d);
                    }
                },
                zoom: {
                    enabled: false,
                    scaleExtent: [1, 10],
                    useFixedDomain: false,
                    useNiceScale: false,
                    horizontalOff: false,
                    verticalOff: true,
                    unzoomEventType: 'dblclick.zoom'
                },
                controlLabels: {
                    stacked: '스택',
                    // stream: '스트림',
                    expanded: '확장'
                },
                controlOptions: [
                    'Stacked',
                    // 'Stream',
                    'Expanded'
                ]
            }
        };

        ReportService.organizations().$promise.then(function (response) {
            vm.organizationList = response;
        });
        ReportService.apps().$promise.then(function (response) {
            vm.appList = response;
            vm.appList.forEach(function (app) {
                app.fullName = '[' + app.organization.name + '] ' + app.name;
            });
        });
        ReportService.apis().$promise.then(function (response) {
            vm.apiList = response;
            vm.apiList.forEach(function (api) {
                api.fullName = '[' + api.organization.name + '] ' + api.name;
            });
        });

        // 기관 선택 시
        vm.selectOrganization = function () {
            vm.appList = vm.selectedOrganization.apps;
        };

        // 앱 선택 시
        vm.selectApp = function () {
            var requestParam = {
                orgId: vm.selectedOrganization.id,
                appId: vm.selectedApp.id
            };
            Metrics.query(requestParam, function (response) {
                vm.data = response.map(function (d) {
                    return {
                        key: d.key.name,
                        values: d.values
                    };
                });
            });
        };

        //기관 전체 선택 체크박스 클릭 시
        vm.checkingOrgAll = function () {
            checkingAll(vm.organizationList, vm.isOrgAllChecked, vm.filterOrganization);
        };
        //APP 전체 선택 체크박스 클릭 시
        vm.checkingAppAll = function () {
            checkingAll(vm.appList, vm.isAppAllChecked, vm.filterApp);
        };
        //API 전체 선택 체크박스 클릭 시
        vm.checkingApiAll = function () {
            checkingAll(vm.apiList, vm.isApiAllChecked, vm.filterApi);
        };

        var checkingAll = function (list, status, filter) {

            // 먼저 전체 체크를 해제한다.
            list.forEach(function (o) {
                o.checked = false;
            });
            // 체크 상태가 아니라면 그냥 끝낸다.
            // 체크 상태라면 화면에 보이는 것들 모두 체크한다.
            if (!status) return;
            list.filter(function (o) {
                return filter(o);
            }).forEach(function (o) {
                o.checked = true;
            });
        };

        vm.checkingOrganization = function (organization) {
            vm.searchAppText = null;
            checkingChanged();
        };
        vm.checkingApp = function (app) {
            vm.searchApiText = null;
            checkingChanged();
        };
        vm.checkingApi = function (api) {
            checkingChanged();
        };
        vm.checkingTotal = function () {
            checkingChanged();
        };
        vm.checkingDaily = function () {
            checkingChanged();
        };
        vm.changeGroupBy = function () {
            checkingChanged();
        };
        vm.changeDateValue = function () {
            checkingChanged();
        };
        vm.changeValueName = function () {
            vm.chartApi.refresh();
        };

        function checkingChanged() {
            if (!vm.isAutoMode) return;
            vm.checkingChangedInternal();
        }

        vm.checkingChangedInternal = function () {
            var selectedOrgIdList = vm.organizationList.filter(function (o) {
                return o.checked;
            }).map(function (o) {
                return o.id;
            });
            var selectedAppIdList = vm.appList.filter(function (o) {
                return o.checked;
            }).map(function (o) {
                return o.id;
            });
            var selectedApiIdList = vm.apiList.filter(function (o) {
                return o.checked;
            }).map(function (o) {
                return o.id;
            });
            vm.condition.orgIdList = selectedOrgIdList;
            vm.condition.appIdList = selectedAppIdList;
            vm.condition.apiIdList = selectedApiIdList;

            // vm.condition.fromTime = Date.parse(vm.condition.fromTime);
            // vm.condition.toTime = Date.parse(vm.condition.toTime);

            Metrics.query(vm.condition).$promise.then(function (response) {
                switch (vm.condition.groupBy) {
                    case "ORGANIZATION":
                        vm.forChart.key = 'name';
                        break;
                    case "APP":
                        vm.forChart.key = 'name';
                        break;
                    case "API":
                        vm.forChart.key = 'name';
                        break;
                }
                vm.data = response.map(function (d) {
                    return {
                        key: vm.condition.total ? "합계" : d.key[vm.forChart.key],
                        values: d.values
                    };
                });
            });
        };

        // 기관 필터링
        vm.filterOrganization = function (organization) {
            return !vm.searchOrgText || organization.name.indexOf(vm.searchOrgText) >= 0;
        };

        // APP 필터링
        vm.filterApp = function (app) {
            if (!vm.organizationList || vm.organizationList.length == 0) return true;
            if (vm.searchAppText) return app.title.indexOf(vm.searchAppText) >= 0;
            var selectedOrgIdList = vm.organizationList.filter(function (o) {
                return o.checked;
            }).map(function (o) {
                return o.id;
            });
            if (selectedOrgIdList.length == 0) return true;
            var result = $.inArray(app.organization.id, selectedOrgIdList) >= 0;
            if (!result) app.checked = false;   // 감춰지는 경우 check를 해제한다.
            return result;
        };

        vm.filterApi = function (api) {
            if (!vm.appList || vm.appList.length == 0) return true;
            if (vm.searchApiText) return api.name.indexOf(vm.searchApiText) >= 0;

            var usingApiIdList = [];    // 선택된 APP들이 사용하는 API ID 총 목록
            vm.appList.filter(function (app) {
                return app.checked;
            }).forEach(function (app) {
                if (app.appApiMappings) {
                    app.appApiMappings.forEach(function (mapping) {
                        usingApiIdList.push(mapping.api.id);
                    });
                }
            });

            if (usingApiIdList.length == 0) return true;
            var result = $.inArray(api.id, usingApiIdList) >= 0;
            if (!result) api.checked = false;   // 감춰지는 경우 check를 해제한다.
            return result;
        };

        vm.downloadExcel = function () {
            //시간 포맷 문제 때문에 변환 작업 수행
            var condition = $.extend({}, vm.condition);
            if (condition.fromTime) condition.fromTime = condition.fromTime.toISOString();
            if (condition.toTime) condition.toTime = condition.toTime.toISOString();

            var queryString = $.param(condition, true);
            window.open('api/metrics/excel?' + queryString, "_blank");
        };
        // vm.downloadExcel = function () {
        //     delete vm.condition.fromTime;
        //     delete vm.condition.toTime;
        //
        //     $.get("/api/metrics/excel", vm.condition);
        // };
        //////////////////////////////////////////////////////////////////////////////

        function isPartner() {
            return $scope.organization && $scope.organization.type == 'PARTNER';
        }

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
    }
})();
