// The Lib Namespace
var Lib = (Lib)? Lib : {};

/**
 * Object Literal: Math 
 * 
 * Container for various math functions
 */
Lib.Math = {};
Lib.Math.isNumeric = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

/**
 * Object Constructor: Ajax Form
 * 
 * Serialize a form and submit via Ajax.
 * Replace the form with the response.
 * Auto-init on the response markup
 */
Lib.AjaxForm = function(target) {
	var self = this;
	this.element = this.primaryTarget = (target)? target : this.primaryTarget;
	this.link = $(this.element).attr('href');
	this.action = $(this.element).attr('action');
	
	if($(this.element).is('form')) {
		$(self.element).submit(function(event) {
			var $self = self;
			event.preventDefault();
			
			$.ajax({
				url: $self.action,
				type: 'POST',
				data: $(self .element).serialize(),
				success: function(response) {
					var dom = $($self.primaryTarget).html(response);
					Lib.AutoInitter.init(dom);				
				}
			});	
		});		
	}
};

Lib.AjaxForm.prototype.submit = function(callback) {
	if(callback) {
		$(this.element).bind('submit',callback);
	}
	
	$(this.element).trigger('submit');
};


/**
 * Object Constructor: Registry
 * 
 * Creates a registry object.
 * 
 * Example:
 * var registry = new Lib.Registry();
 *  
 * @author Shaun Moen <shaun@dittyjamz.com>
 **/        	
Lib.Registry = function() {
	this.elements = [];	
};

Lib.Registry.prototype.exists = function(key) {
	 return (this.elements[key] && this.elements[key].length)? true : false;
};
 
Lib.Registry.prototype.get = function(key,what) {
	if(!key) {
		return null;
	}

	if(Lib.Math.isNumeric(what)) {
		return this.elements[key][what];
	}

	switch(what)
	{
		case "allInstances":
			return this.elements[key];
			break;
		case "lastInstance":
			return this.elements[key][this.elements[key].length - 1];	
			break;
		case "firstInstance":
		default:
			if(this.elements[key] instanceof Array && this.elements[key].length) {
				return this.elements[key][0];	
			}
			break;
		
	}
};

//Sets a key value pair
Lib.Registry.prototype.set = function(key,value) {
	this.elements[key] = value;
};

//Adds a value to an array of values if the specified key exists
Lib.Registry.prototype.add = function(key,value) {
	if(this.exists(key)) {
		this.elements[key].push(value);
	} else {
		this.elements[key] = [value];
	}		
};

/**
 * Function:  Instantiate With Scope
 *
 * This function instantiates a function with a given context (scope).  Unfortuantly, the javascript "new" keyword doesn't allow you to do this:  
 * var instance = new PseudoClass.apply(scope,args);
 *
 * So we have to recreate the functionality of the "new" keyword.  
 * With ECMAScript 5, we could use following method:
 * But it's not cross browser, and we can't gurantee everyone has 5 or greater. 
 * 
 * var object = Object.create(PseudoClass,{
 *		'id' : {
 *			value: 'value1',
 *			enumerable:true // writable:false, configurable(deletable):false by default
 *		},
 *		'name': {
 *			value: 'value2',
 *			enumerable: true
 *		}
 * });  
 *
 * So, without further ado: 
 * 
 * @author Shaun Moen <shaun@dittyjamz.com>
 * @param constructor  - a function to instantiate
 * @param args - an array of arguments to pass to the constructor
 * @param scope - the scope to pass in, which becomes "this" in the instaniated function
 **/

Lib.instantiateWithScope = function (constructor, args, scope) {
    PseudoClass.prototype = constructor.prototype;
    function PseudoClass() {
		$.extend(this,scope);
        return constructor.apply(this, args);
    }
    return new PseudoClass();
};


/**
 * Object Literal: AutoInitter
 * 
 * Given a selector, the following logic finds all elements with the "auto-init" class 
 * and calls a function (or constructor) using the provided HTML attributes:
 *
 * "data-function"
 * "data-arguments"
 * "data-instantiate". 
 *
 * For each function called, a context or scope is created, which contains
 * the property "primaryTarget" that references the
 * DOM Element invoking it. 
 *
 * @author Shaun Moen <shaun@dittyjamz.com>
 */
Lib.AutoInitter = {};	
Lib.AutoInitter.completedCount = 0;	
Lib.AutoInitter.init = function(selector) {

	// Find and iterate over .auto-init class elements
	$(selector).find('.auto-init').each(function(){	

		var self = $(this).get(0); //Return the underlying dom element		
		var key = ($(this).attr('id'))? $(this).attr('id') : 'auto-gen';

		// Get the requirements to call or instantiate a function(s).
		// The variable "arguments" is reserved by javascript 
		// so we have to use another name, I picked $arguments.
		// Note - there's nothing special about the dollar sign in javascript, it's just a letter.
		// both jQuery and Prototype use it as a function name, by iteself :)
		var functions	= ($(this).attr('data-function'))? $(this).attr('data-function').split(',') : "[]";
		var $arguments	= ($(this).attr('data-arguments'))? $.parseJSON("[" + $(this).attr('data-arguments') + "]") : "[]";
		var instantiates	= ($(this).attr('data-instantiate'))? $(this).attr('data-instantiate').split(',') : "[]";
		var instances = [];
		
		// Iterate over each function for the current HTML element.
		// Elements can invoke multiple functions (and respective arguments), comma delimited.
		$.each(functions,function(index,funcName) {
			var args		= $arguments[index];
			var instantiate = JSON.parse(instantiates[index]); //Convert truthy/falsey values to Boolean
			var instance = null;		
			
			// Force an array for arguments if not already one
			if(!$.isArray(args)) {
				args = [];
			}
			
			// We have to locate the function by name using the window object
			// because you can't use a string literal to call the function in javascript.
			var funcRef = 'window["' + funcName.replace(/[.]/g,'"]["') + '"]';

			// This is a time to use eval :)
			eval("var func = " + funcRef + ";");	

			// Make sure the function exists
			if(typeof func === 'function') {
				
				// Should we construct an object with the keyword "new" or just call the function
				if(instantiate) {
					instance = Lib.instantiateWithScope(func,args,{ 
						primaryTarget : self 
					});
				}
				else {					
					// Just calling a function here
					// I'm using a modified window context so I can call native functions
					// but user defined functions should work too.
					window.primaryTarget = self;
					func.apply(window, args);
					instance = func;
				}
				
				// Register it in our registry so we can help keep track of them.
				if(key) {
					Lib.registry.add(key,instance);
					instances.push(instance);
					
					$(self).data('instance', instances[0]); //Always point to first instance (for convenience)
					$(self).data('instances', instances);			
				}			
			}		
		});		
	});
	
	// Trigger an event saying that we are done insantiating all of our objects.
	Lib.AutoInitter.completedCount++;
	var event = jQuery.Event("autoInitsComplete");
	event.completedCount = Lib.AutoInitter.completedCount;
	$(document).trigger(event);	
};


//Instantiate official Lib.registry
Lib.registry = new Lib.Registry();

$(document).ready(function() {
	Lib.AutoInitter.init(this);
});


