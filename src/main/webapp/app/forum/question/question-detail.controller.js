(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('QuestionDetailController', QuestionDetailController);

    QuestionDetailController.$inject = ['CommonConstants', 'Organization', '$compile', '$rootScope', '$uibModal', '$timeout', 'User', '$stateParams', '$scope', 'Question', 'Forum', 'Principal', '$state','$interval','JhiLanguageService', 'CommonUtil'];

    function QuestionDetailController (CommonConstants, Organization, $compile, $rootScope, $uibModal, $timeout, User, $stateParams, $scope, Question, Forum, Principal, $state, $interval, JhiLanguageService, CommonUtil) {
        var vm = this;
        vm.state = $rootScope.paramUrl;
        vm.providers = Organization.providers();
        vm.searchTitleForCategoryForum = CommonConstants.searchTitleForCategoryForum;
        vm.delInput = CommonUtil.delInput;
        vm.selectFile = CommonUtil.selectFile;
        vm.fileSize = CommonUtil.fileSize;
        vm.deletion = false;
        vm.files = [{data:null}];

        $scope.addFileInput = function(event, noAdd){
            if (!vm.deletion){
                var idx = event.target.id.split('-')[1];
                CommonUtil.addFileInput(idx, vm.files, noAdd);
            }
        }

        if ($rootScope.account){
            vm.user = $rootScope.account; //login 정보 사용하기 위해.
            vm.isAdmin = $rootScope.account.authorities.indexOf('ROLE_ADMIN') > -1;
            vm.isForumCreator = $rootScope.account.authorities.indexOf('ROLE_FORUM_CREATE') > -1;
        }else vm.user={login: '-1'} //비로그인자에게 -1 부여.

        vm.languages = null;
        vm.delQuestion = delQuestion;
        vm.save = save;
        vm.readOnlyToggle = readOnlyToggle;
        vm.readOnly = true;
        vm.htmlContents = htmlContents;
        vm.clear = clear;
        vm.mode = "register";
        vm.init = init;
        vm.listTitle = vm.state.forumTitle;

        function init(){
            Question.detail({
                questionId: vm.state.questionId
            }).$promise.then(function(response){
                vm.question = response;
                vm.original = angular.copy(vm.question);
            });
        }

        init();

        function htmlContents(reply){
            var id = '#content'+reply.id;
            $(id).html(reply.content);
        }

        function readOnlyToggle(choice, post) {
            if(choice) reloadPost();
            else {
                vm.readOnly = choice;
                vm.post = angular.copy(post);
                $timeout(function(){$('#postContent').html(post.content);},200);
            }
        }

        function clear(){
            $state.go('question', {forumTitle:vm.state.forumTitle});
        }

        function reloadQuestion(){
            $state.reload('question.detail');
        }

        function delQuestion(){
            $uibModal.open({
                templateUrl: 'app/services/common/modal.html',
                controller: 'modalController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'sm',
                resolve: {
                    items:function(){
                        return{
                            data: '이 글을',
                            type:'delete'
                        }
                    }
                }
            }).result.then(function () {
                Question.delete({questionId: vm.question.id}, onSuccess, onError);
            });
        }

        function onError(error) {
            CommonUtil.modalOne(error.data.description);
        }

        function save(){
            Question.createReply({questionId: vm.question.id}, vm.questionReply, onSuccessReply);
        }

        function onSuccessReply() {
            $rootScope.paramUrl = {forumTitle:vm.state.forumTitle, page:vm.state.page, sort:vm.state.sort, questionId:vm.question.id};
            $state.reload('question.detail', $rootScope.paramUrl);
        }

        function onSuccess() {
            $rootScope.paramUrl = {forumTitle:vm.state.forumTitle, page:vm.state.page, sort:vm.state.sort, questionId:vm.question.id};
            $state.go('question');
        }
    }
})();
