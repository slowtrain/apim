(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ContentsPriorityController', ContentsPriorityController);

    ContentsPriorityController.$inject = ['$q', '$scope', '$uibModalInstance', 'items', 'CommonUtil'];

    function ContentsPriorityController($q, $scope, $uibModalInstance, items, CommonUtil) {
        var vm = this;
        vm.clear = clear;
        vm.confirm = confirm;

        if (items) {
            vm.showList = items.data.filter(function(d) {
                return d.showYn == 'Y';
            });
            vm.useList = angular.copy(items.data);
            arraySorting(vm.showList, 'showPriority');
            arraySorting(vm.useList, 'usePriority');
        }

        function arraySorting(array, cri, reverse) {
            switch(cri){
                case 'usePriority' :
                    array.sort(function (a, b) {
                        if (a.usePriority > b.usePriority) return (reverse)? -1 : 1;
                        if (a.usePriority < b.usePriority) return (reverse)? 1 : -1;
                        if (a.title > b.title) return 1;
                        if (a.title < b.title) return -1;
                        return 0;
                    });
                    break;
                case 'showPriority' :
                    array.sort(function (a, b) {
                        if (a.showPriority > b.showPriority) return (reverse)? -1 : 1;
                        if (a.showPriority < b.showPriority) return (reverse)? 1 : -1;
                        if (a.title > b.title) return 1;
                        if (a.title < b.title) return -1;
                        return 0;
                    });
                    break;
            }
        }

        function clear() {
            $uibModalInstance.dismiss();
        }

        function confirm() {
            vm.finalList = [];
            var deferred = $q.defer();
            deferred.promise.then(function() {
                vm.showList.forEach(function(d, i){
                    // showPriority가 DB에서 String 타입으로 되어 있다.
                    // 따라서 angular의 orderBy함수가 1다음에 10, 11, 2 순으로 나열하는 것을 방지하기 위해 세자리 숫자로 입력한다.
                    d.showPriority = d3.format('03')(i+1);
                });
            }).then(function() {
                vm.useList.forEach(function(use, i){
                    vm.showList.some(function(show){
                        if (show.id == use.id) use.showPriority = show.showPriority;
                        return show.id == use.id;
                    });
                    // usePriority가 DB에서 String 타입으로 되어 있다.
                    // 따라서 angular의 orderBy함수가 1다음에 10, 11, 2 순으로 나열하는 것을 방지하기 위해 세자리 숫자로 입력한다.
                    use.usePriority = d3.format('03')(i+1);
                    vm.finalList.push({id: use.id, usePriority: use.usePriority, showPriority: use.showPriority});
                });
            }).then(function() {
                $uibModalInstance.close(vm.finalList);
            });
            deferred.resolve();
        }

////////approval drag&drop ui
        vm.sortableOptions = {
            placeholder: "app-ph",
            connectWith: ".apps-container"
        };
    }
})();
