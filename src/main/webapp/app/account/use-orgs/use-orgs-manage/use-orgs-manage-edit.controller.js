(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('UseOrgsManageEditController', UseOrgsManageEditController);

    UseOrgsManageEditController.$inject =['selections', 'CommonUtil', 'UseOrgs', 'Discount', '$uibModalInstance', 'Principal'];

    function UseOrgsManageEditController(selections, CommonUtil, UseOrgs, Discount, $uibModalInstance, Principal) {

        var vm = this;
        vm.authorities = ['ROLE_PLAN_VIEW'];
        vm.user = Principal.identity();
        vm.save = save;
        vm.clear = clear;
        vm.findApisByUserOrganization = findApisByUserOrganization;
        vm.flag = false;
        loadUseOrgs();

        if (selections) {
            vm.selectedDiscountPolicy = {id : selections.discountPolicy.id};
            vm.selectedOrganization = {id : selections.user.id};
            findApisByUserOrganization(vm.selectedOrganization);
            vm.selectedApi = {id : selections.api.id};
            vm.flag = true;
        }

        function loadUseOrgs() {
            UseOrgs.findOrgs({orgId:vm.user.$$state.value.organization.id}).$promise.then(function(response){
                vm.useOrgs = response;
                loadDiscountPolicies();
            });
        }

        function findApisByUserOrganization(user){
            if (user) {
                CommonUtil.underLoading('applyingDiscountPolicy', '0px');
                UseOrgs.findApis({orgId:vm.user.$$state.value.organization.id, userId:user.id, editMode:!!selections}).$promise.then(function(response){
                    vm.useApis = response;
                    CommonUtil.completeLoading();
                });
            }else vm.useApis = [];
        }

        function loadDiscountPolicies(){
            vm.discountPolicies = Discount.list({orgId:vm.user.$$state.value.organization.id, sort:'id,desc'});
        }

        function clear(){
            $uibModalInstance.dismiss();
        }

        function save(){
            var useOrg = {
                    discountPolicy : {id : vm.selectedDiscountPolicy.id},
                    user : {id : vm.selectedOrganization},
                    api : {id : vm.selectedApi},
                    provider : {id : vm.user.$$state.value.organization}
            };
            if (selections) UseOrgs.update({orgId: vm.user.$$state.value.organization.id, mappingId: selections.id}, useOrg, onSuccess, onError);
            else UseOrgs.create({orgId: vm.user.$$state.value.organization.id}, useOrg, onSuccess, onError);
        }

        function onSuccess () {
            $uibModalInstance.close(true);
        }

        function onError (error) {
            CommonUtil.onError(error.data.description);
        }
    }
})();
