(function(angular, moment) {

  var module = angular.module('pockeyt.repositories.loyalty-cards', ['pockeyt.models.partner', 'pockeyt.services.api']);

  module.factory('loyaltyCardsRepository', ['$q', 'Partner', 'PockeytApi', function($q, Partner, api) {

    var repository = {
      _stale: true,
      page: 1,
      hasMore: true,
      isLoading: false,
      empty: false,
      _cache: [],

      _transformLoyaltyCard: function(loyaltyCard) {
        return {
          program_id: loyaltyCard.program_id,
          current_amount: loyaltyCard.current_amount,
          rewards_achieved: loyaltyCard.rewards_achieved,
          is_increment: loyaltyCard.is_increment,
          purchases_required: loyaltyCard.purchases_required,
          amount_required: loyaltyCard.amount_required,
          reward: loyaltyCard.reward,
          business_thumb_path: loyaltyCard.business_thumb_path,
          business_name: loyaltyCard.business_name,
          last_purchase: moment.utc(loyaltyCard.last_purchase.date).local().toDate(),
        };
      },

      _findInCache: function(id) {
        for(var i = 0; i < this._cache.length; i++) {
          if(this._cache[i].program_id == id) {
            return this._cache[i];
          }
        }
        return null;
      },

      find: function(id, rejectOnNotFound, ignoreStaleness) {
        var doFind = function(resolve, reject) {
          var loyaltyCard = this._findInCache(id);
          if(loyaltyCard == null) {
            if (typeof rejectOnNotFound === 'undefined' || !!rejectOnNotFound)
              reject(new Error('Could not find in cache and no remote available.'));
            else
              resolve(null);
          } else {
            resolve(loyaltyCard)
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

          return api.request('/loyalty/cards?page=' + page).then(function(response) {
            if (!response.data.meta.pagination.links.next) {
              if (response.data.data.length === 0 && this.page === 1) { this.empty = true; }
              this.hasMore = false;
             }

            var promises = response.data.data
              .map(this._transformLoyaltyCard.bind(this))
              .map(function(loyaltyCardData) {
                return this.find(loyaltyCardData.program_id, false, true).then(function(loyaltyCard) {
                  return $q.resolve({data: loyaltyCardData, loyaltyCard: loyaltyCard});
                });
              }.bind(this));
            return $q.all(promises)
              .then(function(descriptors) {
                angular.forEach(descriptors, function(descriptor) {
                  if (descriptor.loyaltyCard == null) {
                    this._cache.push(new Partner(descriptor.data));
                  } else {
                    descriptor.loyaltyCard.fill(descriptor.data);
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