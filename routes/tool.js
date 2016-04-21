/**
 * Module dependencies.
 */
var config = require('../config'),
    mongoose = require('mongoose'),
    tool = require('./tool.js'),
    logger = require('../logger');


var defaultNodeId = config.env.queryDefaultParam.defaultNodeId,
    defaultPicType = config.env.queryDefaultParam.defaultPicType,
    defaultPicFtp = config.env.queryDefaultParam.defaultPicFtp,
    defaultCategoryParentId = config.env.queryDefaultParam.defaultCategoryParentId,
    limitCount = config.env.queryDefaultParam.limitCount,
    isMainCategoryId = config.env.queryDefaultParam.isMainCategoryId,
    categoryTypeResult = config.env.queryDefaultParam.categoryTypeResult;

var SERIES_FLAG = "2";

function ProcessClass() {

    // 处理次数
    this.inputTag = false;

    this.inputCharge = false;

    this.inputTotalCount = false;

    this.param = {};

    this.data = {};

    this.result = {};

    this.queryDocs = [];

    this.setData = function (data) {

        this.data = data;
    }

    this.getData = function () {

        return this.data;
    }

    this.setParam = function(setting) {
        this.param = setting;
    }

    this.getParam = function() {
        return this.param;
    }

    this.setDocs = function(setting) {
        this.queryDocs = setting;
    }

    this.getDocs = function() {
        return this.queryDocs;
    }

    this.setResult = function(setting) {
        this.result = setting;
    }

    this.getResult = function() {
        return this.result;
    }
}

var tool = {

    lzw_encode: function lzw_encode(s) {
        var dict = {};
        var data = (s + "").split("");
        var out = [];
        var currChar;
        var phrase = data[0];
        var code = 256;
        for (var i = 1; i < data.length; i++) {
            currChar = data[i];
            if (dict[phrase + currChar] != null) {
                phrase += currChar;
            }
            else {
                out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
                dict[phrase + currChar] = code;
                code++;
                phrase = currChar;
            }
        }
        out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
        for (var i = 0; i < out.length; i++) {
            out[i] = String.fromCharCode(out[i]);
        }
        return out.join("");
    },

    //解压
    lzw_decode: function (s) {
        var dict = {};
        var data = (s + "").split("");
        var currChar = data[0];
        var oldPhrase = currChar;
        var out = [currChar];
        var code = 256;
        var phrase;
        for (var i = 1; i < data.length; i++) {
            var currCode = data[i].charCodeAt(0);
            if (currCode < 256) {
                phrase = data[i];
            }
            else {
                phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
            }
            out.push(phrase);
            currChar = phrase.charAt(0);
            dict[code] = oldPhrase + currChar;
            code++;
            oldPhrase = phrase;
        }
        return out.join("");
    },

    setProcess: function (contentInfo) {
        var process = new ProcessClass();

        var dataList = [];
        var temptagIds = new Array();
        var tagIds = [];
        var tempChargeIds = new Array();
        var chargeIds = [];

        for (var k = 0; k < contentInfo.length; k++) {
            SERIES_FLAG = "2";
            for (var j = 0; j < contentInfo[k].distnodes.length; j++) {

                if (contentInfo[k].distnodes[j].id == defaultNodeId) {


                    var data = {

                        albumId: contentInfo[k].id,

                        albumName: contentInfo[k].vodName,

                        albumFocus: "",

                        albumPic: returnPicInfos(contentInfo[k].distnodes[j].pics, contentInfo[k].id),

                        score: "",

                        sceneIds: contentInfo[k].sceneIds,

                        issueTime: contentInfo[k].onlineTimes == undefined ? "" : contentInfo[k].onlineTimes.substring(0, 4),

                        playLength: contentInfo[k].vodTimes == undefined ? "" : contentInfo[k].vodTimes,

                        playCount: "",

                        tvsets: contentInfo[k].sceneIds.length + "",

                        source: "",

                        //  all content are not 3D now
                        albumType: "0",

                        albumDesc: contentInfo[k].vodIntro,

                        albumProducer: "",

                        flowerNumber: "",

                        streamVer: "",

                        actors: getListString(contentInfo[k].actor),

                        directors: getListString(contentInfo[k].director),

                        flower: "",

                        tvCount: contentInfo[k].sceneIds.length + "",

                        tvId: contentInfo[k].id,

                        vid: "",

                        tvCount: contentInfo[k].sceneIds.length + "",

                        tag: [],

                        pkg: [],

                        isRecord: "0",

                        videoPlayTime: "0",

                        seriesNum: "-1",

                        // vod类型：0，vod；1.子集；2.剧集
                        //vodType: contentInfo[k].sceneIds.length == 1?'0':SERIES_FLAG,
                        vodType: contentInfo[k].seriesFlag=='2'?getSeriesFlag(contentInfo[k].sceneIds.length):0,

                        //TODO
                        categoryId: getListString(contentInfo[k].bindCategorys),

                        categoryInfos: contentInfo[k].bindCategoryInfos,

                        needInfoPage : needInfoPage(contentInfo[k].bindCategorys),

                        categoryType : contentInfo[k].category

                    }

                    temptagIds.pushObj(contentInfo[k].tagIds);
                    tempChargeIds.pushObj(contentInfo[k].chargeIds);
                    dataList.push(data);

                    break;
                }
            }
        }

        // unique
        tagIds = temptagIds.unique();
        chargeIds = tempChargeIds.unique();

        var param = {};
        param.tagIds = tagIds;
        param.chargeIds = chargeIds;

        // preparing Data
        process.setParam(param);
        process.setData(dataList);
        process.setDocs(contentInfo);
        return process;
    },



    setProcessWithCategoryInfo: function (contentInfo) {
        var process = new ProcessClass();

        var dataList = [];
        var temptagIds = new Array();
        var tagIds = [];
        var tempChargeIds = new Array();
        var chargeIds = [];
        for (var k = 0; k < contentInfo.length; k++) {
            SERIES_FLAG = "2";
            for (var j = 0; j < contentInfo[k].distnodes.length; j++) {

                if (contentInfo[k].distnodes[j].id == defaultNodeId) {


                    var data = {

                        albumId: contentInfo[k].id,

                        albumName: contentInfo[k].vodName,

                        albumFocus: "",

                        albumPic: returnPicInfos(contentInfo[k].distnodes[j].pics, contentInfo[k].id),

                        score: "",

                        sceneIds: contentInfo[k].sceneIds,

                        issueTime: contentInfo[k].onlineTimes == undefined ? "" : contentInfo[k].onlineTimes.substring(0, 4),

                        playLength: contentInfo[k].vodTimes == undefined ? "" : contentInfo[k].vodTimes,

                        playCount: "",

                        tvsets: contentInfo[k].sceneIds.length + "",

                        source: "",

                        //  all content are not 3D now
                        albumType: "0",

                        albumDesc: contentInfo[k].vodIntro,

                        albumProducer: "",

                        flowerNumber: "",

                        streamVer: "",

                        actors: getListString(contentInfo[k].actor),

                        directors: getListString(contentInfo[k].director),

                        flower: "",

                        tvCount: contentInfo[k].sceneIds.length + "",

                        tvId: contentInfo[k].id,

                        vid: "",

                        tvCount: contentInfo[k].sceneIds.length + "",

                        tag: [],

                        pkg: [],

                        isRecord: "0",

                        videoPlayTime: "0",

                        seriesNum: "-1",

                        // vod类型：0，vod；1.子集；2.剧集
                        //vodType: contentInfo[k].sceneIds.length == 1?'0':SERIES_FLAG,
                        vodType: contentInfo[k].seriesFlag=='2'?getSeriesFlag(contentInfo[k].sceneIds.length):0,

                        searchName: contentInfo[k].vodSerName,

                        needInfoPage : needInfoPage(contentInfo[k].bindCategorys),

                        categoryType : contentInfo[k].category
                    }

//                    for (var z = 0; z < contentInfo[k].bindCategoryInfos.length; z++) {
//
//                        if (contentInfo[k].bindCategoryInfos[z].type == 1) {
//                            categoryInfos.pushObj(contentInfo[k].bindCategoryInfos[z]);
//                        }
//                    }

                    temptagIds.pushObj(contentInfo[k].tagIds);
                    tempChargeIds.pushObj(contentInfo[k].chargeIds);
                    dataList.push(data);

                    break;
                }
            }
        }

        // unique
        tagIds = temptagIds.unique();
        chargeIds = tempChargeIds.unique();

        var param = {};
        param.tagIds = tagIds;
        param.chargeIds = chargeIds;
        resultData = { contentInfos: dataList,

            categoryInfos: []
        };
        // preparing Data
        process.setParam(param);
        process.setData(resultData);
        process.setDocs(contentInfo);
        return process;
    },

    setProcessPlay: function (contentInfo, contentInfos, vodIdList) {
        var process = new ProcessClass();

        var dataList = [];
        var temptagIds = new Array();
        var tagIds = [];
        var tempChargeIds = new Array();
        var chargeIds = [];
        var dataOjbect = {};

        for (var k = 0; k < contentInfo.length; k++) {
            SERIES_FLAG = "2";
            for (var j = 0; j < contentInfo[k].distnodes.length; j++) {
                // logger.system.debug('contentInfo.length issssss>>' + contentInfo[k].distnodes[1].id);
                if (contentInfo[k].distnodes[j].id == defaultNodeId) {


                    var data = {

                        albumId: contentInfo[k].id,

                        albumName: contentInfo[k].vodName,

                        albumFocus: "",

                        albumPic: returnPicInfos(contentInfo[k].distnodes[j].pics, contentInfo[k].id),

                        score: "",

                        sceneIds: contentInfo[k].sceneIds,

                        issueTime: contentInfo[k].onlineTimes == undefined ? "" : contentInfo[k].onlineTimes.substring(0, 4),

                        playLength: contentInfo[k].vodTimes == undefined ? "" : contentInfo[k].vodTimes,

                        playCount: "",

                        tvsets: contentInfo[k].sceneIds.length + "",

                        source: "",

                        //  all content are not 3D now
                        albumType: "0",

                        albumDesc: contentInfo[k].vodIntro,

                        albumProducer: "",

                        flowerNumber: "",

                        streamVer: "",

                        actors: getListString(contentInfo[k].actor),

                        directors: getListString(contentInfo[k].director),

                        category: "",

                        categoryId: getListString(contentInfo[k].bindCategorys),

                        needInfoPage : needInfoPage(contentInfo[k].bindCategorys),

                        categoryType : contentInfo[k].category,

                        flower: "",

                        // vod类型：0，vod；1.子集；2.剧集
                        //vodType: contentInfo[k].sceneIds.length == 1?'0':SERIES_FLAG,
                        vodType: contentInfo[k].seriesFlag=='2'?getSeriesFlag(contentInfo[k].sceneIds.length):0,

                        tvCount: contentInfo[k].sceneIds.length + "",

                        tvId: contentInfo[k].id,

                        vid: "",

                        tvCount: contentInfo[k].sceneIds.length + "",

                        playOrder: contentInfos[contentInfo[k].id].episodeIndex,

                        videoPlayTime: contentInfos[contentInfo[k].id].videoPlayTime,

                        terminalId: contentInfos[contentInfo[k].id].terminalId,

                        addtime: contentInfos[contentInfo[k].id].updateTime,

                        episodeIndex: contentInfos[contentInfo[k].id].episodeIndex,

                        episodeOrder: contentInfos[contentInfo[k].id].episodeOrder,

                        tag: [],

                        pkg: []
                    }

                    break;
                }
            }

            temptagIds.pushObj(contentInfo[k].tagIds);
            tempChargeIds.pushObj(contentInfo[k].chargeIds);
            dataOjbect[contentInfo[k].id] = data;
        }

        for(var i=0;i<vodIdList.length;i++) {

            if(dataOjbect[vodIdList[i]]!=null) {
                dataList.push(dataOjbect[vodIdList[i]]);
            }
        }

        // unique
        tagIds = temptagIds.unique();
        chargeIds = tempChargeIds.unique();

        var param = {};
        param.tagIds = tagIds;
        param.chargeIds = chargeIds;

        // preparing Data
        process.setParam(param);
        process.setData(dataList);
        process.setDocs(contentInfo);
        //process.setDocs(contentInfos);
        return process;
    },

    setProcessList: function (contentInfo, vodIdList) {
        var process = new ProcessClass();

        var dataList = [];
        var temptagIds = new Array();
        var tagIds = [];
        var tempChargeIds = new Array();
        var chargeIds = [];
        var dataOjbect = {};
        vodIdList = vodIdList.unique();
        for (var k = 0; k < contentInfo.length; k++) {
            SERIES_FLAG = "2";
            for (var j = 0; j < contentInfo[k].distnodes.length; j++) {

                if (contentInfo[k].distnodes[j].id == defaultNodeId) {


                    var data = {

                        albumId: contentInfo[k].id,

                        albumName: contentInfo[k].vodName,

                        albumFocus: "",

                        albumPic: returnPicInfos(contentInfo[k].distnodes[j].pics, contentInfo[k].id),

                        score: "",

                        sceneIds: contentInfo[k].sceneIds,

                        issueTime: contentInfo[k].onlineTimes == undefined ? "" : contentInfo[k].onlineTimes.substring(0, 4),

                        playLength: contentInfo[k].vodTimes == undefined ? "" : contentInfo[k].vodTimes,

                        playCount: "",

                        tvsets: contentInfo[k].sceneIds.length + "",

                        source: "",

                        //  all content are not 3D now
                        albumType: "0",

                        albumDesc: contentInfo[k].vodIntro,

                        albumProducer: "",

                        flowerNumber: "",

                        streamVer: "",

                        actors: getListString(contentInfo[k].actor),

                        directors: getListString(contentInfo[k].director),

                        flower: "",

                        tvCount: contentInfo[k].sceneIds.length + "",

                        tvId: contentInfo[k].id,

                        vid: "",

                        tvCount: contentInfo[k].sceneIds.length + "",

                        tag: [],

                        pkg: [],

                        isRecord: "0",

                        videoPlayTime: "0",

                        seriesNum: "-1",

                        // vod类型：0，vod；1.子集；2.剧集
                        //vodType: contentInfo[k].sceneIds.length == 1?'0':SERIES_FLAG
                        vodType: contentInfo[k].seriesFlag=='2'?getSeriesFlag(contentInfo[k].sceneIds.length):0,

                        needInfoPage : needInfoPage(contentInfo[k].bindCategorys),

                        categoryType : contentInfo[k].category

                        //TODO
                        //categoryId: getListString(contentInfo[k].bindCategorys),

                        //categoryInfos: contentInfo[k].bindCategoryInfos

                    }

                    temptagIds.pushObj(contentInfo[k].tagIds);
                    tempChargeIds.pushObj(contentInfo[k].chargeIds);
                    dataOjbect[contentInfo[k].id] = data;
                    //dataList.push(data);

                    break;
                }
            }
        }

        for(var i=0;i<vodIdList.length;i++) {

            if(dataOjbect[vodIdList[i]]!=null) {
                dataList.push(dataOjbect[vodIdList[i]]);
            }
        }
        // unique
        tagIds = temptagIds.unique();
        chargeIds = tempChargeIds.unique();

        var param = {};
        param.tagIds = tagIds;
        param.chargeIds = chargeIds;

        // preparing Data
        process.setParam(param);
        process.setData(dataList);
        process.setDocs(contentInfo);
        return process;
    },


    setProcessListWithCategory: function (contentInfo, vodIdList) {
        var process = new ProcessClass();

        var dataList = [];
        var temptagIds = new Array();
        var tagIds = [];
        var tempChargeIds = new Array();
        var chargeIds = [];
        var dataOjbect = {};

        for (var k = 0; k < contentInfo.length; k++) {
            SERIES_FLAG = "2";
            for (var j = 0; j < contentInfo[k].distnodes.length; j++) {

                if (contentInfo[k].distnodes[j].id == defaultNodeId) {


                    var data = {

                        albumId: contentInfo[k].id,

                        albumName: contentInfo[k].vodName,

                        albumFocus: "",

                        albumPic: returnPicInfos(contentInfo[k].distnodes[j].pics, contentInfo[k].id),

                        score: "",

                        sceneIds: contentInfo[k].sceneIds,

                        issueTime: contentInfo[k].onlineTimes == undefined ? "" : contentInfo[k].onlineTimes.substring(0, 4),

                        playLength: contentInfo[k].vodTimes == undefined ? "" : contentInfo[k].vodTimes,

                        playCount: "",

                        tvsets: contentInfo[k].sceneIds.length + "",

                        source: "",

                        //  all content are not 3D now
                        albumType: "0",

                        albumDesc: contentInfo[k].vodIntro,

                        albumProducer: "",

                        flowerNumber: "",

                        streamVer: "",

                        actors: getListString(contentInfo[k].actor),

                        directors: getListString(contentInfo[k].director),

                        flower: "",

                        tvCount: contentInfo[k].sceneIds.length + "",

                        tvId: contentInfo[k].id,

                        vid: "",

                        tvCount: contentInfo[k].sceneIds.length + "",

                        tag: [],

                        pkg: [],

                        isRecord: "0",

                        videoPlayTime: "0",

                        seriesNum: "-1",

                        // vod类型：0，vod；1.子集；2.剧集
                        //vodType: contentInfo[k].sceneIds.length == 1?'0':SERIES_FLAG
                        vodType: contentInfo[k].seriesFlag=='2'?getSeriesFlag(contentInfo[k].sceneIds.length):0,

                        needInfoPage : needInfoPage(contentInfo[k].bindCategorys),

                        categoryType : contentInfo[k].category

                        //TODO
                        //categoryId: getListString(contentInfo[k].bindCategorys),

                        //categoryInfos: contentInfo[k].bindCategoryInfos

                    }

                    temptagIds.pushObj(contentInfo[k].tagIds);
                    tempChargeIds.pushObj(contentInfo[k].chargeIds);
                    dataOjbect[contentInfo[k].id] = data;
                    //dataList.push(data);

                    break;
                }
            }
        }

        for(var i=0;i<vodIdList.length;i++) {

            if(dataOjbect[vodIdList[i]]!=null) {
                dataList.push(dataOjbect[vodIdList[i]]);
            }
        }
        // unique
        tagIds = temptagIds.unique();
        chargeIds = tempChargeIds.unique();

        var param = {};
        param.tagIds = tagIds;
        param.chargeIds = chargeIds;

        // preparing Data
        process.setParam(param);
        process.setData(dataList);
        process.setDocs(contentInfo);
        return process;
    },

    setProcessList_1param_1: function (contentInfo) {
        var process = new ProcessClass();

        var dataList = [];
        var temptagIds = new Array();
        var tagIds = [];
        var tempChargeIds = new Array();
        var chargeIds = [];
        var dataOjbect = {};
        for (var k = 0; k < contentInfo.length; k++) {
            for (var j = 0; j < contentInfo[k]._vodInfo.distnodes.length; j++) {

                if (contentInfo[k]._vodInfo.distnodes[j].id == defaultNodeId) {


                    var data = {

                        albumId: contentInfo[k]._vodInfo.id,

                        albumName: contentInfo[k]._vodInfo.vodName,

                        albumFocus: "",

                        albumPic: returnPicInfos(contentInfo[k]._vodInfo.distnodes[j].pics, contentInfo[k].id),

                        score: "",

                        sceneIds: contentInfo[k]._vodInfo.sceneIds,

                        issueTime: contentInfo[k]._vodInfo.onlineTimes == undefined ? "" : contentInfo[k]._vodInfo.onlineTimes.substring(0, 4),

                        playLength: contentInfo[k]._vodInfo.vodTimes == undefined ? "" : contentInfo[k]._vodInfo.vodTimes,

                        playCount: "",

                        tvsets: contentInfo[k]._vodInfo.sceneIds.length + "",

                        source: "",

                        //  all content are not 3D now
                        albumType: "0",

                        albumDesc: contentInfo[k]._vodInfo.vodIntro,

                        albumProducer: "",

                        flowerNumber: "",

                        streamVer: "",

                        actors: getListString(contentInfo[k]._vodInfo.actor),

                        directors: getListString(contentInfo[k]._vodInfo.director),

                        flower: "",

                        tvCount: contentInfo[k]._vodInfo.sceneIds.length + "",

                        tvId: contentInfo[k].id,

                        vid: "",

                        tvCount: contentInfo[k]._vodInfo.sceneIds.length + "",

                        tag: [],

                        pkg: [],

                        isRecord: "0",

                        videoPlayTime: "0",

                        seriesNum: "-1",

                        // vod类型：0，vod；1.子集；2.剧集
                        //vodType: contentInfo[k].sceneIds.length == 1?'0':SERIES_FLAG
                        vodType: contentInfo[k].seriesFlag=='2'?getSeriesFlag(contentInfo[k].sceneIds.length):0,

                        needInfoPage : needInfoPage(contentInfo[k]._vodInfo.bindCategorys),

                        categoryType : contentInfo[k]._vodInfo.category

                        //TODO
                        //categoryId: getListString(contentInfo[k].bindCategorys),

                        //categoryInfos: contentInfo[k].bindCategoryInfos

                    }

                    temptagIds.pushObj(contentInfo[k]._vodInfo.tagIds);
                    tempChargeIds.pushObj(contentInfo[k]._vodInfo.chargeIds);
                    dataList.push(data);

                    break;
                }
            }
        }

        // unique
        tagIds = temptagIds.unique();
        chargeIds = tempChargeIds.unique();

        var param = {};
        param.tagIds = tagIds;
        param.chargeIds = chargeIds;

        // preparing Data
        process.setParam(param);
        process.setData(dataList);
        process.setDocs(contentInfo);
        return process;
    }
}

function returnVodType(pics) {

    var rePics = [];
    for(var i = 0;i<pics.length;i++) {

        if(pics[i].type=="32") {

            var SERIES_FLAG = "0";

            break;
        }
    }

    return SERIES_FLAG;
}

function returnPicInfos(pics, vodId) {

    var rePics = [];
    for(var i = 0;i<pics.length;i++) {

        if(pics[i].type=="32") {

            SERIES_FLAG = "0";
        }

        var rePic = {

            id : pics[i].id,

            type : pics[i].type,

            url : defaultPicFtp + pics[i].url + "?" + vodId
            //url : defaultPicFtp + 'ott/poster/' +pics[i].url

        }

        rePics.push(rePic);
    }

    return rePics;
}

function getListString(obj) {

    var result = "";
    for(var i = 0;i<obj.length;i++) {
        result = result + obj[i] + ",";
    }

    return result.substring(0, result.length-1);
}

function needInfoPage(obj) {
    var dataObj={};
    for(var i = 0;i<isMainCategoryId.length;i++){
        dataObj[isMainCategoryId[i]] = 1;
    }

    for(var j=0;j<obj.length;j++) {
        if(dataObj[obj[j]]==1) {
            return 1;
        }
    }
    return 0;
}

function getSeriesFlag(arrayLength) {
	if(arrayLength==0) {
		return 0;
	} else {
		return 2;
	}
}


Array.prototype.unique = function () {
    var res = [], hash = {};
    for (var i = 0, elem; (elem = this[i]) != null; i++) {
        if (!hash[elem]) {
            res.push(elem);
            hash[elem] = true;
        }
    }
    return res;
}

Array.prototype.pushObj = function (obj) {

    if (obj instanceof Array) {

        for (var i = 0; i < obj.length; i++) {

            this.push(obj[i]);
        }

    } else {

        this.push(obj);
    }
}

exports.lzw_encode = tool.lzw_encode;
exports.lzw_decode = tool.lzw_decode;
exports.setProcessWithCategoryInfo = tool.setProcessWithCategoryInfo;
exports.setProcess = tool.setProcess;
exports.setProcessPlay = tool.setProcessPlay;
exports.setProcessList = tool.setProcessList;
exports.setProcessList_1param_1 = tool.setProcessList_1param_1;