var $ = $jQuery = jQuery.noConflict();

$.fn.nearest = function(selector) {
  // base case if we can't find anything
  if (this.length == 0)
    return this;
  var nearestSibling = this.prevAll(selector + ':first');
  if (nearestSibling.length > 0)
    return nearestSibling;
  return this.parent().nearest(selector);
};

