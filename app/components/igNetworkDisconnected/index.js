import igNetworkDCController from './igNetworkDisconnectedController';

export default ngModule => {
  ngModule.directive('igNetworkDisconnected', ($rootScope) => {
    return {
      restrict: 'E',
      controller: igNetworkDCController,
      controllerAs: 'igNetworkDC',
      templateUrl: 'components/igNetworkDisconnected/index.html'
    }
  });
};
