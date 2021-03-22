sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {
		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		createCartModel: function () {
			var oModel = new JSONModel(this.getDefaultCartModel());
			oModel.setDefaultBindingMode("TwoWay");
			return oModel;
		},
		getDefaultCartModel: function () {
			return {
				items: [],
				iTotalPrice: 0,
				iItemsCount: 0
			};
		}
	};
});