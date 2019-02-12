(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ApiGroupController', ApiGroupController);
    ApiGroupController.$inject =['$stateParams', 'ApiGroup', '$uibModal', 'CommonUtil'];

    function ApiGroupController($stateParams, ApiGroup, $uibModal, CommonUtil) {

        var vm = this;
        vm.stateParams = $stateParams;
        vm.authorities = ['ROLE_API_CREATE', 'ROLE_ADMIN'];
        vm.addGroup = addGroup;
        vm.delGroup = delGroup;
        vm.showDetailApi = showDetailApi;
        vm.loadAll = loadAll;
        vm.pageChanged = pageChanged;
        vm.searching = searching;
        vm.sorting = sorting;
        vm.condition = {
            size: vm.stateParams.size,
            page: vm.stateParams.page,
            sort: vm.stateParams.sort
        };

        vm.loadAll();

        function searching () {
            vm.currentPage = 1;
            vm.condition = {
                apiGroupName: vm.apiGroupName,
                apiGroupPrivateOption: vm.apiGroupPrivate? vm.apiGroupPrivate : null,
                apiName: vm.apiName,
                size: vm.stateParams.size,
                page: 0,
                sort: vm.condition.sort //sort는 초기화없이 이전 설정이 계속 유지된다.
            };
            loadAll();
        }

        function showDetailApi(api) {
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

        function sorting(predicate, option){
            vm.condition.sort = CommonUtil.sorting(vm.condition.sort, predicate, option);
            vm.condition.page = 0;
            vm.currentPage = 1;
            loadAll();
        }

        function loadAll(page){
            if (page >=0) {
                vm.condition.page = page;
                vm.currentPage = page + 1;
            }
            ApiGroup.list(vm.condition, function(response, headers){
                vm.groups = response;
                vm.totalItems = headers('x-total-count');
            });
        }


        function onError(error) {
            CommonUtil.onError(error.data.description);
        }

        function pageChanged() {
            vm.condition.page = vm.currentPage - 1;
            loadAll();
        }

        function addGroup(group){
            $uibModal.open({
                templateUrl: 'app/account/api/api-group/api-group-edit.html',
                controller: 'ApiGroupEditController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    selectedGroup : group
                }
            }).result.then(function (result) {
                if(result.call == 'update'){
                    ApiGroup.update({id: result.id}, result, loadAll, onError);
                }else if(result == 'cancel'){
                    loadAll();
                }else{
                    ApiGroup.create(result, function() { loadAll(0) }, onError);
                }
            });
        }

        function delGroup(group){
            var name = group.name + " API 그룹을";
            $uibModal.open({
                templateUrl: 'app/services/common/modal.html',
                controller: 'modalController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'sm',
                resolve: {
                    items:function(){
                        return{
                            data:name,
                            type:'delete'
                        }
                    }
                }
            }).result.then(function (result) {
                    if(result) ApiGroup.delete({id: group.id}, function() { loadAll(0) }, onError);
                });
        }

        function viewApi(apis){
            $uibModal.open({
                templateUrl: 'app/services/common/list-modal.html',
                controller: 'listModalController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'md',
                resolve: {
                    items:function(){
                        return{
                            data:apis,
                            title:'apiList'
                        }
                    }
                }
            });
        }
    }
})();
