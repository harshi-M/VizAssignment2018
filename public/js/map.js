class CountryData {
    constructor(type, id, properties, geometry, region) {
        this.type = type;
        this.id = id;
        this.properties = properties;
        this.geometry = geometry;
        this.region = region;
    }
}

/** Class representing the map view. */
class Map {

    /**
     * Creates a Map Object
     *
     * @param data the full dataset
     * @param updateCountry a callback function used to notify other parts of the program when the selected
     * country was updated (clicked)
     */
    constructor(data, activeYear, updateCountry, selected_health_factor) {
        // ******* TODO: PART I *******
        this.projection = d3.geoEquirectangular().scale(150).translate([480, 325]);
        //this.nameArray = data.population.map(d => d.geo.toUpperCase());
        //this.populationData = data.population;
        this.complete_data = data
        this.selected_health_factor = selected_health_factor
        this.updateCountry = updateCountry;
        this.activeYear = activeYear;
        if (selected_health_factor == "causesOfDeath"){
            this.defaultData = 'causesOfDeath';
        }else{
            this.defaultData = 'child-mortality';
        }
        let legendHeight = 90;
        let legend_section = d3.select("#legend").classed("tile_view",true);

        this.legendSvg = legend_section.append("svg")
                            .attr("width",600)
                            .attr("height",legendHeight)
                            .attr("transform", "translate(0,-40)");
        }


    /**
     * Renders the map
     * @param world the topojson data with the shape of all countries and a string for the activeYear
     */
    drawMap(world) {

        let domain = [0, 1, 5, 10, 20, 30, 50];
        let range = ["#2166ac", "#67a9cf", "#d1e5f0", "#fddbc7", "#ef8a62", "#b2182b"];
        let colorScale = d3.scaleQuantile()
            .domain(domain)
            .range(range);

        let countries = topojson.feature(world, world.objects.countries);
        // projection converts the coordinates onto the screen coordinates. 
        // using geoPath(), convert the polygons to the svg path 
        let path = d3.geoPath().projection(this.projection);
        let svgContainer = d3.select("#map-chart").append("svg").attr('id', 'map_chart_svg');
        let path_element = svgContainer.selectAll("path")
                .data(countries.features)
                .enter()
                .append("path")
                .attr("id", (d, i) => countries.features[i].id)
                .attr("d", path);

        let graticule = d3.geoGraticule();
        let graticule_added = svgContainer.append('path')
                    .datum(graticule)
                    .attr('class', "graticule")
                    .attr('d', path)
                    .attr('fill', 'none');
        
        let graticule_border = svgContainer.append("path")
                    .datum(graticule.outline)
                    .attr("class", "stroke")
                    .attr("d", path);

        
        // Fetch the data related to the default health factor and year
        let data = this.fetchYearAndFactorRelatedData("2000", this.defaultData);

        let new_path_element = d3.select("#map_chart_svg").selectAll("path")
        let add_region_clas = new_path_element.attr("fill", function(d, i) {
                                                            let id = data[d["id"]]
                                                            if(id == undefined)
                                                                return "#eee"
                                                            return colorScale(data[d["id"]][1])
                                                        })
        let tooltip = new_path_element.append("svg:title").html(d=>this.tooltipRender(data, d, 'child-mortality'));

       // document.getElementById("play_button").disabled = true;

        this.legendSvg.append("g")
                .attr("class", "legendQuantile")
                .attr("transform", "translate(0,50)");
                
        let legendQuantile = d3.legendColor()
                .shapeWidth((600)/6)
                .cells(6)
                .orient('horizontal')
                .labelFormat(d3.format('.1r'))
                .scale(colorScale);

        this.legendSvg.select(".legendQuantile")
                .call(legendQuantile);

        let svgBounds = this.legendSvg.select(".legendQuantile").node().getBoundingClientRect();
        let legendGWidth = svgBounds.width;
            
        this.legendSvg.select(".legendQuantile").attr("transform", "translate(0,50)");


        svgContainer.append('text').classed('activeYear-background', true).text("2000").attr("x", 50).attr("y", 500);
    }

    

    fetchYearAndFactorRelatedData(active_year, health_factor) {
        console.log(this.complete_data);
        console.log(health_factor);
        let factor_data = this.complete_data[health_factor]
        let year_specific_data = []
        let data = {}
        factor_data.forEach(function(item) {
            
            data[item["ID"]] = [item["Country"], item[active_year]]
        })
        return data;
    }

    updateMap(active_year, health_factor) {
        
        // check if the active year is only one year
        //if(active_year[0] == active_year[1]) {
          //  document.getElementById("play_button").disabled = true;
            let _that = this
            let data = this.fetchYearAndFactorRelatedData(active_year, health_factor)
            let new_path_element = d3.select("#map_chart_svg").selectAll("path")
            let add_region_clas = new_path_element.attr("fill", function(d, i) {
                                                            let id = data[d["id"]]
                                                            if(id == undefined)
                                                                return "#eee"                                                            
                                                            return _that.getDomainAndRangeForColorScale(health_factor, data[d["id"]][1], false)
                                                        })
            // Update the tooltip
            new_path_element.select("title").html(d=>this.tooltipRender(data, d, health_factor));
        //}
//        else {
    //        document.getElementById("play_button").disabled = false;
  //      }
        
        let text_select = d3.select(".activeYear-background").text(active_year);
        d3.selectAll("#legend").select('g').remove()

        this.legendSvg.append("g")
                .attr("class", "legendQuantile")
                .attr("transform", "translate(0,50)");        
        let divisions = this.getDomainAndRangeForColorScale(health_factor, '', true)
        let legendQuantile = d3.legendColor()
                .shapeWidth((600)/divisions)
                .cells(divisions)
                .orient('horizontal')
                .labelFormat(d3.format('.1r'))
                .scale(this.getDomainAndRangeForColorScale(health_factor, '', false));

        this.legendSvg.select(".legendQuantile")
                .call(legendQuantile);

        let svgBounds = this.legendSvg.select(".legendQuantile").node().getBoundingClientRect();
        let legendGWidth = svgBounds.width;
        
        let diff = (600 - legendGWidth)/2;
        this.legendSvg.select(".legendQuantile").attr("transform", "translate(" + diff + ",50)");

        // let a_rect_bar_mouse_event = document.getElementById("map-chart")
        // a_rect_bar_mouse_event.onmouseover = function(event) {
        //     if("path" in event) {
        //         //event.target.style.stroke-width = "0.3px"
        //     }
        // };

    }

    /**
     * Highlights the selected conutry and region on mouse click
     * @param activeCountry the country ID of the country to be rendered as selected/highlighted
     */
    addHighlight(activeCountry) {
        let country_id = "#"+activeCountry;
        let selected_country = d3.select("#map-chart").select("svg").select(country_id);
        selected_country.classed("selected-country", true);
    }

    /**
     * Clears all highlights
     */
    clearHighlight() {
        let selector = d3.select("#map-chart").select("svg").selectAll("path").classed("selected-country",false);
    }

    yearslider() {
        let that = this;

        let margin = {top: 200, right: 40, bottom: 200, left: 0},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

        var x = d3.scaleLinear()
            .domain([1990, 2015])
            .rangeRound([0, width]);

        let svg = d3.select("#nav_bar").append("svg")
            .attr("width", 923)
            .attr("height", 50).attr("id", "year_slider_id")
            .append("g")
            .attr("transform", "translate(" + margin.left + ", 0)");

        svg.append("g")
            .attr("class", "axis axis--grid")
            .attr("transform", "translate(0,30)")
            .call(d3.axisBottom(x)
                .ticks(20)
                .tickSize(-20)
                .tickFormat(function() { return null; }));
                
        svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform",  "translate(0,30)")
            .call(d3.axisBottom(x)
            .ticks(20)
            .tickFormat(d3.format("d"))
            .tickPadding(0))
            .attr("text-anchor", null)
            .selectAll("text")
            .attr("x", 6);

        svg.append("g")
            .attr("class", "brush")
            .attr("id", "brush_div")
            .call(d3.brushX()
                .extent([[0, 0], [width, 30]])
                .on("end", brushended));

        function brushended() {
            d1 = []
            if (!d3.event) { // add brush by default
                d1[0] = 2000
                d1[1] = 2001
            }
            else if (!d3.event.sourceEvent) return; // Only transition after input.
            else if (!d3.event.selection) { // if empty selection then choose the block
                // Selected block:

                let margin = document.getElementById("year_slider_id").getBoundingClientRect().x
                let clicked_location = x.invert(d3.event.sourceEvent.x-margin)
                //console.log(clicked_location)
                d1[0] = Math.floor(clicked_location)
                d1[1] = Math.floor(clicked_location)+1
            }
            else{
                var d0 = d3.event.selection.map(x.invert),
                d1 = d0.map(Math.round);
            }
            d3.select(this).transition().call(d3.event.target.move, d1.map(x));
            that.activeYear = [d1[0], d1[1]-1]
            

            that.updateMap(that.activeYear[0], that.selected_health_factor)
            // if(d1[0] == d1[1]-1) {
            //     document.getElementById("play_button").disabled = true;
            // }
            // else {
            //     document.getElementById("play_button").disabled = false;
            //   //  that.updateMapForRange(that.activeYear, that.selected_health_factor)
            // }
            
        }

        // TODO: try to trigger a default event
        //brush.event(context.select('g.x.brush'));
        //document.getElementById('brush_div').click();
    }

    // updateMapForRange(activeYear_range, selected_health_factor) {
    //     let i;
    //     let diff = activeYear_range[1] - activeYear_range[0] +1

    //     this.theLoop(diff, activeYear_range[1], selected_health_factor, this.updateMap)
    //    // setTimeout(this.updateMap(i, selected_health_factor), 3000, diff)
    //     // for(i = activeYear_range[0]; i <= activeYear_range[1]; i++) {            
    //     // }
    // }

    // theLoop(i, activeYear, selected_health_factor, updateMapFunction) {
    //         setTimeout(function () {
    //             updateMapFunction(activeYear, selected_health_factor)
    //             if (--i) {
    //                 activeYear_range += 1// If i > 0, keep going
    //                 theLoop(i, activeYear, selected_health_factor, updateMapFunction);
    //         }
    //     }, 2000);
    // };


    playMap() {
        this.updateMapForRange(this.activeYear, this.selected_health_factor)
    }

    tooltipRender(data, d, health_factor) {

        let country_data = data[d["id"]]
        let text;
        let html_text;
        let val;
        if(country_data == undefined) {
            return html_text = "No Data"
        }
        val = Math.round(parseFloat(country_data[1]) * 10)/10;
        html_text = "<h2>" + country_data[0] + "</h2>";
        html_text += "<br>"
        switch(health_factor) {
            case 'child-mortality':
                    html_text += "<h5>" + val + "% of children that die before they are 5 years old" + "</h5>"
                    break;
            case 'beer-consumption-per-person':
                    html_text += "<h5>" + val + " liters of pure alcohol." + "</h5>"
                    break;
            case 'child-mortality-by-income-level-of-country':
                    html_text += "<h5>" + val + "%" + "</h5>"
                    break;
            case 'expected-years-of-living-with-disability-or-disease-burden':
                    html_text += "<h5>" + val + " years" + "</h5>"
                    break;
            case 'life-expectancy':
                    html_text += "<h5>" + val + " years" + "</h5>"
                    break;
            case 'maternal-mortality':
                    html_text += "<h5>" + val + " deaths per 100,000 live births" + "</h5>"
                    break;
            case 'median-age':
                    html_text += "<h5>" + val + " years" + "</h5>"
                    break;
            case 'polio-vaccine-coverage-of-one-year-olds':
                    html_text += "<h5>" + val + "%" + "</h5>"
                    break;
            case 'share-of-population-with-cancer':
                    html_text += "<h5>" + val + "%" + "</h5>"
                    break;
            case 'share-with-alcohol-use-disorders':
                    html_text += "<h5>" + val + "%" + "</h5>"
                    break;
            case 'share-with-mental-and-substance-disorders':
                    html_text += "<h5>" + val + "%" + "</h5>"
                    break;
            case 'total-healthcare-expenditure-as-share-of-national-gdp-by-country':
                    html_text += "<h5>" + val + "% of GDP" + "</h5>"
                    break;
        }
        return html_text;
    }

    getDomainAndRangeForColorScale(health_factor, value, get_divisions) {
        let domain = []
        let range = [];
        let colorScale
        switch(health_factor) {
            case "child-mortality":
                if(get_divisions)
                    return 6
                domain = [0, 1, 5, 10, 20, 30, 50];
                range = ["#2166ac", "#67a9cf", "#d1e5f0", "#fddbc7", "#ef8a62", "#b2182b"];
                colorScale = d3.scaleQuantile()
                            .domain(domain)
                            .range(range);
                if (value == '')
                    return colorScale
                return colorScale(value)
            case "beer-consumption-per-person":
                if(get_divisions)
                    return 8
                domain = [0, 1, 2, 3, 4, 5, 6, 7, 8];
                range = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#0c2c84"];
                colorScale = d3.scaleQuantile()
                            .domain(domain)
                            .range(range);
                if (value == '')
                    return colorScale
                return colorScale(value)
            case "child-mortality-by-income-level-of-country":
                if(get_divisions)
                    return 5
                domain = [0, 5, 10, 15, 20, 25];
                range = ["#023858", "#d0d1e6", "#74a9cf", "#74a9cf", "#023858"];
                colorScale = d3.scaleQuantile()
                            .domain(domain)
                            .range(range);
                if (value == '')
                    return colorScale
                return colorScale(value)
            case "expected-years-of-living-with-disability-or-disease-burden":
                if(get_divisions)
                    return 7
                domain = [5, 6, 7, 8, 9, 10, 11, 12];
                range = ["#ffffb2", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#b10026"];
                colorScale = d3.scaleQuantile()
                            .domain(domain)
                            .range(range);
                if (value == '')
                    return colorScale
                return colorScale(value)
            case "life-expectancy":
                if(get_divisions)
                    return 11
                domain = [20, 30, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85];
                range = ["#9e0142", "#d53e4f", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#e6f598", "#abdda4", "#66c2a5", "#3288bd", "#674c98"];
                colorScale = d3.scaleQuantile()
                            .domain(domain)
                            .range(range);
                if (value == '')
                    return colorScale
                return colorScale(value)
            case "maternal-mortality":
                if(get_divisions)
                    return 7
                domain = [0, 10, 50, 100, 200, 500, 1000, 3000];
                range = ["#fef0d9", "#fdd49e", "#fdbb84", "#fc8d59"];
                colorScale = d3.scaleQuantile()
                            .domain(domain)
                            .range(range);
                if (value == '')
                    return colorScale
                return colorScale(value)
            case "median-age":
                if(get_divisions)
                    return 8
                domain = [14, 20, 25, 30, 35, 40, 45, 50, 55];
                range = ["#fff7fb", "#ece2f0", "#d0d1e6", "#a6bddb", "#67a9cf", "#3690c0", "#02818a", "#016450"];
                colorScale = d3.scaleQuantile()
                            .domain(domain)
                            .range(range);
                if (value == '')
                    return colorScale
                return colorScale(value)
            case "polio-vaccine-coverage-of-one-year-olds":
                if(get_divisions)
                    return 10
                domain = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
                range = ["#f7fcfd", "#e5f5f9", "#ccece6", "#99d8c9", "#66c2a4", "#41ae76", "#238b45", "#006d2c", "rgb(0, 89, 36)", "#00441b"];
                colorScale = d3.scaleQuantile()
                            .domain(domain)
                            .range(range);
                if (value == '')
                    return colorScale
                return colorScale(value)
            case "share-of-population-with-cancer":
                if(get_divisions)
                    return 8
                domain = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
                range = ["#ffffcc", "#ffeda0", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#b10026"];
                colorScale = d3.scaleQuantile()
                            .domain(domain)
                            .range(range);
                if (value == '')
                    return colorScale
                return colorScale(value)
            case "share-with-alcohol-use-disorders":
                if(get_divisions)
                    return 8
                domain = [0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5];
                range = ["#f7fcfd", "#e0ecf4", "#bfd3e6", "#9ebcda", "#8c96c6", "#8c6bb1", "#88419d", "#6e016b"];
                colorScale = d3.scaleQuantile()
                            .domain(domain)
                            .range(range);
                if (value == '')
                    return colorScale
                return colorScale(value)
            case "share-with-mental-and-substance-disorders":
                if(get_divisions)
                    return 7
                domain = [7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25];
                range = ["#ffeda0", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#b10026"];
                colorScale = d3.scaleQuantile()
                            .domain(domain)
                            .range(range);
                if (value == '')
                    return colorScale
                return colorScale(value)
            case "total-healthcare-expenditure-as-share-of-national-gdp-by-country":
                if(get_divisions)
                    return 9
                domain = [1,2,3,4,5,7,8,9,10,18];
                range = ["#f7fcf0", "#e0f3db", "#ccebc5", "#a8ddb5", "#7bccc4", "rgb(101, 192, 204)", "#4eb3d3", "rgb(61, 160, 201)", "#2b8cbe"];
                colorScale = d3.scaleQuantile()
                            .domain(domain)
                            .range(range);
                if (value == '')
                    return colorScale
                return colorScale(value)
        }
    }
}