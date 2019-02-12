(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('AdminApiPlanController', AdminApiPlanController);

    AdminApiPlanController.$inject =['Principal', '$scope', '$uibModal','apiPlans', 'AlertService', 'CommonUtil'];

    function AdminApiPlanController(Principal, $scope, $uibModal, apiPlans, AlertService, CommonUtil) {

    	var vm = this;

        vm.loadAll = loadAll;
        vm.authorities = ['ROLE_ADMIN'];
        vm.filter = filter;
        vm.size = 10;
        vm.page = 0;
        vm.sort = 'id,desc';
        vm.sorting = sorting;
        vm.condition = {
            isGlobal: true,
            size: vm.size,
            page: vm.page,
            sort: vm.sort
        };
        vm.pageChanged = pageChanged;

        function sorting(predicate, option){
            vm.condition.sort = CommonUtil.sorting(vm.condition.sort, predicate, option);
            vm.condition.page = 0;
            vm.currentPage = 1;
            loadAll();
        }

        Principal.hasAuthority('ROLE_ADMIN').then(function(result){
            if(result) vm.isAdmin = true;
        });

        vm.loadAll();

        vm.apiplanhelpPopover = {
                templateUrl: 'app/layouts/popover-template/apiplanhelp-popover.html'
        };

        function loadAll(page) {
            if (page >=0) {
                vm.condition.page = page;
                vm.currentPage = page + 1;
            }
            apiPlans.list(vm.condition, function(response, headers){
                vm.globalPlans = response;
                vm.totalItems = headers('x-total-count');
            });
        }

        function pageChanged() {
            vm.condition.page = vm.currentPage - 1;
            loadAll();
        }

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

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }

        /*$scope.checkDefault = function(plan){
            return (flag==0)? plan.sharedDefaultPlan : plan.defaultPlan;
        };

        $scope.setDefault = function(plan){
            plan.defaultPlan = true;
            apiPlans.update(plan).$promise.then(function(response){
                var customfunc = function(result){
                    if(result) vm.loadGlobalPlans();
                }
                CommonUtil.onError("기본정책으로 적용되었습니다.", 'sm', 'modify', customfunc);
            });
        };
*/
        $scope.addPlan = function(isGlobal, plan){
            $uibModal.open({
                templateUrl: 'app/admin/plan/admin-plan-edit-dialog.html',
                controller: 'AdminPlanEditDialogController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'md',
                resolve: {
                    selectPlan:function(){
                        return{
                            data: plan,
                            type:"apiPlan",
                            isGlobal: isGlobal
                        }
                    }
                }
            }).result.then(function (result) {
                if(result=='create') loadAll(0);
                else loadAll();
            });
        };

        $scope.deletePlan = function(plan, type){
            var name = plan.name + " 정책을";
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
                            type:type
                        }
                    }
                }
            }).result.then(function (result) {
                    if(result) apiPlans.delete({id: plan.id}, function() { loadAll(0) }, onError);
                });
        }
    }
})();
