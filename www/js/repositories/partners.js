(function(angular, moment) {

  var module = angular.module('pockeyt.repositories.partners', ['pockeyt.models.partner', 'pockeyt.services.api']);

  module.factory('partnersRepository', ['$q', 'Partner', 'PockeytApi', function($q, Partner, api) {

    var repository = {
      _stale: true,
      _cache: [],
      _unlocked: [],
      page: 1,
      hasMore: true,
      isLoading: false,

      _transformPost: function(post) {
        if (post.is_redeemable) {
          return {
            id: post.id,
            business_id: post.profile_id,
            business_name: post.business_name,
            message: post.message,
            post_photo: post.photo_url,
            date: moment.utc(post.published_at.date).local().toDate(),
            is_redeemable: post.is_redeemable,
            deal_item: post.deal_item,
            price: post.price,
            end_date: post.end_date,
            logo: post.logo ? post.logo : '',
            tags: post.tags,
            url: post.website,
            info: post.formatted_description,
            hero: post.hero ? post.hero : '',
          };
        } else if (post.event_date && post.event_date != '0000-00-00') {
          return {
            id: post.id,
            business_id: post.profile_id,
            business_name: post.business_name,
            message: post.message,
            post_photo: post.photo_url,
            date: moment.utc(post.published_at.date).local().toDate(),
            event_date: post.event_date,
            is_redeemable: post.is_redeemable,
            logo: post.logo ? post.logo : '',
            tags: post.tags,
            url: post.website,
            info: post.formatted_description,
            hero: post.hero ? post.hero : '',
          };
        } else {
          return {
            id: post.id,
            business_id: post.profile_id,
            business_name: post.business_name,
            message: post.message,
            post_photo: post.photo_url,
            date: moment.utc(post.published_at.date).local().toDate(),
            is_redeemable: post.is_redeemable,
            logo: post.logo ? post.logo : '',
            tags: post.tags,
            url: post.website,
            info: post.formatted_description,
            hero: post.hero ? post.hero : '',
          };
        }
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
          var partner = this._findInCache(id);
          if(partner == null) {
            if(typeof rejectOnNotFound === 'undefined' || !!rejectOnNotFound)
              reject(new Error('Could not find in cache and no remote available.'));
            else
              resolve(null);
          } else {
            resolve(partner)
          }
        }.bind(this);

        if(this._stale && (typeof ignoreStaleness === 'undefined' || !ignoreStaleness)) {
            return $q(doFind);
        } else {
          return $q(doFind);
        }
      },

      reload: function() {
        if (this.hasMore && !this.isLoading) {
          this.isLoading = true;
          var page = this.page;

          return api.request('/v2/posts?page=' + page).then(function(response) {
            if (!response.data.meta.pagination.links.next) {
              this.hasMore = false;
             }
            var promises = response.data.data
                .map(this._transformPost.bind(this))
                .map(function(partnerData) {
                  return this.find(partnerData.id, false, true).then(function(partner) {
                    return $q.resolve({data: partnerData, partner: partner});
                  });
                }.bind(this));
            return $q.all(promises)
                .then(function(descriptors) {
                  angular.forEach(descriptors, function(descriptor) {
                    if(descriptor.partner == null) {
                      this._cache.push(new Partner(descriptor.data));
                    } else {
                      descriptor.partner.fill(descriptor.data);
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
        this._cache = [];
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