Lib.Toggler = function(options){
    // Note - our object, when instantiated using the AutoInitter,
    // constructs with the property "primaryTarget",
    // which is a reference to the html element this instance is tied to.
	var self = this;
	this.options = options;
    this.clickMe = this.primaryTarget;
    this.content = $(this.primaryTarget).next(); 
    this.state = options.state;
	this.active = true;

 
	// On construction, what to do when we first start?
    if(options.state == 'open') {
    	this.open();
    } else {
 		this.close();
    } 
	
	// Toggling - setup an events and do some fancy stuff 
	// that jQuery couldn't even dream of
	$(this.clickMe).click(function(event){
		if(!self.active)
			return true;
		
		if(self.state == "open") 
			self.close();
		else
			self.open();
	});
};
 
Lib.Toggler.prototype.open = function() {
	var self = this;

	self.content.fadeIn(function() {
		self.state = "open";
		var event = jQuery.Event("onOpen");
		$(self.primaryTarget).trigger(event);		
	});
};

Lib.Toggler.prototype.close = function() {
	var self = this;

	this.content.fadeOut(function() {
		self.state = "closed";
		var event = jQuery.Event("onClose");
		$(self.primaryTarget).trigger(event);	
	});
};

Lib.Toggler.prototype.deactivate = function(callback){
	this.active = false;
};

Lib.Toggler.prototype.activate = function(callback){
	this.active = true;
};

//Just wrapping jquery's bind
Lib.Toggler.prototype.bind = function(event,callback) {
	$(this.primaryTarget).bind(event,callback);
};

Lib.Toggler.prototype.bindOnce = function(event,callback) {
	$(this.primaryTarget).one(event,callback);
};





