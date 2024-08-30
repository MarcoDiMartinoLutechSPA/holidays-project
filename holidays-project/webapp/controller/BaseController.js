sap.ui.define([
    "sap/ui/core/mvc/Controller"
], 

    function(Controller) {
        "use strict";

        return Controller.extend("sap.btp.holidaysexercize.controller.BaseController", {
            onInit: function() {

            },

            fetchDataFromOData: function(sEntitySet, oModel, aFilters) {
                return new Promise((resolve, reject) => {
                    var mParameters = {
                        filters: aFilters, 
                        success: function(oData, response) {
                            resolve(oData);
                        },
                        error: function(oError) {
                            reject(oError);
                        }
                    };
            
                    oModel.read("/" + sEntitySet, mParameters);
                });
            }
        });
    });