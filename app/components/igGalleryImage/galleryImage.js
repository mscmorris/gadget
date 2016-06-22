export default ngModule => {
    ngModule.directive('igGalleryImage', ()=> {
        function controllerFunc($rootScope, $scope, cameraService, dialogService){
          $scope.DeletePhoto = function(id){
            dialogService.confirm(dialogService.buildDialogBindings(
              { "dialogTitle" : "Delete Photo",
                "dialogContent" : "Are you sure you want to delete this photo?",
                "dialogConfirmTxt" : "Yes",
                "dialogCancelTxt" : "No"}),
              () => {
                cameraService.deleteLocalPhoto(id);
                $rootScope.toast('Photo deleted successfully.');
                $scope.updateFn();
              }
            );
          }
        };
        return {
            restrict: 'E',
            scope: {
              fname: '=',
              fsrc:'=',
              opCode: '=',  // operationCode in SQLLITE DB, N - NEW, P - PENDING, C - COMPLETED
              id: '=',
              updateFn: '&'
            },
            templateUrl: 'components/igGalleryImage/galleryImage.html',
            controller: controllerFunc,
            compile: function(element, attrs){
               if (!attrs.opCode) { attrs.opCode = ""; }
            }
        }
    });
};
