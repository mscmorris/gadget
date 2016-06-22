export default class igNetworkDisconnectedController {
  /*@ngInject*/
  constructor($rootScope, $scope) {
    // Angular Module Deps
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.displaySelf = false;
    this.activate();
  }

  activate() {
    this.$rootScope.$on('retryRequest', this.updateDisplay.bind(this));
  }

  updateDisplay(event, data) {
    if(!angular.isUndefined(data.noRetry) && data.noRetry == true) {
      this.displaySelf = false;
    } else {
      this.displaySelf = true;
      this.message = data.message;
    }
  }
}
