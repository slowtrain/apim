(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('selectApprovalLineModalController', selectApprovalLineModalController);

    selectApprovalLineModalController.$inject = ['$uibModalInstance', 'items', 'ApprovalLine'];

    function selectApprovalLineModalController($uibModalInstance, items, ApprovalLine) {
        var vm = this;
        vm.clear = clear;
        vm.confirm = confirm;
        vm.clickedlineList = [];
        vm.viewType = items.type;

        if (items.data){
            vm.clickedlineList = items.data.users;
            vm.selectLine = items.data.name;
        }

        
        ApprovalLine.list().$promise.then(function (response) {
            vm.lineList = response;
            
            // vm.resetList = angular.copy(vm.lineList);
            // vm.clickedlineList = [];
            // vm.availableList = [];
        });


        vm.selectUserList = selectUserList;
        vm.clicklineValue = clicklineValue;
        vm.removeMember = removeMember;
        vm.userLoad = userLoad;
        vm.userLoad();

        function userLoad() {
            ApprovalLine.findUsers(function (response) {
                response = response.map(function (d) {
                    return {
                        id: d.id,
                        firstName: d.firstName,
                        lastName: d.lastName,
                        login: d.login,
                        column: "a"
                    };
                });
                vm.availableList = response;

                if (vm.clickedlineList) {
                    vm.clickedlineList.forEach(function (v, i) {
                        vm.availableList = vm.availableList.filter(function (el) {
                            return v.id != el.id;
                        });
                    });
                }
            });
        }

        function selectUserList(e, index, user) {
            user.column = "b";
            vm.clickedlineList.push(user);
            vm.availableList.splice(index, 1);
        }

        function clicklineValue(e, index) {
            vm.selectedlineValue = [];
            vm.selectedlineValue.push(index);
        }

        function removeMember(index, user) {
            vm.clickedlineList.splice(index, 1);
            vm.availableList.push(user);
            user.column = "a";
        }

        function clear() {
            $uibModalInstance.dismiss('cancel');
        }

        vm.selectApprovalLine = function (line) {
            $uibModalInstance.close(line.users);
        };

        function confirm() {
            var approvaline = {};
            approvaline.name = vm.selectLine;
            approvaline.users = vm.clickedlineList;
            approvaline.id = items.data.id;

            if (items.data) {
                if(items.type){
                    $uibModalInstance.close(approvaline);
                }else{
                    ApprovalLine.update(approvaline, onSuccess);
                }
            } else {
                if(items.type){
                    $uibModalInstance.close(approvaline);
                }else{
                    ApprovalLine.create(approvaline, onSuccess);
                }
            }
        }

        function onSuccess (result) {
            $uibModalInstance.close(result);
        }

////////approval drag&drop ui
        vm.sortableOptions = {
            placeholder: "app-ph",
            connectWith: ".apps-container",
            start: function (event, ui) {

            },
            beforeStop: function (event, ui) {
                var movedApp = findAppById(vm.availableList, ui.helper[0].id);
                if (movedApp) {

                    var newColumn = ui.helper.parent()[0].getAttribute('app-column');
                    if (movedApp.column !== newColumn) {
                        movedApp.column = newColumn;
                    }
                }
            }
        };

        function findAppById(appList, id) {
            var app = $.grep(appList, function (e) {
                return e.id == id
            })[1];
            if (app && app !== undefined)
                return app;
            else
                return null;
        }
    }
})();
