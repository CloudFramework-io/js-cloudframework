Core = new function () {

    this.version = '1.0.8';
    this.debug = false;
    this.params = function (pos) {
        var path = window.location.pathname.split('/');
        path.shift();
        if(typeof pos == 'undefined') {
            return path;
        } else {
            return (path[pos])?path[pos]:null;
        }
    };
    this.formParams = function (name) {
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
    };
    this.log =  new function () {
        this.debug = false;
        this.type = 'console';

        // Print if debug == false
        this.printDebug = function(title,content,separator) {
            // If no debug return
            if (!Core.log.debug) return;
            Core.log.print(title,content,separator);
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
    this.error = new function () {
        this.add = function (title, content,separator) {
            // If no title, print:
            if (typeof title == 'undefined') title = '[Core.error]:';
            else if(typeof title =='string') title = '[Core.error]: '+title;
            Core.log.print(title,content,true);
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
            if(typeof payload['method'] == 'undefined') return Core.error.add('request.call(payload,..): missing payload["method"].');

            // ACCEPTED VALUES:form or json
            if(typeof payload['contentType'] == 'undefined') payload['contentType'] ='json';

            // ACCEPTED VALUES: html,json
            if(typeof payload['responseType'] == 'undefined') payload['responseType'] ='json';

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
            if(endpoint.search('http') !== 0) endpoint = Core.request.base+endpoint;

            // Mode of the call
            if(typeof payload['mode'] == 'undefined') payload['mode'] = 'cors';

            // Credentials of the call: include, same-origin, none
            if(typeof payload['credentials'] == 'undefined') payload['credentials'] = 'none';

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
            } else {
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
            fetch(endpoint, {
                method: payload['method'],
                headers: payload.headers,
                mode:payload['mode'] ,
                credentials: payload['credentials'],
                body: payload['body']
            }).then(function (response) {
                if(Core.debug) Core.log.printDebug('Core.request.call returning from: '+endpoint,'Tranforming from: '+payload['responseType'],true);
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
                    Core.error.add('[Error] request.call(' + endpoint+') '+e);
                    errorcallback(e);
                }
            );
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
    this.cache =  new function () {

        this.isAvailable = true;

        if (typeof(Storage) == "undefined") {
            Core.error.add('Cache is not supported in this browser');
            this.available = false;
        };

        this.set = function (key, value) {
            if (Core.debug) Core.log.printDebug('Core.cache.set("' + key+'",..)');

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
            if (Core.debug) Core.log.printDebug('Core.cache.get("' + key+'",..)');

            if (Core.cache.isAvailable) {
                key = 'CloudFrameWorkCache_'+key;
                var ret = localStorage.getItem(key);
                if(typeof ret != undefined && ret != null) {
                    ret = JSON.parse(LZString.decompress(ret));
                    if(typeof ret['__object'] != 'undefined') ret = ret.__object;
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
    this.cookies =  new function () {
        this.path = {path: '/'};
        this.remove = function (varname) {
            if (typeof varname != 'undefined') {
                Cookies.remove(varname, Core.cookies.path);
                if (Core.debug) Core.log.printDebug('removed cookie ' + varname);
            }
        };
        this.set = function (varname, data) {
            Cookies.set(varname, data, Core.cookies.path);
            if (Core.debug) Core.log.printDebug('set cookie ' + varname);
        };
        this.get = function (varname) {
            return Cookies.get(varname);
        };
    };
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
                if(Core.formParams('_debugDics')) return localizevar
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

    this.user = new function () {
        this.auth = false;      // Authenticated true or false
        this.info = {};         // User information when authenticated
        this.cookieVar = null;  // Cookie to use for authentication id

        // Set Authentication to true of false
        this.setAuth = function(val,cookieVar) {

            // No authentication values by default
            Core.user.info = {};
            Core.user.credentials = {};
            Core.user.auth=false;
            Core.user.cookieVar = null;
            Core.cache.set('CloudFrameWorkAuthUser',{});

            // Activating Authentication
            if(val) {
                cookieValue = Core.cookies.get(cookieVar);
                if(typeof cookieValue == 'undefined' || !cookieValue) {
                    Core.error.add('Core.user.setAuth(true,"'+cookieVar+'"), cookieVar does not exist');
                    return false;
                } else {
                    Core.user.auth=true;
                    Core.user.cookieVar = cookieVar;
                    Core.cache.set('CloudFrameWorkAuthUser',{__id:cookieValue});
                    Core.user.info = {__id:cookieValue};

                }
            }
            // Finalizing deactivating authentication
            else {
                // Delete cookieVar if it is passed
                if(typeof cookieVar != 'undefined') Core.cookies.remove(cookieVar);
            }
            return true;

        };

        // If you want to recover data avoiding to do extra call.. use init
        this.init = function (cookieVar) {

            var value = Core.cookies.get(cookieVar);
            if(!(value = Core.cookies.get(cookieVar))) {
                Core.user.setAuth(false);
            } else {
                var cache = null;
                if(cache = Core.cache.get('CloudFrameWorkAuthUser')) {
                    if(typeof cache['__id'] == undefined || cache['__id']!=value) {
                        Core.user.setAuth(false);
                    } else {
                        Core.user.auth=true;
                        Core.user.info = cache;
                    }
                }
            }
        }

        // Says if a user is auth
        this.isAuth = function() {
            return (Core.user.auth==true);
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
};