sap.ui.define([
	"./BaseController",
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/Text",
	"../model/models",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (BaseController, MessageToast, Dialog, DialogType, Button, ButtonType, Text, models, JSONModel, MessageBox) {
	"use strict";

	// shortcut for sap.m.URLHelper

	return BaseController.extend("opensap.ecommerce.controller.Cart", {
		onInit: function () {
			this.setModel(this.createCheckoutModel(), "checkout");
			this._oDialog = this.byId("checkoutDialog");
			this._wizard = this.byId("ShoppingCartWizard");
			this._oNavContainer = this.byId("wizardNavContainer");
			this._oWizardContentPage = this.byId("wizardContentPage");
			this._wizard.invalidateStep(this.byId("ContactStep"));
			this._date = new Date();
		},
		createCheckoutModel: function () {
			var oModel = new JSONModel(this.getDefaultCheckoutModel());
			oModel.setDefaultBindingMode("TwoWay");
			return oModel;
		},
		getDefaultCheckoutModel: function () {
			return {
				customerInfo: {
					name: "thomas",
					surname: "topuz",
					email: "thomatop@gmail.com"
				},
				address: {
					primaryAddress: "via bellinzona",
					number: "23",
					zipcode: "6512",
					city: "Giubiasco",
					country: "Svizzera"
				},
				payment: {
					previousPaymentMethod: "Credit Card",
					paymentMethod: "Credit Card",
					cardDetails: {
						nameOnCard: "Thomas Topuz",
						cardNumber: "9875-9848-9847-6655",
						expirationDate: "",
						cvv: ""
					},
					cashondelivery: {
						phone: ""
					}
				}
			};
		},
		goToPaymentStep: function () {
			var selectedKey = this.getModel("checkout").getProperty("/payment/paymentMethod");
			switch (selectedKey) {
			case "Credit Card":
				this.byId("PaymentTypeStep").setNextStep(this.getView().byId("CreditCardStep"));
				break;
			case "Cash on Delivery":
			default:
				this.byId("PaymentTypeStep").setNextStep(this.getView().byId("CashOnDeliveryStep"));
				break;
			}
		},
		setPaymentMethod: function () {
			if (this._wizard.getProgressStep() !== this.byId("PaymentTypeStep")) { // if the is not already selected
				MessageBox.warning("Are you sure you want to change the payment method ? This will discard your progress.", {
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					onClose: function (oAction) {
						if (oAction === MessageBox.Action.YES) {
							this._wizard.discardProgress(this.byId("PaymentTypeStep"));
							// set previuous to current
							this.getModel("checkout").setProperty("/payment/previousPaymentMethod",
								this.getModel("checkout").getProperty("/payment/paymentMethod"));
						} else {
							// set current to previous
							this.getModel("checkout").setProperty("/payment/paymentMethod",
								this.getModel("checkout").getProperty("/payment/previousPaymentMethod"));
						}
					}.bind(this)
				});
			}
		},
		handleWizardCancel: function () {
			this._handleMessageBoxOpen("Are you sure you want to cancel your purchase?", "warning");
		},
		checkContactStep: function () {
			console.log(this.getModel("checkout").getProperty("/valueState/name"))
			if (this._validateContactDetails() && this._validateAddress()) {
				this._wizard.validateStep(this.byId("ContactStep"));
				console.log("validate")
			} else {
				this._wizard.invalidateStep(this.byId("ContactStep"));
				console.log("invalidate")
			}
		},
		_validateContactDetails: function () {
			var checkoutModel = this.getModel("checkout");
			var name = checkoutModel.getProperty("/customerInfo/name");
			var surname = checkoutModel.getProperty("/customerInfo/surname");
			var email = checkoutModel.getProperty("/customerInfo/email");
			var isContactDetailsValid = this._validateString(name, 3, 255) &&
				this._validateString(surname, 3, 255) &&
				this._validateString(email, 3, 255);
			console.log("contact: ", isContactDetailsValid)
			return isContactDetailsValid;
		},
		_validateAddress: function () {
			var checkoutModel = this.getModel("checkout");
			var primaryAddress = checkoutModel.getProperty("/address/primaryAddress");
			var addressNumber = checkoutModel.getProperty("/address/number");
			var zipcode = checkoutModel.getProperty("/address/zipcode");
			var city = checkoutModel.getProperty("/address/city");
			var country = checkoutModel.getProperty("/address/country");
			var isAddressValid = this._validateString(primaryAddress, 3, 255) &&
				this._validateString(addressNumber, 1, 7) &&
				this._validateString(zipcode, 1, 7) &&
				this._validateString(city, 3, 255) &&
				this._validateString(country, 3, 255);
			console.log("address:", isAddressValid);
			return isAddressValid;
		},
		_validateString: function (sString, iMinlength, iMaxLength) {
			if (sString) {
				return (sString.length >= iMinlength && sString.length <= iMaxLength);
			} else {
				return false;
			}
		},
		checkCreditCardStep: function () {
			var checkoutModel = this.getModel("checkout");
			var nameOnCard = checkoutModel.getProperty("/payment/cardDetails/nameOnCard");
			var cardNumber = checkoutModel.getProperty("/payment/cardDetails/cardNumber");
			var expirationDate = checkoutModel.getProperty("/payment/cardDetails/expirationDate");
			var cvv = checkoutModel.getProperty("/payment/cardDetails/cvv");
			var isCreditCardValid = this._validateString(nameOnCard, 1, 255) &&
				this._validateString(cardNumber, 19, 19) &&
				this._validateExpirationDate(expirationDate) &&
				this._validateString(cvv, 3, 3);
				
			this._validateExpirationDate(expirationDate);
			if (isCreditCardValid) {
				this._wizard.validateStep(this.byId("CreditCardStep"));
			} else {
				this._wizard.invalidateStep(this.byId("CreditCardStep"));
			}
		},
		_validateExpirationDate: function (sExpirationDate) {
			var isValid = true;
			if(sExpirationDate.length>5){
				isValid = false;
			}
			var month = parseInt(sExpirationDate.split("/")[0]);
			var year = parseInt(sExpirationDate.split("/")[1]);
			if(month>12 || month<1 || year<this._date.getFullYear().toString().substring(2)) {
				isValid = false;
			}
			console.log(month, year);
			return isValid;
		},
		validateCardNumber: function (sCardNumber) {
			return sCardNumber.length === 19;
		},
		checkCashOnDeliveryStep: function () {
			var phoneNumber = this.getModel("checkout").getProperty("/payment/cashondelivery/phone");
			if (!isNaN(phoneNumber) && phoneNumber.length >= 3) {
				this._wizard.validateStep(this.byId("CashOnDeliveryStep"));
			} else {
				this._wizard.invalidateStep(this.byId("CashOnDeliveryStep"));
			}
		},
		checkBillingStep: function () {
			var address = this.model.getProperty("/BillingAddress/Address") || "";
			var city = this.model.getProperty("/BillingAddress/City") || "";
			var zipCode = this.model.getProperty("/BillingAddress/ZipCode") || "";
			var country = this.model.getProperty("/BillingAddress/Country") || "";

			if (address.length < 3 || city.length < 3 || zipCode.length < 3 || country.length < 3) {
				this._wizard.invalidateStep(this.byId("BillingStep"));
			} else {
				this._wizard.validateStep(this.byId("BillingStep"));
			}
		},
		completedHandler: function () {
			// check if form is valid
			this.logModels();
			this.resetModels();
			this._wizard.discardProgress(this._wizard.getSteps()[0]);
			this._onCloseDialog();
			MessageToast.show("Thanks for your purchase");
		},
		logModels: function () {
			console.log("Checkout informations: ", this.getModel("checkout").oData);
			console.log("Cart informations: ", this.getModel("cart").oData);
		},
		resetModels: function () {
			this.getModel("checkout").setProperty("/", this.getDefaultCheckoutModel());
			this.getModel("cart").setProperty("/", models.getDefaultCartModel());
		},
		_handleMessageBoxOpen: function (sMessage, sMessageBoxType) {
			MessageBox[sMessageBoxType](sMessage, {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.YES) {
						this._wizard.discardProgress(this._wizard.getSteps()[0]);
						this._onCloseDialog();
					}
				}.bind(this)
			});
		},
		_onCloseDialog: function () {
			this._oDialog.close();
		}
	});

});