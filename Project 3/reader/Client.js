/**
 * Client
 * @constructor
 */
function Client(port) {
    this.port = port || 8081;
    this.request = null;
}

/**
 *
 * @type {Client}
 */
Client.prototype.constructor = Client;

/**
 *
 * @param requestString
 */
Client.prototype.makeRequest=function(requestString, handler)
{
    this.request = requestString;
    this.getPrologRequest(handler);
}

/**
 *
 * @param requestString
 * @param onSuccess
 * @param onError
 * @param port
 */
Client.prototype.getPrologRequest = function(onSuccess, onError)
{
    var requestPort = this.port || 8081
    var request = new XMLHttpRequest();
    request.open('GET', 'http://localhost:'+requestPort+'/'+this.request, true);

    request.onload = onSuccess || function(data){console.log("Request successful. Reply: " + data.target.response);};
    request.onerror = onError || function(){console.log("Error waiting for response");};

    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send();
}

/**
 *
 * @returns {*|number}
 */
Client.prototype.getPort=function () {
    return this.port;
}

/**
 *
 * @returns {null|*}
 */
Client.prototype.getRequest = function () {
    return this.request;
}