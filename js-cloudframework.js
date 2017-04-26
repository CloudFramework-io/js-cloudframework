/*!
 * JavaScript Cookie v2.1.4
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
;(function (factory) {
	var registeredInModuleLoader = false;
	if (typeof define === 'function' && define.amd) {
		define(factory);
		registeredInModuleLoader = true;
	}
	if (typeof exports === 'object') {
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;
			if (typeof document === 'undefined') {
				return;
			}

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				// We're using "expires" because "max-age" is not supported by IE
				attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				if (!converter.write) {
					value = encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
				} else {
					value = converter.write(value, key);
				}

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				var stringifiedAttributes = '';

				for (var attributeName in attributes) {
					if (!attributes[attributeName]) {
						continue;
					}
					stringifiedAttributes += '; ' + attributeName;
					if (attributes[attributeName] === true) {
						continue;
					}
					stringifiedAttributes += '=' + attributes[attributeName];
				}
				return (document.cookie = key + '=' + value + stringifiedAttributes);
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = parts[0].replace(rdecode, decodeURIComponent);
					cookie = converter.read ?
						converter.read(cookie, name) : converter(cookie, name) ||
						cookie.replace(rdecode, decodeURIComponent);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					if (key === name) {
						result = cookie;
						break;
					}

					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.set = api;
		api.get = function (key) {
			return api.call(api, key);
		};
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));

(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob()
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ]

    var isDataView = function(obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    }

    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    }
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift()
        return {done: value === undefined, value: value}
      }
    }

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      }
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1])
      }, this)
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var oldValue = this.map[name]
    this.map[name] = oldValue ? oldValue+','+value : value
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    name = normalizeName(name)
    return this.has(name) ? this.map[name] : null
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value)
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this)
      }
    }
  }

  Headers.prototype.keys = function() {
    var items = []
    this.forEach(function(value, name) { items.push(name) })
    return iteratorFor(items)
  }

  Headers.prototype.values = function() {
    var items = []
    this.forEach(function(value) { items.push(value) })
    return iteratorFor(items)
  }

  Headers.prototype.entries = function() {
    var items = []
    this.forEach(function(value, name) { items.push([name, value]) })
    return iteratorFor(items)
  }

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsArrayBuffer(blob)
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsText(blob)
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf)
    var chars = new Array(view.length)

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i])
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength)
      view.set(new Uint8Array(buf))
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function(body) {
      this._bodyInit = body
      if (!body) {
        this._bodyText = ''
      } else if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer)
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer])
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body)
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      }
    }

    this.text = function() {
      var rejected = consumed(this)
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body && input._bodyInit != null) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = String(input)
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this, { body: this._bodyInit })
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers()
    rawHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':')
      var key = parts.shift().trim()
      if (key) {
        var value = parts.join(':').trim()
        headers.append(key, value)
      }
    })
    return headers
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = 'status' in options ? options.status : 200
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = 'statusText' in options ? options.statusText : 'OK'
    this.headers = new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers
  self.Request = Request
  self.Response = Response

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init)
      var xhr = new XMLHttpRequest()

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        }
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
        var body = 'response' in xhr ? xhr.response : xhr.responseText
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);

Core = new function () {

    this.version = '1.0';
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
            if (Core.cache.isAvailable) {
                localStorage.setItem(key, value);
            }
        };
        this.get = function (key, value) {
            if (Core.cache.isAvailable) {
                localStorage.getItem(key);
            }
        };
        this.delete = function (key) {
            if (Core.cache.isAvailable) {
                localStorage.removeItem(key);
            }
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