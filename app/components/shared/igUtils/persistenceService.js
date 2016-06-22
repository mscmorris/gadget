export default ngModule => {

  var providerName = 'persistenceService';

  class persistenceService {

    /* @ngInject */
    constructor($log, $window,$q) {
      this._$log = $log;
      this.$window = $window;
      this.$q=$q;
      this.data = new Array();
    }

    insert(key, value){
      var deferred = this.$q.defer();
      this.data[key] = value;
      deferred.resolve(true);
      return deferred.promise;
    }

    delete(key){
      var deferred = this.$q.defer();
      delete this.data[key];
      deferred.resolve(true);
      return deferred.promise;

    }

    find(key){
      var deferred = this.$q.defer();
      deferred.resolve(this.data[key]);
      return deferred.promise;
    }

    findAll(){
      var deferred = this.$q.defer();


      var all_content;
        for(var key in this.data){
          all_content[i] = {content:data[key],ID:key};
        }
      deferred.resolve(all_content);
      return deferred.promise;
    }
  }
  ngModule.service(providerName, persistenceService);
}

