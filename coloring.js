!function() { 
	var cl = {
	    version: "1.0.15",
	    usage: "Amnesty"
	};

	var CL_NOISSUE = -1,
		CL_STROKEWIDTH = "1px",
		cl_zoom = d3.behavior.zoom(),
		path,
		svg,
		brasil = d3.locale({
		    decimal: ",",
		    thousands: ".",
		    grouping: [3],
		    currency: ["R$", ""],
		    dateTime: "%a %b %e %X %Y",
		    date: "%d/%m/%Y",
		    time: "%H:%M:%S",
		    periods: ["AM", "PM"],
		    days: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
		    shortDays: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"],
		    months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
		    shortMonths: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
		});

	cl.SELECIONADO = "rgb(48, 48, 48)";
	cl.escalaPrj = 1;
	cl.regiaoSelecao = 0;
	cl.semInfo = "#505050";
	cl.grayedout = "#808080";
	cl.tooltip = [];
	cl.status="região";
	cl.issue = CL_NOISSUE;
	cl.margin = {};
	cl.hashDistritos = {};
	cl.dsv = d3.dsv(";", "text/plain");
  	cl.leuJson = "não";

	cl.colorbrewer={
	    RdYlGn:{
	      3:["#fc8d59","#ffffbf","#91cf60"],
	      4:["#d7191c","#fdae61","#a6d96a","#1a9641"],
	      5:["#d7191c","#fdae61","#ffffbf","#a6d96a","#1a9641"],
	      6:["#d73027","#fc8d59","#fee08b","#d9ef8b","#91cf60","#1a9850"],
	      7:["#d73027","#fc8d59","#fee08b","#ffffbf","#d9ef8b","#91cf60","#1a9850"],
	      8:["#d73027","#f46d43","#fdae61","#fee08b","#d9ef8b","#a6d96a","#66bd63","#1a9850"],
	      9:["#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850"],
	      10:["#a50026","#d73027","#f46d43","#fdae61","#fee08b","#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"],
	      11:["#a50026","#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"]},
	    Paired:{12:["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"]},
	    Dark2:{8:["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02","#a6761d","#666666"]},
	    RdYlBu:{11:["#a50026","#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4","#313695"]},
	    BrBG:{11:["#543005","#8c510a","#bf812d","#dfc27d","#f6e8c3","#f5f5f5","#c7eae5","#80cdc1","#35978f","#01665e","#003c30"]},
	    Spectral:{11:["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"]},
	    Pastel1:{9:["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd","#fddaec","#f2f2f2"]},
	    Pastel2:{8:["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9","#fff2ae","#f1e2cc","#cccccc"]},
	    Set1:{9:["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf","#999999"]},
	    Set2:{8:["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494","#b3b3b3"]},
	    Set3:{12:["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"]}};


	
  cl.mapaCores = function (argument) {
    var i, j;
    var mapaCores = [];

    mapaCores = mapaCores.concat([cl.grayedout]);
    mapaCores = mapaCores.concat(cl.colorbrewer.Paired[12]);
    mapaCores = mapaCores.concat(cl.colorbrewer.Pastel2[8]);
    mapaCores = mapaCores.concat(cl.colorbrewer.Pastel1[9]);
    mapaCores = mapaCores.concat(cl.colorbrewer.Set3[12]);
    mapaCores = mapaCores.concat(cl.colorbrewer.Dark2[8]);
    mapaCores = mapaCores.concat(cl.colorbrewer.Set1[9]);
    mapaCores = mapaCores.concat(cl.colorbrewer.Spectral[11]);
    mapaCores = mapaCores.concat(cl.colorbrewer.Set2[8]);
    mapaCores = mapaCores.concat(cl.colorbrewer.BrBG[11]);


    //mapaCores = mapaCores.concat(cl.colorbrewer.Spectral[11]);

    j = 0; i = mapaCores.length-1, tam = mapaCores.length;
    while (mapaCores.length < 180) {
      mapaCores.push(cl_interpolaCor(mapaCores[j], mapaCores[i]));
      j++;
      i++;    
    }
    cl.cores = mapaCores;
  }

  function cl_corMapa(d){
  	//return cl.colorbrewer.Paired[12][d.properties.MAPCOLOR9-1];
  	return cl.cores[Math.max(0,d.properties.MAPCOLOR13)];
  }

  function cl_interpolaCor(cor1, cor2) {
    var rgb1, rgb2;
    rgb1 = hexToRgb(cor1.substr(1));
    rgb2 = hexToRgb(cor2.substr(1));
    return rgbToHex(Math.floor((rgb1.r+rgb2.r)/2), Math.floor((rgb1.g+rgb2.g)/2), Math.floor((rgb1.b+rgb2.b)/2));
  }

  function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
  }
	
  function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }

	cl.corAISP = function(aisp){
	  return cl_hashAisps[cl.aisp("nome", aisp)];
	}
	
	// Inicializa variáveis globais
  	//d3.select("body").style({"background-color":"white", color:"#505050"});
	cl.leJson = function(){
	  cl.margin = {top: 10, right: 10, bottom: 10, left: 10};
	  var w = 1200 - cl.margin.left - cl.margin.right,
	      h = 620 - cl.margin.top - cl.margin.bottom;
	  cl.w = w; cl.h = h;

	
	  if (3.14.toLocaleString().indexOf(",") == 1)
	    d3.format = brasil.numberFormat;
	
	  /*projecao =
	    d3.geo.conicEqualArea().center([0,-21.85]).rotate([42.50, 0])
	    .parallels([-21.05,-23.05]).scale(12000);
	   */
	  cl.projecao = d3.geo.orthographic()
	  				.clipAngle(90)
	  				.center([0,10])
	  				.precision(.1)
	  				.scale(300);

	  cl.projecao = d3.geo.eckert6().scale(215).center([-30,15]);

	  //cl.gilbertPath = d3.geo.path().projection(d3.geo.gilbert(cl.projecao));

	  // d3.geo.mercator().scale(10500).translate([8250, -3900]),
	  cl.path = d3.geo.path().projection(cl.projecao);
	  svg = d3.select("div.mapa")
	    .append("svg")
      .attr("viewBox", "0 0 "+(w+cl.margin.left+cl.margin.right)+
          " "+(h+cl.margin.top+cl.margin.bottom))
	    .attr("class", "mapSVG")
	    //.style({stroke: "#666666" })
                     // "stroke-dasharray": "2,2",
                     // "stroke-linejoin": "round"})
	    .append("g");
	    //.attr("class", "mvG");
      //.append("g");
      svg
      	.append("text")
        .attr({id:"temporario", class: "titulo1", y: String((h+cl.margin.top+cl.margin.bottom)/2), x: String((w+cl.margin.right+cl.margin.left)/2-180)})
        .text("Please wait... Loading map...");


	  cl.leuJson = "não";
      cl.mapaCores();
	
	  d3.json("./json/ne_10m_admin_0_countries-25.json", function(error, MapaTopoJson) {
	    if (error) throw(error);
	    mapaF = topojson.feature(MapaTopoJson, MapaTopoJson.objects.ne_10m_admin_0_countries);

	    criaTooltip();

	    d3.select("#temporario").remove();
	    /*
	    svg.selectAll(".regiao")
	    	.datum(topojson.feature(MapaTopoJson, MapaTopoJson.objects.ne_10m_admin_0_countries))
	    	.attr("class", "mapaMundi")
	    	.attr("d", path);
		*/
	    svg.selectAll("path")
	      .data(mapaF.features)
	    //d3.select(".mapSVG")
	      //.datum(mapaF)
	      .enter()
	      .append("path")
	      .attr("class", function(d) { return "mapaMundi " + "COD" + d.properties.ISO_A3 +
	                                          " PA" + d.properties.ISO_N3;})
	      .attr("id", function(d) { return "COD"+d.properties.ADM0_A3;})
	      .style("fill", function(d) {return cl_corMapa(d);})
	      .style("stroke", "#888888")
	      .style("stroke-width", CL_STROKEWIDTH)
	      .attr("d", cl.path)
	      .text(function(d){return d.properties.GEOUNIT;});	

	    cl.leuJson = "sim";
	    hookTooltip();
	    var dsv = d3.dsv(";", "text/plain");
	    cl.relatorio = {};
	    cl.topicos1415 = {};
	    cl.topicos1516 = {};
	    cl.topicos1617 = {};
        dsv("./csv/country-report.csv",  function(error, dados) {
        	if (error) throw error;
        	for (var i=0;i<dados.length;i++) {
        		cl.relatorio[dados[i].ADM0_A3] = dados[i].Report;
        		cl.topicos1415[dados[i].ADM0_A3] = dados[i].Topics;
        		cl.topicos1516[dados[i].ADM0_A3] = dados[i].Topics16;
        		cl.topicos1617[dados[i].ADM0_A3] = dados[i].Topics17;
        	}
        	cl.topicos1415["ano"]="2014/15";
        	cl.topicos1516["ano"]="2015/16";
        	cl.topicos1617["ano"]="2016/17";
        	cl.topicos = cl.topicos1617;
        	//console.log(cl.topicos["PSX"], dados);
	    setTimeout(cl.amnestyIssue(cl.primeiroAssunto), 1500);
        });

      function cl_props(status) {
      	//var indice = {"a1415": 0, "compara": 1, "a1516": 2};
      	var html = "<center><a class='caixa%' onClick='cl.select2015()'>2014/15</a><a class='caixa%' onClick='cl.compara1516()'>Compared with</a><a class='caixa%' onClick='cl.select2016()'>2015/16</a><a class='caixa%' onClick='cl.compara1617()'>Compared with</a><a class='caixa%' onClick='cl.select2017()'>2016/17</a></center>";
      	return html.replace("%", status == "a1415" || status =="compara"?1:2).replace("%", status == "compara"?1:2).replace("%", status == "a1516" || status == "compara" || status == "compara2"?1:2).replace("%", status == "compara2"?1:2).replace("%", status == "a1617" || status == "compara2"?1:2);
      }
	  cl.select2015 = function (){
	  	cl.topicos = cl.topicos1415;
	  	d3.select(".props")
        	.html(cl_props(cl.anistia = "a1415"));
        if (cl.status == "mapa")
        	cl.amnestyIssue(cl.issue);
	  };
	  cl.select2016 = function (){
	  	cl.topicos = cl.topicos1516;
	  	d3.select(".props")
        	.html(cl_props(cl.anistia = "a1516"));
        if (cl.status == "mapa")
        	cl.amnestyIssue(cl.issue);
	  };
	  cl.select2017 = function (){
	  	cl.topicos = cl.topicos1617;
	  	d3.select(".props")
        	.html(cl_props(cl.anistia = "a1617"));
        if (cl.status == "mapa")
        	cl.amnestyIssue(cl.issue);
	  };
	  cl.compara1516 = function (){
	  	cl.topicos = cl.topicos1516;
	  	d3.select(".props")
        	.html(cl_props(cl.anistia = "compara"));
        if (cl.status == "mapa")
        	cl.amnestyIssue(cl.issue);
	  };
	  cl.compara1617 = function (){
	  	cl.topicos = cl.topicos1617;
	  	d3.select(".props")
        	.html(cl_props(cl.anistia = "compara2"));
        if (cl.status == "mapa")
        	cl.amnestyIssue(cl.issue);
	  };
		d3.select(".props")
        	.html(cl_props(cl.anistia = "a1617")); 
		var rotate = [10, -10], velocity = [.003, .000];
        var time = Date.now();
        var feature = d3.selectAll("path");
        /*
        d3.timer(function(argument) {
        	var dt = Date.now() - time;
			
        	cl.projecao.rotate([rotate[0]+velocity[0]*dt]); //, rotate[1]+velocity[1]*dt]);
        	//cl.gilbert = d3.geo.gilbert(cl.projecao);
        	//cl.path = d3.geo.path().projection(cl.gilbert);
        	feature.attr("d", cl.path);
        });
        */
	  });

	  function zoom() {
	    //console.log("start","translate: ", d3.event.translate, "scale: ", d3.event.scale);
	    //event.target.style.cursor = "move";
	    //svg.attr("transform", "translate(" + [d3.event.translate[0]+cl.margin.left+cl.margin.right, d3.event.translate[1]+cl.margin.top+cl.margin.bottom] + ")scale(" + d3.event.scale + ")");
	    //var translate = "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")"; console.log(translate);
	    if (d3.event.sourceEvent)
	    	d3.event.sourceEvent.stopPropagation();  // Necessary ?
	    svg.attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
	    svg.selectAll(".mapaMundi").style("stroke-width", (1 / d3.event.scale) + "px");
    	cl.escalaPrj = d3.event.scale;

	    //console.log(d3.event.sourceEvent.target);	    
	    //console.log("Zoom!", d3.event, cl_drag, d3.event.sourceEvent);
	    
	  }
	  cl.zoom = zoom;
	  d3.select(".mapSVG")
	  	.call(cl_zoom
	  			.scaleExtent([1,64])
	  			.size( [w + cl.margin.right + cl.margin.left, h + cl.margin.top + cl.margin.bottom])
	  			.on("zoom", zoom));
	}

	var dsv = d3.dsv(";", "text/plain");
	var cl_topicos = [];

	cl.leJson();

	dsv("./csv/destaque.csv",  function(dados) {
	  return {
	    Assunto: +dados.Assunto,
	    Nome: dados.Direito,
	    exp: new RegExp(dados.Regexp, dados.Flags)

	  }; }, function(dados) {
	    var listaTopicos = d3.select("#listaTopicos");
	    listaTopicosHTML = '<br><li class="tags__item"><a class="tags__highlight" id="tagReset" onClick="cl.resetMap()">Reset Map</a></li>';
	    for ( i = 0; i < dados.length; i++) {
	      listaTopicosHTML += '<li class="tags__item"><a class="tags__link" id="tag'+dados[i].Assunto +'"" onClick="cl.amnestyIssue('+dados[i].Assunto+')">'+dados[i].Nome+'</a></li>';
	      cl_topicos[dados[i].Assunto] = {nome:dados[i].Nome, exp:dados[i].exp};
	    }
	    listaTopicos.html(listaTopicosHTML);
	    cl.primeiroAssunto = dados[0].Assunto;
	});
	
	cl.amnestyIssue = function(issue) {
		var SEMTOPICO = "yellow", COMTOPICO = "black", ENTROUTOPICO = "#b2182b", SAIUTOPICO = "#2166ac";
		cores = cl.anistia != "compara" && cl.anistia != "compara2"?
			function(d) {
				if (cl.topicos[d.properties.ADM0_A3] == undefined) {
					//console.log(d.properties.GEOUNIT, d);
					return SEMTOPICO;
				}
		  		return cl.topicos[d.properties.ADM0_A3].match(cl_topicos[issue].exp)?COMTOPICO:SEMTOPICO;
		  	} :
		  	function(d) {
				if (cl.topicos[d.properties.ADM0_A3] == undefined) {
					//console.log(d.properties.GEOUNIT, d);
					return SEMTOPICO;
				}
				if (cl.anistia == "compara") {
		  			match1415 = cl.topicos1415[d.properties.ADM0_A3].match(cl_topicos[issue].exp);
		  			match1516 = cl.topicos1516[d.properties.ADM0_A3].match(cl_topicos[issue].exp);
		  			return match1415&&match1516?COMTOPICO:!match1415&&!match1516?SEMTOPICO:match1415?SAIUTOPICO:ENTROUTOPICO;
		  		} else {
		  			match1516 = cl.topicos1516[d.properties.ADM0_A3].match(cl_topicos[issue].exp);
		  			match1617 = cl.topicos1617[d.properties.ADM0_A3].match(cl_topicos[issue].exp);
		  			return match1516&&match1617?COMTOPICO:!match1516&&!match1617?SEMTOPICO:match1516?SAIUTOPICO:ENTROUTOPICO;
		  		}
		  	};
		d3.selectAll("path")
			.transition()
			.duration(1000)
		  .style("fill", cores);
		//d3.select("#topicos").html("<center>Topic - "+cl_topicos[issue].nome+"</center>");
		cl.status = "mapa";
		if (cl.issue != CL_NOISSUE)
			d3.select("#tag"+cl.issue).attr("class", "tags__link");
		d3.select("#tag"+issue).attr("class", "tags__highlight");
		cl.issue = issue;
	}

	cl.resetMap = function() {
		/*
		svg.attr("transform", "translate(0,0) scale(1)");
    	cl.escalaPrj = 1;
    	d3.select(".mvG").on("zoom", null);
    	
    	svg
	  	.call(cl_zoom
	  			.scaleExtent([1,64])
	  			.size( [cl.w + cl.margin.right + cl.margin.left, cl.h + cl.margin.top + cl.margin.bottom])
	  			.on("zoom", cl.zoom)); */
		d3.selectAll("path.mapaMundi")
			.transition()
			.duration(1000)
		  //.style("stroke-width", CL_STROKEWIDTH)
		  .style("fill", function(d) {
		  	return cl_corMapa(d);
		  });

		/*
		svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	    svg.selectAll(".mapaMundi").style("stroke-width", (1 / d3.event.scale) + "px");
    	cl.escalaPrj = d3.event.scale;
    	*/
		//d3.select("#topicos").html("<center>Topics</center>");
		cl.status = "região";
		if (cl.issue != CL_NOISSUE)
			d3.select("#tag"+cl.issue).attr("class", "tags__link");
		else
			cl.issue = CL_NOISSUE;
	}
		
	// Cria o maptip, formato html (pode ser interessante incluir a bandeira do município ou outros
	// elementos gráficos de pequeno impacto visual no tooltip)
	function criaTooltip()
	{
	  cl.tooltip = d3.select("body")
	    .append("div")
	
	  //   .style("vertical-align", "middle")
	    .classed("myTip", true)
	    .html("Rio de Janeiro");
	}
	// Cria os hooks para o maptip

	function hookTooltip()
	{
		function clique(d) {
			myEvent = d3.event;
    		if ( dblclick_timer ) { // Se foram dois cliques (dblclick_timer ainda ativo), zoom cuida do resto...
    			//console.log("double click!");
        		clearTimeout(dblclick_timer);
        		dblclick_timer = false 
    		} else dblclick_timer = setTimeout( function(){
        		dblclick_timer = false;
        		//console.log(myEvent, "\nsingle click!\ndefaultPrevented ? ", myEvent.defaultPrevented);
				if (myEvent.defaultPrevented) { // Foi um drag/zoom já cuidou do evento
					//myEvent = {};
					return;
				}

	  			if (cl.relatorio[d.properties.ADM0_A3] != "")
	  				window.open(cl.relatorio[d.properties.ADM0_A3]);
	  	
    		}, 250);
		}

	  var dblclick_timer = false;
	  var svg = d3.selectAll("path.mapaMundi")
	  .on("click", clique)
	  //.on("dblclick", zoom)
	  .on("mouseover", function(d){
	  	//console.log(d3.event, this, this.style.cursor);

	  	//event.target.style.cursor = "pointer";
	    var tip = d3.select("div.myTip");
	    var k;
		if (d.properties.ADM0_A3 != d.properties.ADM0_A3_IS) {
			k = "<center>"+(d.properties.FORMAL_EN == ""?d.properties.GEOUNIT:d.properties.FORMAL_EN)+": ";
			if (d.properties.NOTE_BRK != "")
				k += d.properties.NOTE_BRK;
			else
				k += d.properties.FORMAL_EN;

			if (cl.topicos[d.properties.ADM0_A3] != "")
				k += " - "+cl.topicos["ano"];
			k += "</center>";
		}
		else {
			k = "<center>"+d.properties.ADMIN;
			if (cl.topicos[d.properties.ADM0_A3] != "")
				k += " - "+cl.topicos["ano"];
			k += "</center>";
		}

		if (cl.topicos[d.properties.ADM0_A3] != "" && cl.topicos[d.properties.ADM0_A3] != undefined)
			k+=cl.topicos[d.properties.ADM0_A3].replace(/:/g,"<br>")+"<br>";
	    tip.html(k);
      	if (cl.status == "região")
	      d3.selectAll(".mapaMundi").filter(function(dd) {
	      		return dd.properties.ADMIN == d.properties.ADMIN;
	      	})
	      	.style("fill", cl.SELECIONADO);
	    if (cl.relatorio[d.properties.ADM0_A3] != undefined && cl.relatorio[d.properties.ADM0_A3] != "")
	  		this.style.cursor = "pointer";

	    return cl.tooltip.style("visibility", "visible");})
	
	  .on("mousemove", function(){
	    return cl.tooltip.style("top", (d3.event.pageY-20)+"px")
	      .style("left",(d3.event.pageX+25)+"px");})
	
	  .on("mouseout", function(d){
	  		  	//console.log(d3.event, this, this.style.cursor);
	  	//event.target.style.cursor = "";
      if (cl.status == "região")
	      d3.selectAll(".mapaMundi")
	        .filter(function(dd){ 
	        	return this.style.fill == cl.SELECIONADO})
	        .style("fill", function(dd){ 
	        	return cl_corMapa(dd);
	      });
	    this.style.cursor = "";
	    return cl.tooltip.style("visibility", "hidden");});
	}
	
	if (typeof define === "function" && define.amd) this.cl = cl, define(cl); else if (typeof module === "object" && module.exports) module.exports = cl; else this.cl = cl;
}();