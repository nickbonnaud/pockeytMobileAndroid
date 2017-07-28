(function(angular, moment) {

  var module = angular.module('pockeyt.repositories.deals', ['pockeyt.models.partner', 'pockeyt.services.api']);

  module.factory('dealsRepository', ['$q', 'Partner', 'PockeytApi', function($q, Partner, api) {

    var repository = {
      _stale: true,
      page: 1,
      hasMore: true,
      empty: false,
      isLoading: false,
      _cache: [],

      _transformDeal: function(deal) {
        return {
        	deal_id: deal.deal_id,
          deal_item: deal.deal_item,
          end_date: moment.utc(deal.end_date.date).local().toDate(),
          message: deal.message,
          post_photo_path: deal.post_photo_path,
          price: deal.price / 100,
          business_id: deal.business_id,
          redeemed: deal.redeemed,
          business_thumb_path: deal.business_thumb_path,
          business_name: deal.business_name,
          tax: deal.tax,
          total: deal.total,
          customer_id: deal.customer_id,
          purchased_on:  moment.utc(deal.purchased_on.date).local().toDate()
        };
      },

      _findInCache: function(id) {
        for(var i = 0; i < this._cache.length; i++) {
          if(this._cache[i].deal_id == id) {
            return this._cache[i];
          }
        }
        return null;
      },

      find: function(id, rejectOnNotFound, ignoreStaleness) {
        var doFind = function(resolve, reject) {
          var deal = this._findInCache(id);
          if(deal == null) {
            if (typeof rejectOnNotFound === 'undefined' || !!rejectOnNotFound)
              reject(new Error('Could not find in cache and no remote available.'));
            else
              resolve(null);
          } else {
            resolve(deal)
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

          return api.request('/transactions/deals?page=' + page).then(function(response) {
            if (!response.data.meta.pagination.links.next) {
              if (response.data.data.length === 0 && this.page === 1) { this.empty = true; }
              this.hasMore = false;
             }
            var promises = response.data.data
              .map(this._transformDeal.bind(this))
              .map(function(dealData) {
                return this.find(dealData.deal_id, false, true).then(function(deal) {
                  return $q.resolve({data: dealData, deal: deal});
                });
              }.bind(this));
            return $q.all(promises)
              .then(function(descriptors) {
                angular.forEach(descriptors, function(descriptor) {
                  if (descriptor.deal == null) {
                    this._cache.push(new Partner(descriptor.data));
                  } else {
                    descriptor.deal.fill(descriptor.data);
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