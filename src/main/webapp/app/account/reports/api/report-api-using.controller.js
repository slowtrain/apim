(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ReportApiUsingController', ReportApiUsingController);

    ReportApiUsingController.$inject = ['$timeout', 'CommonUtil', '$scope', 'Metrics', 'ReportService'];

    function ReportApiUsingController($timeout, CommonUtil, $scope, Metrics, ReportService) {

        if (!$scope.account.organization || !$scope.account.organization.id || !$scope.account.organization.state == 'INACTIVE') {
            vm.nonOrgAlert = true;
        }

        $('input[id=time]').keydown(function(event){
            event.preventDefault();
        }); //날짜의 수동입력 제한

        var vm = this;
        vm.afterSearch = false;
        vm.pageChanged = pageChanged;
        vm.checkingChanged = checkingChanged;
        vm.getSizeChecked = getSizeChecked;
        vm.arraySorting = arraySorting;
        vm.getUnmappingListFlag = false;
        vm.getMappingListFlag = false;
        vm.page = 0;
        vm.size = 5;
        var condition = {};

        vm.condition = {
            groupBy: 'ORGANIZATION',
            size: vm.size,
            page: vm.page
        };  // 검색조건

        function pageChanged () {
            vm.condition.page = vm.currentPage -1;
            vm.checkingChangedInternal(true);
        }

        vm.forChart = {
            valueName: 'attemptedCount'
        };

        vm.isAutoMode = false;

        vm.options = {
            chart: {
                type: 'stackedAreaChart',
                height: 480,
                margin: {
                    top: 0,
                    right: 10,
                    bottom: 40,
                    left: 90
                },
                x: function (d) {
                    return d[0];
                },
                y: function (d) {
                    var divisor = (vm.forChart.valueName.indexOf('Time') > -1)? 1000 : 1;
                    return d[1][vm.forChart.valueName] / divisor;
                },
                useVoronoi: false,
                clipEdge: true,
                duration: 0,
                useInteractiveGuideline: true,
                xAxis: {
                    showMaxMin: true,
                    tickFormat: function (d) {
                        var format = vm.condition.daily ? '%Y/%m/%d' : '%Y/%m/%d %Hh';
                        return d3.time.format(format)(new Date(d));
                    },
                    rotateLabels: -16,
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
                    showMaxMin: false,
                    tickFormat: function (d) {
                        return (vm.forChart.valueName.indexOf('Min') > -1)? d3.format(',.3f')(d) : (vm.forChart.valueName.indexOf('Time') > -1)? d3.format(',.2f')(d) : d3.format(',')(d);
                    },
                    axisLabel: ''
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

        CommonUtil.underLoading();
        ReportService.organizations().$promise.then(function (response) {
            vm.organizationList = response.orgs;
            vm.appList = response.apps;
            vm.apiList = response.apis;
            /*vm.appList = response.filter(function(app){
                return app.organization.id == $scope.account.organization.id;
            });*/
            vm.appList.forEach(function (app) {
                app.fullName = '[' + app.organization.name + '] ' + app.name;
            });
            vm.apiList.forEach(function (api) {
                api.fullName = '[' + api.organization.name + '] ' + api.name;
                api.appUnmapping = true;

                //app과 연동된 api, 그렇지 않은 api를 appUnmapping 키로 분류한다.
                vm.appList.some(function(app){
                    if (app.appApiMappings) {
                        app.appApiMappings.some(function (mapping) {
                            if(api.id == mapping.api.id) api.appUnmapping = false;
                            return api.id == mapping.api.id;
                        });
                    }
                    return !api.appUnmapping;
                });
            });

            if ($scope.account.organization && $scope.account.organization.type == 'PARTNER') {
                vm.apiList = vm.apiList.filter(function(api) { // 이용기관은 매핑된 정보만 볼 수 있다.
                    return !api.appUnmapping;
                });
            }

            vm.availableApiList = angular.copy(vm.apiList);
            vm.condition.orgIdList = [];
            vm.condition.orgIdList.push($scope.account.organization.id);
            vm.condition.appList = [];
            vm.condition.apiList = [];
            CommonUtil.completeLoading();

            //로딩 후 초기값으로 기관, 앱, API 전체선택
            vm.isOrgAllChecked = true;
            vm.isAppAllChecked = true;
            vm.isApiAllChecked = false;
            //checkingAllgetSize('org');
            getAvailableAppList();
            checkingAllgetSize('app');
            getAvailableApiList();
            checkingAllgetSize('api');
        });

        // html에서 숫자 클릭시 사용될 정렬 reverse 초기값 설정
        vm.orgOrderByChecked = true; //체크된 항목먼저 정렬
        vm.orgOrderByName = true; //이름은 내림차순 정렬
        vm.appOrderByChecked = true;
        vm.appOrderByFullName = true;
        vm.apiOrderByChecked = true;
        vm.apiOrderByFullName = true;
        vm.apiOrderBySelectedAppUnmapping = true; //매핑 안 된 항목먼저 정렬

        function arraySorting(array, cri, reverse) {
            switch(cri){
                case 'checked' :
                    array.sort(function (a, b) {
                        if (a.checked > b.checked) return (reverse)? -1 : 1;
                        if (a.checked < b.checked) return (reverse)? 1 : -1;
                        if (a.fullName > b.fullName) return 1;
                        if (a.fullName < b.fullName) return -1;
                        return 0;
                    });
                    break;
                case 'selectedAppUnmapping' :
                    array.sort(function (a, b) {
                        if (a.selectedAppUnmapping > b.selectedAppUnmapping) return (reverse)? -1 : 1;
                        if (a.selectedAppUnmapping < b.selectedAppUnmapping) return (reverse)? 1 : -1;
                        if (a.appUnmapping > b.appUnmapping) return (reverse)? -1 : 1;
                        if (a.appUnmapping < b.appUnmapping) return (reverse)? 1 : -1;
                        if (a.fullName > b.fullName) return 1;
                        if (a.fullName < b.fullName) return -1;
                        return 0;
                    });
                    break;
                case 'fullName' :
                    array.sort(function (a, b) {
                        if (a.fullName > b.fullName) return (reverse)? -1 : 1;
                        if (a.fullName < b.fullName) return (reverse)? 1 : -1;
                        return 0;
                    });
                    break;
                case 'name' :
                    array.sort(function (a, b) {
                        if (a.name > b.name) return (reverse)? -1 : 1;
                        if (a.name < b.name) return (reverse)? 1 : -1;
                        return 0;
                    });
                    break;
            }
        }

        function getAvailableAppList () {
            vm.availableAppList = [];
            vm.availableAppList = vm.appList.filter(function(app){
                return $.inArray(app.organization.id, vm.condition.orgIdList) > -1;
            });
            //전체선택 또는 전체미선택일 경우 vm.appList 전체가 availableAppList에 들어간다.
            if (vm.condition.orgIdList.length == 0 || vm.condition.orgIdList.length == vm.organizationList.length) {
                angular.copy(vm.appList, vm.availableAppList);
            }
            arraySorting(vm.availableAppList, 'fullName');
        }

        function getAvailableApiList () {
            if (vm.condition.appIdList.length > 0){
                // 앱을 하나이상 선택했을 경우, 앱과 관련된 매핑정보를 API 색으로 표시해준다.
                vm.availableApiList.forEach(function(api){
                    api.selectedAppUnmapping = true;
                    vm.availableAppList.some(function (app) {
                        if ($.inArray(app.id, vm.condition.appIdList) > -1 && app.appApiMappings) {
                            app.appApiMappings.some(function (mapping) {
                                if(api.id == mapping.api.id) api.selectedAppUnmapping = false;
                                return api.id == mapping.api.id;
                            });
                        }
                        return !api.selectedAppUnmapping;
                    });
                });
            }else{
                //앱을 선택하지 않았을 경우에는 선택기관의 모든 앱과 관련된 매핑정보를 API 색으로 표시해준다.
                vm.availableApiList.forEach(function(api){
                    api.selectedAppUnmapping = true;
                    vm.availableAppList.some(function (app) {
                        if (app.appApiMappings) {
                            app.appApiMappings.some(function (mapping) {
                                if(api.id == mapping.api.id) api.selectedAppUnmapping = false;
                                return api.id == mapping.api.id;
                            });
                        }
                        return !api.selectedAppUnmapping;
                    });
                });
            }
            arraySorting(vm.availableApiList, 'selectedAppUnmapping');
        }

        /* 2018-07-13
         * 관리의 API 사용통계,제공통계 화면에서도 (운영자 화면처럼) mapping되지 않은 API정보를 보여주도록 수정
         *
        function getAvailableApiList () {
            vm.availableApiList = [];

            //organization 전체미선택일 경우 vm.apiList 전체가 availableApiList에 들어간다.
            if (vm.condition.orgIdList.length == 0) {
                angular.copy(vm.apiList, vm.availableApiList);

                //기관 전체선택이고, 앱은 전체 미선택일 경우에도 vm.apiList 복사
            }else if(vm.condition.orgIdList.length == vm.organizationList.length && vm.condition.appIdList.length == 0) {
                angular.copy(vm.apiList, vm.availableApiList);

                //앱 선택한 경우에는 선택된 앱과 매핑된 api만 출력
            }else if(vm.condition.appIdList.length > 0){
                getApisAsCheckingApp();

                //기관선택, 앱은 전체 미선택일 경우
            }else{
                // 앱과 매핑되지 않은, 해당기관의 api를 넣는다.
                var displayingApiIdList = vm.apiList.filter(function(api){
                    return $.inArray(api.organization.id, vm.condition.orgIdList) > -1 && api.appUnmapping;
                }).map(function(api){
                    return api.id;
                });
                // 해당기관의 앱과 매핑된 api를 넣는다.
                vm.availableAppList.forEach(function (app) {
                    if (app.appApiMappings) {
                        app.appApiMappings.forEach(function (mapping) {
                            displayingApiIdList.push(mapping.api.id);
                        });
                    }
                });
                vm.availableApiList = vm.apiList.filter(function(api){
                    return $.inArray(api.id, displayingApiIdList) > -1;
                });
            }
            arraySorting(vm.availableApiList, 'fullName');
        }

        //앱 선택 또는 선택해제시 api 리스트 업데이트
        function getApisAsCheckingApp () {
            if (vm.condition.appIdList.length > 0){
                var displayingApiIdList = [];
                vm.availableAppList.forEach(function (app) {
                    if ($.inArray(app.id, vm.condition.appIdList) > -1 && app.appApiMappings) {
                        app.appApiMappings.forEach(function (mapping) {
                            displayingApiIdList.push(mapping.api.id);
                        });
                    }
                });
                vm.availableApiList = vm.apiList.filter(function(api){
                    return $.inArray(api.id, displayingApiIdList) > -1;
                });
            }else{ //앱 전체가 선택해제된 경우
                angular.copy(vm.apiList, vm.availableApiList);
            }
            arraySorting(vm.availableApiList, 'fullName');
        }
        *
        *
        */

        // 전체선택 false
        function uncheckingAll (list, kind) {
            switch(kind){
                case 'org' : vm.isOrgAllChecked = false; vm.searchOrgText = null; break;
                case 'app' : vm.isAppAllChecked = false; vm.searchAppText = null; break;
                case 'api' : vm.isApiAllChecked = false; vm.searchApiText = null; break;
            }
            list.forEach(function(o){
                o.checked = false;
            });
        }

        // 전체 선택 true
        function checkingAll (list, status, filter) {
            list.filter(function(o){
                return filter(o);
            }).forEach(function(o){
                o.checked = status;
            })
        }

        // 상위 목록 선택시 하위 목록 업데이트
        function updateList (category) {
            if (category == 'app') {
                getAvailableAppList();
                uncheckingAll(vm.availableAppList, 'app');
                getSizeChecked('app', false);
            }else{
                getAvailableApiList();
                uncheckingAll(vm.availableApiList, 'api');
                getSizeChecked('api');
            }
        }

        //전체 선택 후 사이즈 구하기
        function checkingAllgetSize (name) {
            switch(name) {
                case 'org' : checkingAll(vm.organizationList, vm.isOrgAllChecked, vm.filterOrganization); getSizeChecked('org', false); break;
                case 'app' : checkingAll(vm.availableAppList, vm.isAppAllChecked, vm.filterApp); getSizeChecked('app', false); break;
                case 'api' : checkingAll(vm.availableApiList, vm.isApiAllChecked, vm.filterApi); getSizeChecked('api'); break;
            }
        }

        //전체 선택 체크박스 클릭 시
        vm.checkingAllCheckBox = function (name) {
            switch(name) {
                case 'org' : checkingAllgetSize('org'); updateList('app'); updateList('api'); break;
                case 'app' : checkingAllgetSize('app'); updateList('api'); if(vm.isAppAllChecked) checkingChanged(); break;
                case 'api' : checkingAllgetSize('api'); if(vm.isApiAllChecked) checkingChanged(); break;
            }
        };

        //각 항목 선택 및 선택해제 시
        vm.checkingOneCheckBox = function (name) {
            switch(name) {
                case 'org' :
                    //vm.searchAppText = null;
                    //vm.searchApiText = null;
                    vm.isOrgAllChecked = false;
                    getSizeChecked('org', false);
                    updateList('app');
                    updateList('api');
                    $('#appScroll').scrollTop(0);
                    $('#apiScroll').scrollTop(0);
                    break;
                case 'app' :
                    //vm.searchApiText = null;
                    vm.isAppAllChecked = false;
                    getSizeChecked('app');
                    updateList('api');
                    $('#apiScroll').scrollTop(0);
                    checkingChanged();
                    break;
                case 'api' :
                    vm.isApiAllChecked = false;
                    getSizeChecked('api');
                    checkingChanged();
                    break;
            }
        };

        function getSizeChecked (name, alert) {
            switch(name) {
                //case 'org' :
                //    vm.condition.orgIdList = vm.organizationList.filter(function (o) {
                //        return o.checked;
                //    }).map(function (o) {
                //        return o.id;
                //    });
                //    if (alert && vm.condition.orgIdList.length == 0) CommonUtil.onError('기관을 먼저 선택하십시오.');
                //    break;
                case 'app' :
                    vm.condition.appIdList = vm.availableAppList.filter(function (o) {
                        return o.checked;
                    }).map(function (o) {
                        return o.id;
                    });
                    if (alert && vm.condition.appIdList.length == 0) CommonUtil.onError('앱을 먼저 선택하십시오.');
                    break;
                case 'api' :
                    vm.condition.apiIdList = vm.availableApiList.filter(function (o) {
                        return o.checked;
                    }).map(function (o) {
                        return o.id;
                    });
                    break;
            }
        }

        vm.changeValueName = function () {
            vm.chartApi.refresh();
            putYaxisLabel();
        };

        function putYaxisLabel () {
            $timeout(function() {
                d3.select('svg > .nvd3 > g > .nv-focus > .nv-y > .nv-axis > g > text.nv-axislabel')
                    .attr('transform', 'rotate(0)')
                    .attr('x', -10)
                    .attr('y', -10);
            });
            vm.options.chart.yAxis.axisLabel = (vm.forChart.valueName.indexOf('Time') > -1)? '단위 (초)' : '';
        }

        function checkingChanged() {
            if (vm.isAutoMode) {
                vm.checkingChangedInternal();
            }
        }

        vm.checkingChangedInternal = function (pageMoved) {
            /*if (vm.condition.fromTime > vm.condition.toTime) {
                CommonUtil.onError('종료일이 시작일보다 앞섭니다.');
                return;
            } else if (vm.condition.toTime - vm.condition.fromTime > 365*60*60*24*1000) {
                CommonUtil.onError('요청기간은 최대 365일입니다.');
                return;
            }*/
            getSizeChecked('org');
            getSizeChecked('app');
            getSizeChecked('api');

            if (!pageMoved) {
                vm.currentPage = 1;
                vm.condition.page= 0;
                vm.condition.size = vm.size;
                condition = angular.copy(vm.condition);
            } else {
                vm.condition.page = vm.currentPage - 1;
                condition.page = vm.condition.page;
            }

            if (condition.orgIdList.length >0 && condition.appIdList.length >0){
                CommonUtil.underLoading();
                if (!pageMoved
                        && !($scope.account.organization && $scope.account.organization.type == 'PARTNER')
                            && vm.availableApiList.length == condition.apiIdList.length) condition.apiIdList = [];
                Metrics.query(condition, function (response, headers) {
                    vm.data = response.map(function (d) {
                        return {
                            key: condition.total ? "합계" : d.key['name'],
                            values: d.values
                        };
                    });
                    vm.totalItems = condition.total? -1: headers('x-total-count');
                    putYaxisLabel();
                    CommonUtil.completeLoading();
                    vm.afterSearch = true;
                });
            } else {
                CommonUtil.onError('하나 이상의 기관과 앱을 선택하십시오.');
            }
        };

        // APP 필터링
        vm.filterApp = function (app) {
            if (!vm.organizationList || vm.organizationList.length == 0) return true;

            // 검색결과가 없을 경우 resultSign은 false가 되고, html에서 resultSize는 0 으로 대체, 전체선택 체크 불가 된다.
            if (vm.searchAppText) {
                if (vm.availableAppList[0].id == app.id) vm.resultSignFilteredApp = false;
                if (app.name.toLowerCase().indexOf(vm.searchAppText.toLowerCase()) > -1) vm.resultSignFilteredApp = true;
                return app.name.toLowerCase().indexOf(vm.searchAppText.toLowerCase()) > -1;
            }else{
                vm.resultSignFilteredApp = true;
                return true;
            }
        };

        vm.filterApi = function (api) {
            // 검색결과가 없을 경우 resultSign은 false가 되고, html에서 resultSize는 0 으로 대체, 전체선택 체크 불가 된다.
            if (vm.searchApiText) {
                if (vm.availableApiList[0].id == api.id) vm.resultSignFilteredApi = false; // 검색어와의 비교 시작시 false가 된다.
                if (vm.getUnmappingListFlag) {
                    if ((api.appUnmapping || api.selectedAppUnmapping) && api.name.toLowerCase().indexOf(vm.searchApiText.toLowerCase()) > -1) vm.resultSignFilteredApi = true;
                    return (api.appUnmapping || api.selectedAppUnmapping) && api.name.toLowerCase().indexOf(vm.searchApiText.toLowerCase()) > -1;
                }
                else if (vm.getMappingListFlag) {
                    if (!(api.appUnmapping || api.selectedAppUnmapping) && api.name.toLowerCase().indexOf(vm.searchApiText.toLowerCase()) > -1) vm.resultSignFilteredApi = true;
                    return !(api.appUnmapping || api.selectedAppUnmapping) && api.name.toLowerCase().indexOf(vm.searchApiText.toLowerCase()) > -1;
                }
                else {
                    if (api.name.toLowerCase().indexOf(vm.searchApiText.toLowerCase()) > -1) vm.resultSignFilteredApi = true;
                    return api.name.toLowerCase().indexOf(vm.searchApiText.toLowerCase()) > -1;
                }
            }else{
                vm.resultSignFilteredApi = true;
                if (vm.getUnmappingListFlag) return api.appUnmapping || api.selectedAppUnmapping;
                else if (vm.getMappingListFlag) return !(api.appUnmapping || api.selectedAppUnmapping);
                else return true;
            }
        };

        /*
         * 2018-07-13
         * 관리의 API 사용통계,제공통계 화면에서도 (운영자 화면처럼) mapping되지 않은 API정보를 보여주도록 수정
         *
        vm.filterApi = function (api) {
            // 검색결과가 없을 경우 resultSign은 false가 되고, html에서 resultSize는 0 으로 대체, 전체선택 체크 불가 된다.
            if (vm.searchApiText) {
                if (vm.availableApiList[0].id == api.id) vm.resultSignFilteredApi = false;
                if (api.name.toLowerCase().indexOf(vm.searchApiText.toLowerCase()) > -1) vm.resultSignFilteredApi = true;
                return api.name.toLowerCase().indexOf(vm.searchApiText.toLowerCase()) > -1;
            }else{
                vm.resultSignFilteredApi = true;
                return true;
            }
        };
        *
        */

        vm.filteringCheckSize = function (name, results) {
            switch(name) {
                case 'org' : vm.resultSizeOfOrgs = results.length; vm.isOrgAllChecked = getBooleanAllChecked(results); break;
                case 'app' : vm.resultSizeOfApps = results.length; vm.isAppAllChecked = getBooleanAllChecked(results); break;
                case 'api' : vm.resultSizeOfApis = results.length; vm.isApiAllChecked = getBooleanAllChecked(results);
                    vm.unmappedApis = vm.availableApiList.filter(function(api){
                        return api.appUnmapping || api.selectedAppUnmapping;
                    });
                    break;
            }
        };

        function getBooleanAllChecked (list) {
            return !list.filter(function(o){
                return !o.checked
            }).length
        }


        vm.downloadExcel = function () {
            //시간 포맷 문제 때문에 변환 작업 수행
            //var condition = $.extend({}, vm.condition);
            //if (condition.fromTime) condition.fromTime = condition.fromTime.toISOString();
            //if (condition.toTime) condition.toTime = condition.toTime.toISOString();

            window.open('api/metrics/excel', "_blank");
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
    }
})();
