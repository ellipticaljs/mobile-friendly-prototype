//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical=root.elliptical || {};
        root.elliptical.cssElements=factory();
        root.returnExports = root.elliptical.cssElements;
    }
}(this, function () {

    return {
        registered:false,
        elements:['ui-container',
            'ui-overlay',
            'ui-modal',
            'ui-menu',
            'menu-item',
            'ui-brand',
            'ui-toggle',
            'menu-item-dropdown',
            'menu-item-search',
            'menu-divider',
            'grid-row',
            'grid-columns',
            'ui-select',
            'ui-input-icon',
            'flex-table',
            'ui-dropdown',
            'ui-mega-dropdown',
            'ui-media-object',
            'ui-box',
            'ui-breadcrumb',
            'breadcrumb-item',
            'ui-radio-list',
            'ui-checkbox-list',
            'flex-box',
            'flex-list',
            'flex-label',
            'ui-badge',
            'ui-tip',
            'ui-columns',
            'column-item',
            'ui-social',
            'social-icon',
            'touch-ui-drawer',
            'touch-ui-menu',
            'touch-ui-dropdown',
            'touch-ui-toggle',
            'touch-ui-brand',
            'touch-icons',
            'touch-icon',
            'ui-icons',
            'screen-icon'
        ],

        register:function(){
            if(this.registered) return;
            if(!document.registerElement) return;
            this.registered=true;
            var elements=this.elements;
            elements.forEach(function(element){
                document.registerElement(element);
            });
        }
    };

}));

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('elliptical-utils'), require('component-extensions'),require('elliptical-css-register'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-utils', 'component-extensions','elliptical-css-register'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(root.elliptical.utils, root.elliptical.extensions,root.elliptical.cssElements);
    }
}(this, function (utils, extensions,css) {

    var array=utils.array;

    /** options */
    var options = {
        $providers: {
            location: function (url) {
                window.location = url;
            }
        },
        mqMaxWidth: 1024
    };

    //extend options
    $.extend($.Widget.prototype.options, options);

    /**
     * extend jquery ui widget with component extensions
     */
    Object.assign($.Widget.prototype, extensions.base);

    /**
     * location handler
     * @param url {String}
     * @private
     */
    $.Widget.prototype._location = function (url) {
        var fn = $.Widget.prototype.options.$providers.location;
        fn(url);
    };

    /**
     * use _getCreateEventData as a 'reserved hook' to bind the internal store to the instance
     * @private
     */
    $.Widget.prototype._getCreateEventData = function () {
        //this._data=$.widget.extend({},this._data);
        //set our own data store record of an instance
        $.data(this.element[0], 'custom-' + this.widgetName, this.widgetName);


        /* fire this to hook the original method */
        this._onCreateEventData();
    };

    /**
     * replaces _getCreateEventData for the instance method hook
     * @private
     */
    $.Widget.prototype._onCreateEventData = $.noop;


    /**
     *
     * @param element
     * @param camelCase
     * @returns {Object}
     * @private
     */
    $.Widget.prototype._getAttrs = function (element, camelCase) {
        return getOptions(element, camelCase);
    };

    /**
     *
     * @param options {object}
     * @public
     */
    $.Widget.prototype.setOptions = function (options) {
        this._setOptions(options);
    };


    /* replace show,hide with css3 transitions */
    $.each({show: "fadeIn", hide: "fadeOut"}, function (method, defaultEffect) {
        $.Widget.prototype["_" + method] = function (element, options, callback) {
            var _event = (options) ? options.event : null;
            if (typeof options === "string") {
                options = {effect: options};
            }
            var hasOptions,
                effectName = !options ?
                    method :
                    options === true || typeof options === "number" ?
                        defaultEffect :
                    options.effect || defaultEffect;
            options = options || {};
            if (typeof options === "number") {
                options = {duration: options};
            }
            hasOptions = !$.isEmptyObject(options);
            options.complete = callback;
            if (options.delay) {
                element.delay(options.delay);
            }

            if (!options.duration) {
                options.duration = 300; //default value
            }

            //we are using our own CSS3 Transitions/animations implementation instead of jQuery UI Effects

            var obj = {};
            obj.duration = options.duration;
            obj.preset = options.effect;

            //test for css3 support; if not, then on 'show' or 'hide', just call the jquery methods
            if ($('html').hasClass('no-css3dtransforms') || options.effect === 'none') {
                if (_event === 'show') {
                    element.show();
                    if (callback) {
                        callback();

                    }
                } else if (_event === 'hide') {
                    element.hide();
                    if (callback) {
                        callback();

                    }
                }

            } else {
                this._transition(element, obj, callback);
            }
        };
    });

    /**
     * getters & setters for widget providers
     *
     */
    $.widget.$providers = function (opts) {
        for (var key in opts) {
            if (opts.hasOwnProperty(key)) {
                $.Widget.prototype.options.$providers[key] = opts[key];
            }
        }
    };

    /**
     * getter/setter
     * @type {{options: void}}
     */
    $.widget.config = {
        options: Object.defineProperties({}, {
            'mqMaxWidth': {
                get: function () {
                    return $.Widget.prototype.options.mqMaxWidth;
                },
                set: function (val) {
                    $.Widget.prototype.options.mqMaxWidth = val;

                }
            }
        })
    };


    /** custom elements implementation ********************************************************************



    /// PUBLIC -------------------------------------------------------------------------------------------*/
    //init definition map
    $.elliptical=$.elliptical || {};
    $.elliptical.definitions=new Map();


    /**
     * register the element as a custom element, binds life cycle callback handlers, uses the created callback to
     * upgrade(template transposition) and instantiate an element factory(extension of jquery ui widget)
     * @param name {String}
     * @param tagName {String}
     * @param ElementProto {Object}
     * @param registerDef {Boolean}
     */
    $.widget.register = function (name, tagName, ElementProto, registerDef) {
        //record the element definition
        var regElement_ = {};
        regElement_.name = name;
        regElement_.tagName = tagName;

        if (registerDef === undefined) {
            registerDef = true;
        }

        //define the object
        var proto = Object.create(ElementProto);
        proto._tagName = tagName;
        var object_ = {prototype: proto};

        /* custom element callbacks
         *  pass them onto the element instance, where the UI factory can hook into them
         * */
        proto.attachedCallback = function () {
            if (this._attachedCallback) {
                this._attachedCallback();
            }
        };

        proto.detachedCallback = function () {
            if (this._detachedCallback) {
                this._detachedCallback();
            }
        };

        proto.createdCallback = function () {
            _HTML5Imports.instantiate(this, name);

        };

        proto.attributeChangedCallback = function (n, o, v) {
            if (this._attributeChangedCallback) {
                this._attributeChangedCallback(n, o, v);
            }
        };

        /* register the element */
        if (ElementProto._name === 'HTMLElement') {
            document.registerElement(tagName, object_);

        } else {
            regElement_.tagName = '[is="' + tagName + '"]';
            object_ = setOptionsExtensionType(ElementProto._name, object_);
            document.registerElement(tagName, object_);
        }

        if (registerDef) {
            addElementDefinition(regElement_);
        }
    };

    /**
     * register a custom tag as a custom element
     * @param tag
     * @param ElementProto
     */
    $.widget.registerElement = function (tag, ElementProto) {
        registerElement(tag, ElementProto);
    };

    /**
     * register an array of custom tags as custom elements
     * @param arr
     */
    $.widget.registerElements = function (arr) {
        registerElements(arr);
    };



    /// Custom Element Factory ===================================================

    /* define the base element  */
    $.widget('elliptical.element',{

        /**
         * should never be overwritten, _initElement becomes the created dev hook
         * @private
         */
        _create:function(){
            /* init events array */
            this._destroyed=false;
            this._data={
                _store:new Map(),
                get:function(key){
                    return this._store.get(key);
                },
                set:function(key,val){
                    this._store.set(key,val);
                },
                click:'touchclick',
                hover:'touchhover'
            };
            this._data.events=[];
            $.extend(this.options, $.Widget.prototype.options);

            this._onBeforeCreate();
        },

        /**
         *
         * @private
         */
        _onBeforeCreate:function(){
            (this.options.proxyUpgrade) ? this._proxyUpgradeElement() : this._upgradeElement();
        },


        /**
         * no template transposition for the element
         * @private
         */
        _proxyUpgradeElement:function(){
            if(this.element[0].dataset){
                this.element[0].dataset.upgraded=true;
            }
            this._onCreate();
        },

        /**
         *
         * @private
         */
        _upgradeElement:function(){
            var self=this;
            var upgraded = upgradedDataSet(this.element[0]);
            if(upgraded===null){
                this._destroy();
            }
            if(upgraded==='true'){
                this._onCreate();
            }else{
                var tagName=this._tagName;
                window._HTML5Imports.upgradeElement(tagName, this.element[0],function(element){
                    upgraded = upgradedDataSet(element);
                    if(upgraded==='true'){
                        self._onCreate();
                    }else{
                        self.destroy();
                    }
                });
            }
        },

        /**
         *
         * @returns {string}
         * @private
         */
        __press:function(){
            return ('ontouchend' in document) ? 'touchend' : 'click';
        },

        /**
         *
         * @returns {string}
         * @private
         */
        __tap:function(){
            return ('ontouchend' in document) ? 'tap' : 'click';
        },

        /**
         *
         * @private
         */
        _onCreate: function(){
            if(this._created){
                return;
            }else{
                this._created=true;
            }
            this._setOptionsFromAttribute();
            this._delegateEventListener();
            this._setChildrenAttributes();
            this.__componentCallbacks();
            this._bindOptionsToPrototypes();
            this.__bindPressEvent();
            this.__bindTapEvent();
            this._initElement();
            this.__onInit();
            this._bindPublicPropsToElement();
            this._bindPublicElementMethods();
            this._publishLoaded();

        },

        /**
         *
         * @private
         */
        _publishLoaded: function(){
            this._triggerEvent('loaded',this.element);
        },

        /**
         *
         * @private
         */
        _bindPublicPropsToElement:function(){
            var prototype=Object.getPrototypeOf(this);
            var node=this.element[0];
            var self=this;
            this._iterateForPublicProps(node,this);
            for(var prop in prototype){
                if(prototype.hasOwnProperty(prop)){
                    this._assignPublicMethods(node,prototype,prop,self);
                    this.__assignPublicProps(node,prototype,prop,self);
                }
            }
        },


        /**
         *
         * @private
         */
        _bindOptionsToPrototypes:function(){
            var node=this.element[0];
            var self=this;
            var options=this.options;
            for(var prop in options){
                if(options.hasOwnProperty(prop) && prop.indexOf('$') !==0 && prop !=='$providers'
                    && prop !=='classes' && prop !=='upgraded' && prop !=='mqMaxWidth' && prop !=='create' && prop !=='template'){
                    //assign to component prototype in the jquery object prototype chain
                    this._assignPublicProps(self,options,prop,self.options);
                    //assign to custom element prototype chain
                    this._assignPublicProps(node,options,prop,self.options);
                }
            }
        },

        /**
         *
         * @param {object} node
         * @param {object} obj
         * @private
         */
        _iterateForPublicProps:function(node,obj){
            var self=this;
            for(var prop in obj){
                if(obj.hasOwnProperty(prop)){
                    this.__assignPublicProps(node,obj,prop,self);
                }
            }
        },

        /**
         *
         * @param {object} node
         * @param {object} obj
         * @param {string} prop
         * @param {object} context
         * @private
         */
        _assignPublicMethods:function(node,obj,prop,context){
            if(prop.indexOf('_')!==0 && typeof obj[prop]==='function' && prop !=='constructor'){
                node[prop]=function(){
                    context[prop].apply(context,arguments);
                }
            }
        },

        /**
         *
         * @param {object} node
         * @param {object} obj
         * @param {object} prop
         * @param {object} context
         * @private
         */
        __assignPublicProps:function(node,obj,prop,context){
            if(prop.indexOf('$')===0) this._assignPublicProps(node,obj,prop,context);
        },

        /**
         *
         * @param {object} host
         * @param {object} obj
         * @param {object} prop
         * @param {object} context
         * @private
         */
        _assignPublicProps:function(host,obj,prop,context){
            if(typeof obj[prop] !=='function'){
                Object.defineProperty(host, prop, {
                    get: function() { return context[prop]; },
                    set: function(newValue) { context[prop] = newValue; },
                    enumerable: true,
                    configurable: true
                });
            }
        },

        /**
         *
         * @private
         */
        __bindEvents:function(){
            var events=this._events;
            for(var prop in events){
                if(events.hasOwnProperty(prop)){
                    this.__bindEvent(events,prop)
                }
            }
        },

        /**
         *
         * @param {object} events
         * @param {string} prop
         * @private
         */
        __bindEvent:function(events,prop){
            var event;
            var method=events[prop];
            var eventParams=prop.split('@');
            var length=eventParams.length;
            if(length===1){
                event=this.__getEvent(eventParams[0]);
                this._event(this.element,event,this[method].bind(this));
            }else if(length===2){
                var selector=eventParams[0];
                event=this.__getEvent(eventParams[1]);
                if(selector==='document') this._event($(document),event,this[method].bind(this));
                if(selector==='window') this._event($(window),event,this[method].bind(this));
                else this._event(this.element,event,selector,this[method].bind(this))
            }
        },

        /**
         *
         * @param {string} evt
         * @returns {string}
         * @private
         */
        __getEvent:function(evt){
            if(evt==='click') return this._data.click;
            else if(evt==='press') return this.__press();
            else if(evt==='tap') return this.__tap();
            else return evt;
        },

        /**
         *
         * @private
         */
        _bindPublicElementMethods:function(){
            var self=this;
            var node=this.element[0];
            node.hide=function(){
                self._hide();
            };

            node.show=function(){
                self._show();
            };

            node.$service=function(name){
                self.service(name);
            };

            node.$serviceAsync=function(name,callback){
                self.serviceAsync(name,callback);
            };

            node.runInit=function(){
                self.runInit();
            };

        },

        __bindPressEvent:function(){
            var self=this;
            var data=this._data;
            Object.defineProperty(data, 'press', {
                get: function() { return self.__press(); },
                enumerable: true,
                configurable: true
            });
        },

        __bindTapEvent:function(){
            var self=this;
            var data=this._data;
            Object.defineProperty(data, 'tap', {
                get: function() { return self.__tap(); },
                enumerable: true,
                configurable: true
            });
        },

        /**
         * init Element
         */
        _initElement: $.noop,

        /**
         * generally, should not overwrite this
         * @private
         */
        __onInit:function(){
            this.__bindEvents();
            this._onInit();
        },

        /**
         * @private
         */
        _onInit: $.noop,


        /**
         * called by default by _onInit; event listener registrations should go here, although this is not a requirement
         */
        _events: {},


        /**
         * registers a DOM event listener
         *
         * @param {object} element
         * @param {string} event
         * @param {string} selector
         * @param {function} callback
         * @private
         */
        _event: function (element, event, selector,callback) {
            var obj = {};
            obj.element = element;
            obj.event = event;

            //support 3-4 params
            var length = arguments.length;
            if (length === 3) {
                callback = (typeof selector === 'function') ? selector : null;
                selector = null;
            }
            obj.selector = selector;
            obj.callback = callback;
            var arr = this._data.events;
            if ($.inArray(obj, arr) === -1) this._data.events.push(obj);
            if (selector) {
                element.on(event, selector, function () {
                    var args = [].slice.call(arguments);
                    if (callback) callback.apply(this, args);
                });
            } else {
                element.on(event, function () {
                    var args = [].slice.call(arguments);
                    if (callback) callback.apply(this, args);
                });
            }

        },

        /**
         * unbinds registered event listeners.
         *
         * @private
         */
        _unbindEvents: function () {
            var events = this._data.events;
            var length = events.length;
            for (var i = 0; i < length; i++) {
                var obj = events[i];
                (obj.selector) ? obj.element.off(obj.event, obj.selector) : obj.element.off(obj.event);
            }
            events.length = 0;
            this._onUnbindEvents();
        },

        /**
         * additional event cleanup, if needed, should be placed here. Invoked on _destroy()
         * @private
         */
        _onUnbindEvents: $.noop,

        /**
         *
         * @private
         */
        _hide:function(){
            this.element.hide();
        },

        /**
         *
         * @private
         */
        _show:function(){
            this.element.show();
        },

        /**
         * sets up the event listener for the 'on-click' tag attribute
         * @private
         */
        _delegateEventListener:function(){
            this._event(this.element,this._data.click,'[on-click]',this._listenerCallback.bind(this));
        },

        /**
         *
         * @param {object} event
         * @private
         */
        _listenerCallback:function(event){
            var target=$(event.currentTarget);
            var fn=target.attr('on-click');
            if(fn){
                if(this[fn]){
                    this[fn](event);
                }
            }
        },


        /**
         * destroy event
         * @private
         */
        _destroy: function () {
            if(!this._data){
                return;
            }
            this._triggerEvent('destroyed',this.element);
            this._unbindEvents();
            this._dispose();
            $.removeData(this.element[0],'custom-' + this.widgetName);
            this._data._store=null;
            this._data.events.length=0;
            this._destroyed=true;
        },


        /**
         * custom element lifecycle callback events
         * @private
         */
        __componentCallbacks:function(){
            var self=this;
            var node=this.element[0];
            var prototype=Object.getPrototypeOf(node);
            prototype._attachedCallback=function(){
                self._attached();
                if(node.attached) node.attached();
            };
            prototype._detachedCallback=function(){
                self._detached();
                if(node.detached) node.detached();
            };
            prototype._attributeChangedCallback=function(name,oldValue,newValue){
                self._attributeChanged(name,oldValue,newValue);
                if(node.attributeChanged) node.attributeChanged(name,oldValue,newValue);
            };
        },


        _distributeContent:function(tagName,element,callback){
            _HTML5Imports.upgradeElement(tagName, element,callback);
        },

        /**
         * @private
         */
        _attached: $.noop,

        /**
         * @private
         */
        _detached: $.noop,

        /**
         * @private
         */
        _attributeChanged: $.noop,



        /**
         * for cleanup
         * @private
         */
        _dispose: $.noop,


        ////--public-------------------

        /**
         * @public
         */
        hide:function(){
            this._hide();
        },

        /**
         * @public
         */
        show:function(){
            this._show();
        },

        /**
         * @public
         */
        runInit:function(){
            this._initElement();
        },

        /**
         * service locator
         * @param {string} name
         * @returns {*}
         * @public
         */
        $service:function(name){
            if(name===undefined && this.options){
                name=this.options.service;
            }
            if(this.__serviceLocator){
                return this.__serviceLocator(name);
            }else{
                var protoLocator= $.elliptical.element.prototype.__serviceLocator;
                if(protoLocator){
                    return protoLocator(name);
                }
            }
        },

        /**
         * async service locator
         * @param {string} name
         * @param {function} callback
         */
        $serviceAsync:function(name,callback){
            if(typeof name==='function'){
                callback=name;
                name=undefined;
            }
            var self=this;
            var INTERVAL=300;
            var MAX_COUNT=5;
            var count=0;
            var service=this.service(name);
            if(service && service!==undefined){
                callback(service);
            }else{
                var intervalId=setInterval(function(){
                    service=self.service(name);
                    if(service && service !==undefined){
                        clearInterval(intervalId);
                        callback(service);
                    }else if(count > MAX_COUNT){
                        clearInterval(intervalId);
                        callback(null);
                    }else{
                        count++;
                    }
                },INTERVAL);
            }
        }

    });



    /// a factory wrapper that returns an $.element factory for the supplied base function
    /// (i) the $.element factory will register the element as a jquery ui widget with supplied baseObject
    /// (ii) register the element as a W3C custom element (document.registerElement)
    /**
     *
     * @param {object} baseObject
     * @returns {function}
     */
    $.elementFactory=function(baseObject){

        /**
         * NOTE: (i)  mixins array(of objects) are "mixed" with the prototype
         *            however, if mixins is an object(instead of an array), that object is interpreted as an overriding
         *            baseObject and injected into the jquery ui widget factory accordingly
         *       (ii) tag is split and parsed for the jquery ui namespace: $.tag[0].tag[0]tag[1]...tag[N]
         *            the name is the camel cased tagName; the namespace is the zero index in the split tagname
         *            e.g: hello-my-world --> $.hello.helloMyWorld
         *            declarative tag creates a imperative jquery plugin
         *            eg: <hello-my-world> --> $(element).helloMyWorld()
         *                <my-tag> --> $(element).myTag()
         *
         *  @param {object} ElementProto
         *  @param {string} tag
         *  @param {array} mixins
         *  @param {object} prototype
         *  @public
         */
        return function (ElementProto,tag,mixins, prototype) {

            //mixins
            var mixins_= null;
            //widget string namespace
            var name_=null;
            //registered element tag name
            var tagName_=null;
            //registered element prototype
            var ElementProto_=null;
            //widget prototype
            var prototype_=null;

            var objName;

            /* support 2-4 params */
            var length=arguments.length;
            if(length < 2) throw "Error: Element requires a minimum of two parameter types: tag name and a singleton for the prototype";
            else if(length===2){
                prototype_ = tag;
                if(typeof ElementProto==='object') throw "Error: Element requires a string name parameter";
                if(typeof tag!=='object') throw "Error: Element requires a singleton for the prototype";
                objName=parseElementNameParams(ElementProto);
                if(objName.err) throw "Error: Element requires a string tag name and a prototype";
                name_=objName.name;
                tagName_=ElementProto;
            }else if(length===3){
                prototype_=mixins;
                if(typeof ElementProto==='object'){
                    if(typeof tag!=='string') throw "Error: Element requires a string tag name";
                    if(typeof mixins!=='object') throw "Error: Element requires a singleton for the prototype";
                    ElementProto_=ElementProto;
                    objName=parseElementNameParams(tag);
                    name_=objName.name;
                    tagName_=tag;
                }else{
                    tagName_=ElementProto;
                    mixins_=tag;
                    objName=parseElementNameParams(ElementProto);
                    name_=objName.name;
                }
            }else{
                prototype_=prototype;
                ElementProto_=ElementProto;
                tagName_=tagName;
                mixins_=mixins;
                objName=parseElementNameParams(tag);
                name_=objName.name;
            }

            //mixins
            if(mixins_){
                if(!array.isArray(mixins_)) baseObject=mixins_;
                else{
                    mixins_.forEach(function(obj){
                        Object.assign(prototype_,obj);
                    });
                }
            }


            /* if no ElementPrototype defined, assign the HTMLElement prototype */
            if(!ElementProto_){
                var __proto__=HTMLElement.prototype;
                __proto__._name='HTMLElement';
                ElementProto_=__proto__;
            }

            ///ensure baseObjects have valid tag names
            tagName_=tagName_.replace('.','-');

            //store the tagName as a "private variable" on the singleton
            prototype_._tagName=tagName_;

            /* implement using the extended jQuery UI factory */
            $.widget(name_, baseObject, prototype_);

            //method Name from namespaced name
            var methodName=name_.split('.')[1];

            /* register the element as a WC3 custom element */
            try{
                $.widget.register(methodName,tagName_,ElementProto_);
            }catch(ex){

            }
        };
    };


    /// create the element factory
    $.element = $.elementFactory($.elliptical.element);


    ///css custom element registration
    css.register();

    /* make public props/methods available on $.element */
    for(var key in $.widget){
        $.element[key]= $.widget[key];
    }


    $.element.serviceLocator=function(fn,container){
        var proto={
            __serviceLocator:fn.bind(container)
        };

        $.extend($.elliptical.element.prototype,proto);
    };


    /// PRIVATE----------------------------------------------------------------------------------------------

    /**
     * registers a custom element with document.registerElement
     * @private
     * @param tag {String}
     * @param ElementProto {Object}
     *
     */
    function registerElement(tag, ElementProto) {
        if (typeof ElementProto === 'undefined') {
            ElementProto = HTMLElement.prototype;
            ElementProto._name = 'HTMLElement';
        }
        var proto = Object.create(ElementProto);
        proto._tagName = tag;
        var options = {prototype: proto};

        /* register the element */
        if (ElementProto._name === 'HTMLElement') {
            document.registerElement(tag, options);
        } else {
            options = setOptionsExtensionType(ElementProto._name, options);
            document.registerElement(tag, options);
        }
    }

    /**
     * @private
     * registers an array of custom elements
     * @param arr {Array}
     *
     */
    function registerElements(arr) {
        if (typeof arr === 'string') { //support simple passing of a string tagName
            registerElement(arr);
        } else {
            if (arr.length > 0) {
                arr.forEach(function (t) {
                    (typeof t === 'string') ? registerElement(t) : registerElement(t.name, t.prototype);
                });
            }
        }
    }

    /**
     * sets the extends property of the options object to pass to document.registerElement for HTML element interfaces that inherit from HTMLElement
     * options object={prototype:proto,extends:name}
     * ex: HTMLInputElement-->obj.extends='input'
     * @private
     * @param name {String}
     * @param obj {Object}
     * @returns {Object}
     */
    function setOptionsExtensionType(name, obj) {
        var type = name.replace(/HTML/g, '').replace(/Element/g, '');
        type = type.toLowerCase();
        obj.extends = type;
        return obj;
    }

    function addElementDefinition(obj) {
        var value=$.elliptical.defintions.get(obj.tagName);
        if(value===undefined){
            $.elliptical.defintions.set(obj.tagName,obj);
        }
    }


    /**
     * returns an options object from declarative element attributes
     * @param element {Object}
     * @param camelCase {Boolean}
     * @returns {Object}
     */
    function getOptions(element, camelCase) {
        if (camelCase === undefined) {
            camelCase = true;
        }
        var opts = {};
        $.each(element.attributes, function (i, obj) {
            var opt = obj.name;
            var val = obj.value;
            if (!testAttr(opt)) {
                var patt = /data-/;
                if (patt.test(opt)) {
                    opt = opt.replace('data-', '');
                }
                if (camelCase && camelCase !== 'false') {
                    (opt !== 'template') ? opts[opt.toCamelCase()] = booleanCheck(val) : (opts[opt] = booleanCheck(val));

                } else {
                    opts[opt.toCamelCase()] = booleanCheck(val);
                }
            }
        });

        return opts;
    }

    /**
     *  converts a boolean string to a boolean type
     * @param val {string}
     * @returns {boolean}
     */
    function booleanCheck(val) {
        if (val === 'false') {
            val = false;
        }
        if (val === 'true') {
            val = true;
        }
        return val;
    }

    /**
     *
     * @param attr {String}
     * @returns {boolean}
     */
    function testAttr(attr) {
        var patt = /href|tcmuri|rowspan|colspan|class|nowrap|cellpadding|cellspacing/;
        return patt.test(attr);
    }

    /**
     *
     * @param node
     * @returns {*}
     */
    function upgradedDataSet(node){
        if(!node){
            return null;
        }
        var dataSet=node.dataset;
        if(dataSet !==undefined){
            return node.dataset.upgraded;
        }else{
            return undefined;
        }

    }

    /**
     *
     * @param s
     * @returns {{tagName: *, name: *, err: *}}
     */
    function parseElementNameParams(s){
        var tagName=null;
        var name=null;
        var err=null;
        var arrNamespace=s.split('.');
        var arrTagName=s.split('-');
        if(arrNamespace.length > 1){
            name=s;
            tagName= s.replace('.','-');
        }else if(arrTagName.length > 1){
            tagName=s;
            name= arrTagName[0] + '.' + $.utils.string.dashToCamelCase(s);
        }else{
            err=true;
        }
        return {
            tagName:tagName,
            name:name,
            err:err
        }
    }


    return $;

}));
(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(request('elliptical-utils','observable-component'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-utils','observable-component'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(root.elliptical.utils,root.elliptical.observable);
    }
}(this, function (utils,observable) {

    var cache=observable.cache;
    cache._initCacheElement=function(){
        var $cache=this.$cache();
        this._data.set('$cache',$cache);
    };

    var pubSub=observable.pubsub;

    var scope=observable.scope;
    var scopeOptions={
        scopeBind: true,
        objectAssign:false
    };

    scope=Object.assign({},scope,scopeOptions);

    var template=observable.template;


    //define component prototype
    var prototype={
        options:{
            scope:null  //prop of context to bind
        },

        /**
         * $.component setup on $.element's init event
         * @private
         */
        _initElement:function(){
            this._initCacheElement();
            this._initScopeElement();
            this._initTemplateElement();
            this._beforeInitComponent();
            this._initComponentElement();
        },

        _beforeInitComponent: $.noop,

        _initComponentElement:function(){
            this.$viewBag=this._viewBag();
            this.__setScope();
            this._initComponent();
            this._bindPublicComponentMethods();
            this._bindSubscriptions();
            this.__subscriber();
            this.__publisher();
        },

        /**
         * sets public property $scope from the ViewData context and the scope public attribute
         * @private
         */
        __setScope: function(){
            var data=this.options.data;
            if(data) return;
            var context=this._viewBag();
            var scope=this.options.scope;
            if(scope){
                if(this.options.objectAssign) this.$scope=context[scope];
                else{
                    this.$scope[scope]=context[scope];
                }
            }
        },

        /**
         * $.component init event
         */
        _initComponent: $.noop,


        /**
         * sets up pre-defined subscribe events on a defined channel
         * @private
         */
        __subscriber:function(){
            var self=this;
            var channel=this.options.channel;
            var event=this.options.event;
            this._data.set('_synced',false);
            if(channel){
                if(event==='sync'){
                    this._subscribe(channel +'.sync',function(data){
                        if(!self._data.get('_synced')){
                            self._data.set('_synced',true);
                            self._dispose();
                            self.$scope=data;
                            self._rebind();
                            self._onSyncSubscribe();
                        }
                    });
                }
            }
        },

        /**
         * if a channel has been declared, publish the $scope to channel.sync
         * this allows different $.components and custom elements to share the same $scope
         * @private
         */
        __publisher:function(){
            var channel=this.options.channel;
            var event =this.options.event;
            var self=this;
            var MAX=6;
            var count=0;
            if(channel && !event){
                if(this._data.get('scopeObserver')){
                    this._publish(channel + '.sync',this.$scope);
                }else{
                    var timeoutId=setInterval(function(){
                        if(self._data.get('scopeObserver')){
                            clearInterval(timeoutId);
                            self._publish(channel + '.sync',self.$scope);
                        }else{
                            if(count<MAX) count++;
                            else clearInterval(timeoutId);
                        }
                    },300);
                }
            }
        },


        /**
         * returns the elliptical viewBag
         * @returns {*}
         * @private
         */
        _viewBag:function(){
            if(!window.__viewData) window.__viewData={};
            return window.__viewData;
        },



        /**
         * handler for channel.sync, subscription
         * @param data {Object}
         * @private
         */
        _onSyncSubscribe: $.noop,


        /**
         * returns the scope property of the ViewData context
         * @returns {Object}
         * @private
         */
        _scopedContextModel:function(){
            var context=this._viewBag();
            scope=this.options.scope;

            return (scope) ? context[scope] : undefined;
        },

        __onTemplateVisibility:function(){
            var node=this.element[0];
            if(node.hasAttribute('ui-preload')) node.removeAttribute('ui-preload');
            this._onTemplateVisibility();
        },

        _onTemplateVisibility:function(){},

        _bindPublicComponentMethods:function(){
            var self=this;
            var node=this.element[0];
            node.onScopeChange=function(callback){
                self.__notify=function(result){
                    if(callback) callback(result);
                }
            };

            node.$rebind=function(){
                self.$rebind();
            };

            node.changeReport=function(o,n){
                return self.changeReport(o,n);
            };
        },

        runInit:function(){
            this._initComponent();
        }


    };


    //mixin prototypes
    prototype=Object.assign(cache,pubSub,scope,template,prototype);

    //define base component
    $.element('elliptical.component',prototype);


    /**
     * define the component factory
     * @param ElementProto {Object} <optional>, only should be supplied if the element not derived from HTMLElement
     * @param name {String}
     * @param tagName {String} <optional>
     * @param base {Object} <optional>
     * @param prototype {Object}
     */
    $.component= $.elementFactory($.elliptical.component);

    /* copy props of element to component */
    for(var key in $.element){
        $.component[key]= $.element[key];
    }


    return $;

}));


(function(){

    var Scope={
        linkImports:[],
        importElements:[],
        upgradeElementQueueFlag:false,
        mutationsArray:[]
    };

    var Observer=elliptical.mutation.summary;

    function isLightDOMElement(element) {
        try{
            if(element.hasAttribute('content-init')){
                return false;
            }
            return (element.getAttribute('definition')===null);
        }catch(ex){
            return false;
        }

    }

    function testAttr(attr){
        var patt=/href|tcmuri|rowspan|colspan|class|nowrap|cellpadding|cellspacing|ea/;
        return patt.test(attr);
    }

    function booleanCheck(val) {
        if (val === 'false') {
            val = false;
        }
        if (val === 'true') {
            val = true;
        }
        return val;
    }


    var IMPORT_SELECTOR='link[rel="import"][property="elliptical"]';
    var ON_DOCUMENT_MUTATION='OnDocumentMutation';
    var ON_DOCUMENT_ADDED_MUTATION='OnDocumentAddedMutation';
    var WEB_COMPONENTS_READY='WebComponentsReady';
    var IMPORTS_LOADED='HTMLImportsLoaded';
    var PARSE_ATTR='parse-attr';
    var QUEUED_IMPORTS_INTERVAL=100;
    var QUEUE_TIMEOUT=500;
    var DISCOVER_TIMEOUT=800;
    var UPGRADE_TIMEOUT=10;
    var QUEUE_MAX=15;
    var READY_COUNT=0;
    var LINK_IMPORT_MAX_CHECK=40;

    var PolyFill= {
        template: function (d) {  //polyfills html5 template (IE & safari) http://jsfiddle.net/brianblakely/h3EmY/
            if (d.content) {
                return false;
            }

            var qPlates = d.getElementsByTagName('template'),
                plateLen = qPlates.length,
                elPlate,
                qContent,
                contentLen,
                docContent;

            for (var x = 0; x < plateLen; ++x) {
                elPlate = qPlates[x];
                qContent = elPlate.childNodes;
                contentLen = qContent.length;
                docContent = d.createDocumentFragment();

                while (qContent[0]) {
                    docContent.appendChild(qContent[0]);
                }

                elPlate.content = docContent;
            }


        }
    };


    var Events={
        webComponentsReady:function(){
            setTimeout(function(){
                var event=document.createEvent("CustomEvent");
                event.initCustomEvent(WEB_COMPONENTS_READY, true, true, {});
                document.dispatchEvent(event);
            },QUEUE_TIMEOUT);
        }
    };

    var Listener={
        start:function(){
            $(document).on(ON_DOCUMENT_MUTATION,this.on.bind(this));
        },

        on:function(event,summary){
            setTimeout(function(){
                var added=summary.added;
                if(added && summary.added.length > 0){
                    Parser.linkImportMutations(added);
                    Parser.customElementMutations(added);
                }
            },QUEUE_TIMEOUT);
        }
    };

    var DOM={
        parser:function(markup){
            var doc = document.implementation.createHTMLDocument("");
            if (markup.toLowerCase().indexOf('<!doctype') > -1) {
                doc.documentElement.innerHTML = markup;
            }
            else {
                doc.body.innerHTML = markup;
            }
            return doc;
        },

        walk:function(node,func,callback){
            func(node);
            node = node.firstChild;
            while (node) {
                this.walk(node, func);
                node = node.nextSibling;
            }
            callback();
        }
    };

    var Parser={
        bindLinkImports:function(){
            var links_=$(IMPORT_SELECTOR);
            var links=this.recursivelyGetLinks(links_);
            this.parseLinkImports(links);
        },

        linkImportMutations:function(added){
            var links_=$(added).selfFind(IMPORT_SELECTOR);
            if(links_[0]){
                Scope.upgradeElementQueueFlag=true;
                var links=this.recursivelyGetLinks(links_);
                if(links.length===0){
                    this.queueLinkImportMutations(links_);
                }else{
                    (this.verifyLinkImports(links)) ? this.throwReady(links) : this.queueLinkImports(links);
                }
            }
        },

        /**
         * throws WebComponents Ready event, resets Queue Flag to false, calls parseLinkImports
         * @param {array} links - array of link imports
         */
        throwReady:function(links){
            Events.webComponentsReady();
            Scope.upgradeElementQueueFlag=false;
            this.parseLinkImports(links);
        },

        /**
         * verifies link imports contain a template document fragment
         * @param {array} links
         * @returns {object}
         */
        verifyLinkImports:function(links){
            var link=links[0];
            var templates=this.getTemplateFromImport(link);
            return templates[0];
        },

        queueLinkImports:function(links){
            var self=this;
            this.onLinkImportsComplete(links,function(links){
                self.throwReady(links);
            });
        },

        onLinkImportsComplete:function(links,callback){
            var self=this;
            var count=0;
            var timeoutId=setInterval(function(){
                var imported=self.verifyLinkImports(links);
                if(imported || count > LINK_IMPORT_MAX_CHECK){
                    clearInterval(timeoutId);
                    callback(links);
                }else{
                    count++;
                }
            },QUEUED_IMPORTS_INTERVAL);

        },

        getTemplateFromImport:function(link){
            var doc=link.import;
            return $(doc).find('template').not('[template]');
        },

        queueLinkImportMutations:function(links){
            var self=this;
            var timeoutId=setInterval(function(){
                links=self.recursivelyGetLinks(links);
                if(links[0]){
                    clearInterval(timeoutId);
                    self.verifyLinkImports(links);
                }
            },QUEUED_IMPORTS_INTERVAL);
        },

        recursivelyGetLinks:function(links){
            var _linkImports=[];
            var self=this;
            $.each(links,function(index,link){
                var arrLinks=self.recurseLink(link,[]);
                _linkImports=_linkImports.concat(arrLinks);
            });

            return _linkImports;
        },

        recurseLink:function(link,arr){
            if (!link.import) {
                return arr;
            } else {
                Scope.linkImports.push(link);
                arr.push(link);
                var all = link.import.all;
                if (all !== undefined) {
                    var length = all.length;
                    for (var i = 0; i < length; i++) {
                        var link_ = all[i];
                        var import_ = link_.import;
                        if (import_ !== undefined) {
                            this.recurseLink(link_,arr);
                        }
                    }
                    return arr;
                } else {
                    return arr;
                }
            }
        },

        parseLinkImports:function(links){
            var self=this;
            $.each(links,function(index,link){
                self.parseImportDocument(link,index);
            });
        },

        parseImportDocument:function(link,idx){
            var templates=this.getTemplateFromImport(link);
            var template = templates[0];

            if(template){
                var parentNode=template.parentNode;
                var tag=parentNode.tagName;
                var definitionAlreadyExists=this.checkForDuplicate(tag);
                if(!definitionAlreadyExists){
                    //var templateStr=PolyFill.templateInnerHTML(template);
                    var templateStr=template.innerHTML;
                    var parse=(this.parseAttribute(parentNode)) ? true : false;
                    var o_={tag:tag,index:idx,parse:parse,str:templateStr,template:template};
                    Scope.importElements.push(o_);
                }
            }
        },

        doUpgrade: function(element){
            var upgraded=element.dataset.upgraded;
            return (upgraded===undefined || upgraded==='false');
        },

        upgradeElement: function(element, parseAttr, template, templateStr,callback){
            /* if the element definition contains a 'parse-attr' attribute, we will need to
             to regex replace ##attribute## occurrences in the definition with values in the instance
             before we clone the template.content and append to the element instance(hence, attributeBind)
             */

            var clone;
            var $element=$(element);
            if(templateStr===''){
                this.setAttributes(element,$element);
                this.publishUpgradeEvent(element,callback);
                return;
            }
            if (parseAttr && element.attributes) {
                //clone template node content from definition
                clone = this.elementAttributeBind(element, templateStr);
                //merge the content with the innerHTML of the instance(replaces ui-template node in the definition with the instance innerHTML)
                clone = this.distributeContent(clone, element);
                $element.empty();
                try{
                    element.appendChild(clone);
                    this.setAttributes(element,$element);
                    this.publishUpgradeEvent(element,callback);
                }catch(ex){
                    console.log(ex);
                }

            } else {
                var content = template.content;
                if(!content){
                    this.fireCallback(element,callback);
                    return;
                }
                //IE issue: if template.content has no childNodes, create a new document-fragment from the templateStr
                if (content.childNodes && content.childNodes.length === 0) {
                    template = this.createTemplateNode(templateStr);
                }
                //clone template node content from definition
                clone = template.content.cloneNode(true);
                //merge the content with the innerHTML of the instance
                clone = this.distributeContent(clone, element);
                $element.empty();
                //append the cloned content to the element instance
                element.appendChild(clone);
                this.setAttributes(element,$element);
                this.publishUpgradeEvent(element,callback);
            }
        },

        publishUpgradeEvent:function(element,callback){
            $(document).trigger('OnElementImport', { node: element });
            this.fireCallback(element,callback);
        },

        fireCallback:function(element,callback){
            if(callback){
                callback(element);
            }
        },

        setAttributes:function(element,$element){
            $element.find('[content-init]').removeAttr('content-init');
            $element.find('content').remove();
            element.dataset.upgraded = true;
        },

        parseAttribute:function(importNode){
            var att=importNode.getAttribute(PARSE_ATTR);
            return (att || att ==='');
        },

        elementAttributeBind: function(element,templateStr){
            var self=this;
            $.each(element.attributes, function(i, att){
                /* note: "{{ }}" interferes with other popular template engines, including dustjs
                 hence, we use "[[ ]]"
                 */
                var re = new RegExp("\\[\\[" + att.name + "\\]\\]","g");
                templateStr=templateStr.replace(re,att.value);

            });
            //replace undefined [[attr]] occurrences in the templateStr with an empty string
            templateStr=templateStr.replace(/\[\[(.*?)]]/g, '');
            templateStr=templateStr.replace(/\[\[/g, '');
            var template = self.createTemplateNode(templateStr);
            return template.content.cloneNode(true);
        },

        parseElementImport:function(tag,element,callback,queueRequest){
            var length=Scope.importElements.length;
            var elementImport=null;

            for(var i=0;i<length;i++){
                var tag_=Scope.importElements[i].tag;
                if(tag_.toLowerCase()===tag.toLowerCase()){
                    elementImport=Scope.importElements[i];
                    break;
                }
            }

            if(elementImport){
                var proto=Object.getPrototypeOf(element);
                if(proto._tagName !==undefined){
                    proto._imported=true;
                }
                var parseAttr=elementImport.parse;
                var templateStr=elementImport.str;
                var template=elementImport.template;
                if(this.doUpgrade(element)){
                    this.upgradeElement(element,parseAttr,template,templateStr,callback);
                }else{
                    if(callback){
                        callback(null);
                    }
                }

            }else{
                if(queueRequest){
                    this.queueParsingRequest(tag,element,callback);
                }
            }
        },

        queueParsingRequest:function(tag,element,callback){
            var count_=0;
            var self=this;

            var timeoutId=setInterval(function(){
                var proto=Object.getPrototypeOf(element);
                var hasBeenStampedForImport=false;
                if(proto && proto._tagName !==undefined){
                    if(proto._imported && proto._imported !==undefined){
                        hasBeenStampedForImport=true;
                    }
                }
                if(hasBeenStampedForImport || count_ > QUEUE_MAX){
                    if(callback){
                        callback(null);
                    }
                    clearTimeout(timeoutId);
                }else {
                    count_++;
                    self.parseElementImport(tag,element,callback,false);
                }

            },QUEUE_TIMEOUT);
        },

        distributeContent: function(clone,instance){
            var innerHtml = instance.innerHTML;
            innerHtml = (innerHtml.trim) ? innerHtml.trim() : innerHtml.replace(/^\s+/, '');
            if (innerHtml === '') {
                return clone;
            }
            var content = clone.querySelectorAll('content');
            if (content) if (content.length > 1) {
                for (var i = 0; i < content.length; i++) {
                    var select = content[i].getAttribute('select');
                    if (select) {
                        var node=instance.querySelector(select);
                        if(node){
                            $(content[i]).replaceWith(node);
                        }
                    }
                }
                return clone;
            } else {
                $(content[0]).replaceWith(innerHtml);
                return clone;
            } else {
                var contentForm = clone.querySelector('form');
                if (contentForm) {
                    $(contentForm).replaceWith(innerHtml);
                    return clone;
                } else {
                    return clone;
                }
            }
        },



        createTemplateNode:function(templateStr){
            templateStr = '<template>' + templateStr + '</template>';
            var doc = new DOMParser().parseFromString(templateStr, 'text/html');
            //mainly for safari here(???, native DOMParser for safari returning null)
            if (!doc) {
                doc = DOM.parser(templateStr);
            }
            PolyFill.template(doc);//ie 11
            return doc.querySelector('template');
        },

        checkForDuplicate:function(tag){
            var length=Scope.importElements.length;
            var alreadyExists=false;
            for(var i=0; i<length;i++){
                var element_=Scope.importElements[i];
                if(tag===element_.tag){
                    alreadyExists=true;
                    break;
                }
            }
            return alreadyExists;
        },

        customElementMutations:function(added){
            if(!Scope.upgradeElementQueueFlag){
                Element.discover(added);
            }else{
                var timeoutId=setInterval(function(){
                    if(!Scope.upgradeElementQueueFlag){
                        clearInterval(timeoutId);
                        Element.discover(added);
                    }
                },QUEUED_IMPORTS_INTERVAL);
            }
        }
    };

    var Element={

        discover: function(added){
            var self=this;
            setTimeout(function(){
                self.discoverCustomElementDefinitions(added);
            },DISCOVER_TIMEOUT);

        },

        discoverCustomElementDefinitions:function(added,doc){
            var definitions= $.elliptical.definitions;
            definitions.forEach(function(tagName,name){
                var elements = (doc) ? $(added).find(tagName) : $(added).selfFind(tagName);
                if(elements && elements.length >0){
                    this.instantiateCustomElements(elements,name);
                }
            });
        },

        instantiateCustomElements:function(elements,name){
            var self=this;
            $.each(elements,function(index,element){
                self.instantiate(element, name);
            });
        },

        instantiate:function(element, name){
            var $element = $(element);
            var camelCase = $element.attr('camel-case');
            if (camelCase === undefined) {
                camelCase = true;
            }
            //check is light DOM element and not already instantiated
            var isDOM=isLightDOMElement(element);
            if(isDOM){
                var isInstantiated = this.isInstantiated(element, name);
                if (!isInstantiated) {
                    var opts = this.getOpts(element, camelCase);
                    $element[name](opts);
                }
            }
        },

        isInstantiated:function(node,name){
            var dataset=node.dataset;
            if(dataset.upgraded===undefined){
                dataset.upgraded=false;
            }
            return (name=== $.data(node,'custom-' + name));
        },


        getOpts:function(element,camelCase){
            if(camelCase===undefined){
                camelCase=true;
            }
            var opts={};
            $.each(element.attributes,function(i,obj){
                var opt=obj.name;
                var val = obj.value;
                if(!testAttr(opt)){
                    var patt=/data-/;
                    if(patt.test(opt)){
                        opt=opt.replace('data-','');
                    }
                    if(camelCase && camelCase !=='false'){
                        (opt !== 'template') ? opts[opt.toCamelCase()] = booleanCheck(val) : (opts[opt] = booleanCheck(val));

                    }else{
                        opts[opt.toCamelCase()]= booleanCheck(val);
                    }
                }
            });

            return opts;
        }
    };


    /* listeners ---------------------------------------------------- */
    window.addEventListener(IMPORTS_LOADED, function(event) {
        Parser.bindLinkImports();
    });

    window.addEventListener(WEB_COMPONENTS_READY, function(event) {
        if(READY_COUNT===0){
            Element.discoverCustomElementDefinitions(document,true);
            READY_COUNT=1;
        }
    });

    //start mutation observer summary
    Observer.connect();
    //expose the handlers for the Observer
    Listener.start();

    //public api
    var HTML5Imports={};
    HTML5Imports.upgradeElement=function(tag,node,callback){
        Parser.parseElementImport(tag,node,callback,true);
    };

    HTML5Imports.instantiate=function(element,name){
        Element.instantiate(element,name);
    };

    window._HTML5Imports=HTML5Imports;


})();

