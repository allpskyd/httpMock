var pathToRegexp = require('path-to-regexp')

var Tool = {
	
	compObj : function(obj1,obj2){  
	
	console.log('obj1:', typeof obj1);
	console.log('obj2:', typeof obj2);
		if((obj1&&typeof obj1==="object")&&((obj2&&typeof obj2==="object"))){   
		    var count1=Tool.propertyLength(obj1);
		    var count2=Tool.propertyLength(obj2);
			if(count1==count2){ 
				for(var ob in obj1){
					if(obj1.hasOwnProperty(ob)&&obj2.hasOwnProperty(ob)){     

						if(obj1[ob].constructor==Array&&obj2[ob].constructor==Array){ 
							if(!Tool.compArray(obj1[ob],obj2[ob])){
								return false;
							};
						} else if(typeof obj1[ob]==="string"&&typeof obj2[ob]==="string"){  
							if(obj1[ob]!==obj2[ob]){
								return false;
							}
						} else if(typeof obj1[ob]==="object"&&typeof obj2[ob]==="object") {  
							if(!Tool.compObj(obj1[ob],obj2[ob])){  
								return false;
							};
						} else {
							return false;
						}
					} else{
						return false;
					}
				}
			}else{
				return false;
			} 
		}

		return true;
   },
   propertyLength : function(obj) {  
    var count=0;
    if(obj&&typeof obj==="object") {
     for(var ooo in obj) {
       if(obj.hasOwnProperty(ooo)) {
         count++;
       }
     }
     return count;
    }else {
     throw new Error("argunment can not be null;");
    }
   },
   compArray : function(array1,array2){ 
   
  	if((array1&&typeof array1 ==="object"&&array1.constructor===Array)&&(array2&&typeof array2 ==="object"&&array2.constructor===Array)) {
        
  	  if(array1.length==array2.length){
         
  	   for(var i=0;i<array1.length;i++){
          
  		var cp=Tool.compObj(array1[i],array2[i]);
          if(!cp){
           return false;
          }
  
         }
  
        } else{
  		  
         return false;
        }
     }else{
      throw new Error("argunment is  error ;");
     }
   
    return true;
  }
};

var mockUtil = {
	
	checkUrl : function(url,method,mockinfo) {
		
		var keys = []
		var matchedJson = [];
		
		for (var i = 0; i < mockinfo.length; i++) {
				
			var re = pathToRegexp(mockinfo[i].reqUrl, keys)

			if (re.exec(url) && (mockinfo[i].method == "*" || mockinfo[i].method == method)) {
	
				matchedJson.push(mockinfo[i]);
			}
		}
	
		return matchedJson;
	},
	
	checkParams : function(url,info,mockinfo) {
		
		var keys = []
		var matchedJson = undefined;
		
		for (var i = 0; i < mockinfo.length; i++) {
			
			var tokens = pathToRegexp.parse(mockinfo[i].reqUrl);

			if (tokens[1]) {
				
				matchedJson = mockinfo[i];
				break;
			} else {
				if (Tool.compObj(mockinfo[i].resParams, info)) {
					matchedJson = mockinfo[i];
					break;
				}
			}
			
		}

		return matchedJson;
	}
}

exports.checkUrl = mockUtil.checkUrl;
exports.checkParams = mockUtil.checkParams;