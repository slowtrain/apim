(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('UseOrgsPopupController', UseOrgsPopupController);

    UseOrgsPopupController.$inject = ['$uibModal', '$uibModalInstance', 'selections', 'UseOrgs', 'CommonUtil'];

    function UseOrgsPopupController ($uibModal, $uibModalInstance, selections, UseOrgs, CommonUtil) {

        var vm = this;
        vm.selections = selections;
        vm.clear = clear;
        vm.saveComment = saveComment;
        vm.delComment = delComment;
        vm.totalItems = null;
        vm.currentPage = 1;
        vm.size = 5;
        vm.sort = 'id,desc';
        vm.pageChanged = pageChanged;
        vm.searching = searching;
        vm.showDetail = showDetail;

        function searching(){
            loadAll();
        }

        function pageChanged() {
            loadAll();
        };

        if (selections.apps == undefined) loadAll();

        function loadAll(){
            UseOrgs.listComments({
                orgId: vm.selections.orgId,
                useorgId: vm.selections.useOrg.organization.id,
                page: vm.currentPage-1,
                size: vm.size,
                sort: vm.sort,
                detailComment: vm.searchingText,
            }, onSuccess, onError);
        }

        function showDetail(app){
            $uibModal.open({
                templateUrl: 'app/app-management/app-manage/app-view.html',
                controller: 'AppViewController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'md',
                resolve: {
                    selectApp: app
                }
            });
        }

        function onSuccess(data, headers) {
            vm.totalItems = headers('X-Total-Count');
            vm.comments = data;
        }

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }

        function saveComment () {
            vm.searchingText = null;
            UseOrgs.createComment({orgId: vm.selections.orgId, useorgId: vm.selections.useOrg.organization.id}, vm.commentContent, loadAll, onError);
            vm.commentContent = "";
        }

        function delComment(comment){
            vm.searchingText = null;
            UseOrgs.delComment({orgId: vm.selections.orgId, useorgId: vm.selections.useOrg.organization.id, commentId: comment.id}, loadAll, onError);
        }

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }
    }
})();
