(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('QuestionController', QuestionController);

    QuestionController.$inject = ['CommonConstants', 'Organization', 'GeneralInfo', '$uibModalStack', 'CommonUtil', 'Principal', '$rootScope', '$stateParams', '$state', '$scope', 'Forum', 'Question', 'JhiLanguageService', '$uibModal', '$timeout'];

    function QuestionController(CommonConstants, Organization, GeneralInfo, $uibModalStack, CommonUtil, Principal, $rootScope, $stateParams, $state, $scope, Forum, Question, JhiLanguageService, $uibModal, $timeout) {
        var vm = this;
        vm.languages = null;
        vm.state = $rootScope.paramUrl;
        vm.stateParams = $stateParams;
        vm.gotoDetail = gotoDetail;
        vm.pageChanged = pageChanged;

        vm.condition = {
                writerName: vm.writerSelected,
                title: vm.titleSelected,
                size: vm.stateParams.size,
                page: vm.stateParams.page,
                sort: vm.stateParams.sort
        };
        vm.searching = searching;

        Forum.list().$promise.then(function(response){
            vm.forums = response.filter(function(forum){
                forum.fullTitle = forum.owner? '['+forum.owner.name+'] '+forum.title : '[공통] '+forum.title;
                return true;
            });
        });

        if ($rootScope.account){
            vm.user = $rootScope.account; //login 정보 사용하기 위해.
            vm.isAdmin = $rootScope.account.authorities.indexOf('ROLE_ADMIN') > -1;
            vm.isForumCreator = $rootScope.account.authorities.indexOf('ROLE_FORUM_CREATE') > -1;
        }else vm.user={login: '-1'} //비로그인자에게 -1 부여.

        loadList();

        function searching () {
            vm.currentPage = 1;
            vm.condition = {
                writerName: vm.writerSelected,
                title: vm.titleSelected,
                size: vm.stateParams.size,
                page: 0,
                sort: vm.condition.sort //sort는 초기화없이 이전 설정이 계속 유지된다.
            };
            loadList();
        }

        function loadList() {
            vm.listTitle = vm.state.forumTitle;
            Question.list(vm.condition, function (response, headers) {
                vm.questionList = response;
                vm.totalItems = headers('x-total-count');
            });
        }

        vm.showPassword = function(id) {
            vm.condition.questionId = id;
            if(vm.isAdmin){
                gotoDetail();
            }else{
                $uibModal.open({
                    templateUrl: 'app/forum/question/question-password.html',
                    scope: $scope,
                    backdrop: 'static',
                    size: 'md'
                });
                $timeout(function () {
                    angular.element('#password').focus();
                }, 500);
            }
        }
        vm.passwordChk = function() {
            vm.condition.password = vm.password;
            Question.password(vm.condition, function (response, headers) {
                if(response.passwordChk){
                    gotoDetail();
                }else{
                    CommonUtil.onError("비밀번호가 틀렸습니다.");
                    vm.password = "";
                    vm.clear();
                }
            });
        }

        vm.clear = function() {
            $uibModalStack.dismissAll();
        }

        function gotoDetail() {
            $rootScope.paramUrl = {
                    forumTitle: vm.state.forumTitle,
                    questionId: vm.condition.questionId,
                    page: vm.condition.page,
                    sort: vm.stateParams.sort
            };
            $state.go('question.detail');
        }

        JhiLanguageService.getAll().then(function (languages) {
            vm.languages = languages;
        });

        function pageChanged() {
            vm.condition.page = vm.currentPage - 1;
            loadList();
        }

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }

    }
})();
