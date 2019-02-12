(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('ContentsManagement', ContentsManagement);

    ContentsManagement.$inject = ['$resource'];

    function ContentsManagement($resource) {
        return $resource('/api/admin/contents', null, {
            'allContents': {
                method: 'GET',
                isArray: true,
                param: {
                    kind : '@kind'
                }
            },
            'addContents': {
                method: 'POST'
            },
            'editContents': {
                method: 'PUT'
            },
            'delContents': {
                url: '/api/admin/contents/:id',
                method: 'DELETE',
                params: {
                    id: '@id'
                }
            },
            'getByTitle': {
                url: '/api/contents/search',
                method: 'GET',
                param: {
                    title : '@title',
                    kind: '@kind'
                }
            },
            'settingUse': {
                url: '/api/admin/contents/:id/settinguse',
                method: 'PUT',
                params: {
                    id: '@id',
                    useYn: '@useYn',
                    showYn: '@showYn'
                }
            },
            'settingPriority': {
                url: '/api/admin/contents/setting-priority',
                method: 'PUT'
            },
            'listCategories': {
                url: '/api/admin/contents/categories',
                method: 'GET',
                isArray: true
            },
            'addCategories': {
                url: '/api/admin/contents/categories',
                method: 'POST'
            },
            'editCategories': {
                url: '/api/admin/contents/categories',
                method: 'PUT'
            },
            'delCategories': {
                url: '/api/admin/contents/categories/:id',
                method: 'DELETE',
                params: {
                    id: '@id'
                }
            }
        });
    }
})();
