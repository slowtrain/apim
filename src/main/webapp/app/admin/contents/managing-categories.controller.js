(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ManagingCategoriesController', ManagingCategoriesController);

    ManagingCategoriesController.$inject = ['CommonConstants', '$scope', 'ContentsManagement', 'CommonUtil'];

    function ManagingCategoriesController(CommonConstants, $scope, ContentsManagement, CommonUtil) {
        var vm = this;
        vm.addCategories = addCategories;
        vm.editCategories = editCategories;
        vm.delCategories = delCategories;
        vm.serviceCategoryTitles = CommonConstants.serviceCategoryTitles;
        vm.input = [];
        vm.inputDisabled = [];

        loadAll();
        function loadAll() {
            ContentsManagement.listCategories().$promise.then(function(response){
                vm.allCategories = response;
            });
        }

        function checkDuplicate(arg, mode) {
            var isDuplicate = false;
            var array = [];
            switch(arg) {
                case '1' :
                    if (mode && mode=='edit') {
                        $scope.result1.some(function(c){
                            array.some(function(a){
                                isDuplicate = (a.name == c.name);
                                return isDuplicate;
                            });
                            if (!isDuplicate) array.push(c);
                            return isDuplicate;
                        });
                    } else {
                        $scope.result1.some(function(c){
                            if (c.name == vm.input[arg-1]) isDuplicate = true;
                            return c.name == vm.input[arg-1];
                        });
                    }
                    break;
                case '2' :
                    if (mode && mode=='edit') {
                        $scope.result2.some(function(c){
                            array.some(function(a){
                                isDuplicate = (a.name == c.name);
                                return isDuplicate;
                            });
                            if (!isDuplicate) array.push(c);
                            return isDuplicate;
                        });
                    } else {
                        $scope.result2.some(function(c){
                            if (c.name == vm.input[arg-1]) isDuplicate = true;
                            return c.name == vm.input[arg-1];
                        });
                    }
                    break;
                case '3' :
                    if (mode && mode=='edit') {
                        $scope.result3.some(function(c){
                            array.some(function(a){
                                isDuplicate = (a.name == c.name);
                                return isDuplicate;
                            });
                            if (!isDuplicate) array.push(c);
                            return isDuplicate;
                        });
                    } else {
                        $scope.result3.some(function(c){
                            if (c.name == vm.input[arg-1]) isDuplicate = true;
                            return c.name == vm.input[arg-1];
                        });
                    }
                    break;
            }
            if (isDuplicate) {
                CommonUtil.onError("동일 카테고리에 같은 이름이 존재합니다.");
                return true;
            } else return false;
        }

        function addCategories(arg) {
            if (!checkDuplicate(arg))
                ContentsManagement.addCategories({name: vm.input[arg-1], classifyNumber: arg}, function(){ onSuccess(arg) }, onError);
        }

        function editCategories(arg, mode) {
            if (mode=='cancel') {
                loadAll();
                vm.inputDisabled[arg-1]= false;
            }
            else if (mode=='save') {
                if (!checkDuplicate(arg, 'edit'))
                    ContentsManagement.editCategories(arg=='1'? $scope.result1 : arg=='2'? $scope.result2 : $scope.result3, function(){ onSuccess(arg) }, onError);
            } else vm.inputDisabled[arg-1]= true;
        }

        function delCategories(category) {
            ContentsManagement.delCategories({id: category.id}, loadAll, onError);
        }

        function onSuccess(arg) {
            vm.input[arg-1]='';
            vm.inputDisabled[arg-1]=false;
            loadAll();
        }

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }
    }
})();
