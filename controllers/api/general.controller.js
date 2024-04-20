const pdf2base64 = require('pdf-to-base64');
const path = require("path");
const ejs = require("ejs");
let fs = require("fs");
const { TAX_TYPE, DISCOUNT_TYPE } = require("../../utils/enum");
const { numberWithCommas, roundoff } = require("../../utils/helper");
const db = require("../../models/index");
const { upload_form_logo_validate, preview_html, calculateInvoice_validate, preview_html_without_save, review_save_validation } = require('../../validations/generalValidation');
const USERPROGRESSMODEL = db.userProgress;
const ORDERSUMMARYMODEL = db.orderSummary;
const REVIEWMODEL = db.review;

module.exports = {
    downloadPDF: async (req, res) => {
        try {
            const orderId = req.params.order_id;
            const orderData = await ORDERSUMMARYMODEL.findOne({ "_id": orderId }).lean();
            const progressData = await USERPROGRESSMODEL.findOne({ "_id": orderData.progress_id }).lean();

            var form_name = progressData.form_name;
            var pdf_path = progressData.pdf_path;
            // var user_id = orderData.user_id;
            var filePath = path.join(__dirname, `../..`+pdf_path);
            if(form_name == "Paystub"){
                const response = fs.readFileSync(filePath, {encoding: 'base64'});
                return res.status(200).json({ success: true, message: `File generated.` , data: response, error: null});
            }else{
                pdf2base64(filePath).then((response) => {
                    return res.status(200).json({ success: true, message: `File generated.` , data: response, error: null});
                }).catch((err) => {
                    console.log("CATCH ::fn[downloadPDF] fn[pdf2base64]:::>");
                    console.error(err);
                    return res.status(300).json({ success: false, message: `Something went wrong on generating file..`, error: err.message, data: null });
                });
            }

        } catch (err) {
            console.log("CATCH :: API ::fn[downloadPDF]:::>");
            console.error(err);
            return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
        }
    },
    uploadFormLogo: async (req, res) => {
        try {
            if(req.fileValidationError){
                return res.status(200).json({ success: false, message: req.fileValidationError , error: null});
            }
            const payload = req.body;
            const validationError = upload_form_logo_validate(payload).error;
            if (validationError) return res.status(300).json({ success: false, message: validationError.message, error: "validation error", data: null });

            var file_obj = {};
            var file_length = req.files.length;
            if (req.files && req.files.length) {
                for(var i=0; i < file_length; i++){
                    if (req.fileValidationError) return res.status(300).json({ success: false, message: "Only image file is allowed", error: "file error", data: null });
                    var file = req.files[i];
                    let path = file.destination.replace("./uploads", "/uploads");
                    file.publicPath = path +"/"+ file.filename;
                    file_obj[i] = file;
                }
                if(file_length <= 1){
                    return res.status(200).json({ success: true, message: `File uploaded.` , data: file, error: null});
                }else{
                    return res.status(200).json({ success: true, message: `File uploaded.` , data: file_obj, error: null});
                }
            }else{
                return res.status(300).json({ success: false, message: `Something went wrong! could save file.`, error: "error: File not found", data: null });
            }
        } catch (err) {
            console.log("CATCH :: API ::fn[uploadFormLogo]:::>");
            console.error(err);
            return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
        }
    },
    invoiceCalculate: async (req, res) => {
        try {
            const payload = req.body;
            const validationError = calculateInvoice_validate(payload).error;
             if (validationError) return res.status(300).json({ success: false, message: validationError.message, error: "validation error", data: null });

            var taxRate = payload.taxRate;
            var cgstRate = payload.cgstRate;
            var sgstRate = payload.sgstRate;
            var taxType = payload.tax_type;
            var discount_type = payload.discount_type;
            var discountRate = payload.discountRate;


            var totalTaxAmount = 0;
            var cgstTaxAmount = 0;
            var sgstTaxAmonut = 0;
            var total = 0;
            var balance_due = 0;
            var subTotal = 0;
            var totalDiscAmount = 0;
            var outputInvoice = {};
            var amount = {};

            var invoice_data = payload.invoice_data;
            var length = Object.keys(invoice_data).length;

            Object.keys(invoice_data).forEach(function(key) {
                var item = invoice_data[key];
                var item_rate = item.item_rate;
                item_rate = item_rate.replace(/\,/g,'');

                var item_qty = item.item_qty;
                var item_tax = item.item_tax;

               ////// SUBTOTAL /////
                var invoice_amount = item_rate * item_qty;


               subTotal = parseFloat(subTotal) + parseFloat(invoice_amount);
               total = subTotal;
               balance_due = subTotal;

               ////// TAX /////
                if(item_tax== "checked"){
                    if((taxType == TAX_TYPE.ONTOTAL) && (taxRate!='' && taxRate!="0")){
                        if(discount_type == DISCOUNT_TYPE.PERCENT && (discountRate!='' && discountRate!='0')) {
                            totalTaxAmount = totalTaxAmount + ((invoice_amount - ((invoice_amount*discountRate)/100)) * taxRate) / 100;
                            cgstTaxAmount = cgstTaxAmount + ((invoice_amount - ((invoice_amount*discountRate)/100)) * cgstRate) / 100;
                            sgstTaxAmonut = sgstTaxAmonut + ((invoice_amount - ((invoice_amount*discountRate)/100)) * sgstRate) / 100;
                        }
                        else if(discount_type == DISCOUNT_TYPE.FLOAT_AMOUNT && (discountRate !='' && discountRate !="0")) {
                            totalTaxAmount = (totalTaxAmount) + (((invoice_amount) - ((discountRate)/(length))) * (taxRate)) / 100;
                            cgstTaxAmount = (cgstTaxAmount) + (((invoice_amount) - ((discountRate)/(length))) * (cgstRate)) / 100;
                            sgstTaxAmonut = (sgstTaxAmonut) + (((invoice_amount) - ((discountRate)/(length))) * (sgstRate)) / 100;

                        }
                        else {
                            totalTaxAmount = (totalTaxAmount) + ((invoice_amount) * (taxRate)) / 100;
                            cgstTaxAmount = (cgstTaxAmount) + ((invoice_amount) * (cgstRate)) / 100;
                            sgstTaxAmonut = (sgstTaxAmonut) + ((invoice_amount) * (sgstRate)) / 100;

                        }
                    }
                }

                ////// AMOUNT /////
                invoice_amount= parseFloat(invoice_amount).toFixed(2);
                invoice_amount = numberWithCommas(roundoff(invoice_amount));
                amount[key] = invoice_amount;
            });

            outputInvoice['total_tax'] = numberWithCommas(roundoff(parseFloat(totalTaxAmount).toFixed(2)));
            outputInvoice['cgst_tax'] = numberWithCommas(roundoff(parseFloat(cgstTaxAmount).toFixed(2)));
            outputInvoice['sgst_tax'] = numberWithCommas(roundoff(parseFloat(sgstTaxAmonut).toFixed(2)));

            ////// DISCOUNT /////
            if(discount_type !== DISCOUNT_TYPE.NONE){
                if(discount_type == DISCOUNT_TYPE.PERCENT && (discountRate!='' && discountRate!='0'))
                    totalDiscAmount = parseFloat(subTotal) * parseFloat(discountRate) / 100;
                else if(discount_type == DISCOUNT_TYPE.FLOAT_AMOUNT && (discountRate!='' && discountRate!="0"))
                    totalDiscAmount = parseFloat(discountRate);

                total = parseFloat(subTotal) - parseFloat(totalDiscAmount);
                balance_due = parseFloat(subTotal) - parseFloat(totalDiscAmount);

                totalDiscAmount= parseFloat(totalDiscAmount).toFixed(2);
                totalDiscAmount = numberWithCommas(roundoff(totalDiscAmount));
                outputInvoice['total_discount'] = totalDiscAmount;
            }

            ////// TOTAL /////
            if(taxType == TAX_TYPE.ONTOTAL){
                total = total + totalTaxAmount;
                balance_due = balance_due + totalTaxAmount;
            }else if(taxType == TAX_TYPE.DEDUCTED){
                total = total - totalTaxAmount;
                balance_due = balance_due - totalTaxAmount;
            }

            outputInvoice['amount'] = amount;
            outputInvoice['sub_total'] = numberWithCommas(roundoff(parseFloat(subTotal).toFixed(2)));
            outputInvoice['total'] = numberWithCommas(Math.floor(parseFloat(total).toFixed(2)));
            outputInvoice['balance_due'] = numberWithCommas(Math.floor(parseFloat(balance_due).toFixed(2)));

            return res.status(200).json({ success: true, message: "Tax calculate." , data: outputInvoice, error: null});
        } catch (err) {
            console.log("CATCH :: API ::fn[InvoiceCalculateTax]:::>");
            console.error(err);
            return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
        }
    },
    getPreviewHtml: async (req, res) => {
        try {
            const payload = req.body;
            const validationError = preview_html(payload).error;
            if (validationError) return res.status(300).json({ success: false, message: validationError.message, error: "validation error", data: null });
            const progressData = await USERPROGRESSMODEL.findOne({ "progress_number": payload.progress_number }).lean();
            if(!progressData) return res.status(300).json({ success: false, message: "No data found with given info.", error: "error: not found issue.", data: null });

            const bill_type = progressData.form_name;
            const ejsFileName = bill_type.toLowerCase().split(' ').join('_') + "_index";

            var type = "preview_app";
            var result = progressData.last_filled_data;
            var data = {
                "progress_number": progressData.progress_number,
                "is_preview" : true
            };

            var templatePath = path.join(__dirname, `../../template/${ejsFileName}.ejs`);
            const html = await ejs.renderFile(templatePath, {type, result, data, layout: false}, {async: true});
            return res.status(200).json({ success: true, message: "Preview." , data: html, error: null});
        } catch (err) {
            console.log("CATCH :: API ::fn[w2CalculateTax]:::>");
            console.error(err);
            return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
        }
    },

    getPreviewWithoutSaveHtml: async (req, res) => {
        try {
            const payload = req.body;
            const last_filled_data = payload.last_filled_data;
            const validationError = preview_html_without_save(payload).error;
            if (validationError) return res.status(300).json({ success: false, message: validationError.message, error: "validation error", data: null });

            const bill_type = payload.form_name;
            const ejsFileName = bill_type.toLowerCase().split(' ').join('_') + "_index";

            var type = "preview_app";
            var result = last_filled_data;
            var data = {
                "is_preview" : true
            };

            var data_obj = {
                "statement_date" : last_filled_data.statement_date,
                "form_name" : bill_type,
                "progress_number" : ''
            };

            async function utilityBill() {
                const x = await generateGraph(data_obj);
                last_filled_data.graph_path = x.graph_path;
                var templatePath = path.join(__dirname, `../../template/${ejsFileName}.ejs`);

                const html = await ejs.renderFile(templatePath, {type, result, data, layout: false}, {async: true});
                return res.status(200).json({ success: true, message: "Preview." , data: html, error: null});
            }

            if(bill_type == "Utility Bill"){
                utilityBill();
            }else{
                var templatePath = path.join(__dirname, `../../template/${ejsFileName}.ejs`);

                const html = await ejs.renderFile(templatePath, {type, result, data, layout: false}, {async: true});
                return res.status(200).json({data: html.replace(/(\r\n|\n|\r)/gm, "")});
            }

        } catch (err) {
            console.log("CATCH :: API ::fn[w2CalculateTax]:::>");
            console.error(err);
            return res.status(301).json({ success: false, message: "Something went wrong", error: err.message, data: null });
        }
    },
};