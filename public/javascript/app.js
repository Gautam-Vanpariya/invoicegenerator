toastr.options = { closeButton: !0, progressBar: !0, newestOnTop: !0 };
var zn = moment.tz.guess(!0);
zos = (new Date).getTimezoneOffset(), za = moment.tz(zn).zoneAbbr(zos);
$("body").attr("data-zone", JSON.stringify({ name: zn, offset: zos, abbr: za }));

function showAuthForm(stateName) {
    $("#authForm .form_block").hide();
    if (stateName == "Login") {
        $("#login_block").show();
    } else if (stateName == "Register") {
        $("#signup_block").show();
    } else if (stateName == "Forgot") {
        $("#forgot_block").show();
    } else if (stateName == "Reset") {
        $("#reset_block").show();
    }
    $("#authForm").modal("show");
}

//  // TRIGGER LOGIN MODEL
//  $('#saveProgressAfterLogin, #checkoutAfterLogin').click(function() {
//     $(this).closest(".modal").hide();
//     showAuthForm('Login');
//  });

// INPUT MASKING
$(".imask_d4").inputmask({ "mask": "XXX-XX-9999", "greedy": false });
$(".imask_d10").inputmask({ "mask": "9", "repeat": 10, "greedy": false });
$(".imask_d9").inputmask({ "mask": "(999) 999 999", "greedy": false });
$(".imask_d11").inputmask({ "mask": "9-999-999-9999", "greedy": false });
$(".imask_d6").inputmask({ "mask": "9", "repeat": 6, "greedy": false });
$(".imask_ssn").inputmask({ "mask": "999-99-9999", "greedy": false });
$(".imask_ein").inputmask({ "mask": "99-9999999", "greedy": false });
$(".imask_a30").inputmask({ "mask": "9", "repeat": 6, "greedy": false });
$(".imask_currency").inputmask({ "alias": "numeric", "groupSeparator": ",", "digits": 2, "digitsOptional": false, "placeholder": "0" });


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
$('#login_form').submit(function (e) {
    e.preventDefault();
    $("#show_modal_loader").fadeIn();
    console.log("FORM IS VALID :::>", $("#login_form").valid());
    if ($('#login_form').valid()) {
        $("#login_sbtn").attr("disabled", true);
        const sendingData = {
            "email": $("#l_email").val().trim(),
            "password": $("#l_password").val().trim()
        };
        $.ajax({
            url: "/auth/login",
            method: "POST",
            data: sendingData,
            success: function (result) {
                $("#login_sbtn").attr("disabled", false);
                if (result.success == true) {
                    var form_data = localStorage.getItem("formData");
                    var value = localStorage.getItem("value");
                    if (form_data) {
                        $("#user_id").val(result.data._id);
                        if (value == "save") {
                            $("#save_draft").trigger("click");
                        } else if (value == "checkout") {
                            $("#checkOut").trigger("click");
                            localStorage.setItem("login_checkout", "checkout");
                            //window.location.reload();
                        }
                    } else {
                        window.location.reload();
                    }

                } else {
                    toastr.error(result.message);
                }
                //$("#show_modal_loader").fadeOut();
            },
            error: function (err) {
                $("#login_sbtn").attr("disabled", false);
                toastr.error(err.responseJSON?.message || "something went wrong.");
                $("#show_modal_loader").fadeOut();
            }
        });
    } else {
        $("#login_sbtn").attr("disabled", false);
        $("#show_modal_loader").fadeOut();
    }
});

// SIGN-UP FORM SUBMIT
$('#signup_form').validate({
    rules: {
        s_userName: {
            required: true,
            minlength: 1,
            maxlength: 50
        },
        s_email: {
            required: true,
            email: true,
            emailValidation: true
        },
        s_password: {
            required: true,
            minlength: 6,
            maxlength: 50,
        },
        s_confirmPassword: {
            required: true,
            equalTo: "#s_password",
            minlength: 6,
            maxlength: 50
        },
    },
    errorPlacement: function (error, element) {
        if (element.hasClass("custom__error")) {
            $(element).closest('.error__pblock').find(".error_label").append(error);
        } else {
            error.insertAfter(element);
        }
    }
});

$('#signup_form').submit(function (e) {
    e.preventDefault();
    $("#show_modal_loader").fadeIn();
    console.log("FORM IS VALID :::>", $("#signup_form").valid());
    if ($('#signup_form').valid()) {
        $("#signup_sbtn").attr("disabled", true);
        const sendingData = {
            "user_name": $("#s_userName").val().trim(),
            "email": $("#s_email").val().trim(),
            "password": $("#s_password").val().trim(),
            "confirm_password": $("#s_confirmPassword").val().trim()
        };
        $.ajax({
            url: "/auth/register",
            method: "POST",
            data: sendingData,
            success: function (result) {
                $("#signup_sbtn").attr("disabled", false);
                if (result.success == true) {
                    toastr.success(result.message);
                    showAuthForm('Login');
                } else {
                    toastr.error(result.message);
                }
                $("#show_modal_loader").fadeOut();
            },
            error: function (err) {
                $("#signup_sbtn").attr("disabled", false);
                toastr.error(err.responseJSON?.message || "something went wrong.");
                $("#show_modal_loader").fadeOut();
            }
        });
    } else {
        $("#signup_sbtn").attr("disabled", false);
        $("#show_modal_loader").fadeOut();
    }
});

// FORGOT FORM SUBMIT
$('#forgot_form').validate({
    rules: {
        r_email: {
            required: true,
            email: true,
            emailValidation: true
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

$('#forgot_form').submit(function (e) {
    e.preventDefault();
    $("#show_modal_loader").fadeIn();
    console.log("FORM IS VALID :::>", $("#forgot_form").valid());
    if ($('#forgot_form').valid()) {
        $("#forgot_sbtn").attr("disabled", true);
        const sendingData = {
            "email": $("#f_email").val().trim()
        };
        $.ajax({
            url: "/auth/forgot",
            method: "POST",
            data: sendingData,
            success: function (result) {
                $("#forgot_sbtn").attr("disabled", false);
                if (result.success == true) {
                    toastr.success(result.message);
                    showAuthForm('Reset');
                } else {
                    toastr.error(result.message);
                }
                $("#show_modal_loader").fadeOut();
            },
            error: function (err) {
                $("#forgot_sbtn").attr("disabled", false);
                toastr.error(err.responseJSON?.message || "something went wrong.");
                $("#show_modal_loader").fadeOut();
            }
        });
    } else {
        $("#forgot_sbtn").attr("disabled", false);
        $("#show_modal_loader").fadeOut();
    }
});

// RE FORM SUBMIT
$('#reset_form').validate({
    rules: {
        r_otp: {
            required: true,
            minlength: 6
        },
        r_password: {
            required: true,
            minlength: 6,
            maxlength: 50,
        },
        r_confirmPassword: {
            required: true,
            equalTo: "#r_password",
            minlength: 6,
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

$('#reset_form').submit(function (e) {
    e.preventDefault();
    $("#show_modal_loader").fadeIn();
    console.log("FORM IS VALID :::>", $("#reset_form").valid());
    if ($('#reset_form').valid()) {
        $("#reset_sbtn").attr("disabled", true);
        const sendingData = {
            "otp": $("#r_otp").val().trim(),
            "new_password": $("#r_password").val().trim(),
            "confirm_password": $("#r_confirmPassword").val().trim()
        };
        $.ajax({
            url: "/auth/reset",
            method: "POST",
            data: sendingData,
            success: function (result) {
                $("#reset_sbtn").attr("disabled", false);
                if (result.success == true) {
                    toastr.success(result.message);
                    showAuthForm('Login');
                } else {
                    toastr.error(result.message);
                    $("#show_modal_loader").fadeOut();
                }
            },
            error: function (err) {
                $("#reset_sbtn").attr("disabled", false);
                toastr.error(err.responseJSON?.message || "something went wrong.");
                $("#show_modal_loader").fadeOut();
            }
        });
    } else {
        $("#reset_sbtn").attr("disabled", false);
        $("#show_modal_loader").fadeOut();
    }
});

/* Fetch Previous Progress Number */
$(document).on("click",".load_template",function(){
    if($("#user_id").val() === undefined || $("#user_id").val() === ''){
        $("#guestProgressNumberModal").modal('show');
        return;
    }

    var document_name = $(this).data("document");
    $.ajax({
        url: '/userProgress/fetchPreviousProgressNumber',
        method: 'POST',
        data: {form_name : document_name},
        success: function (response) {
            if(response.success){
                var data = response.data;
                var html ='';
                
                for(var i=0 ; i < data.length ; i++){
                    html += '<option value="'+data[i].progress_number+'">BG-'+data[i].progress_number+'</option>';
                }
                $("select[name='progress_number_option']").append(html);
                $("#previewModal").modal("show");
            }
        },
        error: function (xhr) {
            console.log(xhr);
        }
    });

});


$(document).ready(function () {
    // get current URL path and assign 'active' class
    var pathname = window.location.pathname;
    const segments = pathname.split('/');
    const firstSegment = '/' + segments[1];
    $('#navbarMain .navbar-nav li a').removeClass('active');
    $('#navbarMain .navbar-nav li a[href="' + firstSegment + '"]').addClass('active');
    if ($('#navbarMain .navbar-nav li a[href="' + firstSegment + '"]').hasClass('dropdown-item')) {
        $('#navbarMain .navbar-nav li a[href="' + firstSegment + '"]').closest('.dropdown').find('.nav-link').addClass('active')
    }

    $(".collapse").on('show.bs.collapse', function (e) {
        if ($(this).is(e.target) && this.id == 'navbarMain') {
            $('body').addClass('overflow-hidden');
            $('#toggle').addClass('on');
        }
    });

    $(".collapse").on('hide.bs.collapse', function (e) {
        if ($(this).is(e.target) && this.id == 'navbarMain') {
            $('body').removeClass('overflow-hidden');
            $('#toggle').removeClass('on');
        }
    });

    $("#navbarMain .navbar-nav li").on('click', function () {
        localStorage.removeItem('formData');
        localStorage.removeItem('progress_number_login');
        localStorage.removeItem('progress_number');
    });

    // show password input value
    $(".password-addon").on('click', function () {
        if ($(this).siblings('input').length > 0) {
            $(this).siblings('input').attr('type') == "password" ? $(this).siblings('input').attr('type', 'input') : $(this).siblings('input').attr('type', 'password');
        }
    });

    // Open Chat bot
    $("#chat_question").on('click', function () {
        window.$crisp.push(['do', 'chat:open'])
    });
});


// GUEST USER MODAL VALIDATION
$(document).ready(function () {
    $('#saveWithoutLogin').validate({
        rules: {
            guest_email: {
                required: true,
                email: true,
                emailValidation: true
            }
        },
        messages: {
            guest_email: {
                required: 'Please enter your email address',
                minlength: 'Email at least 2 characters',
                maxlength: 'Please enter between 2 and 50 characters',
            },
        },
        errorElement: "span",
        errorPlacement: function (error, element) {
            error.insertAfter(element);
        }
    });

    $('#guestProgressFrm').validate({
        rules: {
            guest_progress_number: {
                required: true,
            }
        },
        messages: {
            guest_progress_number: {
                required: 'Please enter progress number',
            },
        },
        errorElement: "span",
        errorPlacement: function (error, element) {
            error.insertAfter(element);
        }
    });

    $('#guestCheckOutFrm').validate({
        rules: {
            guestCheckOutEmail: {
                required: true,
                email: true,
                emailValidation: true
            },
        },
        messages: {
            guestCheckOutEmail: {
                required: 'Please enter your email address',
                minlength: 'Email at least 2 characters',
                maxlength: 'Please enter between 2 and 50 characters',
            },
        },
        errorElement: "span",
        errorPlacement: function (error, element) {
            error.insertAfter(element);
        }
    });
});


// PROGRESS NUMBER CHANGED EVENT
$(document).ready(function () {
    $("#progress_number_option").change(function () {
        var progress_number = $(this).val();
        if (progress_number) {
            $("#btn_load_data_login").prop('disabled', false);
        } else {
            $("#btn_load_data_login").prop('disabled', true);
        }
    });
})

// Blog categories
$(document).ready(function () {
    $("input[type=radio][name=blog_category]").change(function () {
        var val = $(this).val();
        if (val !== 'all') {
            window.location.href = '/blog?category=' + val;
            return false;
        }
        window.location.href = '/blog';
    });
})

$(document).ready(function () {
    // Review Slider
    $('.reviews-wrapper').slick({
        dots: false,
        infinite: true,
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2500,
        prevArrow: '<button class="slide-arrow prev-arrow left"><i class="fa fas fa-chevron-left"></i></button>',
        nextArrow: '<button class="slide-arrow next-arrow right"><i class="fa fas fa-chevron-right"></i></button>'
    });

    // Unscribe Modal
    function unsubscribeParameterURL(){
        const params = new URL(window.location).searchParams;
        const status =  params.get('status');        
        if(status == null || status == ''){
            return false;
        }else if(status == 'unsubscribe'){
            $("#authForm .form_block").hide();
            $("#unsubscribe_block").show();
            $("#authForm").modal("show");
            const url = new URL(window.location);
            url.searchParams.delete('status');
            window.history.pushState({}, '', url);
        }
    }
    unsubscribeParameterURL();

    $('#unsubscribe_form').validate({
        rules: {
            subscription_email: {
                required: true,
                email: true,
                emailValidation: true
            },
        },
        errorPlacement: function (error, element) {
            if (element.hasClass("custom__error")) {
                $(element).closest('.error__pblock').find(".error_label").append(error);
            } else {
                error.insertAfter(element);
            }
        }
    });

    $('#unsubscribe_form').submit(function (e) {
        e.preventDefault();
        $("#show_modal_loader").fadeIn();
        if ($('#unsubscribe_form').valid()) {
            $("#unsubscribeBtn").attr("disabled", true);
            const sendingData = {
                "email": $("#subscription_email").val().trim()
            };
            $.ajax({
                url: "/auth/unsubscription",
                method: "PUT",
                data: sendingData,
                success: function (result) {
                    console.log(result);
                    $("#unsubscribeBtn").attr("disabled", false);
                    if (result.success == true) {
                        toastr.success(result.message);
                    } else {
                        toastr.error(result.message);
                    }
                    $("#authForm").modal("hide");
                    $("#show_modal_loader").fadeOut();
                },
                error: function (err) {
                    $("#unsubscribeBtn").attr("disabled", false);
                    toastr.error(err.responseJSON?.message || "something went wrong.");
                    $("#show_modal_loader").fadeOut();
                }
            });
        } else {
            $("#unsubscribeBtn").attr("disabled", false);
            $("#show_modal_loader").fadeOut();
        }
    });
    
    $(".make_bill").click(function (event) {
        event.preventDefault();
        window.scrollTo({
            top:  $("#make_bill").offset().top,
            behavior: 'smooth',
        })
    });
});