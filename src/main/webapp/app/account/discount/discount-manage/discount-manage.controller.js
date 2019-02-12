(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('DiscountManageController', DiscountManageController);

    DiscountManageController.$inject =['CommonUtil', 'Discount', '$uibModal', 'Principal'];

    function DiscountManageController(CommonUtil, Discount, $uibModal, Principal) {

    	var vm = this;
        vm.authorities = ['ROLE_PLAN_VIEW'];
        vm.user = Principal.identity();

        vm.editPolicy = editPolicy;
        vm.delPolicy = delPolicy;
        vm.pageChanged = pageChanged;
        vm.size = 10;
        vm.page = 0;
        vm.sort = 'id,desc';
        vm.loadAll = loadAll;
        vm.sorting = sorting;
        vm.condition = {
            orgId:vm.user.$$state.value.organization.id,
            size: vm.size,
            page: vm.page,
            sort: vm.sort
        };
        vm.loadAll();

        function sorting(predicate, option){
            vm.condition.sort = CommonUtil.sorting(vm.condition.sort, predicate, option);
            vm.condition.page = 0;
            vm.currentPage = 1;
            loadAll();
        }

        function loadAll(page) {
            if (page >=0) {
                vm.condition.page = page;
                vm.currentPage = page + 1;
            }
            Discount.list(vm.condition, function(response, headers){
                vm.discountPolicies = response;
                vm.totalItems = headers('x-total-count');
            });
        }

        function pageChanged() {
            vm.condition.page = vm.currentPage - 1;
            loadAll();
        }

        function editPolicy(discountPolicy){
            $uibModal.open({
                templateUrl: 'app/account/discount/discount-manage/discount-edit-dialog.html',
                controller: 'DiscountEditDialogController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'sm',
                resolve: {
                    selections: discountPolicy
                }
            }).result.then(function(result){
                    if(result.type == 'save'){
                        Discount.create({orgId:vm.user.$$state.value.organization.id}, result, function() { loadAll(0) }, onError);
                    }else{
                        Discount.update({orgId:vm.user.$$state.value.organization.id, policyId:discountPolicy.id}, result, loadAll, onError);
                    }
                });
        }
        function delPolicy(discountPolicy, type){
            var name = discountPolicy.name + " 할인정책을";
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
                    if(result) Discount.delete({orgId:vm.user.$$state.value.organization.id, policyId:discountPolicy.id}, function() { loadAll(0) }, onError);
                });
        }

        function onSuccess () {
            vm.loadAll();
        }

        function onError (error) {
            CommonUtil.onError(error.data.description);
        }
    }
})();
