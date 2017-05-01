Core.debug=true;
Core.authActive=true;
var coreConfigModel = function () {
    this.coreDebug = ko.observable(Core.debug);
    this.coreVersion = Core.version;

    this.changeCoreDebug = function () {
        Core.debug = !Core.debug;
        this.coreDebug(Core.debug);
        return true;
    }


    this.coreAuthAcive = ko.observable(Core.authActive);
    this.changeCoreAuthAcive = function () {
        Core.authActive = !Core.authActive;
        this.coreAuthAcive(Core.authActive);

        // Show hide authActive area
        if(Core.authActive) this.authArea = 'display: block';
        else this.authArea = 'display: block';

        // Return true to apply the change of the checked
        return true;
    }

    this.coreAuthCookieName = Core.authCookieName;
    this.getCookieValue = ko.observable(Core.cookies.get(Core.authCookieName));
    this.coreIsAuth = ko.observable(Core.user.isAuth());
    this.cacheCloudFrameWorkAuthUser = ko.observable(JSON.stringify(Core.cache.get('CloudFrameWorkAuthUser')));
    this.coreUserInfo = ko.observable(JSON.stringify(Core.user.info));
    this.init = function () {
        Core.init();
        this.coreIsAuth(Core.user.isAuth());
        this.getCookieValue(Core.cookies.get(Core.authCookieName));
        this.cacheCloudFrameWorkAuthUser(JSON.stringify(Core.cache.get('CloudFrameWorkAuthUser')));
        this.coreUserInfo(JSON.stringify(Core.user.info));

        return true;

    }

    this.setAuth = function () {
        Core.cookies.set(Core.authCookieName,'testId');
        Core.user.setAuth(!Core.user.isAuth());
        this.getCookieValue(Core.cookies.get(Core.authCookieName));
        this.coreIsAuth(Core.user.isAuth());
        this.cacheCloudFrameWorkAuthUser(JSON.stringify(Core.cache.get('CloudFrameWorkAuthUser')));
        this.coreUserInfo(JSON.stringify(Core.user.info));
        return true;

    }

    this.userSet= function () {
        Core.user.set('var1','value1');
        alert("Core.user.set('var1','value1');");
        this.coreUserInfo(JSON.stringify(Core.user.info));
    }
    this.userAdd= function () {
        Core.user.add({var1:'value1',var2:'value2'});
        alert("Core.user.add({var1:'value1',var2:'value2'});");
        this.coreUserInfo(JSON.stringify(Core.user.info));
    }

    this.userReset= function () {
        Core.user.reset();
        alert("Core.user.reset();");
        this.coreUserInfo(JSON.stringify(Core.user.info));
    }

}

ko.applyBindings(coreConfigModel);