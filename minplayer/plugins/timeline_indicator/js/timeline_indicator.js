/** The minplayer namespace. */
var minplayer = minplayer || {};

/**
 * @constructor
 * @extends minplayer.display
 * @class This is the timeline indicator.
 *
 * @param {object} context The jQuery context.
 * @param {object} options This components options.
 */
minplayer.timeline_indicator = function(context, options) {

  // Derive from display
  minplayer.display.call(this, 'timeline_indicator', context, options);
};

/** Derive from minplayer.display. */
minplayer.timeline_indicator.prototype = new minplayer.display();

/** Reset the constructor. */
minplayer.timeline_indicator.prototype.constructor = minplayer.timeline_indicator;

/**
 * Return the display for this plugin.
 */
minplayer.timeline_indicator.prototype.getDisplay = function() {

  // Setup the tagger, line and text.
  var timeline_indicator = jQuery(document.createElement('div')).attr({
    'class': 'timeline-indicator'
  });

  var timeline_indicator_line = jQuery(document.createElement('div')).attr({
    'class': 'timeline-indicator-line'
  });

  var timeline_indicator_text = jQuery(document.createElement('div')).attr({
    'class': 'timeline-indicator-text'
  });

  // Store the seekbar as the seek context.
  this.seek = this.context;

  // Append the timeline indicator elements, and add them to the context.
  timeline_indicator.append(timeline_indicator_line).append(timeline_indicator_text);
  this.context.before(timeline_indicator);
  timeline_indicator.hide();
  return timeline_indicator;
}

/**
 * @see minplayer.display#getElements
 * @return {object} The elements defined by this display.
 */
minplayer.timeline_indicator.prototype.getElements = function() {
  var elements = minplayer.display.prototype.getElements.call(this);
  return jQuery.extend(elements, {
    timeline_indicator_line: jQuery(".timeline-indicator-line", this.display),
    timeline_indicator_text: jQuery(".timeline-indicator-text", this.display)
  });
};

/**
 * @see minplayer.plugin#construct
 */
minplayer.timeline_indicator.prototype.construct = function() {

  // Call the minplayer plugin constructor.
  minplayer.display.prototype.construct.call(this);

  // Set the plugin name within the options.
  this.options.pluginName = 'timeline_indicator';

  // Get the width and offset of the controller.
  var offset = this.seek.offset().left;
  var width = this.seek.width();
  var handleZIndex = jQuery('.ui-slider-handle', this.seek).css('zIndex');
  this.elements.timeline_indicator_line.css('zIndex', (handleZIndex - 1));

  // The showTimer.
  var showTimer = 0, self = this;
  this.seek.unbind('mouseover').bind('mouseover', function(event) {
    clearTimeout(showTimer);
  });
  this.seek.unbind('mouseleave').bind('mouseleave', function(event) {
    showTimer = setTimeout(function() {
      self.display.hide();
    }, 3000);
  });
  this.display.unbind('mouseover').bind('mouseover', function(event) {
    clearTimeout(showTimer);
  });
  this.display.unbind('mouseleave').bind('mouseleave', function(event) {
    showTimer = setTimeout(function() {
      self.display.hide();
    }, 3000);
  });

  // Get the media element.
  this.get('media', function(media) {

    // The seek percentage.
    var seek = -1;

    // If they click on the tagger line, we still want to seek.
    self.elements.timeline_indicator_line.click(function() {
      if (seek >= 0) {
        media.seek(seek);
      }
    });

    // Get the media duration.
    media.getDuration(function(duration) {
      self.seek.unbind('mousemove').bind('mousemove', function(event) {
        clearTimeout(showTimer);
        if (!self.display.is(':visible')) {
          self.display.show();
        }
        var posX = (event.pageX - offset);
        posX = (posX < 0) ? 0 : posX;
        posX = (posX > width) ? width: posX;
        seek = (duration * (posX / width));
        var time = minplayer.formatTime(seek);
        self.elements.timeline_indicator_text.text(time.time + time.units);
        self.display.css('margin-left', posX);
      });
    });

    // We are now ready.
    self.ready();
  });
};

// Add the timeline indicator to the controller.
minplayer.get('controller', function(controller) {
  controller.timeline_indicator = new minplayer.timeline_indicator(controller.elements.seek);
});