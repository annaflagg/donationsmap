var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 940 - margin.left - margin.right,
    height = 580 - margin.top - margin.bottom;



    
var rateById = d3.map();

var colorscale = d3.scale.threshold()
    .domain([-30, -15, 0, 15, 30])
  .range(["q-red2", "q-red1", "q-red0", "q-blue0", "q-blue1", "q-blue2"]);

var projection = d3.geo.albersUsa()
	.scale(900)
    .translate([.55*width, .44*height+margin.top]);


var path = d3.geo.path().projection(projection);

var svg = d3.select("#svg").append("svg")	
    .attr("width", width)
    .attr("height", height)
    .attr("class", "bg")
   
   

    
var years = ["1992", "1996", "2000", "2004", "2008", "2012"];
var numyears = years.length;

var yeari = 0;
var numcolors = 0;
 

svg.append("text").attr("x", width/2).attr("y", .4*height).attr("class", "loadingtext").text("Loading, please wait")
    
queue()
    .defer(d3.json, "/data/us.json")
	.defer(d3.csv, "/data/Gender_Counties-DR-small-washed-culled-final.csv", function(d) { 
    		rateById.set(+d.fips+"_"+d.Cycle, d);
    })
    .await(ready);
    

function update() {
	zips.attr("class", updatecounty)
	svg.select(".yearlabel").text(years[yeari])
	svg.selectAll(".yearcircle").classed("highlightcircle", function(data, index) {return (index==yeari)})
}   

var textboxw, countydata, centroid, bounds, text;
var textboxh = 35;
var textboxhspace = 10;
var yeartexty = .85*height;
var circley = yeartexty+25;
var textx = .47*width;
var circler = 5;
var circlespace = 25;

function highlight(d, i) {
	if (!active(d)) {
	return;
	}
	countydata = rateById.get(+d.id+"_"+years[yeari])
    if (!countydata) {
    	return;
    }
	d3.select(".highlighted").classed("highlighted", false)
	d3.select(this).classed("highlighted", true);
	d3.select(this).moveToFront();
	countytext(d);
} 

String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};


function countytext(d, countydata) {
	countydata = rateById.get(+d.id+"_"+years[yeari])
	if (!countydata) {
    	return;
    }
	centroid = path.centroid(d);
	bounds = path.bounds(d);
	var countytext = (countydata.County).toProperCase()+", "+countydata.State;
	var countydatatext = "Dem "+parseFloat(countydata.Dem_Fem_Pct).toFixed(0)+"%"+' \u2007 '+"Rep "+parseFloat(countydata.Repub_Fem_Pct).toFixed(0)+"%";//+" in "+years[yeari];

	textboxw = Math.max(countytext.length, countydatatext.length)*7.1;
	
	svg.append("rect").attr("x", centroid[0]-(textboxw/2.0)).attr("y", bounds[0][1]-textboxh-textboxhspace).attr("width", textboxw).attr("height", textboxh)
		.attr("class", "textbox");
		
	svg.selectAll(".countylabel").remove();
	svg.selectAll(".countydatalabel").remove();
	
	
	svg.append("text").attr("x", centroid[0]).attr("y", bounds[0][1]-(textboxh)+4).attr('text-anchor', 'middle')
  	 .attr("class", "countylabel")
  	 .text(countytext)
  	 
  	svg.append("text").attr("x", centroid[0]).attr("y", bounds[0][1]-(textboxh/2.0)+4).attr('text-anchor', 'middle')
  	 .attr("class", "countydatalabel")
  	 .text(countydatatext)
}

  
  d3.selection.prototype.moveToFront = function() {
  	return this.each(function(){
    this.parentNode.appendChild(this);
  	});
  };

var legendx = .11*width;
var legendy = .2*height;
var legendw = 8;
var legendh = 25;

function legend() {

numcolors = colorscale.range().length


 var legend = svg.selectAll('.g-legend')
  	.data(colorscale.range())
	.enter().append('g').attr("class", "g-legend")//.attr("fill", function(d, i) {console.log(d); return "red"})

    	
    legend.append("rect")
	.attr("x", legendx)
	.attr("y", function(d,i) {return legendy+(i*legendh);})
	.attr("width", legendw)
	.attr("height", legendh)
	.attr("class", function(d, i) {
			return colorscale.range()[numcolors-i-1];});
			
	svg.append("rect").attr("class", "legendoutline")
		.attr("x", legendx).attr("y", legendy).attr("width", legendw).attr("height", numcolors*legendh)
			
	legend.append("text")	
		.attr("x", legendx-5)
		.attr("y", function(d, i) {
			return legendy+(i*legendh)+3;
		})
		.attr("class", "legendtext")
		.text(function(d, i) {
			if (i==0) {
				return "";
			}
			if (colorscale.domain()[i-1]==0) {
				return "equal share";
			}
			if (i==1) {
			 return "+"+colorscale.domain()[numcolors-i-1]+"%";
			} 
			if (i==numcolors-1) {
			 return "+"+Math.abs(colorscale.domain()[0])+"%";
			}
			
			return Math.abs(colorscale.domain()[numcolors-i-1]);
			})
			
			
		var legendlabelyspace = 15;
		var legendlabelyoffset = 5;

		svg.append("text")
			.attr("x", legendx+(legendw/2.0))
			.attr("y", legendy-(2*legendlabelyspace)-legendlabelyoffset)
			.attr("class", "legendlabel")
			.text("Greater share of")
			
		svg.append("text")
			.attr("x", legendx+(legendw/2.0))
			.attr("y", legendy-legendlabelyspace-legendlabelyoffset)
			.attr("class", "legendlabel")
			.text("Democratic money")
	
		svg.append("text").attr("x", legendx+(legendw/2.0))
			.attr("y", legendy - legendlabelyoffset)
			.attr("class", "legendlabel")
			.text("coming from women");
		
		
			
		svg.append("text")
			.attr("x", legendx+(legendw/2.0))
			.attr("y", legendy+(numcolors*legendh)+(2.7*legendlabelyoffset))
			.attr("class", "legendlabel")
			.text("Greater share of")
			
		svg.append("text")
			.attr("x", legendx+(legendw/2.0))
			.attr("y",  legendy+(numcolors*legendh)+(2.7*legendlabelyoffset)+legendlabelyspace)
			.attr("class", "legendlabel")
			.text("Republican money")
		svg.append("text")
			.attr("x", legendx+(legendw/2.0))
			.attr("y",  legendy+(numcolors*legendh)+(2.7*legendlabelyoffset)+(2*legendlabelyspace))
			.attr("class", "legendlabel")
			.text("coming from women");
			
			
}

function ready(error, us) {
	svg.select(".loadingtext").remove();

	svg.append("g")
      .attr("class", "counties")
    .selectAll("path")
      .data(topojson.feature(us, us.objects.counties).features)
      
    .enter().append("path")
    .attr("fill", "white")
      .attr("class", updatecounty)
      .attr("d", path)
      .on("mouseover", highlight)
      .on("mouseout", function(d) {
      		
      		d3.select(this).classed("highlighted", false);
      		svg.selectAll(".textbox").remove();
      		svg.selectAll(".countylabel").remove();
			svg.selectAll(".countydatalabel").remove();
	
      		});
      //.on("click", function(d) {
      /**
      		yeari = (yeari+1)%numyears;
      		update(); 

      		d3.event.stopPropagation();
      		if (!active(d)) {
      			d3.select(this).classed("highlighted", false);
      			svg.selectAll(".textbox").remove();
      			svg.selectAll(".countylabel").remove();
				svg.selectAll(".countydatalabel").remove();
				return;
			}
      		d3.select(this).classed("highlighted", true)
      		d3.select(this).moveToFront();
      		countytext(d);**/
      		//})
      
      zips = svg.selectAll("path");
      
    svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "states")
      .attr("d", path);
 

 
   	 svg.append("text")
  	 .attr("x", textx)
  	 .attr("y", yeartexty)
  	 .attr("class", "yearlabel")
  	 .attr('text-anchor', 'middle')
  	 .text(years[yeari])

  	 
  	 
  	 svg.selectAll("circle")
  	 	.data(years)
  	 	.enter().append("svg:circle")
  	 	.attr("cx", function(d, i) {
  	 		return textx - ((numyears-1)*circlespace/2.0)+(i*circlespace);
  	 	})
  	 	.attr("cy", circley)
  	 	.attr("r", circler)
  	 	.attr("class", "yearcircle")
  	 	.classed("highlightcircle", function(d, i) {return (i==yeari);})
  	 	
  	 
  	 	
  	 svg.selectAll("rect")
  	 	.data(years)
  	 	.enter().append("svg:rect")
      .attr('class', 'move-capture')
  	 	.attr("x", function(d, i) {
  	 		return textx - ((numyears-1)*circlespace/2.0)+(i*circlespace)-(circlespace/2.0);
  	 	})
  	 .attr("y", yeartexty)
  	 .attr("opacity", 0)
      .attr('width', function(d, i) {
      		return circlespace;
      		})
      .attr('height', (circley-yeartexty)*2.0)
      .on("mouseover", function(d, i) {
  	 		//d3.select(this).classed("hovercircle", false);
  	 		yeari = i;
  	 		svg.selectAll(".yearcircle").classed("highlightcircle", function(d, i) {return (i==yeari);})
  	 		update();
  	 	});
      
      svg.append("text").attr("class", "yeartextlabel").attr("x", textx).attr("y", circley+25).text("$25,000+ from women")
  
  legend();
 
}

function active(d) {
	return(rateById.get(d.id+"_"+years[yeari]))

}


function updatecounty(d) {
tmp = active(d);
      if (tmp) {
      		return colorscale((+tmp.Dem_Fem_Pct)-(+tmp.Repub_Fem_Pct))
      }
      return "na";  
}