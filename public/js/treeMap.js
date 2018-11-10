class TreeMap {
    /**
     * Initializes the svg elements required to lay the tiles
     * and to populate the legend.
     */
    constructor(){
        console.log("tree map constructor");
        this.causesOfDeathData = []
        this.selectedFeaturesData =[]
        this.selectedCause = ""
        this.selectedYear = 0
        this.causesOfDeathSumValues= {"Dementia": 0 ,"Cardiovascular diseases": 0 ,"Kidney disease": 0 ,"Respiratory disease": 0 ,"Liver disease": 0 ,"Diabetes, blood and endocrine disease": 0 ,"Digestive disease": 0 ,"Hepatitis": 0 ,"Cancers": 0 ,"Parkinson\'s disease": 0 ,"Fire": 0 ,"Malaria": 0 ,"Drowning": 0 ,"Homicide": 0 ,"HIV/AIDS": 0 ,"Drug disorder": 0 ,"Tuberculosis": 0 ,"Road incidents": 0 ,"Maternal deaths": 0 ,"Neonatal deaths": 0 ,"Alcohol disorder": 0 ,"Natural disasters": 0 ,"Diarrheal diseases": 0 ,"Heat-related deaths (hot or cold exposure)": 0 ,"Nutritional deficiencies": 0 ,"Suicide": 0 ,"Execution (deaths)": 0 ,"Meningitis (deaths)": 0 ,"Lower respiratory infections (deaths)": 0 ,"Intestinal infectious diseases (deaths)": 0 ,"Protein-energy malnutrition (deaths)": 0 ,"Conflict (deaths)": 0 ,"Terrorism (deaths)":0}
        let svgWidth = 1000;
        let svgHeight = 500;
        this.lineAndBarSvgWidth = 500;
        this.lineAndBarSvgHeight = 500;
        this.deathType = {"Dementia": "NC","Cardiovascular diseases":"NC","Kidney disease":"NC","Respiratory disease":"NC","Liver disease":"NC","Diabetes, blood and endocrine disease":"NC","Digestive disease":"NC","Hepatitis":"C","Cancers":"NC","Parkinson's disease":"NC","Fire":"A","Malaria":"NC","Drowning":"A","Homicide":"CR","HIV/AIDS":"C","Drug disorder":"NC","Tuberculosis":"C","Road incidents":"A","Maternal deaths":"A","Neonatal deaths":"NC","Alcohol disorder":"NC","Natural disasters":"A","Diarrheal diseases":"NC","Heat-related deaths (hot or cold exposure)":"NC","Nutritional deficiencies":"NC","Suicide":"CR","Execution (deaths)":"CR","Meningitis (deaths)":"C","Lower respiratory infections (deaths)":"NC","Intestinal infectious diseases (deaths)":"NC","Protein-energy malnutrition (deaths)":"NC","Conflict (deaths)":"CR","Terrorism (deaths)":"CR"};
        this.treeMapWidth = 800;
        this.treeMapHeight = 400;
        this.selectedYears = [2006, 2007, 2008, 2009, 2010];
        this.selectedCountries = ["AFG", "ALB", "NOR", "OMN", "SWE", "SGP"];
        
        // d3.select("#charts")
        //     .attr("width", svgWidth)
        //     .attr("height", svgHeight);
        d3.select("#treeMap").append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);
        d3.select("#lineChart").append("svg")
            .attr("width", this.lineAndBarSvgWidth)
            .attr("height", this.lineAndBarSvgHeight);
        d3.select("#barChart").append("svg")
            .attr("width", this.lineAndBarSvgWidth)
            .attr("height", this.lineAndBarSvgHeight);
    };
    tooltip_render(tooltip_data) {
        let text = "<h2 class ="  + this.chooseClass(tooltip_data.winner) + " >" + tooltip_data.state + "</h2>";
        text +=  "Electoral Votes: " + tooltip_data.electoralVotes;
        text += "<ul>"
        tooltip_data.result.forEach((row)=>{
            if(row["nominee"] != "" && row["nominee"] != " "){
                text += "<li class = " + this.chooseClass(row["party"])+ ">" + row["nominee"]+":\t\t"+row["votecount"]+"\t("+row["percentage"]+"%)" + "</li>"
            }
        });
        text += "</ul>";

        return text;
    }

    
    displayBarChart(year){  
        this.selectedYear = year;
        let that = this;
        let barChartData = [];
        let dataBuffer = 2000;
        let padding = 50;
        that.selectedFeaturesData.forEach(function(element){
            if (element["Year"] == that.selectedYear){
                barChartData.push({"country":element["Entity"], "conCode": element["Code"], "CauseValue": element[that.selectedCause]});
            }
        });

        let x = d3.scaleBand().domain(barChartData.map(function(d) { return d.country; })).range([0, this.lineAndBarSvgWidth - (2*padding)]); 
        let y = d3.scaleLinear().domain([d3.min(barChartData, function(d) { return d.CauseValue; })-dataBuffer, d3.max(barChartData, function(d) { return d.CauseValue; })+dataBuffer]).range([this.lineAndBarSvgHeight - (2*padding), 0]);

        var xAxis = d3.axisBottom(x).ticks(5);
        var yAxis = d3.axisLeft(y).ticks(5);

        
        let domain = [d3.min(barChartData, function(d) { return d.CauseValue; })-dataBuffer, d3.max(barChartData, function(d) { return d.CauseValue; })+dataBuffer];
        let range = ["#83677B", "#2E1114"];
        let colorScale = d3.scaleQuantile().domain(domain).range(range);

        let svgContainer = d3.select("#barChart").select("svg");
        svgContainer.selectAll("g").remove();
        svgContainer = svgContainer.append("g").attr("transform", "translate(" + padding + "," + padding + ")");
        // append the rectangles for the bar chart
        svgContainer.selectAll("rect")
            .data(barChartData)
            .enter().append("rect")
            .attr("x", function(d) { return x(d.country)+ 33- (25/2); })
            .attr("width", 25)
            .transition().duration(4000)
            .attr("y", function(d) { return y(d.CauseValue); })
            .attr("height", function(d) { return (that.lineAndBarSvgWidth - (2*padding) - y(d.CauseValue)); })
            .attr("fill", function(d){return colorScale(d.CauseValue);});
      
        svgContainer.append("g")
            .attr("transform", "translate(0," + (this.lineAndBarSvgWidth - (2*padding) ) + ")")
            .call(xAxis);

        svgContainer.append("g")
            .call(yAxis);
    }
    
    displayLineChart(cause){  
        this.selectedCause = cause;
        let that = this;
        let dataBuffer = 1000;
        let yearBuffer = 1;
        let padding = 50;
        let lineChartData = [];
        this.selectedYears.forEach(function(year){
            let yearCauseSum = 0;
            that.selectedFeaturesData.forEach(function(element){
                if (element["Year"] == year){
                    if (element[that.selectedCause] != undefined){
                        yearCauseSum +=  element[that.selectedCause]
                    }
                }
            });
            lineChartData.push({"Year":year, "causeSum":yearCauseSum});
        });
        console.log(lineChartData);
        let svgContainer = d3.select("#lineChart").select("svg");
        svgContainer.selectAll("g").remove();

        svgContainer = svgContainer.append("g").attr("transform", "translate(" + padding + "," + padding + ")");
        let x = d3.scaleLinear().domain([Math.min.apply(null, this.selectedYears) - yearBuffer, Math.max.apply(null, this.selectedYears)+ yearBuffer]).range([0, this.lineAndBarSvgWidth - 2*padding]); 
        let y = d3.scaleLinear().domain([d3.min(lineChartData, function(d) { return d.causeSum; })-dataBuffer, d3.max(lineChartData, function(d) { return d.causeSum; })+dataBuffer]).range([this.lineAndBarSvgHeight - 2*padding, 0]);

        var xAxis = d3.axisBottom(x).ticks(5);
        var yAxis = d3.axisLeft(y).ticks(5);

        let valueline = d3.line()
            .x(function(d) { return x(d.Year); })
            .y(function(d) { return y(d.causeSum); });

        svgContainer.append("path")
            .attr("d", valueline(lineChartData))
            .attr("stroke", "#2E1114")
            .attr("stroke-width", 2)
            .attr("fill", " none");   

        let div = d3.select("body").append("div")				
            .style("opacity", 0);

        svgContainer.selectAll("circle")
            .data(lineChartData)
            .enter().append("circle")
            .attr("r", 5)
            .attr("cx", function(d) { return x(d.Year); })
            .attr("cy", function(d) { return y(d.causeSum); })
            .attr("id",  function(d) { return d.Year; })
            .attr("fill", "#ADADAD")
            .attr("stroke", "#644856")
            .attr("stroke-width", 2)
            .on("click", function() { that.displayBarChart(this.id); })
            .on("mouseover", function(d) {		
                div.transition()		
                    .duration(200)		
                    .style("opacity", .9);		
                div	.html(d.Year + "<br/>"  + d.causeSum);
                })					
            .on("mouseout", function(d) {		
                div.transition()		
                    .duration(500)		
                    .style("opacity", 0);	
            });;
            
        svgContainer.append("g")
            .attr("transform", "translate(0," + (this.lineAndBarSvgWidth - (2*padding) ) + ")")
            .call(xAxis);

        svgContainer.append("g")
            .call(yAxis);
    }
    createTreeMap(causesOfDeathData){
        
        let domain = [d3.min(causesOfDeathData, function(d) { return d.sum; }), d3.max(causesOfDeathData, function(d) { return d.sum; })];
        let range = ["#83677B", "#2E1114"];
        let colorScale = d3.scaleQuantile().domain(domain).range(range);

        let that = this;           
        let color = d3.scaleOrdinal(d3["schemeCategory20c"]);
        let svgContainer = d3.select("#treeMap").select("svg");
        let treemap = d3.treemap()
            .size([this.treeMapWidth, this.treeMapHeight])
            .round(true)
            .padding(1);
        
        let root = d3.stratify()
            .id(d => d.name)
            .parentId(d => d.parent)
            (causesOfDeathData)
            .sum(d => d.sum)
            .sort((a, b) => b.height - a.height || b.value - a.value);

        treemap(root);
        let cell = svgContainer.selectAll("a")
            .data(root.leaves())
            .enter().append("a")
            .attr("transform", d => "translate(" + d.x0 + "," + d.y0 + ")");

        let rectBars = cell.append("rect") 
            // .transition() //harshi
            // .duration(4000)
            .attr("id", d => d.id)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill",  function(d, i) { return color(d.id); })
            .on("click", function() { that.displayLineChart(this.id);});            

        cell.append("title")    
            .text(d =>  d.id + "\n" + d.value)
            .style('fill', "white"); //harshi
    }
    update (electionResult, colorScale){
        let that = this;
        d3.csv("../data/annual-number-of-deaths-by-cause.csv").then( causesOfDeath => {
            that.causesOfDeathData.push(causesOfDeath);
            setTimeout(treeMapData(), 3000);
        });
        function treeMapData(){
            that.causesOfDeathData.forEach(function(element){
                element.forEach(function(ele){
                    if (that.selectedYears.includes(parseInt(ele["Year"])) && that.selectedCountries.includes(ele["Code"])){   
                        let dataDict = {};
                        dataDict["Entity"] = ele["Entity"];
                        dataDict["Code"] = ele["Code"];
                        dataDict["Year"] = parseInt(ele["Year"]);
                        if(ele["Dementia"] != ""){
                            that.causesOfDeathSumValues[ "Dementia"] += parseInt(ele["Dementia"]);
                            dataDict["Dementia"] = parseInt(ele["Dementia"]);
                        }if(ele["Cardiovascular diseases"] != ""){
                            that.causesOfDeathSumValues[ "Cardiovascular diseases"] += parseInt(ele["Cardiovascular diseases"]);
                            dataDict["Cardiovascular diseases"] = parseInt(ele["Cardiovascular diseases"]);
                        }if(ele["Kidney disease"] != ""){
                            that.causesOfDeathSumValues[ "Kidney disease"] += parseInt(ele["Kidney disease"]);
                            dataDict["Kidney disease"] = parseInt(ele["Kidney disease"]);
                        }if(ele["Respiratory disease"] != ""){
                            that.causesOfDeathSumValues[ "Respiratory disease"] += parseInt(ele["Respiratory disease"]);
                            dataDict["Respiratory disease"] = parseInt(ele["Respiratory disease"]);
                        }if(ele["Liver disease"] != ""){
                            that.causesOfDeathSumValues[ "Liver disease"] += parseInt(ele["Liver disease"]);
                            dataDict["Liver disease"] = parseInt(ele["Liver disease"]);
                        }if(ele["Diabetes, blood and endocrine disease"] != ""){
                            that.causesOfDeathSumValues[ "Diabetes, blood and endocrine disease"] += parseInt(ele["Diabetes, blood and endocrine disease"]);
                            dataDict["Diabetes, blood and endocrine disease"] = parseInt(ele["Diabetes, blood and endocrine disease"]);
                        }if(ele["Digestive disease"] != ""){
                            that.causesOfDeathSumValues[ "Digestive disease"] += parseInt(ele["Digestive disease"]);
                            dataDict["Digestive disease"] = parseInt(ele["Digestive disease"]);
                        }if(ele["Hepatitis"] != ""){
                            that.causesOfDeathSumValues[ "Hepatitis"] += parseInt(ele["Hepatitis"]);
                            dataDict["Hepatitis"] = parseInt(ele["Hepatitis"]);
                        }if(ele["Cancers"] != ""){
                            that.causesOfDeathSumValues[ "Cancers"] += parseInt(ele["Cancers"]);
                            dataDict["Cancers"] = parseInt(ele["Cancers"]);
                        }if(ele["Parkinson's disease"] != ""){
                            that.causesOfDeathSumValues[ "Parkinson's disease"] += parseInt(ele["Parkinson's disease"]);
                            dataDict["Parkinson's disease"] = parseInt(ele["Parkinson's disease"]);
                        }if(ele["Fire"] != ""){
                            that.causesOfDeathSumValues[ "Fire"] += parseInt(ele["Fire"]);
                            dataDict["Fire"] = parseInt(ele["Fire"]);
                        }if(ele["Malaria"] != ""){
                            that.causesOfDeathSumValues[ "Malaria"] += parseInt(ele["Malaria"]);
                            dataDict["Malaria"] = parseInt(ele["Malaria"]);
                        }if(ele["Drowning"] != ""){
                            that.causesOfDeathSumValues[ "Drowning"] += parseInt(ele["Drowning"]);
                            dataDict["Drowning"] = parseInt(ele["Drowning"]);
                        }if(ele["Homicide"] != ""){
                            that.causesOfDeathSumValues[ "Homicide"] += parseInt(ele["Homicide"]);
                            dataDict["Homicide"] = parseInt(ele["Homicide"]);
                        }if(ele["HIV/AIDS"] != ""){
                            that.causesOfDeathSumValues[ "HIV/AIDS"] += parseInt(ele["HIV/AIDS"]);
                            dataDict["HIV/AIDS"] = parseInt(ele["HIV/AIDS"]);
                        }if(ele["Drug disorder"] != ""){
                            that.causesOfDeathSumValues[ "Drug disorder"] += parseInt(ele["Drug disorder"]);
                            dataDict["Drug disorder"] = parseInt(ele["Drug disorder"]);
                        }if(ele["Tuberculosis"] != ""){
                            that.causesOfDeathSumValues[ "Tuberculosis"] += parseInt(ele["Tuberculosis"]);
                            dataDict["Tuberculosis"] = parseInt(ele["Tuberculosis"]);
                        }if(ele["Road incidents"] != ""){
                            that.causesOfDeathSumValues[ "Road incidents"] += parseInt(ele["Road incidents"]);
                            dataDict["Road incidents"] = parseInt(ele["Road incidents"]);
                        }if(ele["Maternal deaths"] != ""){
                            that.causesOfDeathSumValues[ "Maternal deaths"] += parseInt(ele["Maternal deaths"]);
                            dataDict["Maternal deaths"] = parseInt(ele["Maternal deaths"]);
                        }if(ele["Neonatal deaths"] != ""){
                            that.causesOfDeathSumValues[ "Neonatal deaths"] += parseInt(ele["Neonatal deaths"]);
                            dataDict["Neonatal deaths"] = parseInt(ele["Neonatal deaths"]);
                        }if(ele["Alcohol disorder"] != ""){
                            that.causesOfDeathSumValues[ "Alcohol disorder"] += parseInt(ele["Alcohol disorder"]);
                            dataDict["Alcohol disorder"] = parseInt(ele["Alcohol disorder"]);
                        }if(ele["Natural disasters"] != ""){
                            that.causesOfDeathSumValues[ "Natural disasters"] += parseInt(ele["Natural disasters"]);
                            dataDict["Natural disasters"] = parseInt(ele["Natural disasters"]);
                        }if(ele["Heat-related deaths (hot or cold exposure)"] != ""){
                            that.causesOfDeathSumValues[ "Heat-related deaths (hot or cold exposure)"] += parseInt(ele["Heat-related deaths (hot or cold exposure)"]);
                            dataDict["Heat-related deaths (hot or cold exposure)"] = parseInt(ele["Heat-related deaths (hot or cold exposure)"]);
                        }if(ele["Nutritional deficiencies"] != ""){
                            that.causesOfDeathSumValues[ "Nutritional deficiencies"] += parseInt(ele["Nutritional deficiencies"]);
                            dataDict["Nutritional deficiencies"] = parseInt(ele["Nutritional deficiencies"]);
                        }if(ele["Suicide"] != ""){
                            that.causesOfDeathSumValues[ "Suicide"] += parseInt(ele["Suicide"]);
                            dataDict["Suicide"] = parseInt(ele["Suicide"]);
                        }if(ele["Execution (deaths)"] != ""){
                            that.causesOfDeathSumValues[ "Execution (deaths)"] += parseInt(ele["Execution (deaths)"]);
                            dataDict["Execution (deaths)"] = parseInt(ele["Execution (deaths)"]);
                        }if(ele["Meningitis (deaths)"] != ""){
                            that.causesOfDeathSumValues[ "Meningitis (deaths)"] += parseInt(ele["Meningitis (deaths)"]);
                            dataDict["Meningitis (deaths)"] = parseInt(ele["Meningitis (deaths)"]);
                        }if(ele["Lower respiratory infections (deaths)"] != ""){
                            that.causesOfDeathSumValues[ "Lower respiratory infections (deaths)"] += parseInt(ele["Lower respiratory infections (deaths)"]);
                            dataDict["Lower respiratory infections (deaths)"] = parseInt(ele["Lower respiratory infections (deaths)"]);
                        }if(ele["Intestinal infectious diseases (deaths)"] != ""){
                            that.causesOfDeathSumValues[ "Intestinal infectious diseases (deaths)"] += parseInt(ele["Intestinal infectious diseases (deaths)"]);
                            dataDict["Intestinal infectious diseases (deaths)"] = parseInt(ele["Intestinal infectious diseases (deaths)"]);
                        }if(ele["Protein-energy malnutrition (deaths)"] != ""){
                            that.causesOfDeathSumValues[ "Protein-energy malnutrition (deaths)"] += parseInt(ele["Protein-energy malnutrition (deaths)"]);
                            dataDict["Protein-energy malnutrition (deaths)"] = parseInt(ele["Protein-energy malnutrition (deaths)"]);
                        }if(ele["Conflict (deaths)"] != ""){
                            that.causesOfDeathSumValues[ "Conflict (deaths)"] += parseInt(ele["Conflict (deaths)"]);
                            dataDict["Conflict (deaths)"] = parseInt(ele["Conflict (deaths)"]);
                        }if(ele["Terrorism (deaths)"] != ""){
                            that.causesOfDeathSumValues[ "Terrorism (deaths)"] += parseInt(ele["Terrorism (deaths)"]);
                            dataDict["Terrorism (deaths)"] = parseInt(ele["Terrorism (deaths)"]);
                        }
                       that.selectedFeaturesData.push(dataDict); 
                    }
                });
            });
            let causesOfDeathJson = []
            let ele = "";
            causesOfDeathJson.push({"name":"Overall", "parent":"", "sum":undefined});
            causesOfDeathJson.push({"name":"NC", "parent":"Overall", "sum":undefined});
            causesOfDeathJson.push({"name":"C", "parent":"Overall", "sum":undefined});
            causesOfDeathJson.push({"name":"A", "parent":"Overall", "sum":undefined});
            causesOfDeathJson.push({"name":"CR", "parent":"Overall", "sum":undefined});
            for (ele in that.causesOfDeathSumValues){
                causesOfDeathJson.push({"name":ele, "parent": that.deathType[ele], "sum":that.causesOfDeathSumValues[ele].toString()})
            }
            that.createTreeMap(causesOfDeathJson);
                
        }
    };
}