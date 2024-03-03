$(function(){
    const state = $("#state").attr("data-value");
    if(state) {
        $("#state option[value="+state+"]").prop("selected",true).trigger("change");
    }else{
        $("#state option:first").prop("selected",true).trigger("change");  
    }    

    $("#phone").inputmask({"mask": "(999) 999-9999"});
    $("#zipcode").inputmask({"mask": "9","repeat": 5,"greedy": false}); 

    $('#editUser').validate({
        rules: {
            user_name: {
                required: true,
                minlength: 2,
                maxlength: 50
            },
            phone: {
                phoneUS: true,
                minlength: 14,
                maxlength: 14
            },
            zipCode: {
                digits: true,
                minlength: 5,
                maxlength: 5
            },
        },
        messages: {
            user_name: {
                required: 'Please enter user name',
                minlength: 'Name at least 2 characters',
                maxlength: 'Please enter between 2 and 50 characters',
            },
            phone: {
                required: 'Please enter mobile number',
                minlength: 'Mobile number field accept only 14 digits',
                maxlength: 'Mobile number field accept only 14 digits',
            },
            phone: {
                required: 'Please enter mobile number',
                minlength: 'Mobile number field accept only 14 digits',
                maxlength: 'Mobile number field accept only 14 digits',
                phoneUS: "Please enter a valid US Phone number"
            },
            zipcode: {
                required: 'Please enter zipcode',
                digits: 'Zip code should be numbers only',
                minlength: 'Please enter a valid zipcode',
                maxlength: 'Please enter 5 characters',
            },            
        },
        errorElement: "span",
        errorPlacement: function(error, element) {
            error.insertAfter(element);
        }
    });

    $('.update-btn').click(function () {
        $(this).prop( "disabled", true );
        $("#editUser input[type='text'],select").prop("disabled", false);
        $("#save_profile").prop( "disabled", false );
    })   
    
    $('#save_profile').click(function (e) {
        $("#show_loader").fadeIn();
        if ($('#editUser').valid()) {
            $(this).attr('disabled');
            var user_id = $("#user_id").val();

            var data = {
                "user_name": $("#user_name").val().trim(),
                "first_name": $("#first_name").val().trim(),
                "last_name": $("#last_name").val().trim(),
                "phone": $("#phone").inputmask('unmaskedvalue'),
                "street_address1": $("#street_address1").val().trim(),
                "street_address2": $("#street_address2").val().trim(),
                "country": $("#country").val().trim(),
                "state": $("#state").val().trim(),
                "zipcode": $("#zipcode").val().trim()
            }
            $.ajax({
                url: '/users/update/'+ user_id,
                method: 'PATCH',
                data : data,
                success: function (response) {
                    if(response.success === true){
                        toastr.success(response.message);
                        var data = response.data;
                        $("#user_name").val(data.user_name);
                        $("#first_name").val(data.first_name);
                        $("#last_name").val(data.last_name);
                        $("#email").val(data.email);
                        $("#phone").val(data.phone);
                        $("#street_address1").val(data.street_address1);
                        $("#street_address2").val(data.street_address2);
                        $("#country").val(data.country);
                        $("#state").val(data.state);
                        $("#zipcode").val(data.zipcode);
                        $("#show_loader").fadeOut();
                    }else{
                        toastr.error(response.message);
                        $("#show_loader").fadeOut();
                    }
                },
                error: function (xhr) {
                    toastr.error(xhr.responseJSON.message);
                    $("#show_loader").fadeOut();
                }
            });
        }else{
            var fm = $("#editUser").validate();
            $("html").animate({
                scrollTop: $(fm.errorList[0].element).offset().top - 140
            }, 10);
            $("#show_loader").fadeOut();
        }
    })  
})