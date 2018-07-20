# JS-CLOUDFRAMEWORK

This Javascript Framework has been developed to simplify many of the operation required for WebApps.

There are in the market dozens of different frameworks like React, Angular, Vue, JQuery etc.. But normally they require to include a lot of libraries, plugins, and the style of programming is quite different depending the of the philosophy.

JS-CLOUDFRAME does not try to replace any of other frameworks, just in one file you will have the power to accomplish complex features through the Core class and it push you to follow a methodology.
.
JS-CLOUDFRAMEWORK is a very straight-forward solutions as the result to develop hundred of projects and it is ready to interact with CloudFramework API services.

If you like it, use it :) it is free.. if not, at least be sure you can cover all these features explained in this document.

I hope you enjoy it.


## Project requirements

 - [Node](https://nodejs.org/en/)
 - [Yarn](https://yarnpkg.com/)

### Install/Update
```
sudo npm i -g npm to update 
sudo npm install -g bower
sudo npm install --global webpack
```

### Local development
 1. `yarn` - install dependencies
 2. `yarn serve` start hacking :)
 3. `yarn testserver` start testing :)
 
### Testing
http://phantomjs.org/download

# Basics

To start with js-cloudframework include it at the end of the HTML page

`<script src="{{path}}/cloudframework.min.js"></script>`

It will allow you to user the Core class.

## Core.version  [String]

Shows the current version of js-cloudframework

## Core.debug [Boolean]

If the value is true it activates debug messages in the console. Default is false
```
<script src="{{path}}/cloudframework.min.js"></script>
<script>
Core.debug = true; // set debug to true
```

## Core.authActive [Boolean]

If the value is true it activates the features of authentication of the Framework. It requires the use of cookies and the main cookie names is defined in Core.authCookieName (with the default value ‘cfauth’). Default is false
```
<script src="{{path}}/cloudframework.min.js"></script>
<script>
Core.debug = true;        // set debug to true
Core.authActive = true;   // set user Auhtentication capabilities to true
```

## Core.url [Object]

It an object with the methods to simplify the interaction with the URL params (url/param1/param2/etc..) and GET variables contained in the url (url?var1=value1&var2=value2)

## Core.log [Object]

It is an object with the methods to simplify the possibility to create Logs for better debug and programmer interaction.

## Core.error [Object]

It is an object with the methods to simplify the possibility to create Error messages for better debug and programmer interaction.

## Core.data [Object]

It is an object with the methods to simplify the set/get data in your WebApp

## Core.cookies [Object]

It is an object with the methods to simplify the interactions with cookies

## Core.cache [Object]

It is an object with the methods to simplify he possibility to use a cache in your WebApp.

## Core.request [Object]

It is an object with the methods to simplify GET/POST/PUT/DELETE async calls normally with thirth party APIs


## Core.config [Object]

It is an object with the methods to simplify the reading of config variables that you can store in de `<body core-config='{"json-var":"json-value"}'>` HTML tag.

## Core.localize [Object]

It is an object with the methods to simplify the possibility to handle multi-lang interfaces.

## Core.user [Object]

It is an object with the methods to simplify user authenticated info.

## Core.bind [Object]

It is an object with the methods to simplify the binding of different functions to be executed in a sequential order managing promises.

## Core.dynamic [Object]

It is an object with the methods to simplify the dynamic load of external javascripts avoiding multiple calls to the same script.

## Core.fileInput [Object]

It is an object with the methods to simplify the load of single/multiple files through javascript.

## Core.oauthpopup [Object]

It is an object with the methods to simplify the It creation of a popup avoiding blocking and execute callback once it has been closed.

## Core.init [Object]

Initialize js-framework
```
<script src="{{path}}/cloudframework.min.js"></script>
<script>
Core.debug = true;        // set debug to true
Core.authActive = true;   // set user Auhtentication capabilities to true
Core.init (null,function(response){
   Core.log.printDebug(“init app”,response);
});
```


# Creating your own WebApps based on CloudFrameWork

Based on js-cloudframework here we explain our recommendations to create a WebApp beyond you want to use another framework.

Create your own Interface class
HTML page
```
...
<script src="{{path}}/cloudframework.min.js"></script>
<script src="{{path}}/your.app.js"></script>
</body>
</html>
```
your.app.js
```
/*
 * Requires js-cloudframework.js to use Core class.
 * CloudFrameWorkInterface extends Core js-cloudframework objects
 */

CloudFrameWorkInterface = new function () {

   // ------------------
   // Init Bloombees App
   // ------------------
   this.init = function (callback) {
      var initFunctions = [];
      Core.init(initFunctions,callback);
   }
}

CloudFrameWorkInterface.init(function(response){
    if(response.success) {
       // Do more things
    }
    else {
       Core.error.add(response);
    }
});
```

Whatever method or interaction that is required with your Webapp (even if it needs to be divided in different modules) should start with your own class.
