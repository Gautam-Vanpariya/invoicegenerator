var invoiceForm = 'Invoice';
let formSubmit = false;
var checkField = false;
let checkSaveData = false;

$(function () {

	$.fn.serializeObject = function () {
		var o = {};
		var a = this.serializeArray();
		$.each(a, function () {
			if (o[this.name]) {
				if (!o[this.name].push) {
					o[this.name] = [o[this.name]];
				}
				o[this.name].push(this.value || '');
			} else {
				o[this.name] = this.value || '';
			}
		});
		return o;
	};

	// TRIGGER LOGIN MODEL
	$('#saveProgressAfterLogin, #checkoutAfterLogin').click(function () {
		var value = $(this).val();
		var formData = $("#invoice_form").serializeObject();

		if (formData) {
			localStorage.setItem("value", value);
			localStorage.setItem("formData", JSON.stringify(formData));
		}
		$(this).closest(".modal").hide();
		showAuthForm('Login');
	});

	function roundoff(val) {
		return (+val).toFixed(2);
	}

	function numberWithCommas(x) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	// EMAIL THROUGH RETRIEVE DATA 
	function parameterURL() {
		const params = new URL(window.location).searchParams;
		const progress_number = params.get('progress_number');
		$("#old_progress_number").val(progress_number);
		if (progress_number == null || progress_number == '') {
			return false;
		} else {
			retrieveData(progress_number);
			const url = new URL(window.location);
			url.searchParams.delete('progress_number');
			window.history.pushState({}, '', url);
		}
	}
	parameterURL();

	function calcTotal() {
		var tax_type = $("#tax_type").val();
		var tax_rate = $("#tax_rate").val();
		var cgst_rate = $("#cgst_rate").val();
		var sgst_rate = $("#sgst_rate").val();
		var discount_type = $("#discount_type").val();
		var discount_rate = $("#discount_rate").val();
		var obj = {};
		$('.invoice_row').each(function (index, quantity) {
			var item = $(this).attr('id');
			var val = $(this).attr('data-val');

			var item_rate = $("#" + item).find('.row_rate input').val();
			var item_qty = $("#" + item).find('.row_quantity input').val();
			var item_tax = $("#" + item).find('.row_tax input[type="checkbox"]').val();
			var per_item_tax = $("#" + item).find('.per_item_tax input').val();

			obj["items_" + val] = {
				["item_rate"]: item_rate,
				["item_qty"]: item_qty,
				["per_item_tax"]: per_item_tax,
				["item_tax"]: item_tax,
			}
		});

		const sendingData = {
			"tax_type": tax_type,
			"discount_type": discount_type,
			"taxRate": tax_rate,
			"cgstRate": cgst_rate,
			"sgstRate": sgst_rate,
			"discountRate": discount_rate,
			"invoice_data": obj
		};

		$.ajax({
			url: "/invoice/calculate",
			method: "POST",
			data: sendingData,
			success: function (result) {
				if (result.success == true) {
					if (result.data && Object.keys(result.data).length > 0) {
						var data = result.data;
						var amount = result.data.amount;

						for (const key in data) {
							if ($("." + key).length > 0 && key != "amount") {
								var amt = data[key];
								$("." + key).text(amt);
								$("input[name='" + key + "']").val(amt);
							}
						}

						for (const key in amount) {
							if ($("#" + key).length > 0) {
								var amt = amount[key];
								$("#" + key).find(".row_amount  .amount").text(amt);
								$("#" + key).find('.row_amount input').val(amt);
							}
						}
					} else {
						console.log("Not data::>");
						console.log(result);
					}
				} else {
					toastr.error(result.message);
				}
			},
			error: function (err) {
				toastr.error("Something went wrong!");
				console.log(err.responseJSON?.message);
			}
		});
	}

	/* Save Logo Function */
	function saveInvoiceLogo() {
		var file = document.getElementById("upload").files[0];

		if (file) {
			const sendingData = new FormData();
			sendingData.set("type", "IMAGE");
			sendingData.set("form_name", invoiceForm);
			sendingData.set("file", file);
			$.ajax({
				url: "/upload/formLogo",
				method: "POST",
				data: sendingData,
				processData: false,
				contentType: false,
				success: function (result) {
					$("#show_loader").fadeIn();
					if (result.success == true) {
						$("#logo_path").val(result.data.publicPath);
						if ($('#guest_email_hidden').val()) {
							var guest_email = $('#guest_email_hidden').val();
						} else {
							var guest_email = $("#check_email_guest_user").val()
						}
						saveData(guest_email);
					} else {
						toastr.error(result.message);
					}
				},
				error: function (err) {
					toastr.error(err.responseJSON?.message || "something went wrong.");
				}
			});
		} else {
			if ($('#guest_email_hidden').val()) {
				var guest_email = $('#guest_email_hidden').val();
			} else {
				var guest_email = $("#check_email_guest_user").val()
			}
			saveData(guest_email);
		}
	}

	/* Save Data Function */
	function saveData(user_email) {
		var obj = {};
		$('.invoice_row').each(function (index, quantity) {
			var item = $(this).attr('id');
			var val = $(this).attr('data-val');
			var item_description = $("#" + item).find('.row_summary select').val();
			var item_additional_details = $("#" + item).find('.row_summary textarea').val();
			var item_hsnCode = $("#" + item).find('.row_hsnCode input').val();
			var item_rate = $("#" + item).find('.row_rate input').val();
			var item_qty = $("#" + item).find('.row_quantity input').val();
			var item_tax = $("#" + item).find('.row_tax input[type="checkbox"]').val();
			var item_amount = $("#" + item).find('.row_amount input').val();
			var per_item_tax = $("#" + item).find('.per_item_tax input').val();

			obj["items_" + val] = {
				["item_description"]: item_description,
				["item_additional_details"]: item_additional_details,
				["item_hsnCode"]: item_hsnCode,
				["item_rate"]: item_rate,
				["item_qty"]: item_qty,
				["item_amount"]: item_amount,
				["item_tax"]: item_tax,
				["per_item_tax"]: per_item_tax
			}
		});

		var body = {
			last_filled_data: {
				logo_path: $("#logo_path").val(),
				invoice_title: $("#invoice_title").val(),
				invoice_note: $("#invoice_note").val(),
				from_name: $('#from_name').val(),
				from_email: $('#from_email').val(),
				from_gst_number: $('#from_gst_number').val(),
				from_street_address_1: $('#from_street_address_1').val(),
				from_street_address_2: $('#from_street_address_2').val(),
				from_city: $('#from_city').val(),
				from_state: $('#from_state').val(),
				from_zip_code: $('#from_zip_code').val(),
				from_phone: $('#from_phone').val(),
				from_business_number: $('#business_number').val(),
				from_number: $('#from_number').val(),
				from_date: $('#from_date').val(),
				from_terms: $('#invoice_terms').val(),
				from_due_date: $('#from_due_date').val(),
				to_name: $('#to_name').val(),
				to_email: $('#to_email').val(),
				to_gst_number: $('#to_gst_number').val(),
				to_street_address_1: $('#to_street_address_1').val(),
				to_street_address_2: $('#to_street_address_2').val(),
				to_city: $('#to_city').val(),
				to_state: $('#to_state').val(),
				to_zip_code: $('#to_zip_code').val(),
				to_phone: $('#to_phone').val(),
				tax_type: $('#tax_type').val(),
				tax_rate: $('#tax_rate').val(),
				cgst_rate: $("input[name='cgst_rate']").val(),
				sgst_rate: $("input[name='sgst_rate']").val(),
				discount_type: $('#discount_type').val(),
				discount_rate: $('#discount_rate').val(),
				total: $("input[name='total']").val(),
				sub_total: $("input[name='sub_total']").val(),
				total_discount: $("input[name='total_discount']").val(),
				total_tax: $("input[name='total_tax']").val(),
				cgst_tax: $("input[name='cgst_tax']").val(),
				sgst_tax: $("input[name='sgst_tax']").val(),
				balance_due: $("input[name='balance_due']").val(),
				items: obj,
			},
			progress_number: $('#old_progress_number').val(),
			form_name: invoiceForm
		};

		let data;

		if (user_email !== '') {
			data = {
				...body,
				user_email
			}
		} else {
			data = {
				...body
			}
		}

		$.ajax({
			url: '/userProgress/save',
			method: 'POST',
			data: data,
			success: function (response) {
				if (response.success == true) {
					formSubmit = true;
					toastr.success(response.message);
					$('#progress_id').val(response.data._id);
					$('.checkOut').prop('disabled', false);
					$('#old_progress_number').val(response.data.progress_number);

					var progress_number = $("#old_progress_number").val();
					var form_data = localStorage.getItem("formData");

					localStorage.setItem("progress_number", progress_number);

					if (checkSaveData && form_data) {
						localStorage.setItem("progress_number_login", progress_number);
						orderSummary();
						return;
					} else if (form_data) {
						localStorage.setItem("progress_number_login", progress_number);
						window.location.reload();
					} else if (checkSaveData) {
						orderSummary();
						return;
					}
					$("#show_loader").fadeOut();
				} else {
					toastr.error(response.message);
					$("#show_loader").fadeOut();
				}
			},
			error: function (err) {
				toastr.error(err.responseJSON?.message || "something went wrong.");
				$("#show_loader").fadeOut();
			}
		});
	}
	/* Retrieve Data Function */
	function retrieveData(progress_number) {
		$("#show_loader").fadeIn();
		$(".upload_invoice_logo").attr("src", "");
		$(".logo_path").attr("src", "");
		$(".drop_invoice_logo").fadeOut(1);
		$(".invoice_upload_logo").fadeIn(1);

		$(".logo_path").addClass("d-none");
		$.ajax({
			url: '/userProgress/retrieve',
			method: 'POST',
			data: { progress_number: progress_number, form_name: invoiceForm },
			success: function (response) {
				$('.save_draft').prop('disabled', true);
				if (response.success == true) {
					toastr.success(response.message);
					var data = response.data.last_filled_data;
					var items = data.items;
					var tax_type = data.tax_type;
					var discount_type = data.discount_type;
					var from_terms = data.from_terms;
					var taxRate = data.tax_rate;

					$('#old_progress_number').val(response.data.progress_number);
					$(".invoice_table tbody").find("tr.invoice_row:gt(0)").remove();

					$.each(items, function (index, item) {
						let total_item = 1;
						if (index !== "items_1") {
							$cloneField = $("#items_1");
							total_item = index.substr(index.indexOf("_") + 1);

							//$(".invoice_table tbody").find("button.remove_btn").addClass('d-none');
							$("#add_button").before($cloneField.clone(true).attr({ "id": index, "data-val": total_item }));
							$("#" + index).find('.item_rate').val(item.item_rate);
							$("#" + index).find('.item_qty').val(item.item_qty);
							$("#" + index).find('input[type="checkbox"]').val('checked');
							$("#" + index).find(".row_actions button").removeClass('d-none');
						}
						$("#items_" + total_item).find('.input-group__error span').remove();
						$("#" + index).find('.row_summary select').val(item.item_description);
						$("#" + index).find('.row_summary textarea').val(item.item_additional_details);
						$("#" + index).find('.row_rate input').attr("id", "item_qty" + total_item).val(item.item_rate);
						$("#" + index).find('.row_quantity input').attr("id", "item_rate" + total_item).val(item.item_qty);
						$("#" + index).find('.per_item_tax  input').attr("id", "item_tax" + total_item).val(item.per_item_tax);
						$("#" + index).find('.row_tax input[type="checkbox"]').val(item.item_tax);
						$("#" + index).find('.row_amount input').val(item.item_amount);
						$("#" + index).find('.row_amount .amount').text(item.item_amount);
						if (item.item_tax !== '') {
							$("#" + index).find('.row_tax input[type="checkbox"]').attr(item.item_tax, true);
						} else {
							$("#" + index).find('.row_tax input[type="checkbox"]').attr('checked', false);
						}
						validation(total_item);
					});

					$(".per-item-tax").addClass('d-none');
					$(".per_item_tax").css("display", "none");
					if (tax_type == 'on total' || tax_type == 'deducted') {
						$("#tax_rate").closest('.tax_rate_div').removeClass('d-none');
						$(".total_tax_div").find('.invoice_summary-label').text('Tax (0%)');
						$(".total_tax_preview").text('Tax (' + taxRate + '%)');
						$(".total_tax").closest(".total_tax_div").find('.invoice_summary-label').text('Tax (' + taxRate + '%)');
					} else if (tax_type == 'per item') {
						$("#tax_rate").closest('.tax_rate_div').addClass('d-none');
						$(".total_tax_div").find('.invoice_summary-label').text('Tax');
						$(".total_tax_preview").text('Tax');
						$(".per-item-tax ").removeClass('d-none');
						$(".per_item_tax").css("display", "inline-block");
					} else {
						$(".total_tax_div, .total_tax_preview, .total_tax_text").addClass('d-none');
						$("#tax_rate").closest('.tax_rate_div').addClass('d-none');
						$(".total_tax_th, .row_tax").addClass('d-none');
					}

					if (tax_type == 'on total' && (data.tax_rate != '' && data.tax_rate != "0")) {
						$(".tax-sign").text("+ ₹");
					} else if (tax_type == 'deducted' && (data.tax_rate != '' && data.tax_rate != "0")) {
						$(".tax-sign").html("- ₹");
					} else {
						$(".tax-sign").text("+ ₹");
					}

					$(".discount_rate_sec, .total_discount_preview, .total_discount_preview_per_item, .total_discount_text, .total_discount_sec, .total_discount_per_item_sec").removeClass('d-none');
					if (discount_type == 'none') {
						$(".discount_rate_sec, .total_discount_sec, .total_discount_preview, .total_discount_preview_per_item, .total_discount_text, .total_discount_per_item_sec").addClass('d-none');
					} else if (discount_type == 'percent') {
						$(".total_discount_sec, .total_discount_per_item_sec").find('.invoice_summary-label').text('Discount (' + response.data.last_filled_data.discount_rate + '%)');
						$(".total_discount_preview, .total_discount_preview_per_item").text('Discount (' + response.data.last_filled_data.discount_rate + '%)');
					} else {
						$(".total_discount_sec, .total_discount_per_item_sec").find('.invoice_summary-label').text('Discount');
						$(".total_discount_preview, .total_discount_preview_per_item").text('Discount');
					}

					if (tax_type == 'per item' && discount_type != "none") {
						$(".total_discount_per_item_sec, .total_discount_preview_per_item, .total_discount_per_item_text").removeClass('d-none');
						$(".total_discount_sec, .total_discount_preview, .total_discount_text").addClass('d-none');
					} else if (tax_type != 'per item' && discount_type != "none") {
						$(".total_discount_per_item_sec, .total_discount_preview_per_item, .total_discount_per_item_text").addClass('d-none');
						$(".total_discount_sec, .total_discount_preview, .total_discount_text").removeClass('d-none');
					}

					if (from_terms == 'none') {
						$('.due_div').addClass('d-none').find("input").attr("disabled", true);
						$('.from_terms_field, .from_due_date_field').addClass('d-none');
					} else if (from_terms == 'on_receipt') {
						$('.due_div').addClass('d-none').find("input").attr("disabled", true);
						$('.from_due_date_field').addClass('d-none');
					} else if (from_terms == 'custom') {
						$('.due_div').removeClass('d-none').find("input").attr("disabled", false);
						$('.from_terms_field, .from_due_date_field').removeClass('d-none');
					} else if (from_terms != 'on_receipt') {
						$('.due_div').removeClass('d-none').find("input").attr("disabled", true);
						$('.from_terms_field, .from_due_date_field').removeClass('d-none');
					}

					for (const key in data) {
						if ($('input[name="' + key + '"]').length > 0) {
							$('input[name="' + key + '"]').val(data[key]);
							if ($('.' + key).length > 0) {
								if (data[key] !== '') {
									$('.' + key).text(data[key]);
								} else {
									var val = $('input[name="' + key + '"]').attr("data-val");
									$('.' + key).text(val);
								}
							}
						} else if ($('select[name="' + key + '"]').length > 0) {
							$('select[name="' + key + '"]').val(data[key]);
							if ($('.' + key).length > 0) {
								if (data[key] !== '') {
									$('.' + key).text(data[key]);
								} else {
									var val = $('select[name="' + key + '"]').attr("data-val");
									$('.' + key).text(val);
								}
							}
						} else if ($('textarea[name="' + key + '"]').length > 0) {
							$('textarea[name="' + key + '"]').val(data[key]);
							if ($('.' + key).length > 0) {
								$('.' + key).text(data[key]);
							}
						}
					}

					if (data.logo_path) {
						$(".upload_invoice_logo").attr("src", data.logo_path);
						$(".logo_path").attr("src", data.logo_path);
						$(".logo_path").removeClass("d-none");
						$("#logo_path").val(data.logo_path);
						$(".invoice_upload_logo").fadeOut(1);
						$(".drop_invoice_logo").fadeIn(1);
					}

					addItemPreview();
					$("#show_loader").fadeOut();
				} else {
					toastr.error(response.message);
					$("#show_loader").fadeOut();
				}
			},
			error: function (err) {
				toastr.error(err.responseJSON?.message || "something went wrong.");
				$("#show_loader").fadeOut();
			}
		});
	}

	/* Order Summary */
	function orderSummary() {
		if ($("#user_id").val()) {
			var user_id = $("#user_id").val();
		} else {
			var user_id = null;
		}
		const sendingData = {
			"user_id": user_id,
			"progress_id": $("#progress_id").val(),
			"bill_type": invoiceForm
		};

		$.ajax({
			url: '/checkout/orderSummary',
			method: 'POST',
			contentType: "application/json",
			data: JSON.stringify(sendingData),
			success: function (response) {
				if (response.success == true) {
					var progress_number = $("#old_progress_number").val();
					localStorage.setItem("progress_number", progress_number);

					// window.location.href = "/orderSummary/" + response.data._id;
					window.location.href = '/application-success?order_id=' + response.data._id;
				} else {
					toastr.error(response.message);
				}
			},
			error: function (err) {
				toastr.error(err.responseJSON?.message || "something went wrong.");
				$("#show_loader").fadeOut();
			}
		});
	}

	// Function to fetch the current counter from the server
	function fetchCounterFromServer() {
		return $.ajax({
			url: '/getInvoiceCounter',
			method: 'GET',
		});
	}

	// Function to save the updated counter to the server
	function saveCounterToServer(counter) {
		return $.ajax({
			url: '/updateInvoiceCounter',
			method: 'POST',
			data: { counter: counter },
		});
	}

	async function loadEvent() {
		try {
			// Fetch the current counter from the server
			const response = await fetchCounterFromServer();
			const storedCounter = response.data.counter;

			// If the counter is not stored, initialize it to 1
			if (!storedCounter) {
				invoiceCounter = 1;
			} else {
				// Otherwise, parse the stored counter as an integer
				invoiceCounter = parseInt(storedCounter);
			}

			// Format the counter as a four-digit string
			var paddedCounter = padWithZeros(invoiceCounter, 4);

			// Set the invoice number and update the counter for the next form
			$("#from_number").val("INVOICE - " + paddedCounter);
			$(".from_number").text("INVOICE - " + paddedCounter);

			// Update other elements as needed
			$(".from_date").text($("input[name='from_date']").val());

			// Increment the counter for the next form
			invoiceCounter++;

			// Save the updated counter to the server
			await saveCounterToServer(invoiceCounter);
		} catch (error) {
			console.error('Error:', error);
		}
	}


	// Function to pad a number with zeros to a certain length
	function padWithZeros(number, length) {
		var str = '' + number;
		while (str.length < length) {
			str = '0' + str;
		}
		return str;
	}


	$('#invoice_form').validate({
		rules: {
			file: {
				filesize: 10,
				accept: "image/*",
				extension: "jpg|jpeg|png|heic|JPG|JPEG|PNG|HEIC"
			},
			discount_rate: {
				priceFormat: true,
				notOnlyZero: 0
			},
			tax_rate: {
				priceFormat: true,
				notOnlyZero: 0
			},
			from_name: {
				minlength: 2,
				maxlength: 50
			},
			from_email: {
				minlength: 2,
				maxlength: 50,
				email: true
			},
			from_street_address_1: {
				minlength: 2,
				maxlength: 120
			},
			from_city: {
				minlength: 2,
				maxlength: 50
			},
			from_zip_code: {
				digits: true,
				minlength: 6,
				maxlength: 6
			},
			from_phone: {
				minlength: 5,
				maxlength: 14
			},
			to_email: {
				minlength: 2,
				maxlength: 50,
				email: true
			},
			to_street_address_1: {
				minlength: 2,
				maxlength: 120
			},
			to_city: {
				minlength: 2,
				maxlength: 50
			},
			to_zip_code: {
				digits: true,
				minlength: 6,
				maxlength: 6
			},
			to_phone: {
				minlength: 5,
				maxlength: 14
			}
		},
		messages: {
			from_name: {
				required: 'Please enter name',
				minlength: 'Name at least 2 characters',
				maxlength: 'Please enter between 2 and 50 characters',
			},
			from_email: {
				required: 'Please enter email',
				minlength: 'Email at least 2 characters',
				maxlength: 'Please enter between 2 and 50 characters',
			},
			from_street_address_1: {
				required: 'Please enter address',
				minlength: 'At least 2 characters',
				maxlength: 'Please enter between 2 and 120 characters',
			},
			from_state: {
				required: 'Please select state',
			},
			from_city: {
				required: 'Please enter city',
				minlength: 'City at least 2 characters',
				maxlength: 'Please enter between 2 and 50 characters',
			},
			from_zip_code: {
				required: 'Please enter zipcode',
				digits: 'Zip code should be numbers only',
				minlength: 'Zipcode at least 5 characters',
			},
			from_phone: {
				required: 'Please enter phone number',
				minlength: 'Phone at least 2 characters',
				maxlength: 'Please enter between 2 and 9 characters',
			},
			to_name: {
				required: 'Please enter name',
				minlength: 'Name at least 2 characters',
				maxlength: 'Please enter between 2 and 50 characters',
			},
			to_email: {
				required: 'Please enter email',
				minlength: 'Email at least 2 characters',
				maxlength: 'Please enter between 2 and 50 characters',
			},
			to_street_address_1: {
				required: 'Please enter address',
				minlength: 'At least 2 characters',
				maxlength: 'Please enter between 2 and 120 characters',
			},
			to_state: {
				required: 'Please select state',
			},
			to_city: {
				required: 'Please enter city',
				minlength: 'City at least 2 characters',
				maxlength: 'Please enter between 2 and 50 characters',
			},
			to_zip_code: {
				required: 'Please enter zipcode',
				digits: 'Zip code should be numbers only',
				minlength: 'Zipcode at least 5 characters',
			},
			to_phone: {
				required: 'Please enter phone number',
				minlength: 'Phone at least 2 characters',
				maxlength: 'Please enter between 2 and 9 characters',
			},
			from_number: {
				required: 'Please enter inoice number',
			}
		},
		errorElement: "span",
		errorPlacement: function (error, element) {
			if (element.hasClass("custom__error")) {
				$(element).closest('.invoice_logo').append(error);
			} else {
				error.insertAfter(element);
			}
		},
		onkeyup: function (element) {
			$(element).valid()
		}
	});

	function validation(index) {
		$("#items_" + index).find("#item_qty" + index).rules("add", {
			number: true,
			notOnlyZero: 0
		});

		$("#items_" + index).find("#item_rate" + index).rules("add", {
			priceFormat: true,
		});
	}

	//InvoiceNumber change
	$(document).on("change", "#from_number", function () {
		var val = $(this).val();
		$('.save_draft').prop('disabled', false);
		if (val != '') {
			$(".from_number").text(val);
		}
	});

	//Logo Upload
	$(document).on("change", "input[type=file]", function () {
		var file = $(this).get(0).files[0];

		if ($(this)[0].files[0]['type'].split('/')[0] !== 'image') {
			$(this).closest('.invoice_logo').append($('<span class="error_logo">').css('color', 'red').text('only image supported try anothor'));
			$("#bill_logo_preview, .preview_logo_image_tr").css("display", 'none');
			return false;
		} else {
			$(this).closest('.invoice_logo').find(".error_logo").remove();
		}

		if ($(this)[0].files[0].size > 10000000) {

			$(this).closest('.invoice_logo').append($('<span class="error_logo">').css('color', 'red').text('File size must be less than 10 MB'));
			$("#bill_logo_preview, .preview_logo_image_tr").css("display", 'none');
			return false;
		} else {
			$(this).closest('.invoice_logo').find(".error_logo").remove();
		}

		if (file) {
			formSubmit = false;
			var reader = new FileReader();

			reader.onload = function () {
				$(".upload_invoice_logo").attr("src", reader.result);
				$(".logo_path").attr("src", reader.result);
				$(".logo_path").removeClass('d-none');
				$(".invoice_upload_logo").fadeOut(1);
				$(".drop_invoice_logo").fadeIn(1);
			}
			$('.save_draft').prop('disabled', false);
			reader.readAsDataURL(file);
		}
	});

	$(document).on("change", "#invoice_title", function () {
		var val = $(this).val();
		$('.save_draft').prop('disabled', false);
		if (val == '') {
			$(this).val("Invoice");
			$(".invoice_title").text("Invoice");
		} else {
			$(".invoice_title").text(val);
		}
	})

	$(document).on("change", "#from_name, #from_email, #from_street_address_1, #from_street_address_2, #from_city, #from_state, #from_zip_code, #from_phone, #business_number", function () {
		debugger;
		var val = $(this).val();
		var name = $(this).attr("name");
		var text = $(this).attr("data-val");
		if (val == '') {
			$("." + name).text(text);
		} else {
			$("." + name).text(val);
		}
	})

	$(document).on("change", "#to_name, #to_email, #to_street_address_1, #to_street_address_2, #to_city, #to_state, #to_zip_code, #to_phone", function () {
		var val = $(this).val();
		var name = $(this).attr("name");
		var text = $(this).attr("data-val");
		if (val == '') {
			$("." + name).text(text);
		} else {
			$("." + name).text(val);
		}
	})

	$(document).on("change", "#invoice_note", function () {
		var val = $(this).val();
		if (val == '') {
			$(".invoice_note").text("");
		} else {
			$(".invoice_note").text(val);
		}
	})

	$(document).on("change", "#discount_type", function () {
		$('.save_draft').prop('disabled', false);
		var val = $(this).val();
		var tax = $("#tax_type").val();
		$(".discount_rate_sec, .total_discount_sec, .total_discount_preview, .total_discount_preview_per_item .total_discount_text").removeClass('d-none');
		$(".total_discount_sec").addClass('d-none');

		if (tax == 'per item' && val != "none") {
			$(".total_discount_per_item_sec, .total_discount_preview_per_item, .total_discount_per_item_text").removeClass('d-none');
			$(".total_discount_sec, .total_discount_preview, .total_discount_text").addClass('d-none');
		} else if (tax != 'per item' && val != "none") {
			$(".total_discount_per_item_sec, .total_discount_preview_per_item, .total_discount_per_item_text ").addClass('d-none');
			$(".total_discount_sec, .total_discount_preview, .total_discount_text").removeClass('d-none');
		}

		if (val == 'none') {
			$(".discount_rate_sec, .total_discount_sec, .total_discount_preview, .total_discount_preview_per_item, .total_discount_text, .total_discount_per_item_sec, .total_discount_per_item_text").addClass('d-none');
		} else if (val == 'percent') {
			var discount_rate = $("#discount_rate").val();
			if (discount_rate) {
				var discont_amt = discount_rate;
			} else {
				var discont_amt = 0;
			}
			$(".total_discount_sec, .total_discount_per_item_sec").find('.invoice_summary-label').text('Discount (' + discont_amt + '%)');
			$(".total_discount_preview, .total_discount_preview_per_item").text('Discount (' + discont_amt + '%)');
		} else {
			$(".total_discount_sec, .total_discount_per_item_sec").find('.invoice_summary-label').text('Discount');
			$(".total_discount_preview, .total_discount_preview_per_item").text('Discount');
		}
		calcTotal();
	});

	//discount_rate change
	$(document).on("change", "#discount_rate", function () {
		$('.save_draft').prop('disabled', false);
		if ($(this).val() == null || $(this).val() == '') {
			$(this).val("0.00");
		}
		var discRate = $(this).val();
		var discType = $("#discount_type").val();

		if (discType == "percent") {
			$(".total_discount_sec, .total_discount_per_item_sec").find('.invoice_summary-label').text('Discount (' + discRate + '%)');
			$(".total_discount_preview, .total_discount_preview_per_item").text('Discount (' + discRate + '%)');
		} else {
			$(".total_discount_sec, .total_discount_per_item_sec").find('.invoice_summary-label').text('Discount');
			$(".total_discount_preview, .total_discount_preview_per_item").text('Discount');
		}
		calcTotal();
	});

	$(document).on("keyup", "#cgst_rate, #sgst_rate", function () {
		$('.save_draft').prop('disabled', false);
		var taxRate = $("#tax_rate").val();
		var sgstRate = $("#sgst_rate").val();
		var cgstRate = $("#cgst_rate").val();
		if (taxRate == null || taxRate == '') {
			$("#tax_rate").val("0.00");
		} else {
			$("#tax_rate").val(taxRate);
		}
		var taxType = $("#tax_type").val();

		if (taxType == "deducted" || taxType == "on total") {
			$(".total_tax").closest(".total_tax_div").find('.invoice_summary-label').text('Tax (' + taxRate + '%)');
			$(".cgst_tax").closest(".cgst_tax_div").find(".invoice_summary-label").text('CGST  (' + cgstRate + '%)');
			$(".sgst_tax").closest(".sgst_tax_div").find('.invoice_summary-label').text('UTGST/SGST (' + sgstRate + '%)');
			$(".total_tax_preview").text('Tax (' + taxRate + '%)');
		}

		if (taxRate == '0') {
			$(".tax-sign").text("+ ₹");
		} else if (taxType == "deducted" && (taxRate !== "0.00" || taxRate != '')) {
			$(".tax-sign").text("- ₹")
		}
		calcTotal();
	});

	//Tax calculate change
	$(document).on("change", "#tax_calc", function () {
		if ($(this).prop("checked") == true) {
			$(this).val('checked');
		} else {
			$(this).val('');
		}
		calcTotal();
	});

	$(document).on("change", "#tax_type", function () {
		$('.save_draft').prop('disabled', false);
		var val = $(this).val();
		var taxRate = $("#tax_rate").val();
		let tax;
		if (taxRate == 0 || taxRate == 0.00) {
			tax = 0;
		} else {
			tax = taxRate;
		}

		$(".total_tax_div, .tax_rate_div").removeClass('d-none');
		$(".per-item-tax, .per_item_preview").addClass('d-none');
		$(".per_item_tax").css("display", "none");
		if (val == 'on total' || val == 'deducted') {
			$("#tax_rate").closest('.tax_rate_div').removeClass('d-none');
			$(".total_tax_th, .row_tax").removeClass('d-none');
			$(".total_tax").closest(".total_tax_div").find('.invoice_summary-label').text('Tax (' + tax + '%)');
		} else if (val == 'per item') {
			$("#tax_rate").closest('.tax_rate_div').addClass('d-none');
			$(".total_tax_div").find('.invoice_summary-label').text('Tax');
			$(".total_tax_preview").text('Tax');
			$(".total_tax_th, .row_tax, .per-item-tax, .per_item_preview").removeClass('d-none');
			$(".per_item_tax").css("display", "inline-block");
		} else {
			$(".total_tax_div, .total_tax_preview, .total_tax_text").addClass('d-none');
			$("#tax_rate").closest('.tax_rate_div').addClass('d-none');
			$(".total_tax_th, .row_tax").addClass('d-none');
		}

		if (val == 'per item' && $("#discount_type").val() != "none") {
			$(".total_discount_per_item_sec, .total_discount_preview_per_item, .total_discount_per_item_text").removeClass('d-none');
			$(".total_discount_sec, .total_discount_preview, .total_discount_text").addClass('d-none');
		} else if (val != 'per item' && $("#discount_type").val() != "none") {
			$(".total_discount_per_item_sec, .total_discount_preview_per_item, .total_discount_per_item_text").addClass('d-none');
			$(".total_discount_sec, .total_discount_preview, .total_discount_text").removeClass('d-none');
		}

		if (val == 'on total' && (taxRate != '' && taxRate != "0")) {
			$(".tax-sign").text("+ ₹");
		} else if (val == 'deducted' && (taxRate != '' && taxRate != "0")) {
			$(".tax-sign").html("- ₹");
		} else {
			$(".tax-sign").text("+ ₹");
		}

		calcTotal();
	});

	$(document).on("change", ".item_rate, .item_qty, .item_tax", function () {
		calcTotal();
	});

	$(document).on("keypress", ".item_rate, .item_tax, #tax_rate, #discount_rate", function (evt) {
		evt = (evt) ? evt : window.event;
		var charCode = (evt.which) ? evt.which : evt.keyCode;
		if (charCode == 8 || charCode == 37) {
			return true;
		} else if (charCode == 46 && $(this).val().indexOf('.') != -1) {
			return false;
		} else if (charCode > 31 && charCode != 46 && (charCode < 48 || charCode > 57)) {
			return false;
		}
		return true;
	});

	$(document).on("keypress", ".item_qty", function (e) {
		var charCode = (e.which) ? e.which : event.keyCode
		if (String.fromCharCode(charCode).match(/[^0-9]/g))
			return false;
	});

	$(document).on("change", ".item_rate, .item_tax", function () {
		var val = $(this).val();
		$(this).val(numberWithCommas(roundoff(val.replace(",", ""))))
	});

	$.ajax({
		url: '/getProductList',
		method: 'POST',
		success: function (data) {
			addRow(1, data);
		},
		error: function (error) {
			console.error('Error fetching data:', error);
		}
	});

	function addRow(item, productList) {
		var template = `
		<tr class="border-bottom invoice_row" id="items_${item}" data-val="${item}">
			<td class="row_actions invoice_items p-0 m-0">
				<button type="button" class="text-danger w-100 border-0 p-1 bg-transparent remove_btn d-none"><i class="fa fa-times "></i></button>
			</td>
			<td class="invoice_items row_summary item_description input-filled required-item ps-0">
				<div class="p-0 mb-1 position-relative">
					<label class="form-label floating-label">Item Description</label>
					<select class="form-control form_control border-blue" id="item_dec${item}" name="item_dec[${item}]">
						<option value="" selected>Select Product</option>
						${productList.data.reduce((previous, current) => previous + `<option value="${current.product_name}">${current.product_name}</option>`, ``)
			}
					</select>
				</div>
				<div class="p-0 mb-1 position-relative">
					<label class="form-label floating-label">Additional details</label>
					<textarea class="form-control form_control border-blue" rows="4" name="item_additional[]"></textarea>
				</div> 
			</td>
			<td class="invoice_items invoice_row_items row_hsnCode input-filled required-item">
				<div class="p-0 mb-1 position-relative input-group__error">
					<label class="form-label floating-label text-end w-75">HSN Code</label>
					<input type="tel" class="text-end form-control form_control border-blue item_hsnCode" id="item_hsnCode${item}" name="item_hsnCode[${item}]" value="" data-val="hsnCode" >
				</div>
			</td>
			<td class="invoice_items invoice_row_items row_rate input-filled required-item">
				<div class="p-0 mb-1 position-relative input-group__error">
					<label class="form-label floating-label text-end w-75">Item Rate</label>
					<input type="tel" class="text-end form-control form_control border-blue item_rate" id="item_rate${item}" name="item_rate[${item}]" value="" data-val="rate" >
				</div>
			</td>
			<td class="invoice_items invoice_row_items row_quantity input-filled required-item">
				<div class="p-0 mb-1 position-relative input-group__error">
					<label class="form-label floating-label text-end w-75">Item Qty</label>
					<input type="tel" class="text-end form-control form_control border-blue item_qty" id="item_qty${item}" name="item_qty[${item}]" value="1" data-val="quantity">
				</div>
			</td>
			<td class="invoice_items  invoice_row_items per_item_tax input-filled required-item p-0 m-0 p-lg-1 m-lg-1" style="display: ${($("#tax_type").val() == 'per item') ? 'inline-block' : 'none'}">
				<div class="p-0 mb-1 position-relative input-group__error">
					<label class="position-absolute form-label floating-label text-end w-75">0.00</label>
					<input type="tel" class="text-end form-control form_control border-blue item_tax" id="item_tax${item}" name="item_tax[${item}]" value="" data-val="tax">
				</div>
			</td>
			<td class="invoice_items invoice_row_items row_amount">
				<input type="hidden" name="item_amount[]" placeholder="0" value="0.00">
				<span class="currency">&#8377;<span class="amount">0.00</span></span>
			</td>        
			<td class="invoice_items invoice_row_items row_tax">
				<input type="checkbox" class="form-check-input p-1" id="tax_calc" value="checked" checked="">
			</td>
		</tr>`;

		$("#add_button").before(template);

		validation(item);
	}

	$(document).on("click", "#invoice_item_add", function () {
		totalInvoice_item = $('.invoice_table tr:nth-last-child(2)').attr("data-val");;
		total_item = parseInt(totalInvoice_item) + 1;
		$.ajax({
			url: '/getProductList',
			method: 'POST',
			success: function (data) {
				addRow(total_item, data);
				$("#items_" + total_item).find(".row_actions button").removeClass('d-none');
			},
			error: function (error) {
				console.error('Error fetching data:', error);
			}
		});
		$(".item_description").addClass('new_items');
	});

	function handleItemDescChange (item) {
		var selectedProduct = $('#item_dec' + item).val();
		const sendingData = {
			"product": selectedProduct,
		};

		$.ajax({
			url: '/getHsnCode',
			method: 'POST',
			data: sendingData,
			success: function (data) {
				debugger;
				$('#item_hsnCode' + item).val(data.data.product_hsn_code);
			},
			error: function (error) {
				toastr.error('Error fetching data:', error);
			}
		});
	}

	$(document).on('change', '[id^=item_dec]', function() {
        var itemNumber = this.id.match(/\d+/)[0];
        handleItemDescChange(itemNumber);
    });

	$(document).on("click", ".remove_btn", function () {
		$(this).parent().parent().slideUp(400, function () {
			$(this).remove();
			$(this).parent().parent().remove();
			if ($(".remove_btn").length > 1) {
				$(".invoice_items").find(".remove_btn").last().removeClass("d-none");
			}
			$(this).parents('.invoice_row').children('.item_description').removeClass('new_items');
			if ($(".invoice_row").length < 2) {
				$('.item_description').removeClass('new_items');
			}
			calcTotal();
		});
	});

	$('input[name="from_date"], input[name="from_due_date"]').daterangepicker({
		locale: {
			format: 'MMMM D, YYYY'
		},
		singleDatePicker: true,
		autoUpdateInput: true,
		showDropdowns: true,
		minYear: 1901,
	});

	$(document).on("click", "#invoice_terms", function () {
		$('.save_draft').prop('disabled', false);
		var val = $(this).val();
		if (val == 'none') {
			$('.due_div').addClass('d-none').find("input").attr("disabled", true);
			$('.from_terms_field, .from_due_date_field').addClass('d-none');
		} else if (val == 'on_receipt') {
			$('.due_div, .from_due_date_field').addClass('d-none').find("input").attr("disabled", true);
			$('.from_terms_field').removeClass('d-none');
			$('.from_terms').text(val.replace("_", " ").replace(/^(.)|\s(.)/g, function ($1) { return $1.toUpperCase(); }));
		} else if (val == 'custom') {
			$('.due_div').removeClass('d-none').find("input").attr("disabled", false);
			$('.from_terms_field, .from_due_date_field').removeClass('d-none');
			$("#from_due_date").val($("#from_date").val());
			$(".from_terms").text(val);
			$(".from_due_date").text($("#from_due_date").val());
		} else if (val != 'on_receipt') {
			$(".from_terms").text(val);
			if (val === "Next Day.") {
				val = 1;
			}
			var date = new Date($("#from_date").val());
			monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
			date.setDate(date.getDate() + parseFloat(val));
			var dd1 = date.getDate();
			var mm1 = date.getMonth() + 1;
			var y1 = date.getFullYear();
			mm1 = monthNames[mm1 - 1];
			if (mm1 < 10) {
				mm1 = '0' + mm1;
			}
			if (dd1 < 10) {
				dd1 = '0' + dd1;
			}
			$('.due_div').removeClass('d-none').find("input").attr("disabled", true);
			$("#from_due_date").val(mm1 + ' ' + dd1 + ',' + y1);
			$('.from_terms_field, .from_due_date_field').removeClass('d-none');
			$('.from_due_date').text($("#from_due_date").val());
		}
	});

	$(document).on("input", "#invoice_form", function () {
		$(".input-filled input, .input-filled select, .input-filled textarea").each(function (index, field) {
			if ($(field).val()) {
				checkField = true;
				return false;
			} else {
				checkField = false;
			}
		});

		if (checkField == true) {
			$('.save_draft').prop('disabled', false);
		} else {
			$('.save_draft').prop('disabled', true);
		}
	})

	/* Save Data With Loggin user */
	$(document).on("click", ".save_draft", function () {
		$("#show_loader").fadeIn();
		$(".require-field").each(function () {
			var name = $(this).attr('name');
			$('input[name=' + name + '], select[name=' + name + ']  ').rules('add', {
				required: false   // set a new rule
			});
		});

		$(".required-item input").each(function () {
			var id = $(this).attr('id');
			$('input[id=' + id + ']').rules('add', {
				required: false,
			});
		});

		if ($("#invoice_form").valid()) {
			var guest_email = $('#guest_email_hidden').val();
			if ($("#user_id").val() === undefined || $("#user_id").val() === '') {
				if ($("#guest_email_hidden").val() === '') {
					$("#saveDraftWithOutLogin").modal('show');
					$("#show_loader").fadeOut();
					return;
				}
			} else {
				saveInvoiceLogo(guest_email);
			}
		} else {
			var isValidForm = $("#invoice_form").validate();
			$("html").animate({
				scrollTop: $(isValidForm.errorList[0].element).offset().top - 140
			}, 10);
		}
		$("#show_loader").fadeOut();
	});

	/* Save User Progress without login */
	$(document).on("click", "#save_darft_without_login", function () {
		if ($('#saveWithoutLogin').valid()) {
			$("#withoutLoginSaveDraft").modal('hide');
			$("#guest_email_hidden").val($("#guest_email").val());
			saveInvoiceLogo();
		}
	});

	/* Retrieve Progress Number Data With Login */
	$(document).on("click", "#btn_load_data_login", function () {
		$("#previewModal").modal("hide");
		var progress_number = $("#progress_number_option").val();
		$('#old_progress_number').val(progress_number);
		retrieveData(progress_number);
	});

	/* Retrieve Progress Number Data Without Login */
	$(document).on("click", "#btn_load_data_without_login", function () {
		if ($("#guestProgressFrm").valid()) {
			$("#guestProgressNumberModal").modal("hide");
			var progress_number = $("#guest_progress_number").val();
			$('#old_progress_number').val(progress_number);
			retrieveData(progress_number);
		}
	});

	$(document).on("click", ".checkOut", function () {
		$(".required-item input").each(function () {
			var id = $(this).attr('id');
			var data = $(this).attr('data-val');
			$('input[id=' + id + ']').rules('add', {
				required: true,   // set a new rule
				messages: {
					required: "Please enter item " + data,
				}
			});
		});

		$(".require-field").each(function () {
			var id = $(this).attr('id');
			$('input[id=' + id + '], select[id=' + id + ']').rules('add', {
				required: true   // set a new rule
			});
		});

		if ($("#invoice_form").valid()) {
			var guest_email = $("#guest_email_hidden").val();
			if (formSubmit === true) {
				orderSummary();
			} else {
				checkSaveData = true;
				saveInvoiceLogo();
			}
		} else {
			var isValidForm = $("#invoice_form").validate();
			$("html").animate({
				scrollTop: $(isValidForm.errorList[0].element).offset().top - 140
			}, 10);
		}
	});

	function addItemPreview() {
		$(".per_item_preview").addClass('d-none');
		var totalItems = $(".invoice_items tr.invoice_row").length;
		$items = '';
		$defaultItem = '<tr><td class="d-flex" style="flex-direction:column;"><span class="item_description">Line Item</span><span class="additional_datails">Additional details</span></td><td style="text-align:right;">$99.00</td><td style="text-align:right;">1</td><td style="text-align:right;" class="per_item_preview d-none">$0.00</td><td style="text-align:right;">$99.00</td></tr>';
		$(".invoice_preview_section .invoice_items_preview").html('');
		for ($i = 0; $i < totalItems; $i++) {
			$itemName = $("#items_" + [$i + 1]).find(".row_summary input").val();
			$itemAdditional = $("#items_" + [$i + 1]).find(".row_summary textarea").val();
			$itemRate = $("#items_" + [$i + 1]).find(".row_rate input").val();
			$itemQty = $("#items_" + [$i + 1]).find(".row_quantity input").val();
			$per_item_tax = $("#items_" + [$i + 1]).find(".per_item_tax  input").val();
			$itemAmount = $("#items_" + [$i + 1]).find(".row_amount input").val();

			if ($itemAmount != "0.00" && $itemName != undefined && $itemAdditional != undefined)
				$items += '<tr><td class="d-flex" style="flex-direction:column;"><span class="item_description">' + $itemName + '</span><span class="additional_datails">' + $itemAdditional + '</span></td><td style="text-align:right;">$' + $itemRate + '</td><td style="text-align:right;">' + $itemQty + '</td><td style="text-align:right;" class="per_item_preview d-none">$' + $per_item_tax + '</td><td style="text-align:right;">' + $itemAmount + '</td></tr>';
		}

		if ($items != '') {
			$(".invoice_preview_section .invoice_items_preview").html($items);
		} else {
			$(".invoice_preview_section .invoice_items_preview").html($defaultItem);

		}

		if ($("#tax_type").val() == 'per item') {
			$(".per_item_preview ").removeClass('d-none');
		}

	}

	$(document).on("click", "#preview_invoice", function () {
		$(".required-item input").each(function () {
			var id = $(this).attr('id');
			var data = $(this).attr('data-val');
			$('input[id=' + id + ']').rules('add', {
				required: true,   // set a new rule
				messages: {
					required: "Please enter item " + data,
				}
			});
		});

		$(".require-field").each(function () {
			var id = $(this).attr('id');
			$('input[id=' + id + '], select[id=' + id + ']').rules('add', {
				required: true   // set a new rule
			});
		});

		if ($("#invoice_form").valid()) {
			$(".invoice_edit_section").fadeOut(0);
			$(".invoice_preview_section").fadeIn(0);
			$(this).addClass('primary-btn');
			$(this).removeClass('outline-btn');
			$("#edit_invoice").addClass('outline-btn');
			$("#edit_invoice").removeClass('primary-btn');
			addItemPreview();
		} else {
			var isValidForm = $("#invoice_form").validate();
			$("html").animate({
				scrollTop: $(isValidForm.errorList[0].element).offset().top - 140
			}, 10);
		}
	});

	$(document).on("click", "#edit_invoice", function () {
		$(".invoice_edit_section").fadeIn(0);
		$(".invoice_preview_section").fadeOut(0);
		$(this).addClass('primary-btn');
		$(this).removeClass('outline-btn');
		$("#preview_invoice").addClass('outline-btn');
		$("#preview_invoice").removeClass('primary-btn');
		addItemPreview();
	});

	loadEvent();

	$.validator.addMethod("notOnlyZero", function (value, element, param) {
		if (value !== '') {
			if (/^(?!0(\.0*)?$)\d+(\.?\d{0,2})?$/.test(value)) {
				return true;
			} else {
				return false;
			}
		}
		return true;
	}, 'Enter a value greater than zero');

	$.validator.addMethod("priceFormat", function (value, element) {
		if (value !== '') {
			if (/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value)) {
				return true;
			} else {
				return false;
			}
		}
		return true;
	}, "Please enter valid decimal number.");

	$.validator.addMethod('filesize', function (value, element) {
		return this.optional(element) || (element.files[0].size <= 10 * 1000000)
	}, 'File size must be less than 10 MB');


	window.addEventListener("pageshow", function (event) {
		var historyTraversal = event.persisted || (typeof window.performance != "undefined" && window.performance.navigation.type === 2);
		if (historyTraversal) {
			var checkout = localStorage.getItem("login_checkout");
			if (checkout == 'checkout') {
				localStorage.removeItem("login_checkout");
				window.location.reload();
			} else {
				var progress_number = localStorage.getItem("progress_number");
				if (progress_number != null && progress_number != '') {
					retrieveData(progress_number);
				}
			}
			localStorage.removeItem("login_checkout");
		} else {
			var form_data = localStorage.getItem("formData");
			var progress_number = localStorage.getItem("progress_number_login");
			if (form_data && progress_number) {
				retrieveData(progress_number);
				localStorage.removeItem('formData');
				localStorage.removeItem('progress_number_login');
			}
			console.log('This is normal page load');
		}
	});

	// if (window.performance) {
	//     var navEntries = window.performance.getEntriesByType('navigation');
	//     if (navEntries.length > 0 && navEntries[0].type === 'back_forward') {
	//         var checkout = localStorage.getItem("login_checkout");
	//         if(checkout == 'checkout'){
	//             localStorage.removeItem("login_checkout");
	//             window.location.reload();
	//         }else{
	//             $numberStub = localStorage.getItem("progress_number"); 
	//             if($numberStub!=null  && $numberStub!=''){
	//                 var progress_number = JSON.parse($numberStub);
	//                 retrieveData(progress_number);
	//             }  
	//         } 
	//         localStorage.removeItem("login_checkout");
	//     }else {
	//         var form_data = localStorage.getItem("formData");
	//         $numberStub = localStorage.getItem("progress_number_login"); 

	//         if(form_data  && $numberStub){               
	//             var progress_number = JSON.parse($numberStub);
	//             retrieveData(progress_number);
	//             localStorage.removeItem('formData');
	//             localStorage.removeItem('progress_number_login');
	//         }   
	//         console.log('This is normal page load');
	//     }
	// } else {
	//     console.log("Unfortunately, your browser doesn't support this API");
	// }

});