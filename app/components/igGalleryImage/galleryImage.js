export default ngModule => {
    ngModule.directive('igGalleryImage', ()=> {
        function controllerFunc($rootScope, $scope, cameraService, dialogService, CODE_CONSTANTS){
          $scope._CODE_CONSTANTS = CODE_CONSTANTS;
          $scope.ImageClickHandler = function(photoId) {
            $scope.viewImage({id: photoId});
          };
          $scope.IsLocalPhoto = function(typeCode){
            return typeCode === undefined || typeCode === $scope._CODE_CONSTANTS.DOCUMENT_DISPLAY.WT_INSP_PHOTO;
          };
          $scope.ImageUrl = function(typeCode){
            var ret = "";
            if (typeof typeCode != "undefined" ) {
              ret= "images/wni_thumb-"+
              ((typeCode == $scope._CODE_CONSTANTS.DOCUMENT_DISPLAY.BILL_OF_LADING)?"bol":
              (typeCode == $scope._CODE_CONSTANTS.DOCUMENT_DISPLAY.BL_ATTATCHMENT)?"blat":
              (typeCode == $scope._CODE_CONSTANTS.DOCUMENT_DISPLAY.CUSTOMS_DOC)?"customs":
              (typeCode == $scope._CODE_CONSTANTS.DOCUMENT_DISPLAY.NMFC_CLASS_INSP_CERT)?"nmfcinspcert":
              (typeCode == $scope._CODE_CONSTANTS.DOCUMENT_DISPLAY.WT_INSP_CERT)?"wghtcorrcert":"")+
                "-3x.svg";
            }
            return ret;
          };

          $scope.DeletePhoto = function(id){
            dialogService.confirm(dialogService.buildDialogBindings(
              { "dialogTitle" : "Delete Photo",
                "dialogContent" : "Are you sure you want to delete this photo?",
                "dialogConfirmTxt" : "Yes",
                "dialogCancelTxt" : "No"
              }),
              () => {
                cameraService.deleteLocalPhoto(id);
                $rootScope.toast('Photo deleted successfully.');
                $scope.updateFn();
              }
            );
          };

        };
        return {
            restrict: 'E',
            scope: {
              fname: '=',
              fsrc:'=',
              opCode: '=',  // operationCode in SQLLITE DB, N - NEW, P - PENDING, C - COMPLETED
              id: '=',
              updateFn: '&',
              viewImage: '&',



            },
            templateUrl: 'components/igGalleryImage/galleryImage.html',
            controller: controllerFunc,
            compile: function(element, attrs){
               if (!attrs.opCode) { attrs.opCode = ""; }
            }
        }
    });
};
