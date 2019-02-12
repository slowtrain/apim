(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('billingManageController', billingManageController);

    billingManageController.$inject =['$uibModalStack', '$scope', 'CommonUtil', 'Billing', '$uibModal', 'Principal'];

    function billingManageController($uibModalStack, $scope, CommonUtil, Billing, $uibModal, Principal) {

        var vm = this;
        vm.user = Principal.identity();

        vm.addBilling = addBilling;
        vm.delBilling = delBilling;
        vm.showBilling = showBilling;
        vm.clearTopModal = clearTopModal;
        vm.pageChanged = pageChanged;
        vm.size = 10;
        vm.page = 0;
        vm.sort = 'id,desc';
        vm.sorting = sorting;
        vm.condition = {
            id:vm.user.$$state.value.organization.id,
            size: vm.size,
            page: vm.page,
            sort: vm.sort
        };
        vm.loadAll = loadAll;
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
            Billing.list(vm.condition, function(response, headers){
                vm.Billings = response;
                vm.totalItems = headers('x-total-count');
            });
        }

        function clearTopModal() {
            $uibModalStack.dismiss($uibModalStack.getTop().key);
        }

        function pageChanged() {
            vm.condition.page = vm.currentPage - 1;
            loadAll();
        }

        function showBilling(billing){
            vm.api = {billingPolicy : billing};
            $uibModal.open({
                templateUrl: 'app/services/common/billing-policy.html',
                scope: $scope,
                backdrop: 'static',
                size: 'md'
            });
        }

        function addBilling(billing){
            $uibModal.open({
                templateUrl: 'app/account/billing/billing-manage/billing-edit-dialog.html',
                controller: 'BillingEditDialogController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'md',
                resolve: {
                    selections: billing
                }
            }).result.then(function(result){
                    if(result.type == 'save'){
                        Billing.create({id:vm.user.$$state.value.organization.id}, result, function() { loadAll(0) }, onError);
                    }else{
                        Billing.update({orgId:vm.user.$$state.value.organization.id, id:billing.id}, result, onSuccess, onError);
                    }
                });
        }
        function delBilling(billing, type){
            var name = billing.name + " 과금정책을";
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
                if(result) Billing.delete({orgId:vm.user.$$state.value.organization.id, id:billing.id}, function() { loadAll(0) }, onError);
            });
        }

        function onSuccess () {
            vm.loadAll();
        }

        function onError (error) {
            CommonUtil.onError(error.data.description)
        }
    }
})();
