var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;
	self.init_tcp();
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.status(1,'Connecting'); // status ok!

	self.init_tcp();
};

instance.prototype.init_tcp = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (self.config.host) {
		self.socket = new tcp(self.config.host, 5000);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.status(self.STATE_ERROR, err);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('connect', function () {
			self.status(self.STATE_OK);
			debug("Connected");
		})

		self.socket.on('data', function (data) {});
	}
};


// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 6,
			default: '192.168.1.39',
			regex: self.REGEX_IP
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
	}

	debug("destroy", self.id);;
};


instance.prototype.actions = function(system) {
	var self = this;
	var actions = {
		'menu': { label: 'Menu'},
		'minus': { label: 'Minus'},
		'plus': { label: 'Plus'},
		'left': { label: 'Left'},
		'right': { label: 'Right'},
		'enter': { label: 'Enter'},

		'switch_input': {
			label: 'Switch input',
			options: [
				{
					type: 'dropdown',
					label: 'Input',
					id: 'input',
					choices: [
						{ id: '13', label: 'HDMI 1' },
						{ id: '14', label: 'HDMI 2' },
						{ id: '10', label: 'HDMI 3' },
						{ id: '15', label: 'HDMI 4' },
						{ id: '11', label: 'PC 1' },
						{ id: '12', label: 'PC 2' },
						{ id: '9', label: 'CV' },
						{ id: '16', label: 'DP' }
					]
				}
			]
		},
		'display_mode': {
			label: 'Dispaly Mode',
			options: [
				{
					type: 'dropdown',
					label: 'Mode',
					id: 'mode',
					choices: [
						{ id: '0', label: 'Single Window' },
						{ id: '1', label: 'Picture in Picture' },
						{ id: '2', label: 'Picture + Picture' },
						{ id: '3', label: 'Split' },
						{ id: '4', label: 'Customized' },
					]
				}
			]
		},
		'no_signal': {
			label: 'No Signal',
			options: [
				{
					type: 'dropdown',
					label: 'Colour',
					id: 'colour',
					choices: [
						{ id: '0', label: 'Grey' },
						{ id: '1', label: 'Blue' },
						{ id: '2', label: 'Black' },
					]
				}
			]
		},
		'window_control': {
			label: 'Window Control',
			options: [
				{
					type: 'dropdown',
					label: 'Window',
					id: 'window',
					choices: [
						{ id: '0', label: 'Main Window' },
						{ id: '1', label: 'PiP Window' },
					]
				}
			]
		},
		'blank': {
			label: 'Blank Output',
			options: [
				{
					type: 'dropdown',
					label: 'Blank on/off',
					id: 'blankId',
					choices: [
						{ id: '0', label: 'Off' },
						{ id: '1', label: 'On' },
					]
				}
			]
		},
		'freeze': {
			label: 'Freeze Output',
			options: [
				{
					type: 'dropdown',
					label: 'Freeze on/off',
					id: 'frzId',
					choices: [
						{ id: '0', label: 'Off' },
						{ id: '1', label: 'On' },
					]
				}
			]
		},
		'hdcp_mode': {
			label: 'HDCP Mode',
			options: [
				{
					type: 'dropdown',
					label: 'HDCP on/off',
					id: 'hdcp',
					choices: [
						{ id: '0', label: 'Off' },
						{ id: '1', label: 'On' },
					]
				}
			]
		},
		'mute': {
			label: 'Mute',
			options: [
				{
					type: 'dropdown',
					label: 'Mute on/off',
					id: 'muteId',
					choices: [
						{ id: '0', label: 'Off' },
						{ id: '1', label: 'On' },
					]
				}
			]
		},
		'custom': {
			label: 'custom command',
			options: [
				{
					type: 'textinput',
					id: 'custom'
				}
			]
		}
	};

	self.setActions(actions);
};




	instance.prototype.action = function(action) {
		var self = this;
		var opt = action.options;
		var id = action.action;
		var cmd;

		switch (id) {

			case 'menu':
				cmd = '#Y 0,10,0';
				break;

			case 'minus':
				cmd = '#Y 0,12,0';
				break;

			case 'plus':
				cmd = '#Y 0,13,0';
				break;

			case 'left':
				cmd = '#Y 0,39,0';
				break;

			case 'right':
				cmd = '#Y 0,40,0';
				break;

			case 'enter':
				cmd = '#Y 0,11,0';
				break;

			case 'freeze':
				cmd = '#Y 0,741,' + opt.frzId + '';
				break;

			case 'blank':
				cmd = '#Y 0,742,' + opt.blankId + '';
				break;

			case 'switch_input':
				cmd = '#Y 0,120,' + opt.input + '';
				break;

			case 'display_mode':
				cmd = '#Y 0,110,' + opt.mode + '';
				break;		

			case 'no_signal':
				cmd = '#Y 0,735,' + opt.colour + '';
				break;

			case 'window_control':
				cmd = '#Y 0,721,' + opt.window + '';
				break;	

			case 'mute':
				cmd = '#Y 0,743,' + opt.muteId + '';
				break;

			case 'command':
				cmd = opt.custom;
				break;

	}

	if (cmd !== undefined) {

		debug('sending ',cmd,"to",self.config.host);

		if (self.socket !== undefined && self.socket.connected) {
			self.socket.send(cmd + '\r');
		} else {
			debug('Socket not connected :(');
		}

	}

};

instance_skel.extendedBy(instance);
exports = module.exports = instance;