export default ngModule => {
  var controllerName = 'inspectionInProgressController';

  class inspectionInProgController {
    /*@ngInject*/
    constructor($rootScope, $scope, $state, $log, $mdDialog, $window, cameraService, inspectionService, twmPhotoUploadService, dialogService,
        igUtils,CODE_CONSTANTS,mappingService) {
      var vm = this;
      // Angular Module Deps
      this._$rootScope = $rootScope;
      this._$scope = $scope;
      this._$state = $state;
      this._$log = $log;
      this._$mdDialog = $mdDialog;
      this._$window = $window;
      // IG Deps
      this._inspectionService = inspectionService;
      this._cameraService = cameraService;
      this._dialogService = dialogService;
      this._igUtils = igUtils;
      // Local properties
      //this.$scope.$on('updatePhoto', this.previewPhoto); // -- This implementation breaks when transpiled to ES5
      this._cameraAvailable = this._cameraService.getCameraAvailablity();
      this._currInspection = this._inspectionService.getCurrInspection();
      this._inspectionContext = this._inspectionService.getInspectionContext();
      this._dimensions = [];
      //this._gallery_images = require("./../../utils/gallery_img_proto_list"); // Can be used for testing outside of container
      this._inspectionDtls;
      this._shipDetails;
      this._CODE_CONSTANTS=CODE_CONSTANTS;
      this._mappingService = mappingService;
      this._addDimRowDisabled = true;
      this._twmPhotoUploadService = twmPhotoUploadService

      cameraService.registerPhotoTakenListener().then(
        (message)=>{
          // Photo was taken - set status to In Progress
          if(this._currInspection.inspectionStatusCd !== this._CODE_CONSTANTS.INSPECT_STATUS.P) {
            this.setInspectionStatus("P");
          }
        },
        (error)=>{
          this._$log.error(`${controllerName}[registerPhotoTakenListener]: Error occurred: ${error.toString()}`);
        }
      );
      cameraService.registerPreviewPhotoListener().then(
        (data)=>{
          var s = this;
          s._cameraService.setCurrPhotoID(data.ID);
          s._cameraService.setCurrPhotoSource(data.PHOTOBYTES);
          s._cameraService.setCurrPhotoOrigin('local');
          $state.go("viewPhoto");
        },
        (error)=>{
          this._$log.error(`${controllerName}[registerPreviewPhotoListener]: Error occurred: ${error.toString()}`);
        }
      );

      // Make API service calls to populate model variables
      this.activate();
    }

    activate() {

      if(this._currInspection.inspectionStatusCd === ""){
        var reqData={};
        reqData.currentInspection = this._currInspection;
        reqData.inspectionContext = this._inspectionContext;
        reqData.inspectionDetails = this._inspectionDtls;
        reqData.inspectorPieceDimensions = {"seq" : "", "pieceCnt" : "", "inspectorPieceDimensions" : []};
        reqData = this._mappingService.mapCreateInspectionRequest(reqData);
        this._inspectionService.createInspection(reqData)
        .then(response => {
          this.setInspectionStatus("R");
          this.getInspectionDetails();
        })
      } else{
        this.getInspectionDetails();
      }
      this.reloadPhotos();
    }

    setInspectionStatus(status) {
      var selProNbrs = [];
      var req = {};
      selProNbrs.push(this._currInspection.proNbr);
      req["inspectionContext"]=this._inspectionContext;
      req["actionCd"]=status;
      req["alertProNbr"]=selProNbrs;

      return this._inspectionService.setInspectionStatus(req)
        .then(response=>{
          this._inspectionService.currInspection["inspectionStatusCd"]= this._mappingService.transInspCodeToStatus(status);
        },error=>{this._$log.error(controllerName + "[setInspectionStatus]: SETINSPECTIONSTATUS call failed!");});

    }

    launchCamera() {
      var s = this;
      var response = s._cameraService.launchCamera(s._currInspection.proNbr,s._currInspection.inspectionStatusCd);
      if(response && response.length > 0) {
        s._$mdDialog.show(
          s._$mdDialog.alert()
            .parent(angular.element(document.querySelector('#popupContainer')))
            .clickOutsideToClose(true)
            .title('Oops')
            .content('The camera is not available. Please reload the application, and if the error persists contact ' +
            'the support team.')
            .ariaLabel('Alert Dialog Demo')
            .ok('Close')
        );
      }
    }

    reloadPhotos(){
      var s = this;
      s._cameraService.listLocalPhotos(s._currInspection.proNbr).then(
        (value)=>
        {
          s._gallery_images = value;
        },
        (error)=>{

        });
    }

    openFileBrowser(selector) {
      var element = angular.element(selector);
      $(element).trigger('click');
    }

    selectPhotoManually(element) {
      var s = this;
      var loadedPhotos = element.files;
      if (loadedPhotos) {
        angular.forEach(loadedPhotos,  (photo, index) => {
          var reader = new FileReader();
          reader.onload = ()=> {
            s._$log.debug("OnLoad of index: " + index);
            var img=reader.result.slice(reader.result.indexOf(',')+1);
            s._cameraService.insertPhoto(s._currInspection.proNbr,img);
          };
          s._$log.debug("Reading of index: " + index)
          reader.readAsDataURL(photo);
        })
      }
    }

    getShipmentDetails() {
      this._inspectionService.getInspectionShipmentDetails(this._currInspection.proNbr)
        .then((data) => {
          this._shipDetails = data;
          return data;
        },
        (error) => {
          this._$rootScope.toast("System error. Please contact support.", 5);
        });
    }

    getInspectionDetails() {
      this._inspectionService.getInspectionDetails(this._currInspection.proNbr)
        .then((data) => {
          this._inspectionDtls = data;
          this._dimensions = this._inspectionDtls.inspectorPieceDimensions;
          if(this._dimensions.length < 3) {
            this.addNewDimRows(3 - this._dimensions.length);
          }
          this._addDimRowDisabled = !this.isDimRowAdditionAllowed();
          return this._inspectionDtls;
        },
        (error) => {
          this._$rootScope.toast("System error. Please contact support.", 5);
        });
    }

    cancelDialog() {
      this._$mdDialog.cancel();
    }

    /**
     * Prompts the user asking if they would like to Submit the inspection or continue inspecting
     * @param event
       */
    openSubmitDialog(event) {
      /** TODO: REMOVE TEST ARRAY OF PHOTOBYTES WHEN READY */
      var vm = this;
      vm._gallery_images = [];
      vm._gallery_images.push(
        {"Id" : "123", "ProNumber" : "122122323", "DmsOpCode" : "N", "PhotoType" : "I", "PhotoBytes" : "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTEhMVFhUWGBkYGBgYGBobHRsYHxgXGBgaFxcYHSggGBslHhcXITEiJSkrLi4uGB8zODMtNygtLi0BCgoKBQUFDgUFDisZExkrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIAOEA4QMBIgACEQEDEQH/xAAcAAABBAMBAAAAAAAAAAAAAAAEAwUGBwABAgj/xABPEAACAQIEAggBBwcICAUFAAABAgMAEQQSITEFQQYHEyJRYXGBkRQjMkKhsdEIUnKCkrLBFRckM0Ni4fAWRFNzk8LT8VRjdLPDNDVkg5T/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AeeqfgMc2EdmsWEjIDzAyqf41KT0OhA+iKaOprFWwrqR/bGx9VU61YpW9BG/9EIDrYbC1cN0Lg/NFGY3jYgxSxTFUhkjLJIxCjtFPeQk6XIII9DTpBjYnAKSIwOxVgb+ljQRw9DsOCLgC5sPM0P8AyBh2uqAFQbE+JGhHtUxZAbXG23ly0oZMIqiyiwoIy/RaJ4h3BmTcDmL8qJh6IYe4OUbXGlSGJbUnJNkOuo/ztQR6TodDckqDck0pD0QgKgZRYXqT7imjj/FDhRFIR80ZAkrH6itcK58AGyg+tAC3QuD80Ui/Q7DjUqAOZqQ4bikEn9XNE/6Lq33GiXUMLGxBoIhL0fwytkQAtYZvIHb3NdQdFoSrx5Rrqp9qkzYVcxYDVt/urcaUEZw/RCAqLrbW3vSuI6Hwk3yjYAeQFSCdsuvjypWGQMLigjMHRGHvDKNbfClG6GQH6op243M8UEksSZ3RSwX862pUeZANccO4/hplVo54iWUNlzrmAIB7y3uDrsaBoboXB+aKRl6O4WMLYKWa+UeNtz7VL1YHYg+lDvg0uDYaCw8he+lBGcP0bhD6oLMCD6natQ9D4RmVl219R5VJxHrXUu2bmKCPS9DoMqgKLDX3POuIeiMIb6IGhqS4acNe3L/OldsnxoI5/obBb6IrhuhcH5oorgXSaKRMs7xxTq7RvEzqGzKxFwpNyGFmHrT4kqt9Eg+hvQROToxhYwWawtYH1OgHqaCxXCI0ZJAguD9lqms2FVtwN83uBYGmfj0dgvrQM3yqsoe1ZQD9Taj5JKefbH91amPHxOIGaF7MoLZbat/dzbj2qFdTfZjDSEkBjLbU791beVWZagjksb/I2do1ZwubLJrsLkAm+u9D8GwEfZq4gRCRewUAi/oKlJQWtbSkXhA2oMws19DuKXIoFY+8OVqKjluSDvy8xQc4uUotwCdtvM0krBtW5aW9gf40VIwG9/hQeJaMkFtCNibj40HcsTshCPkJ2Ngbex0pm6OiaSNzMveuy2Ykg6kA68iB4c6kUZFhbUeVbAoIZwXCJIXZ8PGjhipIQa5Ta4Ntqk+Dky2TYcvwpZoANhah5Ir0B9cPoCQL6bUmstiAdtr+fnSzG1ADFPnAzCwtfX1tal0U65TbTTn6aUniWjZbPcD3/hS2GKle6QR5UDBw8Yg4qSOUlkXKVfkwIJIy6AW0GlBSYRWxciSYeLu2ZXCDZrm17b6VMbc6TkhB1trQA4O0egACncAU5A0HLHXaMUUcxz8qAnLQQxJJKlSBmy/40aDzpGSVdQQbc9KDmNRpl+Ipk4p8pGJjUMXjcNt3chFgLgb3udyaecCEAyoQbcr6j2NFEUEV6R4cdtEjQRSI/wBYqCwKgatcba05YOBYtUVV8gANKdpIgdxtQ8kdATG4IuKaekY7q+tGQAqCRz5UDx6QFFPnQRfMfCsrXbjxrKBp6rYy2FkA/wBt/wAq1aMMhC2sSwA9/eq96oomGELZSc8zajlZVGtWBhSczXFhoADvzuaADFYzGqe7hopF52nKsPjHZvspeLiTk2eB121urD7Df7KcqRmtzIHqaBDExszKUYZdcw+61bn0seY1FIJi4gxXOuYb6ilZ3W98y/EUBSSZluB7U1Y8Mb7D0/Gio8WiDVl1Omo+NaxcqZc6kNtoCKDfDbogU3PMffaksdiMWusUETi/0WmKEjxv2ZA9NaVhkJdbWsPpH2NhRjSqNCwHuKBsh4pNYdphXU88ro1j8Rf4UViszp82QrXB18OYPhSryofrL8RQkuJjRgC63O2ooFpEsvepXDTZh5jekZJEIHeW3qK1CwW7X0t8fSgTx+bwA+2kuFKUuTseX8aOJWRbjXy/hQM+LCIGciO/NyFCjmTegJx0s4B7GONiBpncrc+HdU29aEg4nif7XCZTf6kquLeNyFrtek+CJsMZhifDto/f61Hw4hJBdHVh4qwP3UCaTZ0OhRiCAGtcH2Otc4eNgvzhF+ZFZiyqDMxsL29+Vb7ZSpGZd9RcUHWElH0fh6VzjS1tAPU/hSSOoYHMunmNqVTGRvcB1+IoG/AxsJM3h9vlTnPLJYdmgJP5zZRb2BJoRZwM2mxsNRrRmGmGUXdb21sRvQNkXEcYCRLhFtrZo5g1/wBVkW1/U0fhsZn+kjJb8632EEii9xQ+IQAEnYan0oEsPC4LZiCLnLbw86bONuNBa4J+2nbCyqwuuxGlNHHksF96Bi08PsrKS+UDzrKBHqgN8HIv/nH91KnGGck2YhlDaHmCPMfCoT1NQH5JMwP9qwHrkXX7al0eDyjumx8fH1HOgK/lFhfNBKCPABgfQg1W3Wl0Ux/EZYJcKqqI0dWzvkNy1xp7c6taMnmPD7q2woPNc/VLxhmLMYrnf5633CmnpL0Qx2AjjGMYBZGIjZJM1iLFgfKx+NepMlzVO/lISDscKo5SSX/ZXSggnC+gmP4hEMRhcoi+gA0tj3dNvMWN/Oi/5pOLjS8f/Gqx+qJi/CYXQ5SkrB/QEAX9gKsg4cMwa/LUeNBXXVN0axeASePFFG7RkawfP3cpHsdarbrllccVmAz2yRkWJ+jkGp89K9BPg+8zHckm/MDkL+Qrzx1ySMOITAm+igm2uiDKD8TQbwPVbxeQBgoAIBGaUjQ7ab0VieqfjLWzGLuiwtL/AIV6J4b/AFMf+7T90V0y0HnbDdUvFwCD2bK2/wA/seRGm4q9ujPDmgwOGgmALxQoja3GZVANjz1504TyhLAbnb8TQrlnjdBoy/RtppbSggfWl1hfyaohwwU4mVb67RpsGI5sTew20J8jVvR7oxxXijDENISjk2kxDXVvzgiG+ZRtoABtQHWe7PxWcSEkho1v/dEaAWHpr716TwfD4+zh7MDsliQRgAWC20K28dKCnsd1MYoLdJYmDXJCRtZTzABN7Hl4VGeI9AOLYMtJDHLlXXPAWB055QQ3wBr0zggwuNxcW8R4+vKjKCq+pDj+JxmHxC4yRpTDIirnAzDQkhja7G67nWojxnqv4rJjMRPD2ZjknldQZrXRpGYAjloavSLh8UbyPHGqvKQZCosXIBALW3Nja9LSFUXMf8+QoPPv80fFAjgCPvG9zPqALWXbmfuFV7x7h+Iwc74eZrSJa+VyRqARY+9evIpyzFTswuP0q8t9aqFeKYkPqQy/uragel6quLgZ88Y2N+38dqNm6seLkFskWa1mCS2zeDW2v4+NXy+DvHGNwLEjxOWwpTCRlW0OljofsseVA2dG5pIcHhoXhk7RIo1fTTMFAPeJtvT6HJHeAF+W/wATSwpOQUCCxgWy2FtqC4+BkUsKcQgtc8qY+N4m+Qgd3Ue1qBiuPCsrOx86yg56l5V+SSDY9s3v3V28/wAKsBkvVcdTkP8ARZGPKY2/ZSprxviMkMLSqgYKCzHwA5hfrfEUCycSQYj5Mbh+z7RfBlzZTbzBI+NH1E+KRRz4YYmYSkxglWiZo3VSLtYxsGtYai/Ks4Hh7RqyT4hlIuO0kLaeZIufeglEsINjrob6fxqkfyhcEIsPhANbyykk8yQpP31dsEuYefOqe/KV/qMH/vJP3VoHnqCUfyUPAyyA/EVYgcKbHS2x8vOq76iZgnCFZtu2k+8VYDKJNeQ3+/8AjQFst68ydc4I4tMCO6yxi/nkG3xr0lLI4Q9moYjYE2+2vMfWRj2xOPxEkgORFF1tYB7CNeZ+tbnyoHCPrk4mihFfD2UAD5vkNB9ai8P1wY50YSSwrpusYv6C7b1ZvROBWjVo5sVawBV5WYBgACBnuQPK9TTBPplOpHM86DzRJ1v8R7RnHY9628d7AaAb16C6HYtp8HhsRJbtJIY3awsLsoJsOQp+Kjwrk2UEnYa0FN9dHQOSST5fhULkqO2RQM3dHdkQbsQNCPACoXwXrIx/D441jKSwEG0coJyEGzKpBDLryNwPC1ej+1WUC3he/ltTVxbong8SCJsLFIdTcqAxNvzxrfzoK34b17LbNNgXUbExyBhy1swFqm3AutHhuJYIJjE7WssqlL38H+gfjUQ/m0wU80uGCzYYrlzLG+ZbEEg3lDXHkLVXfTroBJg2mMLtJFFYsrAhlRjZWtchl86D1MLU3zcNBKG5OQG1/Em5JqovyfumErl8BM5dVTPCTqVUEBkufq6rYctau6gCWEXrzL1yG3FsSwtuqkHx7Na9S5da8p9cUl+L4q35yD4ItB6nwbhkW2ug+7nXTR8xyobBR5VW25Av8BTZxHjMqYhISgUOCVI717Wvc7Lv4Ggc+C8TTEwrLHexLAg7hlYqwPmCCKNtUJ4zw2GPEKFbEwvKc94ppFRn0LdwHJc6X7utSDh9493kcf32v77UBWM4eHBBJ1ZWIv4bD0vrTVxuGyrUhBpn6Rjur6mgi+WsrXaVlAh1Mwn5NI2bTtSLfqrrVjSRhgVIuCLEVVHVbf5NIV0Pbbj9FatSOfugtvzHn5Cgx8MpQx27pBBHkd6HTCKgsosBQmK6Rxxm0kWIAOzdhIy+5QHL+taiYeLwOcokFzpY3B8RoRQYgIYW/wAiqq/KMcGHCeUsn7gq18UzKyhVJDXufD1qruv7hs00WE7GGSUrJIWEaM5AyrvlGlA7dRQB4SA1rdtL+8DU+lguQUa3iBbXS1QnqWwTxcMCzRujdrIcroVaxNwcrC9SbHm+yn1OlA8oNK839bcqxY7GoEW0ixDbayBrj3N/avQnDZj2YznXxPhVAdb/AAjEz8SlaHCYmRMqDOsEhUnIL2YLrQXrwfh6JDHlFropPqVBNLumum/KvNv+lXSBAFD4wACwHYnYaf7OihxzpLlDg44620w7X/8Ab286D0okuoB3tSjedeY24/0l5jH6f/jt/wBOvQfRCeSTA4ZsRm7Uwx9rnFmz5RmzKQLG99KBr4f0rwc882DSTssRC5jyNYZwG3jJ0YG2w1FSqFbDXevPPWV1Z45sZiMVAiyxyyM4Cmzi+tirWvbyJpq4D044tw8NFK06raydtGWysNvpi+U7aHwtQemlw6hi4HeO58ah3WnLBBw/FyyWDSxNEvizMpRQPS9/QGqobri4qwyp2RcnQpASftYi9/KmZ+E8U4tOrYt5FA07SdWREBNzkQLz8hrYXNA59QHDmfHSTW7kUJBP95yAo+Ab4V6LhlIAzfH7r1H+hPRnD4HCCLCntPrM/OR7WufDawHKnrDszr3lsTuDyoDq8qdcQX+V8X6ra3j2a16kwsgIy3uR91eautro/i5eK4mSLC4h0JWzpDIynuLswWx9qD0hw2Iqi3N+6Nfal5MOrMGI1XY0y8IZlYclyi49vDxp3xGLCjZmPggzH/D3oOcXglcqzC5S9vK+/wB1JvFQcPSeAkqyzRkXuJIZF23sxXKfYmnDDYqKX6DhreFBzhnIBvty/jQfSBropomCRyWDKVsbDzHiKbuNWACX3Nx5eIvQR+4rK57Bf8mtUAnVEoGFYt9aY5fOyrerEwsl2aw2tr566VAuqGUnBOt/ozNbQaXVSfvqb4eYk5SMpB3Gx8QRQOFISxXpFeKwm/zqC24YhSOWoO1KYfGq/wBG58xt+1tQcxm2l9fCsxKXNcPh1zs43a1/bypePXQ7ig4wzZV12vpSeOQAZm20rvF4cEC5OnIG1aU2XL8L6/fQcxSDOgAvv7Cx/wC1HU2idgcrDcXzjceFxzpc8RiVsjSKrDkxy30vcX3FAvIl6HAynU28BW4uIxsbI2f9HvfaNB71rFQKzKx3W9tfGg7nBIFcYXQnwtrXcR+qfaupoAVtcjnpzoOcSgYX5b0KswCDLrfYeNLYYZLgE28zekmlZbd0Mt7aWBHpagcFjA2AHtWOtCNj40sJHtmuQW057X2uLitnicV8odWPgpDH0sutBjJbW9hSjm6mucXEsi2YHcHwOh8q1GcvpQJxJZhRL2YaGtmIWOu43oWGII1wT53NAnE6rm120Pr4UdhjdFuLabUJPIwuwAI3IIFdrjFVc7kqugIP1T6jkaAxhehpYue3nXDcVhAB7VDfazAn4XpZnDqQQbEEa6f4igyN9NDfSmPjiWC+pp1giyABb2HvQXH0BRTewoIz2g8qyueyWsoEOptD8kmNtpSR5nItS+BJFF73O5B8d9DyqG9V3FYsNw2WWZ7Is3e0JILCNRoNTe4o1+tjhH/iT/w3/CgnYVW3UX0vce9byAbaVCIutvhR0+UG4/8ALf8ACpxG4ZQw2IBHodRQIlbm1ammyi17nlTN0m6W4TBMoxE3Zm2a2VjddRYWG9xTb0R6UYbHNJ2M/aulmbulbBi2W1wLgWtp5eNBIMbiWyxuguGIBHh4/wAfhRDwEvp9Ej4VkOHGUqdj9hpaE62O+3rQNpjfOzXtrYDcZRoNKcMOQyjMovr57aaUzdKulmDwGT5VLkMl8oylibWubKNNxQnRvrA4fi5Rh8PPmkILAFWW4Fr2LC19dvWglIiUbAD0pNxRFJTRkg5TZuRNBwzZBqf+/lQk+JZo3K/STl46Xpr6T8XiwYOIxkuSLMqILX7xBOgAuSbMfQU2cC6w+GzzpDDPeSU5QpRgCbE2uRblQSlVZkRhoT9IUlioWzixICjS3Mne457CjI0Cd3Ycvwpd0vQC4RyQVcDca8jfy5bfbRIhUagAegpGaZYlLuQqDcnYaga/GiHkABYkADUkmwt60CUlaUZRmJsKiuP6y+GRvkGIErbfNAuL/pDu/bUS4j1yYMOsbCcqt85VVsSTp9a9h95oLSTFZiVG9rr+FDYNneNrizAm3mBUQ4R1n8KmZbYnsmH+1UoPTMdPtqbwyRsO0jYMj65kII9QRoaBDGQtlUbXN2IOthsPj91KYR2Bs2osdeeniOdH2uKgk3WnwqN2U4ghkJVh2b7g2PLxoJwIU3yj4CscVCx1tcKtf5Qbf7t/wrF61+Et/rB/4b/hQTGNDvTPx7Eg5RuCSL+dt6j+P6yMASIkxVmkdAoEbXAJAttuSbelPfGYMqqPOgYuzasrrXxrKBk6uuBpi+HzRSlghnB7psbr2bix9VFQjrg6JYXhzQNh1e8pkLBmvsVtbSw3qyepot8lkFhl7U6+eVaj35SDL2eFUjW7kHwtl/GgZ+jHQDDY7h0eNeU4eQs6sbZlYBmUDKStjYDW9W5wXEYoIoeSFwAACqMtwNB9Y8qYOpzCCTgUUZ2ftwfeWQVL8Hw4RIEGyi1BSX5Qz3xeHI27E/HOd6ifQ7iMvCeI4aWS4jljiZ/BoJkVgf1c1/VCKk3X6+XGweBh1HlnNOHWH0ZE3BOHY2MXbD4WBZLc42jj1P6LfYxoLzVlyg3FjqD4+FIYlcx0OnPyqB9TfHlxvDxh3PzmFyxnXUpvE3wBX9WluuDpA2AwDiJrPiD2Sm5uLjvMLeCg6+JFBTnT7iz8U4jNJGGaKBHVWAJAiiDMzm22Y3PuKL6oMOMTjSoPYtDA8qSgXKsskNiRcXFiQRfZjUr6vOjog4BjcTIvexEMpHj2QQga+ZBPwpo/JyC/LZrjvGBrfoh4s37y/CgtvheOxbXJxGHlW+hWJl+wSEVJcLNmGts3O1NmA4MsObL9Zmb3JvpSs8wiBkJsqgsx5WAub+1BSn5RnHs+IhwSnSJe0f8ATfRR6hdf16gHHOCT8LxUBb6YSHEIf71lYj1VwV9gedP3RuL+WOOLIwOV5TPIp5RpaynxFgi+9WV+UFwYPg0xQQFoWKMeYR9j7OF/aNBYHDuIpisPDNEdJUVx6EDf0OlHQtkWxubX1389tzVU9QnGWkwUmHBBkw7aAn+ykYtcejB9PMeNW1ANLnegj/EuM4eeOeGUWjyMspc2KqQbkruNNeRrz10h6X4/iMiYKKR5Ylbs4kAytKBorzAHvMQLm+g19atbrgxkWGKad7E5mktzSJQqj9qRT+qaaOofooojkxxFyztHFe1wi6MfUnT9XzoO+h/U1GBmx0zFyP6uKyqPEFyLk+lqkr9THCT/AGUt/HtX/iamTpai4JrgX0P30FL9IeoRbFsFiSDY2jmAIJ8pFtlHqp9abepzh+LwfFJMJie1jHYSHs8xyMwaOzKAcrbnUeNegKC/k5Q2cAZgSQTyvuAdwD/Cg6wylb3ub15U4fCkvE2gYaS4h0J00BdhcAjevVuEzEXcAHnXmTgrLJ0ghIW18XZh4kOQT72oJZj+puKNxGmPNzY5HiFwOfeDa/s0dw/qVhuO0xcv6qIBfluDVrcV4Qsskch3jvb3tz9qUaC3KgrjD9R+GWVJflc5KMr6hNSCDrYeVT3pGui+ppxwspsQ3LnQPSL6K+tBFswrK1kFZQNfVRi2TCyZT/bbW0+itM35RHfXBEDftP8Alp+6ooQcNITt2x/cWmjr8hVo0O7ItxvpeRAdNjp40El6mcdCvC4Y+1jDBpu7mF7ds9ja+xqf6HY1XfU9wuCXhGH7WGNyGmALIpI+ek2JGlTMcIiQ3RApGulxt6UFFflGJbG4f/c/85q2+ieEWThWEjcBo5MHCkgOxVoVH8aqf8oLEEYzD3VW+ZNgR4ufCrg6KRkcPwSn6uGgBA8eyW9BRvRjEPwbjPZSkiPOYZDcgGNj83J57o1/AkaUr1g8Qbi3GUwkLExxMYVIOmhvO4/ZOvPIKlPXz0eDYdMao70REch8UJsh9ibe4oXqE6L2ikx0g+mTHET+aD32Hq3d/VNBY3HkVeDYiNFCrHhXQAaaCMgWHpVR9Q88cXECHdVvhpd2A1MsJA152X7KubpSi/Ip0P1oJRbXX5tjyqlOoTCpJj3SWON1OGkNmRWF+0gsdR60HotJFYd0g+hv91V714cZ+S8NZV+niGEK+SkFnP7It6sKmJ4Fh1+jEq+GUW+6qC68ukjSY4YVSGjw6gEEXvIe82u+gyr8aCR/k88CKxT423eY9kn6C2Z/YnKP1atzpDwtcXhJsO200bLfwJGh9jY+1edeH9ZGOweDw8ECxItnOXs/qlzYm53JzG/nRvCOt/iRZkYxC6tl+a0DgXF9dtDQM3VfxZ8BxRY5CUzs2Hk8mLWX1s4HxNemOFYxnuG3Gx/GvHvF+KST4h8S4CyO2c5VyjNpqBy1F69UdDeLpicBBib6ugL25OO648fpA0FZ/lESAYnDgkf1JsL+Lm/7o+FWH1Q5BwjCAEXKEkXG5dt6hH5Q2ByNhMQFBBEsTEgHvHK6b+Qf4U5dRww+I4eVMadrDIyubAEg95G08iR+qaC0Z0ABJ2AvUJ6RdZmAwknYzmUPlVhlS4sdtb71L4I+zGVNvA3P31E+lvVpgsfI083arIVVAY2UABfAFTyJoAYOunhpG89xvaL/ABo/o91jYLHTGHDtNnCF++hAyggHW511FRPiXVHgMNFJOHxJ7NGaxdLGwJsbRg296inUhh7cXlQEHLBKARzGeOxoL7wOObtMrG4PO23+FeWpsI746VY/6wzShO+E7xkYCzsQFOu5Ir1RBCBc86878Gw6rxvBZRo8oc87sZJbnXblpQIR9CeNyf1YdvTGwn7p6U/m46Qf7KX/APqi/wCtXouTgOGJLfJ4gxvchFBN97kDWuoMIsV+zFr8rm3wNB524P0F432yFo5MqSLn/pMewYZrjtddL1fnGycoXz09Kd05mwvubCmLjgPdJ3uaBg7E/nGspT4/GsoBuqSxwR7l2SZudr3Vd6i/Xw6/0Yqcp+czo27LdL2PO1r28q66PcDlxvBsVhoSqu0ysGckDumJzqoJvZdNN6jC9TvEu65mwxtrq8pt6jsqC2+pP/7RB+nP/wC9JU37VdNRrtVAfzK8QObJLhFDa2WaYAX1AA7Gr04dgBFGqgC4UAne5sL6nUigoP8AKJBGPhN/7K48u8aunoQ2fh2CJ+l8mgv69kutQbrX6usVxLERS4d4FVI8hEjODfMToFRhb3qwejuDOFweHhky54YYomK3sSiKrWuASNPAUBmKhawCkAenOscZo8r2PpptqKSx+NC5DurkWI87fjXcgbNl5HY0DH0wmX5Fi7dx/k8mUnb6BtryqpeoEj+U3/8ASyA+R7WC4q2elGEkxOHxUCZbyRPEma4sSpW5IB0v5VD+rLq4xGFxXynEPCVMDRfNSSBi+dO8QUXSykHXe1BZ/F+Jx4eGWaQjLEhdvYXt6mvNvVxw/wDlDjEcrEsVLYqa40zBgQFvyzstqujrE6IzYvBth8G0atIy9o0zyf1a3aysFY3LZfa9NvVR0Ck4Yk5naNpZWUAxliAijQd5V1zFuXhQWBGb6HflWpYDlOWwJ39K7XQXa2nOkMVjLRlxrl3FBXPXXwcy8P7YqrthmzbW+bYZHHscjfq1H/yfePrkmwcpPcYSxHffuuLeRyn9Y1bPEsOs+HZGF450ZGHOzKR7b1UXQ7qy4hw/HxzdphmVfpjPJ3o2uCAOz+kBra9rga0Fq9Nejw4hgpcMxUORmjbwcG8behtY+RNec+inSPEcFx7Z0Oh7PEQnS6g7g+I3U7G/ga9Nph45gA6nMm2pBF9dGB20+ymHpf1bYLHi8gdZeUqsSw8jmuCvl8LUBvCOk+F4hEGwmIXMbEroHHirIddr+VPkVxodv41574x1G46NicPLDMvK5Mb+4Iy++ahV6uePHuHtCu1jiRl/foLs6f8AEIYcDiRJLGrNC6qrMLlipsAu5NUp+T21uKN/6eT96OnPhHU1ipM4nniiAGgUmRypa7X0C623uasDoH0FwmBVpsOJHmF0Z5G1y3GYKq2UDQeem9BMJgi5rqcrG5IP8PCvOPRmVV4zATIpT5USpOmX5xyytfa17+9ei8W7BRlGrnmNABqb+u1UdL1QY55Zu/hMsrM4zPKLd4sCCIjY2JFBfR4xhxvPD/xF/Gk5uK4cqQMRCCRv2iafbVETdROPP0ZMGP8A9sx/+Gh26iOIj+2wf7cv/RoL2wvE4VABxETHY/OJr6C9c9IIrqtvOqT4X1I8QSaOQy4QhHRjZ5dgwJt81vpV2dIJBZU23+NtqCL/ACfzrKy/lWqBXqXT+hSabzNr+qgsf886m7wVXvU0zDDSW27Y3/YSrEnxkaC7uFG2p3PgBzNApFb3510RUa4g0wnXFYZe0TszHLGz9nfUMjqWG41B8morAcdkcd/CyRnn30YexB1+FA6vcEWF7nXyG96bojI5LOLbgDwFza/nandTeuHSgDiw10yeGqnwoqE/gfI/hW0XSh8Tmv3d6BaSDnW4QBpz1tWziFC3ZgoA1JNgPc0x8cLTCN8I15YZA4BJVXXVXQt4FSbHxAoJCaRmBAJAuRsPGmTCdIJmJEmDdbc1kjYfG4+6n2CXMoNreR5UDdiHkeQqRZFtY+JtqfQbUrh4LFgfovuPPajnWuETegSw6lRlJvb7R+NKyxX1pLF7Ajeu8PIbDMdaDUaAb/58KIpm4xJHiYZYI5bM6lVdNcr/AFSG2uCAaBwvHcWmWOfCXYKAzxyoQWFgTlaxAJuaCSMlN2LmlOVAlgQSx8BfQD1ozB4rOPolT4G38DS7CgbYoiGDDcC3tREcWQkA6NqPWlgmtamHdNB06XFJLHY/ZXOFkOubblWT8QiByFgW5gakettvegKXbTatMt6iWAxWKwaiFoDPGHbJIJVD9mzFlDI3NQcu+wFSHAcQMmjRsh/vFT9xNBrGTyKpCJrmAW/gfpN7ffTNxaIhUvvepORTL0hXRfWgjec1lZWUAnU1L/RZUsf60m9tPorzqc8Y4Ws8LxkAMVIDc1J5gioB1SY7s8LJcAjtjz1+itWcjAgEbGgaJeD3wjQ3JbKbG5BzWspuPauOHYJo41VzdgNT4mnyuHS9AJh5cpsdjt5UdQTAKRm35Cu0ezeTfYaDvGRFlspsdPvpAsUIBBOY6EDbQb0Y9+VA4rFsm4B9dKAk4dWWzKCDyNNnAeCdgjozFgxbcnYkm19/KnPB4gOoYaeI8D4UvQRzg/CXhDBiSMzFbm9lJNhfnYU5xuUPlzo5lvQsyAasbCgLU31FakW4IGlxvQpe1mG3MeVFHUaUAAVo1DNd9LGw53GtFRqGGo0I2NJYiZlHI+tZw/GCQEWsRyv9ooAcFwMR4mSYHuvlsvIECxIHK9IDhDLiZJATkYCy3J72uY67X0+FSGtMKBuAKm43o+GQMLikZo+fKkwQRdTtsaA2gfk7gkk5hmvby8KLikzC+1Iyuy8wfag1hZM4BsR5Gm7H8BV545l7uUMGA0zXtuNtLGi8Hj8z5CADyIOh8qcKBi41wlnmilQkZbh9TYjTKLbUV2VqczSMkVBrDTZhY7im7pEO6vrRaFdQDc86b+NSEoARqD8fA0Ea7PzrK57/AICsoG/qlw+bDSeHbf8AKtWXEN1BsBbbeqq6uekGEw+FyzT9m/aszLYm4IUKR8KnOF6UYIKZhiEdSQpIOq62XMu6i53tzoDMT0eRjmWbEo1t1nk156gkg0rHhJUN+3kYX2YKfttehW6ZYEf6zH8T+FcjplgGNvlMf2/hQOborkMy6rex9a3iTyHxqOTdNsGsjKZ48otYqb3012oiTplgCof5QljpzuD5igkGHcsup12NAYvC66c+f+JpoxfTTBx2AnUkgMffUCsl6cYB0/8AqVRtORJ+6gkGFTLlUG1/vtSON4IkupknVr3zJM6nw0CmwHtTVgulOCkOdMQjlATk2bY3IB+kbeFFDplgbA/KY9Rfc/hQLR8MkQWXEzGw+tlb4lluaKkUSLkkGbY321HPypsPTXAbfKU+38KFx/TLBoyWxEZUgkkG5HhoKCQy91Rl51rBudVJ22pji6Z4F1J+UJ3RqNb28R40nJ0ywSIHE6nNcD23NqB7x2H56n11rjCQ5BcaHxplw/TzAspDzqptvqf4Vzg+lWBkKx/K0Jv9bu5j4XOntQSHHcMWUEO0mot3ZGS3pkI186Ei4K0f0MTiLXv33D+13B0pP/TDBC4adFKkqQdwQbH/AL0m3TXAf+JT7fwoHONmC5HOe+l7AG3oNK7jiVEso22FMXEOmODWPOmIiJuBbNrbnpvWYXprgXOT5Ql9xe4v5a0D1hpCG12P313jILjW5+74UwjphgbM/brZOXiTsKRw3T7BE2eZbcj/AIWoHnC4axLc+VGSYYSKMzNbeysV+1SCfjUYHTLAZmHyxRmOhINgPC/L1NOY6UYKP5szotlBBvcMp2KsNDtQdx9H8hJjxGJA17plLgege9qMgzpfM5kHK4UH4qKbm6aYAf6zH9v4VxJ0vwJRmXExXAJFzbX3oHiDDopJC2zXY+v8KZ+OSHun7KDwfTvBEAPOgJ0O9h72ofjfSbCMQiTKzC+3p40A9bpu/lBfzxWUFR1g39vwrKyg1WVlZQbFZWVlBtt61WVlBnh61qsrKDK2K1WUG62eX+edZWUGqxtq1WUG23rVZWUG6ysrKDfL3rVZWUGVrkP886ysoMrKysoN1rmKysoD6ysrKD//2Q=="},
        {"Id" : "1234", "ProNumber" : "123456782", "DmsOpCode" : "N", "PhotoType" : "E", "PhotoBytes" : "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"}
      );

      vm._twmPhotoUploadService.upload(vm._gallery_images)


      /* COMMENTING OUT THE REAL CODE TO EASE THE TWM INTEGRATION TESTING
       *

      var vm = this;
      var contentString;
      var locals;
      var minNumPhotos = 3;
      var dialogArgs = { "dialogTitle" : "Submit Inspection" };
      var confirmHandler = function() {
        vm.submitInspection();
      };
      // ENSURE ONE FULL DIMENSION ROW IS PRESENT
      var validDimFound = false;
      for(var i = 0; i < this._dimensions.length; i++) {
        var dimRow = this._dimensions[i];
        if(this.validateDimRow(dimRow)) {
          validDimFound = true;
          break;
        }
      }
      if(validDimFound == false) {
        // NO DIMENSIONS
        this._$rootScope.toast(`You cannot submit an inspection without at least one line of dimensions.`, 3);
      } else if(this._dimensions.length > this._CODE_CONSTANTS.MAX_INSPECT_DIMS) {
        // TOO MANY DIMENSIONS
        this._$rootScope.toast(`No more than ${this._CODE_CONSTANTS.MAX_INSPECT_DIMS} dimensions may be provided.`, 3);
      } else if(this._gallery_images.length < minNumPhotos) {
        // LESS PHOTOS THAN RECOMMENDED
        contentString = `You have fewer than ${minNumPhotos} photos for this inspection. Do you want to proceed anyway?`;
        dialogArgs.dialogContent = contentString;
        dialogArgs.dialogConfirmTxt = "Yes, submit";
        dialogArgs.dialogCancelTxt = "No";
        locals = vm._dialogService.buildDialogBindings(dialogArgs);
        this._dialogService.confirm(locals, confirmHandler);
      } else {
        contentString = `Are you sure you want to submit an inspection for <br/> Pro# ${vm._currInspection.proNbr}`;
        dialogArgs = { "dialogTitle" : "Submit Inspection", "dialogContent" : contentString, "dialogConfirmTxt" : "Submit Inspection" };
        locals = vm._dialogService.buildDialogBindings(dialogArgs);
        vm._dialogService.confirm(locals, confirmHandler);
      }
      */
    }

    /**
     * Performs the remote service call to submit an inspection (assumes the form has passed validation)
     */
    submitInspection() {
      var vm = this;
      var contentString;
      var locals;
      vm._$mdDialog.hide();
      var reqData={};
      reqData.currentInspection = this._currInspection;
      reqData.inspectionContext = this._inspectionContext;
      reqData.inspectionDetails = this._inspectionDtls;
      reqData.inspectorPieceDimensions = this.getValidDimRows();
      reqData = this._mappingService.mapCreateInspectionRequest(reqData);
      vm._inspectionService.createInspection(reqData)
        .then(() => {
          vm._$rootScope.toast('Inspection submitted.', 5);

          //TODO: Trigger the inspection photos upload here

          vm._$state.go("list");
        },(error) => {
          vm._$rootScope.toast('Failed to submit inspection. Please try again or contact support.', 5);
        });
    }

    addNewDimRows(rowCount) {
      var iRowCnt = parseInt(rowCount, 10);
      if(typeof iRowCnt !== "number" || isNaN(iRowCnt)) {
        var locals = this._dialogService.buildDialogBindings({"dialogTitle" : "Inspection", "dialogContent" : "A valid number of rows must be provided."});
        this._dialogService.alert(locals);
      } else if(iRowCnt + this._dimensions.length > this._CODE_CONSTANTS.MAX_INSPECT_DIMS) {
        var locals = this._dialogService.buildDialogBindings({"dialogTitle" : "Inspection", "dialogContent" : `No more than ${this._CODE_CONSTANTS.MAX_INSPECT_DIMS} dimensions can be provided.`});
        this._dialogService.alert(locals);
      } else {
        // Add empty dimension fields
        for(var i = 0; i < iRowCnt; i++) {
          var dimObj = {};
          dimObj.seq = this._dimensions.length + 1;
          dimObj.pieceCnt = "";
          dimObj.inspectorDimensions = {"seq" : "1", "length" : "", "width" : "", "height" : ""}; // seq = 1 for legacy purposes
          this._dimensions.push(dimObj);
        }
      }
      this._addDimRowDisabled = true;
    }

    /**
     * Triggered when the user leaves focus on a dimension input (pieces, width, height, length)
     * If the dimension item passes validation then it makes a service call to persist the dimension row and updates the
     * dimension sequence appropriately.
     * @param dimItem
     */
    triggerUpdateDims(dimItem) {
      if(this.validateDimRow(dimItem)) {
        this._$rootScope.toast("Update dimensions!", 2);
        // Update status to "In Progress" if necessary
        if(this._currInspection.inspectionStatusCd !== this._CODE_CONSTANTS.INSPECT_STATUS.P) {
          this.setInspectionStatus("P");
        }
        var reqData={};
        reqData.currentInspection = this._currInspection;
        reqData.inspectionContext = this._inspectionContext;
        reqData.inspectionDetails = this._inspectionDtls;
        reqData.inspectorPieceDimensions = this.getValidDimRows();
        reqData = this._mappingService.mapUpdateInspectorDimRequest(reqData);
        this._inspectionService.updateInspectorDimensions(reqData);
        this.calculateDimDerivatives();
      }
      this._addDimRowDisabled = !this.isDimRowAdditionAllowed();
    }

      /**
       * Validates an individual row of inspector dimensions
       * @returns Boolean Returns true if the dimension row passes validation
       */
    validateDimRow(dimItem) {
      if(isNaN(parseInt(dimItem.seq)) || isNaN(parseInt(dimItem.pieceCnt)) || isNaN(parseInt(dimItem.inspectorDimensions.width)) ||
        isNaN(parseInt(dimItem.inspectorDimensions.length)) || isNaN(parseInt(dimItem.inspectorDimensions.height))) {
          return false;
      } else {
          return true;
      }
    }

    /**
     * Determines if a adding new dimension row entry should be allowed by checking to see if the last row index is valid
     * @returns Boolean
     */
    isDimRowAdditionAllowed() {
      if(this._dimensions.length >= this._CODE_CONSTANTS.MAX_INSPECT_DIMS) {
        return false;
      } else if(this._dimensions !== undefined) {
        var dimRow = this._dimensions[this._dimensions.length - 1];
        return this.validateDimRow(dimRow);
      } else {
        return true;
      }
    }

    /**
     * @returns Array containing only validated dimension rows
     */
    getValidDimRows() {
      var returnList = [];
      angular.forEach(this._dimensions, (value) => {
        if(this.validateDimRow(value)) {
          returnList.push(value);
        }
      });
      return returnList;
    }

    /**
     * Calculates the total volume in cubic feet and density for the entire shipment.
     */
    calculateDimDerivatives() {
      var newTotVol = 0;
      var newDensity = 0;
      angular.forEach(this._dimensions, (dimItem, idx) => {
        if(this.validateDimRow(dimItem)) {
          var _volume = (dimItem.pieceCnt * dimItem.inspectorDimensions.length * dimItem.inspectorDimensions.width * dimItem.inspectorDimensions.height);
          newTotVol += _volume;
        }
      });
      if(parseFloat(newTotVol) > 0) {
        newDensity = (this._currInspection.totGrossWeight / newTotVol).toFixed(2);
      }
      this._inspectionDtls.totGrossVolume = newTotVol;
      this._inspectionDtls.totDensity = newDensity;
    }
  }



  ngModule.controller(controllerName, inspectionInProgController);
};
