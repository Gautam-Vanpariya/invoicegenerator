
module.exports = {
  numberFormat: (n) => {
    return parseFloat(n.toFixed(2));
  },
  convertTofloat:  (n) => {
		// eslint-disable-next-line no-useless-escape
    var num = parseFloat(n.toString().replace(/,/g, ''));
		return parseFloat(num.toString().replace(/[^\d\.]/, ''));
	},
  convertToFloatWithDecimal:  (n) => {
    // eslint-disable-next-line no-useless-escape
    return Math.round(parseFloat(n.replace(/[^\d\.]/, '')) * 100) / 100;
  },
  convertToObject: (json) => {
    // convert into proper object
    return JSON.parse(JSON.stringify(json));
  },
  capitalize: (string) => {
    // make capitalize string
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  },
  removeFields: (obj, keys, defaultFields = true) => {
    // Remove fields of mongodb
    const basicFields = ["createdAt", "updatedAt", "isDeleted", "deletedBy", "deletedAt", "__v"];
    keys = typeof keys === "string" ? [keys] : keys || [];
    if (defaultFields) keys = keys.concat(basicFields);
    keys.forEach((key) => delete obj[key]);
    return obj;
  },
  otpGenerator: () => {
    // Generate 6 digit otp
    let randomNumber = Math.floor(100000 + Math.random() * 900000);
    if (randomNumber.toString().length < 6) {
      randomNumber = parseInt(randomNumber.toString() + 0);
    }
    return randomNumber;
  },
  generateRandomString: (params) => {
    // Generate unique string
    let result = "";
    let characters = "";
    const length = params.length || 6;

    if (params.isCapitalAlpha) {
      characters += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }
    if (params.isSmallAlpha) {
      characters += "abcdefghijklmnopqrstuvwxyz";
    }
    if (params.isNumeric) {
      characters += "0123456789";
    }
    if (characters === "") {
      characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    }
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },
  randomNumberFromInterval: (min, max) => {
    // Generate random number btw to range.
    return Math.floor(Math.random() * (max - min + 1) + min);
  },
  hasDuplicates: (array) => {
    // Check if array have duplicated value or not
    return (new Set(array)).size !== array.length;
  },
  delay: async (ms) => {
    // make manual delay with milisecond
    return new Promise(resolve => setTimeout(() => resolve(), ms));
  },
  isEmpty: (obj) => {
    // check object is empty
    return Object.keys(obj).length === 0;
  },
  deepEqualObject: (object1, object2) => {
    // check to object are equal or not
    const isObject = (object) => {
      return object != null && typeof object === "object";
    };
    const deepEqual = (obj1, obj2) => {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);
      if (keys1.length !== keys2.length) return false;
      for (const key of keys1) {
        const val1 = obj1[key];
        const val2 = obj2[key];
        const areObjects = isObject(val1) && isObject(val2);
        if ((areObjects && !deepEqual(val1, val2)) || (!areObjects && val1 !== val2)) {
          return false;
        }
      }
      return true;
    };
    return deepEqual(object1, object2);
  },
  splitDataByChunks: (data, divider) => {
    // Splits array by given divider and return new array of chunks
    // e.g. [ [1, 2], [3, 4], ... ]
    return new Promise(resolve => {
      const result = [];
      while (data.length) {
        result.push(data.splice(0, divider));
      }
      resolve(result);
    });
  },
  arrayCompare: (_arr1, _arr2) => {
     // comapre two array
    if (!Array.isArray(_arr1) || !Array.isArray(_arr2) || _arr1.length !== _arr2.length) {
      return false;
    }
    const arr1 = _arr1.concat().sort();
    const arr2 = _arr2.concat().sort();

    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
    return true;
  },
  arrayRemoveDuplicates: (_arr1) => {
     // remove duplicate from array
    const a1 = _arr1.concat().sort();
    for (let i = 0; i < a1.length; i++) {
      const src = a1[i];
      // eslint-disable-next-line no-var
      for (var j = i + 1; j < a1.length && a1[j] === src; j++) {
        // no-empty
      }
      if (j - 1 > i) a1.splice(i + 1, j - i - 1);
    }
    return a1;
  },
  arraySubtract: (_arr1, _arr2) => {
    // subtract btw two array
    const rd = (arr) => {
      const a1 = arr.concat().sort();
      for (let i = 0; i < a1.length; i++) {
        const src = a1[i];
        // eslint-disable-next-line no-var
        for (var j = i + 1; j < a1.length && a1[j] === src; j++) {
          // no-empty
        }
        if (j - 1 > i) a1.splice(i + 1, j - i - 1);
      }
      return a1;
    };
    const a1 = rd(_arr1);
    const a2 = rd(_arr2);
    const len2 = a2.length;
    for (let i = 0; i < a1.length; i++) {
      // eslint-disable-next-line no-var
      var src = a1[i];
      let found = false;
      // eslint-disable-next-line no-undef
      for (let j = 0; (j < len2) && (src >= (src2 = a2[j])); j++) if (src2 === src) { found = true; break; }
      if (found) a1.splice(i--, 1);
    }
    return a1;
  },
  isValidDate:(value)=>{
    if(typeof value !== 'string') return false;
    let reg = /^\d{1,2}-\d{1,2}-\d{4}$/;
    if(value.includes("/")) reg = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if(!reg.test(value)) return false;
    // Parse the date parts to integers
    var parts = value.includes("/")?value.split("/"):value.split("-");
    var day = parseInt(parts[1], 10);
    var month = parseInt(parts[0], 10);
    var year = parseInt(parts[2], 10);
    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12) return false;
    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) monthLength[1] = 29;
    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
  },
  checkIfValidIndianMobileNo:(value)=>{
    const regexExp = /^[6-9]\d{9}$/gi;
    if(value) return regexExp.test(value);
    return false;
  },
  roundoff : (val) =>{
    return (+val).toFixed(2);
  },
  numberWithCommas : (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },
  convertToFloatWithDecimal:  (num) => {
    let number = Math.round( parseFloat(num.replace(/[^\d\\.]/, '')) * 100) / 100;
    return number;
  },
};

