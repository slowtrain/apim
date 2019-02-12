(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('termsModalController', termsModalController);

    termsModalController.$inject = ['$scope', '$timeout', '$uibModalInstance', 'item', 'CommonUtil'];

    function termsModalController($scope, $timeout, $uibModalInstance, item, CommonUtil) {
        var vm = this;
        vm.close = close;
        vm.item = item;

        vm.iePdfviewHelpPopover = { templateUrl : "/app/layouts/popover-template/ie-pdf-view-help-popover.html" };

        vm.noFile = (item.noFile) ? item.noFile : false;
        vm.fileDown = fileDown;
        vm.fileSize = CommonUtil.fileSize;

        if(item.type){
            if(item.type=='portalTerms'){
                vm.flagOfPortalTerms = true;
                vm.noFile = true;
                vm.item.name = item.terms.name;
                $timeout(function(){ $("#termsContent").html(item.terms.content) });
            }else if(item.type=='contentsManagement'){
                vm.item.name = item.contents.title;
                vm.item.kind = item.contents.kind;
                if (item.contents.sentence) vm.item.sentences = item.contents.sentence.split('\\n');
                if (item.contents.kind =='service-package') {
                    vm.item.showYn =(item.contents.showYn == 'Y')? '추천 공개' : '추천 비공개';
                    vm.item.useYn =(item.contents.useYn == 'Y')? '메뉴 공개' : '메뉴 비공개';
                } else {
                    vm.item.useYn = (item.contents.useYn == 'Y')? '공개' : '비공개';
                }

                $timeout(function(){
                    $("#termsContent").html(item.contents.contentsBody);
                    if (vm.item.kind == 'service-package' || vm.item.kind == 'news-stand') $("#termsIcon").html(item.contents.contentsIcon);
                });
            }
        }else{
            $timeout(function(){ $("#termsContent").html(item.content) });
        }

        function close() {
            $uibModalInstance.dismiss('cancel');
        }

        function fileDown(file){
            if($scope.account) window.open('/files/view/'+file.id, '약관', null);
        }
    }
})();
