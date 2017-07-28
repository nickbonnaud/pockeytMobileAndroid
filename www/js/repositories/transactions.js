(function(angular, moment) {

  var module = angular.module('pockeyt.repositories.transactions', ['pockeyt.models.partner', 'pockeyt.services.api']);

  module.factory('transactionsRepository', ['$q', 'Partner', 'PockeytApi', function($q, Partner, api) {

    var repository = {
      _stale: true,
      page: 1,
      hasMore: true,
      empty: false,
      isLoading: false,
      _cache: [],

      _transformTransaction: function(transaction) {
        return {
          id: transaction.id,
          business_logo: transaction.business_logo,
          business_name: transaction.business_name,
          deal_id: transaction.deal_id,
          redeemed: transaction.redeemed,
          products: transaction.products,
          tax: transaction.tax,
          tips: transaction.tips,
          net_sales: transaction.net_sales,
          total: transaction.total,
          updated_at: moment.utc(transaction.updated_at.date).local().toDate(),
        };
      },

      _findInCache: function(id) {
        for(var i = 0; i < this._cache.length; i++) {
          if(this._cache[i].id == id) {
            return this._cache[i];
          }
        }
        return null;
      },

      find: function(id, rejectOnNotFound, ignoreStaleness) {
        var doFind = function(resolve, reject) {
          var transaction = this._findInCache(id);
          if(transaction == null) {
            if (typeof rejectOnNotFound === 'undefined' || !!rejectOnNotFound)
              reject(new Error('Could not find in cache and no remote available.'));
            else
              resolve(null);
          } else {
            resolve(transaction)
          }
        }.bind(this);

        if (this._stale && (typeof ignoreStaleness === 'undefined' || !ignoreStaleness)) {
          return this.reload().then(function() {
            return $q(doFind);
          });
        } else {
          return $q(doFind);
        }
      },

      reload: function() {
        if (this.hasMore && !this.isLoading) {
          this.isLoading = true;
          this.empty = false;
          var page = this.page;

          return api.request('/transactions/recent?page=' + page).then(function(response) {
            if (!response.data.meta.pagination.links.next) {
              if (response.data.data.length === 0 && this.page === 1) { this.empty = true; }
              this.hasMore = false;
            }
            var promises = response.data.data
              .map(this._transformTransaction.bind(this))
              .map(function(transactionData) {
                return this.find(transactionData.id, false, true).then(function(transaction) {
                  return $q.resolve({data: transactionData, transaction: transaction});
                });
              }.bind(this));
            return $q.all(promises)
              .then(function(descriptors) {
                angular.forEach(descriptors, function(descriptor) {
                  if (descriptor.transaction == null) {
                    this._cache.push(new Partner(descriptor.data));
                  } else {
                    descriptor.transaction.fill(descriptor.data);
                  }
                }.bind(this));
                this._stale = false;
                this.isLoading = false;
                return this._cache;
              }.bind(this));
          }.bind(this));
        }
      },

      loadMore: function() {
        if (repository.hasMore && !repository.isLoading) {
          this.page += 1;
          this.reload();
        }
      },

      all: function() {
        this.page = 1;
        this.hasMore = true;
        return this.reload();
      },

      allCached: function() {
        return this._cache;
      },
    };

    return repository;

  }]);

})(angular, moment);