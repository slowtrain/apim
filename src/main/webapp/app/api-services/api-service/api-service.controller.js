(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ApiServiceController', ApiServiceController);

    ApiServiceController.$inject = ['$stateParams', '$scope', '$uibModal', '$uibModalStack', '$state', 'Api', 'ApiGroup', 'CommonUtil', 'Organization'];

    function ApiServiceController($stateParams, $scope, $uibModal, $uibModalStack, $state, Api, ApiGroup, CommonUtil, Organization) {
        var vm = this;
        vm.stateParams = $stateParams;
        vm.loadAllGroups = loadAllGroups;
        vm.showDetailApi = showDetailApi;
        vm.showApis = showApis;
        vm.setGroupView = setGroupView;
        vm.orgFilter = orgFilter;
        vm.showApps = showApps;

        vm.showApiList = showApiList;
        vm.loadAll = loadAll;
        vm.pageChanged = pageChanged;
        vm.condition = {
            orgId: vm.organizationSelected? vm.organizationSelected.id : null,
            apiGroupId: vm.apiGroupSelected? vm.apiGroupSelected.id : null,
            apiName: vm.apiName,
            apiPrivateOption: vm.apiPrivate? vm.apiPrivate : null,
            apiGroupPrivateOption: vm.apiGroupPrivate? vm.apiGroupPrivate : null,
            apiGroupName: vm.apiGroupName,
            proxy: vm.proxyUrl,
            status: 'RUNNING',
            size: vm.stateParams.size,
            page: vm.stateParams.page,
            sort: vm.stateParams.sort
        };
        vm.goToPost = goToPost;
        vm.searching = searching;
        vm.sorting = sorting;
        vm.clear = clear;
        loadOrgs();


        vm.isProvider = $scope.account &&
                                ($scope.account.authorities.indexOf('ROLE_ADMIN') > -1 || $scope.account.role.code.indexOf('OFFER') > -1);

        function initParams() {
            vm.apiGroupSelected = null;
            vm.apiName = null;
            vm.apiGroupName = null;
            vm.apiPrivate = null;
            vm.apiGroupPrivate = null;
            vm.condition.page = 0;
            vm.condition.apiName = null;
            vm.condition.apiGroupId = null;
            vm.condition.apiGroupName = null;
            vm.currentPage = 1;
        }

        function showApps(api) {
            Api.usedAppList({id : api.id}).$promise.then(function(response){
                vm.apps = response;
                $uibModal.open({
                    templateUrl: 'app/api-services/api-service/api-app-list.html',
                    scope: $scope,
                    backdrop: 'static',
                    size: 'md'
                });
            });
        }

        function clear() {
            $uibModalStack.dismissAll();
        }

        function orgFilter(org) {
            return !(org.name =='신한저축은행' || org.name =='신한DS');
        }

        function setGroupView(arg) {
            initParams();
            vm.isGroupView = arg;
            arg? loadAllGroups() : loadAll();
        }

        function sorting(predicate, option){
            vm.condition.sort = CommonUtil.sorting(vm.condition.sort, predicate, option);
            vm.condition.page = 0;
            vm.currentPage = 1;
            vm.isGroupView? loadAllGroups() : loadAll();
        }

        function goToPost(api) {
            Api.getForumsByApi({id: api.id}).$promise.then(function (response) {
                vm.post = response;
                if (vm.post.length > 1) {
                    $uibModal.open({
                        templateUrl: 'app/api-service/api-forum-dialog.html',
                        controller: 'apiForumController',
                        controllerAs: 'vm',
                        backdrop: 'static',
                        size: 'lg',
                        resolve: {
                            api: api
                        }
                    });
                } else if (vm.post.length == 1) {
                    //포럼으로 링크
                    $state.go('post', {forumId: vm.post[0].id});
                }
            });
        }

        function searching () {
            vm.currentPage = 1;
            vm.condition = {
                orgId: vm.organizationSelected.id,
                apiGroupId: vm.apiGroupSelected? vm.apiGroupSelected.id : null,
                apiName: vm.apiName? vm.apiName : null,
                apiPrivateOption: vm.apiPrivate? vm.apiPrivate : null,
                apiGroupPrivateOption: vm.apiGroupPrivate? vm.apiGroupPrivate : null,
                apiGroupName: vm.apiGroupName? vm.apiGroupName : null,
                proxy: vm.proxyUrl,
                status: 'RUNNING',
                size: vm.stateParams.size,
                page: 0,
                sort: vm.condition.sort //sort는 초기화없이 이전 설정이 계속 유지된다.
            };
            if (vm.isGroupView) loadAllGroups();
            else loadAll();
        }

        function loadAll() {
            CommonUtil.underLoading('underLoading', {top:'-2px', left: '200px', width:'83%', height:'86%'}, '230px');
            Api.apisForPartners(vm.condition, function (response, headers) {
                vm.apis = response;
                vm.totalItems = headers('x-total-count');
                CommonUtil.completeLoading();
            });
        }

        function loadAllGroups(page){
            if (page >=0) {
                vm.condition.page = page;
                vm.currentPage = page + 1;
            }
            CommonUtil.underLoading('underLoading', {top:'-2px', left: '200px', width:'83%', height:'86%'}, '230px');
            ApiGroup.listForPartnerPageable(vm.condition, function(response, headers){
                vm.groups = response;
                vm.totalItems = headers('x-total-count');
                CommonUtil.completeLoading();
            });
        }

        function pageChanged() {
            vm.condition.page = vm.currentPage - 1;
            vm.isGroupView? loadAllGroups() : loadAll();
        }

        function loadOrgs() {
            Organization.providers().$promise.then(function (response) {
                arraySorting(response, 'id');
                vm.organizations = response;
                showApiList(vm.organizations[2]);
            });
        }

        function arraySorting(array, cri, reverse) {
            switch(cri){
                case 'id' :
                    array.sort(function (a, b) {
                        if (a.id > b.id) return (reverse)? -1 : 1;
                        if (a.id < b.id) return (reverse)? 1 : -1;
                        return 0;
                    });
                    break;
            }
        }

        function showApiList(organization) {
            vm.organizationSelected = organization;
            initParams();
            if(!vm.isGroupView) vm.apiGroups = ApiGroup.listForPartner({orgId : organization.id});
            searching();
        }

        function onSuccess() {
            loadOrgs();
        }

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }

        function showDetailApi(api) {
            if (!$scope.account) {
                CommonUtil.modalOne("자세한 정보를 보시려면<br/>로그인을 하시기 바랍니다.");
                return;
            }
            $uibModal.open({
                templateUrl: 'app/api-services/api-service/api-view.html',
                controller: 'ApiViewController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    selectedApi: {
                        api: api,
                        forPartner: true
                    }
                }
            }).result.then(function (result) {
                loadAll();
            });
        }

        function showApis(group){
            vm.apiName = null;
            vm.proxyUrl = null;
            vm.apiGroupSelected = group;
            searching();
//            $uibModal.open({
//                templateUrl: 'app/services/common/list-modal.html',
//                controller: 'listModalController',
//                controllerAs: 'vm',
//                backdrop: 'static',
//                size: 'md',
//                resolve: {
//                    items:function(){
//                        return{
//                            data:apis,
//                            title:'apiList'
//                        }
//                    }
//                }
//            });
        }
    }
})();
