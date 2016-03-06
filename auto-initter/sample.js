var app = {};

app.augmentToggler = function() {
	//Get the nearest toggler instance
	var toggler = $(this.primaryTarget).data('instances')[0];
	var reset = true;
	
	toggler.bindOnce('onClose',function(){
		$.get( "/samples/auto-initter/evolve.php?reset=" + reset, function( data ) {
			var dom = $(toggler.content).html(data);
			Lib.AutoInitter.init(dom);			
			reset = false;
		});
	});
};

app.form = function() {
	//Hide submit button
	var toggleElement = $(this.primaryTarget).nearest('.toggle-button');
	var toggler = $(toggleElement).data('instances')[0];

	//Make the form AjaxAble
	var self = this;
 	self.ajaxForm = new Lib.AjaxForm(this.primaryTarget);
	self.submitButton = $(self.primaryTarget).find('input:submit');
		
	toggler.bindOnce('onOpen',function() {
		//Stop the job of toggling so we can do the job of submitting
		toggler.deactivate();	
		
		//Hide the submit button and change the toggle button's text
		$(toggleElement).html('Next');
		$(self.submitButton).fadeOut(3000);
		
		$(toggleElement).one('click',function(){
			//Submit the form
			self.ajaxForm.submit(function(){
				//Resuming toggling
				toggler.activate();	
				$(toggleElement).html('Thanks for clicking');
			});
		});
	}); 	
};




