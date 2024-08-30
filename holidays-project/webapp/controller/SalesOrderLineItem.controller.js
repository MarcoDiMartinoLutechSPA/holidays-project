sap.ui.define([
    "sap/btp/holidaysproject/controller/BaseController",
    "sap/ui/model/json/JSONModel"
],
function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("sap.btp.holidaysproject.controller.SalesOrderLineItem", 
    {
        onInit: function() 
        {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteSalesOrderLineItem").attachPatternMatched(this._onRouteMatched, this); 
        },
       
        _onRouteMatched: function(oEvent) 
        {
            var sSalesOrderID = oEvent.getParameter("arguments").salesOrderID;

            var oSalesOrderDetails = this.getOwnerComponent().getModel("SelectedSalesOrderModel").getData();
            var oSalesOrderDetailsModel = new JSONModel(oSalesOrderDetails);
            this.getView().setModel(oSalesOrderDetailsModel, "SalesOrderDetailsModel");

            var oFilter = new sap.ui.model.Filter("SalesOrderID", sap.ui.model.FilterOperator.EQ, sSalesOrderID);
            var oModel = this.getOwnerComponent().getModel();
            var sPath = "/SalesOrderLineItemSet";
            
            oModel.read(sPath, 
            {
                filters: [oFilter],
                success: function(oData) 
                {
                    var oSalesOrderLineItemsModel = new JSONModel(oData.results);
                    this.getView().setModel(oSalesOrderLineItemsModel, "SalesOrderLineItemsModel");
                }.bind(this),
                error: function(oError) 
                {
                    console.error("Errore nel recupero dei SalesOrderLineItems. Riprovare.", oError);
                }
            });
        },

        onNavBack: function() {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteSalesOrdersDetail");
        }
    });
});