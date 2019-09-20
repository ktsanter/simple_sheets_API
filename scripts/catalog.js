"use strict";

const catalog = function() {
  var fullCatalogData = null;
  var spreadsheetId = '1NFuOdmj7njWshl28rvKHrmVt4HyQ8o2gmcAI6MDqIPk';
  var objCatalog = {};

  async function init() {
    var loadSuccess = await loadCatalogData();
    if (!loadSuccess) return;
    if (!makeCatalogObjects()) return;
    showCatalog();
  }

  async function loadCatalogData() {
    var success = false;
    setStatus('loading...');
    
    var result = await simpleSheetsAPI.getAllSheetData(spreadsheetId);
    if (!result.success) {
      setStatus('load failed: ' + result.details);
    } else {
      fullCatalogData = result.data;
      setStatus('');
      success = true;
    }
    
    return success;
  } 

  function makeCatalogObjects() {
    var success = true;
    var sheetData = fullCatalogData.sheetdata;
    
    objCatalog.indices = makeIndices(fullCatalogData.sheetnames, fullCatalogData.sheetdata);
    
    var arrItem = [];
    var itemData = sheetData.items.slice(1);
    var itemIndicies = objCatalog.indices.items;
    for (var i = 0; i < itemData.length; i++) {
      var itemDataRow = itemData[i];
      var itemKey = itemDataRow[itemIndicies.itemkey]
      var item = {
        'key': itemKey,
        'name': itemDataRow[itemIndicies.itemname],
        'categorykey': itemDataRow[itemIndicies.categorykey],
        'categoryname': getCategoryName(itemDataRow[itemIndicies.categorykey]),
        'options': getOptionsList(itemKey)
      }
      
      arrItem.push(item);
    }
    objCatalog['items'] = arrItem;
      
    return success;
  }
  
  function makeIndices(sheetNames, sheetData) {
    var indices = {};
    
    for (var i = 0; i < sheetNames.length; i++) {
      var sheetName = sheetNames[i];
      var headerRow = sheetData[sheetName][0];
      indices[sheetName] = {};
      for (var j = 0; j < headerRow.length; j++) {
        var indexName = headerRow[j];
        indices[sheetName][indexName] = j;
      }
    }
    
    return indices;
  }
  
  function getCategoryName(key) {
    var categoryData = fullCatalogData.sheetdata.categories.slice(1);
    var categoryIndices = objCatalog.indices.categories;
    var categoryKeyIndex = categoryIndices.categorykey;
    var categoryNameIndex = categoryIndices.categoryname;
    
    var categoryName = null;
    for (var i = 0; i < categoryData.length && !categoryName; i++) {
      if (categoryData[i][categoryKeyIndex] == key) {
        categoryName = categoryData[i][categoryNameIndex];
      }
    }
    
    return categoryName;
  }

  function getOptionName(key) {
    var optionData = fullCatalogData.sheetdata.options.slice(1);
    var optionIndices = objCatalog.indices.options;
    var optionKeyIndex = optionIndices.optionkey;
    var optionNameIndex = optionIndices.optionname;
    
    var optionName = null;
    for (var i = 0; i < optionData.length && !optionName; i++) {
      if (optionData[i][optionKeyIndex] == key) {
        optionName = optionData[i][optionNameIndex];
      }
    }
    
    return optionName;
  }
  
  function getOptionsList(itemKey) {
    var itemOptionData = fullCatalogData.sheetdata.itemoptions;
    var itemOptionIndices = objCatalog.indices.itemoptions;
    var itemKeyIndex = itemOptionIndices.itemkey;
    var optionKeyIndex = itemOptionIndices.optionkey;
    
    var arrOption = [];
    for (var i = 0; i < itemOptionData.length; i++) {
      if (itemOptionData[i][itemKeyIndex] == itemKey) {
        var optionKey = parseInt(itemOptionData[i][optionKeyIndex]);
        arrOption.push({
          'itemkey': itemKey,
          'optionKey': optionKey,
          'optionname': getOptionName(optionKey)
        });
      }
    }
    
    return arrOption;
  }
  
  function showCatalog() {
    var arrHeaders = ['item', 'category', 'options'];
    var arrContents = [];
    
    var items = objCatalog.items;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var itemName = item.name;
      var categoryName = item.categoryname;
      
      var strOptions = '';
      var options = item.options;
      for (var j = 0; j < options.length; j++) {
        strOptions += options[j].optionname;
        if (j < options.length - 1) strOptions += ', ';
      }
      arrContents.push([itemName, categoryName, strOptions]);
    }
    
    var elemResults = document.getElementById('results');
    elemResults.appendChild(createTable('resultTable', null, arrHeaders, arrContents));
  }
  
  //---- event handlers ---------------------------------------------


  //---- utility functions ------------------------------------------
  function setStatus(msg) {
    var elem = document.getElementById('status');
    
    elem.innerHTML = msg;

    if (msg == '' || msg == null) {
      elem.style.display = 'none';
    } else {
      elem.style.display = 'inline-block';
    }
  }

  function createElement(elemType, id, classList) {
    var elem = document.createElement(elemType);
    if (id && id != '') elem.id = id;
    addClassList(elem, classList);
    return elem;
  }

  function addClassList(elem, classList) {
    if (classList && classList != '') {
      var splitClass = classList.split(' ');
      for (var i = 0; i < splitClass.length; i++) {
        elem.classList.add(splitClass[i].trim());
      }
    }
  }  

  function createSelect(id, classList, changehandler, values) {
    var elem = createElement('select', id, classList);
    if (changehandler) elem.addEventListener('change', changehandler, false);
    
    if (values) {
      for (var i = 0; i < values.length; i++) {
        var opt = createElement('option', null, null);
        if (values[i].hasOwnProperty('id')) opt.id = values[i].id;
        if (values[i].hasOwnProperty('value')) opt.value = values[i].value;
        opt.text = values[i].textval;
        elem.appendChild(opt);
      }
    }      
    
    return elem;
  }

  function createDiv(id, classList, html) {
    var elem = createElement('div', id, classList);
    if (html != null) elem.innerHTML = html;
    
    return elem;
  }
    
  function createTable(id, classList, headers, contents, captionLabel) {
    var table = createElement('table', id, classList);
    
    if (captionLabel) {
      var caption = table.createCaption();
      caption.innerHTML = captionLabel;
    }
    
    if (headers) {
      var thead = createElement('thead', null, null);
      table.appendChild(thead);
      var tr = createElement('tr', null, null);
      thead.appendChild(tr);
      for (var i = 0; i < headers.length; i++) {
        var th = createElement('th', null, null);
        th.innerHTML = headers[i];
        tr.appendChild(th);
      }
    }
    
    if (contents) {
      var tbody = createElement('tbody', null, null);
      table.appendChild(tbody);
      for (var i = 0; i < contents.length; i++) {
        var tr = createElement('tr', null, null);
        tbody.appendChild(tr);
        for (var j = 0; j < contents[i].length; j++) {
          var td = createElement('td', null, null);
          td.innerHTML = contents[i][j];
          tr.appendChild(td);
        }
      }
    }
    
    return table;
  }

  function createTableRow(id, classList, attachTo) {
    var elem = createElement('tr', id, classList);
    
    if (attachTo) attachTo.appendChild(elem);
    
    return elem;
  }

  function createTableCell(id, classList, contents, isHeader, attachTo) {
    var elem;
    if (isHeader) {
      elem = createElement('th', id, classList);
    } else {
      elem = createElement('td', id, classList);
    }
    
    elem.innerHTML = contents;
    
    if (attachTo) attachTo.appendChild(elem);
    
    return elem;
  } 

  return {
    init: init
  };  
}();