//-----------------------------------------------------------------
// general purpose API manager for Google web apps
// includes:
//   - landing spot for GET and PUT requests
//   - retrieval, validation and packaging for query parameters
//   - call to dispatch function for GET and PUT
//   - standard wrapper functions for success and fail responses
//-----------------------------------------------------------------

//-----------------------------------------------------------------
// landing spot for GET requests
//-----------------------------------------------------------------
function doGet(e) {
  var response = null;  
  var options = processParameters(e);
  if (!isAuthorized(options)) {
    return buildResponse(webAppAPIErrorResult('not authorized'));
  }
  
  var packagedData = dispatchGETRequest(options);
  if (packagedData && packagedData.success) {
    response = buildResponse(webAppAPISuccessResult(options.dataset + ' succeeded', packagedData.data));
  } else {
    response = buildResponse(packagedData);
  }
  
  return response;
}

//-----------------------------------------------------------------
// landing spot for POST requests
//-----------------------------------------------------------------
function doPost(e){
  var response = null;
  var options = processParameters(e);
  if (!isAuthorized(options)) {
    return buildResponse(webAppAPIErrorResult('not authorized'));
  }

  try {
    var parsedPostData = JSON.parse(e.postData.contents);
    var processResult = dispatchPOSTRequest(parsedPostData, options);

    if (processResult && processResult.success) {
      response = buildResponse(webAppAPISuccessResult(options.dataset + ' succeeded', processResult.details));
    } else {
      response = buildResponse(processResult);
    }
    
  } catch (e) {
    response = buildResponse(webAppAPIErrorResult('*catch* ' + JSON.stringify(e)));
  }

  return response;
}

//----------------------------------------------------------------------
// retrieval and validation routines for query parameters
//----------------------------------------------------------------------

// convert each query parameter into a property of the returned object
function processParameters(e) {
  var options = {key: null, dataset: null};
  for (var key in e.parameters) {
    options[key] = e.parameters[key][0];
  }
  return options;
}

// test options.key against the API key
function isAuthorized(options) {
  return options.key === API_KEY;
}

//-------------------------------------------------------------------
// process data set in response to GET and POST requests
//   - dispatchFunctions_GET and dispatchFunctions_POST must 
//     be defined elswehere in the project.  They should be objects
//     that contain pairs of dataset names and process functions, e.g.
//     var dispatchGETRequest = {"studentinfo", getStudentInfo};
//------------------------------------------------------------------
function dispatchGETRequest(options) {
  var result = webAppAPIErrorResult("no matching handler for dataset: " + options.dataset);
  
  var dataset = options.dataset;
  if (dataset in dispatchFunctions_GET) {
    try {
      result = dispatchFunctions_GET[dataset](options);
    } catch (e) {
      result = webAppAPIErrorResult("error in dispatching for " + options.dataset + ": " + JSON.stringify(e));
    }
  }

  return result;
}

function dispatchPOSTRequest(postData, options) {
  var result = webAppAPIErrorResult("no matching handler for dataset: " + options.dataset);
  
  var dataset = options.dataset;
  if (dataset in dispatchFunctions_POST) {
    try {
      result = dispatchFunctions_POST[dataset](postData);
    } catch (e) {
      result = webAppAPIErrorResult("error in dispatching for " + options.dataset + ": " + JSON.stringify(e));
    }
  }
  
  return result;
}

//---------------------------------------------------------------------
// response builders for GET and POST
//---------------------------------------------------------------------
function webAppAPIErrorResult(details) {
  return {
    success: false,
    details: details,
    data: null
  };
}

function webAppAPISuccessResult(details, data) {
  return {
    success: true,
    details: details,
    data: data
  };
}

// webAppAPIResult should be either a webAppAPIErrorResult or a webAppAPISuccessResult
function buildResponse(webAppAPIResult) {
  var output = JSON.stringify(webAppAPIResult);
  
  return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
}