module.exports = function(config) {
    var urls = {
        'main'          : 'https://www.easports.com/uk/fifa/ultimate-team/web-app',
        'login'         : 'https://www.easports.com/services/authenticate/login',
        'nucleus'       : 'https://www.easports.com/iframe/fut16/?locale=en_GB&baseShowoffUrl=https%3A%2F%2Fwww.easports.com%2Fuk%2Ffifa%2Fultimate-team%2Fweb-app%2Fshow-off&guest_app_uri=http%3A%2F%2Fwww.easports.com%2Fuk%2Ffifa%2Fultimate-team%2Fweb-app',
        'nucleus2'       : 'https://www.easports.com/iframe/fut16/?baseShowoffUrl=https%3A%2F%2Fwww.easports.com%2Fuk%2Ffifa%2Fultimate-team%2Fweb-app%2Fshow-off&guest_app_uri=http%3A%2F%2Fwww.easports.com%2Fuk%2Ffifa%2Fultimate-team%2Fweb-app&locale=en_GB',
        'shards'        : 'http://www.easports.com/iframe/fut16/p/ut/shards?_=',
        'accounts'      : 'https://www.easports.com/iframe/fut16/p/ut/game/fifa16/user/accountinfo?sku=FUT16WEB&_=1442505066982',
        'sid'           : 'https://www.easports.com/iframe/fut16/p/ut/auth',
        'validate'      : 'https://www.easports.com/iframe/fut16/p/ut/game/fifa16/phishing/validate',
        'phishing'      : 'https://www.easports.com/iframe/fut16/p/ut/game/fifa16/phishing/question?_==',
        'route'         : 'https://utas.s2.fut.ea.com:443',
        'routeNoPort'   : 'https://utas.fut.ea.com'
    };
    var futRequest = require('.FutRequest');

    function GetLoginPage(){
        this.successor = null;
    }
    GetLoginPage.prototype.ModifyHeaders = function(){
        var form = {email: config.email, password: config.password, _remeberMe: 'on', remeberMe: 'on', _eventId: 'submit', gCaptchaResponse: ''};
        futRequest.ModifyOptions({method: 'POST', form: form});
    };
    GetLoginPage.prototype.Success= function(response, body){
        if(this.successor != null){
            this.successor.url = response.request.uri.href;
            this.successor.ProcessRequest();
        }
    };
    GetLoginPage.prototype.Error= function(response, error){
        console.log(error);
    };
    GetLoginPage.prototype.ProcessRequest = function(){
        this.ModifyHeaders();
        futRequest.MakeRequest(urls.login, this.Success, this.Error);
    };

    function ApplyVerificationCode(){
        this.successor = null;
        this.url = null;
    }

    ApplyVerificationCode.prototype.ModifyHeaders = function(){
        var form = {_eventId: 'submit', _trustThisDevice: 'on', trustThisDevice: 'on', twofactorCode: config.code};
        futRequest.ModifyOptions({method: 'POST', form: form});
    };
    ApplyVerificationCode.prototype.Success= function(response, body){
        if(this.successor != null){
            this.successor.url = response.request.uri.href;
            this.successor.ProcessRequest();
        }
    };
    ApplyVerificationCode.prototype.Error= function(response, error){
        console.log(error);
    };
    ApplyVerificationCode.prototype.ProcessRequest = function(){
        if(this.url != null){
            this.ModifyHeaders();
            futRequest.MakeRequest(this.url, this.Success, this.Error);
        } else {
            console.log('error: no code url applied');
        }
    };

    function GetNucleusId(){
        this.successor = null;
    }

    GetNucleusId.prototype.ModifyHeaders = function(){
        var form = {_eventId: 'submit', _trustThisDevice: 'on', trustThisDevice: 'on', twofactorCode: config.code};
        futRequest.ModifyOptions({method: 'POST', form: form});
    };
    GetNucleusId.prototype.Success= function(response, body){
        var match =  body.match(/var\ EASW_ID = '(\d*)';/g);
        var nucleusId = match[0].replace( /\D+/g, '');
        futRequest.ModifyHeadersConstantly({'Easw-Session-Data-Nucleus-Id': nucleusId});
        if(this.successor != null){
            this.successor.ProcessRequest();
        }
    };
    GetNucleusId.prototype.Error= function(response, error){
        console.log(error);
    };
    GetNucleusId.prototype.ProcessRequest = function(){
        this.ModifyHeaders();
        futRequest.MakeRequest(urls.nucleus, this.Success, this.Error);
    };

    function GetShards(){
        this.successor = null;
    }
    GetShards.prototype.ModifyHeaders = function(){

        futRequest.ModifyHeadersConstantly(
            {
                'X-UT-Route': config.utRoute,
                'Easw-Session-Data-Nucleus-Id': nucleusId,
                'X-UT-Embed-Error': 'true',
                'Accept': 'application/json, text/javascript',
                'Accept-Encoding': null,
                'X-Requested-With': 'XMLHttpRequest',
                'Accept-Language': 'en-US,en;q=0.8',
            });
    };
    GetShards.prototype.Success= function(response, body){
        if(this.successor != null){
            this.successor.ProcessRequest();
        }
    };
    GetShards.prototype.Error= function(response, error){
        console.log(error);
    };
    GetShards.prototype.ProcessRequest = function(){
        this.ModifyHeaders();
        futRequest.MakeRequest(urls.shards + new Date().getTime(), this.Success, this.Error);
    };

    function getUserAccounts(){
        this.successor = null;
    }
    getUserAccounts.prototype.ModifyHeaders = function(){

    };
    getUserAccounts.prototype.Success= function(response, body){
        var userAccounts = JSON.parse(body)
        if(this.successor != null){
            this.successor.personaId = userAccounts.userAccountInfo.personas[0].personaId;
            this.successor.personaName = userAccounts.userAccountInfo.personas[0].personaName;
            this.successor.ProcessRequest();
        }
    };
    getUserAccounts.prototype.Error= function(response, error){
        console.log(error);
    };
    getUserAccounts.prototype.ProcessRequest = function(){
        this.ModifyHeaders();
        futRequest.MakeRequest(urls.accounts, this.Success, this.Error);
    };

    function GetSessionId(){
        this.successor = null;
    }
    GetSessionId.prototype.ModifyHeaders = function(){
        var data = {
            clientVersion :1,
            gameSku: config.sku,
            identification: {
                'authCode' : ''
            },
            isReadOnly: false,
            locale: 'en-CA',
            method: 'authcode',
            nucleusPersonaDisplayName: this.personaName,
            nucleusPersonaId: this.personaId,
            nucleusPersonaPlatform: config.platform,
            priorityLevel: 4,
            sku: config.sku
        };
        futRequest.ModifyOptions({method: 'POST',  body: JSON.stringify(data)})
    };
    GetSessionId.prototype.Success= function(response, body){
        var jBody = JSON.parse(body);
        if(jBody.sid && this.successor){
            futRequest.ModifyHeadersConstantly({'X-UT-SID': jBody.sid});
            this.successor.ProcessRequest();
        } else {
            console.log('errorsid')
        }
    };
    GetSessionId.prototype.Error= function(response, error){
        console.log(error);
    };
    GetSessionId.prototype.ProcessRequest = function(){
        this.ModifyHeaders();
        futRequest.MakeRequest(urls.sid, this.Success, this.Error);
    };

    function GetPhishing(){
        this.successor = null;
    }
    GetPhishing.prototype.ModifyHeaders = function(){

    };
    GetPhishing.prototype.Success= function(response, body){
        var jBody = JSON.parse(body);
        if(jBody.sid && this.successor){
            futRequest.ModifyHeadersConstantly({'X-UT-SID': jBody.sid});
            this.successor.ProcessRequest();
        } else {
            console.log('errorsid')
        }
    };
    GetPhishing.prototype.Error= function(response, error){
        console.log(error);
    };
    GetPhishing.prototype.ProcessRequest = function(){
        this.ModifyHeaders();
        futRequest.MakeRequest(urls.sid, this.Success, this.Error);
    };

};