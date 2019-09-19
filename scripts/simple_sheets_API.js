"use strict";
  
//---------------------------------------------------------------
// simpleSheetsAPI class 
//   - use web apps interface to read/write Google Sheet documents
//---------------------------------------------------------------
/**
 * class to manipulate the web apps interface for 
 * reading and writing Google Sheet documents
 * @namespace simpleSheetsAPI
 */
class simpleSheetsAPI {
  /**
  * Configuration information for use with the web app API.  
  * Note these values should not be changed unless you are using your own web app API
  * @returns {Object} {apkey: (string) key for web app API, apibase: (string) base URL for web app API}
  * @example
  * var info = simpleSheetsAPI.apiInfo();
  // info.apikey = 'simpleSheetAPI'
  // info.apibase = 'https://script.google.com/macros/s/AKfycbyuX2ejECoEhRBp4Dqa8ncr032sW00SLmQAh0DdaT0XEYJrZh4/exec'
  */
  static apiInfo() {
    return {
      apikey: 'simpleSheetAPI',
      apibase: 'https://script.google.com/macros/s/AKfycbyuX2ejECoEhRBp4Dqa8ncr032sW00SLmQAh0DdaT0XEYJrZh4/exec'
    };
  }
  
  /**
   * retrieve data from all sheets in the Google Sheet document with the given ID (asynchronous)
   * @param {string} spreadsheetId - the ID for the Google Sheet
   * @returns {Object} {success: boolean, data: see {@link #simplesheetsapiapireturndata apiReturnData}}
   * @example
   * // retrieve data from all sheets in sample data doc
   * var result = await simpleSheetsAPI.getAllSheetData('1NVd3tAgHhPZ5PZFN2A2h26mPoS2fPDk_aMVEnzCkE74');
   * // result.success = true if call succeeded
   * // result.data = object of type apiReturnData if success, otherwise null
   * // result.details - string describing result, contains an error message if success is false
   */
  static async getAllSheetData(spreadsheetId) {
    var requestParams = {
      'spreadsheetid': spreadsheetId
    };
    
    var requestResult = await googleWebAppAPI.webAppGet(this.apiInfo(), 'getallsheetdata', requestParams);
    return requestResult;
  }

  /**
   * retrieve data from the specified sheet in the Google Sheet document with the given ID (asynchronous)
   * @param {string} spreadsheetId - the ID for the Google Sheet
   * @param {string} sheetName - name of a sheet in the spreadsheet doc
   * @returns {Object} {success: boolean, data: see {@link #simplesheetsapiapireturndata apiReturnData}}
   * @example
   * // retrieve data from "basic" sheet in sample data doc
   * var result = await simpleSheetsAPI.getSheetData('1NVd3tAgHhPZ5PZFN2A2h26mPoS2fPDk_aMVEnzCkE74', 'basic');
   * // result.success - true if call succeeded
   * // result.data - object of type apiReturnData if success, otherwise null
   * // result.details - string describing result, contains an error message if success is false
   */
  static async getSheetData(spreadsheetId, sheetName) {
    var requestParams = {
      'spreadsheetid': spreadsheetId,
      'sheetname': sheetName
    };
    
    var requestResult = await googleWebAppAPI.webAppGet(this.apiInfo(), 'getsheetdata', requestParams);
    return requestResult;
  }  
  
/**
 * spreadsheet data returned from successful API call
 * @typedef {Object} apiReturnData
 * @memberof simpleSheetsAPI
 * @property {string} docname - name of Google Sheet document
 * @property {string} docid - Google Sheet ID
 * @property {string[]} sheetnames - array of sheet name(s) in document, only one element for getSheetData calls
 * @property {Object} sheetdata - an object where each key represents a
 *                                sheet in the document.  Each key value is
 *                                a 2D array holding the sheet's data 
 * @example
 * {
 *  "docname":"test sheet",
 *  "docid":"1NVd3tAgHhPZ5PZFN2A2h26mPoS2fPDk_aMVEnzCkE74",
 *  "sheetnames":["basic"],
 *  "sheetdata":{"basic":[["this is A1","this is B1"],["this is A2","this is B2"]]}}
 * }
 */
}

//---------------------------------------------------------------
// Google Web API class 
//  - general purpose interface for App Script web apps
//---------------------------------------------------------------
/**
 * general purpose class for interacting with Google web app APIs
 */
class googleWebAppAPI {
  /**
   * send GET request to web app API (asynchronous)
   * @param {Object} apiInfo - {apikey: {string}, apibase: {string} - base URL for web app API}
   * @param {string} dataset - name of GET request
   * @param {Object} params - query parameters
   * @param {Object} [objNotice] - (optional) object with "reportError" callback for error reporting
   * @returns {Object} - {success: (boolean), data: (Object)}
   * @example
   * // use the simpleSheetAPI to request the data from the "basic" sheet in the sample Google document
   * var requestResult = await googleWebAppAPI.webAppGet(
   *   {
   *      apikey: 'simpleSheetAPI', 
   *      apibase: 'https://script.google.com/macros/s/AKfycbyuX2ejECoEhRBp4Dqa8ncr032sW00SLmQAh0DdaT0XEYJrZh4/exec'
   *   },
   *   'getsheetdata', 
   *    {
   *      spreadsheetid: '1NVd3tAgHhPZ5PZFN2A2h26mPoS2fPDk_aMVEnzCkE74',
   *      sheetname: 'basic'
   *    }
   *  );
   */  
  static async webAppGet(apiInfo, dataset, params, objNotice) {
    const METHOD_TITLE = 'webAppGet';
    
    this.__setAPIInfo__(apiInfo.apibase, apiInfo.apikey);
    var url = this.__buildApiUrl__(dataset, params);
    
    try {
      const resp = await fetch(url);
      const json = await resp.json();
      //console.log(json);

      if (!json.success) {
        var errmsg = '*ERROR: in ' + METHOD_TITLE + ', ' + json.details;
        if (objNotice != null) objNotice.reportError(METHOD_TITLE, {name: 'API failure', message: errmsg});
        console.log(errmsg);
      }
      return json;
      
    } catch (error) {
      if (objNotice != null) objNotice.reportError(METHOD_TITLE, error);
      console.log('**ERROR: in ' + METHOD_TITLE + ', ' + error);
    }
  }  
  
  /**
   * send POST request to web app API (asynchronous)
   * @param {Object} apiInfo - {apikey: {string}, apibase: {string} - base URL for web app API}
   * @param {string} dataset - name of PUT request
   * @param {Object} postData - data to be posted
   * @param {Object} [objNotice] - (optional) object with "reportError" callback for error reporting
   * @returns {Object} - {success: (boolean), data: (Object)}
   */    
  static async webAppPost(apiInfo, dataset, postData, objNotice) {
    const METHOD_TITLE = 'webAppPost';

    this.__setAPIInfo__(apiInfo.apibase, apiInfo.apikey);
    let url = this.__buildApiUrl__(dataset, {});
    
    try {
      const resp = await fetch(url, {method: 'post', contentType: 'application/x-www-form-urlencoded', body: JSON.stringify(postData)});  
      const json = await resp.json();
      //console.log(json);

      if (!json.success) {
        var errmsg = '**ERROR: in ' + METHOD_TITLE + ', ' + json.details;
        if (objNotice != null) objNotice.reportError(METHOD_TITLE, {name: 'API failure', message: errmsg});
        console.log(errmsg);
      }
      return json;

    } catch (error) {
      if (objNotice != null) objNotice.reportError(METHOD_TITLE, error);
      console.log('**ERROR: in ' + METHOD_TITLE + ', ' + error);
    }  
  }
  
  /**
   * store API info for use by other methods
   *   - must be called before using __buildApiURL__
   * @access private
   * @param {string} apiBase - base URL for web app API
   * @param {string} apiKey - key for web app API
   */
  static __setAPIInfo__(apiBase, apiKey) {
    this.apiBase = apiBase;
    this.apiKey = apiKey;   
    //console.log('setAPIInfo: \n   key=' + this.apiKey + '\n   base URL=' + this.apiBase);
  }
  
  /**
   * build URL for accessing web app API
   * @access private
   * @param {string} datasetname - name of GET/SET request
   * @param {string} params - query parameters
   */
  static __buildApiUrl__(datasetname, params) {
    let url = this.apiBase;
    url += '?key=' + this.apiKey;
    url += datasetname && datasetname !== null ? '&dataset=' + datasetname : '';

    for (var param in params) {
      url += '&' + param + '=' + params[param].replace(/ /g, '%20');
    }
    //console.log('buildApiUrl: url=' + url);
    
    return url;
  }  
}
