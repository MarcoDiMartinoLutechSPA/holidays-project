sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
function (Controller) {
    "use strict";

    return Controller.extend("sap.btp.holidaysproject.controller.View1", {
        onInit: function () {

        },

        onNavigate: function(oEvent) {
            var oTile = oEvent.getSource();
            var sTileId = oTile.getId();
        
            var sRouteName;
        
            if (sTileId === this.createId("businessPartners")) 
            {
                sRouteName = "RouteBusinessPartnersDetail";
            } 
            else if (sTileId === this.createId("salesOrders")) 
            {
                sRouteName = "RouteSalesOrdersDetail";
            }
        
            if (sRouteName) {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo(sRouteName);
            }
        }
    });
});
