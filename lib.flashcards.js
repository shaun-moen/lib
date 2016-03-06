var Lib = (Lib)? Lib : {};

Lib.FlashCards = function(spreadSheetUrl) {
    var $this = this;
    this.index = 0;
    this.selectors = {
        categories: '.categories.control select',
        card: '.card',
        cardQuestion: '.card .question',                
        cardAnswer: '.card .answer',                
        prev: '.prev',
        next: '.next',
        index: '.index',
        sort: '.sort-value'
    };

    this.getRawData(spreadSheetUrl, function(data) {
        $this.rawData = data;
        $this.formatData();
        $this.populateCategories();
        $this.setMode("rand");
    });

    //Handle change category
    $('body').on('change', this.selectors.categories, function(event) {
        var category = $(this).find("option:selected").attr('value');
        $this.setCategory(category);
    });

    //Handle sort
    $(this.selectors.sort).change(function(){
       var mode = $($this.selectors.sort + ':checked').val()
        $this.index = 0;             
        $this.setMode(mode); 
        $this.sortData();
        $this.displayCard();
    });
    
    //---------- Menu Toggle ----------		
    $('.menu').bind('click',function(e){
        $('.menu').removeClass('closed',500, "easeOutSine");	
        $this.voidBodyClick = true;
    });
    $("body").bind('click', function(e) {
        if(!$this.voidBodyClick) {
            $('.menu').addClass('closed',500, "easeOutSine");	
        }
        $this.voidBodyClick = false;
	});               
    

    //---------- Previous ----------
    $("body").bind('swipeleft', function(e){ 
        e.stopImmediatePropagation();
		$this.next();
        $this.displayCard();				
		return false;
	});
    $(".prev").bind('click', function(e){
	    e.stopImmediatePropagation();
        $this.prev();	
        $this.displayCard();                 
		return false;
	});	
	
    //---------- Next ----------
    $("body").bind('swiperight', function(e){
	    e.stopImmediatePropagation();
        $this.prev();	
        $this.displayCard();                 
		return false;
	});
    $(".next").bind('click', function(e){
	    e.stopImmediatePropagation();
        $this.next();	
        $this.displayCard();                 
		return false;
	});
	
    //---------- Show Answer ----------
	$('.answer').click(function(e){
	    $this.showAnswer(); 
	});
	
//             $("body").bind('swipedown', function(e){ 
//                 e.stopImmediatePropagation();
//                 $this.showAnswer(); 				
// 				return false;
// 			});
};

Lib.FlashCards.prototype.setMode = function(mode) {
    this.mode = mode;     
}        

Lib.FlashCards.prototype.getRawData = function(spreadSheetUrl, callback) {
    $.ajax({
            url: spreadSheetUrl,
            data: {},
            success: function(response) {
                handleResponse = function(data) {
                    callback(data);
                };
                eval(response);
            },
            dataType: 'html'
        });
};

/* Creates a useable data structure that can be sorted later on*/
Lib.FlashCards.prototype.formatData = function() {
    var data = this.rawData;
    var column = [];
    var sortedData = [];
    sortedData["All"] = [];
    
    for (row in data.feed.entry) {
        for (key in data.feed.entry[row]) {
            if (key.substr(0, 4) == "gsx$") {
                if (key == "gsx$_cpzh4" || key == "gsx$_cre1l")
                    continue;

                var column = key.substr(4)
                var value = data.feed.entry[row][key].$t;

                if (!sortedData[column]) {
                    sortedData[column] = [];
                }
                if (value) {
                    sortedData[column].push(value);
                    if(column.indexOf('finn') == -1) {
                        sortedData["All"].push(value);
                    }
                }
            }
        }
    }

    this.data = sortedData;
};

/* Sorts data structure by mode */
Lib.FlashCards.prototype.sortData = function() {
    switch (this.mode) {
        case "asc":
            this.data[this.category].sort();
            break;
        case "desc":
            this.data[this.category].sort().reverse();
            break;
        case "rand":
        default:                    
            //http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array ere is a JavaScript implementation of the Durstenfeld shuffle (A computer-optimized version of Fisher-Yates). @TODO, learn not to make TODOs, then put this code where it belongs :)
            this.shuffleArray = function(array) {
                for (var i = array.length - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1));
                    var temp = array[i];
                    array[i] = array[j];
                    array[j] = temp;
                }
                return array;
            }
            this.data[this.category] = this.shuffleArray(this.data[this.category]);
            break;
    }
}

Lib.FlashCards.prototype.prev = function() {
    this.index--;
    if (this.index < 0) this.index = this.data[this.category].length - 1;
};

Lib.FlashCards.prototype.next = function() {
    this.index++;
    if (this.index > this.data[this.category].length - 1) this.index = 0;
};

Lib.FlashCards.prototype.displayCard = function(index, category) {
    var index = (index) ? index : this.index;
    var category = (category) ? category : this.category;
    
    if(typeof this.data[category] == 'undefined' || typeof this.data[category][index] == 'undefined')
        return false;
        
    var value = this.data[category][index];
    var parts = value.split(":");
    var question = parts[0];
    var answer = (parts[1])? parts[1] : '';
    var placeholder = (answer)? $(this.selectors.cardAnswer).data('placeholder') : '';
    
    $(this.selectors.cardQuestion).show();
    $(this.selectors.cardQuestion).html(parts[0]);
    
    $(this.selectors.cardAnswer).html(placeholder);
    $(this.selectors.cardAnswer).data('answer',answer);

    $(this.selectors.index).html((index + 1) + " of " + this.data[category].length + ' total');
    
};

Lib.FlashCards.prototype.showAnswer = function() {
    $(this.selectors.cardAnswer).html($(this.selectors.cardAnswer).data('answer'));             
};

Lib.FlashCards.prototype.populateCategories = function() {
    for (category in this.data) {
        $(this.selectors.categories).append($("<option />").val(category).text(category));
    }
};

Lib.FlashCards.prototype.setCategory = function(category) {
    var $this = this;
    this.category = category;
    this.sortData();
    this.displayCard();
};