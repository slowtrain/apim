(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('planEditDialogController', planEditDialogController);

    planEditDialogController.$inject =['CommonUtil', '$scope', '$filter', '$log', '$stateParams', '$uibModalInstance', 'JhiLanguageService', 'selectPlan', 'apiPlans'];

    function planEditDialogController(CommonUtil, $scope, $filter, $log, $stateParams, $uibModalInstance, JhiLanguageService, selectPlan, apiPlans) {

    	var vm = this;
        vm.clear = clear;
        vm.languages = null;
        vm.planType = selectPlan.type;
        vm.authorities = ['ROLE_PLAN_CREATE'];
        vm.quotaValueLimit = 999999999;
        vm.maxRequestRateLimit = 999999999;
        vm.keypressWatch = keypressWatch;
        vm.keyupWatch = keyupWatch;

        vm.plan = (selectPlan.data)? angular.copy(selectPlan.data) : {};
        vm.save = save;

        JhiLanguageService.getAll().then(function (languages) {
            vm.languages = languages;
        });

        vm.quotaValueUseCycleOption = [
            {val:'SECOND', name:'초'},
            {val:'MINUTE', name:'분'},
            {val:'HOUR', name:'시'},
            {val:'DAY', name:'일'},
            {val:'MONTH', name:'월'}
        ];
        vm.timeOptions = {
            hstep: ["1","2"],
            mstep: ["0", "15", "30", "45"],
            sstep: ["0", "15", "30", "45"]
        };
        vm.dayLimitOption = [
            {val:'SUNDAY', name:'일'},
            {val:'MONDAY', name:'월'},
            {val:'TUESDAY', name:'화'},
            {val:'WEDNESDAY', name:'수'},
            {val:'THURSDAY', name:'목'},
            {val:'FRIDAY', name:'금'},
            {val:'SATURDAY', name:'토'}
        ];

        vm.initTime = initTime;
        var time = new Date();
        if(selectPlan.data && selectPlan.data.controlTime){
            var starts = selectPlan.data.startTime.split(':');
            var ends = selectPlan.data.endTime.split(':');
            time.setHours(starts[0]);
            time.setMinutes(starts[1]);
            time.setSeconds(starts[2]);
            vm.startTime = time;
            var time = new Date();
            time.setHours(ends[0]);
            time.setMinutes(ends[1]);
            time.setSeconds(ends[2]);
            vm.endTime = time;
        }else{
            vm.initTime();
        }

        $scope.hstep = 1;
        $scope.mstep = 1;
        $scope.sstep = 1;

        function initTime(){
            time.setHours(0);
            time.setMinutes(0);
            time.setSeconds(0);
            vm.startTime = time;
            vm.endTime = time;
        }

        function clear () {
            vm.plan = (selectPlan.data)? angular.copy(selectPlan.data) : {quotaEnabled: false, rateLimitEnabled: false};
            $uibModalInstance.dismiss('cancel');
        }

        function onSuccess (result) {
            vm.isSaving = false;
            $uibModalInstance.close(result);
        }

        function onError (error) {
            vm.isSaving = false;
            CommonUtil.onError(error.data.description);
        }

        function save (type) {
            if (vm.plan.quotaValue && vm.plan.quotaValue.toString().match(',')){
                var quotaValue = angular.copy(vm.plan.quotaValue);
                vm.plan.quotaValue = vm.plan.quotaValue.replace(/,/g, '');
            }

            if (vm.plan.maxRequestRate && vm.plan.maxRequestRate.toString().match(',')){
                var maxRequestRate = angular.copy(vm.plan.maxRequestRate);
                vm.plan.maxRequestRate = vm.plan.maxRequestRate.replace(/,/g, '');
            }

            if(vm.plan.quotaValue){
                if(isNaN(Number(vm.plan.quotaValue))) {
                    CommonUtil.onError("할당량의 입력값이 잘못되었습니다.");
                    vm.plan.quotaValue = null;
                    if (maxRequestRate) vm.plan.maxRequestRate = maxRequestRate;
                    return;
                }else if(Number(vm.plan.quotaValue) > vm.quotaValueLimit){
                    CommonUtil.onError("할당량의 입력값이 범위를 초과했습니다.");
                    vm.plan.quotaValue = null;
                    if (maxRequestRate) vm.plan.maxRequestRate = maxRequestRate;
                    return;
                }
            }

            if(vm.plan.maxRequestRate){
                if(isNaN(Number(vm.plan.maxRequestRate))) {
                    CommonUtil.onError("초당 처리량의 입력값이 잘못되었습니다.");
                    vm.plan.maxRequestRate = null;
                    if (quotaValue) vm.plan.quotaValue = quotaValue;
                    return;
                }else if(Number(vm.plan.maxRequestRate) > vm.maxRequestRateLimit){
                    CommonUtil.onError("초당 처리량의 입력값이<br/>범위를 초과했습니다.");
                    vm.plan.maxRequestRate = null;
                    if (quotaValue) vm.plan.quotaValue = quotaValue;
                    return;
                }
            }

            if(type == "accountPlan"){
                /*if(selectPlan.data != null){
                    accountPlans.update(vm.plan, onSuccess, onError);
                }else{
                    accountPlans.save(vm.plan, onSuccess, onError);
                }*/
            }else{
                if(!vm.plan.quotaEnabled){
                    vm.plan.quotaTimeUnit = null;
                    vm.plan.quotaValue = null;
                }
                if(!vm.plan.rateLimitEnabled) vm.plan.maxRequestRate = null;
                if(!vm.plan.controlTime){
                    vm.plan.startTime = null;
                    vm.plan.endTime = null;
                }else{
                    vm.plan.startTime = $filter('date')(vm.startTime, "HH:mm:ss");
                    vm.plan.endTime = $filter('date')(vm.endTime, "HH:mm:ss");
                }
                if(selectPlan.data != null){
                    apiPlans.update(vm.plan, onSuccess, onError);
                }else{
                    apiPlans.save(vm.plan, onSuccess, onError);
                }
            }
        }

        if(selectPlan.data){
            angular.element(document).ready(function(){ //로딩 후, 초기숫자데이터에 comma넣기
                d3.selectAll("#number").each(function(i){
                    var currentVal = $(this).val();
                    var num = d3.format(',')(currentVal);
                    $(this).val(num);
                });
            });
        }

        function keypressWatch(event){
            if(event.keyCode == 45) {
                event.preventDefault();
            } //음수 부호 입력을 제한한다. 다른 기타 키입력은 numeral.js에서 걸러준다.
        }

        numeral.zeroFormat('');
        numeral.nullFormat('');
        function keyupWatch(event, limit, kind){
            $scope.$watch(function(){
                if(kind==1){
                    vm.plan.quotaValue = numeral(vm.plan.quotaValue).value()==null? null : numeral(vm.plan.quotaValue).value() > limit? numeral(limit).format('0,0') : numeral(vm.plan.quotaValue).format('0,0');
                }else{
                    vm.plan.maxRequestRate = numeral(vm.plan.maxRequestRate).value()==null? null : numeral(vm.plan.maxRequestRate).value() > limit? numeral(limit).format('0,0') : numeral(vm.plan.maxRequestRate).format('0,0');
                }
            });
        }
    }
})();
