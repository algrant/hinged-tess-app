/*!
 * Hinged Tessellation App
 *
 * Written for the sake of demonstrating that any quadrilateral with 
 * any two angles adding up to 180 degrees will always be hinge-tessellable.
 *
 * YMMV, not written with public consumption in mind.
 *
 * Copyright (c) 2013 Al Grant (http://www.algrant.ca)
 *
 * Licensed under MIT:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Based almost entirely on this: 
 * http://www.cgl.uwaterloo.ca/~csk/projects/escherization/geo.py.txt
 */




//UI Stuff
(function( $ ){ //sliderInput
	var methods = {
		init : function(options) {
			var si_value		= options['value'];
			var si_stepping		= options['stepping'];
			var si_min		= options['min'];
			var si_max		= options['max'];
			
			$(this).find('.sliderInput-input').val(si_value);
			$(this).find("#sliderInput-slider").slider({
				animate:false,
				step: si_stepping,
				min: si_min, 
				max: si_max,
				value: [si_value],
				slide: function(e, ui){ 
							$(this).siblings('.sliderInput-input').val(ui.value);
							options['callback'](ui.value);
						}
			});
			$(this).find('.sliderInput-input').keyup(function(e){
				var code = e.keyCode || e.which;
				if(code == 13) { //Enter key
				var si_value = parseInt(this.value);
					if(si_value >= si_min && si_value <= si_max){
						$(this).siblings("#sliderInput-slider").slider('value',si_value);
						options['callback'](si_value);
					}else{
						alert('Please enter a value between '+si_min+' and '+si_max);
						return false;
					}
				}		
			});
			$(this).find('.sliderInput-input').blur(function(){
				//this.parent().sliderInput('update',this.value)
				var si_value = parseInt(this.value);
				if(si_value >= si_min && si_value <= si_max){
					$(this).siblings("#sliderInput-slider").slider('value',si_value);
					options['callback'](si_value);
				}else{
					alert('Please enter a value between '+si_min+' and '+si_max);
					return false;
				}
			});
			
		},
		update : function( value ) {
			$(this).find("#sliderInput-slider").slider('value',value);
			$(this).find(".sliderInput-input").val(value);
			
		}
	};
		
	$.fn.sliderInput = function( method ) {
		// Method calling logic
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
		}    
	}
	
})(jQuery);

//Application Functions
function theta_update(new_theta){
	theta = new_theta;
	update_tess();
};

//var sa = new simpanim(10);

var diddlyDee = new Date();
var last_t_update = diddlyDee.getTime();

function theta_update_anim(new_theta){
	var diff = new_theta-theta;
	var time_since_last = diddlyDee.getTime() - last_t_update;

	if ((Math.abs(diff) > 10) && (time_since_last>100) ) {
		var speed = 2; //unit/(ms*res)	
		var ar = new Array(parseInt(Math.abs(diff/speed)));
		for (i=0;i<ar.length;i++){
			ar[i] = theta + diff/Math.abs(diff)*speed*i;
		}
		ar[ar.length] = new_theta;
		//sa.init(ar,theta_update);
		//sa.run();
	}else{
		theta_update(new_theta);
	}
	last_t_update = diddlyDee.getTime();
};

function me_cyclic(ev){

	//console.debug("me_cyclic cur_quad", cur_quad);
	//console.debug("me_cyclic cyclic_quad", cyclic_quad);
	//console.debug("me_cyclic trapezoid", trapezoid);


    x = ev.offsetX - 100;
    y = ev.offsetY - 100;
    
    
    mouse_point = new simple2d.Point(x,y);
    cyclic_canvas[3].save();
    nearest = -1;
    last_best = 400; //greater distance than possible...

    for (i=0;i<=3;i++){
    	if(cyc_or_trap){
        	d_temp = (new simple2d.Point(cur_quad[i].x*1.15,cur_quad[i].y*1.15)).distance(mouse_point)
        }else{
	    	d_temp = (new simple2d.Point(cur_quad[i].x,cur_quad[i].y)).distance(mouse_point)
	    };

        if (d_temp < last_best){
            nearest = i;
            last_best = d_temp;
        }
    }
    
    cyclic_canvas[3].clearRect(-100,-100,200,200);
    cyclic_canvas[3].strokeStyle = 'rgba(200,200,100,25)';
    cyclic_canvas[3].lineWidth   = 4;
    
    if (last_best < 15){
        cyclic_canvas[3].strokeStyle = 'rgb(255,0,0)';
        cyclic_canvas[3].beginPath()
        if(cyc_or_trap){
       	cyclic_canvas[3].arc(cur_quad[nearest].x*1.15,cur_quad[nearest].y*1.15,12,0,Math.PI*2,true);
	    }else{
	    cyclic_canvas[3].arc(cur_quad[nearest].x,cur_quad[nearest].y,12,0,Math.PI*2,true);	
	    }
        cyclic_canvas[3].stroke();
        cyclic_drag = nearest;
    } else{
        cyclic_drag = -1;
    };
    
    var func = c_dragtool[ev.type];
    if (func){
        func(ev);
        };
    cyclic_canvas[3].restore();
};

function cyclic_dragtool(){
    var tool = this;
    this.started = false;
    var selecteditem = -1;
    

    // This is called when you release the mouse button.
    this.mouseup = function (ev) {
      console.log('mouseup start - dragtool', tool.started);
      if (tool.started) {
        selecteditem = -1;
        tool.started = false;
      }
      console.log('mouseup end - dragtool', tool.started);
    };










    // This is called when you start holding down the mouse button.
    //sets the selected item...!
    this.mousedown = function (ev) {
        //console.log('mousedown - dragtool');
        if (cyclic_drag != -1)
        {
            selecteditem = cyclic_drag; //TODO what's nearest
            tool.started = true;
        }
    };

    // This function is called every time you move the mouse. It only 
    // draws if the tool.started state is set to true (when you are holding down 
    // the mouse button).
    this.mousemove = function (ev) {


      if (tool.started) {
        //update that point...
        if (cyc_or_trap){ 	//cyclic
	        mouse_vec = new simple2d.Point(ev.offsetX-100,ev.offsetY-100);
	        mouse_vec = mouse_vec.normalise()
	        cur_quad[selecteditem] = new simple2d.Point(mouse_vec.x*70,mouse_vec.y*70);
	        //cyclic_quad = cur_quad.slice(0);
        }else{				//trapezoid

        		if (selecteditem < 2) {
	        		cur_quad[0].y = ev.offsetY - 100;
	        		cur_quad[1].y = ev.offsetY - 100;
	        		cur_quad[2].y = 100 - ev.offsetY;
	   				cur_quad[3].y = 100 - ev.offsetY;
	   			}
        		else {
	        		cur_quad[0].y = 100 - ev.offsetY;
	        		cur_quad[1].y = 100 - ev.offsetY;
	        		cur_quad[2].y = ev.offsetY - 100;
	   				cur_quad[3].y = ev.offsetY - 100;
	   			}
	   					        		
        	cur_quad[selecteditem].x = ev.offsetX-100;
        	//trapezoid = cur_quad.slice(0);
        }

        cyclic_canvas[3].save();
        cyclic_canvas[3].clearRect(-100,-100,200,200);
        
        cyclic_canvas[3].strokeStyle = 'rgb(255,255,0)';
        cyclic_canvas[3].beginPath();

        if(cyc_or_trap){
        	cyclic_canvas[3].arc(cur_quad[selecteditem].x*1.15,cur_quad[selecteditem].y*1.15,12,0,Math.PI*2,true);
        }else{
        	cyclic_canvas[3].arc(cur_quad[selecteditem].x,cur_quad[selecteditem].y,12,0,Math.PI*2,true);
        };

        cyclic_canvas[3].stroke();
        cyclic_canvas[3].restore();
        
        update_cyclic();
      };
    };


};

function update_cyclic(){
    // clear canvas
    cyclic_canvas[1].clearRect(-100,-100,200,200); 
    
    //Background circle
    if(cyc_or_trap){
	    cyclic_canvas[1].save();
	        cyclic_canvas[1].strokeStyle = 'rgba(0,0,0,100)';
	        cyclic_canvas[1].beginPath();
	        cyclic_canvas[1].arc(0,0,70,0,Math.PI*2,true);
	        cyclic_canvas[1].stroke();
	    cyclic_canvas[1].restore();
	}

    //Cyclic Quadrilateral

	cyclic_canvas[1].font         = 'bold 15px sans-serif';
	cyclic_canvas[1].textBaseline = 'middle';
	
	
	for (i=0;i<=3;i++){
		if(cyc_or_trap){
	        cyclic_canvas[1].fillStyle = 'rgb(255,255,255)';
	        cyclic_canvas[1].beginPath();
	        cyclic_canvas[1].arc(cur_quad[i].x*1.15,cur_quad[i].y*1.15,12,0,Math.PI*2,true);
			cyclic_canvas[1].fill();
			cyclic_canvas[1].fillStyle = 'rgb(0,0,0)';
			cyclic_canvas[1].arc(cur_quad[i].x*1.15,cur_quad[i].y*1.15,11,0,Math.PI*2,true);
	        cyclic_canvas[1].stroke();
			cyclic_canvas[1].fillText  ((i).toString(), cur_quad[i].x*1.15-5,cur_quad[i].y*1.15);
		}else{
			cyclic_canvas[1].fillStyle = 'rgb(255,255,255)';
	        cyclic_canvas[1].beginPath();
	        cyclic_canvas[1].arc(cur_quad[i].x,cur_quad[i].y,12,0,Math.PI*2,true);
			cyclic_canvas[1].fill();
			cyclic_canvas[1].fillStyle = 'rgb(0,0,0)';
			cyclic_canvas[1].arc(cur_quad[i].x,cur_quad[i].y,11,0,Math.PI*2,true);
	        cyclic_canvas[1].stroke();
			cyclic_canvas[1].fillText  ((i).toString(), cur_quad[i].x-5,cur_quad[i].y);
		}
    }
	
    cyclic_canvas[1].fillStyle = 'rgb(200,200,200)';
    cyclic_canvas[1].strokeStyle = 'rgb(10,10,10)';
    cyclic_canvas[1].beginPath();
    cyclic_canvas[1].moveTo(cur_quad[0].x,cur_quad[0].y);
    for (i=1;i<=3;i++){
        cyclic_canvas[1].lineTo(cur_quad[i].x,cur_quad[i].y);
    }
    cyclic_canvas[1].lineTo(cur_quad[0].x,cur_quad[0].y);
    cyclic_canvas[1].fill();
    cyclic_canvas[1].stroke(); 

	update_tess();
}

function update_tess(){

	//console.debug("update_tess cur_quad", cur_quad);
	//console.debug("update_tess cyclic_quad", cyclic_quad);
	//console.debug("update_tess trapezoid", trapezoid);


	//Calculate tiles[0-3]	
	// 0: cyclic_quad rotated by alpha.
		tiles[0] = cur_quad.slice(0);
		tiles[1] = new Array();
		tiles[2] = new Array();
		tiles[3] = new Array();
		
		//rotate about 0 by alpha
		trans = simple2d.rotate(alpha*Math.PI/180)
		for (i=0;i<=3;i++){
			tiles[0][i] = trans.mult(tiles[0][i]);
			tiles[0][i] = tiles[0][i].mult(.5)
		};
	

	if (cyc_or_trap){
		//Cyclic
		// 1: 0 mirrored, rotated by theta, 
			//flip along m_vec, which is the vector addition of lines 01 & 23; effectively mirroring quadrilateral
			//and forces line [0]01 to be at the same angle as [1]32, i.e. the correct angle for closed position theta.
		m_vec = ((tiles[0][3].sub(tiles[0][2])).normalise()).add((tiles[0][0].sub(tiles[0][1])).normalise());
		m_trans = simple2d.reflect(m_vec);

		//rotation transform (-theta... because that's how I set it up foolishly!)
		m_trans = m_trans.mult(simple2d.rotate(-theta*Math.PI/180));
		
		for (i=0;i<=3;i++){
			tiles[1][i] = m_trans.mult(tiles[0][i]);
		};
		// 2: 0 rotated by 180, 
		trans = simple2d.rotate(Math.PI);
		tiles[2] = tiles[0].slice(0);
		//rotate by 180
		for (i=0;i<=3;i++){
			tiles[2][i] = trans.mult(tiles[2][i]);
		};	
		
		// 3: 1 rotated by 180, 
			tiles[3] = tiles[1].slice(0);
			//rotate by 180
			for (i=0;i<=3;i++){
				tiles[3][i] = trans.mult(tiles[3][i]);
			};

		//Move each tile to correct placement
		// 1: moved so that points 0:0 = 1:2.
			diff = tiles[0][0].sub(tiles[1][2]);
			move = simple2d.translate(diff.x,diff.y);
			for (i=0;i<=3;i++){
				tiles[1][i] = move.mult(tiles[1][i]);
			};	
		// 2: moved such that point 1:3 = 2:1.
			diff = tiles[1][3].sub(tiles[2][1]);
			move = simple2d.translate(diff.x,diff.y);
			for (i=0;i<=3;i++){
				tiles[2][i] = move.mult(tiles[2][i]);
			};	
		// 3: moved such that point 0:1 = 3:3.
			diff = tiles[0][1].sub(tiles[3][3]);
			move = simple2d.translate(diff.x,diff.y);
			for (i=0;i<=3;i++){
				tiles[3][i] = move.mult(tiles[3][i]);
			};		
	}else{
		//Trapezoid
		//sneakily starting with quad2, as it is simply quad 0 rotated by 180 degress, no matter what theta is.
		// 2: rotated by 180
		trans = simple2d.rotate(Math.PI);

		tiles[2] = tiles[0].slice(0);
		//rotate by 180
		for (i=0;i<=3;i++){
			tiles[2][i] = trans.mult(tiles[2][i]);
		};

		//tile 1 is tile 2 but rotated by theta.
		//rotation transform (-theta... because that's how I set it up foolishly!)
		tiles[1] = tiles[2].slice(0);

		m_trans = trans.mult(simple2d.rotate(theta*Math.PI/180));
		
		for (i=0;i<=3;i++){
			tiles[1][i] = m_trans.mult(tiles[0][i]);
		};

		// 3: 1 rotated by 180, 
		tiles[3] = tiles[1].slice(0);
		//rotate by 180
		for (i=0;i<=3;i++){
			tiles[3][i] = trans.mult(tiles[3][i]);
		};

	//Move each tile to correct placement
		// 1: moved so that points 0:3 = 1:0.
			diff = tiles[0][3].sub(tiles[1][0]);
			move = simple2d.translate(diff.x,diff.y);
			for (i=0;i<=3;i++){
				tiles[1][i] = move.mult(tiles[1][i]);
			};	
		// 2: moved such that point 1:3 = 2:0.
			diff = tiles[1][3].sub(tiles[2][0]);
			move = simple2d.translate(diff.x,diff.y);
			for (i=0;i<=3;i++){
				tiles[2][i] = move.mult(tiles[2][i]);
			};	
		// 3: moved such that point 0:0 = 3:3.
			diff = tiles[0][0].sub(tiles[3][3]);
			move = simple2d.translate(diff.x,diff.y);
			for (i=0;i<=3;i++){
				tiles[3][i] = move.mult(tiles[3][i]);
			};		
	};

	//Rotate each tile about centre, so that things are nice and perpendicular

	
	current_angle = tiles[2][3].sub(tiles[1][1]);
	if (!cyc_or_trap){//trapezoid
		current_angle = tiles[1][2].sub(tiles[0][1]);
	}

	rotate_by = Math.atan2(current_angle.x,current_angle.y);
	rot_trans = simple2d.rotate(rotate_by);
	rot_trans = rot_trans.mult(simple2d.rotate(Math.PI/2));

	for (j=0;j<=3;j++){
		for (i=0;i<=3;i++){
			tiles[j][i] = rot_trans.mult(tiles[j][i]);
		};
	};
	


	//determine offsets
	if (cyc_or_trap){
		offsets[0] = tiles[1][0].sub(tiles[0][2]);
		offsets[1] = tiles[2][3].sub(tiles[1][1]);
	}else{
		offsets[0] = tiles[1][2].sub(tiles[0][1]);
		offsets[1] = tiles[2][2].sub(tiles[1][1]);		
	}
	
	//centre centroid
	c = simple2d.centroid(tiles[0][0],tiles[0][2],tiles[0][1],tiles[0][3]);
	trans_by = simple2d.translate(-c.x,-c.y)
	for (j=0;j<=3;j++){
		for (i=0;i<=3;i++){
			tiles[j][i] = trans_by.mult(tiles[j][i]);
		};
	};
		
	// clear canvas
    ht_canvas[1].clearRect(-300,-300,600,600);
	ht_canvas[1].strokeStyle = 'rgb(10,10,10)';
	
	//draw tiles
	//also draw bounding box - for the sake of interest!
	for (qx=-7;qx<=7;qx++){
		for (qy=-7;qy<=7;qy++){
			//draw tiles
			for (j=0;j<=3;j++){
				ht_canvas[1].fillStyle = tilecolours[j];
				if(qx ==0 && qy ==0 && j == 0){
					ht_canvas[1].fillStyle = 'rgba(255,0,0,256)';
				};
				//if(qx ==0 && qy ==0 && j == 1){
				//	ht_canvas[1].fillStyle = 'rgba(90,55,10,256)';
				//};
				ht_canvas[1].save();
					
					ht_canvas[1].beginPath();
					ht_canvas[1].moveTo(tiles[j][0].x + qx*offsets[0].x + qy*offsets[1].x,tiles[j][0].y + qx*offsets[0].y + qy*offsets[1].y);
					for (i=1;i<=3;i++){
						ht_canvas[1].lineTo(tiles[j][i].x + qx*offsets[0].x + qy*offsets[1].x,tiles[j][i].y + qx*offsets[0].y + qy*offsets[1].y);
					}
					ht_canvas[1].lineTo(tiles[j][0].x + qx*offsets[0].x + qy*offsets[1].x,tiles[j][0].y + qx*offsets[0].y + qy*offsets[1].y);
					ht_canvas[1].fill();
					ht_canvas[1].stroke();
				ht_canvas[1].restore();
			};
			
			//draw grid
			if (disp_grid_ht){
				ht_canvas[1].strokeStyle = 'rgba(44,44,44,256)';
				ht_canvas[1].lineWidth = 1;
				ht_canvas[1].save();
						
					ht_canvas[1].beginPath();
					// ht_canvas[1].moveTo(tiles[0][0].x + qx*offsets[0].x + (qy-1)*offsets[1].x,tiles[0][0].y + qx*offsets[0].y + (qy-1)*offsets[1].y);
					// ht_canvas[1].lineTo(tiles[0][0].x + (qx)*offsets[0].x + (qy+1)*offsets[1].x,tiles[0][0].y + (qx)*offsets[0].y + (qy+1)*offsets[1].y);

					// ht_canvas[1].moveTo(tiles[0][2].x + (qx-1)*offsets[0].x + qy*offsets[1].x,tiles[0][2].y + (qx-1)*offsets[0].y + qy*offsets[1].y);
					// ht_canvas[1].lineTo(tiles[0][2].x + (qx+1)*offsets[0].x + (qy)*offsets[1].x,tiles[0][2].y + (qx+1)*offsets[0].y + (qy)*offsets[1].y);
				
					// ht_canvas[1].moveTo(tiles[0][0].x + (qx+1)*offsets[0].x + (qy-1)*offsets[1].x,tiles[0][0].y + (qx+1)*offsets[0].y + (qy-1)*offsets[1].y);
					// ht_canvas[1].lineTo(tiles[0][0].x + (qx+1)*offsets[0].x + (qy+1)*offsets[1].x,tiles[0][0].y + (qx+1)*offsets[0].y + (qy+1)*offsets[1].y);

					// ht_canvas[1].moveTo(tiles[0][2].x + (qx-1)*offsets[0].x + (qy+1)*offsets[1].x,tiles[0][2].y + (qx-1)*offsets[0].y + (qy+1)*offsets[1].y);
					// ht_canvas[1].lineTo(tiles[0][2].x + (qx+1)*offsets[0].x + (qy+1)*offsets[1].x,tiles[0][2].y + (qx+1)*offsets[0].y + (qy+1)*offsets[1].y);
					ht_canvas[1].moveTo(qx*offsets[0].x + (qy-1)*offsets[1].x, qx*offsets[0].y + (qy-1)*offsets[1].y);
					ht_canvas[1].lineTo((qx)*offsets[0].x + (qy+1)*offsets[1].x, (qx)*offsets[0].y + (qy+1)*offsets[1].y);

					ht_canvas[1].moveTo((qx-1)*offsets[0].x + qy*offsets[1].x,(qx-1)*offsets[0].y + qy*offsets[1].y);
					ht_canvas[1].lineTo((qx+1)*offsets[0].x + (qy)*offsets[1].x,(qx+1)*offsets[0].y + (qy)*offsets[1].y);
				
					ht_canvas[1].moveTo((qx+1)*offsets[0].x + (qy-1)*offsets[1].x,(qx+1)*offsets[0].y + (qy-1)*offsets[1].y);
					ht_canvas[1].lineTo((qx+1)*offsets[0].x + (qy+1)*offsets[1].x,(qx+1)*offsets[0].y + (qy+1)*offsets[1].y);

					ht_canvas[1].moveTo((qx-1)*offsets[0].x + (qy+1)*offsets[1].x,(qx-1)*offsets[0].y + (qy+1)*offsets[1].y);
					ht_canvas[1].lineTo((qx+1)*offsets[0].x + (qy+1)*offsets[1].x,(qx+1)*offsets[0].y + (qy+1)*offsets[1].y);
									
					ht_canvas[1].stroke();
				ht_canvas[1].restore();
				ht_canvas[1].lineWidth = 1;
			};
		};
	};
};

//Application Variables
// cyclic_canvas[0 - 3] 
// ht_canvas[0 - 3]
// 0:Canvas, 1:Context, 2:Overlay_Canvas, 3:Overlay_Context
var cyclic_canvas = new Array();
var ht_canvas = new Array();

//Four points of the quadrilateral
var cyclic_quad = new Array();
var trapezoid = new Array();
var cur_quad = new Array();

//Rotation of cyclic_quad
var alpha = 0;
//How 'open' the hinges are.
var theta = 0;

//Show the grid or not?
var disp_grid_ht = false;

//tiles[0-3]
// 0: cyclic_quad rotated by alpha.
// 1: 0 mirrored, rotated by theta, moved so that points 0:0 = 1:2.
// 2: 0 rotated by 180, moved such that point 1:3 = 2:1.
// 3: 1 rotated by 180, moved such that point 0:1 = 3:3.
var tiles = new Array();

//offsets[0,1]
var offsets = new Array();

//tilecolours[0,3]
var tilecolours = new Array();
tilecolours[0] = 'rgba(237,28,36,50)'; //red
tilecolours[1] = 'rgba(255,245,50,50)'; //yellow
tilecolours[2] = 'rgba(90,240,70,50)'; //green
tilecolours[3] = 'rgba(80,150,225,50)'; //blue

var centre = new simple2d.Point(0,0); //centre of 'tiles' on ht_canvas

var c_dragtool;

// cyclic or trapezoid
var cyc_or_trap = false;

$(document).ready(function() {

	
	//Initialise Radio Button
	$("#quadrilateral-option").buttonset().find('label').css('width','90px').css('font-size','12px');
	
	$("#trap_label").mouseup(function(){
		if ($('#cyclic:checked').val() == 'on'){ 
			cyc_or_trap = false; 
			cyclic_quad = cur_quad.slice(0);
			cur_quad = trapezoid.slice(0);
			update_cyclic();
		};		
	});

	$("#cyclic_label").mouseup(function(){
		if ($('#cyclic:checked').val() != 'on'){ 
				cyc_or_trap = true; 
				trapezoid = cur_quad.slice(0);
				cur_quad = cyclic_quad.slice(0);
				update_cyclic();
		};
	});

	//Initialise Slider Inputs
	$('#theta-slider').sliderInput({
		value:0,
		max:180,
		min:0,
		stepping:1,
		callback:theta_update_anim
	});
	
	//Initialise Show Grid Button
	$( "#show_grid" ).button();
	$( "#option-buttons" ).find("label").css('width','200px').css('font-size','12px');
	$('#show_grid').click(function() {
	  	disp_grid_ht = this.checked;
		if (disp_grid_ht){
			$( "#show_grid" ).button( "option", "label", "Hide Grid" );

		}else{
			$( "#show_grid" ).button( "option", "label", "Show Grid" );
		}

		update_tess()
	});
	
	//Initialise Canvases
	//Cyclic Quad Canvas
	var cyclic_quad_stack = new CanvasStack('quad_canvas', "white");
	var cyclic_quad_bg_id = cyclic_quad_stack.getBackgroundCanvasId();
	console.debug(cyclic_quad_bg_id)
	cyclic_canvas[1] = document.getElementById(cyclic_quad_bg_id).getContext('2d');
	cyclic_canvas[1].translate(100,100);
	cyclic_canvas[2] = cyclic_quad_stack.createLayer(); //new id
	cyclic_canvas[3] = document.getElementById(cyclic_canvas[2]).getContext('2d'); 
	cyclic_canvas[3].translate(100,100);
	document.getElementById(cyclic_canvas[2]).addEventListener('mousedown', me_cyclic, false);
	document.getElementById(cyclic_canvas[2]).addEventListener('mouseup', me_cyclic, false);
	document.getElementById(cyclic_canvas[2]).addEventListener('mousemove', me_cyclic, false);

	//Init Cyclic Quadrilateral
    //four random points on unit circle
    for (i=0;i<=3;i++){
        temp_vec = new simple2d.Point(Math.random()-0.5,Math.random()-0.5);
        temp_vec = temp_vec.normalise();
        cyclic_quad[i] = new simple2d.Point(temp_vec.x*70,temp_vec.y*70);
    }
	//orders the points how I see them in my head!
    cyclic_quad.sort(simple2d.angleBetween);
	cyclic_quad.reverse();
    c_dragtool = new cyclic_dragtool();
    
    //Init Trapezoid
    //four random points on unit circle
    var h = Math.random()*100;
    var trap_help = new Array();
    trap_help[0] = Math.random()*190;
    trap_help[1] = Math.random()*(200-trap_help[0]);
    trap_help[2] = Math.random()*190;
    trap_help[3] = Math.random()*(200-trap_help[2]);

    trapezoid[0] = new simple2d.Point(100-trap_help[0],-h );
    trapezoid[1] = new simple2d.Point(-100+trap_help[1], -h);
    trapezoid[2] = new simple2d.Point(-100+trap_help[3], h);
    trapezoid[3] = new simple2d.Point(100-trap_help[2], h );

	cur_quad = trapezoid.slice(0);

	//Tessellation
    //Initialise the Canvas, and the overlay canvas
	ht_canvas[0] = document.getElementById('tess_canvas');
	ht_canvas[1]  = document.getElementById('tess_canvas').getContext('2d');
	ht_canvas[1].translate(300,300);
	// Add the overlay canvas.
	var container = ht_canvas[0].parentNode;
	ht_canvas[2] = document.createElement('canvas');
	if (!ht_canvas[2]) {
		alert('Error: I cannot create a new canvas element!');
		return;
	}
	// we never actually use this canvas...
	// ht_canvas[2].id     = 'tessOverlay';
	// ht_canvas[2].width  = ht_canvas[0].width;
	// ht_canvas[2].height = ht_canvas[0].height;
	// container.appendChild(ht_canvas[2]);
	// ht_canvas[3] 		= ht_canvas[2].getContext('2d');
	// ht_canvas[3].translate(300,300);
	
	
	

	update_cyclic();
});