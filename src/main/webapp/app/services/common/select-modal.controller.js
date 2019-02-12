(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('selectModalController', selectModalController);

    selectModalController.$inject = ['$uibModalInstance', 'items', 'Principal', 'ApprovalLine', 'Api', 'CommonUtil'];

    function selectModalController($uibModalInstance, items, Principal, ApprovalLine, Api, CommonUtil) {
        var vm = this;
        vm.clear = clear;
        vm.confirm = confirm;
        vm.targetList = [];
        vm.viewType = items.type;
        vm.items = items;
        vm.currentAccount = Principal.identity().$$state.value;

        if (items.data) {
            vm.itemName = items.data.name;
            if (items.category == 'apiGroup') {
                vm.targetList = angular.copy(items.data.apis);
                vm.itemDescription = items.data.description;
            } else if (items.category == 'approvalLine' || items.category == 'request') {
                if (items.data.length > 0 || items.data.users) {
                    if (items.data.users) {
                        angular.copy(items.data.users, vm.targetList);
                    } else {
                        angular.copy(items.data, vm.targetList);
                    }
                    vm.targetList.forEach(function (api) {
                        api.name = api.fullName;
                    });
                }
            }
        }

        vm.clicklineValue = clicklineValue;
        vm.removeMember = removeMember;
        vm.userLoad = userLoad;
        vm.userLoad();

        function userLoad() {
            if (items.category == 'apiGroup') {
                Api.listApproved(function (response) {
                    vm.sourceList = response;
                    if (vm.targetList) sourceDataRemove();
                });
            } else if (items.category == 'orgAddUsers') {
                vm.sourceList = angular.copy(items.data.availableUsers);
                vm.sourceList.filter(function(user){
                    return user.state = 'ACTIVE';
                }).forEach(function (user) {
                    user.name = user.fullName;
                });
            } else {
                ApprovalLine.findUsers({state: 'ACTIVE'}, function (response) {
                    vm.sourceList = response.filter(function (user) {
                        user.name = user.fullName;
                        return true;
                    });
                    if (vm.targetList) sourceDataRemove();
                }, function (error) {
                    if (error.status == 403) {
                        CommonUtil.onError("사용자 보기 권한이 없습니다.");
                    } else {
                        CommonUtil.onError(error.data.description);
                    }
                });
            }
        }

        function sourceDataRemove() {
            vm.targetList.forEach(function (v, i) {
                vm.sourceList = vm.sourceList.filter(function (el) {
                    return v.id != el.id;
                });
            });
        }

        vm.selectUserList = function (e, index, user) {
            vm.targetList.push(user);
            vm.sourceList.splice(index, 1);
        };

        function clicklineValue(e, index) {
            vm.selectedlineValue = [];
            vm.selectedlineValue.push(index);
        }

        function removeMember(index, user) {
            vm.targetList.splice(index, 1);
            vm.sourceList.push(user);
        }

        function clear() {
            if (items.category == 'orgAddUsers') $uibModalInstance.close('cancel');
            $uibModalInstance.dismiss();
        }

        function confirm() {
            var itemList = {};
            itemList.name = vm.itemName;
            if (items.category == 'apiGroup') {
                if (vm.targetList) {
                    itemList.apis = [];
                    vm.targetList.forEach(function (list) {
                        itemList.apis.push({id: list.id});
                    });
                }
                itemList.description = vm.itemDescription;
                if (items.data) {
                    itemList.call = 'update';
                    itemList.id = items.data.id;
                } else {
                    itemList.call = 'create';
                }
            } else if (items.category == 'orgAddUsers') {
                itemList.orgUsers = vm.targetList;
            } else {
                itemList.users = [];
                angular.copy(vm.targetList, itemList.users);
                if (items.data) {
                    itemList.id = items.data.id;
                    itemList.call = 'update';
                } else {
                    itemList.call = 'create';
                }
            }
            $uibModalInstance.close(itemList);
        }

////////approval drag&drop ui
        vm.sortableOptions = {
            placeholder: "app-ph",
            connectWith: ".apps-container"
        };
    }
})();
