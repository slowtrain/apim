(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ApiGroupEditController', ApiGroupEditController);

    ApiGroupEditController.$inject = ['$scope', '$uibModalInstance', 'selectedGroup', 'Principal', 'ApprovalLine', 'Api', 'CommonUtil'];

    function ApiGroupEditController($scope, $uibModalInstance, selectedGroup, Principal, ApprovalLine, Api, CommonUtil) {
        var vm = this;
        vm.clear = clear;
        vm.confirm = confirm;
        vm.apiFilter = apiFilter;
        vm.targetList = [];
        vm.currentAccount = Principal.identity().$$state.value;
        vm.selectedGroup = selectedGroup;
        vm.selectApiList = selectApiList;
        vm.searchAllRange = searchAllRange;
        vm.setSearchPrivate = setSearchPrivate;
        vm.group = {}; //apiFilter를 위해서 미리 초기화한다.

        if (selectedGroup) {
            vm.group = angular.copy(selectedGroup);
            vm.targetList = vm.group.apis;
        }

        vm.clicklineValue = clicklineValue;
        vm.removeMember = removeMember;
        vm.apiLoad = apiLoad;
        angular.element(document).ready(function() {
            vm.apiLoad();
        });
        //vm.apiLoad();

        function apiFilter(api) {
            return vm.group.isPrivate? api.isPrivate : true;
        }

        function setSearchPrivate () {
            if (vm.group.isPrivate) {
                vm.searchAvailableApis = {isPrivate : true};
                vm.searchGroupApis = {isPrivate : true};
                vm.targetList.forEach(function(target){
                    if (!target.isPrivate) removeMember(target);
                });
            } else {
                vm.searchAvailableApis = {};
                vm.searchGroupApis = {};
            }
        }

        function searchAllRange () {
            if (vm.searchAvailableApis && vm.searchAvailableApis.isPrivate == null) delete vm.searchAvailableApis['isPrivate'];
            if (vm.searchGroupApis && vm.searchGroupApis.isPrivate == null) delete vm.searchGroupApis['isPrivate'];
        }

        function apiLoad() {
            CommonUtil.underLoading('underLoading', {top:'0px', left:'11px', width:'97.1%', height:'99%'});
            Api.listApproved(function (response) {
                vm.sourceList = response;
                if (vm.targetList) sourceDataRemove();
                CommonUtil.completeLoading();
            });
        }

        function sourceDataRemove() {
            vm.targetList.forEach(function (v, i) {
                vm.sourceList = vm.sourceList.filter(function (el) {
                    return v.id != el.id;
                });
            });
        }

        function selectApiList (e, api) {
            vm.targetList.push(api);
            vm.sourceList.splice(vm.sourceList.indexOf(api), 1);
        };

        function clicklineValue(e, api) {
            vm.selectedlineValue = [];
            vm.selectedlineValue.push(vm.selectedlinValue.indexOf(api));
        }

        function removeMember(api) {
            vm.targetList.splice(vm.targetList.indexOf(api), 1);
            vm.sourceList.push(api);
        }

        function clear() {
            $uibModalInstance.dismiss();
        }

        function confirm() {
            vm.group.apis = [];
            vm.targetList.forEach(function (target) {
                vm.group.apis.push({id: target.id});
            });
            if (selectedGroup) {
                vm.group.call = 'update';
            } else {
                vm.group.call = 'create';
            }
            $uibModalInstance.close(vm.group);
        }

////////approval drag&drop ui
        vm.sortableOptions = {
            placeholder: "app-ph",
            connectWith: ".apps-container"
        };
    }
})();
