module.exports = function() {

    function FutRequest(){
        this.request = require('request');
        this.merge = require('merge');
        this.jar = this.request.jar();
        this.optionsModified = {};
        this.headersModified = {};
        this.headersModifiedConstantly= {};

        this.options = {
            timeout: 30000,
            method: 'GET',
            jar: this.jar,
            followAllRedirects :true

        };

        this.headers= {
            'User-Agent': 'Mozilla/6.0 (Windows NT 6.1; WOW64; rv:29.0) Gecko/20100101 Firefox/29.0',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Host': 'signin.ea.com',
            'Connection': 'keep-alive',
            'Origin': 'https://signin.ea.com'
        };
    }

    FutRequest.prototype.ModifyOptions = function(options){
        this.optionsModified = this.merge(this.options, options);
    };
    FutRequest.prototype.ModifyHeaders = function(headers){
        this.headersModified = this.merge(this.headers, headers);
    };
    FutRequest.prototype.ModifyHeadersConstantly = function(headers){
        this.headersModifiedConstantly = this.merge(this.headersModifiedConstantly, headers);
    };
    FutRequest.prototype.GetOptions = function(url){
        var options = this.merge({}, this.optionsModified);
        this.optionsModified = {};
        options.headers = this.GetHeaders();
        options.url = url;
        return options;

    };
    FutRequest.prototype.GetHeaders = function(){
        var headers = this.merge(this.headers, this.merge(this.headersModifiedConstantly, this.headersModified));
        this.headersModified = {};
        return headers;
    };
    FutRequest.prototype.MakeRequest = function(url, successCallback, errorCallback){
        this.request(this.GetOptions(url), function(error, response, body){
            if(error || !response || response.statusCode != '200'){
                if(undefined != errorCallback && typeof(errorCallback) == 'function'){
                    errorCallback(response, error);
                }
            } else {
                successCallback(response, body);
            }
        });
    };
    return new FutRequest();
};