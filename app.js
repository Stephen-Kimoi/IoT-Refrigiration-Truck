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




