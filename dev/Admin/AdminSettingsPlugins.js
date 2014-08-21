/* RainLoop Webmail (c) RainLoop Team | Licensed under CC BY-NC-SA 3.0 */

(function (module) {

	'use strict';

	var
		_ = require('../External/underscore.js'),
		ko = require('../External/ko.js'),
		
		Enums = require('../Common/Enums.js'),
		Utils = require('../Common/Utils.js'),

		Data = require('../Storages/AdminDataStorage.js'),
		Remote = require('../Storages/AdminAjaxRemoteStorage.js'),

		PopupsPluginViewModel = require('../ViewModels/Popups/PopupsPluginViewModel.js')
	;

	/**
	 * @constructor
	 */
	function AdminSettingsPlugins()
	{
		this.enabledPlugins = ko.observable(!!RL.settingsGet('EnabledPlugins'));

		this.pluginsError = ko.observable('');

		this.plugins = Data.plugins;
		this.pluginsLoading = Data.pluginsLoading;

		this.visibility = ko.computed(function () {
			return Data.pluginsLoading() ? 'visible' : 'hidden';
		}, this);

		this.onPluginLoadRequest = _.bind(this.onPluginLoadRequest, this);
		this.onPluginDisableRequest = _.bind(this.onPluginDisableRequest, this);
	}

	kn.addSettingsViewModel(AdminSettingsPlugins, 'AdminSettingsPlugins', 'Plugins', 'plugins');

	AdminSettingsPlugins.prototype.disablePlugin = function (oPlugin)
	{
		oPlugin.disabled(!oPlugin.disabled());
		Remote.pluginDisable(this.onPluginDisableRequest, oPlugin.name, oPlugin.disabled());
	};

	AdminSettingsPlugins.prototype.configurePlugin = function (oPlugin)
	{
		Remote.plugin(this.onPluginLoadRequest, oPlugin.name);
	};

	AdminSettingsPlugins.prototype.onBuild = function (oDom)
	{
		var self = this;

		oDom
			.on('click', '.e-item .configure-plugin-action', function () {
				var oPlugin = ko.dataFor(this);
				if (oPlugin)
				{
					self.configurePlugin(oPlugin);
				}
			})
			.on('click', '.e-item .disabled-plugin', function () {
				var oPlugin = ko.dataFor(this);
				if (oPlugin)
				{
					self.disablePlugin(oPlugin);
				}
			})
		;

		this.enabledPlugins.subscribe(function (bValue) {
			Remote.saveAdminConfig(Utils.emptyFunction, {
				'EnabledPlugins': bValue ? '1' : '0'
			});
		});
	};

	AdminSettingsPlugins.prototype.onShow = function ()
	{
		this.pluginsError('');
		RL.reloadPluginList();
	};

	AdminSettingsPlugins.prototype.onPluginLoadRequest = function (sResult, oData)
	{
		if (Enums.StorageResultType.Success === sResult && oData && oData.Result)
		{
			kn.showScreenPopup(PopupsPluginViewModel, [oData.Result]);
		}
	};

	AdminSettingsPlugins.prototype.onPluginDisableRequest = function (sResult, oData)
	{
		if (Enums.StorageResultType.Success === sResult && oData)
		{
			if (!oData.Result && oData.ErrorCode)
			{
				if (Enums.Notification.UnsupportedPluginPackage === oData.ErrorCode && oData.ErrorMessage && '' !== oData.ErrorMessage)
				{
					this.pluginsError(oData.ErrorMessage);
				}
				else
				{
					this.pluginsError(Utils.getNotification(oData.ErrorCode));
				}
			}
		}

		RL.reloadPluginList();
	};

	module.exports = AdminSettingsPlugins;

}(module));