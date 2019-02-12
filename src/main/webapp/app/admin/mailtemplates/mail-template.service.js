(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('MailTemplate', MailTemplate);

    MailTemplate.$inject = ['$resource'];

    function MailTemplate ($resource) {
        var service = $resource('/api/emails/templates/:code', {}, {
            'list': {
                method: 'GET',
                isArray: true,
                params: {
                    page: '@page',
                    size: '@size'
                }
            },
            'create':{
                method:'POST'
            },
            'update':{
                method:'PUT',
                params: {
                    code: '@code'
                }
            },
            'delete':{
                method:'DELETE',
                params: {
                    code: '@code'
                }
            },
            'getDetail':{
                method:'GET',
                params: {
                    code: '@code'
                }
            },
            'sendNotification':{
                url:'/api/notification',
                method:'POST'
            }
        });
        return service;
    }
})();
