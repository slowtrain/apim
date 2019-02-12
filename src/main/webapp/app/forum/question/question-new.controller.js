(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('QuestionNewController', QuestionNewController);

    QuestionNewController.$inject = ['Organization', 'GeneralInfo', 'CommonConstants', '$timeout', '$compile', '$rootScope', '$stateParams', '$scope', 'Question', 'Forum', '$state', 'JhiLanguageService', 'CommonUtil'];

    function QuestionNewController (Organization, GeneralInfo, CommonConstants, $timeout, $compile, $rootScope, $stateParams, $scope, Question, Forum, $state, JhiLanguageService, CommonUtil) {
        var vm = this;
        vm.languages = null;
        vm.save = save;
        vm.state = $rootScope.paramUrl;
        vm.clear = clear;
        vm.question={};

        if ($rootScope.account){
            vm.user = $rootScope.account; //login 정보 사용하기 위해.
            vm.isAdmin = $rootScope.account.authorities.indexOf('ROLE_ADMIN') > -1;
            vm.isForumCreator = $rootScope.account.authorities.indexOf('ROLE_FORUM_CREATE') > -1;
        }else vm.user={login: '-1'} //비로그인자에게 -1 부여.

        vm.listTitle = vm.state.forumTitle;

        function clear() {
            onSuccess();
        }

        function save(){
            Question.create(vm.question, onSuccess);
        }

        function onSuccess (result) {
            $state.go('question', {forumTitle:vm.state.forumTitle});
        }
    }
})();
