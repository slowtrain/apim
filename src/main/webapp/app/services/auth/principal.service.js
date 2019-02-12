(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('Principal', Principal);

    Principal.$inject = ['$q', 'Account'];

    function Principal($q, Account) {
        var _identity,
            _authenticated = false;

        return {
            authenticate: authenticate,
            hasAnyAuthority: hasAnyAuthority,
            hasAuthority: hasAuthority,
            identity: identity,
            isAuthenticated: isAuthenticated,
            isIdentityResolved: isIdentityResolved,
            hasExpiredPassword : hasExpiredPassword,
            isDormant: isDormant
        };

        function authenticate(identity) {
            _identity = identity;
            _authenticated = identity !== null;
        }

        function hasAnyAuthority(authorities) {
            if (!_authenticated || !_identity || !_identity.authorities) {
                return false;
            }

            for (var i = 0; i < authorities.length; i++) {
                if (_identity.authorities.indexOf(authorities[i]) !== -1) {
                    return true;
                }
            }

            return false;
        }

        function hasAuthority(authority) {
            if (!_authenticated) {
                return $q.when(false);
            }

            return this.identity().then(function (_id) {
                return _id.authorities && _id.authorities.indexOf(authority) !== -1;
            }, function () {
                return false;
            });
        }

        function hasExpiredPassword(){
            return _identity.expiredPassword;
        }

        function isDormant() {
            return _identity.dormant;
        }

        function identity(force) {
            var deferred = $q.defer();

            if (force === true) {
                _identity = undefined;
            }

            // check and see if we have retrieved the identity data from the server.
            // if we have, reuse it by immediately resolving
            if (angular.isDefined(_identity)) {
                deferred.resolve(_identity);

                return deferred.promise;
            }

            // retrieve the identity data from the server, update the identity object, and then resolve.
            Account.get().$promise
                .then(getAccountThen)
                .catch(getAccountCatch);

            return deferred.promise;

            function getAccountThen(account) {
                // account의 데이터가 없는 경우는 로그인 하지 않은 것으로 간주한다.
                if (account.data) {
                    _identity = account.data;
                    _authenticated = true;
                    deferred.resolve(_identity);
                } else {
                    getAccountCatch();
                }
            }

            function getAccountCatch() {
                _identity = null;
                _authenticated = false;
                deferred.resolve(_identity);
            }
        }

        function isAuthenticated() {
            return _authenticated;
        }

        function isIdentityResolved() {
            return angular.isDefined(_identity);
        }
    }
})();
