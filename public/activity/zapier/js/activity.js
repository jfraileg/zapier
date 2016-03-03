define( function( require ) {
    'use strict';
    
	var Postmonger = require('postmonger');
	var $ = require('jquery');

  	var connection = new Postmonger.Session();
    var toJbPayload = {};
    var step = 1; 
	var tokens;
	var endpoints;
	
    $(window).ready(onRender);

    connection.on('initActivity', function(payload) {
        var eventDefinitionKey;
        var webhookUrl;

        if (payload) {
            toJbPayload = payload;
            console.log('payload',payload);
            
            eventDefinitionKey = toJbPayload['arguments'].execute.inArguments[0].eventDefinitionKey;
            webhookUrl = toJbPayload['arguments'].execute.inArguments[0].webhookUrl;
            
            $('#txtWebhookUrl').val(webhookUrl);         
        }
      
        // setup availabe events
		$.get( "/zapier/eventdefinitions", function( data ) {
		    $.each(data, function(i,item) {
                $("#selEventDefinitionKey").append("<option value="+item.eventDefinitionKey+">"+item.name+"</option>");
            });
            $('#selEventDefinitionKey').find('option[value='+ eventDefinitionKey +']').attr('selected', 'selected');	         
		});
      	         
        // set state of the form
        if (!eventDefinitionKey) {
            connection.trigger('updateButton', { button: 'next', enabled: false });
        }
        if (!webhookUrl) {
            connection.trigger('updateButton', { button: 'next', enabled: false });
        }	
		gotoStep(step);
        
    });

    connection.on('requestedTokens', function(data) {
		if( data.error ) {
			console.error( data.error );
		} else {
            console.log(data);
			tokens = data;
		}        
    });

    connection.on('requestedEndpoints', function(data) {
		if( data.error ) {
			console.error( data.error );
		} else {
            console.log(data);
			endpoints = data;
		}        
    });

    connection.on('clickedNext', function() {
        step++;
        gotoStep(step);
        connection.trigger('ready');
    });

    connection.on('clickedBack', function() {
        step--;
        gotoStep(step);
        connection.trigger('ready');
    });

    function onRender() {
		console.log('onRender');
		
        connection.trigger('ready');
        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');

        // Disable the next button if we don't have valid values
        $('#txtWebhookUrl').on('input',function(e) {
            connection.trigger('updateButton', { button: 'next', enabled: validValues() });
        });
        $('#selEventDefinitionKey').change(function() {
            connection.trigger('updateButton', { button: 'next', enabled: validValues() });
        });
    };

    function gotoStep(step) {
        $('.step').hide();
        switch(step) {
            case 1:
                $('#step1').show();
                connection.trigger('updateButton', { button: 'next', text: 'done', enabled: validValues() });
                connection.trigger('updateButton', { button: 'back', visible: false });
                break;  
            case 2:
                save();
                break;
        }
    };

    function getEventDefinitionKey() {
        return $('#selEventDefinitionKey').find('option:selected').attr('value').trim();
    }

    function getWebhookUrl() {
        return $.trim($("#txtWebhookUrl").val())
    }
    
    function validValues() {
        return getEventDefinitionKey() != "select" && getWebhookUrl().length > 0;
    }

    function save() {
        var eventDefinitionKey = getEventDefinitionKey();
        var customObjectKey = "{{Event." + eventDefinitionKey + "._CustomObjectKey}}";
        var webhookUrl = getWebhookUrl();
        
        toJbPayload['arguments'].execute.inArguments[0].eventDefinitionKey = eventDefinitionKey;
        toJbPayload['arguments'].execute.inArguments[0].customObjectKey = customObjectKey;
        toJbPayload['arguments'].execute.inArguments[0].webhookUrl = webhookUrl;
		
        //this is required by JB to set the activity as Configured.
		toJbPayload.metaData.isConfigured = true;  
        connection.trigger('updateActivity', toJbPayload);
    }; 
    	 
});
			
