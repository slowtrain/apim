(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .directive('approvalProgressView', approvalProgressView);

    approvalProgressView.$inject = [];

    function approvalProgressView() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                progress: "=progress"
            },
            templateUrl: '/app/directives/approval-progress-view.html',
            link: link
        };

        function link(scope, element, attrs) {
            scope.progress.forEach(function (a) {
                addDecisionClass(a);
            });
            scope.isArray = angular.isArray;
            scope.onDisplay = onDisplay;
        }

        function onDisplay(approver) {
            if (!approver.decision) return "미결";
            switch (approver.decision.key) {
                case 'APPROVED':
                    return "승인";
                case 'DENIED':
                    return "반려";
                case 'CANCELED':
                    return "취소";
                case 'CREATED':
                    return "요청";
                case 'STOPPED':
                    return "요청종료";
                default :
                    return "미결";
            }
        }

        function addDecisionClass(a) {
            if (Array.isArray(a)) {
                a.forEach(function (child) {
                    addDecisionClass(child);
                });
            } else {
                if (a.decision) {
                    switch (a.decision.key) {
                        case "CREATED":
                        case "APPROVED":
                            a.classname = 'confirm';
                            break;
                        case "CANCELED":
                        case "DENIED":
                            a.classname = 'cancel';
                            break;
                        default:
                            a.classname = '';
                    }
                }
            }
        }
    }
})();
