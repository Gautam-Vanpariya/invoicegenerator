$(document).ready(function () {

	var pathname = window.location.pathname;
	$('.sidebar ul li a').removeClass('active');
	$('.sidebar ul li a[href="' + pathname + '"]').addClass('active');

	// LOGIN FORM VALIDATION RULE
	$('#login_form').validate({
		rules: {
			l_email: {
				required: true,
				email: true,
				emailValidation: true
			},
			l_password: {
				required: true,
				minlength: 1,
				maxlength: 50
			}
		},
		errorPlacement: function (error, element) {
			if (element.hasClass("custom__error")) {
				$(element).closest('.error__pblock').find(".error_label").append(error);
			} else {
				error.insertAfter(element);
			}
		}
	});

	$.validator.addMethod("emailValidation", function (value, element) {
		var email_Regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return this.optional(element) || email_Regex.test(value);
	}, "Please enter valid email");

	// LOGIN FORM SUBMIT
	$('#loginBtnSubmit').click(function (e) {
		e.preventDefault();
		console.log("FORM IS VALID :::>", $("#login_form").valid());
		if ($('#login_form').valid()) {
			$("#login_form button").attr("disabled", true);
			const sendingData = {
				"email": $('input[name="email"]').val().trim(),
				"password": $('input[name="password"]').val().trim()
			};
			$.ajax({
				url: "/admin/auth/login",
				method: "POST",
				data: sendingData,
				success: function (result) {
					$("#login_form button").attr("disabled", false);
					if (result.success == true) {
						window.location.href = "/admin/dashboard";
					} else {
						toastr.error(result.message);
					}
				},
				error: function (err) {
					$("#login_form button").attr("disabled", false);
					toastr.error(err.responseJSON?.message || "something went wrong.");
				}
			});
		} else {
			$("#login_form button").attr("disabled", false);
		}
	});

	// DashBoard
	$('#sidebarCollapse').on('click', function () {
		$('#sidebar').toggleClass('active');
	});
	$.ajax({
		url: '/admin/count/',
		method: 'GET',
		success: function (response) {
			// $("#allusers").text(response.data.allUser);
			// $("#allCoupon").text(response.data.allCoupon);
			// $("#activeCoupon").text(response.data.activeCoupon);
			// $("#allTransaction").text(response.data.allTransaction);
			// $("#pendingTransaction").text(response.data.pendingTransaction);
			// $("#successTransaction").text(response.data.suceessTransaction);
			// $("#freeTransaction").text(response.data.freeTransaction);
			// $("#adminUser").text(response.data.adminUser);
			// $("#customerUser").text(response.data.customerUser);
			// $("#allOffers").text(response.data.allOffer);
		},
		error: function (xhr) {
		}
	});

	// Coupon Page
	var couponListTabel;

	function couponListTabelDataBind() {
		if ($("#coupon_table").length > 0) {
			couponListTabel = $("#coupon_table").DataTable({
				lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
				iDisplayLength: 10,
				bDestroy: true,
				dom: 'lfrtip',
				autoWidth: false,
				scrollX: true,
				processing: true,
				bSort: false,
				serverSide: true,
				language: {
					"loadingRecords": "&nbsp;",
					"processing": "Loading..."
				},
				serverMethod: 'POST',
				ajax: {
					"url": "/admin/coupon/find"
				},
				columns: [{
					data: "",
					defaultContent: "-"
				}, {
					data: null,
					defaultContent: "-",
					render: function (data) {
						return data.code;
					}
				}, {
					data: null,
					defaultContent: "-",
					render: function (data) {
						return data.discounts_Percentage;
					}
				}, {
					data: null,
					defaultContent: "-",
					render: function (data) {
						return data.start_date;
					}
				}, {
					data: null,
					defaultContent: "-",
					render: function (data) {
						return data.end_date;
					}
				}, {
					data: null,
					defaultContent: "-",
					render: function (data) {
						return data.total_coupon;
					}
				}, {
					data: null,
					defaultContent: "-",
					render: function (data) {
						return data.used_coupon;
					}
				}, {
					data: null,
					defaultContent: "-",
					render: function (data, type, row, meta) {
						var status;
						var icon;
						if (data.status === false) {
							status = true;
							icon = '<i class="fas fa-lock"></i>';
						} else {
							status = false;
							icon = '<i class="fas fa-lock-open"></i>';
						}
						var editHTML = '<center>';
						editHTML += `<div className='d-flex'> 
                                    <button type="button" class="btn btn-sm btn-outline-primary" id="updateStatus" title="Update Status" data-status=${status} data-myval="${data._id}">${icon}</button>
                                    <button type="button" class="btn btn-sm btn-outline-success" id="updateCoupon" title="Update Coupon" data-myval="${data._id}"><i class="fas fa-edit"></i></button>
                                    <button type="button" class="btn btn-sm btn-outline-danger" id="deleteCoupon" title="Delete Coupon" data-myval="${data._id}"><i class="fas fa-trash"></i></button>
                                </div>`;
						return editHTML;
					}
				}],
				fnRowCallback: function (nRow, aData, iDisplayIndex) {
					var oSettings = couponListTabel.settings()[0];
					$("td:first", nRow).html(oSettings._iDisplayStart + iDisplayIndex + 1);
					nRow.id = aData.id;
					return nRow;
				}
			})
		}
	}
	couponListTabelDataBind();

	function MinDate() {
		var dtToday = new Date();

		var month = dtToday.getMonth() + 1;
		var day = dtToday.getDate();
		var year = dtToday.getFullYear();

		if (month < 10)
			month = '0' + month.toString();
		if (day < 10)
			day = '0' + day.toString();

		var maxDate = year + '-' + month + '-' + day;
		$('#addstart_date, #addend_date, #end_date').attr('min', maxDate);
	}
	MinDate();

	$('#addstart_date, #start_date').change(function () {
		var val = $(this).val();
		$('input[name=end_date]').attr('min', val);
	})

	function MinDateUpdate() {
		var val = $("#start_date").val();
		$('#end_date').attr('min', val);
	}

	$('table').on('click', '#updateStatus', function () {
		var couponId = $(this).data('myval');
		var status = $(this).data('status');
		let data = { status: status }
		var text;
		if (status == true) {
			text = "You change coupon code status activate";
		} else {
			text = "You change coupon code status de-activate";
		}
		Swal.fire({
			title: 'Are you sure?',
			text: text,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, edit it!'
		}).then((result) => {
			if (result.isConfirmed) {
				$.ajax({
					url: '/admin/coupon/update/' + couponId,
					method: 'PUT',
					data: data,
					success: function (response) {
						couponListTabel.ajax.reload(null, false);
					},
					error: function (xhr) {
						toastr.error(xhr.responseJSON.message);
					}
				});
			}
		});
	});

	$('table').on('click', '#deleteCoupon', function () {
		var couponId = $(this).data('myval');
		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, delete it!'
		}).then((result) => {
			if (result.isConfirmed) {
				$.ajax({
					url: '/admin/coupon/delete/' + couponId,
					method: 'DELETE',
					success: function (response) {
						Swal.fire("Deleted!", "Your coupon has been deleted.", "success").then(function () {
							couponListTabel.ajax.reload(null, false);
						});
					},
					error: function (xhr) {
						toastr.error(xhr.responseJSON.message);
					}
				});
			}
		});
	});

	$('table').on('click', '#updateCoupon', function () {
		var rowElement = $(this).closest('tr');
		var getCode = rowElement.find('td:eq(1)').text();
		$("#editCouponCode").val(getCode);
		var getstartDate = rowElement.find('td:eq(3)').text();
		var startDate = new Date(getstartDate).toLocaleString("en-CA", { month: '2-digit', day: '2-digit', year: 'numeric' });
		$("#start_date").val(startDate);
		var getEndDate = rowElement.find('td:eq(4)').text();
		var endDate = new Date(getEndDate).toLocaleString("en-CA", { month: '2-digit', day: '2-digit', year: 'numeric' });
		$("#end_date").val(endDate);
		var getTotalCoupon = rowElement.find('td:eq(5)').text();
		$("#total_coupon").val(getTotalCoupon);
		var getdiscount = rowElement.find('td:eq(2)').text();
		$("#discount").val(getdiscount);
		var couponId = $(this).data('myval');
		$("#coupon_id").val(couponId);
		MinDateUpdate();
		$("#editCouponModal").modal('show');
	});

	$("#editCouponModal").submit(async function (e) {
		e.preventDefault();
		var couponId = $("#coupon_id").val();
		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, edit it!'
		}).then((result) => {
			if (result.isConfirmed) {
				$.ajax({
					url: '/admin/coupon/update/' + couponId,
					method: 'PUT',
					data: $('#editCouponForm').serialize(),
					success: function (response) {
						$("#editCouponModal").modal('hide');
						couponListTabel.ajax.reload(null, false);
						toastr.success('Your coupon data has been changed.');
					},
					error: function (xhr) {
						// $("#editNewsModal").modal('hide');
						toastr.error(xhr.responseJSON.message);
					}
				});
			}
		});
	});

	$(document).on('click', '#addCoupon', function (e) {
		e.preventDefault();

		let code = $("#addCouponCode").val();
		if (!code || code === "") {
			toastr.error('Please add coupon code.', '', { timeOut: 1000 });
			return;
		}

		let start_date = $("#addstart_date").val();
		if (!start_date || start_date === "") {
			toastr.error('Please select coupon start date.', '', { timeOut: 1000 });
			return;
		}

		let end_date = $("#addend_date").val();
		if (!end_date || end_date === "") {
			toastr.error('Please select coupon end date.', '', { timeOut: 1000 });
			return;
		}

		let total_coupon = $("#addtotal_coupon").val();
		if (!total_coupon || total_coupon === "") {
			toastr.error('Please add total coupon.', '', { timeOut: 1000 });
			return;
		}

		var add_discount = $("#add_discount").val();
		if (!add_discount || add_discount === "") {
			toastr.error('Please add coupon discount.', '', { timeOut: 1000 });
			return;
		}

		const form_data = $("#addCouponForm").serialize();
		$.ajax({
			url: '/admin/coupon/coupon_create',
			type: 'POST',
			data: form_data,
			success: function () {
				toastr.success('Coupon Added Successfully.');
				$('#addNewcouponModal').modal('toggle');
				couponListTabel.ajax.reload(null, false);
				$("#addCouponCode").val("");
				$("#start_date").val("");
				$("#end_date").val("");
				$("#total_coupon").val("");
				$("#add_discount").val("");
			},
			error: function (xhr) {
				toastr.error(xhr.responseJSON.message, '', 1500);
			}
		});
	});

	// Pricing Offer Page Script
	var offerListTabel;

	function offerListTabelDataBind() {
		offerListTabel = $("#pricing_table").DataTable({
			lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
			iDisplayLength: 10,
			bDestroy: true,
			dom: 'lfrtip',
			autoWidth: false,
			scrollX: true,
			processing: true,
			bSort: false,
			serverSide: true,
			language: {
				"loadingRecords": "&nbsp;",
				"processing": "Loading..."
			},
			serverMethod: 'POST',
			ajax: {
				"url": "/admin/pricingOffers/list"
			},
			columns: [{
				data: "",
				defaultContent: "-"
			}, {
				data: null,
				defaultContent: "-",
				render: function (data) {
					return data.title;
				}
			}, {
				data: null,
				defaultContent: "-",
				render: function (data) {
					return data.price;
				}
			}, {
				data: null,
				defaultContent: "-",
				render: function (data) {
					return data.page_url;
				}
			}, {
				data: null,
				defaultContent: "-",
				render: function (data) {
					var html;

					var description = data.description;
					html = "<ol>";
					$.each(description, function (index, value) {
						html += "<li>" + value + "</li>";
					});
					html += "</ol>";
					return html;
				}
			}, {
				data: null,
				defaultContent: "-",
				render: function (data) {
					var editHTML = '<center>';
					editHTML += `<div className='d-flex'>
                                  <button type="button" class="btn btn-sm btn-outline-success" id="updatOffer" title="Update Offer" data-myval="${data._id}"><i class="fas fa-edit"></i></button>
                                  <button type="button" class="btn btn-sm btn-outline-danger" id="deleteOffer" title="Delete Coupon" data-myval="${data._id}"><i class="fas fa-trash"></i></button>
                              </div>`;
					return editHTML;
				}
			}],
			fnRowCallback: function (nRow, aData, iDisplayIndex) {
				var oSettings = offerListTabel.settings()[0];
				$("td:first", nRow).html(oSettings._iDisplayStart + iDisplayIndex + 1);
				nRow.id = aData.id;
				return nRow;
			}
		})
	}

	if ($("#pricing_table").length > 0) {
		offerListTabelDataBind();
	}

	$('table').on('click', '#deleteOffer', function () {
		var id = $(this).data('myval');
		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, delete it!'
		}).then((result) => {
			if (result.isConfirmed) {
				$.ajax({
					url: '/admin/pricingOffers/deletePricingOffer/' + id,
					method: 'DELETE',
					success: function (response) {
						Swal.fire("Deleted!", "Your pricing offer has been deleted.", "success").then(function () {
							offerListTabel.ajax.reload(null, false);
						});
					},
					error: function (xhr) {
						toastr.error(xhr.responseJSON.message);
					}
				});
			}
		});
	});

	$('table').on('click', '#updatOffer', function () {
		var offerId = $(this).data('myval');
		$.ajax({
			url: '/admin/pricingOffers/getPricingOffer',
			type: 'POST',
			data: { id: offerId },
			success: function (res) {
				const data = res.data;
				$("#id").val(data._id);
				$("#editPricingOfferTitle").val(data.title);
				$("#editPricingOfferPrice").val(data.price);
				$("#editPricingOfferPageUrl").val(data.page_url);

				const desc = data.description;
				let length = desc.length;
				var html = "";
				for (i = 0; i < length; i++) {
					if (i != 0)
						html += ' | ';

					html += desc[i];
				}

				$('#editPricingOfferDescription').val(html)
			},
			error: function (xhr) {
				toastr.error(xhr.responseJSON.message, '', 1500);
			}
		})
		$("#editPricingOfferModal").modal('show');
	});

	$("#editPricingOfferForm").submit(async function (e) {
		e.preventDefault();
		var id = $("#id").val();
		var descriptionObj = {};
		let title = $("#editPricingOfferTitle").val();
		if (!title || title === "") {
			toastr.error('Please add offer title.', '', { timeOut: 1000 });
			return;
		}

		let price = $("#editPricingOfferPrice").val();
		if (!price || price === "") {
			toastr.error('Please add offer price.', '', { timeOut: 1000 });
			return;
		}

		var page_url = $("#editPricingOfferPageUrl").val();

		descriptionObj = $('#editPricingOfferDescription').val().split('|');
		if (descriptionObj.length == 0) {
			toastr.error('Please add offer description.', '', { timeOut: 1000 });
			return false;
		}

		const data = {
			title: title,
			price: price,
			page_url: page_url,
			description: descriptionObj
		}

		$.ajax({
			url: '/admin/pricingOffers/updatePricingOffer/' + id,
			type: 'POST',
			data: data,
			success: function (res) {
				toastr.success("Pricing Offer Updated Successfully");
				$('#editPricingOfferModal').modal('toggle');
				offerListTabel.ajax.reload(null, false);
			},
			error: function (xhr) {
				toastr.error(xhr.responseJSON.message, '', 1500);
			}
		});
	});

	$("#addPricingOfferForm").submit(async function (e) {
		e.preventDefault();

		var descriptionObj = [];
		let title = $("#addPricingOfferTitle").val();
		if (!title || title === "") {
			toastr.error('Please add offer title.', '', { timeOut: 1000 });
			return;
		}

		let price = $("#addPricingOfferPrice").val();
		if (!price || price === "") {
			toastr.error('Please add offer price.', '', { timeOut: 1000 });
			return;
		}

		var page_url = $("#addPricingOfferPriceUrl").val();

		descriptionObj = $('#addPricingOfferDescription').val().split('|');
		if (descriptionObj.length == 0) {
			toastr.error('Please add offer description.', '', { timeOut: 1000 });
			return false;
		}

		const data = {
			title: title,
			price: price,
			page_url: page_url,
			description: descriptionObj
		}

		$.ajax({
			url: '/admin/pricingOffers/add',
			type: 'POST',
			data: data,
			success: function (res) {
				toastr.success("Pricing Offer Added Successfully");
				$('#addNewpricingOfferModal').modal('toggle');
				offerListTabel.ajax.reload(null, false);
				$("#addPricingOfferTitle").val("");
				$("#addPricingOfferPrice").val("");
				$("#addPricingOfferPriceUrl").val("");
				$("#addPricingOfferDescription").val("");
			},
			error: function (xhr) {
				toastr.error(xhr.responseJSON.message, '', 1500);
			}
		});

	});

	//  User Page
	var userListTabel;

	function userListTabelDataBind() {
		userListTabel = $("#user_table").DataTable({
			lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
			iDisplayLength: 10,
			bDestroy: true,
			dom: 'lfrtip',
			autoWidth: false,
			scrollX: true,
			processing: true,
			bSort: false,
			serverSide: true,
			language: {
				"loadingRecords": "&nbsp;",
				"processing": "Loading..."
			},
			serverMethod: 'POST',
			ajax: {
				"url": "/admin/users/data"
			},
			columns: [{
				data: "",
				defaultContent: "-"
			}, {
				data: null,
				defaultContent: "-",
				render: function (data) {
					return data.user_name;
				}
			}, {
				data: null,
				defaultContent: "-",
				render: function (data) {
					return data.email;
				}
			}, {
				data: null,
				defaultContent: "-",
				render: function (data) {
					return data.street_address1;
				}
			}, {
				data: null,
				defaultContent: "-",
				render: function (data) {
					return data.street_address2;
				}
			}, {
				data: null,
				defaultContent: "-",
				render: function (data) {
					return data.city;
				}
			}, {
				data: null,
				defaultContent: "-",
				render: function (data) {
					return data.zipcode;
				}
			}, {
				data: null,
				defaultContent: "-",
				render: function (data) {
					return data.state;
				}
			}, {
				data: null,
				defaultContent: "-",
				render: function (data) {
					return data.country;
				}
			}, {
				data: null,
				"defaultContent": "-",
				"render": function (data, type, row, meta) {
					var editHTML = `<input type="checkbox" id="userRole" class="form-check" value=${data.userRole} data-id="${data._id}" ${(data.userRole === "Admin") ? "checked" : ''}><label class="form-check-label mr-2" for="all_checkbox"> ${data.userRole}</label>`;
					return editHTML;
				}
			}, {
				data: null,
				"defaultContent": "-",
				"render": function (data, type, row, meta) {
					var editHTML = '<center>';
					editHTML += `<button type="button" id="deleteUser" class="btn btn-sm btn-outline-danger"  title="Delete User" data-myval="${data._id}"><i class="fas fa-trash"></i></button>`;
					editHTML += '</center>';
					return editHTML;
				}
			}],
			fnRowCallback: function (nRow, aData, iDisplayIndex) {
				var oSettings = userListTabel.settings()[0];
				$("td:first", nRow).html(oSettings._iDisplayStart + iDisplayIndex + 1);
				nRow.id = aData.id;
				return nRow;
			}
		});
	}
	if ($("#user_table").length > 0) {
		userListTabelDataBind();
	}

	$(document).on('change', '#userRole', function (e) {
		var userId = $(this).attr('data-id');
		var role = $(this).val();
		if (role === "Admin") {
			var userRole = "Customer";
		} else {
			var userRole = "Admin";
		}
		$.ajax({
			url: "/admin/users/" + userId + "/updateRole",
			type: 'PUT',
			data: { userRole: userRole },
			success: function (res) {
				toastr.success('User role updated Successfully.');
				userListTabel.ajax.reload(null, false);
			},
			error: function (xhr) {
				toastr.error(xhr.responseJSON.message, '', 1500);
			}
		});
	});

	$(document).on('click', '#deleteUser', function (e) {
		var userId = $(this).data('myval');
		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, delete it!'
		}).then((result) => {
			if (result.isConfirmed) {
				$.ajax({
					url: "/admin/users/" + userId + "/deleteUser",
					method: 'DELETE',
					success: function (response) {
						Swal.fire("Deleted!", "User has been deleted.", "success").then(function () {
							userListTabel.ajax.reload(null, false);
						});
					},
					error: function (xhr) {
						toastr.error(xhr.responseJSON.message);
					}
				});
			}
		});
	});

	$('table').on('click', '#updateTransaction', function () {
		$("#editTransactionModal").modal('show');
	});
	// Transaction Page
	var transactionListTabel;

	function transactionListTabelDataBind() {
		if ($("#transaction_table").length > 0) {
			transactionListTabel = $("#transaction_table").DataTable({
				lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
				iDisplayLength: 10,
				bDestroy: true,
				dom: 'lfrtip',
				autoWidth: false,
				scrollX: true,
				processing: true,
				bSort: false,
				serverSide: true,
				language: {
					"loadingRecords": "&nbsp;",
					"processing": "Loading..."
				},
				serverMethod: 'POST',
				ajax: {
					url: "/admin/transaction/getALLTransaction",
					data: function (data) {
						var payment_status = $("#payment_status_filter").val();
						data.payment_status = payment_status;
					}
				},
				columns: [{
					data: "",
					defaultContent: "-"
				}, {
					data: null,
					defaultContent: "-",
					render: function (data) {
						if (data.user_id === null || data.user_id === '') {
							var type = "Guest User";
						} else {
							var type = "Logged in User"
						}
						return type;
					}
				},
				{
					data: null,
					defaultContent: "-",
					render: function (data) {
						return data.user_email;
					}
				}, {
					data: null,
					defaultContent: "-",
					render: function (data) {
						var gatewayData;
						if (data.transaction_history && data.transaction_history.getway) {
							var gateway = data.transaction_history.getway;
							gatewayData = gateway.substring(0, 1).toUpperCase() + gateway.substring(1);
						}
						return gatewayData;
					}
				}, {
					data: null,
					defaultContent: "-",
					render: function (data) {
						if (data.transaction_history && data.transaction_history.coinbase_id) {
							var id = data.transaction_history.coinbase_id;
						} else if (data.transaction_history && data.transaction_history.payment_id) {
							var id = data.transaction_history.payment_id;
						} else {
							var id = "-";
						}
						return id;
					}
				}, {
					data: "order_summary[0].apply_coupon_code",
					defaultContent: "-"
				}, {
					data: "order_summary[0].payment_amount",
					defaultContent: "-"
				}, {
					data: "order_summary[0].payment_status",
					defaultContent: "-",
				}, {
					data: null,
					defaultContent: "-",
					render: function (data, type, full, meta) {
						var pdf = { pdf_response: data.pdf_response, pdf_path: data.pdf_path }
						return JSON.stringify(pdf);
					}
				}, {
					data: "email_response",
					defaultContent: "-"
				}, {
					data: null,
					defaultContent: "-",
					render: function (data, type, full, meta) {
						var last_filled_data = data.last_filled_data;
						return JSON.stringify(last_filled_data);
					}
				}, {
					data: "form_name",
					defaultContent: "-"
				}, {
					data: null,
					defaultContent: "-",
					render: function (data, type, full, meta) {
						var newDate = moment.utc(data.updatedAt).toDate();
						var date = moment(newDate).format('YYYY/MM/DD hh:mm:ss A');
						return date;
					}
				}, {
					data: null,
					defaultContent: "-",
					render: function (data) {
						var editHTML = '<center>';
						editHTML += `<div className='d-flex'> 
                                            <button type="button" class="btn btn-sm btn-outline-danger" id="deleteTransaction" title="Delete" data-myval="${data._id}"><i class="fas fa-trash"></i></button>
                                        </div>`;
						return editHTML;
					}
				}],
				fnRowCallback: function (nRow, aData, iDisplayIndex) {
					var oSettings = transactionListTabel.settings()[0];
					$("td:first", nRow).html(oSettings._iDisplayStart + iDisplayIndex + 1);
					nRow.id = aData.id;
					return nRow;
				},
			});
			$('.dataTables_filter').hide();
			$('.dataTables_length').hide();
		}
		if ($("#draft_transaction_table").length > 0) {
			transactionListTabel = $("#draft_transaction_table").DataTable({
				lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
				iDisplayLength: 10,
				bDestroy: true,
				dom: 'lfrtip',
				autoWidth: false,
				scrollX: true,
				processing: true,
				bSort: false,
				serverSide: true,
				language: {
					"loadingRecords": "&nbsp;",
					"processing": "Loading..."
				},
				serverMethod: 'POST',
				ajax: {
					url: "/admin/transaction/getAllDraftTransaction",
					data: function (data) {
						var payment_status = $("#payment_status_filter").val();
						data.payment_status = payment_status;
					}
				},
				columns: [{
					data: "",
					defaultContent: "-"
				}, {
					data: null,
					defaultContent: "-",
					render: function (data, type, full, meta) {
						var newDate = moment.utc(data.updatedAt).toDate();
						var date = moment(newDate).format('YYYY/MM/DD hh:mm:ss A');
						return date;
					}
				}, {
					data: "form_name",
					defaultContent: "-"
				}, {
					data: null,
					defaultContent: "-",
					render: function (data) {
						if (data.user_id === null || data.user_id === '') {
							var type = "Guest User";
						} else {
							var type = "Logged in User"
						}
						return type;
					}
				},
				{
					data: null,
					defaultContent: "-",
					render: function (data) {
						return data.user_email;
					}
				}, {
					data: null,
					defaultContent: "-",
					render: function (data) {
						return data.progress_number;
					}
				}, {
					data: null,
					defaultContent: "-",
					render: function (data) {
						var gatewayData;
						if (data.transaction_history && data.transaction_history.getway) {
							var gateway = data.transaction_history.getway;
							gatewayData = gateway.substring(0, 1).toUpperCase() + gateway.substring(1);
						}
						return gatewayData;
					}
				}, {
					data: null,
					defaultContent: "-",
					render: function (data) {
						if (data.transaction_history && data.transaction_history.coinbase_id) {
							var id = data.transaction_history.coinbase_id;
						} else if (data.transaction_history && data.transaction_history.payment_id) {
							var id = data.transaction_history.payment_id;
						} else {
							var id = "-";
						}
						return id;
					}
				}, {
					data: "order_summary[0].apply_coupon_code",
					defaultContent: "-"
				}, {
					data: "order_summary[0].payment_amount",
					defaultContent: "-"
				}, {
					data: "email_response",
					defaultContent: "-"
				}, {
					data: null,
					defaultContent: "-",
					render: function (data, type, full, meta) {
						var last_filled_data = data.last_filled_data;
						return JSON.stringify(last_filled_data);
					}
				}, {
					data: null,
					defaultContent: "-",
					render: function (data) {
						var editHTML = '<center>';
						editHTML += `<div className='d-flex'> 
                                            <button type="button" class="btn btn-sm btn-outline-danger" id="deleteTransaction" title="Delete" data-myval="${data._id}"><i class="fas fa-trash"></i></button>
                                        </div>`;
						return editHTML;
					}
				}],
				fnRowCallback: function (nRow, aData, iDisplayIndex) {
					var oSettings = transactionListTabel.settings()[0];
					$("td:first", nRow).html(oSettings._iDisplayStart + iDisplayIndex + 1);
					nRow.id = aData.id;
					return nRow;
				},
			});
			$('.dataTables_filter').hide();
			$('.dataTables_length').hide();
		}
	}

	transactionListTabelDataBind();

	$(document).on('click', '#apply_filter', function (e) {
		transactionListTabel.ajax.reload();
		$('#filterSection').toggle();
	})

	$(document).on('click', '#clear_filter', function (e) {
		const select = document.getElementById('payment_status_filter');
		select.value = '';
		transactionListTabel.ajax.reload();
		$('#filterSection').toggle();
	})

	$('#custom_search').on('keyup', function () {
		transactionListTabel.search(this.value).draw();
	});

	$('#custom_entries').on('change', function () {
		transactionListTabel.page.len($(this).val()).draw();
	});

	$(document).on('click', '#filterButton', function (e) {
		$('#filterSection').toggle();
	});

	$(document).on('click', '#deleteTransaction', function (e) {
		var transactionId = $(this).data('myval');
		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, delete it!'
		}).then((result) => {
			if (result.isConfirmed) {
				$.ajax({
					url: "/admin/transaction/" + transactionId + "/deleteTransaction",
					method: 'DELETE',
					success: function (response) {
						console.log('text');
						Swal.fire("Deleted!", "User has been deleted.", "success").then(function () {
							transactionListTabel.ajax.reload(null, false);
						});
					},
					error: function (xhr) {
						toastr.error(xhr.responseJSON.message);
					}
				});
			}
		});
	});

	// $(document).on('change', '#payment_status_filter', function() {
	//   var selectedPaymentStatus = $(this).val();
	//   $.ajax({
	//     url: "/admin/transaction/getTransactionByPaymentStatus",
	//     method: 'POST',
	//     data: { paymentStatus: selectedPaymentStatus },
	//     success: function (response) {
	//       // console.log(paymentStatus)
	//       // handle the response here
	//       // for example, update the datatable with the filtered data
	//       transactionListTabel .clear().draw();
	//       transactionListTabel .rows.add(response.data).draw();
	//       console.log(response.data)
	//     },
	//     error: function (xhr) {
	//       toastr.error(xhr.responseJSON.message);
	//     }
	//   });
	// });

	// Blog Page
	var blogListTabel;

	function blogListTabelDataBind() {
		if ($("#blog_table").length > 0) {
			blogListTabel = $("#blog_table").DataTable({
				lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
				iDisplayLength: 10,
				bDestroy: true,
				dom: 'lfrtip',
				autoWidth: false,
				scrollX: true,
				processing: true,
				bSort: false,
				serverSide: true,
				language: {
					"loadingRecords": "&nbsp;",
					"processing": "Loading..."
				},
				serverMethod: 'POST',
				ajax: {
					"url": "/admin/blog/find"
				},
				columns: [{
					data: "",
					defaultContent: "-"
				}, {
					data: null,
					defaultContent: "-",
					render: function (data) {
						var html = `<img src="${data.image}" style="width: 100px;" class="mb-3" id="preview_image" alt="Blog Image" />`;

						return html;
					}
				}, {
					data: null,
					defaultContent: "-",
					render: function (data) {
						return data.category;
					}
				}, {
					data: null,
					defaultContent: "-",
					render: function (data) {
						return data.title;
					}
				}, {
					data: null,
					defaultContent: "-",
					render: function (data) {
						return data.content;
					}
				}, {
					data: null,
					defaultContent: "-",
					render: function (data, type, row, meta) {
						var editHTML = '<center>';
						editHTML += `<div className='d-flex'> 
                                                <button type="button" class="btn btn-sm btn-outline-success" id="updateBlog" title="Update Blog" data-myval="${data._id}"><i class="fas fa-edit"></i></button>
                                                <button type="button" class="btn btn-sm btn-outline-danger" id="deleteBlog" title="Delete Blog" data-myval="${data._id}"><i class="fas fa-trash"></i></button>
                                            </div>`;
						return editHTML;
					}
				}],
				fnRowCallback: function (nRow, aData, iDisplayIndex) {
					var oSettings = blogListTabel.settings()[0];
					$("td:first", nRow).html(oSettings._iDisplayStart + iDisplayIndex + 1);
					nRow.id = aData.id;
					return nRow;
				}
			})
		}
	}
	blogListTabelDataBind();

	$(".blog-wrape .drop_box button").on("click", function () {
		$(this).closest(".blog-wrape").find(".drop_box").find("input").trigger("click");
	});

	if ($("textarea#addContent").length > 0) {
		tinymce.init({
			selector: 'textarea#addContent',
			plugins: 'autoresize',
		});
	}

	if ($("textarea#editContent").length > 0) {
		tinymce.init({
			selector: 'textarea#editContent',
			plugins: 'autoresize',
		});
	}

	$(".blog-wrape input[type=file]").change(function () {
		var $this = $(this);
		var file = $this.get(0).files[0];
		if (file) {
			var reader = new FileReader();

			reader.onload = function () {
				$this.closest(".drop_box").find(".preview_image").attr("src", reader.result);
				$this.closest(".drop_box").find(".preview_image").show();
				$this.closest(".drop_box").find(".blog-text").hide();
			}
			reader.readAsDataURL(file);
			const sendingData = new FormData();
			sendingData.set("type", "IMAGE");
			sendingData.set("form_name", "Blog");
			sendingData.set("file", file);


			$.ajax({
				url: "/admin/blog/upload/image",
				method: "POST",
				data: sendingData,
				processData: false,
				contentType: false,
				async: true,
				success: function (result) {
					if (result.success == true) {
						$this.closest(".blog-wrape").find(".imagePath").val(result.data.publicPath);
					} else {
						toastr.error(result.message);
					}
				},
				error: function (err) {
					toastr.error(err.responseJSON?.message || "something went wrong.");
				}
			});

		}
	});

	$(document).on('change', '#addCategory, #editCategory', function () {
		var val = $(this).val();
		if (val == 'custom') {
			$(this).closest('.blog-wrape').find(".custom_category").show();
		} else {
			$(this).closest('.blog-wrape').find(".custom_category").hide();
			$(this).closest('.blog-wrape').find(".custom_category input").val('');
		}
	});

	$(document).on('click', '#addBlog', function (e) {
		e.preventDefault();

		let category = $("#addCategory").val();
		let categoryValue = '';
		if (category == 'custom') {
			var custom_category = $("#addcustom_category").val();
			if (!custom_category || custom_category === "") {
				toastr.error('Please add blog category.', '', { timeOut: 1000 });
				return;
			} else {
				categoryValue = custom_category;
			}
		} else {
			categoryValue = category;
		}


		let blog_image = $("#addImagePath").val().trim();
		if (!blog_image || blog_image === "") {
			toastr.error('Please select blog image.', '', { timeOut: 1000 });
			return;
		}

		let title = $("#addtitle").val().trim();
		if (!title || title === "") {
			toastr.error('Please add title.', '', { timeOut: 1000 });
			return;
		}

		var content = tinymce.get("addContent").getContent();
		if (!content || content === "") {
			toastr.error('Please add blog content.', '', { timeOut: 1000 });
			return;
		}

		var slug = title.replace(/[^a-zA-Z ]/g, '').replace(/ /g, '-').toLowerCase();
		var data = {
			title: title,
			category: categoryValue,
			content: content,
			image: blog_image,
			slug: slug
		}

		$.ajax({
			url: '/admin/blog/blog_create',
			type: 'POST',
			data: data,
			success: function () {
				toastr.success('Blog Added Successfully.');
				$('#addNewBlogModal').modal('toggle');
				blogListTabel.ajax.reload(null, false);
				$('#addBlogForm')[0].reset()
			},
			error: function (xhr) {
				toastr.error(xhr.responseJSON.message, '', 1500);
			}
		});
	});

	$('table').on('click', '#updateBlog', function () {
		var rowElement = $(this).closest('tr');
		var blogData = blogListTabel.row(rowElement).data();
		var getImage = blogData['image'];
		if (getImage) {
			$("#editImagePath").val(getImage);
			$("#editBlogForm").find(".preview_image").attr("src", getImage);
			$("#editBlogForm").find(".preview_image").show();
			$("#editBlogForm").find(".blog-text").hide();
		}

		var getCategory = blogData['category'];
		var optionExists = $("#editCategory option[value='" + getCategory + "']").length > 0;

		if (optionExists) {
			$("#editCategory").val(getCategory);
			$("#editcustom_category").val('');
			$("#editcustom_category").closest(".custom_category").hide();
		} else {
			$("#editCategory").val('custom');
			$("#editcustom_category").val(getCategory);
			$("#editcustom_category").closest(".custom_category").show();
		}

		var getTitle = blogData['title'];
		$("#edittitle").val(getTitle);


		var getContent = blogData['fullContent'];
		tinyMCE.get('editContent').setContent(getContent);

		var blogId = $(this).data('myval');
		$("#blog_id").val(blogId);

		$("#editBlogModal").modal('show');
	});

	$("#editBlogModal").submit(async function (e) {
		e.preventDefault();
		var blogId = $("#blog_id").val();

		e.preventDefault();

		let category = $("#editCategory").val();
		let categoryValue = '';
		if (category == 'custom') {
			var custom_category = $("#editcustom_category").val().trim();
			if (!custom_category || custom_category === "") {
				toastr.error('Please add blog category.', '', { timeOut: 1000 });
				return;
			} else {
				categoryValue = custom_category;
			}
		} else {
			categoryValue = category;
		}

		let blog_image = $("#editImagePath").val().trim();
		if (!blog_image || blog_image === "") {
			toastr.error('Please select blog image.', '', { timeOut: 1000 });
			return;
		}

		let title = $("#edittitle").val().trim();
		if (!title || title === "") {
			toastr.error('Please add blog title.', '', { timeOut: 1000 });
			return;
		}

		var content = tinymce.get("editContent").getContent();
		if (!content || content === "") {
			toastr.error('Please add blog content.', '', { timeOut: 1000 });
			return;
		}

		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, edit it!'
		}).then((result) => {
			if (result.isConfirmed) {
				var slug = title.replace(/[^a-zA-Z ]/g, '').replace(/ /g, '-').toLowerCase();
				var data = {
					title: title,
					category: categoryValue,
					content: content,
					image: blog_image,
					slug: slug
				}
				$.ajax({
					url: '/admin/blog/update/' + blogId,
					method: 'PUT',
					data: data,
					success: function (response) {
						$("#editBlogModal").modal('hide');
						blogListTabel.ajax.reload(null, false);
						toastr.success('Your blog data has been changed.');
					},
					error: function (xhr) {
						toastr.error(xhr.responseJSON.message);
					}
				});
			}
		});
	});

	$('table').on('click', '#deleteBlog', function () {
		var blogId = $(this).data('myval');
		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, delete it!'
		}).then((result) => {
			if (result.isConfirmed) {
				$.ajax({
					url: '/admin/blog/delete/' + blogId,
					method: 'DELETE',
					success: function (response) {
						Swal.fire("Deleted!", "Your blog has been deleted.", "success").then(function () {
							blogListTabel.ajax.reload(null, false);
						});
					},
					error: function (xhr) {
						toastr.error(xhr.responseJSON.message);
					}
				});
			}
		});
	});

	// Email Discount Page
	var mailDiscountListTabel;

	function mailDiscountListTabelDataBind() {
		if ($("#mailDiscount_table").length > 0) {
			mailDiscountListTabel = $("#mailDiscount_table").DataTable({
				lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
				iDisplayLength: 10,
				bDestroy: true,
				dom: 'lfrtip',
				autoWidth: false,
				scrollX: true,
				processing: true,
				bSort: false,
				serverSide: true,
				language: {
					"loadingRecords": "&nbsp;",
					"processing": "Loading..."
				},
				serverMethod: 'POST',
				ajax: {
					"url": "/admin/mailDiscount/find"
				},
				columns: [{
					data: null,
					defaultContent: "-",
					render: function (data) {
						return data.email;
					}
				}, {
					data: null,
					defaultContent: "-",
					render: function (data) {
						return (data.couponDetails && data.couponDetails[0]) ? data.couponDetails[0]['code'] : '';
					}
				}, {
					data: null,
					defaultContent: "-",
					render: function (data) {
						return (data.couponDetails && data.couponDetails[0]) ? data.couponDetails[0]['discounts_Percentage'] + "%" : '';
					}
				}, {
					data: null,
					defaultContent: "-",
					render: function (data) {
						return data.limit;
					}
				}, {
					data: null,
					defaultContent: "-",
					render: function (data) {
						return data.email_response;
					}
				}, {
					data: null,
					defaultContent: "-",
					render: function (data, type, row, meta) {
						var editHTML = '<center>';
						editHTML += `<div className='d-flex'> 
                                                <button type="button" class="btn btn-sm btn-outline-primary" id="sendMail" title="Send mail" data-myval="${data._id}" ${(data.subscribe) ? '' : 'disabled'}><i class="fas fa-paper-plane"></i></button>
                                                <button type="button" class="btn btn-sm btn-outline-success" id="updateMailDiscount" title="Update mail discount" data-myval="${data._id}"><i class="fas fa-edit"></i></button>
                                                <button type="button" class="btn btn-sm btn-outline-danger" id="deleteMailDiscount" title="Delete mail discount" data-myval="${data._id}"><i class="fas fa-trash"></i></button>
                                            </div>`;
						return editHTML;
					}
				}],
			})
		}
	}
	mailDiscountListTabelDataBind();

	$(document).on('click', '#addMailDiscount', function (e) {
		e.preventDefault();

		let email = $("#addEmail").val().trim();
		if (!email || email === "") {
			toastr.error('Please enter email.', '', { timeOut: 1000 });
			return;
		} else {
			var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
			if (!emailReg.test(email)) {
				toastr.error('Please enter valid email.', '', { timeOut: 1000 });
				return;
			}
		}

		let coupon = $("#addcoupon").val().trim();
		if (!coupon || coupon === "") {
			toastr.error('Please select coupon.', '', { timeOut: 1000 });
			return;
		}

		let limit = $("#addLimit").val().trim();
		if (!limit || limit === "") {
			toastr.error('Please enter coupon used limit.', '', { timeOut: 1000 });
			return;
		}


		var data = {
			email: email,
			coupon: coupon,
			limit: limit
		}

		$.ajax({
			url: '/admin/mailDiscount/create',
			type: 'POST',
			data: data,
			success: function () {
				toastr.success('Discount Added Successfully.');
				$('#addNewMailDiscountModal').modal('toggle');
				mailDiscountListTabel.ajax.reload(null, false);
				$('#addMailDiscountForm')[0].reset()
			},
			error: function (xhr) {
				toastr.error(xhr.responseJSON.message, '', 1500);
			}
		});
	});

	$('table').on('click', '#updateMailDiscount', function () {
		var rowElement = $(this).closest('tr');

		var getEmail = rowElement.find('td:eq(0)').text();
		$("#editEmail").val(getEmail);

		var getCoupon = rowElement.find('td:eq(1)').text();
		$("#editcoupon option").filter(function () {
			return this.text == getCoupon;
		}).attr('selected', true);

		var getLimit = rowElement.find('td:eq(3)').text();
		$("#editLimit").val(getLimit);

		var discountId = $(this).data('myval');
		$("#discount_id").val(discountId);

		$("#editEmailDiscountModal").modal('show');
	});

	$("#editEmailDiscountForm").submit(async function (e) {
		e.preventDefault();
		var discountId = $("#discount_id").val();

		e.preventDefault();


		let email = $("#editEmail").val().trim();
		if (!email || email === "") {
			toastr.error('Please enter email.', '', { timeOut: 1000 });
			return;
		} else {
			var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
			if (!emailReg.test(email)) {
				toastr.error('Please enter valid email.', '', { timeOut: 1000 });
				return;
			}
		}

		let coupon = $("#editcoupon").val();
		if (!coupon || coupon === "") {
			toastr.error('Please select coupon.', '', { timeOut: 1000 });
			return;
		}

		let limit = $("#editLimit").val();
		if (!limit || limit === "") {
			toastr.error('Please enter coupon used limit.', '', { timeOut: 1000 });
			return;
		}

		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, edit it!'
		}).then((result) => {
			if (result.isConfirmed) {
				var data = {
					email: email,
					coupon: coupon,
					limit: limit
				}
				$.ajax({
					url: '/admin/mailDiscount/update/' + discountId,
					method: 'PUT',
					data: data,
					success: function (response) {
						$("#editEmailDiscountModal").modal('hide');
						mailDiscountListTabel.ajax.reload(null, false);
						toastr.success('Your mail discount has been changed.');
					},
					error: function (xhr) {
						toastr.error(xhr.responseJSON.message);
					}
				});
			}
		});
	});

	$('table').on('click', '#deleteMailDiscount', function () {
		var discontId = $(this).data('myval');
		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, delete it!'
		}).then((result) => {
			if (result.isConfirmed) {
				$.ajax({
					url: '/admin/mailDiscount/delete/' + discontId,
					method: 'DELETE',
					success: function (response) {
						Swal.fire("Deleted!", "Your mail discount has been deleted.", "success").then(function () {
							mailDiscountListTabel.ajax.reload(null, false);
						});
					},
					error: function (xhr) {
						toastr.error(xhr.responseJSON.message);
					}
				});
			}
		});
	});

	$('table').on('click', '#sendMail', function () {
		var discontId = $(this).data('myval');
		$.ajax({
			url: '/admin/mailDiscount/send/' + discontId,
			method: 'POST',
			success: function (response) {
				Swal.fire({
					title: "Successfully mail sent!",
					icon: "success",
					confirmButtonColor: "#3085d6",
				}).then((result) => {
					if (result.isConfirmed) {
						mailDiscountListTabel.ajax.reload(null, false);
					}
				})
			},
			error: function (xhr) {
				toastr.error(xhr.responseJSON.message);
			}
		});
	});

	// Email Discount Page
	var reviewListTabel;

	function reviewListTabelDataBind() {
		if ($("#review_table").length > 0) {
			reviewListTabel = $("#review_table").DataTable({
				lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
				iDisplayLength: 10,
				bDestroy: true,
				dom: 'lfrtip',
				autoWidth: false,
				scrollX: true,
				processing: true,
				bSort: false,
				serverSide: true,
				language: {
					"loadingRecords": "&nbsp;",
					"processing": "Loading..."
				},
				serverMethod: 'POST',
				ajax: {
					"url": "/admin/review/find"
				},
				columns: [{
					data: "",
					defaultContent: "-"
				}, {
					data: null,
					defaultContent: "-",
					render: function (data) {
						return data.fname + ' ' + data.lname;
					}
				}, {
					data: null,
					defaultContent: "-",
					render: function (data) {
						return data.content;
					}
				}, {
					data: null,
					defaultContent: "-",
					render: function (data) {
						return moment(data.createdAt).format('MM-DD-YYYY');
					}
				}, {
					data: null,
					defaultContent: "-",
					render: function (data, type, row, meta) {
						var status;
						var icon;
						if (data.status === false) {
							status = true;
							icon = '<i class="fas fa-lock"></i>';
						} else {
							status = false;
							icon = '<i class="fas fa-lock-open"></i>';
						}

						var selfBtn;
						if (data.self === false) {
							selfBtn = '<button type="button" class="btn btn-sm btn-outline-primary" id="selfUser" title="User" disabled><i class="fas fa-user-large-slash"></i></button>';
						} else {
							selfBtn = '<button type="button" class="btn btn-sm btn-outline-secondary" id="selfUser" title="Self User" disabled><i class="fas fa-user-large"></i></button>';
						}
						var editHTML = '<center>';
						editHTML += `<div className='d-flex'> 
                                            ${selfBtn}
                                            <button type="button" class="btn btn-sm btn-outline-success" id="updateReviewStatus" title="Update Approve" data-status=${status} data-myval="${data._id}">${icon}</button>
                                            <button type="button" class="btn btn-sm btn-outline-danger" id="deleteReview" title="Delete Review" data-myval="${data._id}"><i class="fas fa-trash"></i></button>
                                        </div>`;
						return editHTML;
					}
				}],
				fnRowCallback: function (nRow, aData, iDisplayIndex) {
					var oSettings = reviewListTabel.settings()[0];
					$("td:first", nRow).html(oSettings._iDisplayStart + iDisplayIndex + 1);
					nRow.id = aData.id;
					return nRow;
				}
			})
		}
	}
	reviewListTabelDataBind();

	$(document).on('click', '#addReviews', function (e) {
		e.preventDefault();

		let fname = $("#addFname").val().trim();
		if (!fname || fname === "") {
			toastr.error('Please enter first name.', '', { timeOut: 1000 });
			return;
		}

		let lname = $("#addLname").val().trim();
		if (!lname || lname === "") {
			toastr.error('Please enter last name.', '', { timeOut: 1000 });
			return;
		}

		let content = $("#addReview").val().trim();
		if (!content || content === "") {
			toastr.error('Please enter content.', '', { timeOut: 1000 });
			return;
		}


		var data = {
			fname: fname,
			lname: lname,
			content: content,
			self: true
		}

		$.ajax({
			url: '/admin/review/create',
			type: 'POST',
			data: data,
			success: function () {
				toastr.success('Review Added Successfully.');
				$('#addNewReviewModal').modal('toggle');
				reviewListTabel.ajax.reload(null, false);
				$('#addReviewForm')[0].reset()
			},
			error: function (xhr) {
				toastr.error(xhr.responseJSON.message, '', 1500);
			}
		});
	});

	$('table').on('click', '#deleteReview', function () {
		var id = $(this).data('myval');
		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, delete it!'
		}).then((result) => {
			if (result.isConfirmed) {
				$.ajax({
					url: '/admin/review/delete/' + id,
					method: 'DELETE',
					success: function (response) {
						Swal.fire("Deleted!", "Review has been deleted.", "success").then(function () {
							reviewListTabel.ajax.reload(null, false);
						});
					},
					error: function (xhr) {
						toastr.error(xhr.responseJSON.message);
					}
				});
			}
		});
	});

	$('table').on('click', '#updateReviewStatus', function () {
		var id = $(this).data('myval');
		var status = $(this).data('status');
		let data = { status: status }
		var text;
		if (status == true) {
			text = "Review is Approved";
		} else {
			text = "Review is Reject";
		}
		Swal.fire({
			title: 'Are you sure?',
			text: text,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, edit it!'
		}).then((result) => {
			if (result.isConfirmed) {
				$.ajax({
					url: '/admin/review/update/' + id,
					method: 'PUT',
					data: data,
					success: function (response) {
						reviewListTabel.ajax.reload(null, false);
					},
					error: function (xhr) {
						toastr.error(xhr.responseJSON.message);
					}
				});
			}
		});
	});


});
