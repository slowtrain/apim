(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('AppManageController', AppManageController);

    AppManageController.$inject = ['$timeout', 'Code', 'Organization', 'Principal', '$uibModalStack', '$stateParams', '$scope', '$uibModal', '$state', 'Apps', 'Api', 'ApiGroup', 'CommonUtil'];

    function AppManageController($timeout, Code, Organization, Principal, $uibModalStack, $stateParams, $scope, $uibModal, $state, Apps, Api, ApiGroup, CommonUtil) {
        var vm = this;
        vm.state = $state;
        vm.stateParams = $stateParams;

        vm.dialogApp = dialogApp;
        vm.delApp = delApp;
        vm.viewApp = viewApp;
        vm.clear = clear;
        vm.authorities = ['ROLE_APP_VIEW'];
        vm.appStatus = Code.appStatusTypes();
        vm.statusFiltering = statusFiltering;
        vm.pageChanged = pageChanged;
        vm.sorting = sorting;
        vm.searching = searching;

        vm.showDetail = false;
        vm.show = show;
        vm.genkey = genkey;
        vm.getWhiteList = getWhiteList;
        vm.setWhiteList = setWhiteList;
        vm.addWhiteList = addWhiteList;
        vm.delWhiteList = delWhiteList;
        vm.filterApi = filterApi;
        vm.save = save;
        vm.requestApproval = requestApproval;
        vm.isOpen = false;
        vm.getSecret = getSecret;
        vm.regenSecret = regenSecret;
        vm.clickSecretButton = clickSecretButton;
        vm.initSecret = false;
        vm.completeSecret = completeSecret;
        vm.changeStatus = changeStatus;
        vm.checkApiPlan = checkApiPlan;
        vm.closeTerm = closeTerm;
        vm.showTermsContent = showTermsContent;
        vm.termContent = "약관을 선택해주세요.";
        vm.activeTabIndex = 0;
        vm.checkSearch = checkSearch;
        vm.checkInvalidApi = checkInvalidApi;
        vm.scopesLoad = scopesLoad;
        vm.applicationScopes = applicationScopes;
        vm.checkAll = checkAll;
        vm.deleteScope = deleteScope;
        vm.filter = filter;
        vm.apiListOrderBy = apiListOrderBy;
        vm.redeploy = redeploy;
        vm.getDeployFailList = getDeployFailList;
        vm.checkNeedWhiteList = checkNeedWhiteList;
        vm.gotoTab = gotoTab;
        vm.apiFilter = apiFilter;
        vm.group = {}; //apiFilter를 위해서 미리 초기화한다.

        vm.groupIds = groupIds;
        vm.groupIds2 = groupIds2;
        vm.selectFilter = selectFilter;
        vm.selectFilter2 = selectFilter2;

        vm.rollback = rollback
        vm.providers = Organization.providers();

        vm.alerts = [];
        vm.serverIp = [];
        vm.closeAlert = closeAlert;
        vm.whiteList = [];

        //체크박스 초기값
        vm.isOrgAllChecked = true;
        vm.isNewAllChecked = false;
        vm.orgIdList = [];
        vm.orgIdListSet2 = [];
        vm.orgIdList2 = [];
        vm.getSizeChecked = getSizeChecked;
        vm.getSizeChecked2 = getSizeChecked2;

        vm.condition = {
            appName: vm.appName,
            status: (vm.status)? vm.status : null,
            size: vm.stateParams.size,
            page: vm.stateParams.page,
            sort: vm.stateParams.sort
        };

        vm.loadAll = loadAll;
        vm.loadAll();

        vm.appDeployStatus = {
            templateUrl: 'app/layouts/popover-template/app-deploystatus-popover.html'
        };

        vm.secretPopover = {
            templateUrl: 'app/layouts/popover-template/secret-popover.html'
        };

        vm.apiplanPopover = {
                templateUrl: 'app/layouts/popover-template/app-apiplan-popover.html'
        };

        vm.termPopover = {
            templateUrl: 'app/layouts/popover-template/content-popover.html'
        };

        vm.scopePopover = {
                templateUrl: 'app/layouts/popover-template/app-scope-popover.html'
        };

        Principal.hasAuthority('ROLE_APP_MODIFY').then(function (result) {
            if(result) vm.appModifyAuthority = true;
        });

        function rollback(app) {
            var param = {
                    message : "승인받지 못한 수정사항을<br/>원래 정보로 롤백하시겠습니까?<br/><br/>'예'를 선택하여 롤백하면,<br/>[상세보기]창(앱 이름클릭)에서<br/>변경요청내용이 삭제됩니다.<br/>------------------------------------------------<br/>다시 수정하여 승인을 재요청하시려면<br/>'아니오'를 누르십시오.",
                    title : "롤백 확인",
                    button : {
                        text1 : "예",
                        text2 : "아니오"
                    },
                    callback : function(result) {
                        if (result) Apps.deleteLatestHistory({id: app.id}, onSuccess, onError);
                    }
            }
            CommonUtil.modalTwo(param);
        }

        function gotoTab(idx) {
            $scope.active = idx;
            //initSearchCondition();
        }

        function statusFiltering (status) {
            return status.key.indexOf('RESERVED') < 0;
        }

        function apiListOrderBy(api) {
            return [!!api.apiPlan, api.api.termsOfUse && !!api.consentTerm, api.api.organization.name + api.api.name];
        }

        function sorting(predicate, option) {
            vm.condition.sort = CommonUtil.sorting(vm.condition.sort, predicate, option);
            vm.condition.page = 0;
            vm.currentPage = 1;
            loadAll();
        }

        vm.needWhiteList = false;
        function checkNeedWhiteList() {
            vm.needWhiteList = false;
            vm.apiList.some(function(api){
                if (api.api.needWhiteList) vm.needWhiteList = true;
                return vm.needWhiteList;
            });
        }

        function getDeployFailList(app){
            if(!app.openDeployStatus){
                app.openDeployStatus = true;
                Apps.deployFailList({id: app.id}).$promise.then(function(response){
                    app.deployFailOrgs = response;
                }).catch(function(error){
                    CommonUtil.onError(error.data.description);
                });
            }else app.openDeployStatus = false;

        }
        function redeploy(app) {
            if (app.status == 'DELETE_FAIL') {
                Apps.delete({id: app.id}, vm.loadAll, onError);
                var func = function(result){
                    loadAll();
                };
                CommonUtil.onError('삭제를 다시 시도합니다.<br/>결과는 잠시 후 새로고침으로 확인하십시오.', '', 'redeploy', func, '삭제 재처리');
            } else Apps.redeploy({id: app.id}, underRedeploy, onError);
        }

        function underRedeploy() {
            var func = function(result){
                $state.reload();
            };
            CommonUtil.onError('재처리를 시도합니다.<br/>결과는 잠시 후 새로고침으로 확인하십시오.', '', 'redeploy', func, '재처리');
        }

        // 팝오버에서 API 사용정책의 상세정보를 표시하기 위해
        function filter(value, choice){
            var result='';
            if(choice ==1){
                vm.quotaValueUseCycleOption.some(function(option){
                    if(value==option.val) result = option.name;
                    return value==option.val;
                });
                return result;
            }else{
                vm.dayLimitOption.some(function(option){
                    if(value==option.val) result = option.name;
                    return value==option.val;
                });
                return result;
            }
        }
        vm.quotaValueUseCycleOption = [
            {val:'SECOND', name:'초'},
            {val:'MINUTE', name:'분'},
            {val:'HOUR', name:'시'},
            {val:'DAY', name:'일'},
            {val:'MONTH', name:'월'}
        ];
        vm.dayLimitOption = [
            {val:'SUNDAY', name:'일'},
            {val:'MONDAY', name:'월'},
            {val:'TUESDAY', name:'화'},
            {val:'WEDNESDAY', name:'수'},
            {val:'THURSDAY', name:'목'},
            {val:'FRIDAY', name:'금'},
            {val:'SATURDAY', name:'토'}
        ];


        function checkInvalidApi() {
            var invalidFlag = false;
            if (!vm.apiList || vm.apiList.length == 0) invalidFlag = true;
            else {
                vm.apiList.some(function (api) {
                    if ((api.api.termsOfUse && !api.consentTerm) || !api.apiPlan) invalidFlag = true;
                    return invalidFlag;
                });
            }
            return invalidFlag;
        }

        function checkSearch() {
            vm.searchApi = (!vm.searchApi.organization) ? {} : vm.searchApi;
        }

        function changeStatus(app, key) {
            var func = function(result){
                if(result){
                    Apps.changeStatus({appId: app.id, toStatus: key}, vm.loadAll, function (error) {
                        CommonUtil.onError(error.data.description)
                    });
                }
            };
            var message=''; var title='';
            if(key=="suspend"){
                message = "[ "+app.name+" ] <br/><br/>사용중인 APP 서비스를<br/>일시중지 하시겠습니까?";
                title = "서비스 일시중지";
            }else{
                message = "[ "+app.name+" ] <br/><br/>사용 중지된 APP 서비스를<br/>재시작 하시겠습니까?";
                title = "서비스 재시작";
            }
            CommonUtil.onError(message, '','changeStatus', func, title);
        }

        function completeSecret() {
            vm.isOpen = false; //app-view 화면에서 사용
            vm.popOpen = false; //app 수정 화면에서 사용
        }

        function getSecret() {
            if (!vm.password || vm.password.trim() == '') {
                vm.tooltipIsOpen = true;
                $("#password").focus();
                return;
            }
            Apps.getSecret({id: vm.appDetail.id, password: vm.password}, function (result) {
                vm.secret = result.secret;
                vm.password = null;
                vm.initSecret = false;
            }, onError);
        }

        function regenSecret() {
            Apps.regenSecret({id: vm.appDetail.id}, function (result) {
                    vm.secret = result.secret;
                }, onError);
        }

        function clickSecretButton() {
            vm.isOpen = true;
            vm.initSecret = true;
            vm.password = "";
        }

        function genkey() {
            /*var serverIp ='';
            vm.serverIp.forEach(function(v){
                v = (v.length == 1)? '00'+v : (v.length == 2)? '0'+v : v;
                serverIp += v;
            });*/
            Apps.genkey({id: vm.appDetail.id}, function (result) {
                vm.appDetail.appKey = result.appKey;
            });
        }

        function getWhiteList() {
            if (!!vm.appDetail.whiteList) vm.whiteList = vm.appDetail.whiteList.split("|");
            else vm.whiteList = [];
        }

        function setWhiteList() {
            if (vm.needWhiteList) {
                vm.appDetail.whiteList = vm.whiteList.length? vm.whiteList.join("|").trim() : null;
            } else vm.appDetail.whiteList = null;
        }

        function addWhiteList() {
            if (vm.whiteIp != "") {
                if (!(vm.whiteIp.split('.').filter(function(v){return v==Number(v).toString() && Number(v) < 256}).length==4)) {
                    CommonUtil.onError("입력하신 IP의 형식이 올바르지 않습니다.");
                    return false;
                }
                if ($.inArray(vm.whiteIp, vm.whiteList) > -1) {
                    CommonUtil.onError("IP 주소를 중복 입력하셨습니다.");
                    return false;
                }
                vm.whiteList.push(vm.whiteIp);
                vm.whiteIp = "";
            }
        }

        function delWhiteList(index) {
            vm.whiteList.splice(index, 1);
        }

        function scopesLoad() {
            vm.selectedScopes = [];
            Code.scopeTypes().$promise.then(function (response) {
                vm.scopes = response;
                vm.scopes.forEach(function (scope) {
                    scope.checked = false;
                    scope.isDisabled = false;
                    scope.usableScope = true;
                });
                if (vm.appScopes.length > 0) {
                    vm.appScopes.forEach(function (appScope) {
                        appScope.checked = false;
                        appScope.isDisabled = false;
                        vm.scopes.some(function (original) {
                            if (appScope.scope == original.scope) {
                                appScope.isDisabled = true;
                                original.isDisabled = true;
                                original.usableScope = true;
                                vm.selectedScopes.push(original);
                            }

                            return appScope.scope == original.scope;
                        });
                        if(!appScope.isDisabled) vm.selectedScopes.push(appScope);
                    });
                }
                vm.isScopeOpen = false;
            });
        }

        function checkAll(checked) {
            vm.scopes.filter(function (scope) {
                return !scope.isDisabled; //false 또는 아예 key가 없는 경우를 모두 찾아낼 때
            }).forEach(function(scope){
                scope.checked = checked;
            });
        }

        function applicationScopes() {
            //vm.selectedScopes = [];
            vm.scopes.filter(function (scope) {
                return scope.checked==true && !scope.isDisabled;
            }).forEach(function (scope) {
                vm.selectedScopes.push(scope);
                scope.isDisabled = true;
            });
            vm.isScopeOpen = false;
        }

        function deleteScope(scope) {
            if (vm.selectedScopes.length == 1) {
                vm.tooltipIsOpen = true;
                $timeout(function () {
                    vm.tooltipIsOpen = false;
                }, 500);
            } else {
                if(scope.usableScope) implementDelete(scope);
                else {
                    var message="해당 항목은 현재 SCOPE관리 대상에서 제외되어 있습니다. 삭제하실 경우 재선택할 수 없습니다. 그래도";
                    var func = function(result){
                        if(result) implementDelete(scope);
                    };
                    CommonUtil.deleteModal(message, func);
                }
            }
        }

        function implementDelete(scope){
            vm.selectedScopes.splice(vm.selectedScopes.indexOf(scope), 1);
            scope.checked = false;
            vm.allSelect = false;
            scope.isDisabled = false;
        }

        function initSearchCondition() {
            vm.depart = null;
            vm.depart2 = null;
            vm.searchApi2 = null;
            vm.searchApi3 = null;
            vm.searchApi = null;
            vm.searchGroup = null;
        }

        function show(app) {
            CommonUtil.underLoading('underLoading', {top:'72px', left:'-1px', width:'100.2%', height:'92%'}, '50%');
            vm.showDetail = true;
            initSearchCondition();
            Apps.search({id: app.id}, function(response) {
                vm.appDetail = response;
                if (vm.appDetail.oAuthScope){
                    vm.appDetail.oAuthScope.split(' ').forEach(function(value){
                        vm.appScopes.push({scope: value});
                    });
                }else vm.appScopes = [];
                vm.apiList = vm.appDetail.appApiMappings;
                if (vm.apiList.length > 0) {
                    vm.apiList.forEach(function (api) {
                        api.consentTerm = true;
                        api.isOpen = false;
                    });
                }
                CommonUtil.completeLoading();
                vm.apiLoad();
                vm.scopesLoad();
                getWhiteList();
            });
        }

        function checkApiPlan(api){
            api.usablePlan = false;
            api.api.applicablePlans.some(function(plan){
                if(api.apiPlan && api.apiPlan.id == plan.id) api.usablePlan = true;
                return api.apiPlan && api.apiPlan.id == plan.id;
            });
        }

        function searching () {
            vm.currentPage = 1;
            vm.condition = {
                appName: vm.appName,
                status: (vm.status)? vm.status : null,
                size: vm.stateParams.size,
                page: 0,
                sort: vm.condition.sort
            };
            loadAll();
        }

        // 선택된 API 정보 필터링
        // vm.groupIds = function (organization) {
        //     console.log('xxx')
        //     if (vm.searchApi.name) {
        //         console.log(vm.searchApi.name)
        //         if (vm.organizationList[0].id == organization.id) vm.resultSignFilteredOrg = false;
        //         if (organization.name.toLowerCase().indexOf(vm.searchOrgText.toLowerCase()) > -1) vm.resultSignFilteredOrg = true;
        //         return organization.name.toLowerCase().indexOf(vm.searchOrgText.toLowerCase()) > -1;
        //     }else{
        //         vm.resultSignFilteredOrg = true;
        //         return true;
        //     }
        // };

        function loadAll(page) {
            vm.showDetail = false;
            vm.serverIp = [];
            vm.appScopes = [];
            if (page >=0) {
                vm.condition.page = page;
                vm.currentPage = page + 1;
            }
            if (vm.state.current.name == 'appManage') {
                Apps.orgList(vm.condition, function (response, headers) {
                    vm.apps = response;
                    vm.totalItems = headers('x-total-count');
                });
            } else {
                Apps.myList(vm.condition, function (response, headers) {
                    vm.apps = response;
                    vm.totalItems = headers('x-total-count');
                });
            }
        }

        function apiFilter(api) {
            return vm.group.isPrivate? api.isPrivate : true;
        }

        function pageChanged() {
            vm.condition.page = vm.currentPage - 1;
            loadAll();
        }

        function dialogApp(app) {
            $uibModal.open({
                templateUrl: 'app/app-management/app-manage/app-dialog.html',
                controller: 'AppDialogController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'md',
                resolve: {
                    selectApp: app
                }
            }).result.then(function (result) {
                vm.alerts.push({
                    type: 'success',
                    message: '앱(' + result.name + ')이 추가되었습니다.'
                });
                vm.loadAll(0);
            });
        }

        function delApp(app, type) {
            var name = app.name + " 앱을";
            $uibModal.open({
                templateUrl: 'app/services/common/modal.html',
                controller: 'modalController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'sm',
                resolve: {
                    items: function () {
                        return {
                            data: name,
                            type: type
                        }
                    }
                }
            }).result.then(function (result) {
                if (result) {
                    Apps.delete({id: app.id}, function() { vm.loadAll() }, onError);
                    var func = function(result){
                        loadAll();
                    };
                    CommonUtil.onError('결과는 잠시 후 새로고침으로 확인하십시오.<br/>[삭제 처리 실패]가 발생했을 경우,<br/>재처리를 시도하십시오.', '', 'redeploy', func, '삭제안내');
                }
            });
        }

        function viewApp(app) {
            Apps.search({id: app.id}, function(response) {
                $uibModal.open({
                    templateUrl: 'app/app-management/app-manage/app-view.html',
                    controller: 'AppViewController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'md',
                    resolve: {
                        selectApp: response
                    }
                }).result.then(function (result) {
                    vm.loadAll();
                });
            });
        }

        function clear() {
            $uibModalStack.dismissAll();
            //$uibModalInstance.dismiss('cancel');
        }

        //상세정보의 API정보 표시하기

        vm.removeApi = removeApi;
        vm.apiLoad = apiLoad;
        vm.apiGroupsLoad = apiGroupsLoad;
        vm.selectApi = selectApi;
        vm.selectGroupApi = selectGroupApi;
        vm.showPlan = false;
        vm.sizeForAvailableApis = 20;
        vm.pageForAvailableApis = 0;
        vm.sortForAvailableApis = 'name,asc';
        vm.searchingForAvailableApis = searchingForAvailableApis;
        vm.pageChangedForAvailableApis = pageChangedForAvailableApis;
        vm.sizeForAvailableGroups = 20;
        vm.pageForAvailableGroups = 0;
        vm.sortForAvailableGroups = 'name,asc';
        vm.searchingForAvailableGroups = searchingForAvailableGroups;
        vm.pageChangedForAvailableGroups = pageChangedForAvailableGroups;

        vm.conditionForAvailableApis = {
                orgId: (vm.searchApi && vm.searchApi.organization)? vm.searchApi.organization.id : null,
                apiName: (vm.searchApi)? vm.searchApi.name : null,
                size: vm.sizeForAvailableApis,
                page: vm.pageForAvailableApis,
                sort: vm.sortForAvailableApis
            };

        function searchingForAvailableApis () {
            vm.currentPageOfAvailableApis = 1;
            vm.conditionForAvailableApis = {
                orgId: (vm.searchApi && vm.searchApi.organization)? vm.searchApi.organization.id : null,
                apiName: (vm.searchApi)? vm.searchApi.name : null,
                size: vm.sizeForAvailableApis,
                page: 0,
                sort: vm.sortForAvailableApis
            };
            apiLoad();
        }

        function pageChangedForAvailableApis() {
            vm.conditionForAvailableApis.page = vm.currentPageOfAvailableApis - 1;
            apiLoad();
        }

        vm.conditionForAvailableGroups = {
                orgId: (vm.searchGroup && vm.searchGroup.organization)? vm.searchGroup.organization.id : null,
                apiGroupName: (vm.searchGroup && vm.searchGroup.name)? vm.searchGroup.name : null,
                size: vm.sizeForAvailableGroups,
                page: vm.pageForAvailableGroups,
                sort: vm.sortForAvailableGroups
            };

        function searchingForAvailableGroups () {
            vm.currentPageOfAvailableGroups = 1;
            vm.conditionForAvailableGroups = {
                orgId: (vm.searchGroup && vm.searchGroup.organization)? vm.searchGroup.organization.id : null,
                apiGroupName: (vm.searchGroup && vm.searchGroup.name)? vm.searchGroup.name : null,
                size: vm.sizeForAvailableGroups,
                page: 0,
                sort: vm.sortForAvailableGroups
            };
            apiGroupsLoad();
        }

        function pageChangedForAvailableGroups() {
            vm.conditionForAvailableGroups.page = vm.currentPageOfAvailableGroups - 1;
            apiGroupsLoad();
        }

        function apiLoad() {
            CommonUtil.underLoading('underLoading', {top:'72px', left:'-1px', width:'100.2%', height:'92%'}, '50%');
            vm.apiUnit = true;
            Apps.apiList(vm.conditionForAvailableApis, function (response, headers) {
                vm.availableList = response;
                vm.availableList.forEach(function (v, i) {
                    v.currentSelected = false;
                    if (vm.apiList) {
                        vm.apiList.some(function (selected) {
                            if (selected.api.id == v.id) {
                                v.currentSelected = true;
                            }
                            return selected.api.id == v.id;
                        });
                    }
                });
                vm.totalAvailableApis = headers('x-total-count');
                /*if (vm.apiList) {
                    vm.apiList.forEach(function (v, i) {
                        vm.availableList = vm.availableList.filter(function (el) {
                            return v.api.id != el.id;
                        });
                    });
                }
                arraySorting(vm.availableList);*/
                CommonUtil.completeLoading();
            });
            vm.orgIdListSet = vm.apiList
            vm.apiListSet = vm.apiList;
            getSizeChecked('origin', false, vm.groupIds);
            getSizeChecked('new', false, vm.groupIds2);

            getSizeChecked2('origin', false, vm.groupIds);
            getSizeChecked2('new', false, vm.groupIds2);
        }

        function apiGroupsLoad() {
            CommonUtil.underLoading('underLoading', {top:'72px', left:'-1px', width:'100.2%', height:'92%'}, '50%');
            vm.apiUnit = false;
            Apps.apigroups(vm.conditionForAvailableGroups, function (response, headers) {
                vm.availableList = response;
                vm.totalAvailableGroups = headers('x-total-count');
                CommonUtil.completeLoading();
            });
        }

        function arraySorting(array) {
            array.sort(function (a, b) {
                if (a.organization.name > b.organization.name) return 1;
                if (a.organization.name < b.organization.name) return -1;
                if (a.name > b.name) return 1;
                if (a.name < b.name) return -1;
                return 0;
            });
        }

        function filterApi(api) {
            return !vm.searchApi || api.name.indexOf(vm.searchApi) >= 0;
        }

        function selectGroupApi(index, apiGroup) {
            var newApiList = apiGroup.apis;
            if (vm.apiList) {
                vm.apiList.forEach(function (v, i) {
                    newApiList = newApiList.filter(function (el) {
                        return (v.api.id != el.id);
                    });
                });
            }

            var param = {
                    message : "선택하신 그룹의 API 중에서<br/>신규추가될 API는 "+ newApiList.length +"개<br/>이미추가된 API는 "+ (apiGroup.apis.length - newApiList.length) +"개<br/><br/>확인을 누르면 신규API가 테이블상단에 추가됩니다.",
                    title : "선택 확인",
                    button : {
                        text1 : "확인",
                        text2 : "취소"
                    },
                    callback : function(result) {
                        if (result) {
                            newApiList.forEach(function (api, i) {
                                if (api.status == 'RUNNING') {
                                    selectApi(index, api, apiGroup);
                                }
                            });
                        }
                        vm.apiListInit = vm.apiList.filter(function(result){
                            if (result.groupId) {
                                return false;
                            }
                            return true;
                        });
                        vm.apiListInit2 = vm.apiList.filter(function(result){
                            if (result.groupId) {
                                return true;
                            }
                            return false;
                        });
                    }
            }

            vm.newApiList2 = newApiList;
            CommonUtil.modalTwo(param);
        }

        function selectApi(index, api, apiGroup) {
            if (api.currentSelected) return;
            vm.selectedApi = api;
            if (apiGroup) {
                vm.selectedGroupApi = apiGroup.id;
            } else {
                api.currentSelected = true;
//                eraseListInsideApi(api);
            }
            resultApi();
        }



        function resultApi() {
            vm.apiList.unshift({
                api: vm.selectedApi,
                groupId: vm.selectedGroupApi,
                apiPlan: (vm.selectedApi.applicablePlans.length==1)? vm.selectedApi.applicablePlans[0] : null
            });
            vm.showPlan = false;
            vm.selectedApi = [];
            vm.newApiList3 = vm.apiList;
            getSizeChecked2('new', false, vm.groupIds2);
        }

        function groupIds(item){
            if(!item.id){
                return false;
            }
            return true;
        }


        function groupIds2(item){
            if(item.groupId || !item.id){
                return true;
            }
            return false;
        }

        function selectFilter(item){
            return vm.depart == null ? true : (vm.depart.name == item.api.organization.name);
        }

        function selectFilter2(item){
            return vm.depart2 == null ? true : (vm.depart2.name == item.api.organization.name);
        }

        function eraseListInsideApi(api) {
            vm.availableList.splice(vm.availableList.indexOf(api), 1);
        }

        function getSizeChecked (name, alert, filter) {
            switch(name) {
                case 'origin' :
                    vm.orgIdList = vm.apiList.filter(function (o) {
                        if (o.groupId) {
                            return false;
                        }
                        return o.consentTerm;
                    }).map(function (o) {
                        return o.id;
                    });
                    break;
                case 'new' :
                    vm.orgIdList2 = vm.apiList.filter(function (o) {
                        if (o.groupId || !o.id) {
                            return o.consentTerm;
                        }
                        return false;
                    }).map(function (o) {
                        return o.id;
                    });
                    break;
            }
        }

        function getSizeChecked2 (name, alert, filter) {
            switch(name) {
                case 'origin' :
                    vm.orgIdListInit = vm.apiList.filter(function (o) {
                        if (o.groupId || !o.id) {
                            return false;
                        }
                        return o;
                    }).map(function (o) {
                        return o.id;
                    });
                    break;
                case 'new' :
                    vm.orgIdListInit2 = vm.apiList.filter(function (o) {
                        if (o.groupId || !o.id) {
                            return o;
                        }
                        return false;
                    }).map(function (o) {
                        return o.id;
                    });
                    break;
            }
        }

        vm.filteringCheckSize = function (name, results) {
            switch(name) {
                case 'origin' : vm.resultSizeOfOrgs = results.length; vm.isOrgAllChecked = getBooleanAllChecked(results); break;
                case 'new' : vm.resultSizeOfOrgs2 = results.length; vm.isNewAllChecked = getBooleanAllChecked(results); break;
            }
        };

        function getBooleanAllChecked (list) {
            return !list.filter(function(o){
                return !o.consentTerm
            }).length
        }

        //전체 선택 후 사이즈 구하기
        function checkingAllgetSize (name) {
            switch(name) {
                case 'origin' : checkingAll(vm.apiList, vm.isOrgAllChecked, vm.groupIds); getSizeChecked('origin', false, vm.groupIds); break;
                case 'new' : checkingAll(vm.apiList, vm.isNewAllChecked, vm.groupIds2); getSizeChecked('new', false, vm.groupIds2); break;
            }
        }

        //전체 선택 체크박스 클릭 시
        vm.checkingAllCheckBox = function (name) {
            switch(name){
                case 'origin' : checkingAllgetSize('origin'); break;
                case 'new' : checkingAllgetSize('new'); break;
            }


        };

        //각 항목 선택 및 선택해제 시
        vm.checkingOneCheckBox = function (name) {
            switch(name) {
                case 'origin' : vm.isOrgAllChecked = false; getSizeChecked('origin', false, groupIds); break;
                case 'new' : vm.isNewAllChecked = false; getSizeChecked('new', false, groupIds2); break;
            }
        };

        // 전체선택 false
        // function uncheckingAll (list, kind, ref) {
        //     vm.isOrgAllChecked = false; vm.searchOrgText = null;
        //     //if (kind !='api' || ref =='org') {
        //     list.forEach(function(o){
        //         o.consentTerm = false;
        //     });
        //     //}
        // }

        // 전체 선택 true
        function checkingAll (list, status2, filter) {
            list.filter(function(o){
                return filter(o);
            }).forEach(function(o){
                o.consentTerm = status2;
            });
        }

        function removeApi(index, api) {
            vm.apiList.splice(vm.apiList.indexOf(api), 1);
            if (vm.apiUnit) {
                vm.availableList.some(function (v) {
                    if (api.api.id == v.id) v.currentSelected = false;
                    return api.api.id == v.id;
                });
            }
            getSizeChecked('origin', false, vm.groupIds);
            getSizeChecked2('origin', false, vm.groupIds);
            getSizeChecked2('new', false, vm.groupIds2);
        }

        function save() {
            vm.apiList.forEach(function (v) {
                if (!!v.api.termsOfUse) v.api.termsOfUse.attachFileList = null;
                v.api.attachFileList = null;
                v.api.specFile = null;
            });
            vm.appDetail.appApiMappings = vm.apiList;
            vm.appDetail.oAuthCallbackUrl = ''; // 기본 oob 였으나, 신한 환경에서 oob 삭제
            vm.appDetail.oAuthScope == '';
            /*vm.selectedScopes.forEach(function(scope, i){
                vm.appDetail.oAuthScope = (i==0)? scope.scope: vm.appDetail.oAuthScope + ' '+scope.scope;
            });*/

            var status = vm.appDetail.status;
            setWhiteList();
            Apps.update(vm.appDetail, onSuccess, onError);
        }

        function onSuccess() {
            vm.showDetail = false;
            vm.serverIp = [];
            vm.loadAll();
        }

        function onError(error) {
            vm.isOpen = false;
            vm.popOpen = false;
            CommonUtil.onError(error.data.description);
        }

        function requestApproval(app) {
            Apps.search({id: app.id}, function(response) {
                app = response;

                $uibModal.open({
                    templateUrl: 'app/services/common/request-approval.html',
                    controller: 'ReqApprovalController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'md',
                    resolve: {
                        selection: {
                            data: app,
                            type: "app"
                        }
                    }
                }).result.then(function (result) {
                    vm.alerts.push({
                        type: 'success',
                        message: result.description
                    });
                    vm.loadAll();
                });
            });
        }

        function showTermsContent(api) {
            if (api.termsOfUse) {
                Api.getTermsContent({id: api.termsOfUse.id}).$promise.then(function (response) {
                    $uibModal.open({
                        templateUrl: 'app/services/common/terms-modal.html',
                        controller: 'termsModalController',
                        controllerAs: 'vm',
                        backdrop: 'static',
                        size: 'lg',
                        resolve: {
                            item: response
                        }
                    });
                });
            }
        }

        function closeTerm() {
            vm.isTermsOpen = false;
        }

        function closeAlert(index) {
            vm.alerts.splice(index, 1);
        }
    }
})();
