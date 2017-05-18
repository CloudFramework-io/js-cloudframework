Core = new function () {
    this.version = '1.1.9';
    this.debug = false;
    this.authActive = false;
    this.authCookieName = 'cfauth';

    this.url = new function () {
        this.params = function(pos) {
            var path = window.location.pathname.split('/');
            path.shift();
            if(typeof pos == 'undefined') {
                return path;
            } else {
                return (path[pos])?path[pos]:null;
            }
        }
        this.formParams = function(name) {
            if(typeof name == 'undefined') {
                var results = new RegExp('[\?&](.*)').exec(window.location.href);
                if(null == results) return '';
                else return results[1] || 0;
            }
            // Else search for the field
            else {
                var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
                if (results == null) {
                    results = new RegExp('[\?&](' + name + ')[&#$]*').exec(window.location.href);
                    if (results == null) return null;
                    else return true;
                } else {
                    return results[1] || 0;
                }
            }
        }
        // hash, host, hostname, href, origin, pathname, port, protocol
        this.parts = function(part) {
            if(typeof part=='undefined') return window.location;
            else return window.location[part];
        }
    };

    // Log class control. printDebug requires debug = true
    this.log =  new function () {
        this.debug = true;
        this.type = 'console';

        // Print if debug == false
        this.printDebug = function(title,content,separator) {
            // If no debug return
            if (!Core.log.debug) return;
            Core.log.print('[DEBUG] '+title,content,separator);
        };

        // Print in console.
        this.print = function (title, content,separator) {

            // If no title, print:
            if (typeof title == 'undefined') title = 'print:';

            // If no content: ''
            if (typeof content == 'undefined') content = false;



            // ECHO INFO
            // in console
            if (Core.log.type == 'console') {
                if (typeof title == 'object') title = JSON.parse(JSON.stringify(title));
                if (typeof content == 'object')  content = JSON.parse(JSON.stringify(content));

                console.log(title);
                if (content) {
                    console.log(content);
                }
            }
            // in the dom
            else {

                if (typeof title == 'object') title = JSON.stringify(title);
                if (typeof content == 'object')  content = JSON.stringify(content);

                // Separator
                if (typeof separator == 'undefined') separator = false;

                // Echo
                var output = title;
                if(content)  output +=content;
                if(separator)  output +="\n-----------\n";

                if((element = document.getElementById(Core.log.type))!=null) {
                    element.innerHTML = element.innerHTML+output;
                } else {
                    console.log('Core.log.type values '+Core.log.type+' and it does not exist as a id dom');
                    console.log(output);
                }

            }
        };

    };

    // Error class control.
    this.error = new function () {
        this.add = function (title, content,separator) {
            // If no title, print:
            if (typeof title == 'undefined') title = '[Core.error]:';
            else if(typeof title =='string') title = '[Core.error]: '+title;
            Core.log.print(title,content,true);
        };
    };

    // No persistent data. If reload page the info will be lost.
    this.data = new function () {

        this.info = {};

        this.add = function(data) {

            if (Core.debug) Core.log.printDebug('Core.data.add(' + JSON.stringify(varname)+');');

            if(typeof data !='object') {
                Core.error.add('Core.data.add(data)','data is not an object');
                return false;
            }

            for(k in data) {
                Core.data.info[k] = data[k];
            }
            return true;
        }

        this.set = function(key,value) {

            if (Core.debug) Core.log.printDebug('Core.data.set("'+key+'",' + JSON.stringify(value)+');');

            if(typeof key !='string') {
                Core.error.add('Core.data.set(key,value)','key is not a string');
                return false;
            }

            Core.data.info[key] = value;
            return true;
        }

        this.get = function(key) {
            if (Core.debug) Core.log.printDebug('Core.data.get("'+key+'");');

            if(typeof key =='undefined') return;

            return(Core.data.info[key]);
        }

        this.reset = function() {
            Core.data.info = {};
        }
    };

    // Manage Cookies based on js-cookies
    this.cookies =  new function () {
        this.path = {path: '/'};
        this.remove = function (varname) {
            if (typeof varname != 'undefined') {
                Cookies.remove(varname, Core.cookies.path);
                if (Core.debug) Core.log.printDebug('Core.cookies.remove("' + varname+'");');
            }
        };
        this.set = function (varname, data) {
            Cookies.set(varname, data, Core.cookies.path);
            if (Core.debug) Core.log.printDebug('Core.cookies.set("' + varname+'","'+data+'");');
        };
        this.get = function (varname) {
            return Cookies.get(varname);
        };
    };

    // Persistent data. Reloading the page the info will be kept in the localStorage compressed if the browser support it
    // It requires LZString: bower install lz-string --save
    this.cache =  new function () {

        this.isAvailable = true;

        if (typeof(Storage) == "undefined") {
            Core.error.add('Cache is not supported in this browser');
            this.available = false;
        };

        this.set = function (key, value) {
            if (Core.debug) Core.log.printDebug('Core.cache.set("' + key+'",'+JSON.stringify(value)+')');

            if (Core.cache.isAvailable) {
                key = 'CloudFrameWorkCache_'+key;
                if(typeof value == 'object') value = JSON.stringify(value);
                else value = JSON.stringify({__object:value});
                // Compress
                value = LZString.compress(value);
                localStorage.setItem(key, value);

                // Return
                return true;
            }
            return false;
        };
        this.get = function (key) {
            if (Core.debug) Core.log.printDebug('Core.cache.get("' + key+'")');

            if (Core.cache.isAvailable) {
                key = 'CloudFrameWorkCache_'+key;
                var ret = localStorage.getItem(key);
                if(typeof ret != undefined && ret != null) {
                    ret = JSON.parse(LZString.decompress(ret));
                    if(typeof ret['__object'] != 'undefined') ret = ret['__object'];
                }
                return ret;

            }
            return false;
        };

        this.delete = function (key) {
            if (Core.debug) Core.log.printDebug('Core.cache.delete("' + key+'",..)');
            if (Core.cache.isAvailable) {
                key = 'CloudFrameWorkCache_'+key;
                localStorage.removeItem(key);
                return true;
            }
            return false;
        };
    };

    // It requires fetch polyfill: bower install fetch --save
    this.request = new function () {
        this.token = ''; // X-DS-TOKEN sent in all calls
        this.key = ''; // X-WEB-KEY sent in all calls
        this.headers = {};
        this.base = 'https://cloudframework.com/h/api';

        // Object into query string
        this.serialize = function (obj, prefix) {
            var str = [], p;
            for(p in obj) {
                if (obj.hasOwnProperty(p)) {
                    var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
                    str.push((v !== null && typeof v === "object") ?
                        Core.request.serialize(v, k) :
                        encodeURIComponent(k) + "=" + encodeURIComponent(v));
                }
            }
            return str.join("&");
        };

        // Ajax Call
        this.call = function call(payload,callback, errorcallback) {

            // IF url does not start with http..this.base will be prepended.
            if(typeof payload['url'] == 'undefined') return Core.error.add('request.call(payload,..): missing payload["url"].');

            // GET, POST, PUT, DELETE
            if(typeof payload['method'] == 'undefined') payload['method'] ='GET';

            // ACCEPTED VALUES:form or json
            if(typeof payload['contentType'] == 'undefined') payload['contentType'] ='json';

            // ACCEPTED VALUES: html,json
            if(typeof payload['responseType'] == 'undefined') payload['responseType'] ='json';

            // Add prefix to url
            if(typeof payload['base'] == 'undefined') payload['base'] = Core.request.base;

            // OK CALLBACK
            if (typeof callback == 'undefined' || callback==null) {
                callback = function(response) {
                    console.log(response);
                }
            }

            // ERROR CALLBACK
            if (typeof errorcallback == 'undefined' || errorcallback==null)
                errorcallback = callback;

            // ADD GLOBAL HEADERS IR THE VALUES DOES NOT EXIST
            if(typeof payload['headers'] == 'undefined') payload['headers'] = {};
            for (var k in Core.request.headers) {
                if(typeof payload['headers'][k] == 'undefined')
                    payload['headers'][k] = Core.request.headers[k];
            }

            // CLOUDFRAMEWORK ADDONS: X-DS-TOKEN, X-WEB-KEY
            if (typeof Core.request.token != 'undefined' && Core.request.token != '')
                payload['headers']['X-DS-TOKEN'] = Core.request.token;
            if (typeof Core.request.key != 'undefined' && Core.request.key != '')
                payload['headers']['X-WEB-KEY'] = Core.request.key;


            // END-POINT URL generation
            var endpoint = payload['url'];
            if(endpoint.search('http') !== 0) {
                endpoint = payload['base']+endpoint;
            }

            // Mode of the call: cors, no-cors, same-origin
            if(typeof payload['mode'] == 'undefined') {
                payload['mode'] = 'cors';
            }
            else {
                if((payload['mode']!='cors') && (payload['mode']!='no-cors') && (payload['mode']!='same-origin'))
                    payload['credentials'] = 'cors';
            }

            // Credentials of the call: include, same-origin, omit.. other value crash on mobile browsers
            if(typeof payload['credentials'] == 'undefined') {
                payload['credentials'] = 'omit';
            }
            else {
                if((payload['credentials']!='include') && (payload['credentials']!='same-origin'))
                    payload['credentials'] = 'omit';
            }

            // cache for the call: default, no-store, reload, no-cache, force-cache, or only-if-cached
            if(typeof payload['cache'] == 'undefined') {
                payload['cache'] = 'default';
            }
            else {
                if((payload['cache']!='no-store') && (payload['cache']!='reload') && (payload['cache']!='no-cache') && (payload['cache']!='force-cache') && (payload['cache']!='only-if-cached'))
                    payload['cache'] = 'default';
            }

            if(typeof payload['params'] == 'undefined') payload['params'] = {};


            // TRANSFORM DATA
            if(payload['method']=='GET') {
                payload['body'] = null;
                var serialize = '';
                if(Object.keys(payload['params']).length) serialize = Core.request.serialize(payload['params']);
                if(serialize) {
                    if(endpoint.search('[\?]')==-1) endpoint+='?';
                    else endpoint+='&';
                    endpoint+=serialize;
                }
            } else if(payload['method']!='DELETE') {
                // Preparing the content type
                if(payload['contentType']=='json') {
                    payload['headers']['Content-Type'] = 'application/json';
                    payload['body'] = JSON.stringify(payload['params']);
                }
                // Using formData
                else {
                    payload['headers']['Content-Type'] = 'application/x-www-form-urlencoded';
                    var form_data = new FormData();
                    for(var k in payload['params'])
                        form_data.append(k,payload['params'][k]);

                    payload['body'] = form_data;

                }
            }

            // Debug
            if(Core.debug) Core.log.printDebug('Core.request.call',payload,true);

            // Int the call
            var call = {
                method: payload['method'],
                headers: payload.headers,
                mode:payload['mode'] ,
                cache:payload['cache'] ,
                credentials: payload['credentials']
            };

            // Avoid to add body if payload['body'] does not exist
            if(typeof payload['body'] != 'undefined' && payload['body']!= null) call['body'] = payload['body'];

            fetch(endpoint, call).then(function (response) {
                if(Core.debug) Core.log.printDebug('Core.request.call returning from: '+endpoint+' and transforming result from: '+payload['responseType']);
                if(payload['mode']=='no-cors') {
                    return(response);
                } else {
                    // Transform Reutrn
                    if(payload['responseType'] == 'json')
                        return(response.json());
                    else
                        return(response.text());
                }

            }).then(function (response) {
                callback(response);
            }).catch(function (e) {
                if(typeof e == 'undefined') e = '';
                Core.error.add('[Core.request] fetch(' + endpoint+') ',e.message);
                console.log(e);
                errorcallback({success:false,errors:['see console']});
            });
        }
        this.get = function (endpoint, callback, errorcallback, typeReturnedExpected) {
            Core.request.call({method:'GET',url:endpoint,responseType:typeReturnedExpected}, callback, errorcallback);
        };

        // Headers manipulations
        this.addHeader = function(varname,value) {
            if(Core.debug) Core.log.printDebug('Core.request.addHeader("'+varname+'","'+value+'")');
            Core.request.headers[varname] = value;
        };
        this.removeHeader = function(varname) {
            if(Core.debug) Core.log.printDebug('Core.request.removeHeader("'+varname+'")');
            delete Core.request.headers[varname];
        };
        this.resetHeader = function() {
            if(Core.debug) Core.log.printDebug('Core.request.resetHeader()');
            Core.request.headers = {};
        };
    };

    // Define services to use with Core.request
    this.services = new function() {
        var binds = {};

        // Reset the Bind
        this.reset = function(service) {
            Core.log.printDebug('Bloombees services: reset.'+service);
            if(typeof binds[service] != 'undefined') {
                binds[service]= {config:binds[service]['config']};
            }
        };

        // Add Service
        // config requires:
        // url:
        // method:
        // data:
        this.set = function(service,config) {
            binds[service]=[];
            if(typeof config['url'] == 'undefined') return Core.error.add('Core.services.set("'+service+'",config): missing config["url"].');
            if(typeof config['method'] == 'undefined') return Core.error.add('Core.services.set("'+service+'",config): missing config["method"].');
            binds[service]['config'] = config;
            if(Core.debug) Core.log.printDebug('Core.services.set("'+service+'","'+JSON.stringify(config)+'"): done');
        }

        // Bind the function for a service
        this.bind = function (service,function_definition) {

            // If there is not function return the result into log
            if(typeof binds[service]=='undefined') return(Core.error.add('service.bind("'+service+'",..) does not exist. Use Core.service.set to initialize'));
            if(typeof binds[service]['config']=='undefined') return(Core.error.add('service.bind("'+service+'",..) does not exist. Use Core.service.set to initialize'));

            // Log
            if(Core.debug) Core.log.printDebug("Binding to '"+service+"':");

            // Service can not be undefined. convert into string
            if(typeof service=='undefined') service='undefined';

            // If there is not function return the result into log
            if(typeof function_definition=='undefined') function_definition= function (data) {
                Core.log.print('Core.services.bind automatic created function: '+service,data);
            };

            // If the bind does not exist. Create it
            if(typeof binds[service] == 'undefined') binds[service] = [];

            // If we have returned the data
            if(typeof binds[service]['data'] != 'undefined') {
                if(Core.debug) Core.log.printDebug('service.bind("'+service+'",..) returning data from previous call');
                function_definition(binds[service]['data']);
                return;
            }

            // If the bind callbacks does not exist. Create it
            if(typeof binds[service]['callbacks'] == 'undefined') binds[service]['callbacks'] = [];
            binds[service]['callbacks'].push(function_definition);
            if(Core.debug) Core.log.printDebug('Bingding callback');

            // Callbacks function when the call has been defined
            if(typeof binds[service]['function'] == 'undefined') {

                // Function to receive the response.
                binds[service]['function'] = function(data) {
                    if(Core.debug) Core.log.printDebug('Receiving response from: '+service,'',true);
                    binds[service]['data'] = data;
                    var arrayLength = binds[service]['callbacks'].length;
                    for (var i = 0; i < arrayLength; i++) {
                        binds[service]['callbacks'][i](data);
                    }

                };
                Core.request.call(binds[service]['config'],binds[service]['function']);
            }
        }
    };

    // deprecated
    this.dom = new function() {

        // Search the element in the dom
        this.element = function(id) {
            var element = document.getElementById(id);
            if(null == element ) {
                Core.log.print("'"+id+"' does not exist in any 'id' attribute of the dom's elements");
                return null;
            } else {
                return(element);
            }
        }

        // Add content
        this.setHTML = function (id,value,append) {
            //if(Core.debug) Core.log.printDebug('Core.dom.setHTMLL("'+id+'","'+value+'")');
            Core.dom._setHTML(id,value);
        }

        // Add content
        this.addHTML = function (id,value) {
            //if(Core.debug) Core.log.printDebug('Core.dom.addHTML("'+id+'","'+value+'")','',true);
            Core.dom._setHTML(id,value,true);
        }

        // inject the content
        this._setHTML = function (id,value,append) {
            if(element = Core.dom.element(id)) {
                if(typeof append != 'undefined')
                    element.innerHTML = element.innerHTML+value;
                else
                    element.innerHTML = value;
            }
        }


    };

    // Manage configuration. It takes <body coore-config='JSON' ..> to init
    this.config = new function () {
        this.config = null;
        if(null==this.config && (body = document.getElementsByTagName("BODY")[0].getAttribute("core-config"))) {
            this.config = JSON.parse(body);
        } else {
            this.config = {};
        }
        this.get = function(configvar) {
            if(Core.debug) Core.log.printDebug('Core.debug.get("'+configvar+'")','',true);
            if(typeof  configvar == 'undefined') {
                return Core.config.config;
            } else {
                return (Core.config.config[configvar])?Core.config.config[configvar]:null;
            }
        }
        this.set = function(configvar,value) {
            if(Core.debug) Core.log.printDebug('Core.debug.set("'+configvar+'","'+value+'")','',true);
            Core.config.config[configvar]=value;
            return true;
        }
    };

    // Localize contents
    this.localize = new function () {
        this.dics = null;
        this.lang = 'en';

        if(null==this.dics && (body = document.getElementsByTagName("BODY")[0].getAttribute("core-localize"))) {
            this.dics = JSON.parse(body);
        } else {
            this.dics={};
        }

        if((lang = document.getElementsByTagName("BODY")[0].getAttribute("core-lang"))) {
            this.lang = lang;
        }

        // Return a dictionary tag
        this.get = function(localizevar) {
            if(Core.debug) Core.log.printDebug('Core.localize.get("'+localizevar+'")','',true);
            if(typeof  localizevar == 'undefined') {
                return Core.localize.dics;
            } else {
                if(Core.url.formParams('_debugDics')) return localizevar
                else return (typeof Core.localize.dics[localizevar] != 'undefined')?Core.localize.dics[localizevar]:localizevar;

            }
        }

        this.set = function(localizevar,value) {
            if(Core.debug) Core.log.printDebug('Core.debug.set("'+localizevar+'","'+value+'")','',true);
            Core.localize.dics[localizevar]=value;
            return true;
        }

        this.addFromId = function(id) {
            if((element = document.getElementById(id))) {
                if(localize = element.getAttribute("core-localize")) {
                    return(Core.localize.add(JSON.parse(localize)));
                }
            }
            return false;
        }

        this.add = function(dic) {
            if(Core.debug) Core.log.printDebug('Core.debug.set("'+JSON.stringify(dic)+'","'+value+'")','',true)
            for(k in dic) {
                Core.localize.dics[k]=dic[k];
            }
            return true;
        }
    };

    // Managin User info
    this.user = new function () {
        this.auth = false;      // Authenticated true or false
        this.info = {};         // User information when authenticated
        this.cookieVar = null;  // Cookie to use for authentication id

        // If you want to recover data avoiding to do extra call.. use init
        this.init = function (cookieVar) {

            if(!Core.authActive) {
                Core.error.add('Core.user.init: Core.authActive is false');
                return;
            }

            // Calculationg cookieVar if it is not passed
            if(typeof cookieVar =='undefined') {
                if(Core.debug) Core.log.printDebug('Core.user.init: using Core.authCookieName ['+Core.authCookieName+']');
                Core.user.cookieVar = Core.authCookieName;
                cookieVar = Core.user.cookieVar;
            } else {
                Core.user.cookieVar = cookieVar;
            }

            if(typeof cookieVar == null) {
                Core.error.add('Core.user.init: missing cookieVar')
                return;
            }

            if(Core.debug) Core.log.printDebug('Core.user.init("'+cookieVar+'");');
            var value = Core.cookies.get(cookieVar);
            if(!value) {
                if(Core.debug) Core.log.printDebug('Core.user.init: '+cookieVar+' cookie does not have any value.. so Core.user.setAuth(false)');
                if(Core.user.auth) Core.user.setAuth(false);
            } else {
                var cache = null;
                // getting CloudFrameWorkAuthUser
                if(cache = Core.cache.get('CloudFrameWorkAuthUser')) {
                    if(typeof cache['__id'] == undefined || cache['__id']!=value) {
                        if(Core.debug) Core.log.printDebug('Core.user.init: CloudFrameWorkAuthUser {__id:value } DOES NOT MATCH with the value of the cookie '+cookieVar+', so... restart');
                        Core.user.setAuth(true);
                    } else {
                        if(Core.debug) Core.log.printDebug('Core.user.init: CloudFrameWorkAuthUser {__id:value} match with the value of the cookie '+cookieVar);
                        Core.user.auth=true;
                        Core.user.info = cache;
                    }
                }
                // The cookie exist but it has not been generated by setAuth because CloudFrameWorkAuthUser does not exist.. So generate it now.
                else {
                    if(Core.debug) Core.log.printDebug('Core.user.init: Generating a CloudFrameWorkAuthUser {__id:value} for cookie '+cookieVar);
                    Core.user.setAuth(true);
                }
            }
            if(Core.debug) Core.log.printDebug('Core.isAuth(): '+Core.user.isAuth());

        }

        // Set Authentication to true of false
        this.setAuth = function(val) {

            // Assign the current cookie var
            cookieVar = Core.user.cookieVar;

            if(typeof cookieVar =='undefined' || cookieVar == null) {
                Core.error.add('Core.user.setAuth: missing Core.user.cookieVar. Try use Core.init()');
                return;
            }

            if(Core.debug) Core.log.printDebug('Core.user.setAuth('+val+') for cookie: '+cookieVar);

            // No authentication values by default
            Core.user.info = {};
            Core.user.credentials = {};
            Core.user.auth=false;
            Core.cache.set('CloudFrameWorkAuthUser',{});


            // Activating Authentication
            cookieValue = Core.cookies.get(cookieVar);
            if(val) {
                if(typeof cookieValue == 'undefined' || !cookieValue) {
                    Core.error.add('Core.user.setAuth(true), cookieVar does not exist: '+cookieVar);
                    return false;
                } else {
                    Core.user.auth=true;
                    Core.cache.set('CloudFrameWorkAuthUser',{__id:cookieValue});
                    Core.user.info = {__id:cookieValue};
                    if(Core.debug) Core.log.printDebug('Core.user.setAuth: saved CloudFrameWorkAuthUser in cache with value '+JSON.stringify(Core.cache.get('CloudFrameWorkAuthUser')));
                }
            }
            // Finalizing deactivating authentication
            else {
                // Delete cookieVar if it is passed
                if(typeof cookieValue != 'undefined') Core.cookies.remove(cookieVar);
            }
            return true;

        };

        // Says if a user is auth
        this.isAuth = function() {
            return (Core.user.auth==true);
        }

        this.getCookieValue = function() {
            if(Core.user.cookieVar) return Core.cookies.get(Core.user.cookieVar);
            else return null;
        }

        this.add = function(data) {

            if(typeof data !='object') {
                Core.error.add('Core.user.add(data)','data is not an object');
                return false;
            }
            if(Core.user.isAuth()) {
                for(k in data) {
                    Core.user.info[k] = data[k];
                }
                Core.cache.set('CloudFrameWorkAuthUser',Core.user.info);
                return true;
            } else {
                Core.error.add('Core.user.add','Core.user.isAuth() is false');
                return false;
            }
        }

        this.set = function(key,value) {

            if(typeof key !='string') {
                Core.error.add('Core.user.set(key,value)','key is not a string');
                return false;
            }

            if(Core.user.isAuth()) {
                if(key=='__id') {
                    Core.error.add('Core.user.set(key,value)','key can not be __id');
                    return false;
                }
                Core.user.info[key] = value;
                Core.cache.set('CloudFrameWorkAuthUser',Core.user.info);
                return true;
            } else {
                Core.error.add('Core.user.set(key,value)','Core.user.isAuth() is false');
                return false;
            }
        }

        this.get = function(key) {
            if(typeof key =='undefined') return;

            if(Core.user.isAuth()) {
                return(Core.user.info[key]);

            } else {
                Core.error.add('Core.user.get','Core.user.isAuth() is false');
                return false;
            }
        }

        this.reset = function() {
            if(Core.user.isAuth()) {
                Core.user.info = {__id:Core.user.info['__id']};
                Core.cache.set('CloudFrameWorkAuthUser',Core.user.info);
                return true;
            } else {
                Core.error.add('Core.user.set(key,value)','Core.user.isAuth() is false');
                return false;
            }
        }
    };

    // Bind function based on promises
    this.bind = function(functions,callback,errorcallback) {

        // OK CALLBACK
        if (typeof callback == 'undefined' || callback==null) {
            callback = function(response) {
                console.log(response);
            }
        }

        // ERROR CALLBACK
        if (typeof errorcallback == 'undefined' || errorcallback==null)
            errorcallback = callback;

        var states = [];
        if(typeof functions == 'function') functions = [functions];
        // Execute all the function generating a promise for each of them
        for(k in functions) {
            states[k] = new Promise(functions[k]);
        }

        //
        var promises = Promise.all(states);
        promises.then(function(){
            callback({success:true});
        }, function() {
            errorcallback({success:false});
        })
    };

    // load dynamically scripts
    this.dynamic = new function() {
        this.urls = {};

        this.load = function(data,callback) {

            var script = '';
            var template = '';

            if(typeof data == 'object' && typeof data.script == 'object' && typeof data.script.url == 'string')  script = data.script.url;
            if(typeof data == 'object' && typeof data.template == 'object' && typeof data.template.url == 'string')  template = data.template.url;

            if(script=='' && template=='') {
                Core.error.add('Core.dynamic.load(data,callback) Missing a right value for data. use {[script:{url:"url"}][,template:{url:"url"}]}');
                if(typeof callback) callback();
            } else {
                // Load first the template and after that the script if it applies
                if(template!='') {
                    var localCallBack = function() {
                        if(script!='')    {
                            Core.dynamic.loadScript(data,callback);
                        } else {
                            if(typeof callback!='undefined') callback();
                        }
                    }
                    Core.dynamic.loadTemplate(data,localCallBack);
                } else {
                    Core.dynamic.loadScript(data,callback);
                }
            }
        }

        this.loadScript = function(data,callback) {

            var url = '';
            var id = '';
            var type = 'text/javascript';
            var dom = document.head;

            if(typeof data.script == 'object') {
                if(typeof data.script.url == 'string')  url = data.script.url;
                if(typeof data.script.type == 'string')  type = data.script.type;
                if(typeof data.script.id == 'string')  id = data.script.id;
                if(typeof data.script.dom == 'object')  dom = data.script.dom;
            }
            if(url=='') {
                Core.error.add('Core.dynamic.loadTemplate(data,callback) Missing a right value for data. use {template:url}');
                if(typeof callback) callback();
            } else {
                if(typeof Core.dynamic.urls[url] == 'undefined') {
                    if(Core.debug) Core.log.printDebug('Core.dynamic.loadScript("'+JSON.stringify(data)+'") injecting script');
                    Core.dynamic.urls[url] =  document.createElement('script');
                    Core.dynamic.urls[url].type = type;
                    if(id!='') Core.dynamic.urls[url].id = id;
                    Core.dynamic.urls[url].onload = function( ret) {
                        Core.log.print('Core.dynamic.loadScript("'+url+'") loaded');
                        if(typeof callback=='undefined') {
                            Core.log.print(url+' loaded');
                        } else {
                            callback();
                        }
                    }
                    Core.dynamic.urls[url].src = url;
                    dom.appendChild(Core.dynamic.urls[url]);

                } else {
                    if(Core.debug) Core.log.printDebug('Core.dynamic.loadScript("'+url+'") already loaded');
                    if(typeof callback!='undefined') {
                        callback();
                    }
                }
            }
        }

        this.loadTemplate = function(data,callback) {

            var url = '';
            var object = 'div';
            var id = '';
            var type = '';
            var dom = document.body;

            if(typeof data.template == 'object') {
                if(typeof data.template.url == 'string')  url = data.template.url;
                if(typeof data.template.object == 'string')  object = data.template.object;
                if(typeof data.template.id == 'string')  id = data.template.id;
                if(typeof data.template.type == 'string')  type = data.template.type;
                if(typeof data.template.dom == 'object')  dom = data.template.dom;
            }
            if(url=='') {
                Core.error.add('Core.dynamic.loadTemplate(data,callback) Missing a right value for data. use {template:url}');
                if(typeof callback) callback();
            } else {

                if(typeof Core.dynamic.urls[url] == 'undefined') {
                    if(Core.debug) Core.log.printDebug('Core.dynamic.loadTemplate("'+JSON.stringify(data)+',callback") injecting html');
                    Core.request.call({method:'GET',url:url,responseType:'html',base:''}, function(response) {

                        Core.log.print('Core.dynamic.loadTemplate("'+url+'") loaded');
                        Core.dynamic.urls[url] =  document.createElement(object);
                        if(id!='') Core.dynamic.urls[url].id = id;
                        if(type!='') Core.dynamic.urls[url].type = type;
                        Core.dynamic.urls[url].innerHTML = response;
                        dom.appendChild(Core.dynamic.urls[url]);
                        if(typeof callback!='undefined') {
                            callback();
                        }
                    });

                    //document.head.appendChild(Core.dynamic.urls[url]);
                } else {
                    if(Core.debug) Core.log.printDebug('Core.dynamic.loadTemplate("'+url+'") already loaded');
                    if(typeof callback!='undefined') {
                        callback();
                    }
                }

            }
        }
    }

    // File input helper
    // field expeted a dom.input of type file
    this.fileInput = function (field,payloads) {
        var ret = {length:0,error:false,errorMsg:'',params:[],files:[]};
        if(typeof field =='object') {
            if (field.files.length) {
                for (k = 0; k < field.files.length; k++) {
                    ret.params['files[' + k + ']'] = field.files[k];
                    ret.files[k] = {
                        name: field.files[k].name,
                        size: field.files[k].size,
                        type: field.files[k].type,
                        lastModified: field.files[k].lastModified,
                        lastModifiedDate: field.files[k].lastModifiedDate
                    };
                }
            } else {
                ret.error=true;
                ret.errorMsg ='Not found files';
            }
        }
        return ret;
    }

    // Init the frameWork
    this.init = function(functions,callback) {

        if(Core.debug) Core.log.printDebug('Core.init('+typeof functions+','+typeof callback+')');

        // Check auth
        if(Core.authActive) {
            Core.user.init(Core.authCookieName);
        }

        if(typeof functions == 'function' || typeof functions == 'array' || typeof functions == 'object') {
            Core.bind(functions,function(response) {
                if(typeof callback == 'function')  callback(response);
            });
        } else {
            if(typeof callback == 'function') callback({success:true});
        }

    }

    // It generates a popup avoiding blocking and execute callback once it has finished.
    this.oauthpopup = function(options) {
        options.windowName = options.windowName ||  'ConnectWithOAuth'; // should not include space for IE
        options.windowOptions = options.windowOptions || 'location=0,status=0,width=800,height=400';
        options.callback = options.callback || function(){ window.location.reload(); };
        var that = this;
        console.log(options.path);
        that._oauthWindow = window.open(options.path, options.windowName, options.windowOptions);
        that._oauthWindow.focus();
        that._oauthInterval = window.setInterval(function(){
            if (that._oauthWindow.closed) {
                window.clearInterval(that._oauthInterval);
                options.callback();
            } else {
                that._oauthWindow.focus();
            }

        }, 1000);
    };

};
