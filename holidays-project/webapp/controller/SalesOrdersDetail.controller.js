sap.ui.define([
    "sap/btp/holidaysproject/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../utils/DateFormatter",
    "../utils/ColorFormatter",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
    "sap/m/MessageBox"
], 

function (BaseController, JSONModel, ODataModel, Filter, FilterOperator, DateFormatter, ColorFormatter, Spreadsheet, exportLibrary) 
{
    "use strict";
    
    const EdmType = exportLibrary.EdmType;
    const url_oData = "/sap/opu/odata/iwbep/GWSAMPLE_BASIC/";

    return BaseController.extend("sap.btp.holidaysproject.controller.SalesOrdersDetail", 
    {
        dateFormatter: DateFormatter,
        colorFormatter: ColorFormatter,

        onInit: function () 
        {
            var oData = {
                items: [
                    { key: "Delivered", text: "Delivered" },
                    { key: "Initial", text: "Initial" },
                ]
            };

            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel);

            this.loadSalesOrders();
        },

        loadSalesOrders: function() {
            var oModel = new ODataModel(url_oData);
        
            this.fetchDataFromOData("SalesOrderSet", oModel, null).then(function(oData) 
            {
                oData.results.forEach(function(order) {
                    order.CreatedAt = this.formatDateWithoutTimezone(order.CreatedAt);
                    order.ChangedAt = this.formatDateWithoutTimezone(order.ChangedAt);
                }.bind(this));
        
                var oSalesOrders = new JSONModel(oData.results);
                this.getView().setModel(oSalesOrders, "SalesOrdersTableModel");
            }.bind(this)).catch(function(error) {
                console.error("Errore durante il recupero dei dati dei Sales Orders:", error);
            });
        },

        formatDateWithoutTimezone: function(dateString) {
            if (!dateString) {
                return null;
            }
        
            // Converti la stringa della data in un oggetto Date, ma evita la conversione di fuso orario
            let date = new Date(dateString);
        
            // Estrai solo la parte della data (YYYY-MM-DD)
            let year = date.getUTCFullYear();
            let month = String(date.getUTCMonth() + 1).padStart(2, '0');
            let day = String(date.getUTCDate()).padStart(2, '0');
        
            // Restituisci la data in formato YYYY-MM-DD
            return `${year}-${month}-${day}`;
        },

        formatDateToCET: function(date) {
            if (!date) {
                return null;
            }
        
            // Ottieni l'offset per l'Europa Centrale (CET/CEST)
            const cetOffset = 120; // CET è UTC+2h che corrisponde a 60 minuti
        
            // Applica l'offset alla data
            let cetDate = new Date(date.getTime() + cetOffset * 60000);
        
            // Estrai solo la parte della data (YYYY-MM-DD)
            let year = cetDate.getUTCFullYear();
            let month = String(cetDate.getUTCMonth() + 1).padStart(2, '0');
            let day = String(cetDate.getUTCDate()).padStart(2, '0');
        
            // Restituisci la data in formato YYYY-MM-DD
            return `${year}-${month}-${day}`;
        },

        onSearch: function () 
        {
            var oView = this.getView();
            var oTable = oView.byId("SalesOrdersTable");
            var oBinding = oTable.getBinding("items");
        
            var sSalesOrderID = oView.byId("inputSalesOrderID").getValue();
            var sCustomerID = oView.byId("inputCustomerID").getValue();
            var sDeliveryStatus = oView.byId("comboBoxDeliveryStatusDescription").getSelectedKey();
        
            // Converti le date del DatePicker in stringhe YYYY-MM-DD con fuso orario CET
            var oCreatedAtStart = this.formatDateToCET(oView.byId("datePickerCreatedAtStart").getDateValue());
            var oCreatedAtEnd = this.formatDateToCET(oView.byId("datePickerCreatedAtEnd").getDateValue());
            var oChangedAtStart = this.formatDateToCET(oView.byId("datePickerChangedAtStart").getDateValue());
            var oChangedAtEnd = this.formatDateToCET(oView.byId("datePickerChangedAtEnd").getDateValue());
        
            var aFilters = [];
        
            if (sSalesOrderID) {
                aFilters.push(new Filter("SalesOrderID", FilterOperator.Contains, sSalesOrderID));
            }
        
            if (sCustomerID) {
                aFilters.push(new Filter("CustomerID", FilterOperator.Contains, sCustomerID));
            }
        
            if (sDeliveryStatus) {
                aFilters.push(new Filter("DeliveryStatusDescription", FilterOperator.EQ, sDeliveryStatus));
            }
        
            if (oCreatedAtStart && oCreatedAtEnd) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("CreatedAt", FilterOperator.GE, oCreatedAtStart),
                        new Filter("CreatedAt", FilterOperator.LE, oCreatedAtEnd)
                    ],
                    and: true
                }));
            } else if (oCreatedAtStart) {
                aFilters.push(new Filter("CreatedAt", FilterOperator.EQ, oCreatedAtStart));
            } else if (oCreatedAtEnd) {
                aFilters.push(new Filter("CreatedAt", FilterOperator.EQ, oCreatedAtEnd));
            }
        
            if (oChangedAtStart && oChangedAtEnd) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("ChangedAt", FilterOperator.GE, oChangedAtStart),
                        new Filter("ChangedAt", FilterOperator.LE, oChangedAtEnd)
                    ],
                    and: true
                }));
            } else if (oChangedAtStart) {
                aFilters.push(new Filter("ChangedAt", FilterOperator.EQ, oChangedAtStart));
            } else if (oChangedAtEnd) {
                aFilters.push(new Filter("ChangedAt", FilterOperator.EQ, oChangedAtEnd));
            }
        
            oBinding.filter(aFilters);
        },

        onNavToSalesOrderLineItem: function(oEvent) 
        {
            var oItem, oCtx, oRouter;
            
            oItem = oEvent.getParameter("listItem");
            oCtx = oItem.getBindingContext("SalesOrdersTableModel");
            
            var sSalesOrderID = oCtx.getProperty("SalesOrderID");

            // Salva i dettagli del SalesOrder nel modello
            var oSalesOrderDetails = oCtx.getObject();
            var oSalesOrderDetailsModel = new JSONModel(oSalesOrderDetails);
            this.getOwnerComponent().setModel(oSalesOrderDetailsModel, "SelectedSalesOrderModel");

            oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteSalesOrderLineItem", { salesOrderID: sSalesOrderID });
        },

        createColumnConfig: function() 
        {
            // Recupera il modello i18n
            var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            return [
                {
                    label: oResourceBundle.getText("columnTextSalesOrderID"),
                    property: "SalesOrderID",
                    type: EdmType.String
                },
                {
                    label: oResourceBundle.getText("columnTextCustomerID"),
                    property: "CustomerID",
                    type: EdmType.String
                },
                {
                    label: oResourceBundle.getText("columnTextCustomerName"),
                    property: "CustomerName",
                    type: EdmType.String,
                },
                {
                    label: oResourceBundle.getText("columnTextCurrencyCode"),
                    property: "CurrencyCode",
                    type: EdmType.String,
                },
                {
                    label: oResourceBundle.getText("columnTextNote"),
                    property: "Note",
                    type: EdmType.String,
                },
                {
                    label: oResourceBundle.getText("columnTextNetAmount"),
                    property: "NetAmount",
                    type: EdmType.String
                },
                {
                    label: oResourceBundle.getText("columnTextCreatedAt"),
                    property: "CreatedAt",
                    type: EdmType.Date,
                    format: "dd/MM/yyyy"
                },
                {
                    label: oResourceBundle.getText("columnTextChangedAt"),
                    property: "ChangedAt",
                    type: EdmType.Date,
                    format: "dd/MM/yyyy"
                },
                {
                    label: oResourceBundle.getText("columnTextDeliveryStatusDescription"),
                    property: "DeliveryStatusDescription",
                    type: EdmType.String
                }
            ];
        },
        
        onExport: function() {
            var aCols, oRowBinding, oSettings, oSheet, oTable;
        
            if (!this._oTable) {
                this._oTable = this.byId('SalesOrdersTable'); 
            }
        
            oTable = this._oTable;
            oRowBinding = oTable.getBinding('items'); 
        
            // Recupera solo i dati filtrati
            var aFilteredData = oRowBinding.getContexts().map(function(oContext) {
                var oRow = oContext.getObject();
                
                // Mantieni le date come oggetti Date
                oRow.OrderDate = oRow.OrderDate ? new Date(oRow.CreatedAt) : null;
                oRow.ShippedDate = oRow.ShippedDate ? new Date(oRow.ChangedAt) : null;
        
                return oRow;
            });
        
            aCols = this.createColumnConfig();
        
            oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },
                dataSource: aFilteredData,
                fileName: 'SalesOrdersDetail.xlsx',
                worker: false
            };
        
            oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function() {
                oSheet.destroy();
            });
        },

        onNavBack: function() {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteView1");
        }
    });
});