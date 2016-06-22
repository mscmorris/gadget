
import Rx from "rx"
export default ngModule => {
  var providerName = 'navigationService';

  class navigationService {
    /*@ngInject*/
    constructor($log, $state, $rootScope) {
      this._$log = $log;
      this._$state = $state;
      this._$rootScope = $rootScope;
      this._stateStack = [];
    }

    pushState(toState,toParams,fromState,fromParams){
      if(toState.data.rootState == true){
        this._stateStack = [];
        this.executePush(toState,toParams);
      } else if(toState.name != this._stateStack[this._stateStack.length-1].name){
        this.executePush(toState,toParams);
      }
    }

    executePush(state,params){
      var state = {'name': state.name, 'state':state,'stateParams':params};
      this._stateStack.push(state);
    }

    popState() {
      var s= this;
      var popped = s._stateStack.pop();
      if(popped == undefined) {
        s._$log.debug("pop StateStack Failed");
      }
    }

    isRootState(){
      return this._$state.current.data.rootState && this._$state.current.data.rootState == true;
    }

    prevState() {
      try{
        this._stateStack.pop();
        var prevState = this._stateStack[this._stateStack.length-1];
        this._$state.go(prevState.name, prevState.stateParams);
      } catch(e){
        this._$rootScope.toast("Failed to navigate to the previous page. Please try again or reopen the application.");
        this.defaultState();
      }
    }

    defaultState(){
      this._$state.go('list');
    }

    getStateConfig(stateOrName){
      return this._$state.get(stateOrName)
    }

    getCurrentState(){
      return this._stateStack.length == 0 ? undefined : this._stateStack[this._stateStack.length-1];
    }

    getStateStack(){
      return Rx.Observable.from(this._stateStack)
    }

  }

  ngModule.service(providerName, navigationService);
}
