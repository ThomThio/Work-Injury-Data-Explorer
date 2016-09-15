// console.log("this runs");
var cols = [];
var colsSelected = [];
var rootSelect = "Count"

var choicesSelected = [];

var clicksOut = 0;
var clicksIn = 0;



// generateChart(false);
function resetAll() {
    location.reload();

}

function ans(num){
	var title = document.getElementById("title");
	var levels = document.getElementById("levels");


	if (num === 1){
		colsSelected = ["Sub Industry  (SSIC 2010)","Occupation","Pct Manual Work","Cause"];
		title.innerHTML = "Which industries did accidents happen the most? Which jobs? Were their work mostly manual labour? What was the cause?"


	} else if (num === 2){
		colsSelected = ["Nature of Injury", "Accident Time", "Cause", "Sub Industry  (SSIC 2010)"];
		title.innerHTML = "Which injuries happened the most at which times? What industry?"

	} else if (num === 3){
		colsSelected = ["Cause", "Accident Agency Level 2 Desc"];
		title.innerHTML = "What type of accident happened, what objects where involved?"
		
	} else if (num === 4){
		colsSelected = ["Nature of Injury", "Months worked"];
		title.innerHTML = "What proportion of work experience did person have that got injured?"
		
	} else if (num === 5){
		colsSelected = ["Accident Date", "Reported Date", "Informant's Company Name"];
		title.innerHTML = "How long did informant/company wait to report the injury? Which companies were these?"
		
	} else if (num === 6){
		colsSelected = ["Accident Agency Level 2 Desc", "Accident Weekday", "Accident Time"];
		title.innerHTML = "For each type of accident, which day of the week did they frequently occur on? Which times of the day did accidents occur the most?"
		
	} else if (num === 7){
		colsSelected = ["Major Injury Indicator", "Nature of Injury", "Accident Agency Level 2 Desc", "No. of MC Days", "Hospitalised for at least 24 hours"];
		title.innerHTML = "How bad were the injuries?"
		
	} else if (num === 8){
		colsSelected = ["Major Injury Indicator", "Supposed Start Work Timing on Day Injured", "Nature of Injury"];
		title.innerHTML = "Did major injuries happen during shift periods, late at night, during OT? What types of injuries?"
		
	}
	levels.innerHTML = colsSelected.join(" > ");
	generateChart(true);

}

function applyCols(){
	//grab all values from select form, reset colsSelected whenever the generate chart button is pressed.
	// var yourSelect = document.getElementById("modeSelect");

	// rootSelect = yourSelect.options[yourSelect.selectedIndex].value


	$('*[id*=view-hierarchy-selector-]:visible').each(function() {

    // console.log(this);
	    if (this.value.indexOf("Set Level") == -1){
	    	colsSelected.push(this.value.toString());
	    }
	});
	// console.log(colsSelected);

    // console.log(colsSelected);
    generateChart(true);
}

var margin = {top: 20, right: 0, bottom: 0, left: 0},
    width = 1260,
    height = 580 - margin.top - margin.bottom,
    formatNumber = d3.format(""),
    transitioning;

/* create x and y scales */
var x = d3.scale.linear()
	.domain([0, width])
	.range([0, width]);

var y = d3.scale.linear()
	.domain([0, height])
	.range([0, height]);

var treemap = d3.layout.treemap()
	.children(function(d, depth) { return depth ? null : d.children; })
	.sort(function(a, b) { return a.value - b.value; })
	.ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
	.round(false);

	/* create svg */
var svg = d3.select("#chart").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.bottom + margin.top)
	.style("margin-left", -margin.left + "px")
	.style("margin.right", -margin.right + "px")
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	.style("shape-rendering", "crispEdges");

var color = d3.scale.category20b();

var grandparent = svg.append("g")
	.attr("class", "grandparent");

grandparent.append("rect")
	.attr("y", -margin.top)
	.attr("width", width)
	.attr("height", margin.top);

grandparent.append("text")
	.attr("x", 6)
	.attr("y", 6 - margin.top)
	.attr("dy", ".75em");

function initialize(root) {
	root.x = root.y = 0;
	root.dx = width;
	root.dy = height;
	root.depth = 0;
}

// Aggregate the values for internal nodes. This is normally done by the
// treemap layout, but not here because of the custom implementation.
function accumulate(d) {
	return d.children
	? d.value = d.children.reduce(function(p, v) { return p + accumulate(v); }, 0)
	: d.value;
}

// Compute the treemap layout recursively such that each group of siblings
// uses the same size (1×1) rather than the dimensions of the parent cell.
// This optimizes the layout for the current zoom state. Note that a wrapper
// object is created for the parent node for each group of siblings so that
// the parent’s dimensions are not discarded as we recurse. Since each group
// of sibling was laid out in 1×1, we must rescale to fit using absolute
// coordinates. This lets us use a viewport to zoom.
function layout(d) {
	if (d.children) {
		treemap.nodes({children: d.children});
		d.children.forEach(function(c) {
			c.x = d.x + c.x * d.dx;
			c.y = d.y + c.y * d.dy;
			c.dx *= d.dx;
			c.dy *= d.dy;
			c.parent = d;
			layout(c);
		});
	}
}

/* display shows the treemap and writes the embedded transition function */
function display(d) {
/* create grandparent bar at top */
	grandparent
		.datum(d.parent)
		.on("click", transition)
		.select("text")
		.text(name(d));

	var g1 = svg.insert("g", ".grandparent")
		.datum(d)
		.attr("class", "depth");
		/* add in data */
	var g = g1.selectAll("g")
		.data(d.children)
		.enter().append("g");
		/* transition on child click */
	g.filter(function(d) { return d.children; })
		.classed("children", true)
		.on("click", transition);
		/* write children rectangles */
	g.selectAll(".child")
		.data(function(d) { return d.children || [d]; })
		.enter().append("rect")
		.attr("class", "child")
		.call(rect)
		.append("title")
		.text(function(d) { return d.name + " " + formatNumber(d.size); });

	/* write parent rectangle */
	g.append("rect")
		.attr("class", "parent")
		.call(rect)
		/* open new window based on the json's URL value for leaf nodes */
		/* Chrome displays this on top */
		.on("click", function(d) { 
			if(!d.children){
				// window.open(d.url); 
			}
		})
		.append("title")
		.text(function(d) { return d.name + " " + formatNumber(d.size); }); /*should be d.value*/

	/* Adding a foreign object instead of a text object, allows for text wrapping */
	g.append("foreignObject")
		.call(rect)
		/* open new window based on the json's URL value for leaf nodes */
		/* Firefox displays this on top */
		.on("click", function(d) { 
			if(!d.children){
				// window.open(d.url); 
			}
		})
		.attr("class","foreignobj")
		.append("xhtml:div") 
		.attr("dy", ".75em")
		.html(function(d) { 
			if (d.size) {
				return d.name + " (" + formatNumber(d.size) + ")"; 
			} 
			if (d.value > 0 && typeof(d.value) !== "undefined") {
				return d.name + " (" + formatNumber(d.value) + ")";  //this is shown at the last level of the hierarchy view
				// return formatNumber(d.value);
			}
			return d.name;
		})
		.attr("class","textdiv"); //textdiv class allows us to style the text easily with CSS
			/* create transition function for transitions */
	function transition(d) {
		if (transitioning || !d) return;
		transitioning = true;
		var g2 = display(d),
		    t1 = g1.transition().duration(550),
		    t2 = g2.transition().duration(550);
			// Update the domain only after entering new elements.
		x.domain([d.x, d.x + d.dx]);
		y.domain([d.y, d.y + d.dy]);
			// Enable anti-aliasing during the transition.
		svg.style("shape-rendering", null);

		// Draw child nodes on top of parent nodes.
		svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });
		// Fade-in entering text.
		g2.selectAll("text").style("fill-opacity", 10);
		g2.selectAll("foreignObject div").style("display", "none"); /*added*/
		// Transition to the new view.
		t1.selectAll("text").call(text).style("fill-opacity", 0);
		t2.selectAll("text").call(text).style("fill-opacity", 1);
		t1.selectAll("rect").call(rect);
		t2.selectAll("rect").call(rect);

		t1.selectAll(".textdiv").style("display", "none"); /* added */
		t1.selectAll(".foreignobj").call(foreign); /* added */
		t2.selectAll(".textdiv").style("display", "block"); /* added */
		t2.selectAll(".foreignobj").call(foreign); /* added */ 

		// Remove the old node when the transition is finished.
		t1.remove().each("end", function() {
			svg.style("shape-rendering", "crispEdges");
			transitioning = false;
		});
		// console.log(d);

	}//endfunc transition

	return g;
}//endfunc display

function text(text) {
	text.attr("x", function(d) { return x(d.x) + 6; })
	    .attr("y", function(d) { return y(d.y) + 6; });
}

function rect(rect) {
	rect.attr("x", function(d) { return x(d.x); })
 		.attr("y", function(d) { return y(d.y); })
		.attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
		.attr("height", function(d) { return y(d.y + d.dy) - y(d.y); })
		.style("background", function(d) { return d.parent ? color(d.name) : null; });
}

function foreign(foreign){ /* added */
	foreign.attr("x", function(d) { return x(d.x); })
		.attr("y", function(d) { return y(d.y); })
		.attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
		.attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
}

function name(d) {
	return d.parent ? name(d.parent) + " > " + d.name : d.name;
}

function loadJSONFile(file) {
	/* load in data, display root */
	d3.json(file, function(root) {
		loadData(root);
	});
}

function loadData(root) {
	initialize(root);
	accumulate(root);
	layout(root);
	display(root);
}

function reSortRoot(root,value_key) {
		//console.log("Calling");
		for (var key in root) {
			if (key == "key") {
				root.name = root.key;
				delete root.key;
			}
			if (key == "values") {
				root.children = [];
				for (item in root.values) {
					root.children.push(reSortRoot(root.values[item],value_key));
				}
				delete root.values;
			}
			if (key == value_key) {
				root.value = parseFloat(root[value_key]);
				delete root[value_key];
			}
		}
		return root;
	}


function createNestingFunction(propertyName){
  return function(d){ 
            return d[propertyName];
         };
}

function generateChart(custom) {
    	d3.csv(treemap_fileName, function(csv_data){

			// Add, remove or change the key values to change the hierarchy. 

			if (custom === true) {


				var nested_data = d3.nest();

	      		for (var i in colsSelected){
	  				var col = colsSelected[i];
	  				// console.log(col);
	  				nested_data = nested_data.key(createNestingFunction(col));
	      		};	
	   				
					// .entries(csv_data);
				
				// Creat the root node for the treemap
				var root = {};
				
				// Add the data to the tree
				// root.values = nested_data;
				
				root.key = colsSelected[0]
				root.values = nested_data.entries(csv_data);
			
				// Change the key names and children values from .next and add values for a chosen column to define the size of the blocks
				
				// console.log("Selected root: " + rootSelect)
				root = reSortRoot(root, rootSelect);
				
				
				loadData(root);
				colsSelected = [];
				console.log("this runs");
			} else {
				//for custom or fixed hierarchies
				// console.log("this runs");

				var nested_data = d3.nest()
	   				.key(function(d)  { return d["Sub Industry  (SSIC 2010)"]; })
	   				.key(function(d)  { return d["Occupation"]; })
	   				.key(function(d)  { return d["Cause"]; })
	   				.key(function(d)  { return d["Nature of Injury"]; })
	   				.key(function(d)  { return d["Body Parts Injured"]; })

	   				.entries(csv_data);

	   				var root = {};
				
					root.key = "Sub Industry  (SSIC 2010)"
					root.values = nested_data;
					root = reSortRoot(root, "Count");
					loadData(root);
			}
			
		});
}
