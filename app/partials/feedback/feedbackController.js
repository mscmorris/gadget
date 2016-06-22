export default ngModule => {
  var controllerName = 'feedbackController';

  class feedbackController {
    /*@ngInject*/
    constructor($rootScope, $scope, $state, $log, CODE_CONSTANTS, igUtils, dialogService, inspectionService) {
      // Angular Module Deps
      this._$rootScope = $rootScope;
      this._$scope = $scope;
      this._$state = $state;
      this._$log = $log;
      this.categories = CODE_CONSTANTS.FEEDBACK_CATEGORIES;
      this.selectedCategory;
      this.comments;
      this._igUtils = igUtils;
      this._dialogService = dialogService;
      this._inspectionService = inspectionService;
    }
    sendFeedback(){
      this._igUtils.sendFeedback(this.selectedCategory, this.comments,this._inspectionService.getInspectionContext());
      var dialogArgs = { "dialogTitle" : "Feedback Submitted", "dialogContent" : "Thank you, your feedback has been sent to the support team." };
      var locals = this._dialogService.buildDialogBindings(dialogArgs);
      this._dialogService.alert(locals);
      this.selectedCategory = undefined;
      this.comments = undefined;
    }
  }
  ngModule.controller(controllerName, feedbackController);
};
