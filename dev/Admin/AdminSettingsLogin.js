/* RainLoop Webmail (c) RainLoop Team | Licensed under CC BY-NC-SA 3.0 */

(function (module) {

	'use strict';

	var
		ko = require('../External/ko.js'),
		
		Enums = require('../Common/Enums.js'),
		Utils = require('../Common/Utils.js'),

		Data = require('../Storages/AdminDataStorage.js'),
		Remote = require('../Storages/AdminAjaxRemoteStorage.js')
	;

	/**
	 * @constructor
	 */
	function AdminSettingsLogin()
	{
		this.determineUserLanguage = Data.determineUserLanguage;
		this.determineUserDomain = Data.determineUserDomain;

		this.defaultDomain = ko.observable(RL.settingsGet('LoginDefaultDomain'));

		this.allowLanguagesOnLogin = Data.allowLanguagesOnLogin;
		this.defaultDomainTrigger = ko.observable(Enums.SaveSettingsStep.Idle);
	}

	kn.addSettingsViewModel(AdminSettingsLogin, 'AdminSettingsLogin', 'Login', 'login');

	AdminSettingsLogin.prototype.onBuild = function ()
	{
		var self = this;
		_.delay(function () {

			var f1 = Utils.settingsSaveHelperSimpleFunction(self.defaultDomainTrigger, self);

			self.determineUserLanguage.subscribe(function (bValue) {
				Remote.saveAdminConfig(null, {
					'DetermineUserLanguage': bValue ? '1' : '0'
				});
			});

			self.determineUserDomain.subscribe(function (bValue) {
				Remote.saveAdminConfig(null, {
					'DetermineUserDomain': bValue ? '1' : '0'
				});
			});

			self.allowLanguagesOnLogin.subscribe(function (bValue) {
				Remote.saveAdminConfig(null, {
					'AllowLanguagesOnLogin': bValue ? '1' : '0'
				});
			});

			self.defaultDomain.subscribe(function (sValue) {
				Remote.saveAdminConfig(f1, {
					'LoginDefaultDomain': Utils.trim(sValue)
				});
			});

		}, 50);
	};

	module.exports = AdminSettingsLogin;

}(module));