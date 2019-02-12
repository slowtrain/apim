(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ApprovalLineController', ApprovalLineController);

    ApprovalLineController.$inject =['$stateParams', '$uibModal', 'ApprovalLine', 'Principal', 'CommonUtil'];

    function ApprovalLineController($stateParams, $uibModal, ApprovalLine, Principal, CommonUtil) {

    	var vm = this;
    	vm.stateParams = $stateParams;
        vm.addApprovalLine = addApprovalLine;
        vm.setForApp = setForApp;
		vm.pageChanged = pageChanged;
        vm.authorities = ['ROLE_APPROVAL_VIEW'];
        vm.sorting = sorting;
        vm.loadAll = loadAll;
        vm.condition = {
            size: vm.stateParams.size,
            page: vm.stateParams.page,
            sort: vm.stateParams.sort
        };
        vm.loadAll();
        vm.flag = false;

        Principal.hasAuthority('ROLE_API_CREATE').then(function(result) {
            vm.flag=true;
        });

        function sorting(predicate, option){
            vm.condition.sort = CommonUtil.sorting(vm.condition.sort, predicate, option);
            vm.condition.page = 0;
            vm.currentPage = 1;
            loadAll();
        }

        function pageChanged() {
            vm.condition.page = vm.currentPage - 1;
            loadAll();
        }

        function setForApp(line){
        	ApprovalLine.forapp({id:line.id}).$promise.then(function(response){
        		loadAll();
    		});
        }

        function loadAll(page){
            if (page >=0) {
                vm.condition.page = page;
                vm.currentPage = page + 1;
            }
        	ApprovalLine.list(vm.condition, function(response, headers){
                vm.clickedlineList = response;
                vm.totalItems = headers('x-total-count');
            });
        }
        function addApprovalLine(line, type){
            $uibModal.open({
                templateUrl: 'app/services/common/select-modal.html',
                controller: 'selectModalController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    items:function(){
                        return{
                            data: line,
                            type: type,
                            category:'approvalLine'
                        }
                    }
                }
            }).result.then(function (result) {
                    if(result.call == 'create'){
                        ApprovalLine.create(result, function() { loadAll(0) }, onError);
                    }else{
                        ApprovalLine.update(result, loadAll, onError);
                    }
                })
        }

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }

        vm.removeLine=function(line, type){
            var name = line.name+' 라인을';
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
                    if(result)ApprovalLine.delete(line,
                        function () {
                            loadAll(0);
                        });

                });
        };
    }
})();
