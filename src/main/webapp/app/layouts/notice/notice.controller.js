(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('NoticeController', NoticeController);

    NoticeController.$inject = ['$state', '$rootScope', '$window', '$scope', '$stateParams', 'Forum', 'CommonUtil', 'GeneralInfo'];

    function NoticeController ($state, $rootScope, $window, $scope, $stateParams, Forum, CommonUtil, GeneralInfo) {
        var vm = this;
        vm.htmlContents = htmlContents;
        vm.fileDown = CommonUtil.fileDown;
        vm.fileSize = CommonUtil.fileSize;
        vm.closeDays = CommonUtil.closeDays;
        vm.close = close;
        vm.goForum = goForum;
        vm.param = eval($stateParams.id);
        vm.loginStatus = ($scope.account)? true: false;

        GeneralInfo.getOne({id: vm.param}).$promise.then(function (response){
            vm.notice = response;
        });

        function goForum() {
            Forum.findId({orgName:null, forumTitle:'공지사항'}).$promise.then(function(response) {
                vm.noticeForumId = response.id;
                var paramUrl = {forumOwner: null, forumId: vm.noticeForumId, forumTitle:'공지사항', isWritable: false, idForviewAll:vm.noticeForumId, postId: vm.notice.postId, page:0, sort:'id,desc', link:'home', url:'post.detail'};
                $window.opener.$windowScope.vm.goForum(paramUrl);
            });
        }

        function close(winId){
            $window.close(winId);
        }

        function htmlContents(content){
            $('#content').html(content);
        }
    }
})();
