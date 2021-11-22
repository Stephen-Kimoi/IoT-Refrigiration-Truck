"use strict"; 
const chalk = require('chalk'); 

// Azure IoT Device SDK for devices that connect to Azure IoT Device central
var iotHubTransport = require('azure-iot-device-mqtt').Mqtt; 
var Client = require('azure-iot-device').Client; 
var Message = require('azure-iot-device').Message; 
var ProvisioningTransport = require('azure-iot-provisioning-device-mqtt').Mqtt; 
var SymmetricKeySecurityClient = require('azure-iot-security-symmetric-key').SymmetricKeySecurityClient; 
var ProvisioningDeviceClient = require('azure-iot-provisioning-device').ProvisioningDeviceClient;
var provisioningHost = 'global.azure-devices-provisioning.net'; 

// My Azure IoT Keys 
var idScope = '0ne0043A3C2'; 
var registrationId = 'RefrigeratedTruck1'; 
var symmetricKey = 'IXupJBmM9G4uNJC463CPeLUWBY/+XTQR5IX6fjMvqBs='; 

var provisioningSecurityClient = new SymmetricKeySecurityClient(registrationId, symmetricKey);
var provisioningClient = ProvisioningDeviceClient.create(provisioningHost, idScope, new ProvisioningTransport(), provisioningSecurityClient);
var hubClient; 

var truckIdentification = 'Truck number 1'; 

var rest = require('azure-maps-rest'); 

// Azure maps key 
var subscriptionKeyCredential =  new rest.SubscriptionKeyCredential("BHR3jPNVCUb_rVM64gvnfZabTxn98cZkG2KHx3DlJEY"); 

// Azure maps connection 
var pipeline = rest.MapsURL.newPipeline(subscriptionKeyCredential); 
var routeUrl = new rest.RouteURL(pipeline); 

function greenMessage(text) {
    console.log(chalk.green(text) + "\n"); 
} 
function redMessage(text) {
    console.log(chalk.red(text) + "\n"); 
}


// Truck globals initialized to the starting state of the truck. 

var stateEnum = Object.freeze({ "ready": "ready", "enroute": "enroute", "delivering": "delivering", "returning": "returning", "loading": "loading", "dumping": "dumping" });
var contentsEnum = Object.freeze({ "full": "full", "melting": "melting", "empty": "empty" });
var fanEnum = Object.freeze({ "on": "on", "off": "off", "failed": "failed" });
const deliverTime = 600; // Time to complete delivery, in seconds. 
const loadingTime = 800; // Time to load contents. 
const dumpingTime = 400; // Time to dump melted contents. 
const tooWarmThreshold = 2; // Degrees C temperature that is too warm for contents. 
const tooWarmtooLong = 60; // Time in seconds for contents to start melting if temperatures are above threshold. 
var timeOnCurrentTask = 0; // Time on current task, in seconds. 
var interval = 60; // Time interval in seconds. 
var tooWarmPeriod = 0; // Time that contents are too warm, in seconds. 
var temp = -2; // Current temperature of contents, in degrees C. 
var baseLat = 47.644702; // Base position latitude. 
var baseLon = -122.130137; // Base position longitude. 
var currentLat = baseLat; // Current position latitude. 
var currentLon = baseLon; // Current position longitude. 
var destinationLat; // Destination position latitude. 
var destinationLon; // Destination position longitude. 
var fan = fanEnum.on; // Cooling fan state. 
var contents = contentsEnum.full; // Truck contents state. 
var state = stateEnum.ready; // Truck is full and ready to go! 
var optimalTemperature = -5; // Setting - can be changed by the operator from IoT Central.
var outsideTemperature = 12; // Ambient outside temperature.
const noEvent = "none";
var eventText = noEvent; // Text to send to the IoT operator. 
var customer = [ // Latitude and longitude position of customers. 

    // Gasworks Park 
    [47.645892, -122.336954],

    // Golden Gardens Park 
    [47.688741, -122.402965],

    // Seward Park 
    [47.551093, -122.249266],

    // Lake Sammamish Park 
    [47.555698, -122.065996],

    // Marymoor Park 
    [47.663747, -122.120879],

    // Meadowdale Beach Park 
    [47.857295, -122.316355],

    // Lincoln Park 
    [47.530250, -122.393055],

    // Gene Coulon Park 
    [47.503266, -122.200194],

    // Luther Bank Park 
    [47.591094, -122.226833],

    // Pioneer Park 
    [47.544120, -122.221673]
];
var path = []; // Latitude and longitude steps for the route. 
var timeOnPath = []; // Time in seconds for each section of the route. 
var truckOnSection; // The current path section the truck is on. 
var truckSectionsCompletedTime; // The time the truck has spent on previous completed sections.



