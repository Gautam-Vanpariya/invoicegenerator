

/**
 * Get fetchDatatableRecords
 * @param {*} dtReq
 * @param {*} ModelObj
 * @param {*} fieldNames
 * @param {*} conditionQuery
 * @param {*} projectionQuery
 * @param {*} sortingQuery
 * @param {*} populateQuery
 * @param {*} callback
*/

exports.fetchDatatableRecords = async (dtReq, ModelObj, fieldNames, conditionQuery, projectionQuery, sortingQuery, populateQuery, callback) => {
    var searchQuery = conditionQuery;
    var drawRecord = dtReq.draw;
    var skipRecord = dtReq.start;
    var limitRecord = dtReq.length;

    try {
        if (dtReq.search && dtReq.search.value != '' && fieldNames.length > 0) {
            var regex = new RegExp(dtReq.search.value, "i");
            var orQueryList = [];
            for (var i = 0; i < fieldNames.length; i++) {
                var searchJson = {};
                searchJson[fieldNames[i]] = regex;
                orQueryList.push(searchJson);
            }
            searchQuery.$or = orQueryList;
        }

        var responseJson = {
            "draw": drawRecord,
            "recordsFiltered": 0,
            "recordsTotal": 0,
            "data": []
        };

        const totalRecordsCount = await ModelObj.countDocuments(conditionQuery);
        responseJson.recordsTotal = totalRecordsCount;

        if (dtReq.search && dtReq.search.value != '' && populateQuery && populateQuery.length > 0) {
            recordsData = await ModelObj.find(searchQuery).populate(populateQuery);
            const recordsFilteredCount = (recordsData && recordsData.length) || 0;
            responseJson.recordsFiltered = recordsFilteredCount;
        } else {
            const recordsFilteredCount = await ModelObj.countDocuments(searchQuery);
            responseJson.recordsFiltered = recordsFilteredCount;
        }

        var recordsData;
        if (populateQuery && populateQuery.length > 0) {
            recordsData = await ModelObj.find(searchQuery, projectionQuery, { skip: Number(skipRecord), limit: Number(limitRecord), sort: sortingQuery }).populate(populateQuery).lean();
        } else {
            recordsData = await ModelObj.find(searchQuery, projectionQuery, { skip: Number(skipRecord), limit: Number(limitRecord), sort: sortingQuery }).lean();
        }

        if (recordsData) {
            responseJson.data = recordsData;
            callback(null, responseJson);
        } else {
            let err = new Error(`Error: No record found with query: ${searchQuery}`);
            callback(err, null);
        }
    } catch (err) {
        return callback(err, null);
    }

};


/**
 * Get fetchAggregateDatatableRecords
 * @param {*} dtReq
 * @param {*} ModelObj
 * @param {*} searchFields
 * @param {*} conditionQuery
 * @param {*} sortingQuery
 * @param {*} callback
*/


exports.fetchAggregateDatatableRecords = async (dtReq, ModelObj, searchFields, aggregatedQuery, sortingQuery, callback) => {
    let countObj = { $group: { _id: null, count: { $sum: 1 } } };
    var conditionQuery = [...aggregatedQuery, countObj];
    var aggregateQuery = [...aggregatedQuery];
    var drawRecord = dtReq.draw;
    var skipRecord = dtReq.start;
    var limitRecord = dtReq.length;
    var sortingQuery = sortingQuery;

    // Aggregate search regex
    try {
        if (dtReq.search && dtReq.search.value && searchFields.length > 0) {
            var regex = new RegExp(dtReq.search.value, "i");
            var orQueryList = [];
            for (var i = 0; i < searchFields.length; i++) {
                var searchJson = {};
                searchJson[searchFields[i]] = regex;
                orQueryList.push(searchJson);
            }
            aggregateQuery.push({
                $match: { $or: orQueryList }
            });
        }

        var responseJson = {
            "draw": drawRecord,
            "recordsFiltered": 0,
            "recordsTotal": 0,
            "data": []
        };

        // for aggregate count [Non - deleted reocrd]
        const totalRecordsCount = await ModelObj.aggregate(conditionQuery);

        responseJson.recordsTotal = (totalRecordsCount.length > 0 && totalRecordsCount[0].count) || 0;

        // for aggregate count [Filter record]
        aggregateQuery.push({
            $group: { _id: null, count: { $sum: 1 } }
        });

        const recordsFilteredCount = await ModelObj.aggregate(aggregateQuery);

        responseJson.recordsFiltered = (recordsFilteredCount.length > 0 && recordsFilteredCount[0].count) || 0;
        //now remove count stage
        aggregateQuery.pop();

        // For Paginate and Sort
        if (skipRecord && !limitRecord) {
            aggregateQuery.push(
                {
                    $sort: sortingQuery
                },
                {
                    $skip: Number(skipRecord)
                });
        } else if (!skipRecord && limitRecord) {
            aggregateQuery.push(
                {
                    $sort: sortingQuery
                },
                {
                    $limit: Number(limitRecord)
                });
        } else if (skipRecord && limitRecord) {
            aggregateQuery.push(
                {
                    $sort: sortingQuery
                }, {
                    $skip: Number(skipRecord)
                },
                {
                    $limit: Number(limitRecord)
                });
        } else {
            aggregateQuery.push(
                {
                    $sort: sortingQuery
                });
        }
        var recordsData = await ModelObj.aggregate(aggregateQuery);

        if (recordsData) {
            responseJson.data = recordsData;
            callback(null, responseJson);
            console.log(responseJson);
        } else {
            let err = new Error(`Error: No record found with query: ${aggregateQuery}`);
            return callback(err, null);
        }
    } catch (err) {
        return callback(err, null);
    }
};