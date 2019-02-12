(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('GeneralInfo', GeneralInfo);

    GeneralInfo.$inject = ['$resource'];

    function GeneralInfo($resource) {
        return $resource('/api/contents/:id', null, {
            'allContents': {
                method: 'GET',
                isArray: true,
                param: {
                    kind : '@kind',
                    noContentsBody : '@noContentsBody',
                    noContentsIcon : '@noContentsIcon',
                    useYn : '@useYn',
                    showYn : '@showYn',
                    sort : '@sort'
                }
            },
            'providerContents': {
                url: '/api/contents/provider',
                method: 'GET',
                isArray: true,
                param: {
                    kind : '@kind',
                    noContentsBody : '@noContentsBody',
                    noContentsIcon : '@noContentsIcon',
                    orgName: '@orgName',
                    useYn: '@useYn'
                }
            },
            'addContents': {
                method: 'POST'
            },
            'editContents': {
                method: 'PUT',
                params: {
                    id: '@id'
                }
            },
            'delContents': {
                method: 'DELETE',
                params: {
                    id: '@id'
                }
            },
            'getOne': {
                method: 'GET',
                param: {
                    id : '@id'
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
            'listCategories': {
                url: '/api/contents/categories',
                method: 'GET',
                isArray: true
            },
            'searchCategories': {
                url: '/api/contents/search-categories',
                method: 'POST',
                isArray: true
            },
            'settingUse': {
                url: '/api/contents/:id/settinguse',
                method: 'PUT',
                params: {
                    id: '@id',
                    useYn: '@useYn'
                }
            }
        });
    }
})();
