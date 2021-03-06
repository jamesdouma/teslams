#!/usr/bin/env node
var util = require('util');
var teslams = require('../teslams.js');
var argv = require('optimist')
	.usage('Usage: $0 -u <username> -p <password> -cdFgHimPtvw -A [on|off] -C [start|stop] -R [std|max] -S [close|vent|comfort|open] -L [lock|unlock] -T temp')
	.alias('u', 'username')
	.describe('u', 'Teslamotors.com login')
	.demand('u')
	.alias('p', 'password')
	.describe('p', 'Teslamotors.com password')
	.demand('p')
	.boolean(['c', 'd', 'F', 'g', 'H', 'i', 'm', 'P', 't', 'v', 'w'])
	.describe('c', 'Display the charge state')
	.describe('d', 'Display the drive state')
	.alias('d', 'drive')
	.describe('F', 'Flash the car headlights')
	.alias('F', 'flash')
	.describe('g', 'Display the GUI settings')
	.alias('g', 'gui')
	.alias('H', 'honk')
	.describe('H', 'Honk the car horn')
	.alias('i', 'id')
	.default('i', true)
	.describe('m', 'Display the mobile state')
	.alias('m', 'mobile')
	.describe('P', 'Open charge port door')
	.alias('P', 'port')
	.describe('t', 'Display the climate/temp state')
	.describe('v', 'Display the vehicle state')
	.describe('i', 'Print vehicle identification "--no-i" for silent mode')
	.alias('w', 'wake')
	.describe('w', 'Wake up the car telemetry')
	.alias('R', 'range')
	.describe('R', 'Charging range mode: "std" or "max"')
	.alias('S', 'roof')
	.describe('S', 'Move the car sunroof to: "close", "vent", "comfort", "open" or any percent')
	.alias('T', 'temp')
	.describe('T', 'Set the car climate control temperature (in Celcius)')
	.alias('L', 'lock')
	.describe('L', 'Lock/Unlock the car doors')
	.alias('A', 'climate')
	.describe('A', 'Turn the air conditioning and heating on/off')
	.alias('C', 'charge')
	.describe('C', 'Turn the charging on/off')
	.alias('?', 'help')
	.describe('?', 'Print usage information')
	.argv;


if ( argv.help == true ) {
	console.log( 'Usage: teslacmd.js -u <username> -p <password> -cdFgHimPtvw');
	console.log( '                   -A [on|off] -C [start|stop] -R [std|max]');
	console.log( '                   -S [0-100] -S [close|vent|comfort|open] -L [lock|unlock] -T temp');
	process.exit(1);
}

var creds = { 
	email: argv.username, 
	password: argv.password 
};

function pr( stuff ) {
	console.log( util.inspect(stuff) );
}


teslams.get_vid( { email: argv.username, password: argv.password }, function ( vid ) {
	if (vid == undefined) {
		console.log("Error: Undefined vehicle vid");
		process.exit(1);
	} else {
		// wake up the car's telematics system
		if (argv.w) {
			teslams.wake_up( vid, pr );
		}
		//
		// get some info
		//
		if (argv.m) {
			teslams.mobile_enabled( vid, pr );
		}
		if (argv.c) {
			teslams.get_charge_state( vid, pr );
		}
		if (argv.t) {
			teslams.get_climate_state( vid, pr );
		}
		if (argv.d) {
			teslams.get_drive_state( vid, pr );
		}
		if (argv.v) {
			teslams.get_vehicle_state( vid, pr );
		}
		if (argv.g) {
			teslams.get_gui_settings( vid, pr );
		}
		//
		//  cute but annoying stuff while debugging
		//
		if (argv.F) {
			teslams.flash( vid, pr ); 
		}
		if (argv.H) {
			teslams.honk( vid, pr ); 
		}
		if (argv.P) {
			teslams.open_charge_port( vid, pr ) 
		}
		//
		// control some stuff
		//
		if ( argv.lock != undefined ) {
			teslams.door_lock( {id: vid, lock: argv.lock }, pr );
		}
		if ( argv.roof != undefined ) {
			if ( argv.roof >= 0 && argv.roof <= 100 ) {
				teslams.sun_roof( {id: vid, roof: 'move', percent: argv.roof }, pr );
			} else if (argv.roof == "open" || argv.roof == "close" || argv.roof == "comfort" || argv.roof == "vent") {
				teslams.sun_roof( {id: vid, roof: argv.roof }, pr );
			} else {
				var err = new Error("Invalid sun roof state. Specify 0-100 percent, 'open', 'close', 'comfort' or 'vent'");
				return pr( err );			
			}
		}
		if ( argv.climate != undefined ) {
			teslams.auto_conditioning( { id: vid, climate: argv.climate}, pr ); 
		}
		if ( argv.range != undefined ) {
				teslams.charge_range( { id: vid, range: argv.range }, pr ); 
		}
		if ( argv.charge != undefined ) {
			if (argv.charge == "start" || argv.charge == "stop" ) {
				teslams.charge_state( { id: vid, charge: argv.charge }, pr ); 
			} else {
				var err = new Error("Invalid charge state. Use 'start' or 'stop'");
				return pr( err );
			}
		}
		if ( argv.temp != undefined ) {
			if ( argv.temp <= teslams.TEMP_HI && argv.temp >= teslams.TEMP_LO) {
				teslams.set_temperature( { id: vid, dtemp: argv.temp}, pr); 
			} else {
				var err = new Error("Invalid temperature. Valid range is " + teslams.TEMP_LO + " - " + teslams.TEMP_HI + " C" );
				return pr( err );
			}
		}
	}
});


