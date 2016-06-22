export default ngModule => {
  var providerName = 'navigationService';

  class navigationService {
    /*@ngInject*/
    constructor($log) {
      this._$log=$log;
      this._stateStack=[];
      this._pushOrPop='';
    }

    pushState(state){
      var s= this;
      s._stateStack.push(state);
    }

    popState(){
      var s= this;
      var length = s._stateStack.length;
      s._stateStack.pop();
      if(s._stateStack.length == (length -1)){
        s._pushOrPop='POP';
        if(s._stateStack.length==0){
          return "";
        }else{
          return s._stateStack[s._stateStack.length-1];
        }

      }else{
        s._$log("pop StateStack Failed");
      }
    }
  }

  ngModule.service(providerName, navigationService);
}
