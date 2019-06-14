/*

This file contains functions to modify metadata of BI JSON data structure.
version : 1.0.1
date: 26 Nov 2018

*/

/*
This function takes a data object in BI JSON format and adds an attribute to the metadata object with key as 
the attribute name and the value as the attribute value.
*/
function addMetaData(data,key,value){
    var dataset=data.dataset[0];
    var metadata=dataset["metadata"];
    var datasets=[];
    metadata[key]=value;
    dataset["metadata"]=metadata;
    datasets.push(dataset);
    data["dataset"]=datasets;
}



/*
This method creates a default "narrativeConfigMetadata" object used in OOTB.
*/
function setDefaultNarrativeConfig(data){
    var narrativeConfigMetaData={};
    var datasetMeasures=data.dataset[0].measures;
    var allColumns=data.dataset[0].column_names;
    var measures=[];
    var characterization=[];
    var analysisOrchestration=[];
    
    var verbosity= {
        "verbocity": "keyinsights"
    };
    var generation=[];
    var aggTypes={};
    generation.push(verbosity);
    for(var i = 0; i < datasetMeasures.length; i++) {
        var measureName=datasetMeasures[i].substring(4, datasetMeasures[i].length-1).split(".")[1];
		if (!measureName){
            measureName=datasetMeasures[i].substring(4, datasetMeasures[i].length-1);
        }
        measures.push(measureName);
        aggTypes[measureName]=datasetMeasures[i].substring(0,3);
    }

    for(var i = 0; i < allColumns.length; i++) {
        var columnName=allColumns[i];
        var attObject={};
        attObject["attributeName"]=columnName;
        attObject["alias"]="";
        attObject["entityType"]="";
        attObject["unit"]="";
        attObject["increase"]="";
        attObject["rank"]=i+1;
        if (measures.includes(columnName)){
            attObject["attributeType"]="measure";
            attObject["aggregateType"]=aggTypes[columnName];
            attObject["entityType"]="currency";
            attObject["unit"]="USD";
        }else{
            attObject["attributeType"]="dimension";
        }
    
        
        characterization.push(attObject);
        
    }


    narrativeConfigMetaData["characterization"]=characterization;
    narrativeConfigMetaData["analysisOrchestration"]=analysisOrchestration;
    narrativeConfigMetaData["generation"]=generation;
    var dataset=data.dataset[0];
    var metadata=dataset["metadata"];
    var datasets=[];
    metadata["narrativeConfigMetaData"]=narrativeConfigMetaData;
    dataset["metadata"]=metadata;
    datasets.push(dataset);
    data["dataset"]=datasets;
}


/*
Updates an existing dimension or measure identified by the name.
*/
function updateDimensionOrMeasure(data,name,key,value){
    var dataset=data.dataset[0];
    var metadata=dataset["metadata"];
    var characterization=dataset["metadata"].narrativeConfigMetaData.characterization;
    for(var i in characterization)
    {
    var obj=(characterization[i]);
     if (obj.attributeName==name){
         obj[key]=value;
         characterization[i]=obj;
     }
    }

}


/*
Updates an existing analysis orchestration object identified by the name or adds a new object for the given name.
*/
function updateAnalysisOrchestration(data,name,key,value){
    var dataset=data.dataset[0];
    var metadata=dataset["metadata"];
    var analysisOrchestration=dataset["metadata"].narrativeConfigMetaData.analysisOrchestration;
    var found=false;
    for(var i in analysisOrchestration)
    {
        var obj=(analysisOrchestration[i]);
    
        if (obj.analysisType==name){
            obj[key]=value;
            analysisOrchestration[i]=obj;
            found=true;
        }
    }
    if (!found){
        var analysisOrchestrationObj={'analysisType':name};
        analysisOrchestrationObj[key]=value;
        analysisOrchestration.push(analysisOrchestrationObj);
    }
}

/*
Adds or updates descriptive statistics analysis to the metadata with provided parameters.
*/
function updateDescriptiveStats(data,rank,rankingType,includeDistributionAnalysis){
    var dataset=data.dataset[0];
    var metadata=dataset["metadata"];
    var analysisOrchestration=dataset["metadata"].narrativeConfigMetaData.analysisOrchestration;
    var found=false; 
    var stats={
        "analysisType": "descriptiveStats",
        "rank": rank,
        "ranking": rankingType,
        "distribution_analysis": includeDistributionAnalysis
        };
    for(var i in analysisOrchestration)
    {
        var obj=(analysisOrchestration[i]);
        
        if (obj.analysisType=="descriptiveStats"){
            analysisOrchestration[i]=stats;
            found=true;
        }
    }
    if (!found){
        analysisOrchestration.push(stats);
    }
    
}

/*
Adds or updates target-based variance analysis to the metadata with provided parameters.
*/
function updateTargetBasedVariance(data,rank,actual,target,entitySelectionType,coverage){
    var dataset=data.dataset[0];
    var metadata=dataset["metadata"];
    var analysisOrchestration=dataset["metadata"].narrativeConfigMetaData.analysisOrchestration;
    var found=false;
    var entitySelection={"topN":coverage};
    if (entitySelectionType=="coverage"){
        entitySelection={"coverage":coverage};
    }
    var varTimeBased= {
        "analysisType": "varianceAnalysis",
        "rank": rank,
        "varianceType": "targetBased",
        "actual": actual,
        "target": target,
        "entitySelection": entitySelection
    };
    var found=false;
    for(var i in analysisOrchestration)
    {
        var obj=(analysisOrchestration[i]);
        
        if (obj.analysisType=="varianceAnalysis"){
            analysisOrchestration[i]=varTimeBased;
            found=true;
        }
    }
    if (!found){
        analysisOrchestration.push(varTimeBased);
    }
    
    
}

/*
Adds or updates time-based variance analysis to the metadata with provided parameters.
*/
function updateTimeBasedVariance(data,rank,measure,period,comparison,entitySelectionType,coverage){
    var dataset=data.dataset[0];
    var metadata=dataset["metadata"];
    var analysisOrchestration=dataset["metadata"].narrativeConfigMetaData.analysisOrchestration;
    var entitySelection={"topN":coverage};
    if (entitySelectionType=="coverage"){
        entitySelection={"coverage":coverage};
    }
    var found=false;
    var varTargetBased= {
        "analysisType": "varianceAnalysis",
        "rank": rank,
        "varianceType": "timeBased",
        "measure": measure,
        "Period": period,
        "comparison":comparison,
        "entitySelection": entitySelection
    }
    for(var i in analysisOrchestration)
    {
        var obj=(analysisOrchestration[i]);
        
        if (obj.analysisType=="varianceAnalysis"){
            analysisOrchestration[i]=varTargetBased;
            found=true;
        }
    }
    if (!found){
        analysisOrchestration.push(varTargetBased);
    }   
    
    
}




/*
This method updates the verbosity attribute value in the generation object array.
*/
function updateVerbosity(data,verbosity){
    var dataset=data.dataset[0];
    var metadata=dataset["metadata"];
    var narrConfMetaData=dataset["metadata"].narrativeConfigMetaData;
    var datasets=[];
    var generation=[];
    const verbosityObj= {'verbocity':verbosity};
    generation.push(verbosityObj);
    narrConfMetaData['generation']=generation;
    metadata['narrativeConfigMetaData']=narrConfMetaData;
    dataset["metadata"]=metadata;
    datasets.push(dataset);
    data["dataset"]=datasets;
    }