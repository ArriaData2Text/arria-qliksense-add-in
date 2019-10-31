//declare jquery, qlik to be used globally
//style.css is custom file to declare all the styles used
define([
    'jquery',
    'qlik',
    'text!./css/style.css',
    './js/fingerprint2',
    './js/bi_mappings'
], function ($, qlik, style, Fingerprint2) {
    'use strict';
    //append style tab to dom and include all style attributes from style.css
    $('<style>').html(style).appendTo('head');

    /**
     * @methodOf: Initialize Global Variables
     * @description Initialize Global Variables
     * @returns 
     */
    let defaultApiEndpoint = "https://bi.prod.arria.com/"; //Prod
    let apiEndpoint = defaultApiEndpoint;
    var authorizationValue = "Yml3cmFwcGVyOnc/R2NkZzdl";
    let supportURL = "https://samples.studio.arria.com/bi-ai-for-qlik/";
    let OOTBGenerateEndPoint = "https://eut3hmitn2.execute-api.us-east-1.amazonaws.com/release-1-1-1/arriatestootbglooapi";
    let OOTBEndPointAPIKey = "MCrD8Y2tOQ2BhpjkrpW5q1ybQIA2h6vi84xhdEkd";
    let OOTBEndPoint = "https://jxczzc66qa.execute-api.us-east-1.amazonaws.com/prod/";
    let OOTBEndPointKey = "YXH7gK57Wv5Ld213gci3YaTttaca0EDi85miLX07";
    let entityType = {
        entityTypes: []
    };
    let measureEntityType = {
        entityTypes: []
    };
    var narrationCall = true;
    var selColstrack = {};
    var debounce = false;
    var copyChartID = "";
    var copyToClipBoardFlag = false;
    var url_Pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    var dragSrcEl = null;
    var drillDownFilter = false;
    var fieldUpdate = false;
    var autoIncrementID = true;
    var presistSimplecheck = "";
    var presistAdvanceCheck = "";
    var maximize = false;
    var fingerPrintKey = "";
    var projectArgumentsNarrative = {};
    getEntitiesForOOTB();
    getFingerPrintKey();

    /**
     * @methodOf: Convert CSV
     * @description The function to Convert JSON Array to CSV String
     * @returns 
     */
    function convertToCSV(arrayOfData) {
        var array = typeof arrayOfData != 'object' ? JSON.parse(arrayOfData) : arrayOfData;
        var str = '';
        for (var i = 0; i < array.length; i++) {
            var line = '';
            for (var index in array[i]) {
                if (line != '') line += ','
                line += array[i][index];
            }
            str += line + '<br>';
        }
        return str;
    }

    /**
     * @methodOf: Get Entities OOTB
     * @description The function to Get Entitity values for Dimension and Measures
     * @returns 
     */

    function getEntitiesForOOTB() {
        try {
            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    if (xhttp.responseText !== "")
                        entityType = JSON.parse(xhttp.responseText);
                }
            };
            xhttp.onerror = function (e) {};
            xhttp.open('GET', OOTBEndPoint + "ootb/entitytypesfordims");
            xhttp.setRequestHeader('x-api-key', OOTBEndPointKey);
            if (window.navigator.onLine)
                xhttp.send();

            // Measure Metadata 
            let xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    if (xmlhttp.responseText !== "")
                        measureEntityType = JSON.parse(xmlhttp.responseText);
                }
            }
            xmlhttp.onerror = function (e) {};
            xmlhttp.open('GET', OOTBEndPoint + "ootb/entitytypesformeasures");
            xmlhttp.setRequestHeader('x-api-key', OOTBEndPointKey);
            if (window.navigator.onLine)
                xmlhttp.send();

        } catch (e) {
            console.log(e);
        }
    }

    /**
     * @methodOf: Create Finger Print Key
     * @description The function to Generate Unique Authentication Key
     * @returns 
     */
    function getFingerPrintKey() {
        if (fingerPrintKey === "") {
            var fingerPrintOptions = {
                excludeScreenResolution: true,
                excludeAvailableScreenResolution: true
            };
            new Fingerprint2(fingerPrintOptions).get(function (result, components) {
                fingerPrintKey = result;
            });
        }
    }

    /**
     * @methodOf: Call Narration UI
     * @description Render HTML Dom Elements
     * @returns 
     */
    function createNarrativeUI(chartId, $element, chartObj) {
        let placeHolderString = "";
        placeHolderString += "/*\n";
        placeHolderString += "* function to modify data in standard BI format.\n";
        placeHolderString += "* @return a JSON object.\n";
        placeHolderString += "*/\n";
        placeHolderString += "getData()";
        var element = '';
        element += '<div class="container qlik-container" id="qlikContainer' + chartId + '">';
        // Header
        element += '<header class="col-md-12" id="header' + chartId + '">';
        element += '<div class="col-md-12 tab-header"> ';
        element += '<button type="button" id="box-tab' + chartId + '">Configure Narrative</button> <button class="narrative-tab" type="button" id="narrative-tab' + chartId + '">Create Custom Narrative</button>';
        element += '<a href="javascript:void(0);" id="documentBtn' + chartId + '" class="documentBtn">Documentation</a>';
        element += '</div>';
        element += '</header>';
        // Section 
        element += '<section>';
        element += '<div class="outofbox-tabsection" id="outofbox-tabsection' + chartId + '" style="display:block">';
        element += '<div class="header">';
        element += '<a href="javascript:void(0)" class="previous" style="display:none;"><img src="' + apiEndpoint + 'arria/images/arrow_left.png">Previous</a>';
        element += '<a href="javascript:void(0)" class="next" style="display:block;">Next<img src="' + apiEndpoint + 'arria/images/arrow_right.png"></a>';
        element += '<div class="slide"><ul><li class="active" id="slide1' + chartId + '"></li><li id="slide2' + chartId + '"></li><li id="slide3' + chartId + '"></li></ul></div>';
        element += '<p>1.Tell me about your data</p>';
        element += '</div>'; //Tell me about data section
        element += '<div class="tell-data" id="tell-data' + chartId + '" style="display:block">';
        //Content
        element += '</div>';
        //Tell me about data section
        // Second Tab
        element += '<div class="tell-what" id="tell-what' + chartId + '" style="display:none">';
        element += '<div class="card">';
        element += '<div class="card-header statistics"><input type="checkbox">Descriptive statistics (avg, min, max) <img src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAxMjkgMTI5IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxMjkgMTI5IiB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4Ij4KICA8Zz4KICAgIDxwYXRoIGQ9Im0xMjEuMywzNC42Yy0xLjYtMS42LTQuMi0xLjYtNS44LDBsLTUxLDUxLjEtNTEuMS01MS4xYy0xLjYtMS42LTQuMi0xLjYtNS44LDAtMS42LDEuNi0xLjYsNC4yIDAsNS44bDUzLjksNTMuOWMwLjgsMC44IDEuOCwxLjIgMi45LDEuMiAxLDAgMi4xLTAuNCAyLjktMS4ybDUzLjktNTMuOWMxLjctMS42IDEuNy00LjIgMC4xLTUuOHoiIGZpbGw9IiM2NjY2NjYiLz4KICA8L2c+Cjwvc3ZnPgo=" /></div>';
        element += '<div class="card-content text-center col-md-12"><div class="col-md-6 text-left"><input type="checkbox"><label>Data driven (ANOVA based ranking)</label> </div><div class="col-md-6 text-left"><input type="checkbox"><label>Include distribution analysis</label> </div></div>';
        element += '</div>'; //card
        element += '<div class="card">';
        element += '<div class="card-header time"><input type="checkbox">Time series (trends) <img src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAxMjkgMTI5IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxMjkgMTI5IiB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4Ij4KICA8Zz4KICAgIDxwYXRoIGQ9Im0xMjEuMywzNC42Yy0xLjYtMS42LTQuMi0xLjYtNS44LDBsLTUxLDUxLjEtNTEuMS01MS4xYy0xLjYtMS42LTQuMi0xLjYtNS44LDAtMS42LDEuNi0xLjYsNC4yIDAsNS44bDUzLjksNTMuOWMwLjgsMC44IDEuOCwxLjIgMi45LDEuMiAxLDAgMi4xLTAuNCAyLjktMS4ybDUzLjktNTMuOWMxLjctMS42IDEuNy00LjIgMC4xLTUuOHoiIGZpbGw9IiM2NjY2NjYiLz4KICA8L2c+Cjwvc3ZnPgo=" /></div>';
        element += '<div class="card-content text-center">';
        element += '<div class="col-md-8"><span>Cluster Distance</span> 0<input type="range" min="1" max="100" value="50" class="range-slide">100<span class="slide-span"></span></div>';
        element += '</div>';
        element += '</div>'; //card
        element += '<div class="card">';
        element += '<div class="card-header groupings"><input type="checkbox">Important groupings (clusters) <img src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAxMjkgMTI5IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxMjkgMTI5IiB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4Ij4KICA8Zz4KICAgIDxwYXRoIGQ9Im0xMjEuMywzNC42Yy0xLjYtMS42LTQuMi0xLjYtNS44LDBsLTUxLDUxLjEtNTEuMS01MS4xYy0xLjYtMS42LTQuMi0xLjYtNS44LDAtMS42LDEuNi0xLjYsNC4yIDAsNS44bDUzLjksNTMuOWMwLjgsMC44IDEuOCwxLjIgMi45LDEuMiAxLDAgMi4xLTAuNCAyLjktMS4ybDUzLjktNTMuOWMxLjctMS42IDEuNy00LjIgMC4xLTUuOHoiIGZpbGw9IiM2NjY2NjYiLz4KICA8L2c+Cjwvc3ZnPgo=" /></div>';
        element += '<div class="card-content text-center">';
        element += '<div class="col-md-8"><span>Cluster Distance</span> 0<input type="range" min="1" max="100" value="50" class="range-slide">100<span class="slide-span"></span></div>';
        element += '</div>';
        element += '</div>'; //card
        element += '<div class="card">';
        element += '<div class="card-header data"><input type="checkbox">How my data is distributed (skewed) <img src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAxMjkgMTI5IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxMjkgMTI5IiB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4Ij4KICA8Zz4KICAgIDxwYXRoIGQ9Im0xMjEuMywzNC42Yy0xLjYtMS42LTQuMi0xLjYtNS44LDBsLTUxLDUxLjEtNTEuMS01MS4xYy0xLjYtMS42LTQuMi0xLjYtNS44LDAtMS42LDEuNi0xLjYsNC4yIDAsNS44bDUzLjksNTMuOWMwLjgsMC44IDEuOCwxLjIgMi45LDEuMiAxLDAgMi4xLTAuNCAyLjktMS4ybDUzLjktNTMuOWMxLjctMS42IDEuNy00LjIgMC4xLTUuOHoiIGZpbGw9IiM2NjY2NjYiLz4KICA8L2c+Cjwvc3ZnPgo=" /></div>';
        element += '<div class="card-content text-center">';
        element += '<div class="col-md-8"><span>Cluster Distance</span> 0<input type="range" min="1" max="100" value="50" class="range-slide">100<span class="slide-span"></span></div>';
        element += '</div>';
        element += '</div>'; //card
        element += '<div class="card">';
        element += '<div class="card-header vary"><input type="checkbox">Variance <img src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAxMjkgMTI5IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxMjkgMTI5IiB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4Ij4KICA8Zz4KICAgIDxwYXRoIGQ9Im0xMjEuMywzNC42Yy0xLjYtMS42LTQuMi0xLjYtNS44LDBsLTUxLDUxLjEtNTEuMS01MS4xYy0xLjYtMS42LTQuMi0xLjYtNS44LDAtMS42LDEuNi0xLjYsNC4yIDAsNS44bDUzLjksNTMuOWMwLjgsMC44IDEuOCwxLjIgMi45LDEuMiAxLDAgMi4xLTAuNCAyLjktMS4ybDUzLjktNTMuOWMxLjctMS42IDEuNy00LjIgMC4xLTUuOHoiIGZpbGw9IiM2NjY2NjYiLz4KICA8L2c+Cjwvc3ZnPgo=" /></div>';
        element += '<div class="card-content text-center">';
        element += '<div class="col-md-8"><span>Cluster Distance</span> 0<input type="range" min="1" max="100" value="50" class="range-slide">100<span class="slide-span"></span></div>';
        element += '</div>';
        element += '</div>'; //card
        element += '<div class="card">';
        element += '<div class="card-header add"><input type="checkbox">Correlations <img src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAxMjkgMTI5IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxMjkgMTI5IiB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4Ij4KICA8Zz4KICAgIDxwYXRoIGQ9Im0xMjEuMywzNC42Yy0xLjYtMS42LTQuMi0xLjYtNS44LDBsLTUxLDUxLjEtNTEuMS01MS4xYy0xLjYtMS42LTQuMi0xLjYtNS44LDAtMS42LDEuNi0xLjYsNC4yIDAsNS44bDUzLjksNTMuOWMwLjgsMC44IDEuOCwxLjIgMi45LDEuMiAxLDAgMi4xLTAuNCAyLjktMS4ybDUzLjktNTMuOWMxLjctMS42IDEuNy00LjIgMC4xLTUuOHoiIGZpbGw9IiM2NjY2NjYiLz4KICA8L2c+Cjwvc3ZnPgo=" /></div>';
        element += '<div class="card-content text-center">';
        element += '<div class="col-md-8"><span>Cluster Distance</span> 0<input type="range" min="1" max="100" value="50" class="range-slide">100<span class="slide-span"></span></div>';
        element += '</div>';
        element += '</div>'; //card
        element += '</div>';
        // Second Tab
        // Third Tab
        element += '<div class="tell-summary" id="tell-summary' + chartId + '" style="display:none">';
        element += '<div class="card" id="accordian-summary' + chartId + '">';
        element += '<div class="card-header accordian-summary">';
        element += '<span style="margin:10px"><input type="radio" name="summary' + chartId + '" id="summary' + chartId + '"><label for="summary' + chartId + '"></label> Summary </span>';
        element += '<span style="margin:10px"><input type="radio" name="summary' + chartId + '" id="keyInsights' + chartId + '"><label for="keyInsights' + chartId + '"></label>Important things </span>';
        element += '<span style="margin:10px"><input type="radio" name="summary' + chartId + '" id="everything' + chartId + '"><label for="everything' + chartId + '"></label>Tell me everything </span>';
        element += '</div>';
        element += '<div class="card-content">';
        element += '<div class="ootb-text">This option could take slightly longer to generate but will provide the most complete narrative of your data with more verbosity and detail.</div> ';
        element += '</div>';
        element += '</div>'; //card
        element += '</div>';
        // Third Tab
        element += '<footer>';
        element += '<div class="col-md-2"><img class="copyright" src="' + apiEndpoint + 'arria/images/copyright.png"><p class="version">Version 2.1</p></div><div class="col-md-10 text-right"><button type="button" class="generate_btn">Generate Text</button></div>';
        element += '</footer>';
        element += '</div>';
        // Out Of Box Section End
        // Create Your Own Narrative Tab Section Start
        element += '<div class="narrative-tabsection" id="narrative-tabsection' + chartId + '" style="display:none">';
        element += '<div class="simple-slide">';
        element += '<span class="simple" id="simple' + chartId + '">Simple</span><label class="switch"><input type="checkbox" id="change-ui' + chartId + '" name="change-ui' + chartId + '"><span class="slider round"></span></label><span class="advance" id="advance' + chartId + '">Advanced</span>';
        element += '</div>';
        // Simple Mode
        element += '<div id="simple-mode' + chartId + '" style="display:block;" class="simple-mode">';
        element += '<div class="container-section">';
        element += '<div class="description-container">';
        element += '<p>Call your Arria NLG Studio project to create a narrative from selected data.</p>';
        element += '</div>';
        element += '<div class="col-md-12 source-container">';
        element += '<div>';
        element += '<input type="text" placeholder="Enter your published NLG Studio project URL" name="url" id="narratorUrl' + chartId + '">';
        element += '<input type="text" placeholder="API Key" name="apiUrl" id="authValue' + chartId + '" >';
        element += '</div>';
        element += '</div>';
        element += '<div class="col-md-12 studio-options">';
        element += '<div class="col-md-3">';
        element += '<p>Studio Project Type :</p>';
        element += '</div>';
        element += '<div class="col-md-9">';
        element += '<p><input type="radio" name="simpletype' + chartId + '" value="table" id="describe-table' + chartId + '" checked> <label for="describe-table' + chartId + '">Describe a Table</label></p><p><input type="radio" name="simpletype' + chartId + '" value="other" id="describe-json' + chartId + '"> <label for="describe-json' + chartId + '">Describe a JSON Object</label></p>'
        element += '</div>';
        element += '</div>';
        element += '<div class="col-md-12 edit-mapsection">';
        // Custom Script 
        element += '<div class="col-md-4 export">';
        element += '<div class="edit-map" id="custom-script' + chartId + '">';
        element += '<div class="col-md-12">';
        element += '<div class="col-md-12"><img src="' + apiEndpoint + 'arria/images/arrow_white.png" id="arrow-script' + chartId + '"><label>Edit Mapping Script</label></div>';
        element += '</div>';
        element += '</div>';
        element += '<textarea style="display:none;" id="simple-script' + chartId + '" class="scroll" placeholder="' + placeHolderString + '"></textarea>';
        element += '</div>';
        // View Data JSON
        element += '<div class="col-md-4 data-json">';
        element += '<div class="edit-map" id="data-json' + chartId + '">';
        element += '<div class="col-md-12">';
        element += '<div class="col-md-6 title"><img src="' + apiEndpoint + 'arria/images/arrow_white.png" id="arrow-json' + chartId + '" class="arrow"><label>View Dataset in JSON</label></div>';
        element += '<div class="col-md-6 text-right download-button"> <a style="display:none;" href="javascript:void(0);" id="download-csv' + chartId + '"><img src="' + apiEndpoint + 'arria/images/download_white.png">CSV</a><a style="display:none;" href="javascript:void(0);" id="download-json' + chartId + '"><img src="' + apiEndpoint + 'arria/images/download_white.png">JSON</a></div>';
        element += '</div>';
        element += '</div>';
        //JSON 
        element += '<div style="display:none;" class="export-container scroll" id="simple-jsonexport' + chartId + '" ></div>';
        element += '</div>';
        //Payload
        element += '<div class="col-md-4 csvload" id="simple-csv-payload' + chartId + '" style="display:none;">';
        element += '<div class="csv-payload edit-map" id="csv-payload' + chartId + '">';
        element += '<div class="col-md-12">';
        element += '<div class="col-md-12"><img src="' + apiEndpoint + 'arria/images/arrow_white.png" id="arrow-script' + chartId + '" class="arrow"><label>View CSV Payload</label></div>';
        element += '</div>';
        element += '</div>';
        element += '<div class="export-container scroll" style="display:none;" id="simple-csvpayload' + chartId + '" class="scroll"></div>';
        element += '</div>';
        //Payload
        element += '</div>';
        // Auto Increment Checkbox
        element += '<div class="col-md-12 simple-checkContainer" id="simple-checkContainer' + chartId + '" style="display:none;">';
        element += '<input type="checkbox" id="simple-autoincrement' + chartId + '" checked><label for="simple-autoincrement' + chartId + '">Add auto increment ID</label>';
        element += '</div>';
        // Auto Increment Checkbox
        element += '</div>';
        element += '</div>';
        //Simple Mode
        //Advance Mode
        element += '<div id="advance-mode' + chartId + '" style="display:none;" class="advance-mode">';
        element += '<div class="container-section">';
        element += '<div class="description-container">';
        element += '<p>Call your NLG service to create a narrative from selected data.</p>';
        element += '</div>';
        element += '<div class="col-md-12 source-container">';
        element += '<input type="text" placeholder="Enter NLG Service URL" name="url" id="narratorUrl_advance' + chartId + '">';
        // Dynamic Header
        element += '<div class="dynamic-header col-md-12">';
        element += '<div class="col-md-12 auth-header">';
        element += '<div class="col-md-4">';
        element += '<input type="text" placeholder="Key" id="nlg_authKey_0' + chartId + '" />';
        element += '</div>';
        element += '<div class="col-md-8">';
        element += '<input type="text" placeholder="Value" id="nlg_authValue_0' + chartId + '"/>';
        element += '</div>';
        element += '</div>';
        element += '<div class="append-container"></div>';
        // Dynamic Header
        element += '<a href="javascript:void(0)" class="addheader-btn"><img src="' + apiEndpoint + 'arria/images/add.png">Add Header</a>';
        element += '<a href="javascript:void(0)" class="removeheader-btn" style="display:none"><b>-</b>Remove Header</a>';
        element += '</div>';
        element += '</div>';
        element += '<div>';
        element += '<div class="col-md-12 studio-options">';
        element += '<div class="advance-slide">';
        element += '<div class="valign-wrapper"><div class="valign"><span class="simple">Studio Project</span><label class="switch"><input type="checkbox" id="studio-toggle' + chartId + '"  name="studio-toggle' + chartId + '"><span class="slider round"></span></label></div></div>';
        element += '<div id="studio-type' + chartId + '" style="display:none;" class="advance-studio studio-type">';
        element += '<div class="col-md-3">';
        element += '<p>Type :</p>';
        element += '</div>';
        element += '<div class="col-md-9">';
        element += '<p><input type="radio" name="advancetype' + chartId + '" value="other" id="advancedescribe-table' + chartId + '" checked> <label for="advancedescribe-table' + chartId + '">Describe a Table</label></p><p><input type="radio" name="advancetype' + chartId + '" value="other" id="advancedescribe-json' + chartId + '" checked> <label for="advancedescribe-json' + chartId + '">Describe a JSON Object</label></p>'
        element += '</div>';
        element += '</div>';
        element += '</div>';
        element += '</div>';
        element += '<div class="col-md-12 edit-mapsection">';
        // Custom Script 
        element += '<div class="col-md-4 export">';
        element += '<div class="edit-map" id="advancecustom-script' + chartId + '">';
        element += '<div class="col-md-12">';
        element += '<div class="col-md-12"><img src="' + apiEndpoint + 'arria/images/arrow_white.png" id="arrow-script' + chartId + '"><label>Edit Mapping Script</label> </div>';
        element += '</div>';
        element += '</div>';
        element += '<textarea style="display:none;" id="advance-script' + chartId + '" class="scroll" placeholder="' + placeHolderString + '"></textarea>';
        element += '</div>';
        // View Data JSON
        element += '<div class="col-md-4 data-json">';
        element += '<div class="edit-map" id="advancedata-json' + chartId + '">';
        element += '<div class="col-md-12">';
        element += '<div class="col-md-6 title"><img src="' + apiEndpoint + 'arria/images/arrow_white.png" id="arrow-json' + chartId + '" class="arrow"><label>View Dataset in JSON</label></div>';
        element += '<div class="col-md-6 text-right download-button"> <a style="display:none;" href="javascript:void(0);" id="advancedownload-csv' + chartId + '"><img src="' + apiEndpoint + 'arria/images/download_white.png">CSV</a><a style="display:none;" href="javascript:void(0);" id="advancedownload-json' + chartId + '"><img src="' + apiEndpoint + 'arria/images/download_white.png">JSON</a></div>';
        element += '</div>';
        element += '</div>';
        element += '<div style="display:none;" class="export-container scroll" id="advance-jsonexport' + chartId + '" ></div>';
        element += '</div>';
        //Payload
        element += '<div class="col-md-4 csvload" id="advance-csv-payload' + chartId + '" style="display:none;">';
        element += '<div class="csv-payload" id="advance-csvpayload' + chartId + '">';
        element += '<div class="col-md-12">';
        element += '<div class="col-md-12"><img src="' + apiEndpoint + 'arria/images/arrow_white.png" id="arrow-script' + chartId + '" class="arrow"><label>View CSV Payload<label></div>';
        element += '</div>';
        element += '</div>';
        element += '<div class="export-container scroll" style="display:none;" id="advance-csvload' + chartId + '" class="scroll"></div>';
        element += '</div>';
        //Payload
        element += '</div>';
        element += '</div>';
        // Auto Increment Checkbox
        element += '<div class="col-md-12 advance-checkContainer" id="advance-checkContainer' + chartId + '" style="display:none;">';
        element += '<input type="checkbox" id="advance-autoincrement' + chartId + '" checked><label for="advance-autoincrement' + chartId + '">Add auto increment ID</label>';
        element += '</div>';
        // Auto Increment Checkbox
        element += '</div>';
        // Insight URL
        element += '<div class="col-md-12 insight-container">';
        element += '<div class="insight-accordian"><div class="col-md-12"><img src="' + apiEndpoint + 'arria/images/arrow_white.png"><label>Insights URL</label></div></div>';
        element += '<div class="insight-content" style="display:none">';
        element += '<p>Call insight APIs (Arria or 3rd party) to pre-process data before narrative generation. Leave empty to skip the step.</p>';
        element += '<hr/>';
        element += '<input type="text" placeholder="Enter Insights URL" id="insightsURL' + chartId + '">';
        element += '<div class="dynamic-header col-md-12">';
        element += '<div class="col-md-12 auth-header">';
        element += '<div class="col-md-4">';
        element += '<input type="text" placeholder="Key" id="insights_authKey_0' + chartId + '"/>';
        element += '</div>';
        element += '<div class="col-md-8">';
        element += '<input type="text" placeholder="Value" id="insights_authValue_0' + chartId + '"/>';
        element += '</div>';
        element += '</div>';
        element += '<div class="append-container"></div>';
        element += '<a href="javascript:void(0)" class="addheader-btn"><img src="' + apiEndpoint + 'arria/images/add.png">Add Header</a>';
        element += '<a href="javascript:void(0)" class="removeheader-btn" style="display:none"><b>-</b>Remove Header</a>';
        element += '</div>';
        element += '</div>';
        element += '</div>';
        //Insight URL
        // Wrapper URL
        element += '<div class="col-md-12 wrapper-container">';
        element += '<div class="wrapper-accordian"><div class="col-md-12"> <img src="' + apiEndpoint + 'arria/images/arrow_white.png"><label>BI Integration Service URL</label></div></div>';
        element += '<div class="wrapper-content" style="display:none">';
        element += '<p>Set your BI integration service URL to override the default public service. Leave blank to use the default public service.</p>';
        element += '<hr/>';
        element += '<input type="text" placeholder="Enter BI Integration Service URL"  id="wrapperURL' + chartId + '">';
        element += '<div class="dynamic-header col-md-12">';
        element += '<div class="col-md-12 auth-header">';
        element += '<div class="col-md-4">';
        element += '<input type="text" placeholder="Key" id="wrapper_authKey_0' + chartId + '"/>';
        element += '</div>';
        element += '<div class="col-md-8">';
        element += '<input type="text" placeholder="Value" id="wrapper_authValue_0' + chartId + '"/>';
        element += '</div>';
        element += '</div>';
        element += '<div class="append-container"></div>';
        element += '<a href="javascript:void(0)" class="addheader-btn"><img src="' + apiEndpoint + 'arria/images/add.png">Add Header</a>';
        element += '<a href="javascript:void(0)" class="removeheader-btn" style="display:none"><b>-</b>Remove Header</a>';
        element += '</div>';
        element += '</div>';
        element += '</div>';
        //Wrapper URL
        element += '</div>';
        //Advance Mode
        element += '<footer>';
        element += '<div class="col-md-2"><img class="copyright" src="' + apiEndpoint + 'arria/images/copyright.png"><p class="version">Version 2.1</p></div><div class="col-md-10 text-right"><button type="button" class="openstudio_btn" id="openStudioBtn' + chartId + '" disabled>Open with Studio</button><button type="button" class="generate_btn"><img style="display:none" src="' + apiEndpoint + 'arria/images/loader.gif">Generate Text</button></div>';
        element += '</footer>';
        element += '</div>';
        // Narrative Section
        element += '<div class = "narrative-section" id="narrative-section' + chartId + '" style="display:none">';
        element += '<div class="col-md-12 drillDownLayout" id="drillDownLayout' + chartId + '"><a href="javascript:void(0);" class ="copy-clipboard" id="copy-clipboard' + chartId + '"><img src="' + apiEndpoint + 'arria/images/copy_paste_icon.png"></a><a href="javascript:void(0);" class="back-btn" id="back-btn' + chartId + '" ><img src="' + apiEndpoint + 'arria/images/setting.png"></a></div>';
        element += '<div class="narrative-container" id="narrative-container' + chartId + '"></div>';
        element += '<div id="toast" class="toast" style="display:none;">Copied to Clipboard </div>';
        element += '</div>';
        // Narrative Section
        element += '</section>';
        element += '<textarea id="jsbuilderoutput' + chartId + '" style="display:none"></textarea>';
        element += '<div class="hide disable" id="disable' + chartId + '" style="display:none;"></div>'
        element += '<div id="pageloader' + chartId + '" class="spin-loader" style="display:none;"><div class="loader"><div class="ball-scale-multiple"><div></div><div></div><div></div></div></div></div>';
        element += '<div class="modal" id="modal' + chartId + '" style="display:none;"><div class="modal-content"><br><br><p id="modaldata' + chartId + '"></p><br><button type="button" id="closemodal' + chartId + '">Close</button></div><div class="backdrop"></div></div>';
        element += '</div>';
        $element.append(element);
        var style = 'select,.dropdown{background: url("' + apiEndpoint + 'arria/images/arrow_downblack.png") no-repeat right #fff;} ';
        $("<style>").html(style).appendTo("head");
        var elementHeight;
        if ($("body").find("div[tid=" + chartId.split('_')[1] + "]").height() != undefined)
            elementHeight = parseInt($("body").find("div[tid=" + chartId.split('_')[1] + "]").height()) - 60;
        var elementWidth = $('#qlikContainer' + chartId).width();
        elementWidth = parseInt(elementWidth);
        if (elementHeight != undefined && elementHeight != NaN) {
            $('#qlikContainer' + chartId).css({
                'height': elementHeight + 'px'
            });

            $('#narrative-section' + chartId).css({
                height: elementHeight + 'px'
            });
        }

        /**
         * @methodOf: Initial Responsive
         * @description Set Responsive view for load extension
         * @returns 
         */
        var appendId = "qlikContainer" + chartId;
        if (elementWidth <= 840) {
            var style = "";
            var id = '#qlikContainer' + chartId + " ";
            style += '' + id + '.outofbox-tabsection .entity-selction p:first-child{text-align:left;margin-left:0px;}';
            $('<style id=responsive-840' + appendId + '>').html(style).appendTo("head");
        }
        if (elementWidth <= 765 && elementWidth >= 641) {
            var styleElement = "";
            var id = '#qlikContainer' + chartId + " ";
            styleElement += '' + id + '.measure-list span { display: block; text-align: center; margin-bottom: 8px; }';
            styleElement += '' + id + '.variance .col-md-4 label{display:block; margin-bottom: 8px;}';
            $('<style id=responsive-765' + appendId + '>').html(styleElement).appendTo("head");
        }
        if (elementWidth <= 760) {
            var styleElement = "";
            var id = '#qlikContainer' + chartId + " ";
            styleElement += '' + id + '.narrative-tabsection .auth-header .col-md-8, .narrative-tabsection .auth-header .col-md-4 { width: 100%; padding-right: 0px; padding-left: 0px; }';
            $('<style id=responsive-760' + appendId + '>').html(styleElement).appendTo("head");
        }
        if (elementWidth <= 640) {
            var styleElement = "";
            var id = '#qlikContainer' + chartId + " ";
            styleElement += '' + id + '.outofbox-tabsection .entity-selction p{margin-left:0px!important}';
            styleElement += '' + id + '.card-field .col-md-6{text-align:left!important}';
            styleElement += '' + id + '.tell-data .card-content .col-md-12:first-child .col-md-6,' + id + '.tell-data .card-content .col-md-12:first-child .col-md-6 p{margin-bottom:0px!important}';
            styleElement += '' + id + '.tell-data .card-content .col-md-6{width:100%!important;text-align:left!important}';
            styleElement += '' + id + '.measure-list .col-md-4{width:100%!important}';
            styleElement += '' + id + '.tell-data .card-content .col-md-12:first-child .col-md-6 p:last-child{margin-left:15%}';
            styleElement += '' + id + '.measure-list{margin-top:20px}';
            styleElement += '' + id + '.col-md-12.measure-list.text-center{text-align:left!important}';
            styleElement += '' + id + '.measure-list .col-md-4 select{width:62%!important}';
            styleElement += '' + id + '.measure-list .col-md-4 input{width:60%}';
            styleElement += '' + id + '.measure-list .col-md-4 span{width:30%;display:inline-block}';
            styleElement += '' + id + '.tell-what .col-md-6{width:100%!important}';
            styleElement += '' + id + '.outofbox-tabsection .stats .card-content .col-md-6:first-child{text-align:left!important}';
            styleElement += '' + id + '.targetbasedvariance .col-md-4 label{width:30%;display:inline-block}';
            styleElement += '' + id + '.targetbasedvariance .col-md-4{width:100%!important}';
            styleElement += '' + id + '.targetbasedvariance .col-md-4:nth-child(2) select{width:60%!important;margin-left:10px!important}';
            styleElement += '' + id + '.entity-selction p{width:100%!important}';
            styleElement += '' + id + '.timebasedvariance .col-md-4{width:100%!important}';
            styleElement += '' + id + '.variance .col-md-4 label{width:30%;display:inline-block}';
            styleElement += '' + id + '.multiple-range.col-md-8,' + id + ' .correlations .col-md-8{width:100%!important}';
            styleElement += '' + id + '.studio-options .col-md-3,' + id + ' .studio-options .col-md-9{display:block;width:100%!important}';
            styleElement += '' + id + '.studio-options .col-md-9 p:first-child{margin:0!important}';
            styleElement += '' + id + '.studio-options .col-md-9 p{display:block!important;margin:10px 0px !important;}';
            styleElement += '' + id + '.edit-mapsection{display:inline-block!important}';
            styleElement += '' + id + '.export,' + id + ' .data-json,' + id + ' .csvload{width:100%!important;margin-bottom:10px}';
            styleElement += '' + id + '.edit-mapsection .export,' + id + ' .edit-mapsection .data-json{float:none!important}';
            styleElement += '' + id + 'footer{text-align:center;position:relative;min-height:100px;margin-bottom:10px}';
            styleElement += '' + id + 'footer .col-md-2{width:100%!important;text-align:center;position:absolute;bottom:0;right:0;left:0}';
            styleElement += '' + id + 'footer .col-md-10.text-right{text-align:center!important;width:100%!important}';
            styleElement += '' + id + '.dynamic-header .auth-header .col-md-4{padding-right:0}';
            styleElement += '' + id + '.dynamic-header .col-md-4,' + id + ' .dynamic-header .col-md-8{width:100%!important}';
            styleElement += '' + id + '.studio-type{width:100%!important;position:relative;margin-top:15px;float:none}';
            styleElement += '' + id + '.studio-type .col-md-3{width:15%!important;float:left;text-align:right;margin-top:10px}';
            styleElement += '' + id + '.studio-type .col-md-9{width:69%!important;float:left;padding-left:25px}';
            styleElement += '' + id + '.studio-type .col-md-9 p{margin-bottom:10px!important}';
            styleElement += '#simple-mode' + chartId + ' .studio-options .col-md-3 p{margin-bottom:16px;}';
            styleElement += '' + id + '.edit-mapsection{padding-bottom: 0px;}';
            styleElement += '' + id + '.measure-list span{text-align:left;}';
            styleElement += '' + id + '.measure-list.text-left{text-align:left;}';
            styleElement += '' + id + 'div.distribution:last-child { display: block; margin-left: 52px !important; }';
            styleElement += '' + id + '.timebasedvariance, ' + id + '.targetbasedvariance{text-align:left !important;}';
            styleElement += '' + id + '.outofbox-tabsection .variance .col-md-4 select{width: 60%;padding: 5px;height:auto;}';
            styleElement += '' + id + '.outofbox-tabsection .entity-selction p:first-child{text-align:left;}';
            styleElement += '' + id + '.outofbox-tabsection .correlations .card-content .col-md-8:first-child p { float: none; display: block; text-align: left; }';
            styleElement += '' + id + '.outofbox-tabsection .correlations .card-content .col-md-8:first-child .measure-container{text-align:left;display: block;}';
            styleElement += '' + id + '.card .card-content .measure-list.text-center select{margin-left:12px !important}';
            styleElement += '' + id + '.multiple-range label { margin-top: 40px; }';
            $('<style id=responsive-640' + appendId + '>').html(styleElement).appendTo("head");
        }

        if (elementWidth <= 540) {
            var style = "";
            style += '' + id + '.tell-data .card-content .col-md-12:first-child .col-md-6 p:last-child{margin-left:10%}';
            style += '' + id + '#correlations' + chartId + ' .multiple-range label {margin-top: 40px;}';
            $('<style id=responsive-540' + appendId + '>').html(style).appendTo("head");
        }

        if (elementWidth <= 500) {
            var style = "";
            style += '' + id + '.multiple-range label{margin-top:40px}';
            style += '' + id + '.accordian-summary span { display: block; text-align: left; }';
            $('<style id=responsive-500' + appendId + '>').html(style).appendTo("head");
        }
        if (elementWidth <= 460) {
            var style = "";
            style += '' + id + '.outofbox-tabsection .distribution-container .distribution:first-child p:last-child { margin-left: 62px; }';
            style += '' + id + '.multiple-range label,' + id + '.multiple-range label input{width: 320px !important;}';
            style += '' + id + '.increase-container span { display: block; margin-bottom: 15px; }' + id + '.tell-data .card-content .col-md-6:last-child p { display: block; float: left; }' + id + '.card-content .col-md-6:last-child p.good-container { margin-left: 0px !important; }';
            style += '' + id + '.tab-header button { margin-top: 30px; }';
            style += '' + id + '.tab-header a{top:initial;transform: translateY(-0%);}';
            $('<style id=responsive-460' + appendId + '>').html(style).appendTo("head");
        }

        if (elementWidth <= 420) {
            var style = "";
            style += '' + id + '.studio-type .col-md-9{width:60%!important}' + id + '.studio-type .col-md-3{width:24 %!important}';
            style += '' + id + '.multiple-range label,' + id + ' .multiple-range label input{width: 260px !important;}';
            $('<style id=responsive-420' + appendId + '>').html(style).appendTo("head");
        }


        if (elementWidth <= 400) {
            var style = "";
            style += '' + id + 'header .tab-header button{padding: 8px 2px !important;font-size:12px !important;}';
            $('<style id=responsive-400' + appendId + '>').html(style).appendTo("head");
        }

        if (elementWidth <= 340) {
            var style = "";
            style += '' + id + '.openstudio_btn{margin: 7px 5px 10px 0px;padding: 4px 10px;font-size: 12px;}';
            style += '' + id + '.generate_btn{margin: 7px 0;padding: 4px 10px; font-size: 12px;}';
            $('<style id=responsive-340' + appendId + '>').html(style).appendTo("head");
        }

    }

    /**
     * @methodOf: Common Function
     * @description Qlik Sense Common Function initialize Extension properties
     * @returns 
     */
    return {
        //initialize hypercube - selections are applied to a hypercube, only the selected values are displayed.
        initialProperties: {
            qHyperCubeDef: {
                qDimensions: [],
                qMeasures: [],
                qInitialDataFetch: [{
                    qWidth: 10,
                    qHeight: 1000
                }]
            }
        },
        //properties to be displayed in side appearance panel - this is used to persist the url and header name
        //when the sheet is closed
        definition: {
            type: 'items',
            component: 'accordion',
            items: {
                dimensions: {
                    uses: 'dimensions',
                    min: 1
                },
                measures: {
                    uses: 'measures',
                    min: 1
                },
                appearancePanel: {
                    uses: "settings",
                    items: {
                        url: {
                            ref: "url",
                            type: "string",
                            label: "Url",
                            defaultValue: "",
                            show: false
                        },
                        auth: {
                            ref: "headerKey",
                            type: "string",
                            label: "Header Key",
                            defaultValue: "",
                            show: false
                        },
                        key: {
                            ref: "authKey",
                            type: "string",
                            label: "Auth Key",
                            defaultValue: "",
                            show: false
                        },
                        state: {
                            ref: "state",
                            type: "text",
                            label: "Narrator State",
                            defaultValue: "",
                            show: false
                        },
                        narrator: {
                            ref: "narrator",
                            type: "string",
                            label: "Narrator Text",
                            defaultValue: "",
                            show: false
                        },
                        script: {
                            ref: "script",
                            type: "string",
                            label: "Script",
                            defaultValue: "",
                            show: false
                        },
                        drillDown0: {
                            type: "items",
                            label: "Drill down filter 1",
                            items: {
                                drillDownFilterKey0: {
                                    ref: "drillDownFilterKey0",
                                    type: "string",
                                    label: "Key",
                                    defaultValue: "",
                                    show: true
                                },
                                drillDownFilterLbl0: {
                                    ref: "drillDownFilterLbl0",
                                    type: "string",
                                    label: "Label",
                                    defaultValue: "",
                                    show: true
                                },
                                drillDownFilterVal0: {
                                    ref: "drillDownFilterVal0",
                                    type: "string",
                                    label: "Drill Down Fields",
                                    defaultValue: "",
                                    show: true
                                }
                            }
                        },
                        drillDown1: {
                            type: "items",
                            label: "Drill down filter 2",
                            items: {
                                drillDownFilterKey1: {
                                    ref: "drillDownFilterKey1",
                                    type: "string",
                                    label: "Key",
                                    defaultValue: "",
                                    show: true
                                },
                                drillDownFilterLbl1: {
                                    ref: "drillDownFilterLbl1",
                                    type: "string",
                                    label: "Label",
                                    defaultValue: "",
                                    show: true
                                },
                                drillDownFilterVal1: {
                                    ref: "drillDownFilterVal1",
                                    type: "string",
                                    label: "Drill Down Fields",
                                    defaultValue: "",
                                    show: true
                                }
                            }
                        },
                        drillDown2: {
                            type: "items",
                            label: "Drill down filter 3",
                            items: {
                                drillDownFilterKey2: {
                                    ref: "drillDownFilterKey2",
                                    type: "string",
                                    label: "Key",
                                    defaultValue: "",
                                    show: true
                                },
                                drillDownFilterLbl2: {
                                    ref: "drillDownFilterLbl2",
                                    type: "string",
                                    label: "Label",
                                    defaultValue: "",
                                    show: true
                                },
                                drillDownFilterVal2: {
                                    ref: "drillDownFilterVal2",
                                    type: "string",
                                    label: "Drill Down Fields",
                                    defaultValue: "",
                                    show: true
                                }
                            }
                        },
                        drillDown3: {
                            type: "items",
                            label: "Drill down filter 4",
                            items: {
                                drillDownFilterKey3: {
                                    ref: "drillDownFilterKey3",
                                    type: "string",
                                    label: "Key",
                                    defaultValue: "",
                                    show: true
                                },
                                drillDownFilterLbl3: {
                                    ref: "drillDownFilterLbl3",
                                    type: "string",
                                    label: "Label",
                                    defaultValue: "",
                                    show: true
                                },
                                drillDownFilterVal3: {
                                    ref: "drillDownFilterVal3",
                                    type: "string",
                                    label: "Drill Down Fields",
                                    defaultValue: "",
                                    show: true
                                }
                            }
                        },
                        fontSize: {
                            type: "items",
                            label: "Formatting Options",
                            items: {
                                narrativeFontSize: {
                                    ref: "narrativeFontSize",
                                    type: "number",
                                    component: "slider",
                                    min: 10,
                                    max: 36,
                                    step: 1,
                                    defaultValue: 13,
                                    label: "Text Size (10px - 36px)",
                                    show: true
                                }
                            }
                        },
                        drillDownValue: {
                            ref: "drillDownValue",
                            type: "string",
                            label: "Drill Down",
                            defaultValue: "",
                            show: false
                        }
                    }
                }
            }
        },
        support: {
            export: true
        },

        /**
         * @methodOf: Paint
         * @description QlikSense Common Function
         * @returns 
         */
        paint: function ($element, layout) {

            /**
             * @methodOf: initialize extension variables
             * @description The function to Initialize extension variables
             * @returns 
             */
            var _this = this;
            let describeTbl = false;
            let targetElement = "generatorView";
            let targetView = "ootb";
            let csvData = "";
            let csv_columnData = [];
            let csv_rowData = [];
            var dataModel = {};
            let presistData = {};
            let nlgHeaderDynamicElCount = 0;
            let insightsHeaderDynamicElCount = 0;
            let wrapperHeaderDynamicElCount = 0;
            let insights_service_headers = {};
            let wrapper_service_headers = {};
            let nlg_service_headers = {};
            var studioProjectEnabledFlg = false;
            let drillDownFilterCount = 4;
            let measureColumn = [];
            let dimensionCharacterization = [];
            var ootbColumns = [];
            var analysisArray = "";
            var ootbModel = {
                "narrativeConfigMetaData": {
                    "characterization": "",
                    "analysisOrchestration": "",
                    "generation": ""
                }
            };
            let generateBtnClicked = false;
            var analysisMetadata;
            var presistOOTBLoad = false;
            var measureFields = [];
            var fontSize = layout.narrativeFontSize;
            if (fontSize < 10 || fontSize > 36) {
                layout.narrativeFontSize = 13;
                fontSize = 13;
            }
            // code logic to transform qlik sense data in to generic input data format -- start
            var hypercube = layout.qHyperCube;
            var columnsArr = [];
            var rowsArr = [];
            var measuresList = [];
            var dataPages = [];
            var columns = hypercube.qSize.qcx;
            var totalRowCount = hypercube.qSize.qcy;
            var pageRowCount = Math.floor(10000 / columns);
            var initialRow = 0;
            csv_columnData = [];
            csv_columnData.push("_ID");

            /**
             * @methodOf: Get Column Data
             * @description Get Column Data from Qliksense
             * @returns 
             */
            hypercube.qDimensionInfo.forEach(function (value) {
                columnsArr.push(value.qFallbackTitle);
                csv_columnData.push(value.qFallbackTitle);
            });


            /**
             * @methodOf: Fetch Measure Data
             * @description Fetch Measure Data from Qliksense
             * @returns 
             */

            let measureInfo = this.backendApi.getMeasureInfos();
            for (let index = 0; index < measureInfo.length; index++) {
                let measureName = measureInfo[index].qFallbackTitle;
                if (measureName.indexOf("(") !== -1) {
                    measuresList.push(measureName);
                    let columnData = measureName.split("(")[1].split(")")[0];
                    columnsArr.push(columnData);
                    csv_columnData.push(columnData);
                } else {
                    columnsArr.push(measureName);
                    measuresList.push(`Sum(${measureName})`);
                    csv_columnData.push(measureName);
                }
                let chartId = "_" + layout.qInfo.qId;
                if (measureInfo.length - 1 === index) {
                    columnsArr = columnsArr.filter((column, index) => columnsArr.indexOf(column) === index);
                    csv_columnData = csv_columnData.filter((column, index) => csv_columnData.indexOf(column) === index);
                    getDataSet(chartId);
                }

            }

            /**
             * @methodOf: GetData JSON
             * @description Get Data JSON from Qliksense
             * @returns 
             */
            function getDataSet(chartId) {
                var requestPage = [{
                    qTop: 0,
                    qLeft: 0,
                    qWidth: columns, //should be # of columns
                    qHeight: Math.min(pageRowCount, totalRowCount - initialRow)
                }];

                _this.backendApi.getData(requestPage).then(function (dataSets) {
                    dataPages = dataPages.concat(dataSets[0].qMatrix)
                    initialRow += dataSets[0].qMatrix.length;
                    if (initialRow < totalRowCount && initialRow <= 30000)
                        getDataSet(chartId);
                    else {
                        try {
                            //format data to be stored in rows and columns to achieve generic data format
                            dataPages.forEach(function (cell, index) {
                                var tmpArr = [];
                                for (var x = 0; x < cell.length; x++) {
                                    var val = '';
                                    if (cell[x].qText != undefined) {
                                        val = cell[x].qText;
                                        if (val == "-") val = null;
                                    }
                                    tmpArr.push(val);
                                }
                                rowsArr.push(tmpArr);
                                let dataArr = [];
                                // csv_rowData=[];
                                dataArr = dataArr.concat(tmpArr);
                                dataArr.splice(0, 0, index + 1);
                                csv_rowData.push(dataArr);
                            });
                        } catch (err) {
                            console.log(err);
                        }
                        dataModel["_id"] = "1";
                        dataModel["version"] = "2.1.0";
                        dataModel["chartType"] = "table";
                        dataModel['source'] = 'qliksense';
                        dataModel['targetApp'] = '';
                        dataModel['nlgApp'] = '';
                        dataModel['dataset'] = [];
                        var colObj = {};
                        colObj['metadata'] = {}; // meta
                        colObj['drillDowns'] = [];
                        colObj["measures"] = measuresList;
                        colObj['column_names'] = columnsArr;
                        colObj['data'] = rowsArr;

                        dataModel['dataset'].push(colObj);
                        //logic to set debounce to true or false if selection varies -- start  
                        //if true post data to wrapper api
                        var chartInfo = chartId;
                        let stringifiedRow = JSON.stringify(rowsArr);
                        if (selColstrack[chartInfo] == undefined) {
                            selColstrack[chartInfo] = "";
                        }
                        if (stringifiedRow != selColstrack[chartInfo]) {
                            debounce = true;
                            selColstrack[chartInfo] = stringifiedRow;
                            presistOOTBLoad = false;
                        } else {
                            presistOOTBLoad = true;
                            debounce = false;
                        }
                        let csvArr_Data = [];
                        csvArr_Data = csvArr_Data.concat(csv_rowData);
                        csvArr_Data.splice(0, 0, csv_columnData);
                        csvData = convertToCSV(csvArr_Data);
                        for (var i = 0; i < columnsArr.length; i++) {
                            var exitKey = ootbColumns.some(function (el) {
                                return el.name === columnsArr[i];
                            });
                            if (!exitKey) {
                                ootbColumns.push({
                                    "name": columnsArr[i],
                                    "measure": false,
                                });
                                for (var measureIndex = 0; measureIndex < measuresList.length; measureIndex++) {
                                    if (measuresList[measureIndex].indexOf(columnsArr[i]) != -1) {
                                        ootbColumns[ootbColumns.length - 1]['measure'] = true;
                                    }
                                }

                            }

                        }


                        //qlik api call to dynamically get currently selected chart object to get qId
                        _this.backendApi.getProperties().then(function (res) {
                            var chartId = "_" + res.qInfo.qId;
                            var chartObj = res;

                            if ($("#qlikContainer" + chartId).length == 0) {
                                _this['columns' + chartId + ''] = [];
                                _this['initializeOOTBMetadata'] = true;
                                //dynamically create and append HTML elements based on chartId
                                createNarrativeUI(chartId, $element, chartObj);
                            }



                            /**
                             * @methodOf: Initialize Local Variables
                             * @description Initialize Local Variables
                             * @returns 
                             */
                            let containerElement = document.getElementById('qlikContainer' + chartId);
                            let documentBtn = document.getElementById('documentBtn' + chartId);
                            let tabBoxElement = document.getElementById('box-tab' + chartId);
                            let tabNarrativeElement = document.getElementById('narrative-tab' + chartId);
                            let outofTabElement = document.getElementById('outofbox-tabsection' + chartId);
                            let narrativeTabElement = document.getElementById('narrative-tabsection' + chartId);
                            let datasetJsonElement = document.getElementById('data-json' + chartId);
                            let customScriptElement = document.getElementById('custom-script' + chartId);
                            let scriptInputSimpleElement = document.getElementById('simple-script' + chartId);
                            let customScriptAppendElement = document.getElementById('jsbuilderoutput' + chartId);
                            let simpleExport = document.getElementById('simple-jsonexport' + chartId);
                            let simpleTableBtn = document.getElementById('describe-table' + chartId);
                            let simpleExportBtn = document.getElementById('describe-json' + chartId);
                            let downloadJsonBtn = document.getElementById('download-json' + chartId);
                            let downloadCsvBtn = document.getElementById('download-csv' + chartId);
                            let checkSliderBtn = document.getElementById('change-ui' + chartId);
                            let simpleUiContainer = document.getElementById('simple-mode' + chartId);
                            let advanceUiContainer = document.getElementById('advance-mode' + chartId);
                            let simpleText = document.getElementById('simple' + chartId);
                            let advanceText = document.getElementById('advance' + chartId);
                            let narrativeSection = document.getElementById('narrative-section' + chartId);
                            let narrativeContainer = document.getElementById('narrative-container' + chartId);
                            let cogWheel = document.getElementById('back-btn' + chartId);
                            let generateSimpleNarrative = document.querySelector('#narrative-tabsection' + chartId + ' .generate_btn');
                            let narratorUrl = document.getElementById('narratorUrl' + chartId);
                            let narratorUrl_advance = document.getElementById('narratorUrl_advance' + chartId);
                            let openStudioBtn = document.getElementById('openStudioBtn' + chartId);
                            let authValueElement = document.getElementById('authValue' + chartId);
                            let closeModalBtn = document.getElementById('closemodal' + chartId);
                            let simpleCSVPayloadDiv = document.getElementById("simple-csv-payload" + chartId);
                            let simpleCSVPayload = document.getElementById('csv-payload' + chartId);
                            let simpleCSVContainer = document.getElementById('simple-csvpayload' + chartId);
                            // Advance UI
                            let insightAccordianBtn = document.querySelector('#advance-mode' + chartId + ' .insight-accordian');
                            let insightAccordian = document.querySelector('#advance-mode' + chartId + ' .insight-content');
                            let wrapperAccordianBtn = document.querySelector('#advance-mode' + chartId + ' .wrapper-accordian');
                            let wrapperAccordian = document.querySelector('#advance-mode' + chartId + ' .wrapper-content');
                            let addDynamicHeaderBtn = document.querySelector('#advance-mode' + chartId + ' .source-container .addheader-btn');
                            let addInsightHeaderBtn = document.querySelector('#advance-mode' + chartId + ' .insight-container .addheader-btn');
                            let addWrapperHeaderBtn = document.querySelector('#advance-mode' + chartId + ' .wrapper-container .addheader-btn');
                            let advanceTableBtn = document.getElementById('advancedescribe-table' + chartId);
                            let advanceExportBtn = document.getElementById('advancedescribe-json' + chartId);
                            let advancedownloadJsonBtn = document.getElementById('advancedownload-json' + chartId);
                            let advancedownloadCsvBtn = document.getElementById('advancedownload-csv' + chartId);
                            let advanceDatasetJsonElement = document.getElementById('advancedata-json' + chartId);
                            let advanceCustomScriptElement = document.getElementById('advancecustom-script' + chartId);
                            let advanceScriptInputSimpleElement = document.getElementById('advance-script' + chartId);
                            let advanceExport = document.getElementById('advance-jsonexport' + chartId);
                            let removeDynamicHeaderBtn = document.querySelector('#advance-mode' + chartId + ' .source-container .removeheader-btn');
                            let removeInsightHeaderBtn = document.querySelector('#advance-mode' + chartId + ' .insight-container .removeheader-btn');
                            let removeWrapperHeaderBtn = document.querySelector('#advance-mode' + chartId + ' .wrapper-container .removeheader-btn');
                            let spinner = document.querySelector('#narrative-tabsection' + chartId + ' .generate_btn img');
                            let insightsURL = document.getElementById("insightsURL" + chartId);
                            let wrapperURL = document.getElementById("wrapperURL" + chartId);
                            let headerSection = document.getElementById('header' + chartId);
                            let pageloader = document.getElementById('pageloader' + chartId);
                            let drillDownLayout = document.getElementById("drillDownLayout" + chartId);
                            let advanceCSVPayloadDiv = document.getElementById("advance-csv-payload" + chartId);
                            let advanceCSVPayload = document.getElementById('advance-csvpayload' + chartId);
                            let advanceCSVContainer = document.getElementById('advance-csvload' + chartId);
                            //Out Box UI
                            let tellmedataContainer = document.getElementById('tell-data' + chartId);
                            let prevoiusBtn = document.querySelector('#outofbox-tabsection' + chartId + ' .previous');
                            let nextBtn = document.querySelector('#outofbox-tabsection' + chartId + ' .next');
                            let tellWhatContainer = document.getElementById('tell-what' + chartId);
                            let tellSummaryContainer = document.getElementById('tell-summary' + chartId);
                            let sliderContent = document.querySelector('#outofbox-tabsection' + chartId + ' .header p');
                            let slideDotOne = document.getElementById('slide1' + chartId);
                            let slideDotTwo = document.getElementById('slide2' + chartId);
                            let slideDotThree = document.getElementById('slide3' + chartId);
                            let rangeSlideElement = document.getElementsByClassName('range-slide');
                            let slideSpan = document.getElementsByClassName('slide-span');
                            let ootb_generateBtn = document.querySelector('#outofbox-tabsection' + chartId + ' button.generate_btn');
                            let advance_studio_toggle = document.getElementById("studio-toggle" + chartId);
                            let advance_studio_type = document.getElementById("studio-type" + chartId);
                            let summaryCheckBtn = document.getElementById('summary' + chartId);
                            let keyInsightsCheckBtn = document.getElementById('keyInsights' + chartId);
                            let everythingCheckBtn = document.getElementById('everything' + chartId);
                            let simpleCheckboxContainer = document.getElementById('simple-checkContainer' + chartId);
                            let simpleIncrementBtn = document.getElementById('simple-autoincrement' + chartId);
                            let advanceCheckboxContainer = document.getElementById('advance-checkContainer' + chartId);
                            let advanceIncrementBtn = document.getElementById('advance-autoincrement' + chartId);
                            let disableContainer = document.getElementById("disable" + chartId);
                            let copyClipboardBtn = document.getElementById('copy-clipboard' + chartId);
                            var elementHeight = parseInt($(".qv-gridcell.active").height()) - 60;
                            if (elementHeight !== undefined && elementHeight != NaN) {
                                $('#qlikContainer' + chartId).css({
                                    'height': elementHeight + 'px'
                                });
                            }
                            if (_this['callNarration' + chartId] === undefined)
                                _this['callNarration' + chartId] = false;
                            narrativeContainer.style.fontSize = fontSize + 'px';
                            var currentMode = qlik.navigation.getMode();
                            if (currentMode === "analysis")
                                cogWheel.style.display = "none";
                            else
                                cogWheel.style.display = "block";
                            initialViewVisibility();
                            disableEditMode();

                            let drillDownUserData = getDrillDownUserInputData(layout) || {};
                            let drillDownDataKeys = Object.keys(drillDownUserData);
                            var drillDownCount = drillDownDataKeys.length;
                            var drillDownWidth = 100 / drillDownCount;
                            fetchDrillDownData(layout);
                            setPresistedDataToDD();
                            setPresistedData_View();
                            if (debounce) {
                                try {
                                    dynamicColumn();
                                } catch (e) {
                                    console.log(e);
                                }
                            }


                            showData();

                            window.addEventListener('offline', function (event) {

                                showModal("You are offline. Please check that you are connected to the Internet", chartId);
                            });

                            /**
                             * @methodOf: OOTB Dynamic Column
                             * @description The function to Generate Column Based on User Selection
                             * @returns 
                             */
                            function dynamicColumn() {
                                var columns = [];
                                unSelectCoumn();

                                if (presistData['columns'] != undefined && _this['columns' + chartId + ''].length == 0) {
                                    if (presistData['columns'] != "[]") {
                                        _this['columns' + chartId + ''] = JSON.parse(presistData['columns']);
                                        window.sessionStorage.setItem('columns' + chartId + '', presistData['columns']);
                                        presistData['columns'] = undefined;
                                    }
                                }

                                if (_this['columns' + chartId + ''].length != 0) {
                                    columns = _this['columns' + chartId + ''];
                                    for (var i = 0; i < ootbColumns.length; i++) {
                                        var existKey = columns.some(function (object) {
                                            return object.name == ootbColumns[i].name;
                                        });
                                        if (!existKey) {
                                            columns.push(ootbColumns[i]);
                                        }
                                    }
                                } else if (window.sessionStorage.getItem('columns' + chartId + '') != null || window.sessionStorage.getItem('columns' + chartId + '') != undefined && window.sessionStorage.getItem('columns' + chartId + '') != "[]") {
                                    if (window.sessionStorage.getItem('columns' + chartId + '') != "[]") {
                                        _this['columns' + chartId + ''] = JSON.parse(window.sessionStorage.getItem('columns' + chartId + ''));
                                        columns = _this['columns' + chartId + ''];
                                    } else {
                                        columns = ootbColumns;
                                    }
                                } else {
                                    columns = ootbColumns;
                                }
                                _this['columns' + chartId + ''] = columns;
                                for (let index = 0; index < columns.length; index++) {
                                    let column = columns[index].name;
                                    let className = columns[index].name.replace(/\s/g, '');
                                    className = className + chartId;
                                    let existingElement = document.getElementById(className);
                                    if (existingElement == null || existingElement == undefined) {
                                        let divElement = document.createElement('div');
                                        divElement.setAttribute('class', 'card active');
                                        divElement.setAttribute('id', className);
                                        divElement.setAttribute('data-id', index);
                                        divElement.setAttribute('draggable', "true");
                                        divElement.setAttribute('data-attr', columns[index].name);
                                        let dynamicElement = "";
                                        let measureElement = "";
                                        let dimensonAttribute = "";
                                        let measureElementContainer = "";
                                        if (columns[index].measure) {
                                            dimensonAttribute += '<div class="col-md-12 text-center" id="dimension-wrapper' + index + chartId + '">';
                                            dimensonAttribute += '<div class="col-md-6 text-center dimension-section"><p><input type="radio" name="dimension' + index + chartId + '" id="dimension' + index + chartId + '" data-input=' + index + '> <label for="dimension' + index + chartId + '">Dimension</label></p><p><input type="radio" name="measure' + index + chartId + '" id="measure' + index + chartId + '" data-input=' + index + '> <label for="measure' + index + chartId + '">Measure</label></p></div>';
                                            dimensonAttribute += '</div>';
                                            measureElement += '<div class="col-md-4"><span>Alias</span> <input type="text" name="alias' + index + chartId + '" placeholder="US"/></div><div class="col-md-4" id="entitycontainer' + index + chartId + '" style="display:inline-block"><span>Entity Type</span> </div><div class="col-md-4" id="measure-container' + index + chartId + '" style="display:inline-block"><span>Unit</span> <input type="text" name="unit' + index + chartId + '" placeholder="USD"/></div>';
                                            measureElementContainer += '<div class="col-md-6 increase-container text-center" id="increase-container' + index + chartId + '" style="display:inline-block;"><span>Increase in Value is:</span><p class="good-container"><input type="radio" name="measure-selection' + index + chartId + '" id="good' + index + chartId + '" checked> <label for="good' + index + chartId + '">Good</label></p><p class="neutral-container"><input type="radio" name="measure-selection' + index + chartId + '" id="neutral' + index + chartId + '"> <label for="neutral' + index + chartId + '">Neutral</label></p><p class="bad-container"><input type="radio" name="measure-selection' + index + chartId + '" id="bad' + index + chartId + '"> <label for="bad' + index + chartId + '">Bad</label></p></div>';
                                        } else {
                                            dimensonAttribute += '<div class="col-md-12 text-center" id="dimension-wrapper' + index + chartId + '">';
                                            dimensonAttribute += '<div class="col-md-6 text-center dimension-section" style="width:100%;"><p><input type="radio" name="dimension' + index + chartId + '" id="dimension' + index + chartId + '" data-input=' + index + '> <label for="dimension' + index + chartId + '">Dimension</label></p><p><input type="radio" name="measure' + index + chartId + '" id="measure' + index + chartId + '" data-input=' + index + '> <label for="measure' + index + chartId + '">Measure</label></p></div>';
                                            dimensonAttribute += '</div>';
                                            measureElement += '<div class="col-md-4"><span>Alias</span> <input type="text" name="alias' + index + chartId + '" placeholder="US"/></div><div class="col-md-4"  id="entitycontainer' + index + chartId + '" style="display:inline-block"><span>Entity Type</span></div><div class="col-md-4" id="measure-container' + index + chartId + '" style="display:none"><span>Unit</span> <input type="text" name="unit' + index + chartId + '" placeholder="USD"/></div>';
                                            measureElementContainer += '<div class="col-md-6 increase-container text-center" id="increase-container' + index + chartId + '" style="display:none"><span>Increase in Value is:</span><p class="good-container"><input type="radio" name="measure-selection' + index + chartId + '" id="good' + index + chartId + '" checked> <label for="good' + index + chartId + '">Good</label></p><p class="neutral-container"><input type="radio" name="measure-selection' + index + chartId + '" id="neutral' + index + chartId + '"> <label for="neutral' + index + chartId + '">Neutral</label></p><p class="bad-container"><input type="radio" name="measure-selection' + index + chartId + '" id="bad' + index + chartId + '"> <label for="bad' + index + chartId + '">Bad</label></p></div>';
                                        }
                                        dynamicElement += '<div class="card-header ' + className + '" id="header' + className + '"><div class="drag-holder" style="background-image:url(' + apiEndpoint + 'arria/images/drag.png)"></div>' + column + ' <img class="card-toggle ' + className + '" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDI4NC45MjkgMjg0LjkyOSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjg0LjkyOSAyODQuOTI5OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPHBhdGggZD0iTTI4Mi4wODIsNzYuNTExbC0xNC4yNzQtMTQuMjczYy0xLjkwMi0xLjkwNi00LjA5My0yLjg1Ni02LjU3LTIuODU2Yy0yLjQ3MSwwLTQuNjYxLDAuOTUtNi41NjMsMi44NTZMMTQyLjQ2NiwxNzQuNDQxICAgTDMwLjI2Miw2Mi4yNDFjLTEuOTAzLTEuOTA2LTQuMDkzLTIuODU2LTYuNTY3LTIuODU2Yy0yLjQ3NSwwLTQuNjY1LDAuOTUtNi41NjcsMi44NTZMMi44NTYsNzYuNTE1QzAuOTUsNzguNDE3LDAsODAuNjA3LDAsODMuMDgyICAgYzAsMi40NzMsMC45NTMsNC42NjMsMi44NTYsNi41NjVsMTMzLjA0MywxMzMuMDQ2YzEuOTAyLDEuOTAzLDQuMDkzLDIuODU0LDYuNTY3LDIuODU0czQuNjYxLTAuOTUxLDYuNTYyLTIuODU0TDI4Mi4wODIsODkuNjQ3ICAgYzEuOTAyLTEuOTAzLDIuODQ3LTQuMDkzLDIuODQ3LTYuNTY1QzI4NC45MjksODAuNjA3LDI4My45ODQsNzguNDE3LDI4Mi4wODIsNzYuNTExeiIgZmlsbD0iIzk4OTg5OCIvPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo="/></div>';
                                        dynamicElement += '<div class="card-content" id="content' + index + chartId + '">';
                                        dynamicElement += dimensonAttribute;
                                        dynamicElement += '<div class="col-md-12 measure-list">';
                                        dynamicElement += measureElement;

                                        dynamicElement += '</div>';
                                        dynamicElement += measureElementContainer;
                                        dynamicElement += '</div>';
                                        divElement.innerHTML = dynamicElement;
                                        tellmedataContainer.appendChild(divElement);
                                        let alias = document.querySelector('input[name="alias' + index + chartId + '"');
                                        alias.value = column;
                                        let getDimensionEvent = document.getElementById('dimension' + index + chartId);
                                        getDimensionEvent.addEventListener('change', dimensionEvent);
                                        let getMeasureElement = document.getElementById('measure' + index + chartId);
                                        getMeasureElement.addEventListener('change', measureEvent);
                                        let elementCollection = document.getElementsByClassName('measure-list');
                                        if (columns[index].measure) {
                                            getMeasureElement.checked = true;
                                            elementCollection[index].classList.add('text-left');
                                        } else {
                                            getDimensionEvent.checked = true;
                                            elementCollection[index].classList.add('text-center');
                                        }


                                        if (document.getElementById('select-entity' + index + chartId) == null || document.getElementById('select-entity' + index + chartId) == undefined) {
                                            let selectElement = document.createElement('select');
                                            selectElement.setAttribute('name', 'entity' + index + chartId);
                                            selectElement.setAttribute('id', 'select-entity' + index + chartId);
                                            document.getElementById('entitycontainer' + index + chartId).appendChild(selectElement);
                                            let option = document.createElement('option');
                                            option.text = "Select";
                                            option.value = "";
                                            option.selected = true;
                                            document.getElementById('select-entity' + index + chartId + '').appendChild(option);
                                            let entityMetaData = [];
                                            if (columns[index].measure) {
                                                entityMetaData = measureEntityType;
                                            } else {
                                                entityMetaData = entityType;
                                            }
                                            if (entityMetaData['entityTypes'].length > 0) {
                                                for (let entityIndex = 0; entityIndex < entityMetaData['entityTypes'].length; entityIndex++) {
                                                    let optionElement = document.createElement('option');
                                                    optionElement.text = entityMetaData['entityTypes'][entityIndex];
                                                    optionElement.value = entityMetaData['entityTypes'][entityIndex];
                                                    document.getElementById('select-entity' + index + chartId).appendChild(optionElement);
                                                }
                                            } else {
                                                if (columns.length - 1 == index)
                                                    callEntityTypes();
                                            }
                                        }
                                        let nondraggableColumn = document.getElementById('nondraggable' + chartId);
                                        if (nondraggableColumn != null || nondraggableColumn != undefined) {
                                            nondraggableColumn.parentNode.removeChild(nondraggableColumn);
                                        }

                                        if (columns.length - 1 == index) {
                                            let lastEmptyElement = document.createElement('div');
                                            lastEmptyElement.setAttribute('id', 'nondraggable' + chartId);
                                            lastEmptyElement.setAttribute('draggable', 'true');
                                            lastEmptyElement.setAttribute('class', 'card nondraggable');
                                            lastEmptyElement.setAttribute('data-attr', 'nondraggable');
                                            tellmedataContainer.appendChild(lastEmptyElement);
                                        }
                                    } else {
                                        if (!presistOOTBLoad) {
                                            let dataAttr = existingElement.getAttribute('data-attr');
                                            let dataid = existingElement.getAttribute('data-id');
                                            if (dataAttr == columns[index].name) {
                                                if (index != parseInt(dataid)) {
                                                    let content = document.getElementById('content' + dataid + chartId);
                                                    existingElement.setAttribute('data-id', index);
                                                    content.setAttribute('id', 'content' + index + chartId);
                                                    let dimensionWrapper = document.getElementById('dimension-wrapper' + dataid + chartId);
                                                    dimensionWrapper.setAttribute('id', 'dimension-wrapper' + index + chartId);
                                                    let dimension = document.getElementById('dimension' + dataid + chartId);
                                                    dimension.setAttribute('id', 'dimension' + index + chartId);
                                                    dimension.setAttribute('name', 'dimension' + index + chartId);
                                                    dimension.setAttribute('data-input', index);
                                                    let dimensioLabel = document.querySelector('label[for="dimension' + dataid + chartId + '"');
                                                    dimensioLabel.setAttribute('for', 'dimension' + index + chartId);
                                                    let measure = document.getElementById('measure' + dataid + chartId);
                                                    measure.setAttribute('id', 'measure' + index + chartId);
                                                    measure.setAttribute('name', 'measure' + index + chartId);
                                                    measure.setAttribute('data-input', index);
                                                    let measureLabel = document.querySelector('label[for="measure' + dataid + chartId + '"');
                                                    measureLabel.setAttribute('for', 'measure' + index + chartId);
                                                    let measureGood = document.getElementById('good' + dataid + chartId);
                                                    measureGood.setAttribute('id', 'good' + index + chartId);
                                                    measureGood.setAttribute('name', 'measure-selection' + index + chartId);
                                                    let measureGoodLabel = document.querySelector('label[for="good' + dataid + chartId + '"');
                                                    measureGoodLabel.setAttribute('for', 'good' + index + chartId);
                                                    let measureBad = document.getElementById('bad' + dataid + chartId);
                                                    measureBad.setAttribute('id', 'bad' + index + chartId);
                                                    measureBad.setAttribute('name', 'measure-selection' + index + chartId);
                                                    let measureBadLabel = document.querySelector('label[for="bad' + dataid + chartId + '"');
                                                    measureBadLabel.setAttribute('for', 'bad' + index + chartId);
                                                    let neutralContainer = document.getElementById('neutral' + dataid + chartId);
                                                    neutralContainer.setAttribute('id', 'bad' + index + chartId);
                                                    neutralContainer.setAttribute('name', 'measure-selection' + index + chartId);
                                                    let measureneutralLabel = document.querySelector('label[for="neutral' + dataid + chartId + '"');
                                                    measureneutralLabel.setAttribute('for', 'neutral' + index + chartId);
                                                    let alias = document.querySelector('input[name="alias' + dataid + chartId + '"');
                                                    alias.setAttribute('name', 'alias' + index + chartId);
                                                    let entityContainer = document.getElementById('entitycontainer' + dataid + chartId);
                                                    entityContainer.setAttribute('id', 'entitycontainer' + index + chartId);
                                                    let selectEntity = document.getElementById('select-entity' + dataid + chartId);
                                                    selectEntity.setAttribute('id', 'select-entity' + index + chartId);
                                                    selectEntity.setAttribute('name', 'entity' + index + chartId);
                                                    let measureContainer = document.getElementById('measure-container' + dataid + chartId);
                                                    measureContainer.setAttribute('id', 'measure-container' + index + chartId);
                                                    let unit = document.querySelector('input[name="unit' + dataid + chartId + '"');
                                                    unit.setAttribute('name', 'unit' + index + chartId);
                                                    let increaseContainer = document.getElementById('increase-container' + dataid + chartId);
                                                    increaseContainer.setAttribute('id', 'increase-container' + index + chartId);

                                                }
                                            }
                                        }
                                    }
                                }


                                var cols = document.querySelectorAll('#tell-data' + chartId + ' ' + ' .card');
                                [].forEach.call(cols, addDragEventHalders);

                            };
                            /**
                             * @methodOf: Get Entity 
                             * @description The function to Default Entities
                             * @returns 
                             */

                            function callEntityTypes() {
                                if (entityType['entityTypes'].length == 0) {
                                    pageloader.style.display = "block";
                                    let xhttp = new XMLHttpRequest();
                                    xhttp.onreadystatechange = function () {
                                        if (this.readyState === 4 && this.status === 200) {
                                            if (xhttp.responseText != '') {
                                                entityType = JSON.parse(xhttp.responseText);
                                                pageloader.style.display = "none";
                                                setEntityValues();
                                            }
                                        }
                                    }
                                    xhttp.onerror = function (error) {
                                        pageloader.style.display = "none";
                                        if (!window.navigator.onLine)
                                            showModal("You are offline. Please check that you are connected to the Internet", chartId);
                                        else
                                            showModal(error, chartId);
                                        pageloader.style.display = "none";
                                    }
                                    xhttp.open('GET', OOTBEndPoint + "ootb/entitytypesfordims");
                                    xhttp.setRequestHeader('x-api-key', OOTBEndPointKey);
                                    if (window.navigator.onLine)
                                        xhttp.send();
                                    else
                                        showModal("You are offline. Please check that you are connected to the Internet", chartId);
                                }

                                if (measureEntityType['entityTypes'].length === 0) {
                                    pageloader.style.display = "block";
                                    let xmlhttp = new XMLHttpRequest();
                                    xmlhttp.onreadystatechange = function () {
                                        if (this.readyState === 4 && this.status === 200) {
                                            if (xmlhttp.responseText !== '') {
                                                measureEntityType = JSON.parse(xmlhttp.responseText);
                                                pageloader.style.display = "none";
                                                setEntityValues();
                                            }
                                        }
                                    }
                                    xmlhttp.onerror = function (error) {
                                        if (!window.navigator.onLine)
                                            showModal("You are offline. Please check that you are connected to the Internet", chartId);
                                        else
                                            showModal(error, chartId);
                                        pageloader.style.display = "none";
                                    }
                                    xmlhttp.open('GET', OOTBEndPoint + "ootb/entitytypesformeasures");
                                    xmlhttp.setRequestHeader('x-api-key', OOTBEndPointKey);
                                    if (window.navigator.onLine)
                                        xmlhttp.send();
                                    else
                                        showModal("You are offline. Please check that you are connected to the Internet", chartId);
                                }

                            }

                            /**
                             * @methodOf: Set Entity Value 
                             * @description The function to Set Entity values to the corresponding select box
                             * @returns 
                             */

                            function setEntityValues() {
                                let ootbElements = document.querySelectorAll('#tell-data' + chartId + ' ' + ' .card');
                                let enitiesCount = 0;
                                for (let elementIndex = 0; elementIndex < ootbElements.length - 1; elementIndex++) {
                                    let id = ootbElements[elementIndex].getAttribute('data-id');
                                    let selectEl = document.getElementById('select-entity' + id + chartId);
                                    let dimensionField = document.getElementById('dimension' + id + chartId);
                                    let entityCollection = [];
                                    if (dimensionField.checked) {
                                        entityCollection = entityType;
                                        enitiesCount = entityType['entityTypes'].length;
                                    } else {
                                        entityCollection = measureEntityType;
                                        enitiesCount = measureEntityType['entityTypes'].length;
                                    }
                                    if (selectEl !== null) {
                                        if (selectEl.options.length !== enitiesCount + 1) {
                                            for (let entityIndex = 0; entityIndex < enitiesCount; entityIndex++) {
                                                let optionElement = document.createElement('option');
                                                optionElement.text = entityCollection['entityTypes'][entityIndex];
                                                optionElement.value = entityCollection['entityTypes'][entityIndex];
                                                selectEl.appendChild(optionElement);
                                            }
                                        }
                                    }
                                }
                                initializeOOTB();
                            }

                            /**
                             * @methodOf: OOTB Drag and Drop Bind Events
                             * @description The function Bind the Drag and Drop Events
                             * @returns
                             */
                            function addDragEventHalders(elem) {
                                elem.addEventListener('dragstart', dimensioHandleDragStart, false);
                                elem.addEventListener('dragenter', dimensionHandleDragEnter, false)
                                elem.addEventListener('dragover', dimensionHandleDragOver, false);
                                elem.addEventListener('dragleave', dimensionHandleDragLeave, false);
                                elem.addEventListener('drop', dimensionHandleDrop, false);
                                elem.addEventListener('dragend', dimensionHandleDragEnd, false);

                            }

                            function dimensioHandleDragStart(e) {
                                dragSrcEl = this;
                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('text/html', this.outerHTML);
                                this.classList.add('dragElem');
                            }

                            function dimensionHandleDragOver(e) {
                                if (e.preventDefault) {
                                    e.preventDefault();
                                }
                                this.classList.add('over');
                                e.dataTransfer.dropEffect = 'move';
                                return false;
                            }

                            function dimensionHandleDragEnter(e) {}

                            function dimensionHandleDragLeave(e) {
                                this.classList.remove('over');
                            }

                            function dimensionHandleDrop(e) {

                                if (e.stopPropagation) {
                                    e.stopPropagation();
                                }
                                try {
                                    if (dragSrcEl !== null) {
                                        if (dragSrcEl !== this) {
                                            let index = dragSrcEl.getAttribute('data-id');
                                            let aliasValue = document.querySelector('input[name="alias' + index + chartId + '"]');
                                            aliasValue = aliasValue.value;
                                            let entityValue = document.getElementById('select-entity' + index + chartId);
                                            entityValue = entityValue.value;
                                            let measure = document.getElementById('measure' + index + chartId);
                                            let dimension = true;
                                            let increaseValue = null;
                                            let unit = "";
                                            if (measure.checked) {
                                                dimension = false;
                                                let unitValue = document.querySelector('input[name="unit' + index + chartId + '"]');
                                                unit = unitValue.value;
                                                let goodValue = document.getElementById('good' + index + chartId);
                                                let neutralValue = document.getElementById('neutral' + index + chartId);
                                                if (goodValue.checked)
                                                    increaseValue = "good";
                                                else if (neutralValue.checked)
                                                    increaseValue = "neutral";
                                                else
                                                    increaseValue = "bad";
                                            }
                                            dragValue(dimension, aliasValue, entityValue, unit, increaseValue, index);
                                            this.parentNode.removeChild(dragSrcEl);
                                            var dropHTML = e.dataTransfer.getData('text/html');
                                            this.insertAdjacentHTML('beforebegin', dropHTML);
                                            var dropElem = this.previousSibling;
                                            addDragEventHalders(dropElem);

                                        }
                                    }
                                } catch (e) {
                                    console.log(e);
                                }
                                this.classList.remove('over');
                                return false;
                            }

                            function dimensionHandleDragEnd(e) {
                                this.classList.remove('over');
                            }

                            function dragValue(dimension, alias, entity, unit, increase, index) {
                                setTimeout(function () {
                                    try {
                                        let aliasElement = document.querySelector('input[name="alias' + index + chartId + '"]');
                                        let dimensionElement = document.getElementById('dimension' + index + chartId);
                                        let measureElement = document.getElementById('measure' + index + chartId);
                                        let entityElement = document.getElementById('select-entity' + index + chartId);
                                        if (alias !== "") {
                                            if (aliasElement !== null)
                                                aliasElement.value = alias;
                                        }

                                        if (dimension) {
                                            if (dimensionElement !== null)
                                                dimensionElement.checked = true;

                                        } else {
                                            if (measureElement !== null)
                                                measureElement.checked = true;
                                        }
                                        if (entity !== "") {
                                            if (entityElement !== null)
                                                entityElement.value = entity;
                                        }
                                        if (unit !== "") {
                                            let unitElement = document.querySelector('input[name="unit' + index + chartId + '"]');
                                            if (unitElement !== null)
                                                unitElement.value = unit;
                                        }
                                        if (increase !== null) {
                                            let goodFieldElement = document.getElementById('good' + index + chartId);
                                            let badFieldElement = document.getElementById('bad' + index + chartId);
                                            let neutralFieldElement = document.getElementById('neutral' + index + chartId);
                                            if (increase === "good")
                                                goodFieldElement.checked = true;
                                            else if (increase == "neutral")
                                                neutralFieldElement.checked = true;
                                            else
                                                badFieldElement.checked = true;
                                        }

                                        let mesaureContainer = document.getElementById('measure-container' + index + chartId);
                                        if (mesaureContainer.style.display === "none") {
                                            dimensionElement.checked = true;
                                            measureElement.checked = false;
                                        } else {
                                            measureElement.checked = true;
                                            dimensionElement.checked = false;
                                        }
                                        dimensionElement.addEventListener('change', dimensionEvent);
                                        measureElement.addEventListener('change', measureEvent);
                                    } catch (e) {
                                        console.log(e);
                                    }
                                }, 200);
                            }


                            /**
                             * @methodOf: OOTB Remove Column
                             * @description The function to Remove Column Based on user Selection
                             * @returns 
                             */
                            function unSelectCoumn() {
                                let card = document.querySelectorAll('#tell-data' + chartId + ' ' + ' .card');
                                if (card.length > 0) {
                                    for (let index = 0; index < card.length; index++) {
                                        let attribute = card[index].getAttribute('data-attr');
                                        if (attribute !== "nondraggable") {
                                            let found = ootbColumns.some(function (el) {
                                                return el.name === attribute;
                                            });
                                            if (!found) {
                                                card[index].parentNode.removeChild(card[index]);
                                                window.sessionStorage.removeItem('columns' + chartId + '');
                                                for (var columnIndex = 0; columnIndex < _this['columns' + chartId + ''].length; columnIndex++) {
                                                    if (_this['columns' + chartId + ''][columnIndex]['name'] === attribute) {
                                                        _this['columns' + chartId + ''].splice(columnIndex, 1);
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    if (presistData['columns'] !== null && presistData['columns'] !== undefined) {
                                        var orderedColumns = JSON.parse(presistData['columns']);
                                        for (var i = 0; i < orderedColumns.length; i++) {
                                            var attributeName = orderedColumns[i].name;
                                            var existObject = ootbColumns.some(function (el) {
                                                return el.name === attributeName;
                                            });
                                            if (!existObject) {
                                                orderedColumns.splice(i, 1);
                                                _this['columns' + chartId + ''] = orderedColumns;
                                            }
                                        }
                                    }

                                }
                            };

                            /**
                             * @methodOf: OOTB Get Range Field Value
                             * @description The function to Bind Event on Range Slide
                             * @returns 
                             */
                            function dimensionEvent() {
                                try {
                                    let index = this.getAttribute('data-input');
                                    let measureContainerElement = document.getElementById('measure-container' + index + chartId);
                                    let measureElement = document.getElementById('measure' + index + chartId);
                                    let dimensionWrapperMeasureElement = document.getElementById('increase-container' + index + chartId);
                                    if (dimensionWrapperMeasureElement !== null)
                                        dimensionWrapperMeasureElement.style.display = "none";
                                    if (measureContainerElement != null)
                                        measureContainerElement.style.display = "none";
                                    measureElement.checked = false;
                                    let element = document.querySelector('#content' + index + chartId + ' ' + '.measure-list');
                                    element.classList.add('text-center');
                                    let elementWidth = $("#qlikContainer" + chartId).width();
                                    if (elementWidth > 640)
                                        element.classList.remove('text-left');
                                    let selectElement = document.getElementById('select-entity' + index + chartId);
                                    selectElement.innerHTML = "";
                                    let defaultOption = document.createElement('option');
                                    defaultOption.text = "Select";
                                    defaultOption.value = "";
                                    selectElement.appendChild(defaultOption);
                                    for (let entityIndex = 0; entityIndex < entityType['entityTypes'].length; entityIndex++) {
                                        let optionElement = document.createElement('option');
                                        optionElement.text = entityType['entityTypes'][entityIndex];
                                        optionElement.value = entityType['entityTypes'][entityIndex];
                                        document.getElementById('select-entity' + index + chartId).appendChild(optionElement);
                                    }
                                    fieldUpdate = true;
                                } catch (e) {
                                    console.log(e);
                                }
                            };

                            function measureEvent() {
                                try {
                                    let index = this.getAttribute('data-input');
                                    let measureContainerElement = document.getElementById('measure-container' + index + chartId);
                                    let dimensionElement = document.getElementById('dimension' + index + chartId);
                                    if (measureContainerElement !== null)
                                        measureContainerElement.style.display = "inline-block";
                                    let dimensionWrapperMeasureElement = document.getElementById('increase-container' + index + chartId);
                                    if (dimensionWrapperMeasureElement !== null)
                                        dimensionWrapperMeasureElement.style.display = "inline-block";
                                    dimensionElement.checked = false;
                                    let element = document.querySelector('#content' + index + chartId + ' ' + '.measure-list');
                                    element.classList.add('text-left');
                                    let elementWidth = $("#qlikContainer" + chartId).width();
                                    if (elementWidth > 640)
                                        element.classList.remove('text-center');
                                    let selectElement = document.getElementById('select-entity' + index + chartId);
                                    selectElement.innerHTML = "";
                                    let defaultOption = document.createElement('option');
                                    defaultOption.text = "Select";
                                    defaultOption.value = "";
                                    selectElement.appendChild(defaultOption);
                                    for (let entityIndex = 0; entityIndex < measureEntityType['entityTypes'].length; entityIndex++) {
                                        let optionElement = document.createElement('option');
                                        optionElement.text = measureEntityType['entityTypes'][entityIndex];
                                        optionElement.value = measureEntityType['entityTypes'][entityIndex];
                                        document.getElementById('select-entity' + index + chartId).appendChild(optionElement);
                                    }
                                    fieldUpdate = true;
                                } catch (e) {
                                    console.log(e);
                                }
                            };

                            /**
                             * @methodOf: Set Presisted DrillDown Value
                             * @description The function to Set Presisted DrillDown Value to DOM
                             * @returns 
                             */
                            function setPresistedDataToDD() {
                                presistData = chartObj.presistData || {};
                                if (presistData["drillDownData"] !== undefined) {
                                    if (presistData["drillDownData"].length !== 0) {
                                        let drillDownPresistedData = presistData["drillDownData"];
                                        for (var i = 0; i < drillDownPresistedData.length; i++) {
                                            var dropdownId = "ddf" + i + "asDropdown" + chartId;
                                            var eachDrillDownPresistedData = drillDownPresistedData[i];
                                            var key = Object.keys(eachDrillDownPresistedData)[0];
                                            var value = eachDrillDownPresistedData[key]
                                            var optionId = (key.trim() + "_" + i + "_" + value.trim()).replace(/\s/g, "_" + i + "_");
                                            optionId = optionId + chartId;
                                            let optionElement = document.getElementById(optionId);
                                            if (optionElement !== undefined && optionElement !== null) {
                                                optionElement.selected = "true";
                                                let selectedItemDiv = document.getElementById("select" + dropdownId);
                                                if (selectedItemDiv !== undefined || selectedItemDiv !== null)
                                                    selectedItemDiv.innerHTML = value;
                                            }
                                        }
                                    }
                                }
                                dataModel["dataset"][0].drillDowns = [];
                                for (var dd = 0; dd < drillDownCount; dd++) {
                                    var drillDownKey = drillDownDataKeys[dd];
                                    var index = drillDownKey.replace("drillDown", "");
                                    var dropdownId = "ddf" + index + "asDropdown" + chartId;
                                    let existingDropDown = document.getElementById(dropdownId);
                                    if (existingDropDown !== undefined && existingDropDown !== null) {
                                        var keyValue = drillDownUserData[drillDownKey]["key"];
                                        if (keyValue !== "") {
                                            var drillDown = {};
                                            drillDown[keyValue] = existingDropDown.value;
                                            dataModel["dataset"][0].drillDowns.push(drillDown);
                                        }
                                    }
                                }
                            }

                            /**
                             * @methodOf: Get Presist Data
                             * @description The function to Get and Set Presist Values
                             * @returns 
                             */
                            function setPresistedData_View() {
                                // Get Persisted Data Value
                                presistData = chartObj.presistData || {};
                                //   Default Call Functions and Set Values to Variables
                                if (presistData !== undefined && JSON.stringify(presistData) !== "{}" && presistData != null) {
                                    if (presistData["targetElement"] !== undefined)
                                        targetElement = presistData["targetElement"];
                                    if (presistData["url"] !== undefined)
                                        narratorUrl.value = presistData["url"] || "";
                                    if (presistData["authValue"] !== undefined)
                                        authValueElement.value = presistData["authValue"] || "";
                                    if (presistData["customScript"] !== undefined)
                                        scriptInputSimpleElement.value = presistData["customScript"] || "";
                                    if (presistData["advance_data"] !== undefined) {
                                        var advance_data = presistData["advance_data"];
                                        narratorUrl_advance.value = advance_data.nlgService.url;
                                        nlg_service_headers = advance_data.nlgService.headers;
                                        insightsURL.value = advance_data.insightService.url;
                                        insights_service_headers = advance_data.insightService.headers;
                                        wrapperURL.value = advance_data.wrapperService.url;
                                        wrapper_service_headers = advance_data.wrapperService.headers;
                                        setPresistDataForNlgService();
                                        setPresistDataForInsightService();
                                        setPresistDataForWrapperService();
                                    }
                                    if (presistData["advance_customScript"] !== undefined)
                                        advanceScriptInputSimpleElement.value = presistData["advance_customScript"] || "";
                                    if (presistData["projectTypeFlag"] !== undefined)
                                        describeTbl = JSON.parse(presistData["projectTypeFlag"] || "false");
                                    if (presistData["studioProjectEnabled"] !== undefined)
                                        studioProjectEnabledFlg = JSON.parse(presistData["studioProjectEnabled"] || "false");
                                    if (presistData["drillDownData"] !== undefined)
                                        if (presistData["drillDownData"].length != 0) {}
                                    if (presistData['analysis'] !== undefined)
                                        analysisMetadata = JSON.parse(presistData['analysis']);
                                    if (presistData['autoIncrementData'] !== undefined) {
                                        var presistIncrementData = JSON.parse(presistData['autoIncrementData']);
                                        if (presistIncrementData.view === "simple") {
                                            if (presistIncrementData.check === "true" || presistIncrementData.check) {
                                                simpleIncrementBtn.checked = true;
                                                autoIncrementID = true;
                                            } else {
                                                autoIncrementID = false;
                                                simpleIncrementBtn.checked = false;
                                            }
                                        }
                                    }
                                    if (presistData['autoAdvanceIncrementData'] !== undefined) {
                                        var presistIncrementData = JSON.parse(presistData['autoAdvanceIncrementData']);
                                        if (presistIncrementData.view === "advance") {
                                            if (presistIncrementData.check || presistIncrementData.check === "true") {
                                                advanceIncrementBtn.checked = true;
                                                autoIncrementID = true;
                                            } else {
                                                autoIncrementID = false;
                                                advanceIncrementBtn.checked = false;
                                            }
                                        }
                                    }
                                    if (targetElement === "narrativeView") {
                                        let narrativePresistData = (presistData["narrativeText"] === undefined) ? "" : presistData["narrativeText"].trim();
                                        targetView = presistData["targetView"];
                                        if (targetView === "ootb") {
                                            if (typeof (narrativePresistData) === "string")
                                                narrativePresistData = JSON.parse(narrativePresistData.trim());
                                            else
                                                narrativePresistData = narrativePresistData.trim();
                                        }
                                        narrativeContainer.innerHTML = narrativePresistData;
                                        narrativeSection.style.display = "block";
                                        narrativeTabElement.style.display = "none";
                                        outofTabElement.style.display = "none";
                                        headerSection.style.display = "none";
                                        if (debounce || drillDownFilter) {
                                            drillDownFilter = false;
                                            if (targetView === "ootb") {
                                                pageloader.style.display = "block";
                                                if (narrationCall) {
                                                    initializeOOTB();
                                                    presistOOTBLoad = true;
                                                }
                                                var ootbData = {};
                                                if (presistData['ootbData'] !== undefined)
                                                    ootbData = JSON.parse(presistData["ootbData"]);
                                                generateOOTBNarrative();
                                            } else {
                                                if (_this['callNarration' + chartId]) {
                                                    pageloader.style.display = "block";
                                                    if (targetView == "simple") {
                                                        checkSliderBtn.checked = false;
                                                        if (scriptInputSimpleElement.value !== "")
                                                            customMappingScript();
                                                        else
                                                            customScriptAppendElement.value = "";
                                                        callUpdate(narratorUrl.value.trim());
                                                    } else {
                                                        checkSliderBtn.checked = true;
                                                        if (advanceScriptInputSimpleElement.value !== "")
                                                            customMappingScript();
                                                        else
                                                            customScriptAppendElement.value = "";
                                                        callNarrativeForAdvance();
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        if (presistData["targetView"] !== undefined) {
                                            targetView = presistData["targetView"];
                                            if (targetView == "ootb") {
                                                outofTabElement.style.display = "block";
                                                tabBoxElement.classList.add('active');
                                                tabNarrativeElement.classList.remove('active');
                                                narrativeTabElement.style.display = "none";
                                                initializeOOTB();
                                                let summaryView = document.getElementById('tell-summary' + chartId);
                                                if (summaryView.style.display === "block")
                                                    ootb_generateBtn.removeAttribute('disabled');
                                                else
                                                    ootb_generateBtn.setAttribute('disabled', 'disabled');
                                            } else {
                                                outofTabElement.style.display = "none";
                                                tabBoxElement.classList.remove('active');
                                                tabNarrativeElement.classList.add('active');
                                                narrativeTabElement.style.display = "block";
                                                if (targetView === "simple") {
                                                    checkSliderBtn.checked = false;
                                                    enableOpenStudioBtn(narratorUrl);
                                                } else {
                                                    checkSliderBtn.checked = true;
                                                    enableOpenStudioBtn(narratorUrl_advance);
                                                }
                                                initialViewVisibility();
                                            }
                                        }
                                    }
                                }
                            };

                            /**
                             * @methodOf: Presist NLG Service Headers
                             * @description The Function Set Presist Data in service headers
                             * @returns 
                             */
                            function setPresistDataForNlgService() {
                                var keys = Object.keys(nlg_service_headers);
                                nlgHeaderDynamicElCount = keys.length;
                                if (keys.length === 1) {
                                    let authKeyEl = document.getElementById("nlg_authKey_0" + chartId);
                                    let authValueEl = document.getElementById("nlg_authValue_0" + chartId);
                                    authKeyEl.value = keys[0];
                                    authValueEl.value = nlg_service_headers[keys[0]];
                                } else if (keys.length > 1) {
                                    let authKeyEl = document.getElementById("nlg_authKey_0" + chartId);
                                    let authValueEl = document.getElementById("nlg_authValue_0" + chartId);
                                    authKeyEl.value = keys[0];
                                    authValueEl.value = nlg_service_headers[keys[0]];
                                    for (var i = 1; i < keys.length; i++) {
                                        var keyName = keys[i];
                                        var keyValue = nlg_service_headers[keys[i]];
                                        var appendId = i + chartId;
                                        let authKeyEl = document.getElementById("nlg_authKey_" + appendId);
                                        if (authKeyEl === undefined) {
                                            let element = document.createElement('div');
                                            element.setAttribute('class', 'col-md-12 auth-header');
                                            let html = '<div class="col-md-4"><input type="text" placeholder="Key" id=nlg_authKey_' + appendId + ' value = ' + keyName + '></div><div class="col-md-8"><input type="text" placeholder="Value" id=nlg_authValue_' + appendId + ' value = ' + keyValue + '></div>';
                                            element.innerHTML = html;
                                            document.querySelector('#advance-mode' + chartId + ' .dynamic-header .append-container').appendChild(element);
                                            removeDynamicHeaderBtn.style.display = "inline";
                                        }
                                    }
                                }
                            };

                            /**
                             * @methodOf: Presist NLG Insight Headers
                             * @description The Function Set Presist Data in Insight headers
                             * @returns 
                             */
                            function setPresistDataForInsightService() {
                                var keys = Object.keys(insights_service_headers);
                                insightsHeaderDynamicElCount = keys.length;
                                if (keys.length === 1) {
                                    let authKeyEl = document.getElementById("insights_authKey_0" + chartId);
                                    let authValueEl = document.getElementById("insights_authValue_0" + chartId);
                                    authKeyEl.value = keys[0];
                                    authValueEl.value = insights_service_headers[keys[0]];
                                } else if (keys.length > 1) {
                                    let authKeyEl = document.getElementById("insights_authKey_0" + chartId);
                                    let authValueEl = document.getElementById("insights_authValue_0" + chartId);
                                    authKeyEl.value = keys[0];
                                    authValueEl.value = insights_service_headers[keys[0]];
                                    for (var i = 1; i < keys.length; i++) {
                                        var keyName = keys[i];
                                        var keyValue = insights_service_headers[keys[i]];
                                        var appendId = i + chartId;
                                        let authKeyEl = document.getElementById("insights_authKey_" + appendId);
                                        if (authKeyEl === undefined) {
                                            let insightElement = document.createElement('div');
                                            insightElement.setAttribute('class', 'col-md-12 auth-header');
                                            let html = '<div class="col-md-4"><input type="text" placeholder="Key" id=insights_authKey_' + appendId + ' value = ' + keyName + '></div><div class="col-md-8"><input type="text" placeholder="Value" id=insights_authValue_' + appendId + ' value = ' + keyValue + '></div>';
                                            insightElement.innerHTML = html;
                                            document.querySelector('#advance-mode' + chartId + ' .insight-content .append-container').appendChild(insightElement);
                                            removeInsightHeaderBtn.style.display = "inline";
                                        }
                                    }
                                }
                            };

                            /**
                             * @methodOf: Presist NLG Wrapper Headers
                             * @description The Function Set Presist Data in Wrapper headers
                             * @returns 
                             */
                            function setPresistDataForWrapperService() {
                                var keys = Object.keys(wrapper_service_headers);
                                wrapperHeaderDynamicElCount = keys.length;
                                if (keys.length === 1) {
                                    let authKeyEl = document.getElementById("wrapper_authKey_0" + chartId);
                                    let authValueEl = document.getElementById("wrapper_authValue_0" + chartId);
                                    authKeyEl.value = keys[0];
                                    authValueEl.value = wrapper_service_headers[keys[0]];
                                } else if (keys.length > 1) {
                                    let authKeyEl = document.getElementById("wrapper_authKey_0" + chartId);
                                    let authValueEl = document.getElementById("wrapper_authValue_0" + chartId);
                                    authKeyEl.value = keys[0];
                                    authValueEl.value = wrapper_service_headers[keys[0]];
                                    for (var i = 1; i < keys.length; i++) {
                                        var keyName = keys[i];
                                        var keyValue = wrapper_service_headers[keys[i]];
                                        var appendId = i + chartId;
                                        let authKeyEl = document.getElementById("wrapper_authKey_" + appendId);
                                        if (authKeyEl === undefined) {
                                            let wrapperElement = document.createElement('div');
                                            wrapperElement.setAttribute('class', 'col-md-12 auth-header');
                                            let html = '<div class="col-md-4"><input type="text" placeholder="Key" id=wrapper_authKey_' + appendId + ' value = ' + keyName + '></div><div class="col-md-8"><input type="text" placeholder="Value" id=wrapper_authValue_' + appendId + ' value = ' + keyValue + '></div>';
                                            wrapperElement.innerHTML = html;
                                            document.querySelector('#advance-mode' + chartId + ' .wrapper-content .append-container').appendChild(wrapperElement);
                                            removeWrapperHeaderBtn.style.display = "inline";
                                        }
                                    }
                                }
                            };

                            /**
                             * @methodOf: Advance UI
                             * @description The function to Advance Switch Toggle JSON to Table
                             * @returns 
                             */
                            advance_studio_toggle.onchange = function () {
                                if (advance_studio_toggle.checked) {
                                    studioProjectEnabledFlg = true;
                                    advance_studio_type.style.display = "inline-block";
                                    if (describeTbl) {
                                        advanceTableBtn.checked = true;
                                        advancedownloadJsonBtn.style.display = "none";
                                        advancedownloadCsvBtn.style.display = "inline-block";
                                        advanceCSVPayloadDiv.style.display = "inline-block";
                                        document.getElementById('advancecustom-script' + chartId).parentElement.setAttribute("class", "col-md-4 export");
                                        document.getElementById('advancedata-json' + chartId).parentElement.setAttribute("class", "col-md-4 data-json");
                                        document.querySelector('#advancedata-json' + chartId + ' .col-md-6').innerHTML = '<img src="' + apiEndpoint + 'arria/images/arrow_white.png" class="arrow"><label>View Dataset in CSV</label>';
                                        advanceCheckboxContainer.style.display = "block";

                                    } else {
                                        advanceExportBtn.checked = true;
                                        advancedownloadJsonBtn.style.display = "inline-block";
                                        advancedownloadCsvBtn.style.display = "none";
                                        advanceCSVPayloadDiv.style.display = "none";
                                        document.getElementById('advancecustom-script' + chartId).parentElement.setAttribute("class", "col-md-6 export");
                                        document.getElementById('advancedata-json' + chartId).parentElement.setAttribute("class", "col-md-6 data-json");
                                        document.querySelector('#advancedata-json' + chartId + ' .col-md-6').innerHTML = '<img src="' + apiEndpoint + 'arria/images/arrow_white.png" class="arrow"><label>View Dataset in JSON</label>';
                                        advanceCheckboxContainer.style.display = "none";
                                    }
                                } else {
                                    describeTbl = false;
                                    studioProjectEnabledFlg = false;
                                    advance_studio_type.style.display = "none";
                                    advanceExportBtn.checked = true;
                                    advancedownloadJsonBtn.style.display = "inline-block";
                                    advancedownloadCsvBtn.style.display = "none";
                                    advanceCSVPayloadDiv.style.display = "none";
                                    document.getElementById('advancecustom-script' + chartId).parentElement.setAttribute("class", "col-md-6 export");
                                    document.getElementById('advancedata-json' + chartId).parentElement.setAttribute("class", "col-md-6 data-json");
                                    document.querySelector('#advancedata-json' + chartId + ' .col-md-6').innerHTML = '<img src="' + apiEndpoint + 'arria/images/arrow_white.png" class="arrow"><label>View Dataset in JSON</label>';
                                    advanceCheckboxContainer.style.display = "none";
                                }
                                if (advanceExport.style.display === "block")
                                    document.querySelector('#advancedata-json' + chartId + ' ' + '.col-md-6:first-child img').setAttribute('src', apiEndpoint + 'arria/images/arrow_up_black.png');
                                presistData["studioProjectEnabled"] = JSON.stringify(studioProjectEnabledFlg);
                                showData();
                                enableOpenStudioBtn(narratorUrl_advance);
                            }

                            /**
                             * @methodOf: Copy to Clipboard
                             * @description The function to Copy the Narrative Text to clipboard
                             * @returns 
                             */
                            copyClipboardBtn.onclick = function () {
                                copyChartID = chartId;
                                copyToClipBoardFlag = true;
                                let clipboardContent = document.getElementById('toast');
                                var status = document.execCommand('copy');
                                if (status) {
                                    clipboardContent.style.display = "block";
                                    setTimeout(function () {
                                        clipboardContent.style.display = "none";
                                    }, 1000);
                                }
                            }

                            document.body.addEventListener('copy', function (e) {
                                if (copyToClipBoardFlag) {
                                    let narrativeContainer = document.getElementById('narrative-container' + copyChartID);
                                    e.clipboardData.setData('text/html', narrativeContainer.outerHTML);
                                    e.preventDefault();
                                    copyToClipBoardFlag = false;
                                }
                            });


                            /**
                             * @methodOf: Container Mouse Over
                             * @description The function to Visible Blocks
                             * @returns 
                             */
                            containerElement.addEventListener('mouseover', function () {
                                if (targetElement === "narrativeView" && narrativeSection.style.display === "block") {
                                    var currentMode = qlik.navigation.getMode();
                                    if (currentMode !== "analysis")
                                        cogWheel.style.display = "block";
                                    copyClipboardBtn.style.display = "block";
                                }
                                if (qlik.navigation.getMode() !== "edit")
                                    disableContainer.style.display = "none";
                                else {
                                    if (!maximize)
                                        disableContainer.style.display = "block";
                                }
                            });

                            /**
                             * @methodOf: Container Mouse Leave
                             * @description The function to Hide Blocks
                             * @returns 
                             */
                            containerElement.addEventListener('mouseleave', function () {
                                if (targetElement === "narrativeView" && narrativeSection.style.display === "block") {
                                    cogWheel.style.display = "none";
                                    copyClipboardBtn.style.display = "none";
                                }
                            });

                            //----------------------- Doument button element click event -------------------
                            documentBtn.onclick = function () {
                                window.open(supportURL);
                            };
                            /**
                             * @methodOf: Switch Tab
                             * @description The function to Switch Main Tab Navigation
                             * @returns 
                             */
                            tabBoxElement.onclick = function () {
                                $("#qlikContainer" + chartId + " " + "header").css({
                                    "border-bottom": "2px solid #1382bc"
                                });
                                tabNarrativeElement.classList.remove("active");
                                tabBoxElement.classList.add("active");
                                outofTabElement.style.display = "block";
                                narrativeTabElement.style.display = "none";
                                narrativeSection.style.display = "none";
                                targetView = "ootb";
                                let summaryView = document.getElementById('tell-summary' + chartId);
                                if (summaryView.style.display === "block")
                                    ootb_generateBtn.removeAttribute('disabled', true);
                                else
                                    ootb_generateBtn.setAttribute('disabled', true);
                                presistData["targetView"] = targetView;
                                targetElement = "ootb";
                                presistData["targetElement"] = targetElement;
                                savePresistData(presistData);
                            };

                            //----------------------- Tab Narrative element click event -------------------
                            tabNarrativeElement.onclick = function () {
                                $("#qlikContainer" + chartId + " " + "header").css({
                                    "border-bottom": "2px solid #1db5ac"
                                });
                                presistData = chartObj.presistData || {};
                                if (presistData !== undefined && JSON.stringify(presistData) !== "{}" && presistData !== null) {
                                    if (presistData["projectTypeFlag"] !== undefined)
                                        describeTbl = JSON.parse(presistData["projectTypeFlag"] || "false");
                                }
                                tabNarrativeElement.classList.add("active");
                                tabBoxElement.classList.remove("active");
                                outofTabElement.style.display = "none";
                                narrativeTabElement.style.display = "block";
                                narrativeSection.style.display = "none";
                                if (checkSliderBtn.checked) {
                                    advance_studio_toggle.checked = studioProjectEnabledFlg;
                                    if (studioProjectEnabledFlg)
                                        advance_studio_type.style.display = "inline-block"
                                    else
                                        advance_studio_type.style.display = "none"
                                    simpleUiContainer.style.display = "none";
                                    advanceUiContainer.style.display = "block";
                                    simpleText.classList.remove('active');
                                    advanceText.classList.add('active');
                                    if (describeTbl || !advance_studio_toggle.checked) {
                                        advanceTableBtn.checked = true;
                                        advancedownloadJsonBtn.style.display = "none";
                                        advancedownloadCsvBtn.style.display = "inline-block";
                                        advanceCSVPayloadDiv.style.display = "inline-block";
                                        advanceCustomScriptElement.parentElement.setAttribute("class", "col-md-4 export");
                                        advanceDatasetJsonElement.parentElement.setAttribute("class", "col-md-4 data-json");
                                        document.querySelector('#advancedata-json' + chartId + ' .col-md-6').innerHTML = '<img src="' + apiEndpoint + 'arria/images/arrow_white.png" class="arrow"><label>View Dataset in CSV</label>';
                                    } else {
                                        advanceExportBtn.checked = true;
                                        advancedownloadJsonBtn.style.display = "inline-block";
                                        advancedownloadCsvBtn.style.display = "none";
                                        advanceCSVPayloadDiv.style.display = "none";
                                        advanceCustomScriptElement.parentElement.setAttribute("class", "col-md-6 export");
                                        advanceDatasetJsonElement.parentElement.setAttribute("class", "col-md-6 data-json");
                                        document.querySelector('#advancedata-json' + chartId + ' .col-md-6').innerHTML = '<img src="' + apiEndpoint + 'arria/images/arrow_white.png" class="arrow"><label>View Dataset in JSON</label>';
                                    }
                                    targetView = "advance";
                                } else {
                                    simpleUiContainer.style.display = "block";
                                    advanceUiContainer.style.display = "none";
                                    simpleText.classList.add('active');
                                    advanceText.classList.remove('active');
                                    if (describeTbl) {
                                        simpleTableBtn.checked = true;
                                        downloadJsonBtn.style.display = "none";
                                        downloadCsvBtn.style.display = "inline-block";
                                        simpleCSVPayloadDiv.style.display = "inline-block";
                                        advanceCustomScriptElement.parentElement.setAttribute("class", "col-md-4 export");
                                        advanceDatasetJsonElement.parentElement.setAttribute("class", "col-md-4 data-json");
                                        document.querySelector('#data-json' + chartId + ' .col-md-6').innerHTML = '<img src="' + apiEndpoint + 'arria/images/arrow_white.png" class="arrow"><label>View Dataset in CSV</label>';
                                    } else {
                                        simpleExportBtn.checked = true;
                                        downloadJsonBtn.style.display = "inline-block";
                                        downloadCsvBtn.style.display = "none";
                                        simpleCSVPayloadDiv.style.display = "none";
                                        advanceCustomScriptElement.parentElement.setAttribute("class", "col-md-6 export");
                                        advanceDatasetJsonElement.parentElement.setAttribute("class", "col-md-6 data-json");
                                        document.querySelector('#data-json' + chartId + ' .col-md-6').innerHTML = '<img src="' + apiEndpoint + 'arria/images/arrow_white.png" class="arrow"><label>View Dataset in JSON</label>';
                                    }
                                    targetView = "simple";
                                }
                                targetElement = "generatorView";
                                presistData["targetElement"] = targetElement;
                                presistData["targetView"] = targetView;
                                savePresistData(presistData);
                            };




                            /**
                             * @methodOf: Switch Views
                             * @description The function Toggle Simple UI to Advance UI
                             * @returns 
                             */

                            checkSliderBtn.onchange = function () {
                                csv_rowData = [];
                                if (checkSliderBtn.checked) {
                                    simpleUiContainer.style.display = "none";
                                    advanceUiContainer.style.display = "block";
                                    simpleText.classList.remove('active');
                                    advanceText.classList.add('active');
                                    studioProjectEnabledFlg = true;
                                    advance_studio_toggle.checked = true;
                                    advance_studio_toggle.onchange();
                                    if (describeTbl && advance_studio_toggle.checked) {
                                        advanceTableBtn.checked = true;
                                        advancedownloadJsonBtn.style.display = "none";
                                        advancedownloadCsvBtn.style.display = "inline-block";
                                        advanceCSVPayloadDiv.style.display = "inline-block";
                                        advanceCustomScriptElement.parentElement.setAttribute("class", "col-md-4 export");
                                        advanceDatasetJsonElement.parentElement.setAttribute("class", "col-md-4 data-json");
                                        document.querySelector('#advancedata-json' + chartId + ' .col-md-6').innerHTML = '<img src="' + apiEndpoint + 'arria/images/arrow_white.png" class="arrow"><label>View Dataset in CSV</label>';
                                        advanceCheckboxContainer.style.display = "block";
                                        if (advanceIncrementBtn.checked)
                                            autoIncrementID = true;
                                        else
                                            autoIncrementID = false;
                                    } else {
                                        describeTbl = false;
                                        advanceExportBtn.checked = true;
                                        advancedownloadJsonBtn.style.display = "inline-block";
                                        advancedownloadCsvBtn.style.display = "none";
                                        advanceCSVPayloadDiv.style.display = "none";
                                        advanceCustomScriptElement.parentElement.setAttribute("class", "col-md-6 export");
                                        advanceDatasetJsonElement.parentElement.setAttribute("class", "col-md-6 data-json");
                                        document.querySelector('#advancedata-json' + chartId + ' .col-md-6').innerHTML = '<img src="' + apiEndpoint + 'arria/images/arrow_white.png" class="arrow"><label>View Dataset in JSON</label>';
                                    }
                                    targetView = "advance";
                                    enableOpenStudioBtn(narratorUrl_advance);
                                } else {
                                    simpleUiContainer.style.display = "block";
                                    advanceUiContainer.style.display = "none";
                                    simpleText.classList.add('active');
                                    advanceText.classList.remove('active');
                                    if (describeTbl) {
                                        simpleTableBtn.checked = true;
                                        downloadJsonBtn.style.display = "none";
                                        downloadCsvBtn.style.display = "inline-block";
                                        simpleCSVPayloadDiv.style.display = "inline-block";
                                        customScriptElement.parentElement.setAttribute("class", "col-md-4 export");
                                        datasetJsonElement.parentElement.setAttribute("class", "col-md-4 data-json");
                                        document.querySelector('#data-json' + chartId + ' .col-md-6').innerHTML = '<img src="' + apiEndpoint + 'arria/images/arrow_white.png" class="arrow"><label>View Dataset in CSV</label>';
                                        simpleCheckboxContainer.style.display = "block"
                                        if (simpleIncrementBtn.checked)
                                            autoIncrementID = true;
                                        else
                                            autoIncrementID = false;
                                    } else {
                                        simpleExportBtn.checked = true;
                                        downloadJsonBtn.style.display = "inline-block";
                                        downloadCsvBtn.style.display = "none";
                                        simpleCSVPayloadDiv.style.display = "none";
                                        customScriptElement.parentElement.setAttribute("class", "col-md-6 export");
                                        datasetJsonElement.parentElement.setAttribute("class", "col-md-6 data-json");
                                        document.querySelector('#data-json' + chartId + ' .col-md-6').innerHTML = '<img src="' + apiEndpoint + 'arria/images/arrow_white.png" class="arrow"><label>View Dataset in JSON</label>';
                                    }
                                    targetView = "simple";
                                    enableOpenStudioBtn(narratorUrl);
                                }
                                showData();
                                targetElement = "generatorView";
                                presistData["targetElement"] = targetElement;
                                presistData["targetView"] = targetView;
                                presistData["projectTypeFlag"] = JSON.stringify(describeTbl);
                                savePresistData(presistData);
                            };

                            /**
                             * @methodOf: Simple UI
                             * @description The function to Expand Export Methods
                             * @returns 
                             */
                            datasetJsonElement.onclick = function (event) {
                                let arrowImg = document.querySelector('#data-json' + chartId + ' .col-md-6:first-child img');
                                if (event.target['tagName'] !== "A" && event.target['tagName'] !== "IMG" || event.target['className'] === "arrow") {
                                    if (simpleExport.style.display === "block") {
                                        simpleExport.style.display = "none";
                                        datasetJsonElement.classList.remove("active");
                                        arrowImg.setAttribute('src', apiEndpoint + 'arria/images/arrow_white.png');
                                        if (downloadJsonBtn.style.display === "inline-block")
                                            document.querySelector('#download-json' + chartId + ' ' + 'img').setAttribute('src', apiEndpoint + 'arria/images/download_white.png');
                                        else
                                            document.querySelector('#download-csv' + chartId + ' ' + 'img').setAttribute('src', apiEndpoint + 'arria/images/download_white.png');
                                    } else {
                                        simpleExport.style.display = "block";
                                        datasetJsonElement.classList.add("active");
                                        arrowImg.setAttribute('src', apiEndpoint + 'arria/images/arrow_up_black.png');
                                        if (downloadJsonBtn.style.display === "inline-block")
                                            document.querySelector('#download-json' + chartId + ' ' + 'img').setAttribute('src', apiEndpoint + 'arria/images/download_white.png');
                                        else
                                            document.querySelector('#download-csv' + chartId + ' ' + 'img').setAttribute('src', apiEndpoint + 'arria/images/download_white.png');
                                    }
                                }
                            };

                            /**
                             * @methodOf: Simple UI
                             * @description The function to Expand Custom Mapping Script Field
                             * @returns 
                             */
                            customScriptElement.onclick = function () {
                                let arrowImg = document.getElementById('arrow-script' + chartId);
                                if (scriptInputSimpleElement.style.display === "block") {
                                    scriptInputSimpleElement.style.display = "none";
                                    customScriptElement.classList.remove("active");
                                    arrowImg.setAttribute('src', apiEndpoint + 'arria/images/arrow_white.png');
                                } else {
                                    scriptInputSimpleElement.style.display = "block";
                                    customScriptElement.classList.add("active");
                                    arrowImg.setAttribute('src', apiEndpoint + 'arria/images/arrow_up_black.png');
                                }
                            };

                            /**
                             * @methodOf: Simple UI
                             * @description Switch Studio Project Type JSON to Table
                             * @returns 
                             */
                            simpleTableBtn.onchange = function () {
                                downloadJsonBtn.style.display = "none";
                                downloadCsvBtn.style.display = "inline-block";
                                simpleCSVPayloadDiv.style.display = "inline-block";
                                customScriptElement.parentElement.setAttribute("class", "col-md-4 export");
                                datasetJsonElement.parentElement.setAttribute("class", "col-md-4 data-json");
                                describeTbl = true;
                                if (simpleExport.style.display === "block") {
                                    document.querySelector('#download-csv' + chartId + ' ' + 'img').setAttribute('src', apiEndpoint + 'arria/images/download_white.png');
                                    document.querySelector('#data-json' + chartId + ' .col-md-6').innerHTML = '<img src="' + apiEndpoint + 'arria/images/arrow_up_black.png"><label>View Dataset in CSV</label>';
                                } else {
                                    document.querySelector('#download-csv' + chartId + ' ' + 'img').setAttribute('src', apiEndpoint + 'arria/images/download_white.png');
                                    document.querySelector('#data-json' + chartId + ' .col-md-6').innerHTML = '<img src="' + apiEndpoint + 'arria/images/arrow_white.png"><label>View Dataset in CSV</label>';
                                }
                                simpleCheckboxContainer.style.display = "block";
                                showData();
                            };

                            /**
                             * @methodOf: Simple UI
                             * @description Switch Studio Project Type Table to JSON
                             * @returns 
                             */
                            simpleExportBtn.onchange = function () {
                                simpleCheckboxContainer.style.display = "none";
                                simpleJsonDataView();
                                showData();
                            };

                            /**
                             * @methodOf: Simple UI
                             * @description Export CSV and JSON Data
                             * @returns 
                             */
                            downloadJsonBtn.onclick = function () {
                                downloadJSON_Data();
                            };

                            //----------------------- Download CSV button click event -------------------
                            downloadCsvBtn.onclick = function () {
                                downloadCSV_Data();
                            };

                            /**
                             * @methodOf: Cog Wheel
                             * @description The Function to Toggle blocks
                             * @returns 
                             */
                            cogWheel.onclick = function () {
                                if (targetElement === "narrativeView" && narrativeSection.style.display === "block") {
                                    headerSection.style.display = "block";
                                    narrativeSection.style.display = "none";
                                    if (presistData["targetView"] !== undefined) {
                                        targetView = presistData["targetView"];
                                        if (targetView === "ootb") {
                                            narrativeTabElement.style.display = "none";
                                            outofTabElement.style.display = "block";
                                            let summaryView = tellSummaryContainer;
                                            let generateBtn = document.querySelector('#outofbox-tabsection' + chartId + ' .generate_btn');
                                            if (summaryView.style.display === "block")
                                                generateBtn.removeAttribute('disabled');
                                        } else {
                                            narrativeTabElement.style.display = "block";
                                            outofTabElement.style.display = "none";
                                            if (targetView === "simple")
                                                checkSliderBtn.checked = false;
                                            else
                                                checkSliderBtn.checked = true;
                                        }
                                    }
                                    initialViewVisibility();
                                    targetElement = "generatorView";
                                    presistData["targetElement"] = targetElement;
                                    presistData["targetView"] = targetView;
                                    savePresistData(presistData);
                                }
                            };

                            /**
                             * @methodOf: Generate Narrative
                             * @description The function to Generate Simple UI Narration
                             * @returns 
                             */
                            generateSimpleNarrative.onclick = function () {
                                if (!window.navigator.onLine) {
                                    showModal("You are offline. Please check that you are connected to the Internet", chartId);
                                    return;
                                }
                                generateNarrative();
                            };

                            /**
                             * @methodOf: Simple Narrator Textbox
                             * @description The Function to Simple Narrator View Keyup
                             * @returns 
                             */
                            narratorUrl.onkeyup = function () {
                                enableOpenStudioBtn(narratorUrl);
                            };

                            /**
                             * @methodOf: Advance Narrator Textbox
                             * @description The Function to Advance Narrator View Keyup
                             * @returns 
                             */
                            narratorUrl_advance.onkeyup = function () {
                                enableOpenStudioBtn(narratorUrl_advance);
                            };

                            /**
                             * @methodOf: Open StudioProject
                             * @description The Function to Open Studio Project in Browser
                             * @returns 
                             */
                            openStudioBtn.onclick = function () {
                                var url = narratorUrl.value;
                                if (checkSliderBtn.checked)
                                    url = narratorUrl_advance.value;
                                var hostname = extractHostname(url);
                                var studioUrl = "https://<hostName>/design/<projectKey>/composer";
                                var projectKey = url.split("/").splice(-1);
                                studioUrl = studioUrl.replace("<projectKey>", projectKey);
                                studioUrl = studioUrl.replace("<hostName>", hostname);
                                window.open(studioUrl);

                            }

                            /**
                             * @methodOf: Close Modal
                             * @description The Function to Close Modal Popup
                             * @returns 
                             */
                            closeModalBtn.onclick = function () {
                                document.getElementById('closemodal' + chartId).style.marginBottom = "0px";
                                document.getElementById('modal' + chartId).style.display = "none";
                            }

                            /**
                             * @methodOf: Insight Accordian
                             * @description The Function Toggle the Element Containers
                             * @returns 
                             */
                            insightAccordianBtn.onclick = function () {
                                if (insightAccordian.style.display === "none") {
                                    insightAccordian.style.display = "block";
                                    insightAccordianBtn.classList.add('active');
                                    document.querySelector('#advance-mode' + chartId + ' .insight-accordian img').setAttribute('src', apiEndpoint + 'arria/images/arrow_up.png');
                                } else {
                                    insightAccordian.style.display = "none";
                                    insightAccordianBtn.classList.remove('active');
                                    document.querySelector('#advance-mode' + chartId + ' .insight-accordian img').setAttribute('src', apiEndpoint + 'arria/images/arrow_white.png');
                                }
                            };

                            /**
                             * @methodOf: Wrapper Accordian
                             * @description The Function Toggle the Element Containers
                             * @returns 
                             */
                            wrapperAccordianBtn.onclick = function () {
                                if (wrapperAccordian.style.display === "none") {
                                    wrapperAccordian.style.display = "block";
                                    wrapperAccordianBtn.classList.add('active');
                                    document.querySelector('#advance-mode' + chartId + ' .wrapper-accordian img').setAttribute('src', apiEndpoint + 'arria/images/arrow_up.png');
                                } else {
                                    wrapperAccordian.style.display = "none";
                                    wrapperAccordianBtn.classList.remove('active');
                                    document.querySelector('#advance-mode' + chartId + ' .wrapper-accordian img').setAttribute('src', apiEndpoint + 'arria/images/arrow_white.png');
                                }
                            };

                            /**
                             * @methodOf: Advance UI Dynamic Header
                             * @description The Function Append Dynamic Headers
                             * @returns 
                             */
                            addDynamicHeaderBtn.onclick = function () {
                                let elementCount = document.querySelector('#advance-mode' + chartId + ' .dynamic-header .append-container').childElementCount;
                                nlgHeaderDynamicElCount = elementCount + 1;
                                nlgHeaderDynamicElCount = nlgHeaderDynamicElCount + chartId;
                                let element = document.createElement('div');
                                element.setAttribute('class', 'col-md-12 auth-header');
                                let html = '<div class="col-md-4"><input type="text" placeholder="Key" id=nlg_authKey_' + nlgHeaderDynamicElCount + '></div><div class="col-md-8"><input type="text" placeholder="Value" id=nlg_authValue_' + nlgHeaderDynamicElCount + '></div>';
                                element.innerHTML = html;
                                document.querySelector('#advance-mode' + chartId + ' .dynamic-header .append-container').appendChild(element);
                                removeDynamicHeaderBtn.style.display = "inline";
                            }

                            /**
                             * @methodOf: Insight Add Header
                             * @description The Function Add Insight Headers
                             * @returns 
                             */
                            addInsightHeaderBtn.onclick = function () {
                                let elementInsightCount = document.querySelector('#advance-mode' + chartId + ' .insight-content .append-container').childElementCount;
                                insightsHeaderDynamicElCount = elementInsightCount + 1;
                                insightsHeaderDynamicElCount = insightsHeaderDynamicElCount + chartId;
                                let insightElement = document.createElement('div');
                                insightElement.setAttribute('class', 'col-md-12 auth-header');
                                let html = '<div class="col-md-4"><input type="text" placeholder="Key" id=insights_authKey_' + insightsHeaderDynamicElCount + '></div><div class="col-md-8"><input type="text" placeholder="Value" id=insights_authValue_' + insightsHeaderDynamicElCount + '></div>';
                                insightElement.innerHTML = html;
                                document.querySelector('#advance-mode' + chartId + ' .insight-content .append-container').appendChild(insightElement);
                                removeInsightHeaderBtn.style.display = "inline";
                            }

                            /**
                             * @methodOf: Wrapper Add Header
                             * @description The Function Add Wrapper Headers
                             * @returns 
                             */
                            addWrapperHeaderBtn.onclick = function () {
                                let elementWrapperCount = document.querySelector('#advance-mode' + chartId + ' .wrapper-content .append-container').childElementCount;
                                wrapperHeaderDynamicElCount = elementWrapperCount + 1;
                                wrapperHeaderDynamicElCount = wrapperHeaderDynamicElCount + chartId;
                                let wrapperElement = document.createElement('div');
                                wrapperElement.setAttribute('class', 'col-md-12 auth-header');
                                let html = '<div class="col-md-4"><input type="text" placeholder="Key" id=wrapper_authKey_' + wrapperHeaderDynamicElCount + '></div><div class="col-md-8"><input type="text" placeholder="Value" id=wrapper_authValue_' + wrapperHeaderDynamicElCount + '></div>';
                                wrapperElement.innerHTML = html;
                                document.querySelector('#advance-mode' + chartId + ' .wrapper-content .append-container').appendChild(wrapperElement);
                                removeWrapperHeaderBtn.style.display = "inline";
                            }

                            /**
                             * @methodOf: Advance UI
                             * @description Switch Studio Project Type JSON to Table
                             * @returns 
                             */
                            advanceTableBtn.onchange = function () {
                                advancedownloadJsonBtn.style.display = "none";
                                advancedownloadCsvBtn.style.display = "inline-block";
                                advanceCSVPayloadDiv.style.display = "inline-block";
                                advanceCustomScriptElement.parentElement.setAttribute("class", "col-md-4 export");
                                advanceDatasetJsonElement.parentElement.setAttribute("class", "col-md-4 data-json");
                                describeTbl = true;
                                if (advanceExport.style.display === "block") {
                                    document.querySelector('#advancedownload-csv' + chartId + ' ' + 'img').setAttribute('src', apiEndpoint + 'arria/images/download_white.png');
                                    document.querySelector('#advancedata-json' + chartId + ' .col-md-6').innerHTML = '<img src="' + apiEndpoint + 'arria/images/arrow_up_black.png"><label>View Dataset in CSV</label>';
                                } else {
                                    document.querySelector('#advancedownload-csv' + chartId + ' ' + 'img').setAttribute('src', apiEndpoint + 'arria/images/download_white.png');
                                    document.querySelector('#advancedata-json' + chartId + ' .col-md-6').innerHTML = '<img src="' + apiEndpoint + 'arria/images/arrow_white.png"><label>View Dataset in CSV</label>';
                                }
                                advanceCheckboxContainer.style.display = "block";
                                showData();

                            }

                            /**
                             * @methodOf: Advance UI
                             * @description Switch Studio Project Type Table to JSON
                             * @returns 
                             */
                            advanceExportBtn.onchange = function () {
                                advanceCheckboxContainer.style.display = "none";
                                advanceJsonDataView();
                                showData();

                            };

                            //----------------------- Advance download JSON button click event -------------------
                            advancedownloadJsonBtn.onclick = function () {
                                downloadJSON_Data();
                            };

                            //----------------------- Advance download CSV button click event -------------------
                            advancedownloadCsvBtn.onclick = function () {
                                downloadCSV_Data();
                            };

                            /**
                             * @methodOf: Advance UI
                             * @description The function to Expand Export Methods
                             * @returns 
                             */
                            advanceDatasetJsonElement.onclick = function (event) {
                                let arrowImg = document.querySelector('#advancedata-json' + chartId + ' .col-md-6:first-child img');
                                if (event.target['tagName'] !== "A" && event.target['tagName'] !== "IMG" || event.target['className'] === "arrow") {
                                    if (advanceExport.style.display === "block") {
                                        advanceExport.style.display = "none";
                                        advanceDatasetJsonElement.classList.remove("active");
                                        arrowImg.setAttribute('src', apiEndpoint + 'arria/images/arrow_white.png');
                                        if (advancedownloadJsonBtn.style.display === "inline-block")
                                            document.querySelector('#advancedownload-json' + chartId + ' ' + 'img').setAttribute('src', apiEndpoint + 'arria/images/download_white.png');
                                        else
                                            document.querySelector('#advancedownload-csv' + chartId + ' ' + 'img').setAttribute('src', apiEndpoint + 'arria/images/download_white.png');
                                    } else {
                                        advanceExport.style.display = "block";
                                        advanceDatasetJsonElement.classList.add("active");
                                        arrowImg.setAttribute('src', apiEndpoint + 'arria/images/arrow_up_black.png');
                                        if (advancedownloadJsonBtn.style.display === "inline-block")
                                            document.querySelector('#advancedownload-json' + chartId + ' ' + 'img').setAttribute('src', apiEndpoint + 'arria/images/download_white.png');
                                        else
                                            document.querySelector('#advancedownload-csv' + chartId + ' ' + 'img').setAttribute('src', apiEndpoint + 'arria/images/download_white.png');
                                    }
                                }
                            };

                            /**
                             * @methodOf: Advance UI
                             * @description The function to Expand Custom Mapping Script Field
                             * @returns 
                             */

                            advanceCustomScriptElement.onclick = function () {
                                let arrowImg = document.querySelector('#advancecustom-script' + chartId + ' img');
                                if (advanceScriptInputSimpleElement.style.display === "block") {
                                    advanceScriptInputSimpleElement.style.display = "none";
                                    advanceCustomScriptElement.classList.remove("active");
                                    arrowImg.setAttribute('src', apiEndpoint + 'arria/images/arrow_white.png');
                                } else {
                                    advanceScriptInputSimpleElement.style.display = "block";
                                    advanceCustomScriptElement.classList.add("active");
                                    arrowImg.setAttribute('src', apiEndpoint + 'arria/images/arrow_up_black.png');
                                }
                            };

                            /**
                             * @methodOf: Advance UI Dynamic Header
                             * @description The Function Remove Dynamic Headers
                             * @returns 
                             */
                            removeDynamicHeaderBtn.onclick = function () {
                                let elementCount = document.querySelector('#advance-mode' + chartId + ' .dynamic-header .append-container').childElementCount;
                                let authHeader = document.querySelector('#advance-mode' + chartId + ' .dynamic-header .append-container .auth-header:last-child');
                                if (elementCount >= 1)
                                    authHeader.parentNode.removeChild(authHeader);
                                if (elementCount === 1 || elementCount === 0)
                                    removeDynamicHeaderBtn.style.display = "none";
                            }

                            /**
                             * @methodOf: Insight Remove Header
                             * @description The Function Remove Insight Headers
                             * @returns 
                             */
                            removeInsightHeaderBtn.onclick = function () {
                                let elementInsightCount = document.querySelector('#advance-mode' + chartId + ' .insight-content .append-container').childElementCount;
                                let authInsightHeader = document.querySelector('#advance-mode' + chartId + ' .insight-content .append-container .auth-header:last-child');
                                if (elementInsightCount >= 1)
                                    authInsightHeader.parentNode.removeChild(authInsightHeader);
                                if (elementInsightCount === 1 || elementInsightCount === 0)
                                    removeInsightHeaderBtn.style.display = "none";
                            }

                            /**
                             * @methodOf: Wrapper Remove Header
                             * @description The Function Remove Wrapper Headers
                             * @returns 
                             */
                            removeWrapperHeaderBtn.onclick = function () {
                                let elementWrapperCount = document.querySelector('#advance-mode' + chartId + ' .wrapper-content .append-container').childElementCount;
                                let authWrapperHeader = document.querySelector('#advance-mode' + chartId + ' .wrapper-content .append-container .auth-header:last-child');
                                if (elementWrapperCount >= 1)
                                    authWrapperHeader.parentNode.removeChild(authWrapperHeader);
                                if (elementWrapperCount === 1 || elementWrapperCount === 0)
                                    removeWrapperHeaderBtn.style.display = "none";
                            }

                            /**
                             * @methodOf: Simple UI
                             * @description The function to Expand CSV Methods
                             * @returns 
                             */
                            simpleCSVPayload.onclick = function () {
                                let arrowImg = document.querySelector('#csv-payload' + chartId + ' img');
                                if (simpleCSVContainer.style.display === "block") {
                                    simpleCSVContainer.style.display = "none";
                                    simpleCSVPayload.classList.remove('active');
                                    arrowImg.setAttribute('src', apiEndpoint + 'arria/images/arrow_white.png');
                                } else {
                                    simpleCSVContainer.style.display = "block";
                                    simpleCSVPayload.classList.add('active');
                                    arrowImg.setAttribute('src', apiEndpoint + 'arria/images/arrow_up_black.png');
                                }
                            };

                            /**
                             * @methodOf: Advance UI
                             * @description The function to Expand CSV Methods
                             * @returns 
                             */
                            advanceCSVPayload.onclick = function () {
                                let arrowImg = document.querySelector('#advance-csvpayload' + chartId + ' img');
                                if (advanceCSVContainer.style.display === "block") {
                                    advanceCSVContainer.style.display = "none";
                                    advanceCSVPayload.classList.remove('active');
                                    arrowImg.setAttribute('src', apiEndpoint + 'arria/images/arrow_white.png');
                                } else {
                                    advanceCSVContainer.style.display = "block";
                                    advanceCSVPayload.classList.add('active');
                                    arrowImg.setAttribute('src', apiEndpoint + 'arria/images/arrow_up_black.png');
                                }
                            }


                            /**
                             * @methodOf: Out of Box Expand Row
                             * @description Out of Box Expand Row
                             * @returns 
                             */
                            document.body.onclick = function (event) {
                                if (targetElement === "narrativeView") {
                                    if (event.target['className'] !== "dropdown") {
                                        let optionContainers = document.querySelectorAll('.drop-select');
                                        for (let optionIndex = 0; optionIndex < optionContainers.length; optionIndex++) {
                                            optionContainers[optionIndex].style.display = "none";
                                        }
                                    }
                                } else {
                                    let target = event.target['className'].split(' ');
                                    if (target[2] === undefined || target[2] === null)
                                        target[2] = "";
                                    if (event.target['className'] === "card-header" + " " + target[1] || event.target['className'] === "card-toggle" + " " + target[1] || event.target['className'] === "card-header" + " " + target[1] + " " + target[2] || event.target['className'] === "card-toggle" + " " + target[1] + " " + target[2]) {
                                        if (target[1].indexOf("accordian-summary") === -1 && target[1].indexOf("accordian-thing") === -1 && target[1].indexOf("accordian-everything") === -1) {
                                            let element = document.getElementById(target[1]);
                                            var classList = JSON.stringify(element.classList);
                                            if (classList.indexOf('active') !== -1)
                                                element.classList.remove('active');
                                            else
                                                element.classList.add('active');
                                        }
                                    }
                                }

                            }

                            /**
                             * @methodOf: Generate OOTB Narrative Event
                             * @description The function to Generate OOTB UI Narration
                             * @returns 
                             */
                            ootb_generateBtn.onclick = function () {
                                if (!window.navigator.onLine) {
                                    showModal("You are offline. Please check that you are connected to the Internet", chartId);
                                    return;
                                }
                                let pageLoader = document.getElementById('pageloader' + chartId);
                                pageLoader.style.display = "block";
                                generateBtnClicked = true;
                                generateOOTBNarrative();
                                presistOrderColumns();
                            }

                            /**
                             * @methodOf: OOTB Presist Column
                             * @description The Function to Presist OOTB Columns
                             * @returns 
                             */
                            function presistOrderColumns() {
                                let columns = ootbModel.narrativeConfigMetaData.characterization;
                                let visualColumns = [];
                                for (let i = 0; i < columns.length; i++) {
                                    if (columns[i].attributeType === "dimension") {
                                        visualColumns.push({
                                            "name": columns[i].attributeName,
                                            "measure": false
                                        });
                                    } else {
                                        visualColumns.push({
                                            "name": columns[i].attributeName,
                                            "measure": true,
                                            "measureType": 'sum'
                                        });
                                    }
                                }
                                let dragAnalysis = {};
                                let analysisColumn = document.querySelectorAll('#tell-what' + chartId + ' ' + ' .card');
                                for (let i = 0; i < analysisColumn.length; i++) {
                                    let disablerow = JSON.stringify(analysisColumn[i].classList);
                                    let id = analysisColumn[i].getAttribute('id');
                                    id = id.replace(chartId, '');
                                    if (id !== "analysisNonDrag") {
                                        if (disablerow.indexOf('disable') !== -1)
                                            dragAnalysis[id] = false;
                                        else
                                            dragAnalysis[id] = true;
                                    }
                                }
                                presistData["analysis"] = JSON.stringify(dragAnalysis);
                                presistData["columns"] = [];
                                presistData["columns"] = JSON.stringify(visualColumns);
                                savePresistData(presistData);
                            }

                            /**
                             * @methodOf: Fetch DrillDown
                             * @description The Function to  Fetch DrillDown
                             * @returns 
                             */
                            function fetchDrillDownData(layout) {
                                try {
                                    var existingDropDowns = drillDownLayout.children;
                                    var existingDropDownLength = existingDropDowns.length;
                                    for (var i = 0; i < existingDropDownLength; i++) {
                                        var id = existingDropDowns[i].getAttribute("id");
                                        var tableName = existingDropDowns[i].getAttribute("tableName");
                                        if (id.indexOf("asParentDiv") !== -1) {
                                            if (!drillDownDataKeys.includes(tableName)) {
                                                let dropDownEl = document.getElementById(id);
                                                if (dropDownEl.children[0] !== undefined || dropDownEl.children[0] !== null) {
                                                    dropDownEl.removeChild(dropDownEl.children[0]);
                                                    dropDownEl.style.display = "none";
                                                }
                                            }
                                        }
                                    }
                                } catch (e) {
                                    console.log(e);
                                }
                                try {
                                    for (var item = 0; item < drillDownCount; item++) {
                                        var drillDownKey = drillDownDataKeys[item];
                                        var index = drillDownKey.replace("drillDown", "");
                                        var divId = "ddf" + index + "asDiv" + chartId;
                                        var parentDivId = "ddf" + index + "asParentDiv" + chartId;
                                        var labelId = "ddf" + index + "asLabel" + chartId;
                                        var dropdownId = "ddf" + index + "asDropdown" + chartId;
                                        var label = drillDownUserData[drillDownKey]["label"];
                                        var fields = drillDownUserData[drillDownKey]["fields"];
                                        if (fields !== undefined && fields !== null)
                                            fields = fields.split(",");
                                        var parentDiv = document.getElementById(parentDivId);
                                        if (parentDiv === undefined || parentDiv === null) {
                                            var parentDivEl = document.createElement("div");
                                            parentDivEl.setAttribute("id", parentDivId);
                                            parentDivEl.setAttribute("tableName", drillDownKey);
                                            parentDivEl.setAttribute("class", "dd-ParentDiv");
                                            parentDivEl.style.maxWidth = drillDownWidth + "%";
                                            drillDownLayout.appendChild(parentDivEl);
                                        }
                                        var divEl = document.getElementById(divId);
                                        if (divEl === undefined || divEl === null) {
                                            var divElement = document.createElement("div");
                                            divElement.setAttribute("id", divId);
                                            divElement.setAttribute("class", 'dropparent');
                                            var labelElement = document.createElement("Label");
                                            labelElement.innerHTML = label;
                                            labelElement.setAttribute("id", labelId);
                                            divElement.appendChild(labelElement);
                                            let selectElement = document.createElement("select");
                                            selectElement.setAttribute("id", dropdownId);
                                            selectElement.setAttribute("tableName", drillDownKey);
                                            selectElement.setAttribute("position", index);
                                            divElement.appendChild(selectElement);
                                            let selectContainer = document.createElement('div');
                                            selectContainer.setAttribute("id", "dropcontainer" + dropdownId);
                                            selectContainer.setAttribute("class", "select-container");
                                            divElement.appendChild(selectContainer);
                                            let ulElement = document.createElement('ul');
                                            ulElement.setAttribute("id", "dropDown" + dropdownId);
                                            ulElement.setAttribute("class", "drop-select");
                                            ulElement.setAttribute("tableName", drillDownKey);
                                            ulElement.setAttribute("position", index);
                                            selectContainer.appendChild(ulElement);
                                            let selectBox = document.createElement('div');
                                            selectBox.setAttribute("id", "select" + dropdownId);
                                            selectBox.setAttribute("tableName", drillDownKey);
                                            selectBox.setAttribute("class", "dropdown");
                                            selectBox.innerHTML = fields[0];
                                            selectContainer.appendChild(selectBox);
                                            selectElement.style.display = "none";
                                            parentDiv = document.getElementById(parentDivId);
                                            if (parentDiv !== undefined && parentDiv !== null) {
                                                parentDiv.appendChild(divElement);
                                                parentDiv.style.display = "table";
                                            }
                                            selectElement.addEventListener(
                                                'change',
                                                function () {
                                                    var tableName = this.getAttribute("tableName");
                                                    var indexPos = this.getAttribute("position");
                                                    var key = drillDownUserData[drillDownDataKeys[indexPos]]["key"];
                                                    onDrillDownFilterChange(key, this.value, indexPos);
                                                },
                                                false
                                            );
                                            selectBox.addEventListener('click', function () {
                                                let getElement = this.parentElement.getAttribute('id');
                                                let dropDownContainer = document.querySelector('#' + getElement + " " + "ul");
                                                if (dropDownContainer.style.display === "block")
                                                    dropDownContainer.style.display = "none";
                                                else
                                                    dropDownContainer.style.display = "block";
                                            });
                                        } else {
                                            var labelElement = document.getElementById(labelId);
                                            if (labelElement !== undefined && labelElement !== null)
                                                labelElement.innerHTML = label;
                                        }
                                        let dropDownElement = document.getElementById("dropDown" + dropdownId);
                                        dropDownElement.innerHTML = "";
                                        var fieldKey = drillDownUserData[drillDownKey]["key"];
                                        var drillDownFilterElement = document.getElementById(dropdownId);
                                        drillDownFilterElement.innerHTML = "";
                                        for (var i = 0; i < fields.length; i++) {
                                            var optionData = fields[i];
                                            var optionId = (fieldKey.trim() + "_" + index + "_" + optionData.trim()).replace(/\s/g, "_" + index + "_");
                                            optionId = optionId + chartId;
                                            var optionEl = document.getElementById(optionId);
                                            if (optionEl == undefined || optionEl == null) {
                                                var option = document.createElement("option");
                                                option.text = optionData;
                                                option.value = optionData;
                                                option.id = optionId;
                                                if (drillDownFilterElement !== undefined && drillDownFilterElement !== null)
                                                    drillDownFilterElement.appendChild(option);
                                            }
                                            let liEl = document.getElementById("drop" + optionId);
                                            if (liEl == undefined || liEl == null) {
                                                let li = document.createElement('li');
                                                li.id = "drop" + optionId;
                                                li.innerHTML = optionData;
                                                if (dropDownElement !== undefined && dropDownElement !== null) {
                                                    dropDownElement.appendChild(li);
                                                    li.addEventListener('click', function () {
                                                        let dropdownId = this.parentElement.getAttribute('id');
                                                        dropdownId = dropdownId.substr(8); //dropDownddf1asDropdown 
                                                        let dropDownValue = this.innerHTML;
                                                        let select = document.getElementById(dropdownId);
                                                        select.value = dropDownValue;
                                                        let event = new Event('change');
                                                        select.dispatchEvent(event);
                                                        let selectElement = document.getElementById("select" + dropdownId);
                                                        selectElement.innerHTML = dropDownValue;
                                                        let optionContainers = document.querySelectorAll('.drop-select');
                                                        for (let optionIndex = 0; optionIndex < optionContainers.length; optionIndex++) {
                                                            optionContainers[optionIndex].style.display = "none";
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    }

                                } catch (error) {
                                    console.log(error);
                                }
                            };

                            function callNarratives() {
                                if (targetElement == "narrativeView") {
                                    let narrativePresistData = (presistData["narrativeText"] == undefined) ? "" : presistData["narrativeText"].trim();
                                    narrativeContainer.innerHTML = narrativePresistData;
                                    narrativeSection.style.display = "block";
                                    narrativeTabElement.style.display = "none";
                                    outofTabElement.style.display = "none";
                                    headerSection.style.display = "none";
                                    pageloader.style.display = "block";
                                    if (targetView == "ootb") {
                                        generateOOTBNarrative();
                                    } else {
                                        if (targetView == "simple") {
                                            if (scriptInputSimpleElement.value != "") {
                                                customMappingScript();
                                            } else {
                                                customScriptAppendElement.value = "";
                                            }
                                            callUpdate(narratorUrl.value.trim());
                                        } else {
                                            if (advanceScriptInputSimpleElement.value != "") {
                                                customMappingScript();
                                            } else {
                                                customScriptAppendElement.value = "";
                                            }
                                            callNarrativeForAdvance();
                                        }
                                    }
                                } else {
                                    if (presistData["targetView"] != undefined) {
                                        targetView = presistData["targetView"];
                                        if (targetView == "ootb") {
                                            outofTabElement.style.display = "block";
                                            tabBoxElement.classList.add('active');
                                            tabNarrativeElement.classList.remove('active');
                                            narrativeTabElement.style.display = "none";
                                            let summaryView = document.getElementById('tell-summary' + chartId);
                                            if (summaryView.style.display == "block") {
                                                ootb_generateBtn.removeAttribute('disabled');
                                            } else {
                                                ootb_generateBtn.setAttribute('disabled', 'disabled');
                                            }
                                        } else {
                                            outofTabElement.style.display = "none";
                                            tabBoxElement.classList.remove('active');
                                            tabNarrativeElement.classList.add('active');
                                            narrativeTabElement.style.display = "block";
                                            if (targetView == "simple") {
                                                checkSliderBtn.checked = false;
                                                enableOpenStudioBtn(narratorUrl);
                                            } else {
                                                checkSliderBtn.checked = true;
                                                enableOpenStudioBtn(narratorUrl_advance);
                                                //enableStudioType(narratorUrl_advance);
                                            }
                                            initialViewVisibility();
                                        }
                                    }
                                }
                            }

                            /**
                             * @methodOf: On Change Drill Down Data
                             * @description The Function to Change Drilldown Fields
                             * @returns key, select value, index
                             */
                            function onDrillDownFilterChange(key, selectedValue, index) {
                                drillDownUserData = getDrillDownUserInputData(layout) || {};
                                drillDownDataKeys = Object.keys(drillDownUserData);
                                drillDownCount = drillDownDataKeys.length;
                                dataModel["dataset"][0].drillDowns = [];
                                for (var dd = 0; dd < drillDownCount; dd++) {
                                    var drillDownKey = drillDownDataKeys[dd];
                                    var index = drillDownKey.replace("drillDown", "");
                                    var dropdownId = "ddf" + index + "asDropdown" + chartId;
                                    let existingDropDown = document.getElementById(dropdownId);
                                    if (existingDropDown !== undefined && existingDropDown !== null) {
                                        var keyValue = drillDownUserData[drillDownKey]["key"];
                                        if (keyValue !== "") {
                                            var drillDown = {};
                                            drillDown[keyValue] = existingDropDown.value;
                                            dataModel["dataset"][0].drillDowns.push(drillDown);
                                        }
                                    }
                                }
                                drillDownFilter = true;
                                presistData["drillDownData"] = dataModel.dataset[0].drillDowns;
                                savePresistData(presistData);
                            }

                            /**
                             * @methodOf: Get Drilldown Position
                             * @description The Function to get drilldown Property
                             * @returns key, select value, index
                             */
                            function getDrillDownUserInputData(layout) {
                                var value = {};
                                for (var i = 0; i < drillDownFilterCount; i++) {
                                    var itemName = "drillDown" + i;
                                    let keyProperty = "drillDownFilterKey" + i;
                                    let labelProperty = "drillDownFilterLbl" + i;
                                    let fldNameProperty = "drillDownFilterVal" + i;
                                    var key = layout[keyProperty] || "";
                                    var label = layout[labelProperty] || "";
                                    var fields = layout[fldNameProperty] || "";
                                    if (key !== "" && label !== "" && fields !== "") {
                                        value[itemName] = {
                                            "key": key,
                                            "label": label,
                                            "fields": fields
                                        }
                                    }
                                }
                                return value;
                            }

                            /**
                             * @methodOf: initFunction
                             * @description The function to Intialize Element Function
                             * @returns 
                             */
                            function initialViewVisibility() {
                                if (narrativeSection.style.display !== "block") {
                                    if (narrativeTabElement.style.display !== "block") {
                                        if (targetView === "ootb") {
                                            tabBoxElement.classList.add('active');
                                            tabNarrativeElement.classList.remove('active');
                                            outofTabElement.style.display = "block";
                                            narrativeTabElement.style.display = "none";
                                            let summaryContainer = document.getElementById('tell-summary' + chartId);
                                            if (summaryContainer.style.display === "block")
                                                ootb_generateBtn.removeAttribute('disabled', true);
                                            else
                                                ootb_generateBtn.setAttribute('disabled', true);
                                            $("#qlikContainer" + chartId + " " + "header").css({
                                                "border-bottom": "2px solid #1382bc"
                                            });
                                        } else {
                                            tabBoxElement.classList.remove('active');
                                            tabNarrativeElement.classList.add('active');
                                            outofTabElement.style.display = "none";
                                            narrativeTabElement.style.display = "block";
                                        }
                                    } else {
                                        $("#qlikContainer" + chartId + " " + "header").css({
                                            "border-bottom": "2px solid #1db5ac"
                                        });
                                        tabBoxElement.classList.remove('active');
                                        outofTabElement.style.display = "none";
                                        narrativeTabElement.style.display = "block";
                                        tabNarrativeElement.classList.add('active');
                                        if (checkSliderBtn.checked) {
                                            advance_studio_toggle.checked = studioProjectEnabledFlg;
                                            if (studioProjectEnabledFlg)
                                                advance_studio_type.style.display = "inline-block"
                                            else
                                                advance_studio_type.style.display = "none"
                                            simpleUiContainer.style.display = "none";
                                            advanceUiContainer.style.display = "block";
                                            simpleText.classList.remove('active');
                                            advanceText.classList.add('active');
                                            if (describeTbl && advance_studio_toggle.checked) {
                                                advanceTableBtn.checked = true;
                                                advancedownloadJsonBtn.style.display = "none";
                                                advancedownloadCsvBtn.style.display = "inline-block";
                                                advanceCSVPayloadDiv.style.display = "inline-block";
                                                advanceCustomScriptElement.parentElement.setAttribute("class", "col-md-4 export");
                                                advanceDatasetJsonElement.parentElement.setAttribute("class", "col-md-4 data-json");
                                                if (advanceExport.style.display === "block")
                                                    document.querySelector('#advancedata-json' + chartId + ' .col-md-6').innerHTML = '<img src="' + apiEndpoint + 'arria/images/arrow_up_black.png" class="arrow"><label>View Dataset in CSV</label>';
                                                else
                                                    document.querySelector('#advancedata-json' + chartId + ' .col-md-6').innerHTML = '<img src="' + apiEndpoint + 'arria/images/arrow_white.png" class="arrow"><label>View Dataset in CSV</label>';
                                                advanceCheckboxContainer.style.display = "block";
                                            } else {
                                                advanceExportBtn.checked = true;
                                                advancedownloadJsonBtn.style.display = "inline-block";
                                                advancedownloadCsvBtn.style.display = "none";
                                                advanceCSVPayloadDiv.style.display = "none";
                                                advanceCustomScriptElement.parentElement.setAttribute("class", "col-md-6 export");
                                                advanceDatasetJsonElement.parentElement.setAttribute("class", "col-md-6 data-json");
                                                if (advanceExport.style.display === "block")
                                                    document.querySelector('#advancedata-json' + chartId + ' .col-md-6').innerHTML = '<img src="' + apiEndpoint + 'arria/images/arrow_up_black.png" class="arrow"><label>View Dataset in JSON</label>';
                                                else
                                                    document.querySelector('#advancedata-json' + chartId + ' .col-md-6').innerHTML = '<img src="' + apiEndpoint + 'arria/images/arrow_white.png" class="arrow"><label>View Dataset in JSON</label>';
                                                advanceCheckboxContainer.style.display = "none";
                                            }
                                            enableOpenStudioBtn(narratorUrl_advance);
                                        } else {
                                            simpleUiContainer.style.display = "block";
                                            advanceUiContainer.style.display = "none";
                                            simpleText.classList.add('active');
                                            advanceText.classList.remove('active');
                                            if (describeTbl) {
                                                simpleTableBtn.checked = true;
                                                downloadJsonBtn.style.display = "none";
                                                downloadCsvBtn.style.display = "inline-block";
                                                simpleCSVPayloadDiv.style.display = "inline-block";
                                                customScriptElement.parentElement.setAttribute("class", "col-md-4 export");
                                                datasetJsonElement.parentElement.setAttribute("class", "col-md-4 data-json");
                                                if (simpleExport.style.display === "block") {
                                                    document.querySelector('#download-csv' + chartId + ' ' + 'img').setAttribute('src', apiEndpoint + 'arria/images/download_white.png');
                                                    document.querySelector('#data-json' + chartId + ' .col-md-6').innerHTML = '<img src="' + apiEndpoint + 'arria/images/arrow_up_black.png" class="arrow"><label>View Dataset in CSV</label>';
                                                } else {
                                                    document.querySelector('#download-csv' + chartId + ' ' + 'img').setAttribute('src', apiEndpoint + 'arria/images/download_white.png');
                                                    document.querySelector('#data-json' + chartId + ' .col-md-6').innerHTML = '<img src="' + apiEndpoint + 'arria/images/arrow_white.png" class="arrow"><label>View Dataset in CSV</label>';
                                                }
                                                simpleCheckboxContainer.style.display = "block";
                                            } else {
                                                simpleExportBtn.checked = true;
                                                downloadJsonBtn.style.display = "inline-block";
                                                downloadCsvBtn.style.display = "none";
                                                simpleCSVPayloadDiv.style.display = "none";
                                                customScriptElement.parentElement.setAttribute("class", "col-md-6 export");
                                                datasetJsonElement.parentElement.setAttribute("class", "col-md-6 data-json");
                                                if (simpleExport.style.display === "block") {
                                                    document.querySelector('#download-json' + chartId + ' ' + 'img').setAttribute('src', apiEndpoint + 'arria/images/download_white.png');
                                                    document.querySelector('#data-json' + chartId + ' .col-md-6').innerHTML = '<img src="' + apiEndpoint + 'arria/images/arrow_up_black.png" class="arrow"><label>View Dataset in JSON</label>';
                                                } else {
                                                    document.querySelector('#download-json' + chartId + ' ' + 'img').setAttribute('src', apiEndpoint + 'arria/images/download_white.png');
                                                    document.querySelector('#data-json' + chartId + ' .col-md-6').innerHTML = '<img src="' + apiEndpoint + 'arria/images/arrow_white.png" class="arrow"><label>View Dataset in JSON</label>';
                                                }
                                                simpleCheckboxContainer.style.display = "none";
                                            }
                                        }
                                        if (checkSliderBtn.checked)
                                            enableOpenStudioBtn(narratorUrl_advance);
                                        else
                                            enableOpenStudioBtn(narratorUrl);
                                    }
                                } else
                                    ootb_generateBtn.setAttribute('disabled', true);
                            }


                            function disableEditMode() {
                                if (qlik.navigation.getMode() === "edit") {
                                    if (!maximize)
                                        disableContainer.style.display = "block";
                                } else {
                                    disableContainer.style.display = "none";
                                }

                            }

                            disableContainer.addEventListener('click', function () {
                                if (document.getElementById('modal' + chartId).style.display == "none") {
                                    document.getElementById('closemodal' + chartId).style.marginBottom = "40px";
                                    showModal("<img class='resize-disable' src='" + apiEndpoint + "arria/images/qs_max_icon.png'> Please use the maximised view for configuration", chartId);
                                }
                            });
                            /**
                             * @methodOf: Simple UI
                             * @description The function to Toggle DataJSON Container
                             * @returns 
                             */

                            function simpleJsonDataView() {
                                downloadCsvBtn.style.display = "none";
                                downloadJsonBtn.style.display = "inline-block";
                                simpleCSVPayloadDiv.style.display = "none";
                                customScriptElement.parentElement.setAttribute("class", "col-md-6 export");
                                datasetJsonElement.parentElement.setAttribute("class", "col-md-6 data-json");
                                describeTbl = false;
                                if (simpleExport.style.display === "block") {
                                    document.querySelector('#download-json' + chartId + ' ' + 'img').setAttribute('src', apiEndpoint + 'arria/images/download_white.png');
                                    document.querySelector('#data-json' + chartId + ' .col-md-6').innerHTML = '<img src="' + apiEndpoint + 'arria/images/arrow_up_black.png" class="arrow"><label>View Dataset in JSON</label>';
                                } else {
                                    document.querySelector('#download-json' + chartId + ' ' + 'img').setAttribute('src', apiEndpoint + 'arria/images/download_white.png');
                                    document.querySelector('#data-json' + chartId + ' .col-md-6').innerHTML = '<img src="' + apiEndpoint + 'arria/images/arrow_white.png" class="arrow"><label>View Dataset in JSON</label>';
                                }
                            }

                            /**
                             * @methodOf: Advance UI
                             * @description The function to Toggle DataJSON Container
                             * @returns 
                             */
                            function advanceJsonDataView() {
                                advancedownloadCsvBtn.style.display = "none";
                                advancedownloadJsonBtn.style.display = "inline-block";
                                advanceCSVPayloadDiv.style.display = "none";
                                advanceCustomScriptElement.parentElement.setAttribute("class", "col-md-6 export");
                                advanceDatasetJsonElement.parentElement.setAttribute("class", "col-md-6 data-json");
                                describeTbl = false;
                                if (advanceExport.style.display === "block") {
                                    document.querySelector('#advancedownload-json' + chartId + ' ' + 'img').setAttribute('src', apiEndpoint + 'arria/images/download_white.png');
                                    document.querySelector('#advancedata-json' + chartId + ' .col-md-6').innerHTML = '<img src="' + apiEndpoint + 'arria/images/arrow_up_black.png" class="arrow"><label>View Dataset in JSON</label>';
                                } else {
                                    document.querySelector('#advancedownload-json' + chartId + ' ' + 'img').setAttribute('src', apiEndpoint + 'arria/images/download_white.png');
                                    document.querySelector('#advancedata-json' + chartId + ' .col-md-6').innerHTML = '<img src="' + apiEndpoint + 'arria/images/arrow_white.png" class="arrow"><label>View Dataset in JSON</label>';
                                }
                            }


                            /**
                             * @methodOf: Toggle Simple Incremet ID
                             * @description The Function to Toggle Simple Incremet ID
                             * @returns 
                             */
                            simpleIncrementBtn.onchange = function () {
                                if (this.checked)
                                    autoIncrementID = true;
                                else
                                    autoIncrementID = false;
                                var presistData = {
                                    "view": "simple",
                                    "check": autoIncrementID
                                }
                                presistSimplecheck = presistData;
                                showData();
                            }
                            /**
                             * @methodOf: Toggle Advance Incremet ID
                             * @description The Function to Toggle Advance Incremet ID
                             * @returns 
                             */
                            advanceIncrementBtn.onchange = function () {
                                if (this.checked)
                                    autoIncrementID = true;
                                else
                                    autoIncrementID = false;
                                var presistData = {
                                    "view": "advance",
                                    "check": autoIncrementID
                                }
                                presistAdvanceCheck = presistData;
                                showData();
                            }

                            /**
                             * @methodOf: Show Data
                             * @description The function to Display the JSON or Table Object
                             * @returns 
                             */

                            function showData() {
                                let jsonElement;
                                var modelData = dataModel.dataset[0];
                                let vars = {};
                                vars["metadata"] = modelData.metadata;
                                vars["measures"] = modelData.measures;
                                vars["column_names"] = modelData.column_names;
                                vars["hierarchies"] = modelData.hierarchies;
                                vars["drillDowns"] = modelData.drillDowns;
                                vars["_id"] = dataModel._id;
                                vars["source"] = dataModel.source;
                                vars["chartType"] = dataModel.chartType;
                                let projectArguments = {
                                    "vars": vars
                                };
                                projectArgumentsNarrative = {
                                    "vars": vars
                                };

                                if (checkSliderBtn.checked) {
                                    jsonElement = document.getElementById('advance-jsonexport' + chartId);
                                    advanceCSVContainer.innerHTML = JSON.stringify(projectArguments);
                                } else {
                                    jsonElement = document.getElementById('simple-jsonexport' + chartId);
                                    simpleCSVContainer.innerHTML = JSON.stringify(projectArguments);
                                }
                                if (describeTbl) {
                                    let csvArr_Data = [];
                                    if (targetView === "simple") {
                                        if (simpleIncrementBtn.checked)
                                            autoIncrementID = true;
                                        else
                                            autoIncrementID = false;
                                    } else if (targetView === "advance") {
                                        if (advanceIncrementBtn.checked)
                                            autoIncrementID = true;
                                        else
                                            autoIncrementID = false;
                                    }
                                    if (autoIncrementID) {
                                        if (csv_columnData[0] !== "_ID") {
                                            csv_columnData.unshift('_ID');
                                            for (var index = 0; index < csv_rowData.length; index++) {
                                                csv_rowData[index].unshift(index + 1);
                                            }
                                        }
                                    } else {
                                        if (csv_columnData[0] === "_ID") {
                                            csv_columnData.splice(0, 1);
                                            for (var index = 0; index < csv_rowData.length; index++) {
                                                csv_rowData[index].splice(0, 1);
                                            }
                                        }
                                    }
                                    csvArr_Data = csvArr_Data.concat(csv_rowData);
                                    csvArr_Data.splice(0, 0, csv_columnData);
                                    csvData = convertToCSV(csvArr_Data);
                                }
                                if (describeTbl)
                                    jsonElement.innerHTML = csvData;
                                else
                                    jsonElement.innerHTML = JSON.stringify(dataModel);
                            }

                            /**
                             * @methodOf: Custom Script
                             * @description The Function Custom Mapping Script
                             * @returns 
                             */
                            function customMappingScript() {
                                let initalScript = document.getElementById('inital-script' + chartId);
                                if (initalScript !== null)
                                    initalScript.parentNode.removeChild(initalScript);
                                let jsonElement = document.getElementById('json-holder' + chartId);
                                if (jsonElement !== null)
                                    jsonElement.parentNode.removeChild(jsonElement);
                                let jsonTag = document.createElement('textarea');
                                jsonTag.setAttribute('id', 'json-holder' + chartId);
                                jsonTag.setAttribute('style', 'display:none;');
                                if (describeTbl)
                                    jsonTag.value = JSON.stringify(projectArgumentsNarrative);
                                else
                                    jsonTag.value = JSON.stringify(dataModel);
                                document.body.appendChild(jsonTag);
                                if (checkSliderBtn.checked)
                                    eval(advanceScriptInputSimpleElement.value);
                                else
                                    eval(scriptInputSimpleElement.value);
                            };

                            /**
                             * @methodOf: Get Data
                             * @description The function to Get Data from Tableau
                             * @returns 
                             */
                            function getData() {
                                let json_holderEl = document.getElementById('json-holder' + chartId);
                                var data = json_holderEl.value;
                                if (data !== "") {
                                    if (data !== undefined && data !== null)
                                        data = data.trim();
                                    data = JSON.parse(data);
                                }
                                return data;
                            };

                            /**
                             * @methodOf: Set Data
                             * @description The function to Set Data to Tableau
                             * @returns 
                             */
                            function setData(data) {
                                let jsbuilderoutputEL = document.getElementById('jsbuilderoutput' + chartId);
                                jsbuilderoutputEL.value = JSON.stringify(data);
                            };

                            /**
                             * @methodOf: Simple UI
                             * @description Export CSV and JSON Data
                             * @returns 
                             */
                            function downloadCSV_Data() {
                                let params = "";
                                var objArray = [];
                                objArray = objArray.concat(csv_rowData);
                                objArray.splice(0, 0, csv_columnData);
                                var inputData = JSON.stringify({
                                    "data": objArray
                                });
                                inputData = inputData.replace(/\s\s+/g, ' ');
                                params = "data=" + encodeURIComponent(inputData);
                                let xmlCall = new XMLHttpRequest();
                                validateWrapperURL();
                                xmlCall.open('POST', apiEndpoint + "arria/saveCSVfile");
                                xmlCall.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                                if (targetView === "advance") {
                                    let wrapperUrl = document.getElementById('wrapperURL' + chartId);
                                    if (wrapperUrl.value !== "")
                                        appendWrapperHeaders(xmlCall);
                                    else
                                        xmlCall.setRequestHeader("Authorization", "Basic " + authorizationValue);
                                } else
                                    xmlCall.setRequestHeader("Authorization", "Basic " + authorizationValue);
                                xmlCall.onreadystatechange = () => {
                                    if (xmlCall.readyState === XMLHttpRequest.DONE)
                                        window.open(apiEndpoint + 'arria/download?id=' + xmlCall.responseText + "&ext=csv");
                                }
                                if (window.navigator.onLine)
                                    xmlCall.send(params);
                                else
                                    showModal("You are offline. Please check that you are connected to the Internet", chartId);
                            };

                            /**
                             * @methodOf: Extract HostName
                             * @description The Function to Expand Url in Studio
                             * @returns 
                             */
                            function extractHostname(url) {
                                var hostname;
                                if (url.indexOf("//") > -1)
                                    hostname = url.split('/')[2];
                                else
                                    hostname = url.split('/')[0];
                                hostname = hostname.split(':')[0];
                                hostname = hostname.split('?')[0];
                                return hostname;
                            };

                            /**
                             * @methodOf: Simple UI
                             * @description Export CSV and JSON Data
                             * @returns 
                             */
                            function downloadJSON_Data() {
                                let jsonElement;
                                if (checkSliderBtn.checked)
                                    jsonElement = document.getElementById('advance-jsonexport' + chartId);
                                else
                                    jsonElement = document.getElementById('simple-jsonexport' + chartId);
                                let params = "";
                                let customScriptData = "";
                                if (checkSliderBtn.checked)
                                    customScriptData = advanceScriptInputSimpleElement.value;
                                else
                                    customScriptData = scriptInputSimpleElement.value;
                                if (customScriptData === "")
                                    customScriptAppendElement.value = "";
                                else
                                    customMappingScript();
                                if (customScriptAppendElement.value !== "")
                                    params = "data=" + encodeURIComponent(customScriptAppendElement.value);
                                else
                                    params = "data=" + encodeURIComponent(jsonElement.textContent);
                                let xmlCall = new XMLHttpRequest();
                                validateWrapperURL();
                                xmlCall.open('POST', apiEndpoint + "arria/savefile");
                                xmlCall.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                                if (targetView === "advance") {
                                    let wrapperUrl = document.getElementById('wrapperURL' + chartId);
                                    if (wrapperUrl.value !== "")
                                        appendWrapperHeaders(xmlCall);
                                    else
                                        xmlCall.setRequestHeader("Authorization", "Basic " + authorizationValue);
                                } else
                                    xmlCall.setRequestHeader("Authorization", "Basic " + authorizationValue);

                                xmlCall.onreadystatechange = () => {
                                    if (xmlCall.readyState === XMLHttpRequest.DONE)
                                        window.open(apiEndpoint + 'arria/download?id=' + xmlCall.responseText + "&ext=json");
                                }
                                if (window.navigator.onLine)
                                    xmlCall.send(params);
                                else
                                    showModal("You are offline. Please check that you are connected to the Internet", chartId);
                            }

                            /**
                             * @methodOf: Enable Open Studio
                             * @description The Function to Identify Studio Project
                             * @returns 
                             */
                            function enableOpenStudioBtn(narratorUrl) {
                                var url = narratorUrl.value;
                                if (url == "") {
                                    openStudioBtn.disabled = true;
                                    openStudioBtn.style.backgroundColor = "#4d4d4d";
                                } else if (url.indexOf("studio.arria.com:443/alite_content_generation_webapp/text/") != -1 && url.split("text/").splice(-1) != "") {
                                    openStudioBtn.disabled = false;
                                    openStudioBtn.style.backgroundColor = "#00a9ce";
                                } else if (checkSliderBtn.checked && advance_studio_toggle.checked && url_Pattern.test(url)) {
                                    openStudioBtn.disabled = false;
                                    openStudioBtn.style.backgroundColor = "#00a9ce";
                                } else {
                                    openStudioBtn.disabled = true;
                                    openStudioBtn.style.backgroundColor = "#4d4d4d";
                                }
                            }

                            /**
                             * @methodOf: Enable Open Studio
                             * @description The Function to Identify Studio Project
                             * @returns 
                             */
                            function enableStudioType(url) {
                                if (url.value.indexOf("studio.arria.com") != -1) {
                                    if (!advance_studio_toggle.checked) {
                                        advance_studio_toggle.checked = true;
                                        advance_studio_toggle.onchange();
                                    }
                                } else {
                                    if (advance_studio_toggle.checked) {
                                        advance_studio_toggle.checked = false;
                                        advance_studio_toggle.onchange();
                                    }
                                }
                            }
                            /**
                             * @methodOf: Generate Narrative
                             * @description The function to Generate Simple UI Narration
                             * @returns 
                             */

                            function generateNarrative() {
                                try {
                                    spinner.style.display = "inline";
                                    if (!checkSliderBtn.checked) {
                                        if (scriptInputSimpleElement.value !== "")
                                            customMappingScript();
                                        else
                                            customScriptAppendElement.value = "";
                                        if (narratorUrl.value === "" || !narratorUrl.value.match(/((https:\/\/)+(\w.)+(studio.arria.com)+(:[0-9]{2,6}\/)+(alite_content_generation_webapp\/text\/)+[-a-zA-Z0-9])|(http:\/\/studio.arria.com\/)/g)) {
                                            spinner.style.display = "none";
                                            showModal("Please enter a valid Studio Project URL", chartId);
                                        } else if (authValueElement.value == "") {
                                            spinner.style.display = "none";
                                            showModal("Please enter a valid API Key", chartId);
                                        } else {
                                            presistData["url"] = narratorUrl.value;
                                            presistData["authKey"] = "Authorization"; //authKeyElement.value;
                                            presistData["authValue"] = authValueElement.value;
                                            presistData["customScript"] = scriptInputSimpleElement.value;
                                            if (presistSimplecheck !== "")
                                                presistData["autoIncrementData"] = JSON.stringify(presistSimplecheck);
                                            if (presistAdvanceCheck !== "")
                                                presistData["autoAdvanceIncrementData"] = JSON.stringify(presistAdvanceCheck);
                                            savePresistData(presistData);
                                            callUpdate(narratorUrl.value);
                                        }
                                    } else {
                                        if (advanceScriptInputSimpleElement.value !== "")
                                            customMappingScript();
                                        else
                                            customScriptAppendElement.value = "";
                                        if (narratorUrl_advance.value === "") {
                                            spinner.style.display = "none";
                                            showModal("Please enter a valid NLG Service URL", chartId);
                                        } else
                                            callNarrativeForAdvance();
                                    }
                                } catch (e) {
                                    console.log(e);
                                }

                            };

                            /**
                             * @methodOf: Common Function
                             * @description The function to Open Modal Popup
                             * @returns 
                             */
                            function showModal(data, chartId) {
                                $("#modaldata" + chartId).html(data);
                                $("#modal" + chartId).show();
                                $("#narratorUrl" + chartId).focus();
                            }

                            function savePresistData(data) {
                                chartObj.presistData = data;
                                _this.backendApi.setProperties(chartObj);

                            }

                            /**
                             * @methodOf: Advance View Get Headers
                             * @description The Function to get Advance View Headers
                             * @returns 
                             */
                            function callNarrativeForAdvance() {
                                let pageLoader = document.getElementById('pageloader' + chartId);
                                if (pageLoader.style.display === "none")
                                    pageLoader.style.display = "block";
                                var type = 2;
                                var nlg_service_headers = getNLGServiceURLHeaders();
                                if (JSON.stringify(nlg_service_headers) != "{}" || narratorUrl_advance.value.indexOf("studio.arria.com") == -1) {
                                    var insights_service_headers = getInsightsURLHeaders();
                                    var wrapper_service_headers = getWrapperURLHeaders();
                                    var headersData = {
                                        "insights_service_headers": insights_service_headers,
                                        "wrapper_service_headers": wrapper_service_headers,
                                        "nlg_service_headers": nlg_service_headers
                                    };
                                    var advancePresistData = {
                                        "nlgService": {
                                            "url": narratorUrl_advance.value,
                                            "headers": nlg_service_headers
                                        },
                                        "insightService": {
                                            "url": insightsURL.value,
                                            "headers": insights_service_headers
                                        },
                                        "wrapperService": {
                                            "url": wrapperURL.value,
                                            "headers": wrapper_service_headers
                                        }
                                    }
                                    presistData["advance_data"] = advancePresistData;
                                    presistData["advance_customScript"] = advanceScriptInputSimpleElement.value;
                                    if (presistSimplecheck !== "")
                                        presistData["autoIncrementData"] = JSON.stringify(presistSimplecheck);
                                    if (presistAdvanceCheck != "")
                                        presistData["autoAdvanceIncrementData"] = JSON.stringify(presistAdvanceCheck);
                                    savePresistData(presistData);
                                    if (insightsURL.value !== "")
                                        type = 2;
                                    else
                                        type = 1;
                                    callGenerateTxtForAdvance(type, headersData);
                                } else {
                                    spinner.style.display = "none";
                                    showModal("Please enter a valid Header Key/Value pair", chartId);
                                }
                            }


                            /**
                             * @methodOf: Advance Generate Narration
                             * @description The Function to Generate Narration
                             * @returns 
                             */
                            function callGenerateTxtForAdvance(type, headerData) {
                                let narrativeSection = document.getElementById('narrative-section' + chartId);
                                let narrativeContainer = document.getElementById('narrative-container' + chartId);
                                let outofTabElement = document.getElementById('outofbox-tabsection' + chartId);
                                let narrativeTabElement = document.getElementById('narrative-tabsection' + chartId);
                                let insightsURL = document.getElementById("insightsURL" + chartId);
                                let wrapperURL = document.getElementById("wrapperURL" + chartId);
                                let narratorUrl_advance = document.getElementById('narratorUrl_advance' + chartId);
                                let url = "";
                                let headers;
                                let outputData = "";
                                let inputData = "";
                                let xmlhttp = new XMLHttpRequest();
                                if (type === 2) {
                                    url = insightsURL.value;
                                    headers = headerData.insights_service_headers;
                                } else {
                                    url = narratorUrl_advance.value;
                                    headers = headerData.nlg_service_headers;
                                }
                                try {
                                    xmlhttpConfiguration(xmlhttp);
                                    xmlhttp.onreadystatechange = () => {
                                        let narrative;
                                        // xmlhttp Ready State 
                                        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
                                            if (xmlhttp.responseText !== "undefined") {
                                                narrative = JSON.parse(xmlhttp.responseText);
                                                if (narrative["type"]) {
                                                    if (type === 2) {
                                                        let formattedModel = {};
                                                        try {
                                                            type = type - 1;
                                                            url = narratorUrl_advance.value;
                                                            headers = headerData.nlg_service_headers;
                                                            if (studioProjectEnabledFlg) {
                                                                if (describeTbl) {
                                                                    var csvColumnData = csv_columnData;
                                                                    var csvRowData = csv_rowData;
                                                                    if (!advanceIncrementBtn.checked) {
                                                                        if (csvColumnData[0] === "_ID") {
                                                                            csvColumnData.splice(0, 1);
                                                                            for (var i = 0; i < csvRowData.length; i++) {
                                                                                csvRowData[i].splice(0, 1);
                                                                            }
                                                                        }
                                                                    }
                                                                    let data = {};
                                                                    let vars = {};
                                                                    data["id"] = "Primary";
                                                                    data["type"] = "2d";
                                                                    data["dataSet"] = [];
                                                                    data["dataSet"] = data["dataSet"].concat(csvRowData);
                                                                    data["dataSet"].splice(0, 0, csvColumnData);
                                                                    formattedModel["data"] = [];
                                                                    formattedModel["data"].push(data);
                                                                    if (customScriptAppendElement.value == "") {
                                                                        vars["metadata"] = model.dataset[0].metadata;
                                                                        vars["measures"] = model.dataset[0].measures;
                                                                        vars["column_names"] = model.dataset[0].column_names;
                                                                        vars["hierarchies"] = model.dataset[0].hierarchies;
                                                                        vars["drillDowns"] = model.dataset[0].drillDowns;
                                                                        vars["_id"] = model._id;
                                                                        vars["source"] = model.source;
                                                                        vars["chartType"] = model.chartType;
                                                                        formattedModel["projectArguments"] = {
                                                                            "vars": vars
                                                                        };
                                                                    } else {
                                                                        if (typeof (model) !== "object")
                                                                            model = JSON.parse(model)
                                                                        formattedModel["projectArguments"] = model;
                                                                    }
                                                                    formattedModel["options"] = {
                                                                        "nullValueBehaviour": "SHOW_IDENTIFIER"
                                                                    };

                                                                } else {
                                                                    let data = {};
                                                                    data["id"] = "Primary";
                                                                    data["type"] = "json";
                                                                    if (typeof (narrative["data"]) !== "object")
                                                                        data["jsonData"] = JSON.parse(narrative["data"]);
                                                                    else
                                                                        data["jsonData"] = narrative["data"];
                                                                    formattedModel["data"] = [];
                                                                    formattedModel["data"].push(data);
                                                                }
                                                            } else
                                                                formattedModel = JSON.parse(narrative["data"]);
                                                        } catch (error) {
                                                            outputData = "Insights URL response error <br><br>";
                                                            outputData += narrative["data"].trim();
                                                            narrativeContainer.innerHTML = outputData;
                                                            setViewVisibility(outputData);
                                                            return;
                                                        }
                                                        inputData = {
                                                            serviceURL: url,
                                                            headers: headers,
                                                            appData: formattedModel,
                                                            biSource: "qliksense",
                                                            type: type
                                                        };
                                                        if (type === 1 && url.indexOf("/alite_content_generation_webapp/text/") === -1)
                                                            inputData['type'] = 2;
                                                        xmlhttpConfiguration(xmlhttp);
                                                        if (window.navigator.onLine)
                                                            xmlhttp.send(JSON.stringify(inputData));
                                                        else
                                                            showModal("You are offline. Please check that you are connected to the Internet", chartId);
                                                    } else {
                                                        narrativeContainer.innerHTML = "";
                                                        outputData = narrative["data"].trim();
                                                        // Change Color Property based on the reponse type
                                                        if (outputData.indexOf('{color}') != -1) {
                                                            outputData = outputData.replace(/{color}/g, "</span>");
                                                            let replaceStyle = [];
                                                            outputData.replace(/\{(.+?)}/g, function (m, label, data) {
                                                                replaceStyle.push({
                                                                    "label": label,
                                                                    "key": m
                                                                });
                                                            })
                                                            let finalString = "";
                                                            for (let i = 0; i < replaceStyle.length; i++) {
                                                                finalString = outputData;
                                                                outputData = finalString.replace(replaceStyle[i].key, '<span style="' + replaceStyle[i].label + '">');
                                                            }
                                                        }
                                                        narrativeContainer.innerHTML = outputData;
                                                        setViewVisibility(outputData);
                                                    }
                                                } else {
                                                    outputData = narrative["error"].trim();
                                                    if (outputData.includes("401 Unauthorized")) {
                                                        showModal("Please enter a valid Header Key/Value pair", chartId);
                                                        disableLoader();
                                                        return;
                                                    } else if (outputData == "URI is not absolute") {
                                                        showModal("Please enter a valid NLG Service URL", chartId);
                                                        disableLoader();
                                                        return;
                                                    }
                                                    narrativeContainer.innerHTML = outputData;
                                                    setViewVisibility(outputData);
                                                }
                                            } else {
                                                disableLoader();
                                            }
                                        } else {
                                            if (xmlhttp.readyState == 0) {}
                                            console.log("xmlhttp.readyState not done:", xmlhttp.readyState);
                                        }
                                    };
                                    xmlhttp.onerror = function (e) {
                                        if (!window.navigator.onLine)
                                            showModal("You are offline. Please check that you are connected to the Internet", chartId);
                                        else
                                            showModal(e, chartId);
                                        console.log(e);
                                        disableLoader();
                                        outputData = "error";
                                        setViewVisibility(outputData);
                                    };
                                    // Generate API Request Format
                                    let customScriptAppendElement = document.getElementById('jsbuilderoutput' + chartId);
                                    let model;
                                    if (customScriptAppendElement.value !== "")
                                        model = customScriptAppendElement.value;
                                    else {
                                        let jsonElement = document.getElementById('advance-jsonexport' + chartId);
                                        // model = jsonElement.textContent;
                                        model = dataModel;
                                    }
                                    let formattedModel = {};
                                    if (type !== 2 && studioProjectEnabledFlg) {
                                        if (describeTbl) {
                                            if (typeof (model) !== "object")
                                                model = JSON.parse(model);
                                            var csvColumnData = csv_columnData;
                                            var csvRowData = csv_rowData;
                                            if (!advanceIncrementBtn.checked) {
                                                if (csvColumnData[0] === "_ID") {
                                                    csvColumnData.splice(0, 1);
                                                    for (var i = 0; i < csvRowData.length; i++) {
                                                        csvRowData[i].splice(0, 1);
                                                    }
                                                }
                                            }
                                            let data = {};
                                            let vars = {};
                                            data["id"] = "Primary";
                                            data["type"] = "2d";
                                            data["dataSet"] = [];
                                            data["dataSet"] = data["dataSet"].concat(csvRowData);
                                            data["dataSet"].splice(0, 0, csvColumnData);
                                            formattedModel["data"] = [];
                                            formattedModel["data"].push(data);
                                            if (customScriptAppendElement.value == "") {
                                                vars["metadata"] = model.dataset[0].metadata;
                                                vars["measures"] = model.dataset[0].measures;
                                                vars["column_names"] = model.dataset[0].column_names;
                                                vars["hierarchies"] = model.dataset[0].hierarchies;
                                                vars["drillDowns"] = model.dataset[0].drillDowns;
                                                vars["_id"] = model._id;
                                                vars["source"] = model.source;
                                                vars["chartType"] = model.chartType;
                                                formattedModel["projectArguments"] = {
                                                    "vars": vars
                                                };
                                            } else {
                                                if (typeof (model) !== "object")
                                                    model = JSON.parse(model)
                                                formattedModel["projectArguments"] = model;
                                            }
                                            formattedModel["options"] = {
                                                "nullValueBehaviour": "SHOW_IDENTIFIER"
                                            };

                                        } else {
                                            let data = {};
                                            data["id"] = "Primary";
                                            data["type"] = "json";
                                            if (typeof (model) !== "object")
                                                data["jsonData"] = JSON.parse(model);
                                            else
                                                data["jsonData"] = model;
                                            formattedModel["data"] = [];
                                            formattedModel["data"].push(data);
                                        }
                                    } else {
                                        if (typeof (model) !== "object")
                                            formattedModel = JSON.parse(model);
                                        else
                                            formattedModel = model;
                                    }
                                    inputData = {
                                        serviceURL: url,
                                        headers: headers,
                                        appData: formattedModel,
                                        biSource: "qliksense",
                                        type: type
                                    };
                                    if (type === 1 && url.indexOf("/alite_content_generation_webapp/text/") === -1)
                                        inputData['type'] = 2;
                                    if (window.navigator.onLine)
                                        xmlhttp.send(JSON.stringify(inputData));
                                    else
                                        showModal("You are offline. Please check that you are connected to the Internet", chartId);

                                } catch (e) {
                                    console.log(e);
                                    disableLoader();
                                }
                            }

                            function xmlhttpConfiguration(xmlhttp) {
                                validateWrapperURL();
                                xmlhttp.open('POST', apiEndpoint + "arria/nlgAdvanced");
                                xmlhttp.setRequestHeader("Content-Type", "application/json");
                                var wrapperUrl = document.getElementById("wrapperURL" + chartId);
                                if (wrapperUrl.value === "")
                                    xmlhttp.setRequestHeader("Authorization", "Basic " + authorizationValue);
                                xmlhttp.setRequestHeader('userid', fingerPrintKey);
                                appendWrapperHeaders(xmlhttp);
                            }

                            /**
                             * @methodOf: Common Function
                             * @description Validate Wrapper URL
                             * @returns 
                             */
                            function validateWrapperURL() {
                                if (targetView === "simple")
                                    apiEndpoint = defaultApiEndpoint;
                                else {
                                    let wrapperURL = document.getElementById("wrapperURL" + chartId);
                                    if (wrapperURL.value !== "")
                                        apiEndpoint = wrapperURL.value;
                                    else
                                        apiEndpoint = defaultApiEndpoint;
                                }
                            }

                            /**
                             * @methodOf: Append Wrapper Header
                             * @description The Function Append Wrapper Header in Ajax Request
                             * @returns 
                             */
                            function appendWrapperHeaders(xmlhttp) {
                                if (targetView === "advance") {
                                    let elementWrapperCount = document.querySelector('#advance-mode' + chartId + ' .wrapper-content .append-container').childElementCount;
                                    for (var i = 0; i < elementWrapperCount + 1; i++) {
                                        var appendId = i + chartId;
                                        let authKeyEl = document.getElementById("wrapper_authKey_" + appendId);
                                        let authValueEl = document.getElementById("wrapper_authValue_" + appendId);
                                        if (authKeyEl.value === "" && authValueEl.value === "") {
                                            continue;
                                        } else if (authKeyEl.value == "" || authValueEl.value == "") {
                                            showModal("Please enter a valid Header Key/Value pair", chartId);
                                            break;
                                        }
                                        xmlhttp.setRequestHeader([authKeyEl.value], authValueEl.value);
                                    }
                                }
                            }

                            /**
                             * @methodOf: Generate Narrative
                             * @description The Function Generate Simple UI Narrative Text
                             * @returns 
                             */
                            function callUpdate(url) {
                                let pageLoader = document.getElementById('pageloader' + chartId);
                                if (pageLoader.style.display == "none")
                                    pageLoader.style.display = "block";
                                let outputData = "";
                                let xmlhttp = new XMLHttpRequest();
                                let narrativeSection = document.getElementById('narrative-section' + chartId);
                                let narrativeContainer = document.getElementById('narrative-container' + chartId);
                                let outofTabElement = document.getElementById('outofbox-tabsection' + chartId);
                                let narrativeTabElement = document.getElementById('narrative-tabsection' + chartId);
                                try {
                                    let authKey = document.getElementById('authValue' + chartId);
                                    xmlhttp.open('POST', apiEndpoint + "arria/nlg");
                                    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                                    xmlhttp.setRequestHeader("Authorization", "Basic " + authorizationValue);
                                    xmlhttp.setRequestHeader('userid', fingerPrintKey);
                                    xmlhttp.onreadystatechange = () => {
                                        // xmlhttp Ready State 
                                        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
                                            if (xmlhttp.responseText !== "undefined") {
                                                let narrative = JSON.parse(xmlhttp.responseText);
                                                if (narrative["type"]) {
                                                    narrativeContainer.innerHTML = "";
                                                    outputData = narrative["data"].trim();
                                                    // Change Color Property based on the reponse type
                                                    if (outputData.indexOf('{color}') != -1) {
                                                        outputData = outputData.replace(/{color}/g, "</span>");
                                                        let replaceStyle = [];
                                                        outputData.replace(/\{(.+?)}/g, function (m, label, data) {
                                                            replaceStyle.push({
                                                                "label": label,
                                                                "key": m
                                                            });
                                                        })
                                                        let finalString = "";
                                                        for (let i = 0; i < replaceStyle.length; i++) {
                                                            finalString = outputData;
                                                            outputData = finalString.replace(replaceStyle[i].key, '<span style="' + replaceStyle[i].label + '">');
                                                        }
                                                    }
                                                    narrativeContainer.innerHTML = outputData;
                                                } else {
                                                    outputData = narrative["error"].trim();
                                                    if (outputData.includes("401 Unauthorized")) {
                                                        showModal("Please enter a valid API Key", chartId);
                                                        disableLoader();
                                                        return;
                                                    } else if (outputData == "URI is not absolute") {
                                                        showModal("Please enter a valid Studio Project URL", chartId);
                                                        disableLoader();
                                                        return;
                                                    }
                                                    narrativeContainer.innerHTML = outputData;
                                                }
                                                setViewVisibility(outputData);
                                            } else {
                                                disableLoader();
                                            }
                                        } else {
                                            if (xmlhttp.readyState == 0) {}
                                            console.log("xmlhttp.readyState not done:", xmlhttp.readyState);
                                        }
                                    };
                                    xmlhttp.onerror = function (e) {
                                        if (!window.navigator.onLine)
                                            showModal("You are offline. Please check that you are connected to the Internet", chartId);
                                        else
                                            showModal(e, chartId);
                                        disableLoader();
                                        outputData = "error";
                                        setViewVisibility(outputData);
                                    };

                                    // Generate API Request Format
                                    let customScriptAppendElement = document.getElementById('jsbuilderoutput' + chartId);
                                    let reqParams = "";
                                    let model;
                                    if (customScriptAppendElement.value !== "")
                                        model = customScriptAppendElement.value;
                                    else {
                                        let jsonElement = document.getElementById('advance-jsonexport' + chartId);
                                        let checkSliderBtn = document.getElementById('change-ui' + chartId);
                                        if (checkSliderBtn.checked)
                                            jsonElement = document.getElementById('advance-jsonexport' + chartId);
                                        else
                                            jsonElement = document.getElementById('simple-jsonexport' + chartId);
                                        model = dataModel;
                                    }
                                    let formattedModel = {};
                                    let finalData;
                                    if (url.indexOf("studio.arria.com") !== -1) {
                                        if (describeTbl) {
                                            if (typeof (model) !== "object")
                                                model = JSON.parse(model);
                                            var csvColumnData = csv_columnData;
                                            var csvRowData = csv_rowData;
                                            if (!simpleIncrementBtn.checked) {
                                                if (csvColumnData[0] === "_ID") {
                                                    csvColumnData.splice(0, 1);
                                                    for (var i = 0; i < csvRowData.length; i++) {
                                                        csvRowData[i].splice(0, 1);
                                                    }
                                                }
                                            }
                                            let data = {};
                                            let vars = {};
                                            data["id"] = "Primary";
                                            data["type"] = "2d";
                                            data["dataSet"] = [];
                                            data["dataSet"] = data["dataSet"].concat(csvRowData);
                                            data["dataSet"].splice(0, 0, csvColumnData);
                                            formattedModel["data"] = [];
                                            formattedModel["data"].push(data);
                                            if (customScriptAppendElement.value == "") {
                                                vars["metadata"] = model.dataset[0].metadata;
                                                vars["measures"] = model.dataset[0].measures;
                                                vars["column_names"] = model.dataset[0].column_names;
                                                vars["hierarchies"] = model.dataset[0].hierarchies;
                                                vars["drillDowns"] = model.dataset[0].drillDowns;
                                                vars["_id"] = model._id;
                                                vars["source"] = model.source;
                                                vars["chartType"] = model.chartType;
                                                formattedModel["projectArguments"] = {
                                                    "vars": vars
                                                };
                                            } else {
                                                if (typeof (model) !== "object")
                                                    model = JSON.parse(model);
                                                formattedModel["projectArguments"] = model;
                                            }
                                            formattedModel["options"] = {
                                                "nullValueBehaviour": "SHOW_IDENTIFIER"
                                            };
                                            finalData = JSON.stringify(formattedModel);
                                        } else {
                                            let data = {};
                                            data["id"] = "Primary";
                                            data["type"] = "json";
                                            if (typeof (model) !== "object")
                                                data["jsonData"] = JSON.parse(model);
                                            else
                                                data["jsonData"] = model;
                                            formattedModel["data"] = [];
                                            formattedModel["data"].push(data);
                                            finalData = JSON.stringify(formattedModel);
                                        }
                                    } else {
                                        formattedModel = model;
                                        finalData = formattedModel;
                                    }
                                    finalData = finalData.replace(/\s\s+/g, ' ');
                                    if (url.indexOf("studio.arria.com") !== -1)
                                        reqParams = "arriaURL=" + url + "&headername=Authorization&authKey=bearer " + authKey.value.trim() + "&appData=" + encodeURIComponent(finalData) + "&biSource=qliksense";
                                    else if (authKey.value !== "")
                                        reqParams = "arriaURL=" + url + "&headername=Authorization&authKey=bearer " + authKey.value.trim() + "&appData=" + encodeURIComponent(finalData) + "&biSource=qliksense";
                                    else
                                        reqParams = "arriaURL=" + url + "&appData=" + encodeURIComponent(finalData) + "&biSource=qliksense";
                                    if (window.navigator.onLine)
                                        xmlhttp.send(reqParams);
                                    else
                                        showModal("You are offline. Please check that you are connected to the Internet", chartId);

                                } catch (e) {
                                    console.log(e);
                                    disableLoader();
                                }
                            };

                            /**
                             * @methodOf: Set Presist Data
                             * @description The Function Set Presist Data Visibility
                             * @returns 
                             */
                            function setViewVisibility(outputData) {
                                narrativeSection.style.display = "block";
                                narrativeTabElement.style.display = "none";
                                outofTabElement.style.display = "none";
                                headerSection.style.display = "none";
                                disableLoader();
                                // Persist Data Set Properties
                                targetElement = "narrativeView";
                                presistData["narrativeText"] = outputData;
                                presistData["projectTypeFlag"] = JSON.stringify(describeTbl);
                                presistData["targetElement"] = targetElement;
                                presistData["drillDownData"] = dataModel.dataset[0].drillDowns;
                                presistData["studioProjectEnabled"] = JSON.stringify(studioProjectEnabledFlg);
                                savePresistData(presistData);
                            }

                            /**
                             * @methodOf: Disable Loader
                             * @description The Function to disable the loader
                             * @returns 
                             */
                            function disableLoader() {
                                let spinner = document.querySelector('#narrative-tabsection' + chartId + ' .generate_btn img');
                                let pageLoader = document.getElementById('pageloader' + chartId);
                                spinner.style.display = "none";
                                pageLoader.style.display = "none";
                            }

                            /**
                             * @methodOf: NLG Service Headers
                             * @description The Function to get NLG Service Headers
                             * @returns 
                             */
                            function getNLGServiceURLHeaders() {
                                var nlgServiceHeader = {};
                                let elementCount = document.querySelector('#advance-mode' + chartId + ' .dynamic-header .append-container').childElementCount;
                                nlgHeaderDynamicElCount = elementCount + 1;
                                for (var i = 0; i < nlgHeaderDynamicElCount; i++) {
                                    var appendId = i + chartId;
                                    let authKeyEl = document.getElementById("nlg_authKey_" + appendId);
                                    let authValueEl = document.getElementById("nlg_authValue_" + appendId);
                                    if (authKeyEl.value === "" || authValueEl.value === "") {
                                        return {};
                                    }
                                    nlgServiceHeader[authKeyEl.value] = authValueEl.value;
                                }
                                return nlgServiceHeader;
                            }

                            /**
                             * @methodOf: Insight Service Headers
                             * @description The Function to get Insight Service Headers
                             * @returns 
                             */
                            function getInsightsURLHeaders() {
                                var insightsServiceHeader = {};
                                let elementInsightCount = document.querySelector('#advance-mode' + chartId + ' .insight-content .append-container').childElementCount;
                                insightsHeaderDynamicElCount = elementInsightCount + 1;
                                for (var i = 0; i < insightsHeaderDynamicElCount; i++) {
                                    var appendId = i + chartId;
                                    let authKeyEl = document.getElementById("insights_authKey_" + appendId);
                                    let authValueEl = document.getElementById("insights_authValue_" + appendId);
                                    if (authKeyEl.value === "" && authValueEl.value === "") {
                                        continue;
                                    } else if (authKeyEl.value === "" || authValueEl.value === "") {
                                        return {};
                                    }
                                    insightsServiceHeader[authKeyEl.value] = authValueEl.value;
                                }
                                return insightsServiceHeader;
                            }

                            /**
                             * @methodOf: Wrapper Service Headers
                             * @description The Function to get Wrapper Service Headers
                             * @returns 
                             */
                            function getWrapperURLHeaders() {
                                var wrapperServiceHeader = {};
                                let elementWrapperCount = document.querySelector('#advance-mode' + chartId + ' .wrapper-content .append-container').childElementCount;
                                wrapperHeaderDynamicElCount = elementWrapperCount + 1;
                                for (var i = 0; i < wrapperHeaderDynamicElCount; i++) {
                                    var appendId = i + chartId;
                                    let authKeyEl = document.getElementById("wrapper_authKey_" + appendId);
                                    let authValueEl = document.getElementById("wrapper_authValue_" + appendId);
                                    if (authKeyEl.value === "" && authValueEl.value === "") {
                                        continue;
                                    } else if (authKeyEl.value === "" || authValueEl.value === "") {
                                        return {};
                                    }
                                    wrapperServiceHeader[authKeyEl.value] = authValueEl.value;
                                }
                                return wrapperServiceHeader;
                            }



                            /**
                             * @methodOf: Generate OOTB Narrative
                             * @description The Function Generate Narrative Text Using XML Http Request
                             * @returns 
                             */
                            function generateOOTBNarrative() {
                                let analysisData = [];
                                let pageLoader = document.getElementById('pageloader' + chartId);
                                pageLoader.style.display = "block";
                                if (analysisMetadata !== undefined || analysisMetadata !== null) {
                                    let analysisCard = document.querySelectorAll('#tell-what' + chartId + ' ' + ' .card');
                                    for (let index = 0; index < analysisCard.length; index++) {
                                        let id = analysisCard[index].getAttribute('id');
                                        if (id === "stats" + chartId) {
                                            let analysisChecked = document.querySelector('input[name="stats' + chartId + '"]');
                                            if (analysisMetadata.stats) {
                                                if (analysisChecked.checked) {
                                                    analysisData.push({
                                                        "analysisType": "descriptiveStats",
                                                        "rank": analysisData.length + 1
                                                    })
                                                    let rankData = document.getElementById('rank-domain' + chartId);
                                                    let analysis = document.getElementById('analysis' + chartId);
                                                    if (rankData.checked)
                                                        analysisData[analysisData.length - 1]['ranking'] = "domain";
                                                    else
                                                        analysisData[analysisData.length - 1]['ranking'] = "data";
                                                    if (analysis.checked)
                                                        analysisData[analysisData.length - 1]['distribution_analysis'] = true;
                                                    else
                                                        analysisData[analysisData.length - 1]['distribution_analysis'] = false;
                                                }
                                            }
                                        } else if (id === "correlations" + chartId) {
                                            if (analysisMetadata.correlations) {
                                                let correlationsChecked = document.querySelector('input[name="correlations' + chartId + '"]');
                                                if (correlationsChecked.checked) {
                                                    let measures = document.querySelectorAll('#measure-container' + chartId + ' ' + ' .measure');
                                                    analysisData.push({
                                                        "analysisType": "correlations",
                                                        "rank": analysisData.length + 1
                                                    });
                                                    let measureArray = [];
                                                    for (let i = 0; i < measures.length; i++) {
                                                        let id = measures[i].getAttribute('id');
                                                        let select1 = document.querySelector('#' + id + ' ' + 'select:first-child');
                                                        let select2 = document.querySelector('#' + id + ' ' + 'select:last-child');
                                                        measureArray.push([select1.value, select2.value]);
                                                    }
                                                    analysisData[analysisData.length - 1]['measures'] = measureArray;
                                                    let range1 = document.getElementById('low' + chartId);
                                                    let range2 = document.getElementById('strong' + chartId);
                                                    analysisData[analysisData.length - 1]['thresholds'] = {
                                                        "low": range1.value,
                                                        "strong": range2.value
                                                    };
                                                }
                                            }
                                        } else if (id === "variance" + chartId) {
                                            if (analysisMetadata.variance) {
                                                let varianceChecked = document.querySelector('input[name="variance' + chartId + '"]');
                                                if (varianceChecked.checked) {
                                                    analysisData.push({
                                                        "analysisType": "varianceAnalysis",
                                                        "rank": analysisData.length + 1
                                                    });
                                                    let timeVariance = document.getElementById('time' + chartId);
                                                    if (timeVariance.checked) {
                                                        let timePeriod = document.getElementById('timeperiod' + chartId);
                                                        let comparrison = document.getElementById('timeComparrison' + chartId);
                                                        let targetMeasure = document.getElementById('target-measure' + chartId);
                                                        analysisData[analysisData.length - 1]['varianceType'] = "timeBased";
                                                        analysisData[analysisData.length - 1]['measure'] = targetMeasure.value;
                                                        analysisData[analysisData.length - 1]['Period'] = timePeriod.value;
                                                        analysisData[analysisData.length - 1]['comparison'] = comparrison.value;
                                                    } else {
                                                        let actual = document.querySelector('select[name="targetActual' + chartId + '"]');
                                                        let target = document.querySelector('select[name="targetbudget' + chartId + '"]');
                                                        analysisData[analysisData.length - 1]['varianceType'] = "targetBased";
                                                        analysisData[analysisData.length - 1]['actual'] = actual.value;
                                                        analysisData[analysisData.length - 1]['target'] = target.value;
                                                    }
                                                    let varianceTop = document.getElementById('variance-top' + chartId);
                                                    let entitySelection = "";
                                                    if (varianceTop.checked) {
                                                        let topValue = document.getElementById('variance-topselect' + chartId);
                                                        entitySelection = topValue.value
                                                        analysisData[analysisData.length - 1]['entitySelection'] = {
                                                            "topN": entitySelection
                                                        };
                                                    } else {
                                                        let inputRange = document.getElementById('variance-range' + chartId);
                                                        entitySelection = inputRange.value + "%";
                                                        analysisData[analysisData.length - 1]['entitySelection'] = {
                                                            "coverage": entitySelection
                                                        };
                                                    }
                                                }
                                            }
                                        } else if (id === "timeSeries" + chartId) {
                                            if (analysisMetadata.timeSeries) {
                                                let timeSeriesChecked = document.querySelector('input[name="timeSeries' + chartId + '"]');
                                                if (timeSeriesChecked.checked) {
                                                    let sensitivity = document.querySelector('#timeSeries' + chartId + ' input[type="range"]')
                                                    analysisData.push({
                                                        "analysisType": "timeSeriesAnalysis",
                                                        "rank": analysisData.length + 1,
                                                        "sensitivity": sensitivity.value
                                                    });
                                                }

                                            }
                                        }

                                    }
                                }
                                let summary = document.getElementById('summary' + chartId);
                                let keyInsights = document.getElementById('keyInsights' + chartId);
                                let everything = document.getElementById('everything' + chartId);
                                let generation = [];
                                if (summary.checked) {
                                    generation.push({
                                        "verbosity": "summary"
                                    });
                                }
                                if (keyInsights.checked) {
                                    generation.push({
                                        "verbosity": "keyInsights"
                                    });
                                }
                                if (everything.checked) {
                                    generation.push({
                                        "verbosity": "everything"
                                    });
                                }
                                var timeout = 0;
                                if (debounce && !presistOOTBLoad) {
                                    timeout = 1200;
                                    setTimeout(function () {
                                        let card = document.querySelectorAll('#tell-data' + chartId + '' + ' ' + ' .card');
                                        let model = {
                                            characterization: []
                                        };
                                        for (let index = 0; index < card.length; index++) {
                                            let id = card[index].getAttribute('data-id') + chartId;
                                            let attributeName = card[index].getAttribute('data-attr');
                                            if (attributeName !== "nondraggable") {
                                                let alias = document.querySelector('input[name="alias' + id + '"]');
                                                alias = alias.value;
                                                let entityEl = document.getElementById('select-entity' + id);
                                                let entity = "Select";
                                                if (entityEl.options !== null)
                                                    entity = entityEl.options[entityEl.selectedIndex].value;
                                                if (entity === "")
                                                    entity = entityEl.value;
                                                let dimensionBtn = document.getElementById('dimension' + id);
                                                if (dimensionBtn.checked) {
                                                    model.characterization.push({
                                                        "attributeName": attributeName,
                                                        "alias": alias,
                                                        "attributeType": "dimension",
                                                        "entityType": entity,
                                                        "rank": index + 1,
                                                    });
                                                } else {
                                                    let unit = document.querySelector('input[name="unit' + id + '"]');
                                                    unit = unit.value;
                                                    let measureSelection = document.getElementById('good' + id + '');
                                                    let increase = "";
                                                    if (measureSelection.checked)
                                                        increase = "good";
                                                    else
                                                        increase = "bad";
                                                    model.characterization.push({
                                                        "attributeName": attributeName,
                                                        "alias": alias,
                                                        "attributeType": "measure",
                                                        "aggregateType": ootbColumns[index].measureType,
                                                        "entityType": entity,
                                                        "unit": unit,
                                                        "increase": increase,
                                                        "rank": index + 1,
                                                    });
                                                }
                                            }
                                        }
                                        ootbModel.narrativeConfigMetaData.characterization = model.characterization;
                                        var ootbModelData = {
                                            narrativeConfigMetaData: {
                                                characterization: [],
                                                analysisOrchestration: [],
                                                generation: []
                                            }
                                        };
                                        if (presistData["ootbModel"] !== undefined && presistData["ootbModel"] !== null)
                                            ootbModelData = JSON.parse(presistData["ootbModel"]);
                                        if (ootbModelData.narrativeConfigMetaData.analysisOrchestration.length !== 0)
                                            ootbModel.narrativeConfigMetaData.analysisOrchestration = ootbModelData.narrativeConfigMetaData.analysisOrchestration;
                                        else
                                            ootbModel.narrativeConfigMetaData.analysisOrchestration = analysisData;
                                        if (ootbModelData.narrativeConfigMetaData.generation.length !== 0)
                                            ootbModel.narrativeConfigMetaData.generation = ootbModelData.narrativeConfigMetaData.generation;
                                        else
                                            ootbModel.narrativeConfigMetaData.generation = generation;
                                    }, 1000);
                                } else if ((!debounce && presistData['ootbModel'] !== undefined) || targetElement === "narrativeView") {
                                    var ootbModelData = {
                                        narrativeConfigMetaData: {
                                            characterization: [],
                                            analysisOrchestration: [],
                                            generation: []
                                        }
                                    };
                                    if (presistData["ootbModel"] !== undefined && presistData["ootbModel"] !== null)
                                        ootbModelData = JSON.parse(presistData["ootbModel"]);
                                    if (ootbModelData.narrativeConfigMetaData.characterization.length !== 0 && (!fieldUpdate && targetElement == "narrativeView"))
                                        ootbModel.narrativeConfigMetaData.characterization = ootbModelData.narrativeConfigMetaData.characterization;
                                    else {
                                        if (dimensionCharacterization.length === 0) {
                                            timeout = 1200;
                                            setTimeout(function () {
                                                let card = document.querySelectorAll('#tell-data' + chartId + '' + ' ' + ' .card');
                                                let model = {
                                                    characterization: []
                                                };
                                                for (let index = 0; index < card.length; index++) {
                                                    let id = card[index].getAttribute('data-id') + chartId;
                                                    let attributeName = card[index].getAttribute('data-attr');
                                                    if (attributeName != "nondraggable") {
                                                        let alias = document.querySelector('input[name="alias' + id + '"]');
                                                        alias = alias.value;
                                                        let entityEl = document.getElementById('select-entity' + id);
                                                        let entity = "Select";
                                                        if (entityEl.options !== null)
                                                            entity = entityEl.options[entityEl.selectedIndex].value;
                                                        if (entity === "")
                                                            entity = entityEl.value;
                                                        let dimensionBtn = document.getElementById('dimension' + id);
                                                        if (dimensionBtn.checked) {
                                                            model.characterization.push({
                                                                "attributeName": attributeName,
                                                                "alias": alias,
                                                                "attributeType": "dimension",
                                                                "entityType": entity,
                                                                "rank": index + 1,
                                                            });
                                                        } else {
                                                            let unit = document.querySelector('input[name="unit' + id + '"]');
                                                            unit = unit.value;
                                                            let measureSelection = document.getElementById('good' + id + '');
                                                            let increase = "";
                                                            if (measureSelection.checked)
                                                                increase = "good";
                                                            else
                                                                increase = "bad";
                                                            model.characterization.push({
                                                                "attributeName": attributeName,
                                                                "alias": alias,
                                                                "attributeType": "measure",
                                                                "aggregateType": ootbColumns[index].measureType,
                                                                "entityType": entity,
                                                                "unit": unit,
                                                                "increase": increase,
                                                                "rank": index + 1,
                                                            });
                                                        }
                                                    }
                                                }
                                                ootbModel.narrativeConfigMetaData.characterization = model.characterization;
                                            }, 1000);
                                        } else {
                                            ootbModel.narrativeConfigMetaData.characterization = dimensionCharacterization;
                                        }
                                    }
                                    if (ootbModelData.narrativeConfigMetaData.analysisOrchestration.length !== 0 && analysisData.length === 0 && generateBtnClicked === false)
                                        ootbModel.narrativeConfigMetaData.analysisOrchestration = ootbModelData.narrativeConfigMetaData.analysisOrchestration;
                                    else {
                                        ootbModel.narrativeConfigMetaData.analysisOrchestration = analysisData;
                                        generateBtnClicked = false;
                                    }
                                    ootbModel.narrativeConfigMetaData.generation = generation;
                                } else {
                                    ootbModel.narrativeConfigMetaData.characterization = dimensionCharacterization;
                                    ootbModel.narrativeConfigMetaData.analysisOrchestration = analysisData;
                                    ootbModel.narrativeConfigMetaData.generation = generation;
                                }
                                setTimeout(function () {
                                    presistData["ootbData"] = JSON.stringify(ootbModel);
                                    presistData["ootbModel"] = JSON.stringify(ootbModel);
                                    let model = dataModel;
                                    model.dataset[0].metadata = ootbModel;
                                    let url = OOTBGenerateEndPoint;
                                    let narrativeContainer = document.getElementById('narrative-section' + chartId);
                                    let narrativeTextContainer = document.getElementById('narrative-container' + chartId);
                                    let outOfBoxContainer = document.getElementById('outofbox-tabsection' + chartId);
                                    let xmlhttp = new XMLHttpRequest();
                                    xmlhttp.onreadystatechange = function () {
                                        if (this.readyState === 4 && this.status === 200) {
                                            if (xmlhttp.responseText !== "") {
                                                pageLoader.style.display = "none";
                                                narrativeContainer.style.display = "block";
                                                outOfBoxContainer.style.display = "none";
                                                headerSection.style.display = "none";
                                                let outputText = "";
                                                outputText = xmlhttp.responseText;
                                                outputText = outputText.trim();
                                                try {
                                                    outputText = JSON.parse(outputText);
                                                } catch (e) {

                                                }
                                                narrativeTextContainer.innerHTML = outputText;
                                                targetElement = "narrativeView";
                                                presistData["narrativeText"] = JSON.stringify(outputText);
                                                presistData["targetElement"] = targetElement;
                                                presistData["targetView"] = "ootb";
                                                savePresistData(presistData);
                                                presistOOTBLoad = true;
                                                narrationCall = false;
                                            }
                                        }
                                    }
                                    xmlhttp.onerror = function (error) {
                                        if (!window.navigator.onLine)
                                            showModal("You are offline. Please check that you are connected to the Internet", chartId);
                                        else
                                            showModal(error, chartId);
                                        pageLoader.style.display = "none";
                                    }

                                    xmlhttp.open('POST', OOTBGenerateEndPoint, true);
                                    xmlhttp.setRequestHeader("x-api-key", OOTBEndPointAPIKey);
                                    xmlhttp.setRequestHeader('userid', fingerPrintKey);
                                    if (window.navigator.onLine)
                                        xmlhttp.send(JSON.stringify(model));
                                    else
                                        showModal("You are offline. Please check that you are connected to the Internet", chartId);
                                }, timeout);

                            }



                            /**
                             * @methodOf: Out of Box UI Change Next and Previous
                             * @description The Function Toggle Change Previous and Next OutofBox View
                             * @returns 
                             */

                            nextBtn.onclick = function () {
                                if (!window.navigator.onLine) {
                                    showModal("You are offline. Please check that you are connected to the Internet", chartId);
                                    return;
                                }
                                let slide = document.querySelector('#outofbox-tabsection' + chartId + ' ' + '.slide ul li.active');
                                prevoiusBtn.style.display = "block";
                                slide.classList.remove('active');
                                slide.nextSibling.classList.add('active');
                                if (tellmedataContainer.style.display === "block") {
                                    tellmedataContainer.style.display = "none";
                                    tellWhatContainer.style.display = "block";
                                    sliderContent.innerHTML = "2. Tell me what you want to say";
                                    getOOTBMetadata();
                                    ootb_generateBtn.setAttribute('disabled', true);
                                } else if (tellWhatContainer.style.display === "block") {
                                    tellWhatContainer.style.display = "none";
                                    tellSummaryContainer.style.display = "block";
                                    nextBtn.style.display = "none";
                                    sliderContent.innerHTML = "3. Tell me how to say it";
                                    ootb_generateBtn.setAttribute('disabled', true);
                                    if (summaryCheckBtn.checked || keyInsightsCheckBtn.checked || everythingCheckBtn.checked) {
                                        ootb_generateBtn.removeAttribute('disabled', true);
                                        if (summaryCheckBtn.checked)
                                            generateSummaryText('summary');
                                        else if (keyInsightsCheckBtn.checked)
                                            generateSummaryText('keyInsights');
                                        else if (everythingCheckBtn.checked)
                                            generateSummaryText('everything');
                                    }
                                    if (analysisMetadata === undefined)
                                        getOOTBMetadata();
                                }
                            };

                            prevoiusBtn.onclick = function () {
                                if (!window.navigator.onLine) {
                                    showModal("You are offline. Please check that you are connected to the Internet", chartId);
                                    return;
                                }
                                ootb_generateBtn.setAttribute('disabled', true);
                                let slide = document.querySelector('#outofbox-tabsection' + chartId + ' ' + '.slide ul li.active');
                                slide.classList.remove('active');
                                slide.previousSibling.classList.add('active');
                                if (tellWhatContainer.style.display === "block") {
                                    tellmedataContainer.style.display = "block";
                                    tellWhatContainer.style.display = "none";
                                    prevoiusBtn.style.display = "none";
                                    sliderContent.innerHTML = "1. Tell me about your data";
                                } else if (tellSummaryContainer.style.display === "block") {
                                    tellSummaryContainer.style.display = "none";
                                    tellWhatContainer.style.display = "block";
                                    nextBtn.style.display = "block";
                                    sliderContent.innerHTML = "2. Tell me what you want to say";
                                    getOOTBMetadata();
                                }
                            };

                            /**
                             * @methodOf: Out of Box UI Slide Screens
                             * @description The Function Slide the Screens
                             * @returns 
                             */
                            slideDotOne.onclick = function () {
                                let slide = document.querySelector('.slide ul li.active');
                                prevoiusBtn.style.display = "none";
                                nextBtn.style.display = "block";
                                slide.classList.remove('active');
                                slideDotOne.classList.add('active');
                                tellmedataContainer.style.display = "block";
                                tellWhatContainer.style.display = "none";
                                tellSummaryContainer.style.display = "none";
                                sliderContent.innerHTML = "1. Tell me about your data";
                                ootb_generateBtn.setAttribute('disabled', true);
                            };
                            slideDotTwo.onclick = function () {
                                let slide = document.querySelector('.slide ul li.active');
                                prevoiusBtn.style.display = "block";
                                nextBtn.style.display = "block";
                                slide.classList.remove('active');
                                slideDotTwo.classList.add('active');
                                tellmedataContainer.style.display = "none";
                                tellWhatContainer.style.display = "block";
                                tellSummaryContainer.style.display = "none";
                                sliderContent.innerHTML = "2. Tell me what you want to say";
                                ootb_generateBtn.setAttribute('disabled', true);
                                getOOTBMetadata();
                            };
                            slideDotThree.onclick = function () {
                                let slide = document.querySelector('.slide ul li.active');
                                prevoiusBtn.style.display = "block";
                                nextBtn.style.display = "none";
                                slide.classList.remove('active');
                                slideDotThree.classList.add('active');
                                tellmedataContainer.style.display = "none";
                                tellWhatContainer.style.display = "none";
                                tellSummaryContainer.style.display = "block";
                                sliderContent.innerHTML = "3. Tell me how to say it";
                                ootb_generateBtn.setAttribute('disabled', true);
                                if (summaryCheckBtn.checked || keyInsightsCheckBtn.checked || everythingCheckBtn.checked) {
                                    ootb_generateBtn.removeAttribute('disabled', true);
                                    if (summaryCheckBtn.checked)
                                        generateSummaryText('summary');
                                    else if (keyInsightsCheckBtn.checked)
                                        generateSummaryText('keyInsights');
                                    else if (everythingCheckBtn.checked)
                                        generateSummaryText('everything');
                                }
                                if (analysisMetadata === undefined)
                                    getOOTBMetadata();
                            };

                            /**
                             * @methodOf: Out of Box Add Analysis Measures
                             * @description The Function to Bind Measures in Select Boxes
                             * @returns 
                             */
                            function addMeasureTargetVariance() {
                                let actualElement = document.querySelector('select[name="targetActual' + chartId + '"]');
                                let budgetElement = document.querySelector('select[name="targetbudget' + chartId + '"]');
                                let salesElement = document.querySelector('select[name="forecast' + chartId + '"]');
                                let targetMeasure = document.getElementById('target-measure' + chartId);
                                for (let measureIndex = 0; measureIndex < measureColumn.length; measureIndex++) {
                                    let optionElement = document.createElement('option');
                                    optionElement.text = measureColumn[measureIndex];
                                    optionElement.value = measureColumn[measureIndex];
                                    let actualOption = document.createElement('option');
                                    actualOption.text = measureColumn[measureIndex];
                                    actualOption.value = measureColumn[measureIndex];
                                    let bugetOption = document.createElement('option');
                                    bugetOption.text = measureColumn[measureIndex];
                                    bugetOption.value = measureColumn[measureIndex];
                                    let measureOption = document.createElement('option');
                                    measureOption.value = measureColumn[measureIndex];
                                    measureOption.text = measureColumn[measureIndex];
                                    actualElement.appendChild(actualOption);
                                    budgetElement.appendChild(bugetOption);
                                    salesElement.appendChild(optionElement);
                                    targetMeasure.appendChild(measureOption);
                                }
                            }

                            /**
                             * @methodOf: Out of Box Toggle Variance
                             * @description The Function to Toggle TimeBased Variance or Target based Variance
                             * @returns 
                             */
                            function varianceToggle(timeElement, timeContainer, targetContainer) {
                                let varianceInputRange = document.getElementById('variance-range' + chartId);
                                let varianceSelect = document.getElementById('variance-topselect' + chartId);
                                if (timeElement.checked) {
                                    timeContainer.style.display = "block";
                                    targetContainer.style.display = "none";
                                    varianceSelect.removeAttribute('disabled');
                                    varianceInputRange.setAttribute('disabled', 'disabled');
                                    let varianceTopRadio = document.getElementById('variance-top' + chartId);
                                    varianceTopRadio.checked = true;
                                    varianceSelect.parentElement.classList.remove('disable');
                                    varianceInputRange.parentElement.parentElement.classList.add('disable');
                                } else {
                                    timeContainer.style.display = "none";
                                    targetContainer.style.display = "block";
                                    let varianceCoverageRadio = document.getElementById('variance-coverage' + chartId);
                                    varianceCoverageRadio.checked = true;
                                    varianceSelect.setAttribute('disabled', 'disabled');
                                    varianceInputRange.removeAttribute('disabled');
                                    varianceSelect.parentElement.classList.add('disable');
                                    varianceInputRange.parentElement.parentElement.classList.remove('disable');
                                }

                            }

                            /**
                             * @methodOf: Out of Box Enable Variance Top
                             * @description The Function to Enable Variance Top
                             * @returns 
                             */
                            function toggleTimeTop() {
                                let element = document.getElementById('variance-top' + chartId);
                                let varianceInputRange = document.getElementById('variance-range' + chartId);
                                let varianceSelect = document.getElementById('variance-topselect' + chartId);
                                if (element.checked) {
                                    varianceSelect.removeAttribute('disabled');
                                    varianceInputRange.setAttribute('disabled', 'disabled');
                                    varianceSelect.parentElement.classList.remove('disable');
                                    varianceInputRange.parentElement.parentElement.classList.add('disable');
                                } else {
                                    varianceSelect.parentElement.classList.add('disable');
                                    varianceSelect.setAttribute('disabled', 'disabled');
                                    varianceInputRange.removeAttribute('disabled');
                                    varianceInputRange.parentElement.parentElement.classList.remove('disable');
                                }
                            }

                            /**
                             * @methodOf: Out of Box Enable Variance Coverage
                             * @description The Function to Enable Variance Coverage
                             * @returns 
                             */
                            function toggleCoverage() {
                                let element = document.getElementById('variance-coverage' + chartId);
                                let varianceInputRange = document.getElementById('variance-range' + chartId);
                                let varianceSelect = document.getElementById('variance-topselect' + chartId);
                                if (element.checked) {
                                    varianceSelect.setAttribute('disabled', 'disabled');
                                    varianceInputRange.removeAttribute('disabled');
                                    varianceSelect.parentElement.classList.add('disable');
                                    varianceInputRange.parentElement.parentElement.classList.remove('disable');
                                } else {
                                    varianceSelect.removeAttribute('disabled');
                                    varianceInputRange.setAttribute('disabled', 'disabled');
                                    varianceSelect.parentElement.classList.remove('disable');
                                    varianceInputRange.parentElement.parentElement.classList.add('disable');
                                }
                            }

                            /**
                             * @methodOf: OOTB Add Measure
                             * @description The function to Add New Measure Row in Correlations
                             * @returns 
                             */
                            function addMeasureHeader() {
                                let container = document.getElementById('measure-container' + chartId);
                                if (container !== null || container !== undefined) {
                                    let count = document.getElementById('measure-container' + chartId).childElementCount;
                                    if (count >= 1)
                                        document.getElementById('removemeasure-header' + chartId).style.display = "inline-block";
                                    if (measureColumn.length > 0) {
                                        let selectCount = 2;
                                        let element = document.createElement('div');
                                        element.setAttribute('id', "measure" + count + chartId);
                                        element.setAttribute('class', "measure");
                                        container.appendChild(element);
                                        for (let selectIndex = 0; selectIndex < selectCount; selectIndex++) {
                                            let selectElement = document.createElement('select');
                                            selectElement.setAttribute('id', 'select' + selectIndex + chartId);
                                            element.appendChild(selectElement);
                                            for (let index = 0; index < measureColumn.length; index++) {
                                                let option = document.createElement('option');
                                                option.value = measureColumn[index];
                                                option.text = measureColumn[index];
                                                selectElement.appendChild(option);
                                            }
                                        }

                                    }

                                }
                            }

                            /**
                             * @methodOf: OOTB Remove Measure
                             * @description The function to Remove Measure Row in Correlations
                             * @returns 
                             */
                            function removeMeasureHeader() {
                                let count = document.getElementsByClassName('measure').length;
                                let measureColumn = document.querySelector('#measure-container' + chartId + ' ' + ' .measure:last-child');
                                if (count >= 2)
                                    measureColumn.parentNode.removeChild(measureColumn);
                                if (count <= 2)
                                    document.getElementById('removemeasure-header' + chartId).style.display = "none";
                            };

                            /**
                             * @methodOf: Out of Box Get Metadata
                             * @description The Function to Generate Analysis Screen Dom
                             * @returns 
                             */
                            function getOOTBMetadata() {
                                try {
                                    let card = document.querySelectorAll('#tell-data' + chartId + '' + ' ' + ' .card');
                                    let model = {
                                        characterization: []
                                    };
                                    measureColumn = [];
                                    for (let index = 0; index < card.length; index++) {
                                        let id = card[index].getAttribute('data-id') + chartId;
                                        let attributeName = card[index].getAttribute('data-attr');
                                        if (attributeName !== "nondraggable") {
                                            let alias = document.querySelector('input[name="alias' + id + '"]');
                                            alias = alias.value;
                                            let entityEl = document.getElementById('select-entity' + id);
                                            let entity = entityEl.options[entityEl.selectedIndex].value;
                                            let dimensionBtn = document.getElementById('dimension' + id);
                                            if (dimensionBtn.checked) {
                                                model.characterization.push({
                                                    "attributeName": attributeName,
                                                    "alias": alias,
                                                    "attributeType": "dimension",
                                                    "entityType": entity,
                                                    "rank": index + 1
                                                });
                                            } else {
                                                let unit = document.querySelector('input[name="unit' + id + '"]');
                                                unit = unit.value;
                                                let measureSelection = document.getElementById('good' + id + '');
                                                let neutralSection = document.getElementById('neutral' + id);
                                                let increase = "";
                                                if (measureSelection.checked)
                                                    increase = "good";
                                                else if (neutralSection.checked)
                                                    increase = "neutral";
                                                else
                                                    increase = "bad";
                                                model.characterization.push({
                                                    "attributeName": attributeName,
                                                    "alias": alias,
                                                    "attributeType": "measure",
                                                    "aggregationType": ootbColumns[index].measureType,
                                                    "entityType": entity,
                                                    "unit": unit,
                                                    "increase": increase,
                                                    "rank": index + 1
                                                });
                                                measureColumn.push(attributeName);
                                            }
                                        }
                                    }
                                    dimensionCharacterization = model.characterization;
                                    ootbModel.narrativeConfigMetaData.characterization = dimensionCharacterization;
                                    let analysisContainer = document.getElementById('tell-what' + chartId);
                                    if (analysisArray === "" || analysisArray === undefined) {
                                        analysisContainer.innerHTML = "";
                                        pageloader.style.display = "block";
                                    }
                                    let xmlhttp = new XMLHttpRequest();
                                    xmlhttp.onreadystatechange = function () {
                                        if (this.readyState === 4 && this.status === 200) {
                                            if (xmlhttp.responseText !== "") {
                                                if (analysisArray != xmlhttp.responseText || JSON.stringify(measureColumn) != JSON.stringify(measureFields) || analysisContainer.innerHTML == "") {
                                                    let analysis;
                                                    measureFields = measureColumn;
                                                    if (presistData["analysis"] != undefined) {
                                                        analysisArray = presistData["analysis"];
                                                        analysis = JSON.parse(presistData["analysis"]);
                                                        analysisMetadata = JSON.parse(presistData["analysis"]);
                                                        presistData["analysis"] = undefined;
                                                        // savePresistData(presistData);
                                                    } else {
                                                        analysisArray = xmlhttp.responseText;
                                                        analysis = JSON.parse(xmlhttp.responseText);
                                                        analysisMetadata = JSON.parse(xmlhttp.responseText);
                                                    }

                                                    let keyLength = Object.keys(analysis).length;
                                                    let getKeyValue = Object.keys(analysis);
                                                    let analysisContainer = document.getElementById('tell-what' + chartId);
                                                    analysisContainer.innerHTML = "";
                                                    for (let index = 0; index < keyLength; index++) {
                                                        let element;
                                                        if (getKeyValue[index] != "distribution") {
                                                            element = document.createElement('div');
                                                            element.setAttribute('class', 'card ' + getKeyValue[index] + '');
                                                            element.setAttribute('id', getKeyValue[index] + chartId);
                                                            if (!analysis[getKeyValue[index]])
                                                                element.classList.add('disable');
                                                            else
                                                                element.classList.add('active');
                                                        }

                                                        let elementHtml = "";
                                                        switch (getKeyValue[index]) {
                                                            case 'stats':
                                                                elementHtml += '<div class="card-header ' + getKeyValue[index] + chartId + ' ' + getKeyValue[index] + '"><div class="drag-holder" style="background-image:url(' + apiEndpoint + 'arria/images/drag.png)"></div><input type="checkbox" name="' + getKeyValue[index] + chartId + '" checked>Descriptive statistics <span>(Select at least one measure and one dimension from step 1)</span><img class="card-toggle ' + getKeyValue[index] + chartId + ' ' + getKeyValue[index] + '" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDI4NC45MjkgMjg0LjkyOSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjg0LjkyOSAyODQuOTI5OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPHBhdGggZD0iTTI4Mi4wODIsNzYuNTExbC0xNC4yNzQtMTQuMjczYy0xLjkwMi0xLjkwNi00LjA5My0yLjg1Ni02LjU3LTIuODU2Yy0yLjQ3MSwwLTQuNjYxLDAuOTUtNi41NjMsMi44NTZMMTQyLjQ2NiwxNzQuNDQxICAgTDMwLjI2Miw2Mi4yNDFjLTEuOTAzLTEuOTA2LTQuMDkzLTIuODU2LTYuNTY3LTIuODU2Yy0yLjQ3NSwwLTQuNjY1LDAuOTUtNi41NjcsMi44NTZMMi44NTYsNzYuNTE1QzAuOTUsNzguNDE3LDAsODAuNjA3LDAsODMuMDgyICAgYzAsMi40NzMsMC45NTMsNC42NjMsMi44NTYsNi41NjVsMTMzLjA0MywxMzMuMDQ2YzEuOTAyLDEuOTAzLDQuMDkzLDIuODU0LDYuNTY3LDIuODU0czQuNjYxLTAuOTUxLDYuNTYyLTIuODU0TDI4Mi4wODIsODkuNjQ3ICAgYzEuOTAyLTEuOTAzLDIuODQ3LTQuMDkzLDIuODQ3LTYuNTY1QzI4NC45MjksODAuNjA3LDI4My45ODQsNzguNDE3LDI4Mi4wODIsNzYuNTExeiIgZmlsbD0iIzk4OTg5OCIvPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo="></div>';
                                                                elementHtml += '<div class="card-content col-md-12"><div class="col-md-6 distribution-container"><div class="distribution"><span class="ranking">Ranking:</span><p> <input type="radio" name="rank' + chartId + '" id="rank-domain' + chartId + '"><label for="rank-domain' + chartId + '">Use selected attribute order</label></p><p><input type="radio" name="rank' + chartId + '" id="rank-data' + chartId + '" checked><label for="rank-data' + chartId + '" >Let us decide</label></p> </div><div class="distribution"><input type="checkbox" name="datadriven' + chartId + '" id="analysis' + chartId + '"><label for="analysis' + chartId + '">Include distribution analysis</label> </div></div></div>';
                                                                element.innerHTML = elementHtml;
                                                                analysisContainer.appendChild(element);
                                                                if (!analysis.stats) {
                                                                    let statsCheck = document.querySelector('input[name="stats' + chartId + '"]');
                                                                    statsCheck.checked = false;
                                                                }
                                                                break;
                                                            case 'variance':
                                                                elementHtml += '<div class="card-header ' + getKeyValue[index] + chartId + ' ' + getKeyValue[index] + '"> <div class="drag-holder" style="background-image:url(' + apiEndpoint + 'arria/images/drag.png)"></div><input type="checkbox" name="' + getKeyValue[index] + chartId + '" checked>Variance <span>(Select at least 2 measures [target-based] or a measure and a date time [time-based] from step 1)</span><img class="card-toggle ' + getKeyValue[index] + chartId + ' ' + getKeyValue[index] + '" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDI4NC45MjkgMjg0LjkyOSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjg0LjkyOSAyODQuOTI5OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPHBhdGggZD0iTTI4Mi4wODIsNzYuNTExbC0xNC4yNzQtMTQuMjczYy0xLjkwMi0xLjkwNi00LjA5My0yLjg1Ni02LjU3LTIuODU2Yy0yLjQ3MSwwLTQuNjYxLDAuOTUtNi41NjMsMi44NTZMMTQyLjQ2NiwxNzQuNDQxICAgTDMwLjI2Miw2Mi4yNDFjLTEuOTAzLTEuOTA2LTQuMDkzLTIuODU2LTYuNTY3LTIuODU2Yy0yLjQ3NSwwLTQuNjY1LDAuOTUtNi41NjcsMi44NTZMMi44NTYsNzYuNTE1QzAuOTUsNzguNDE3LDAsODAuNjA3LDAsODMuMDgyICAgYzAsMi40NzMsMC45NTMsNC42NjMsMi44NTYsNi41NjVsMTMzLjA0MywxMzMuMDQ2YzEuOTAyLDEuOTAzLDQuMDkzLDIuODU0LDYuNTY3LDIuODU0czQuNjYxLTAuOTUxLDYuNTYyLTIuODU0TDI4Mi4wODIsODkuNjQ3ICAgYzEuOTAyLTEuOTAzLDIuODQ3LTQuMDkzLDIuODQ3LTYuNTY1QzI4NC45MjksODAuNjA3LDI4My45ODQsNzguNDE3LDI4Mi4wODIsNzYuNTExeiIgZmlsbD0iIzk4OTg5OCIvPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo="></div>';
                                                                elementHtml += '<div class="card-content">';
                                                                elementHtml += '<div class="card-field col-md-12 text-center"><div class="col-md-6 text-right"><input type="radio" name="variance' + chartId + '" id="time' + chartId + '" checked><label for="time' + chartId + '">Time-based variance</label> </div><div class="col-md-6 text-left"><input type="radio" name="variance' + chartId + '" id="target' + chartId + '"><label for="target' + chartId + '">Target-based variance</label> </div></div>';
                                                                elementHtml += '<div id="timebasedvariance' + chartId + '" class="timebasedvariance" style="display:block;text-align: center;"><div class="col-md-4"><label>Measure</label><select id="target-measure' + chartId + '"></select></div><div class="col-md-4"><label>Period</label><select name="timeperiod' + chartId + '" id="timeperiod' + chartId + '"><option value="month">Month</option><option value="quarter">Quarter</option><option value="year">Year</option></select></div><div class="col-md-4"><label>Comparison</label><select name="timeComparrison' + chartId + '" id="timeComparrison' + chartId + '"><option value="Latest vs. previous">Latest vs. previous</option><option value="Latest vs. earliest">Latest vs. earliest</option></select></div></div>';
                                                                elementHtml += '<div id="targetbasedvariance' + chartId + '" class="targetbasedvariance" style="display:none;text-align: center;"><div class="col-md-4"><label>Actual</label><select name="targetActual' + chartId + '"></select></div><div class="col-md-4"><label>Target/ Budget</label><select name="targetbudget' + chartId + '"></select></div><div class="col-md-4" style="display:none"><label>Forecast</label><select name="forecast' + chartId + '"></select></div></div>';
                                                                elementHtml += '<div class="col-md-12 entity-selction"><p><span class="entitylabel">Entity Selection:</span><input type="radio" name="variance-top' + chartId + '" id="variance-top' + chartId + '" checked ><label for="variance-top' + chartId + '">Top</label><span id="topSpan' + chartId + '"><select name="variance-topselect' + chartId + '" id="variance-topselect' + chartId + '"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></span></p><p><input type="radio" name="variance-top' + chartId + '" id="variance-coverage' + chartId + '"><label for="variance-coverage' + chartId + '">Coverage</label> <span class="disable" id="coverageSpan' + chartId + '">0<label class="range-position"><input type="range" name="variance-range' + chartId + '" id="variance-range' + chartId + '" min="0" max="100" value="50" class="range-slide" disabled="disabled"><span class="slide-span">50</span></label>100</span></p></div>';
                                                                elementHtml += '</div>';
                                                                element.innerHTML = elementHtml;
                                                                analysisContainer.appendChild(element);
                                                                let timeVariance = document.getElementById('time' + chartId);
                                                                let targetVariance = document.getElementById('target' + chartId);
                                                                let timeVarianceContainer = document.getElementById('timebasedvariance' + chartId);
                                                                let targetVarianceContainer = document.getElementById('targetbasedvariance' + chartId);
                                                                let varianceTop = document.getElementById('variance-top' + chartId);
                                                                let varianceCoverage = document.getElementById('variance-coverage' + chartId);
                                                                timeVariance.addEventListener('change', function () {
                                                                    varianceToggle(timeVariance, timeVarianceContainer, targetVarianceContainer)
                                                                });
                                                                targetVariance.addEventListener('change', function () {
                                                                    varianceToggle(timeVariance, timeVarianceContainer, targetVarianceContainer)
                                                                });
                                                                varianceTop.addEventListener('change', toggleTimeTop);
                                                                varianceCoverage.addEventListener('change', toggleCoverage);
                                                                let variancerangeValue = document.querySelector('#' + getKeyValue[index] + chartId + " " + '.range-slide');
                                                                variancerangeValue.addEventListener('change', changeRangeValue);
                                                                variancerangeValue = variancerangeValue.value;
                                                                let variancespanElement = document.querySelector('#' + getKeyValue[index] + chartId + " " + '.slide-span');
                                                                variancespanElement.innerHTML = variancerangeValue;
                                                                variancespanElement.style.left = variancerangeValue - 8 + "%";
                                                                addMeasureTargetVariance();
                                                                if (!analysis.variance) {
                                                                    let varianceCheck = document.querySelector('input[name="variance' + chartId + '"]');
                                                                    varianceCheck.checked = false;
                                                                }
                                                                break;
                                                            case 'correlations':
                                                                elementHtml += '<div class="card-header ' + getKeyValue[index] + chartId + ' ' + getKeyValue[index] + '"> <div class="drag-holder" style="background-image:url(' + apiEndpoint + 'arria/images/drag.png)"></div><input type="checkbox" name="' + getKeyValue[index] + chartId + '" checked>Correlations <span>(Select at least two measures from step 1)</span><img class="card-toggle ' + getKeyValue[index] + chartId + ' ' + getKeyValue[index] + '" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDI4NC45MjkgMjg0LjkyOSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjg0LjkyOSAyODQuOTI5OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPHBhdGggZD0iTTI4Mi4wODIsNzYuNTExbC0xNC4yNzQtMTQuMjczYy0xLjkwMi0xLjkwNi00LjA5My0yLjg1Ni02LjU3LTIuODU2Yy0yLjQ3MSwwLTQuNjYxLDAuOTUtNi41NjMsMi44NTZMMTQyLjQ2NiwxNzQuNDQxICAgTDMwLjI2Miw2Mi4yNDFjLTEuOTAzLTEuOTA2LTQuMDkzLTIuODU2LTYuNTY3LTIuODU2Yy0yLjQ3NSwwLTQuNjY1LDAuOTUtNi41NjcsMi44NTZMMi44NTYsNzYuNTE1QzAuOTUsNzguNDE3LDAsODAuNjA3LDAsODMuMDgyICAgYzAsMi40NzMsMC45NTMsNC42NjMsMi44NTYsNi41NjVsMTMzLjA0MywxMzMuMDQ2YzEuOTAyLDEuOTAzLDQuMDkzLDIuODU0LDYuNTY3LDIuODU0czQuNjYxLTAuOTUxLDYuNTYyLTIuODU0TDI4Mi4wODIsODkuNjQ3ICAgYzEuOTAyLTEuOTAzLDIuODQ3LTQuMDkzLDIuODQ3LTYuNTY1QzI4NC45MjksODAuNjA3LDI4My45ODQsNzguNDE3LDI4Mi4wODIsNzYuNTExeiIgZmlsbD0iIzk4OTg5OCIvPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo="></div>';
                                                                elementHtml += '<div class="card-content">';
                                                                elementHtml += '<div class="col-md-8"><p>Measures to compare:</p><div class="measure-container"><div id="measure-container' + chartId + '"></div><div class="controls"><a href="javascript:void(0);" id="addmeasure-header' + chartId + '"><img src="' + apiEndpoint + 'arria/images/add.png">Add measures</a><a href="javascript:void(0);" id="removemeasure-header' + chartId + '" style="display:none"><b>-</b>Remove measures</a></div></div></div>';
                                                                elementHtml += '<div class="multiple-range col-md-8"><span style="display:inline-block">Coefficient thresholds:</span>  <label style="display:inline-block"><i>0</i><span class="highlight highlight-first" style="left:24%">Low</span><span class="rangefirst slide-value slide-span" style="left:24%">0.2</span><input type="range" min="0" max="1" value="0.2" step="0.1" class="range-slide multi-range" id="low' + chartId + '"><input type="range" min="0" max="1" value="0.8" step="0.1" class="range-slide multi-range" id="strong' + chartId + '"><i style="right:-30px;">1</i><span class="highlight highlight-sencond" style="left:81%">Strong</span><span class="rangesecond slide-value slide-span" style="left:81%">0.8</span></label></div>';
                                                                elementHtml += '</div>';
                                                                element.innerHTML = elementHtml;
                                                                analysisContainer.appendChild(element);
                                                                let measureAddHeaderBtn = document.getElementById('addmeasure-header' + chartId);
                                                                let measureRemoveHeaderBtn = document.getElementById('removemeasure-header' + chartId);
                                                                measureAddHeaderBtn.addEventListener('click', addMeasureHeader);
                                                                measureRemoveHeaderBtn.addEventListener('click', removeMeasureHeader);
                                                                var lowRange = document.getElementById('low' + chartId);
                                                                var strongRange = document.getElementById('strong' + chartId);
                                                                lowRange.addEventListener('change', lowRangeChanged);
                                                                strongRange.addEventListener('change', strongRangeChanged);
                                                                lowRange.addEventListener('change', changeRangeValue);
                                                                strongRange.addEventListener('change', changeRangeValue);
                                                                addMeasureHeader();
                                                                if (!analysis.correlations) {
                                                                    let correlationsCheck = document.querySelector('input[name="correlations' + chartId + '"]');
                                                                    correlationsCheck.checked = false;
                                                                }
                                                                let correlationSpanWidth = document.querySelector('.multiple-range span:first-child').clientWidth;
                                                                let correlationWidth = document.querySelector('.multiple-range').clientWidth;
                                                                let width = (correlationWidth - correlationSpanWidth) - 20;
                                                                let labelElement = document.querySelector('.multiple-range label');
                                                                labelElement.style.width = width + "px";
                                                                let inputElement = document.getElementsByClassName('multi-range');
                                                                inputElement[0].style.width = width + "px";
                                                                inputElement[1].style.width = width + "px";
                                                                break;
                                                            case 'timeSeries':
                                                                elementHtml += '<div class="card-header ' + getKeyValue[index] + chartId + ' ' + getKeyValue[index] + '"> <div class="drag-holder" style="background-image:url(' + apiEndpoint + 'arria/images/drag.png)"></div><input type="checkbox" name="' + getKeyValue[index] + chartId + '" checked>Time series <span>(Select at least a measure and a date time from step 1)</span><img class="card-toggle ' + getKeyValue[index] + chartId + ' ' + getKeyValue[index] + '" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDI4NC45MjkgMjg0LjkyOSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjg0LjkyOSAyODQuOTI5OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPHBhdGggZD0iTTI4Mi4wODIsNzYuNTExbC0xNC4yNzQtMTQuMjczYy0xLjkwMi0xLjkwNi00LjA5My0yLjg1Ni02LjU3LTIuODU2Yy0yLjQ3MSwwLTQuNjYxLDAuOTUtNi41NjMsMi44NTZMMTQyLjQ2NiwxNzQuNDQxICAgTDMwLjI2Miw2Mi4yNDFjLTEuOTAzLTEuOTA2LTQuMDkzLTIuODU2LTYuNTY3LTIuODU2Yy0yLjQ3NSwwLTQuNjY1LDAuOTUtNi41NjcsMi44NTZMMi44NTYsNzYuNTE1QzAuOTUsNzguNDE3LDAsODAuNjA3LDAsODMuMDgyICAgYzAsMi40NzMsMC45NTMsNC42NjMsMi44NTYsNi41NjVsMTMzLjA0MywxMzMuMDQ2YzEuOTAyLDEuOTAzLDQuMDkzLDIuODU0LDYuNTY3LDIuODU0czQuNjYxLTAuOTUxLDYuNTYyLTIuODU0TDI4Mi4wODIsODkuNjQ3ICAgYzEuOTAyLTEuOTAzLDIuODQ3LTQuMDkzLDIuODQ3LTYuNTY1QzI4NC45MjksODAuNjA3LDI4My45ODQsNzguNDE3LDI4Mi4wODIsNzYuNTExeiIgZmlsbD0iIzk4OTg5OCIvPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo="></div>';
                                                                elementHtml += '<div class="card-content text-center"><div class="col-md-8"><span>Sensitivity</span> 0 <label class="range-position"><input type="range" min="1" max="100" value="50" class="range-slide"><span class="slide-span">50</span></label>100</div></div>';
                                                                element.innerHTML = elementHtml;
                                                                analysisContainer.appendChild(element);
                                                                let timerangeValue = document.querySelector('#' + getKeyValue[index] + chartId + " " + '.range-slide');
                                                                timerangeValue.addEventListener('change', changeRangeValue);
                                                                timerangeValue = timerangeValue.value;
                                                                let timespanElement = document.querySelector('#' + getKeyValue[index] + chartId + " " + '.slide-span');
                                                                timespanElement.innerHTML = timerangeValue;
                                                                timespanElement.style.left = timerangeValue - 8 + "%";
                                                                if (!analysis.timeSeries) {
                                                                    let timeSeriesCheck = document.querySelector('input[name="timeSeries' + chartId + '"]');
                                                                    timeSeriesCheck.checked = false;
                                                                }
                                                                break;
                                                            default:
                                                                break;
                                                        }
                                                        if (!analysis[getKeyValue[index]] || (analysis[getKeyValue[index]] && (index == getKeyValue.length - 1))) {
                                                            let existingNonDraggable = document.getElementById('analysisNonDrag' + chartId);
                                                            if (existingNonDraggable === null) {
                                                                let lastEmptyElement = document.createElement('div');
                                                                lastEmptyElement.setAttribute('id', 'analysisNonDrag' + chartId + '');
                                                                lastEmptyElement.setAttribute('class', 'card nondraggable');
                                                                lastEmptyElement.setAttribute('data-attr', 'nondraggable');
                                                                lastEmptyElement.innerHTML = '<div class="card-header"></div>';
                                                                if ((analysis[getKeyValue[index]] && (index === getKeyValue.length - 1)))
                                                                    analysisContainer.appendChild(lastEmptyElement);
                                                                else
                                                                    analysisContainer.insertBefore(lastEmptyElement, element);
                                                            }
                                                        }
                                                    }
                                                    listen();
                                                    cardCheckEvent();
                                                    if (presistData['ootbData'] !== undefined && _this['initializeOOTBMetadata'])
                                                        saveOOTBPersist();
                                                    if (pageloader.style.display === "block")
                                                        pageloader.style.display = "none";
                                                }
                                            }
                                        }
                                    };
                                    xmlhttp.open('POST', OOTBEndPoint + 'ootb/allowedanalysis');
                                    if (window.navigator.onLine)
                                        xmlhttp.send(JSON.stringify(model));
                                    else
                                        showModal("You are offline. Please check that you are connected to the Internet", chartId);
                                    xmlhttp.onerror = function (error) {
                                        if (!window.navigator.onLine)
                                            showModal("You are offline. Please check that you are connected to the Internet", chartId);
                                        else
                                            showModal(error, chartId);
                                        pageloader.style.display = "none";
                                        document.getElementById('tell-what' + chartId).innerHTML = "";
                                    };
                                } catch (e) {
                                    console.log(e);
                                }
                            };

                            /**
                             * @methodOf: OOTB Low Range Slider
                             * @description The function to Low Range Slider
                             * @returns 
                             */
                            function lowRangeChanged() {
                                let lowRange = document.getElementById("low" + chartId);
                                let strongRange = document.getElementById("strong" + chartId);
                                if (lowRange.value >= strongRange.value)
                                    lowRange.value = (parseFloat(strongRange.value) - 0.1).toString();
                            }

                            /**
                             * @methodOf: OOTB Strong Range Slider
                             * @description The function to Strong Range Slider
                             * @returns 
                             */
                            function strongRangeChanged() {
                                let lowRange = document.getElementById("low" + chartId);
                                let strongRange = document.getElementById("strong" + chartId);
                                if (strongRange.value <= lowRange.value)
                                    strongRange.value = (parseFloat(lowRange.value) + 0.1).toString();
                            }

                            /**
                             * @methodOf: OOTB Get Range Field Value
                             * @description The function to Bind Event on Range Slide
                             * @returns 
                             */
                            function changeRangeValue() {
                                if (this.max === "100" || this.max === "10") {
                                    var spanElement = this.nextSibling;
                                    if (spanElement !== null) {
                                        spanElement.innerHTML = this.value;
                                        if (this.max === "100")
                                            spanElement.style.left = this.value + "%";
                                        else
                                            spanElement.style.left = (this.value * 10) - 10 + "%";
                                    }
                                } else {
                                    var documentElement = this.getAttribute('id');
                                    var slideValue = Number(this.value);
                                    slideValue = (slideValue * 10) * 10;
                                    var varianceSpan = "";
                                    var varianceHighlight = "";
                                    if (documentElement === "low" + chartId) {
                                        varianceHighlight = document.querySelector('#correlations' + chartId + ' ' + '.highlight-first');
                                        varianceSpan = document.querySelector('#correlations' + chartId + ' ' + '.rangefirst');
                                    } else if (documentElement == "strong" + chartId) {
                                        varianceHighlight = document.querySelector('#correlations' + chartId + ' ' + '.highlight-sencond');
                                        varianceSpan = document.querySelector('#correlations' + chartId + ' ' + '.rangesecond');
                                    }
                                    varianceHighlight.style.left = slideValue + "%";
                                    varianceSpan.innerHTML = this.value;
                                    varianceSpan.style.left = slideValue + 3 + "%";
                                }
                            }
                            /**
                             * @methodOf  OOTB Analysis Metadata Drag and Drop
                             * @description The function Drag and Drop Cards and Save Value
                             * @returns
                             */
                            function listen() {
                                let columns = document.querySelectorAll('#tell-what' + chartId + ' ' + ' .card');
                                for (let index = 0; index < columns.length; index++) {
                                    let id = columns[index].getAttribute('id');
                                    let element = document.querySelector('#' + id + ' ' + '.card-header');
                                    element.removeEventListener('mouseleave', analysisRemoveEventListen);
                                    element.removeEventListener('mouseover', analysisCallDrag);
                                    element.addEventListener('mouseover', analysisCallDrag);
                                    element.addEventListener('mouseleave', analysisRemoveEventListen);
                                }
                            }

                            function analysisCallDrag() {
                                var analysisCols = document.querySelectorAll('#tell-what' + chartId + ' ' + ' .card');
                                [].forEach.call(analysisCols, analysisDragHandler);
                            }

                            function analysisRemoveEventListen() {
                                var analysisCols = document.querySelectorAll('#tell-what' + chartId + ' ' + ' .card');
                                [].forEach.call(analysisCols, analysisRemoveListeningEvents);
                            }

                            function analysisRemoveListeningEvents(element) {
                                element.removeAttribute('draggable');
                                element.removeEventListener('dragstart', analysisHandleDragStart, false);
                                element.removeEventListener('dragenter', analysisHandleDragEnter, false)
                                element.removeEventListener('dragover', analysisHandleDragOver, false);
                                element.removeEventListener('dragleave', analysisHandleDragLeave, false);
                                element.removeEventListener('drop', analysisHandleDrop, false);
                                element.removeEventListener('dragend', analysisHandleDragEnd, false);
                            }

                            /**
                             * @methodOf: Out of Box Drag and Drop Reorder 
                             * @description Out of Box Drag and Drop Reorder 
                             * @returns 
                             */
                            var analysisSrcElement = null;

                            function analysisHandleDragStart(e) {
                                analysisSrcElement = this;

                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('text/html', this.outerHTML);
                                this.classList.add('dragElem');
                            }

                            function analysisHandleDragOver(e) {
                                if (e.preventDefault) {
                                    e.preventDefault();
                                }
                                this.classList.add('over');
                                e.dataTransfer.dropEffect = 'move';
                                return false;
                            }

                            function analysisHandleDragEnter(e) {}

                            function analysisHandleDragLeave(e) {
                                this.classList.remove('over');
                            }

                            function analysisHandleDrop(e) {

                                if (e.stopPropagation) {
                                    e.stopPropagation();
                                }
                                if (analysisSrcElement != this) {
                                    let id = analysisSrcElement.getAttribute('id');
                                    if (id === "stats" + chartId) {
                                        let rankData = document.getElementById('rank-data' + chartId);
                                        let analysisCheck = document.getElementById('analysis' + chartId);
                                        if (rankData.checked)
                                            rankData = "Data";
                                        else
                                            rankData = "Domain";
                                        let statsCheckBox = document.querySelector('input[name="stats' + chartId + '"]');
                                        statsCheckBox = statsCheckBox.checked;
                                        analysisCheck = analysisCheck.checked;
                                        saveDragStatics(rankData, analysisCheck, statsCheckBox);
                                    } else if (id === "distribution" + chartId) {
                                        let distribution = document.querySelector('#distribution' + chartId + ' ' + ' .range-slide');
                                        distribution = distribution.value;
                                        saveDragDistribution(distribution);
                                    } else if (id === "variance" + chartId) {
                                        let timeVariance = document.getElementById('time' + chartId);
                                        timeVariance = timeVariance.checked;
                                        let period = document.getElementById('timeperiod' + chartId);
                                        let comparrison = document.getElementById('timeComparrison' + chartId);
                                        let entity = document.getElementById('variance-top' + chartId);
                                        let coverage = document.getElementById('variance-coverage' + chartId);
                                        let varianceTopSelect = document.getElementById('variance-topselect' + chartId);
                                        let actual = document.querySelector('select[name="targetActual' + chartId + '"]');
                                        let target = document.querySelector('select[name="targetbudget' + chartId + '"]');
                                        let variance = document.getElementById('variance-range' + chartId);
                                        if (timeVariance) {
                                            timeVariance = "time";
                                            period = period.value;
                                            comparrison = comparrison.value;
                                            actual = null;
                                            target = null;
                                        } else {
                                            timeVariance = "target";
                                            period = null;
                                            comparrison = null;
                                            actual = actual.value;
                                            target = target.value;
                                        }
                                        if (entity.checked) {
                                            entity = "Top";
                                            varianceTopSelect = varianceTopSelect.value;
                                            variance = null;
                                        } else {
                                            entity = "Coverage";
                                            varianceTopSelect = null;
                                            if (variance.value !== "50")
                                                variance = variance.value;
                                            else
                                                variance = "";
                                        }
                                        let varianceCheckbox = document.querySelector('input[name="variance' + chartId + '"]');
                                        varianceCheckbox = varianceCheckbox.checked;
                                        saveDragVariance(timeVariance, period, comparrison, actual, target, entity, varianceTopSelect, variance, varianceCheckbox);
                                    } else if (id === "correlations" + chartId) {
                                        var lowRangeValue = document.getElementById('low' + chartId);
                                        lowRangeValue = lowRangeValue.value;
                                        var strongRangeValue = document.getElementById('strong' + chartId);
                                        strongRangeValue = strongRangeValue.value;
                                        let correlationsCheckbox = document.querySelector('input[name="correlations' + chartId + '"]');
                                        correlationsCheckbox = correlationsCheckbox.checked;
                                        saveDragCorrelation(lowRangeValue, strongRangeValue, correlationsCheckbox);
                                    } else if (id === "timeSeries" + chartId) {
                                        var timeSeriesValue = document.querySelector('#timeSeries' + chartId + ' ' + 'input[type="range"]');
                                        timeSeriesValue = timeSeriesValue.value;
                                        let timeSeriesCheckbox = document.querySelector('input[name="timeSeries' + chartId + '"]');
                                        timeSeriesCheckbox = timeSeriesCheckbox.checked;
                                        saveDragtimeSeries(timeSeriesValue, timeSeriesCheckbox);
                                    }
                                    this.parentNode.removeChild(analysisSrcElement);
                                    var dropHTML = e.dataTransfer.getData('text/html');
                                    this.insertAdjacentHTML('beforebegin', dropHTML);
                                    var dropElem = this.previousSibling;
                                    analysisDragHandler(dropElem);
                                    listen();
                                    analysisRemoveEventListen();
                                    cardCheckEvent();
                                }
                                this.classList.remove('over');
                                return false;
                            }


                            function analysisHandleDragEnd(e) {
                                this.classList.remove('over');
                            }


                            function analysisDragHandler(element) {
                                element.setAttribute('draggable', 'true');
                                element.addEventListener('dragstart', analysisHandleDragStart, false);
                                element.addEventListener('dragenter', analysisHandleDragEnter, false)
                                element.addEventListener('dragover', analysisHandleDragOver, false);
                                element.addEventListener('dragleave', analysisHandleDragLeave, false);
                                element.addEventListener('drop', analysisHandleDrop, false);
                                element.addEventListener('dragend', analysisHandleDragEnd, false);
                            }

                            function saveDragStatics(data, analysis, checkbox) {
                                if (data !== "Data" || analysis) {
                                    setTimeout(function () {
                                        let rankDomain = document.getElementById('rank-domain' + chartId);
                                        let rankData = document.getElementById('rank-data' + chartId);
                                        let analysisCheck = document.getElementById('analysis' + chartId);
                                        if (data == "Data") {
                                            rankData.checked = true;
                                            rankDomain.checked = false;
                                        } else {
                                            rankDomain.checked = true;
                                            rankData.checked = false;
                                        }
                                        if (analysis)
                                            analysisCheck.checked = true;
                                        let checkboxElement = document.querySelector('input[name="stats' + chartId + '"]');
                                        checkboxElement.checked = checkbox;
                                    }, 0);
                                }

                            }

                            function saveDragDistribution(distributionValue) {
                                setTimeout(function () {
                                    let distribution = document.querySelector('#distribution' + chartId + ' ' + ' .range-slide');
                                    distribution.value = distributionValue;
                                }, 500);
                            }

                            function saveDragVariance(timeVariance, period, comparrison, actual, target, entity, varianceTopSelect, variance, checkbox) {
                                setTimeout(function () {
                                    let checkboxElement = document.querySelector('input[name="variance' + chartId + '"]');
                                    checkboxElement.checked = checkbox;
                                    if (timeVariance === "time") {
                                        let time = document.getElementById('time' + chartId);
                                        time.checked = true;
                                        if (period !== null && period !== "") {
                                            let periodElement = document.getElementById('timeperiod' + chartId);
                                            periodElement.value = period;
                                        }
                                        if (comparrison !== null && comparrison !== "") {
                                            let comparrisonElement = document.getElementById('timeComparrison' + chartId);
                                            comparrisonElement.value = comparrison;
                                        }
                                    } else {
                                        let targetElement = document.getElementById('target' + chartId);
                                        targetElement.checked = true;
                                        if (actual !== null && actual !== "") {
                                            let actualElement = document.querySelector('select[name="targetActual' + chartId + '"]');
                                            actualElement.value = actual;
                                        }
                                        if (target !== null && target !== "") {
                                            let targetElement = document.querySelector('select[name="targetbudget' + chartId + '"]');
                                            targetElement.value = target;
                                        }
                                    }
                                    let varianceRange = document.getElementById('variance-range' + chartId);
                                    varianceRange.addEventListener('change', changeRangeValue);
                                    if (entity === "Coverage") {
                                        let varianceElement = document.getElementById('variance-coverage' + chartId);
                                        varianceElement.checked = true;
                                        if (variance !== null && variance !== "")
                                            varianceRange.value = variance;
                                    } else {
                                        let varianceTop = document.getElementById('variance-top' + chartId);
                                        varianceTop.checked = true;
                                        if (varianceTopSelect !== null) {
                                            let varianceTopSelectElement = document.getElementById('variance-topselect' + chartId);
                                            varianceTopSelectElement.value = varianceTopSelect;
                                        }
                                    }
                                    let timeVarianceElement = document.getElementById('time' + chartId);
                                    let targetVarianceElement = document.getElementById('target' + chartId);
                                    let timeVarianceContainer = document.getElementById('timebasedvariance' + chartId);
                                    let targetVarianceContainer = document.getElementById('targetbasedvariance' + chartId);
                                    let varianceTopElement = document.getElementById('variance-top' + chartId);
                                    let varianceCoverageElement = document.getElementById('variance-coverage' + chartId);
                                    timeVarianceElement.addEventListener('change', function () {
                                        varianceToggle(timeVarianceElement, timeVarianceContainer, targetVarianceContainer)
                                    });
                                    targetVarianceElement.addEventListener('change', function () {
                                        varianceToggle(timeVarianceElement, timeVarianceContainer, targetVarianceContainer)
                                    });
                                    varianceTopElement.addEventListener('change', toggleTimeTop);
                                    varianceCoverageElement.addEventListener('change', toggleCoverage);
                                }, 0);

                            }

                            function saveDragCorrelation(low, strong, checkbox) {
                                setTimeout(function () {
                                    let checkboxElement = document.querySelector('input[name="correlations' + chartId + '"]');
                                    checkboxElement.checked = checkbox;
                                    let measureAddHeaderBtn = document.getElementById('addmeasure-header' + chartId);
                                    let measureRemoveHeaderBtn = document.getElementById('removemeasure-header' + chartId);
                                    measureAddHeaderBtn.addEventListener('click', addMeasureHeader);
                                    measureRemoveHeaderBtn.addEventListener('click', removeMeasureHeader);
                                    var lowRange = document.getElementById('low' + chartId);
                                    lowRange.addEventListener('change', lowRangeChanged);
                                    var strongRange = document.getElementById('strong' + chartId);
                                    lowRange.addEventListener('change', changeRangeValue);
                                    lowRange.value = low;
                                    strongRange.addEventListener('change', strongRangeChanged);
                                    strongRange.addEventListener('change', changeRangeValue);
                                    strongRange.value = strong;
                                }, 0);

                            }

                            function saveDragtimeSeries(time, checkbox) {
                                setTimeout(function () {
                                    let checkboxElement = document.querySelector('input[name="timeSeries' + chartId + '"]');
                                    checkboxElement.checked = checkbox;
                                    var timeSeries = document.querySelector('#timeSeries' + chartId + ' ' + 'input[type="range"]');
                                    timeSeries.addEventListener('change', changeRangeValue);
                                    timeSeries.value = time;
                                }, 0);
                            }

                            function cardCheckEvent() {
                                var inputCols = document.querySelectorAll('#tell-what' + chartId + ' .card .card-header input');
                                [].forEach.call(inputCols, cardHeaderEventListener);
                            };

                            function cardHeaderEventListener(element) {
                                element.addEventListener('change', analysisToggleEvent)
                            };

                            function analysisToggleEvent() {
                                if (this.checked) {
                                    this.parentElement.parentElement.classList.add('active');
                                } else {
                                    this.parentElement.parentElement.classList.remove('active');
                                }
                            };


                            /**
                             * @methodOf: OOTB Summary Event
                             * @description The Function to Onchange Summary Radio Button Event
                             * @returns 
                             */
                            summaryCheckBtn.onchange = function () {
                                if (!window.navigator.onLine) {
                                    showModal("You are offline. Please check that you are connected to the Internet", chartId);
                                    return;
                                }
                                let summaryContainer = document.getElementById('accordian-summary' + chartId);
                                if (this.checked) {
                                    summaryContainer.classList.add('active');
                                    generateSummaryText('summary');
                                    if (ootb_generateBtn.hasAttribute("disabled"))
                                        ootb_generateBtn.removeAttribute('disabled', true);
                                }
                            }

                            /**
                             * @methodOf: OOTB KeyInsight Event
                             * @description The Function to Onchange KeyInsight Radio Button Event
                             * @returns 
                             */
                            keyInsightsCheckBtn.onchange = function () {
                                if (!window.navigator.onLine) {
                                    showModal("You are offline. Please check that you are connected to the Internet", chartId);
                                    return;
                                }
                                let summaryContainer = document.getElementById('accordian-summary' + chartId);
                                if (this.checked) {
                                    summaryContainer.classList.add('active');
                                    generateSummaryText('keyInsights');
                                    if (ootb_generateBtn.hasAttribute("disabled"))
                                        ootb_generateBtn.removeAttribute('disabled', true);
                                }
                            }

                            /**
                             * @methodOf: OOTB Everything Event
                             * @description The Function to Onchange Everything Radio Button Event
                             * @returns 
                             */
                            everythingCheckBtn.onchange = function () {
                                if (!window.navigator.onLine) {
                                    showModal("You are offline. Please check that you are connected to the Internet", chartId);
                                    return;
                                }
                                let summaryContainer = document.getElementById('accordian-summary' + chartId);
                                if (this.checked) {
                                    summaryContainer.classList.add('active');
                                    generateSummaryText('everything');
                                    if (ootb_generateBtn.hasAttribute("disabled"))
                                        ootb_generateBtn.removeAttribute('disabled', true);
                                }
                            }

                            /**
                             * @methodOf: OOTB Generate Summary Text
                             * @description The Function to Generate Summary Text
                             * @returns 
                             */
                            function generateSummaryText(summaryView) {
                                let analysisData = [];
                                let pageLoader = document.getElementById('pageloader' + chartId);
                                let summaryContainer = document.getElementById('tell-summary' + chartId);
                                if (summaryContainer.style.display == "block") {
                                    pageLoader.style.display = "block";
                                }
                                if (analysisMetadata != undefined || analysisMetadata != null) {
                                    let analysisCard = document.querySelectorAll('#tell-what' + chartId + ' ' + ' .card');
                                    for (let index = 0; index < analysisCard.length; index++) {
                                        let id = analysisCard[index].getAttribute('id');
                                        if (id === "stats" + chartId) {
                                            let analysisChecked = document.querySelector('input[name="stats' + chartId + '"]');
                                            if (analysisMetadata.stats) {
                                                if (analysisChecked.checked) {
                                                    analysisData.push({
                                                        "analysisType": "descriptiveStats",
                                                        "rank": analysisData.length + 1
                                                    })
                                                    let rankData = document.getElementById('rank-domain' + chartId);
                                                    let analysis = document.getElementById('analysis' + chartId);
                                                    if (rankData.checked)
                                                        analysisData[analysisData.length - 1]['ranking'] = "domain";
                                                    else
                                                        analysisData[analysisData.length - 1]['ranking'] = "data";
                                                    if (analysis.checked)
                                                        analysisData[analysisData.length - 1]['distribution_analysis'] = true;
                                                    else
                                                        analysisData[analysisData.length - 1]['distribution_analysis'] = false;
                                                }
                                            }
                                        } else if (id === "correlations" + chartId) {
                                            if (analysisMetadata.correlations) {
                                                let correlationsChecked = document.querySelector('input[name="correlations' + chartId + '"]');
                                                if (correlationsChecked.checked) {
                                                    let measures = document.querySelectorAll('#measure-container' + chartId + ' ' + ' .measure');
                                                    analysisData.push({
                                                        "analysisType": "correlations",
                                                        "rank": analysisData.length + 1
                                                    });
                                                    let measureArray = [];
                                                    for (let i = 0; i < measures.length; i++) {
                                                        let id = measures[i].getAttribute('id');
                                                        let select1 = document.querySelector('#' + id + ' ' + 'select:first-child');
                                                        let select2 = document.querySelector('#' + id + ' ' + 'select:last-child');
                                                        measureArray.push([select1.value, select2.value]);
                                                    }
                                                    analysisData[analysisData.length - 1]['measures'] = measureArray;
                                                    let range1 = document.getElementById('low' + chartId);
                                                    let range2 = document.getElementById('strong' + chartId);
                                                    analysisData[analysisData.length - 1]['thresholds'] = {
                                                        "low": range1.value,
                                                        "strong": range2.value
                                                    };
                                                }
                                            }
                                        } else if (id === "variance" + chartId) {
                                            if (analysisMetadata.variance) {
                                                let varianceChecked = document.querySelector('input[name="variance' + chartId + '"]');
                                                if (varianceChecked.checked) {
                                                    analysisData.push({
                                                        "analysisType": "varianceAnalysis",
                                                        "rank": analysisData.length + 1
                                                    });
                                                    let timeVariance = document.getElementById('time' + chartId);
                                                    if (timeVariance.checked) {
                                                        let timePeriod = document.getElementById('timeperiod' + chartId);
                                                        let comparrison = document.getElementById('timeComparrison' + chartId);
                                                        let targetMeasure = document.getElementById('target-measure' + chartId);
                                                        analysisData[analysisData.length - 1]['varianceType'] = "timeBased";
                                                        analysisData[analysisData.length - 1]['measure'] = targetMeasure.value;
                                                        analysisData[analysisData.length - 1]['Period'] = timePeriod.value;
                                                        analysisData[analysisData.length - 1]['comparison'] = comparrison.value;
                                                    } else {
                                                        let actual = document.querySelector('select[name="targetActual' + chartId + '"]');
                                                        let target = document.querySelector('select[name="targetbudget' + chartId + '"]');
                                                        analysisData[analysisData.length - 1]['varianceType'] = "targetBased";
                                                        analysisData[analysisData.length - 1]['actual'] = actual.value;
                                                        analysisData[analysisData.length - 1]['target'] = target.value;
                                                    }
                                                    let varianceTop = document.getElementById('variance-top' + chartId);
                                                    let entitySelection = "";
                                                    if (varianceTop.checked) {
                                                        let topValue = document.getElementById('variance-topselect' + chartId);
                                                        entitySelection = topValue.value
                                                        analysisData[analysisData.length - 1]['entitySelection'] = {
                                                            "topN": entitySelection
                                                        };
                                                    } else {
                                                        let inputRange = document.getElementById('variance-range' + chartId);
                                                        entitySelection = inputRange.value + "%";
                                                        analysisData[analysisData.length - 1]['entitySelection'] = {
                                                            "coverage": entitySelection
                                                        };
                                                    }
                                                }
                                            }

                                        } else if (id === "timeSeries" + chartId) {
                                            if (analysisMetadata.timeSeries) {
                                                let timeSeriesChecked = document.querySelector('input[name="timeSeries' + chartId + '"]');
                                                if (timeSeriesChecked.checked) {
                                                    let sensitivity = document.querySelector('#timeSeries' + chartId + ' input[type="range"]');
                                                    analysisData.push({
                                                        "analysisType": "timeSeriesAnalysis",
                                                        "rank": analysisData.length + 1,
                                                        "sensitivity": sensitivity.value
                                                    });
                                                }

                                            }
                                        }
                                    }
                                }
                                let summary = document.getElementById('summary' + chartId);
                                let keyInsights = document.getElementById('keyInsights' + chartId);
                                let everything = document.getElementById('everything' + chartId);
                                let generation = [];
                                if (summary.checked) {
                                    generation = [{
                                        "verbosity": "summary"
                                    }];
                                    summaryView = "summary";
                                }
                                if (keyInsights.checked) {
                                    generation = [{
                                        "verbosity": "keyInsights"
                                    }];
                                    summaryView = "keyInsights";
                                }
                                if (everything.checked) {
                                    generation = [{
                                        "verbosity": "everything"
                                    }];
                                    summaryView = "everything";
                                }
                                var ootbModelData = {
                                    narrativeConfigMetaData: {
                                        characterization: [],
                                        analysisOrchestration: [],
                                        generation: []
                                    }
                                };
                                if (presistData['ootbModel'] !== undefined)
                                    ootbModelData = JSON.parse(presistData["ootbModel"]);


                                if (dimensionCharacterization.length === 0 || dimensionCharacterization === "") {
                                    ootbModel.narrativeConfigMetaData.characterization = ootbModelData.narrativeConfigMetaData.characterization;
                                    dimensionCharacterization = ootbModel.narrativeConfigMetaData.characterization;
                                } else
                                    ootbModel.narrativeConfigMetaData.characterization = dimensionCharacterization;
                                ootbModel.narrativeConfigMetaData.analysisOrchestration = analysisData;
                                ootbModel.narrativeConfigMetaData.generation = generation;
                                let model = dataModel;
                                model.dataset[0].metadata = ootbModel;
                                let url = OOTBGenerateEndPoint;
                                let xmlhttp = new XMLHttpRequest();
                                xmlhttp.onreadystatechange = function () {
                                    if (this.readyState === 4 && this.status === 200) {
                                        if (xmlhttp.responseText !== "") {
                                            pageLoader.style.display = "none";
                                            let summaryViewContainer = document.getElementById('accordian-summary' + chartId);
                                            let outputText = "";
                                            outputText = xmlhttp.responseText;
                                            outputText = outputText.trim();
                                            try {
                                                outputText = JSON.parse(outputText);
                                            } catch (e) {}
                                            let summaryContainer = document.querySelector('#accordian-summary' + chartId + ' ' + ' .card-content .ootb-text');
                                            summaryContainer.innerHTML = outputText;
                                            summaryViewContainer.classList.add('active');
                                        }
                                    }
                                }
                                xmlhttp.onerror = function (e) {
                                    if (!window.navigator.onLine)
                                        showModal("You are offline. Please check that you are connected to the Internet", chartId);
                                    else
                                        showModal(e, chartId);
                                    pageLoader.style.display = "none";
                                }

                                xmlhttp.open('POST', OOTBGenerateEndPoint, true);
                                xmlhttp.setRequestHeader("x-api-key", OOTBEndPointAPIKey);
                                if (window.navigator.onLine)
                                    xmlhttp.send(JSON.stringify(model));
                                else
                                    showModal("You are offline. Please check that you are connected to the Internet", chartId);
                            }

                            /**
                             * @methodOf: OOTB Initialize Presist Data
                             * @description The Function to Initialize Save Presist Data in Elements
                             * @returns 
                             */
                            function initializeOOTB() {
                                try {
                                    var ootbDataInitialize = chartObj['presistData']['ootbData'];
                                    if (ootbDataInitialize != undefined) {
                                        let ootbData = JSON.parse(ootbDataInitialize);
                                        if (ootbData['narrativeConfigMetaData']['generation'] != undefined || ootbData['narrativeConfigMetaData']['generation'] != "") {
                                            let generationKey = ootbData['narrativeConfigMetaData']['generation'];
                                            if (generationKey === undefined) {
                                                generationKey = [{
                                                    verbosity: 'summary'
                                                }];
                                            }
                                            let summary = document.getElementById('summary' + chartId);
                                            let keyInsights = document.getElementById('keyInsights' + chartId);
                                            let everything = document.getElementById('everything' + chartId);
                                            try {
                                                if (generationKey[0].verbosity === "summary")
                                                    summary.checked = true;
                                                else if (generationKey[0].verbosity === "keyInsights")
                                                    keyInsights.checked = true;
                                                else if (generationKey[0].verbosity == "everything")
                                                    everything.checked = true;
                                            } catch (e) {
                                                console.log(e);
                                            }
                                        }
                                        if (ootbData['narrativeConfigMetaData']['characterization'] != undefined || ootbData['narrativeConfigMetaData']['characterization'] != "") {
                                            setTimeout(function () {
                                                let characterization = ootbData['narrativeConfigMetaData']['characterization'];
                                                let ootbElements = document.querySelectorAll('#tell-data' + chartId + ' .card');
                                                for (let i = 0; i < characterization.length; i++) {
                                                    for (let index = 0; index < ootbElements.length; index++) {
                                                        let attribute = ootbElements[index].getAttribute('data-attr');
                                                        if (attribute == characterization[i].attributeName) {

                                                            let id = ootbElements[index].getAttribute('data-id') + chartId;
                                                            let checkItem = document.querySelector('input[name="field' + id + '"]');
                                                            if (checkItem != null) {
                                                                checkItem.checked = true;
                                                            }
                                                            let alias = document.querySelector('input[name="alias' + id + '"]');
                                                            alias.value = characterization[i].alias;
                                                            let dimension = document.querySelector('input[name="dimension' + id + '"]');
                                                            let measure = document.querySelector('input[name="measure' + id + '"]');
                                                            if (characterization[i].attributeType == "dimension") {
                                                                dimension.checked = true;
                                                                measure.checked = false;
                                                                let measureContainerElement = document.getElementById('measure-container' + id);
                                                                let dimensionWrapperMeasureElement = document.getElementById('increase-container' + id);
                                                                if (dimensionWrapperMeasureElement != null)
                                                                    dimensionWrapperMeasureElement.style.display = "none";
                                                                if (measureContainerElement != null)
                                                                    measureContainerElement.style.display = "none";
                                                                let element = document.querySelector('#content' + id + ' ' + '.measure-list');
                                                                element.classList.add('text-center');
                                                                element.classList.remove('text-left');
                                                            } else {
                                                                measure.checked = true;
                                                                dimension.checked = false;
                                                                if (characterization[i].increase == "bad") {
                                                                    let badElement = document.getElementById('bad' + id);
                                                                    badElement.checked = true;
                                                                } else if (characterization[i].increase == "neutral") {
                                                                    let neutralElement = document.getElementById('neutral' + id);
                                                                    neutralElement.checked = true;
                                                                }
                                                                let unit = document.querySelector('input[name="unit' + id + '"]');
                                                                unit.value = characterization[i].unit;
                                                                let measureContainerElement = document.getElementById('measure-container' + id);
                                                                if (measureContainerElement != null)
                                                                    measureContainerElement.style.display = "inline-block";
                                                                let dimensionWrapperMeasureElement = document.querySelector('#increase-container' + id);
                                                                if (dimensionWrapperMeasureElement != null)
                                                                    dimensionWrapperMeasureElement.style.display = "inline-block";
                                                                let element = document.querySelector('#content' + id + ' ' + '.measure-list');
                                                                element.classList.add('text-left');
                                                                element.classList.remove('text-center');
                                                            }
                                                            setTimeout(function () {
                                                                let selectEntity = document.getElementById('select-entity' + id);
                                                                if (selectEntity != null) {
                                                                    selectEntity.value = characterization[i].entityType;
                                                                }
                                                            }, 1000);
                                                        }
                                                    }
                                                }
                                            }, 1000);
                                        }
                                        if (ootbData['narrativeConfigMetaData']['characterization'] != undefined || ootbData['narrativeConfigMetaData']['characterization'] != "") {
                                            _this['initializeOOTBMetadata'] = true;
                                        }
                                    }
                                } catch (error) {
                                    console.log(error);
                                }

                            }


                            /**
                             * @methodOf: Save Presist OOTB Data
                             * @description The function to Save Presist OOTB Data
                             * @returns 
                             */
                            function saveOOTBPersist() {
                                var ootbDataInitialize = chartObj['presistData']['ootbData'];
                                if (ootbDataInitialize != undefined) {
                                    _this['initializeOOTBMetadata'] = false;
                                    let ootbData = JSON.parse(ootbDataInitialize);
                                    let analysisOOTB = ootbData['narrativeConfigMetaData']['analysisOrchestration'];
                                    if (analysisOOTB != undefined || analysisOOTB != "") {
                                        if (analysisOOTB.length > 0) {
                                            let dataArray = {};
                                            for (let index = 0; index < analysisOOTB.length; index++) {
                                                if (analysisOOTB[index].analysisType == "descriptiveStats") {
                                                    dataArray['descriptiveStats'] = true;
                                                    let rankData = document.getElementById('rank-data' + chartId);
                                                    let rankDomain = document.getElementById('rank-domain' + chartId);
                                                    if (analysisOOTB[index].ranking == "domain") {
                                                        if (rankDomain != null) {
                                                            rankDomain.checked = true;
                                                            rankData.checked = false;
                                                        }
                                                    } else {
                                                        rankData.checked = true;
                                                        rankDomain.checked = false;
                                                    }
                                                    let distribution = document.getElementById('analysis' + chartId);
                                                    if (distribution != null) {
                                                        distribution.checked = analysisOOTB[index].distribution_analysis;
                                                    }
                                                } else if (analysisOOTB[index].analysisType == "varianceAnalysis") {
                                                    dataArray['varianceAnalysis'] = true;
                                                    let timeBaseContainer = document.getElementById('timebasedvariance' + chartId);
                                                    let targetBaseContainer = document.getElementById('targetbasedvariance' + chartId);
                                                    if (analysisOOTB[index].varianceType == "targetBased") {
                                                        let varianceTarget = document.getElementById('target' + chartId);
                                                        varianceTarget.checked = true;
                                                        timeBaseContainer.style.display = "none";
                                                        targetBaseContainer.style.display = "block";
                                                        setTimeout(function () {
                                                            let actual = document.querySelector('select[name="targetActual' + chartId + '"]');
                                                            if ($('select[name="targetActual"] option[value="' + analysisOOTB[index].actual + '"]').length > 0) {
                                                                actual.value = analysisOOTB[index].actual;
                                                            }

                                                            let targetbudget = document.querySelector('select[name="targetbudget' + chartId + '"]');
                                                            if ($('select[name="targetbudget' + chartId + '"] option[value="' + analysisOOTB[index].target + '"]').length > 0) {
                                                                targetbudget.value = analysisOOTB[index].target;
                                                            }
                                                            let forcast = document.querySelector('select[name="forecast' + chartId + '"]');
                                                            if ($('select[name="forecast' + chartId + '"] option[value="' + analysisOOTB[index].forcast + '"]').length > 0) {
                                                                forcast.value = analysisOOTB[index].forcast;
                                                            }
                                                        }, 500);

                                                    } else {
                                                        let varianceTime = document.getElementById('time' + chartId);
                                                        varianceTime.checked = true;
                                                        timeBaseContainer.style.display = "block";
                                                        targetBaseContainer.style.display = "none";
                                                        let peroid = document.getElementById('timeperiod' + chartId);
                                                        peroid.value = analysisOOTB[index].Period;
                                                        let comparrison = document.getElementById('timeComparrison' + chartId);
                                                        comparrison.value = analysisOOTB[index].comparison;
                                                        setTimeout(function () {
                                                            let targetMeasure = document.getElementById('target-measure' + chartId);
                                                            if ($('#target-measure' + chartId + ' ' + ' option[value="' + analysisOOTB[index].measure + '"]').length > 0) {
                                                                targetMeasure.value = analysisOOTB[index].measure;
                                                            }
                                                        }, 500);
                                                    }
                                                    let range = document.getElementById('variance-range' + chartId);
                                                    let varianceTop = document.getElementById('variance-top' + chartId);
                                                    let varianceCoverage = document.getElementById('variance-coverage' + chartId);
                                                    let varianceTopSelect = document.getElementById('variance-topselect' + chartId);
                                                    let topSpan = document.getElementById('topSpan' + chartId);
                                                    let coverageSpan = document.getElementById('coverageSpan' + chartId);
                                                    if (analysisOOTB[index].entitySelection['topN'] != undefined) {
                                                        varianceTop.checked = true;
                                                        varianceCoverage.checked = false;
                                                        varianceTopSelect.value = analysisOOTB[index].entitySelection['topN'];
                                                        range.setAttribute('disabled', 'disabled');
                                                        varianceTopSelect.removeAttribute('disabled');
                                                        if (topSpan != null) {
                                                            topSpan.classList.remove('disable');
                                                        }
                                                        if (coverageSpan != null) {
                                                            coverageSpan.classList.add('disable');
                                                        }
                                                    } else {
                                                        varianceTop.checked = false;
                                                        varianceCoverage.checked = true;
                                                        let coverageValue = analysisOOTB[index].entitySelection['coverage'];
                                                        coverageValue = parseInt(coverageValue.replace(/%/, ''));
                                                        range.value = coverageValue;
                                                        let coverageRange = document.querySelector('#coverageSpan' + chartId + '' + ' .slide-span');
                                                        if (coverageRange != null) {
                                                            coverageRange.style.left = coverageValue - 8 + "%";
                                                            coverageRange.innerHTML = coverageValue;
                                                        }

                                                        range.removeAttribute('disabled');
                                                        varianceTopSelect.setAttribute('disabled', 'disabled');
                                                        if (topSpan != null) {
                                                            topSpan.classList.add('disable');
                                                        }
                                                        if (coverageSpan != null) {
                                                            coverageSpan.classList.remove('disable');
                                                        }
                                                    }

                                                } else if (analysisOOTB[index].analysisType == "correlations") {
                                                    dataArray['correlations'] = true;
                                                    let lowElement = document.getElementById('low' + chartId);
                                                    lowElement.value = analysisOOTB[index].thresholds.low;
                                                    let strongElement = document.getElementById('strong' + chartId);
                                                    strongElement.value = analysisOOTB[index].thresholds.strong;
                                                    let spanHighlightFirst = document.querySelector('#outofbox-tabsection' + chartId + ' ' + ' span.highlight-first');
                                                    let spanHightlightLast = document.querySelector('#outofbox-tabsection' + chartId + ' ' + ' span.highlight-sencond');
                                                    let spanRange = document.querySelector('#outofbox-tabsection' + chartId + ' ' + ' span.rangefirst');
                                                    let spanRangeLast = document.querySelector('#outofbox-tabsection' + chartId + ' ' + ' span.rangesecond');
                                                    let rangeFirstValue = Number(lowElement.value);
                                                    rangeFirstValue = (rangeFirstValue * 10) * 10;
                                                    spanHighlightFirst.style.left = rangeFirstValue + "%";
                                                    let rangeLastValue = Number(strongElement.value * 10) * 10;
                                                    spanHightlightLast.style.left = rangeLastValue + "%";
                                                    spanRange.style.left = rangeFirstValue + 3 + "%";
                                                    spanRange.innerHTML = analysisOOTB[index].thresholds.low;
                                                    spanRangeLast.style.left = rangeLastValue + 3 + "%";
                                                    spanRangeLast.innerHTML = analysisOOTB[index].thresholds.strong;
                                                    let container = document.getElementById('measure-container' + chartId);
                                                    if (analysisOOTB[index].measures.length > 0) {
                                                        container.innerHTML = "";
                                                    }
                                                    for (let i = 0; i < analysisOOTB[index].measures.length; i++) {
                                                        if (container != null || container != undefined) {
                                                            if (i >= 1) {
                                                                document.getElementById('removemeasure-header' + chartId).style.display = "inline-block";
                                                            }
                                                            if (measureColumn.length > 0) {
                                                                let selectCount = 2;
                                                                let element = document.createElement('div');
                                                                element.setAttribute('id', "measure" + i + chartId);
                                                                element.setAttribute('class', "measure");
                                                                container.appendChild(element);
                                                                for (let selectIndex = 0; selectIndex < selectCount; selectIndex++) {
                                                                    let selectElement = document.createElement('select');
                                                                    selectElement.setAttribute('id', 'select' + selectIndex + chartId);
                                                                    element.appendChild(selectElement);
                                                                    for (let measureCount = 0; measureCount < measureColumn.length; measureCount++) {
                                                                        let option = document.createElement('option');
                                                                        option.value = measureColumn[measureCount];
                                                                        option.text = measureColumn[measureCount];
                                                                        if (analysisOOTB[index].measures[i][selectIndex] == measureColumn[measureCount]) {
                                                                            option.selected = true;
                                                                        }
                                                                        selectElement.appendChild(option);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                } else if (analysisOOTB[index].analysisType == "timeSeriesAnalysis") {
                                                    dataArray['timeSeriesAnalysis'] = true;
                                                    let time = document.querySelector('#timeSeries' + chartId + ' ' + ' input[type="range"]');
                                                    time.value = analysisOOTB[index].sensitivity;
                                                    let timeSeriesSpanElement = document.querySelector('#timeSeries' + chartId + ' ' + ' span.slide-span');
                                                    timeSeriesSpanElement.innerHTML = analysisOOTB[index].sensitivity;
                                                    let timeSpanValue = Number(time.value);
                                                    timeSeriesSpanElement.style.left = timeSpanValue - 8 + "%";
                                                }
                                                if (index == analysisOOTB.length - 1) {
                                                    if (dataArray['descriptiveStats'] == undefined) {
                                                        let statsElement = document.getElementById('stats' + chartId);
                                                        statsElement.classList.remove('active');
                                                        let statsCheckBox = document.querySelector('input[name="stats' + chartId + '"]');
                                                        statsCheckBox.checked = false;
                                                    }
                                                    if (dataArray['timeSeriesAnalysis'] == undefined) {
                                                        let timeSeriesElement = document.getElementById('timeSeries' + chartId);
                                                        timeSeriesElement.classList.remove('active');
                                                        let timeSeriesElementCheckBox = document.querySelector('input[name="timeSeries' + chartId + '"]');
                                                        timeSeriesElementCheckBox.checked = false;
                                                    }
                                                    if (dataArray['varianceAnalysis'] == undefined) {
                                                        let varianceElement = document.getElementById('variance' + chartId);
                                                        varianceElement.classList.remove('active');
                                                        let varianceCheckBox = document.querySelector('input[name="variance' + chartId + '"]');
                                                        varianceCheckBox.checked = false;
                                                    }
                                                    if (dataArray['correlations'] == undefined) {
                                                        let correlationElement = document.getElementById('correlations' + chartId);
                                                        correlationElement.classList.remove('active');
                                                        let correlationCheckBox = document.querySelector('input[name="correlations' + chartId + '"]');
                                                        correlationCheckBox.checked = false;
                                                    }

                                                }
                                            }
                                        } else {
                                            let statsElement = document.getElementById('stats' + chartId);
                                            statsElement.classList.remove('active');
                                            let statsCheckBox = document.querySelector('input[name="stats' + chartId + '"]');
                                            statsCheckBox.checked = false;
                                            let timeSeriesElement = document.getElementById('timeSeries' + chartId);
                                            timeSeriesElement.classList.remove('active');
                                            let timeSeriesElementCheckBox = document.querySelector('input[name="timeSeries' + chartId + '"]');
                                            timeSeriesElementCheckBox.checked = false;
                                            let varianceElement = document.getElementById('variance' + chartId);
                                            varianceElement.classList.remove('active');
                                            let varianceCheckBox = document.querySelector('input[name="variance' + chartId + '"]');
                                            varianceCheckBox.checked = false;
                                            let correlationElement = document.getElementById('correlations' + chartId);
                                            correlationElement.classList.remove('active');
                                            let correlationCheckBox = document.querySelector('input[name="correlations' + chartId + '"]');
                                            correlationCheckBox.checked = false;
                                        }

                                    }
                                }
                            }
                            _this['callNarration' + chartId] = true;


                        });
                    }


                });
            }




            // getDataSet();
        },
        resize: function ($element, layout) {

            var chartId = $(this.$element[0]).find('.container').attr('id').split('_')[1];
            var resizeElement = document.querySelector('div[tid="' + chartId + '"]');
            chartId = "_" + chartId;
            var containerWidth = 0;
            var qlikContainer = $('#qlikContainer' + chartId);
            if (qlikContainer) {
                containerWidth = qlikContainer.width();
            }
            var elementHeight;
            maximize = true;
            if ($(".qv-gridcell.active").height() != undefined) {
                maximize = false;
                elementHeight = parseInt($(".qv-gridcell.active").height()) - 60;
            }



            if (elementHeight == undefined) {

                if (qlik.navigation.getMode() !== "edit" || maximize) {
                    maximize = true;
                    document.getElementById('disable' + chartId).style.display = "none";
                }
                if (resizeElement)
                    elementHeight = parseInt(resizeElement.clientHeight) - 60;
            }
            if (!maximize) {
                if (qlik.navigation.getMode() == "edit")
                    document.getElementById('disable' + chartId).style.display = "block";
            } else {
                if (qlik.navigation.getMode() == "edit")
                    if (document.querySelector('a.lui-icon--remove') != null)
                        document.getElementById('disable' + chartId).style.display = "none";
                    else
                        document.getElementById('disable' + chartId).style.display = "block";
            }
            if (elementHeight !== undefined) {
                $('#qlikContainer' + chartId).css({
                    'height': elementHeight + 'px'
                });
                $('#narrative-section' + chartId).css({
                    height: elementHeight + 'px'
                });
            }

            if (containerWidth >= 840)
                $("#responsive-840qlikContainer" + chartId).remove();
            if (containerWidth >= 765 && containerWidth >= 641)
                $('#responsive-765qlikContainer' + chartId).remove();

            if (containerWidth >= 760)
                $('#responsive-760qlikContainer' + chartId).remove();

            if (containerWidth >= 640)
                $('#responsive-640qlikContainer' + chartId).remove();

            if (containerWidth >= 540)
                $('#responsive-540qlikContainer' + chartId).remove();

            if (containerWidth >= 500)
                $('#responsive-500qlikContainer' + chartId).remove();

            if (containerWidth >= 460)
                $('#responsive-460qlikContainer' + chartId).remove();

            if (containerWidth >= 420)
                $('#responsive-420qlikContainer' + chartId).remove();

            if (containerWidth >= 400)
                $("#responsive-400qlikContainer" + chartId).remove();

            if (containerWidth >= 340)
                $("#responsive-340qlikContainer" + chartId).remove();


            var id = "#" + qlikContainer[0].id + " ";

            var responsive840 = '#840' + qlikContainer[0].id;
            if (containerWidth <= 840) {
                if (!$(responsive840).length) {
                    var style = "";
                    style += '' + id + '.outofbox-tabsection .entity-selction p:first-child{text-align:left;margin-left:0px;}';
                    $('<style id=840' + qlikContainer[0].id + '>').html(style).appendTo("head");
                }
            } else {
                $('#840' + qlikContainer[0].id).remove();
            }
            var responsive765 = '#765' + qlikContainer[0].id;
            if (containerWidth <= 765 && containerWidth >= 641) {
                if (!$(responsive765).length) {
                    var styleElement = "";
                    var id = '#qlikContainer' + chartId + " ";
                    styleElement += '' + id + '.measure-list span { display: block; text-align: center; margin-bottom: 8px; }';
                    styleElement += '' + id + '.variance .col-md-4 label{display:block; margin-bottom: 8px;}';
                    $('<style id=765' + qlikContainer[0].id + '>').html(styleElement).appendTo("head");
                }

            } else {
                $('#765' + qlikContainer[0].id).remove();
            }
            var responsive760 = '#760' + qlikContainer[0].id;
            if (containerWidth <= 760) {
                if (!$(responsive760).length) {
                    var styleElement = "";
                    var id = '#qlikContainer' + chartId + " ";
                    styleElement += '' + id + '.narrative-tabsection .auth-header .col-md-8,' + id + '.narrative-tabsection .auth-header .col-md-4 { width: 100% !important; padding-right: 0px; padding-left: 0px; }';
                    $('<style id=760' + qlikContainer[0].id + '>').html(styleElement).appendTo("head");
                }
            } else {
                $('#760' + qlikContainer[0].id).remove();
            }
            var ootbMediumStyleId = '#640_OOTB' + qlikContainer[0].id;
            if (containerWidth <= 640) {
                if (!$(ootbMediumStyleId).length) {
                    var styleElement = "";
                    styleElement += '' + id + '.outofbox-tabsection .entity-selction p{margin-left:0px!important}';
                    styleElement += '' + id + '.card-field .col-md-6{text-align:left!important}';
                    styleElement += '' + id + '.tell-data .card-content .col-md-12:first-child .col-md-6,.tell-data .card-content .col-md-12:first-child .col-md-6 p{margin-bottom:0px!important}';
                    styleElement += '' + id + '.tell-data .card-content .col-md-6{width:100%!important;text-align:left!important}';
                    styleElement += '' + id + '.measure-list .col-md-4{width:100%!important}';
                    styleElement += '' + id + '.tell-data .card-content .col-md-12:first-child .col-md-6 p:last-child{margin-left:15%}';
                    styleElement += '' + id + '.measure-list{margin-top:20px}';
                    styleElement += '' + id + '.col-md-12.measure-list.text-center{text-align:left!important}';
                    styleElement += '' + id + '.measure-list .col-md-4 select{width:62%!important}';
                    styleElement += '' + id + '.measure-list .col-md-4 input{width:60%}';
                    styleElement += '' + id + '.measure-list .col-md-4 span{width:30%;display:inline-block}';
                    styleElement += '' + id + '.tell-what .col-md-6{width:100%!important}';
                    styleElement += '' + id + '.outofbox-tabsection .stats .card-content .col-md-6:first-child{text-align:left!important}';
                    styleElement += '' + id + '.targetbasedvariance .col-md-4 label{width:30%;display:inline-block}';
                    styleElement += '' + id + '.targetbasedvariance .col-md-4{width:100%!important}';
                    styleElement += '' + id + '.targetbasedvariance .col-md-4:nth-child(2) select{width:60%!important;margin-left:10px!important}';
                    styleElement += '' + id + '.entity-selction p{width:100%!important}';
                    styleElement += '' + id + '.timebasedvariance .col-md-4{width:100%!important}';
                    styleElement += '' + id + '.variance .col-md-4 label{width:30%;display:inline-block}';
                    styleElement += '' + id + '.multiple-range.col-md-8,' + id + '.correlations .col-md-8{width:100%!important}';
                    styleElement += '' + id + '.measure-list span{text-align:left;}';
                    styleElement += '' + id + '.measure-list.text-left{text-align:left;}';
                    styleElement += '' + id + 'div.distribution:last-child { display: block; margin-left: 52px !important; }';
                    styleElement += '' + id + '.timebasedvariance, ' + id + '.targetbasedvariance{text-align:left !important;}';
                    styleElement += '' + id + '.outofbox-tabsection .variance .col-md-4 select{width: 60%;padding: 5px;height:auto;}';
                    styleElement += '' + id + '.outofbox-tabsection .entity-selction p:first-child{text-align:left;}';
                    styleElement += '' + id + '.outofbox-tabsection .correlations .card-content .col-md-8:first-child p { float: none; display: block; text-align: left; }';
                    styleElement += '' + id + '.outofbox-tabsection .correlations .card-content .col-md-8:first-child .measure-container{text-align:left;display: block;}';
                    styleElement += '' + id + '.card .card-content .measure-list.text-center select{margin-left:12px !important}';
                    styleElement += '' + id + '.multiple-range label { margin-top: 40px; }';
                    $('<style id=640_OOTB' + qlikContainer[0].id + '>').html(styleElement).appendTo("head");
                }
            } else {
                $('#640_OOTB' + qlikContainer[0].id).remove();
            }
            var ootbSmallStyleId = '#540_OOTB' + qlikContainer[0].id;
            if (containerWidth <= 540) {
                if (!$(ootbSmallStyleId).length) {
                    var ootbStyle = "";
                    ootbStyle += '' + id + '.tell-data .card-content .col-md-12:first-child .col-md-6 p:last-child{margin-left:10%}';
                    ootbStyle += '' + id + '.tell-data .card-content .col-md-6:last-child p:first-child{margin-left:5%!important}';
                    ootbStyle += '' + id + '#correlations' + chartId + ' .multiple-range label {margin-top: 40px;}';
                    $('<style id=540_OOTB' + qlikContainer[0].id + '>').html(ootbStyle).appendTo("head");
                }
            } else {
                $('#540_OOTB' + qlikContainer[0].id).remove();
            }
            var ootbExtraStyleId = '#500_OOTB' + qlikContainer[0].id;
            if (containerWidth <= 500) {
                if (!$(ootbExtraStyleId).length) {
                    var ootbStyle = "";
                    ootbStyle += '' + id + '.multiple-range label{margin-top:40px}';
                    ootbStyle += '' + id + '.accordian-summary span { display: block; text-align: left; }';
                    $('<style id=500_OOTB' + qlikContainer[0].id + '>').html(ootbStyle).appendTo("head");
                }
            } else {
                $('#500_OOTB' + qlikContainer[0].id).remove();
            }

            var simpleLargeStyleId = "#640_simple" + qlikContainer[0].id;
            if (containerWidth < 640) {
                if (!$(simpleLargeStyleId).length) {
                    var style = "";
                    style += '' + id + '.studio-options .col-md-3,' + id + '.studio-options .col-md-9{display:block;width:100%!important}';
                    style += '' + id + '.studio-options .col-md-9 p:first-child{margin:0!important}';
                    style += '' + id + '.studio-options .col-md-9 p{display:block!important;margin:10px 0px !important;}';
                    style += '' + id + '.edit-mapsection{display:inline-block!important}';
                    style += '' + id + '.export,' + id + '.data-json,' + id + '.csvload{width:100%!important;margin-bottom:10px}';
                    style += '' + id + '.edit-mapsection .export,' + id + '.edit-mapsection .data-json{float:none!important}';
                    style += '' + id + 'footer{text-align:center;position:relative;min-height:100px;margin-bottom:10px}';
                    style += '' + id + 'footer .col-md-2{width:100%!important;text-align:center;position:absolute;bottom:0;right:0;left:0}';
                    style += '' + id + 'footer .col-md-10.text-right{text-align:center!important;width:100%!important}';
                    style += '' + id + '.dynamic-header .auth-header .col-md-4{padding-right:0}';
                    style += '' + id + '.dynamic-header .col-md-4,.dynamic-header .col-md-8{width:100%!important}';
                    style += '' + id + '.studio-type{width:100%!important;position:relative;margin-top:15px;float:none}';
                    style += '' + id + '.studio-type .col-md-3{width:15%!important;float:left;text-align:right;margin-top:10px}';
                    style += '' + id + '.studio-type .col-md-9{width:69%!important;float:left;padding-left:25px}';
                    style += '' + id + '.studio-type .col-md-9 p{margin-bottom:10px!important}';
                    style += '' + id + '.simple-mode .studio-options .col-md-3 p{margin-bottom:16px;}';
                    style += '' + id + '.edit-mapsection{padding-bottom: 0px;}';
                    $('<style id=640_simple' + qlikContainer[0].id + '>').html(style).appendTo("head");
                }
            } else {
                $('#640_simple' + qlikContainer[0].id).remove();
            }

            var mediumStyleId = '#460' + qlikContainer[0].id;
            if (containerWidth <= 460) {
                if (!$(mediumStyleId).length) {
                    var style = "";
                    style += '' + id + '.outofbox-tabsection .distribution-container .distribution:first-child p:last-child { margin-left: 62px; }';
                    style += '' + id + '.multiple-range label,' + id + '.multiple-range label input{width: 320px !important;}';
                    style += '' + id + '.increase-container span { display: block; margin-bottom: 15px; }' + id + '.tell-data .card-content .col-md-6:last-child p { display: block; float: left; }' + id + '.card-content .col-md-6:last-child p.good-container { margin-left: 0px !important; }';
                    style += '' + id + '.tab-header button { margin-top: 30px; }';
                    style += '' + id + '.tab-header a{top:initial;transform: translateY(-0%);}';
                    $('<style id=460' + qlikContainer[0].id + '>').html(style).appendTo("head");
                }
            } else {
                $('#460' + qlikContainer[0].id).remove();
            }
            var simpleMediumStyleId = "#420_simple" + qlikContainer[0].id;
            if (containerWidth < 420) {
                if (!$(simpleMediumStyleId).length) {
                    var style = "";
                    style += '' + id + '.studio-type .col-md-9{width:60%!important}' + id + '.studio-type .col-md-3{width:24 %!important}';
                    style += '' + id + '.multiple-range label,' + id + ' .multiple-range label input{width: 260px !important;}';
                    $('<style id=420_simple' + qlikContainer[0].id + '>').html(style).appendTo("head");
                }
            } else {
                $('#420_simple' + qlikContainer[0].id).remove();
            }
            var headerStyleId = "#400_header" + qlikContainer[0].id;
            if (containerWidth < 400) {
                if (!$(headerStyleId).length) {
                    var style = "";
                    style += '' + id + 'header .tab-header button{padding: 8px 2px !important;font-size:12px !important;}';
                    $('<style id=400_header' + qlikContainer[0].id + '>').html(style).appendTo("head");
                }
            } else {
                $("#400_header" + qlikContainer[0].id).remove();
            }
            var btnStyleId = "#340_header" + qlikContainer[0].id;
            if (containerWidth < 340) {
                if (!$(btnStyleId).length) {
                    var style = "";
                    style += '' + id + '.openstudio_btn{margin: 7px 5px 10px 0px;padding: 4px 10px;font-size: 12px;}';
                    style += '' + id + '.generate_btn{margin: 7px 0;padding: 4px 10px; font-size: 12px;}';
                    $('<style id=340_header' + qlikContainer[0].id + '>').html(style).appendTo("head");
                }
            } else {
                $("#340_header" + qlikContainer[0].id).remove();
            }
            var tellDataContainer = document.getElementById('tell-what' + chartId);
            var container = document.getElementById('qlikContainer' + chartId);
            var windowWidth = container.clientWidth;

            if (tellDataContainer.style.display == "block") {
                if (windowWidth > 640) {
                    let correlationSpanWidth = document.querySelector('#tell-what' + chartId + ' ' + '.multiple-range span:first-child').clientWidth;
                    let correlationWidth = document.querySelector('#tell-what' + chartId + ' ' + '.multiple-range').clientWidth;
                    let width = (correlationWidth - correlationSpanWidth) - 20;
                    let labelElement = document.querySelector('#tell-what' + chartId + ' ' + '.multiple-range label');
                    labelElement.style.width = width + "px";
                    let inputElement = document.querySelectorAll('#tell-what' + chartId + ' ' + '.multi-range');
                    inputElement[0].style.width = width + "px";
                    inputElement[1].style.width = width + "px";
                }
            }
        }
    }
});