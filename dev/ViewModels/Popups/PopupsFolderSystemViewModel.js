/* RainLoop Webmail (c) RainLoop Team | Licensed under CC BY-NC-SA 3.0 */

(function (module) {

	'use strict';

	var
		ko = require('../../External/ko.js'),
		
		Enums = require('../../Common/Enums.js'),
		Consts = require('../../Common/Consts.js'),
		Utils = require('../../Common/Utils.js'),

		Data = require('../../Storages/WebMailDataStorage.js'),
		Remote = require('../../Storages/WebMailAjaxRemoteStorage.js'),

		kn = require('../../Knoin/Knoin.js'),
		KnoinAbstractViewModel = require('../../Knoin/KnoinAbstractViewModel.js')
	;

	/**
	 * @constructor
	 * @extends KnoinAbstractViewModel
	 */
	function PopupsFolderSystemViewModel()
	{
		KnoinAbstractViewModel.call(this, 'Popups', 'PopupsFolderSystem');

		Utils.initOnStartOrLangChange(function () {
			this.sChooseOnText = Utils.i18n('POPUPS_SYSTEM_FOLDERS/SELECT_CHOOSE_ONE');
			this.sUnuseText = Utils.i18n('POPUPS_SYSTEM_FOLDERS/SELECT_UNUSE_NAME');
		}, this);

		this.notification = ko.observable('');

		this.folderSelectList = ko.computed(function () {
			return RL.folderListOptionsBuilder([], Data.folderList(), Data.folderListSystemNames(), [
				['', this.sChooseOnText],
				[Consts.Values.UnuseOptionValue, this.sUnuseText]
			]);
		}, this);

		var
			self = this,
			fSaveSystemFolders = null,
			fCallback = null
		;

		this.sentFolder = Data.sentFolder;
		this.draftFolder = Data.draftFolder;
		this.spamFolder = Data.spamFolder;
		this.trashFolder = Data.trashFolder;
		this.archiveFolder = Data.archiveFolder;

		fSaveSystemFolders = _.debounce(function () {

			RL.settingsSet('SentFolder', self.sentFolder());
			RL.settingsSet('DraftFolder', self.draftFolder());
			RL.settingsSet('SpamFolder', self.spamFolder());
			RL.settingsSet('TrashFolder', self.trashFolder());
			RL.settingsSet('ArchiveFolder', self.archiveFolder());

			Remote.saveSystemFolders(Utils.emptyFunction, {
				'SentFolder': self.sentFolder(),
				'DraftFolder': self.draftFolder(),
				'SpamFolder': self.spamFolder(),
				'TrashFolder': self.trashFolder(),
				'ArchiveFolder': self.archiveFolder(),
				'NullFolder': 'NullFolder'
			});

		}, 1000);

		fCallback = function () {

			RL.settingsSet('SentFolder', self.sentFolder());
			RL.settingsSet('DraftFolder', self.draftFolder());
			RL.settingsSet('SpamFolder', self.spamFolder());
			RL.settingsSet('TrashFolder', self.trashFolder());
			RL.settingsSet('ArchiveFolder', self.archiveFolder());

			fSaveSystemFolders();
		};

		this.sentFolder.subscribe(fCallback);
		this.draftFolder.subscribe(fCallback);
		this.spamFolder.subscribe(fCallback);
		this.trashFolder.subscribe(fCallback);
		this.archiveFolder.subscribe(fCallback);

		this.defautOptionsAfterRender = Utils.defautOptionsAfterRender;

		kn.constructorEnd(this);
	}

	kn.extendAsViewModel('PopupsFolderSystemViewModel', PopupsFolderSystemViewModel);

	PopupsFolderSystemViewModel.prototype.sChooseOnText = '';
	PopupsFolderSystemViewModel.prototype.sUnuseText = '';

	/**
	 * @param {number=} iNotificationType = Enums.SetSystemFoldersNotification.None
	 */
	PopupsFolderSystemViewModel.prototype.onShow = function (iNotificationType)
	{
		var sNotification = '';

		iNotificationType = Utils.isUnd(iNotificationType) ? Enums.SetSystemFoldersNotification.None : iNotificationType;

		switch (iNotificationType)
		{
			case Enums.SetSystemFoldersNotification.Sent:
				sNotification = Utils.i18n('POPUPS_SYSTEM_FOLDERS/NOTIFICATION_SENT');
				break;
			case Enums.SetSystemFoldersNotification.Draft:
				sNotification = Utils.i18n('POPUPS_SYSTEM_FOLDERS/NOTIFICATION_DRAFTS');
				break;
			case Enums.SetSystemFoldersNotification.Spam:
				sNotification = Utils.i18n('POPUPS_SYSTEM_FOLDERS/NOTIFICATION_SPAM');
				break;
			case Enums.SetSystemFoldersNotification.Trash:
				sNotification = Utils.i18n('POPUPS_SYSTEM_FOLDERS/NOTIFICATION_TRASH');
				break;
			case Enums.SetSystemFoldersNotification.Archive:
				sNotification = Utils.i18n('POPUPS_SYSTEM_FOLDERS/NOTIFICATION_ARCHIVE');
				break;
		}

		this.notification(sNotification);
	};

	module.exports = new PopupsFolderSystemViewModel();

}(module));