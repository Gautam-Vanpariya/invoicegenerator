$(function(){

    $(document).on("click","#purchase_now",function(){
        var order_id = $("#order_id").val();
        var coupon = $("#coupon").val();
        var payment = $("#new_amount").val();
        if(payment <= 0){
            setTimeout(() => {
                window.location.href = '/application-success?order_id='+order_id+'&coupon='+coupon;
            },1000);
        }
    })
})