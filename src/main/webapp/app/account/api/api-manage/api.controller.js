(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ApiController', ApiController);

    ApiController.$inject = ['$state', '$stateParams', '$uibModal', '$scope', '$window', 'Api', 'CommonUtil', 'ProfileService', 'Code'];

    function ApiController($state, $stateParams, $uibModal, $scope, $window, Api, CommonUtil, ProfileService, Code) {
        var vm = this;
        vm.stateParams = $stateParams;
        vm.authorities = ['ROLE_API_VIEW', 'ROLE_ADMIN'];

        vm.statusFiltering = statusFiltering;

        vm.loadAll = loadAll;
        vm.searching = searching;
        vm.pageChanged = pageChanged;
        vm.showApiStatusPopover = showApiStatusPopover;
        vm.hideApiStatusPopover = hideApiStatusPopover;
        vm.sorting = sorting;
        vm.showApi = showApi;
        vm.reload = $state.reload;

        vm.checkingAllCsv = checkingAllCsv;
        vm.downloadCsv = downloadCsv;
        vm.checkingOne = checkingOne;
        vm.initCsvDown = initCsvDown;
        var internalSignCheckedAll = false;

        vm.condition = {
            apiName: vm.apiName,
            proxy: vm.proxyUrl,
            status: vm.state ? vm.state : null,
            apiPrivateOption: vm.isPrivate? vm.isPrivate : null,
            size: vm.stateParams.size,
            page: vm.stateParams.page,
            sort: vm.stateParams.sort
        };

        vm.initCsvDown();
        vm.loadAll();

        ProfileService.getProfileInfo().then(function (response) {
            vm.inProduction = response.inProduction;
            vm.inTest = response.inTest;
            vm.swaggerEnabled = response.swaggerEnabled;
        });

        vm.tooltipPopover = {
            templateUrl: 'app/layouts/popover-template/approver-popover.html'
        };

        // vm.checkedAll==true 경우 -- yesIdList, noIdList는 빈값으로 전송된다.
        // internalSignCheckedAll==false 이면서 일부만 체크한 경우 -- yesIdList 값이 전송된다. (noIdList는 빈값)
        // internalSignCheckedAll==true 이면서 일부만 해제한 경우 -- noIdList 값이 전송된다. (yesIdList는 빈값)
        // 페이지를 넘길 때마다 vm.yesIdList, vm.noIdList와 api.id를 비교하여 api.checkedCsv 체크표시를 결정한다.

        function downloadCsv() {
            var csvCondition = {
                    apiName: vm.apiName,
                    proxy: vm.proxyUrl,
                    status: vm.state ? vm.state : null,
                    apiPrivateOption: vm.isPrivate? vm.isPrivate : null,
                    yesIdList: vm.yesIdList,
                    noIdList: vm.noIdList
            };
            var queryString = $.param(csvCondition,true);
            window.open('files/download-csv?'+queryString, '_blank');
        }

        function checkingOne(api) {
            if (internalSignCheckedAll) {
                if (!api.checkedCsv) {
                    vm.noIdList.push(api.id);
                    vm.checkedAll = false;
                }
                else vm.noIdList.splice(vm.noIdList.indexOf(api.id), 1);
            } else {
                if (api.checkedCsv) {
                    vm.yesIdList.push(api.id);
                }
                else vm.yesIdList.splice(vm.yesIdList.indexOf(api.id), 1);
            }
            countingChecked();
        }

        function checkingAllCsv(arg) {
            if (arg) vm.checkedAll = !vm.checkedAll;
            internalSignCheckedAll = vm.checkedAll;
            vm.noIdList = [];
            vm.yesIdList = [];
            vm.apis.forEach(function(a){
                a.checkedCsv = vm.checkedAll;
            });
            countingChecked();
        }

        function checkingApisCsv(apis) {
            if (internalSignCheckedAll) {
                apis.forEach(function(a){
                    if ($.inArray(a.id, vm.noIdList) < 0) a.checkedCsv = true;
                });
            } else {
                apis.forEach(function(a){
                    if ($.inArray(a.id, vm.yesIdList) > -1) a.checkedCsv = true;
                });
            }
        }

        function countingChecked() {
            if (internalSignCheckedAll) {
                vm.checkedSize = vm.totalItems - vm.noIdList.length;
            } else {
                vm.checkedSize = vm.yesIdList.length;
            }
        }

        function initCsvDown(arg) {
            if (arg==0) vm.isCsvDown = false;
            vm.noIdList = [];
            vm.yesIdList = [];
            internalSignCheckedAll = false;
            vm.checkedAll = false;
            vm.checkedSize = 0;
            if (vm.apis && vm.apis.length > 0) {
                vm.apis.forEach(function(a){
                    a.checkedCsv = false;
                });
            }
        }

        Code.apiStatusTypes().$promise.then(function(response) {
            vm.status = response.map(function(state){
                return {
                    key: state.key,
                    rename: state.key=='UNUSED'? 'DELETED': state.key,
                    name: state.name
                }
            });
        });

        function statusFiltering (status) {
            return status.key.indexOf('RESERVED') < 0;
        }

        function sorting(predicate, option){
            vm.condition.sort = CommonUtil.sorting(vm.condition.sort, predicate, option);
            vm.condition.page = 0;
            vm.currentPage = 1;
            loadAll();
        }

        function searching () {
            initCsvDown();
            vm.currentPage = 1;
            vm.condition = {
                apiName: vm.apiName,
                proxy: vm.proxyUrl,
                status: vm.state ? vm.state : null,
                apiPrivateOption: vm.isPrivate? vm.isPrivate : null,
                size: vm.stateParams.size,
                page: 0,
                sort: vm.condition.sort //sort는 초기화없이 이전 설정이 계속 유지된다.
            };
            loadAll();
        }

        function showApiStatusPopover(api) {
            if (api.errorText) {
                api.isApiStatusOpen = true;
                vm.errorText = api.errorText;
            } else {
                api.isApiStatusOpen = false;
            }
        }

        function hideApiStatusPopover(api) {
            api.isApiStatusOpen = false;
        }

        function loadAll(page) {
            if (page >=0) {
                vm.condition.page = page;
                vm.currentPage = page + 1;
            }
            Api.list(vm.condition, function (response, headers) {
                vm.apis = response;
                vm.totalItems = headers('x-total-count');
                checkingApisCsv(vm.apis);
            });
        }

        function showApi(api) {
            $uibModal.open({
                templateUrl: 'app/admin/apis/admin-api-management-dialog.html',
                controller: 'AdminApiManagementDialogController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'xl',
                resolve: {
                    selectedApi: api
                }
            });
        }

        function pageChanged() {
            vm.condition.page = vm.currentPage - 1;
            loadAll();
        }

        $scope.changeStatus = function (api, key) {
            initCsvDown(0);
            var func = function (result) {
                if (result) Api.changeStatus({apiId: api.id, toStatus: key}, vm.loadAll, onError);
            };
            var message = '';
            var title = '';
            if (key == "suspend") {
                message = "[ " + api.name + " ] <br/><br/>사용중인 API 서비스를<br/>일시중지 하시겠습니까?";
                title = "서비스 일시중지";
            } else {
                message = "[ " + api.name + " ] <br/><br/>사용 중지된 API 서비스를<br/>재시작 하시겠습니까?";
                title = "서비스 재시작";
            }
            CommonUtil.onError(message, '', 'changeStatus', func, title);
        };

        $scope.testApi = function (api) {
            initCsvDown(0);
            var apiWindow = window.open('/app/swagger/index.html');
            $window.apiConsoleApiId = api.id;
            apiWindow.api = api.id;
        };

        $scope.addApi = function (api) {
            initCsvDown(0);
            $uibModal.open({
                templateUrl: 'app/account/api/api-manage/api-edit-dialog.html',
                controller: 'apiEditDialogController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'xl',
                resolve: {
                    selectedApi: api
                }
            }).result.then(function (result) {
                api? vm.loadAll() : vm.loadAll(0); //수정완료시에는 1페이지로 복귀하지 않는다.
            });
        };

        $scope.uploadCsv = function () {
            initCsvDown(0);
            $uibModal.open({
                templateUrl: 'app/account/api/api-manage/api-csv-up.html',
                controller: 'apiCsvUpController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'md'
            }).result.then(function (result) {
                vm.loadAll(0);
            });
        };

        $scope.delApi = function (api, type) {
            initCsvDown(0);
            Api.groups({apiId: api.id}, function (groupList) {
                var name = (groupList.length > 0) ? "포함되어 있는 그룹이 " + groupList.length + "개가 있습니다. " : "";
                name += api.name + " API를 ";
                var customfunc = function (result) {
                    if (result) Api.delete({id: api.id}, function(){ vm.loadAll(0) }, onError);
                };
                CommonUtil.deleteModal(name, customfunc);
            }, onError);
        };

        $scope.unuseApi = function (api, type) {
            initCsvDown(0);
            Api.groups({apiId: api.id}, function (groupList) {
                var name = (groupList.length > 0) ? "주의 : 포함되어 있는 그룹이 존재합니다.<br/><br/>" : "";
                name += "[ "+ api.name + " ]<br/>해당 API를 ";
                var customfunc = function (result) {
                    if (result) Api.unuse({apiId: api.id}, function(){ vm.loadAll(0) }, onError);
                };
                CommonUtil.unuseModal(name, customfunc);
            }, onError);
        };

        $scope.redeploy = function (api) {
            initCsvDown(0);
            Api.redeploy({apiId: api.id}, underRedeploy, onError);
        };

        function underRedeploy() {
            var func = function(result){
                $state.reload();
            };
            CommonUtil.onError('재처리를 시도합니다.<br/>결과는 잠시 후 새로고침으로 확인하십시오.', '', 'redeploy', func, '재처리');
        }

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }

        $scope.reqApproval = function (api) {
            initCsvDown(0);
            $uibModal.open({
                templateUrl: 'app/services/common/request-approval.html',
                controller: 'ReqApprovalController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    selection: {
                        data: api,
                        type: "api"
                    }
                }
            }).result.then(function (result) {
                vm.loadAll();
            });
        };

        $scope.showAppUsed = function (api) {
            $uibModal.open({
                templateUrl: 'app/account/api/api-manage/app-list.html',
                controller: 'AppListController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'md',
                resolve: {
                    selection: {
                        id: api.id,
                        mode: 'account'
                    }
                }
            }).result.then(function (result) {
                vm.loadAll();
            });
        };
    }
})();
