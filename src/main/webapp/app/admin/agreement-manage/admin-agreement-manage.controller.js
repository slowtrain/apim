(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('AgreeManagementController', AgreeManagementController);

    AgreeManagementController.$inject = ['$stateParams', '$scope', '$uibModal', 'AgreeManagement', 'CommonUtil'];

    function AgreeManagementController($stateParams, $scope, $uibModal, AgreeManagement, CommonUtil) {

        var vm = this;
        vm.stateParams = $stateParams;
        vm.sorting = sorting;

        vm.loadAll = loadAll;
        vm.loadAll();
        vm.delAgree = delAgree;
        vm.addAgree = addAgree;
        vm.editAgree = editAgree;
        vm.pageChanged = pageChanged;
        vm.readOnlyToggle = readOnlyToggle;
        vm.save = save;
        vm.clear = clear;
        vm.showAgreeBody = showAgreeBody;
        vm.readOnly = true;
        vm.setForAgree = setForAgree;

        vm.termPopover = {
            templateUrl: 'app/layouts/popover-template/content-popover.html'
        };

        var sort = [];

        function sorting(predicate, option) {
            vm.stateParams.sort = CommonUtil.sorting(sort, predicate, option);
            loadAll();
        }

        function readOnlyToggle() {
            vm.readOnly = false;
        }

        function loadList() {
            vm.showDiv = false;
            AgreeManagement.list({size: vm.stateParams.size, page: vm.stateParams.page, sort: vm.stateParams.sort}, function (response, headers) {
                vm.agreeList = response;
                vm.totalItems = headers('x-total-count');
            });
        }

        function loadAll() {
            loadList();
            vm.currentPage = eval(vm.stateParams.page) + 1;
        }

        function pageChanged() {
            vm.stateParams.page = vm.currentPage - 1;
            loadList();
        };

        function addAgree() {
            vm.readOnly = false;
            vm.showDiv = true;
            vm.mode = 'register';
            vm.agree = {};
        }

        function editAgree(agree, mode) {
            vm.showDiv = true;
            vm.mode = mode;
            vm.readOnly = (mode == "view") ? true : false;
            vm.agree = agree;
            vm.original = angular.copy(agree);
        }

        //현재 삭제권한은 admin에게만 있다. 아직 이 제한 사항을 코드에 반영 안 했음.
        function delAgree(agree) {
            var title = agree.title + " 동의서를";
            if (agree.useYn == 'Y') {
                title = "현재 사용중인 동의서입니다.";
            }
            $uibModal.open({
                templateUrl: 'app/services/common/modal.html',
                controller: 'modalController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'sm',
                resolve: {
                    items: function () {
                        return {
                            data: title,
                            type: 'delete'
                        }
                    }
                }
            }).result.then(function (result) {
                if (result) AgreeManagement.delAgree({id: agree.id}, onSuccess);
            });
        }

        function setForAgree(agree) {
            AgreeManagement.setUse({id: agree.id}).$promise.then(function (response) {
                loadList();
            });
        }

        function onSuccess() {
            vm.loadAll();
        }

        function clear() {
            vm.agree = (vm.mode == 'register') ? {} : angular.copy(vm.original); //2-way binding 막기위해서.
        }

        function showAgreeBody(agree) {
            agree.content = agree.body;
            agree.noFile = true;
            $uibModal.open({
                templateUrl: 'app/services/common/terms-modal.html',
                controller: 'termsModalController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    item: {
                        agree : agree,
                        type : 'agree'
                    }
                }
            }).result.then(function (result) {
            });
        }

        function save() {
            if (vm.mode == 'register') AgreeManagement.addAgree(vm.agree, onSuccess);
            else AgreeManagement.editAgree({id: vm.agree.id}, vm.agree, onSuccess);
        }
    }
})();
