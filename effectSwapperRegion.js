/**
 * @author Juan Bernardez
 *
 * This is a Region that includes View swapping with CSS3 effects. I was using it for mobile
 * apps development with cordova, so I am commenting some pieces of code that we don't need
 * here.
 * The "reverse" options of the effects will become unused, as I am allways calling "swapViewFrom"
 * method with the "reverse" parameter to false.
 *
 */

define([
	'jquery',
	'lodash',
	'marionette'
],

function($, _, Marionette){
	'use strict';

	//For a bit more compatibility with older browsers
	var transitions = {
			'transition': 'transitionend',
			'WebkitTransition': 'webkitTransitionEnd',
			'MozTransition': 'transitionend',
			'OTransition': 'otransitionend'
		},
		transitionEnd,
		elem = document.createElement('div');
 
	for(var t in transitions){
		if(typeof elem.style[t] !== 'undefined'){
			transitionEnd = transitions[t];
			break;
		}
	}

	var EffectSwapperRegion = Marionette.Region.extend({
		
		effects: {
			//Slide to left
			slideLeft: {
				currentView: 'swapper transition-fast left',
				newView: {
					start: 'swapper right',
					end: 'swapper transition-fast center'
				}
			},
			//Slide to right
			slideRight: {
				currentView: 'swapper transition-fast right',
				newView: {
					start: 'swapper left',
					end: 'swapper transition-fast center'
				}
			},
			//Fade effect
			fade: {
				currentView: 'swapper transition-slow invisible',
				newView: {
					start:'swapper invisible',
					end:'swapper transition-slow visible'
				}
			},
			
			//Appear effect
			appear: {
				currentView: 'swapper goback',
				newView: {
					start:'swapper minimized',
					end:'swapper transition maximized'
				}
			},
			//"Disappear" effect
			disappear: {
				currentView: 'swapper transition minimized',
				newView: {
					start: 'swapper goback',
					end: 'swapper transition maximized'
				}
			}
		},
		
		show: function(view, effect){
			this.ensureEl();
		
			var isViewClosed = view.isClosed || _.isUndefined(view.$el),
				isDifferentView = view !== this.currentView;

			view.render();
			Marionette.triggerMethod.call(this, "before:show", view);
			Marionette.triggerMethod.call(view, "before:show");
			
			if (isDifferentView || isViewClosed) {
				this.swapView(view, effect);
			}
		},
		
		swapView: function(view, effect) {
			
			if (!this.currentView || !effect) {
				this.$el.empty().append(view.$el);
				view.$el.attr("class", "swapper center");
				this.swapDone(view);
				return;
			}
	
			// Position the view at the starting position of the animation
			view.$el.attr("class", this.effects[effect].newView.start);
			this.$el.append(view.$el);
			//When the transition (that we start below) has ended, the swap has been done
			view.$el.one(transitionEnd, _.bind(this.swapDone, this, view));
	
			// Force reflow. More information here: http://www.phpied.com/rendering-repaint-reflowrelayout-restyle/
			this.$el[0].offsetWidth;
	
			// Position the new view and the current view at the ending position of their animation with a transition class indicating the duration of the animation
			//view.$el.attr("class", this.effects[effect].newView.end);
			view.el.setAttribute("class", this.effects[effect].newView.end);
			this.currentView.$el.attr("class", this.effects[effect].currentView);
		},
		
		swapDone: function(view){
			//Close the previous view
			this.close();
			//Set as currentView the new view
			this.currentView = view;

			Marionette.triggerMethod.call(this, "show", view);
			Marionette.triggerMethod.call(view, "show");
		}
		
	});
	
	return EffectSwapperRegion;
});