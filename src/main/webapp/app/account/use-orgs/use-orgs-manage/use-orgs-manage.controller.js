(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('UseOrgsManageController', UseOrgsManageController);

    UseOrgsManageController.$inject =['CommonUtil', 'UseOrgs', 'Discount', '$uibModal', 'Principal'];

    function UseOrgsManageController(CommonUtil, UseOrgs, Discount, $uibModal, Principal) {

        var vm = this;
        vm.authorities = ['ROLE_PLAN_VIEW'];
        vm.user = Principal.identity();

        vm.checkPolicy = checkPolicy;
        vm.editPolicy = editPolicy;
        vm.showApps = showApps;
        vm.showComment = showComment;
        vm.popUp = popUp;
        vm.pageChanged = pageChanged;
        vm.size = 10;
        vm.page = 0;
        vm.sort = 'id,desc';
        vm.save = save;
        vm.clear = clear;
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

        function loadAll(){
            vm.readOnly = true;
            UseOrgs.list(vm.condition, function(response, headers){
                vm.useOrgs = response;
                vm.totalItems = headers('x-total-count');
                vm.useOrgs.forEach(function(useOrg){
                    useOrg.readOnly = true;
                });
                vm.discountPolicies = Discount.list({orgId:vm.user.$$state.value.organization.id, sort:'id,desc'});
            });

        }

        function pageChanged() {
            vm.condition.page = vm.currentPage - 1;
            loadAll();
        };

        var originalPolicy = {};
        function checkPolicy(discountPolicy){
            return (discountPolicy)? discountPolicy.name : "없음";
        }

        function showApps(useOrg){
            UseOrgs.findApps({orgId:vm.user.$$state.value.organization.id, useorgId:useOrg.organization.id}).$promise.then(function(response){
                vm.apps = response;
                var selections = {apps: vm.apps, useOrg: useOrg};
                popUp(selections, 'lg');
            });
        }

        function showComment(useOrg){
            var selections = {useOrg: useOrg, orgId: vm.user.$$state.value.organization.id};
            popUp(selections, 'lg');
        }

        function popUp(selections, size){
            $uibModal.open({
                templateUrl: 'app/account/use-orgs/use-orgs-manage/use-orgs-popup.html',
                controller: 'UseOrgsPopupController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: size,
                resolve: {
                    selections: selections
                }
            });
        }

        function clear(useOrg){
            useOrg.discountPolicy = originalPolicy;
            useOrg.readOnly = true;
        }

        function save(useOrg){
            var policyId = (useOrg.discountPolicy)? useOrg.discountPolicy.id : 0;
            UseOrgs.update({
                orgId: vm.user.$$state.value.organization.id,
                useorgId: useOrg.organization.id,
                policyId: policyId
                }, onSuccess, onError);
        }

        function editPolicy(useOrg){
            useOrg.readOnly = false;
            originalPolicy = useOrg.discountPolicy;
        }

        function onSuccess () {
            vm.loadAll();
        }

        function onError (error) {
            CommonUtil.onError(error.data.description);
        }
    }
})();
