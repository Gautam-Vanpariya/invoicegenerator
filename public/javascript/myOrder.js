function getPageList(totalPages, page, maxLength) {
    if (maxLength < 5) throw "maxLength must be at least 5";

    function range(start, end) {
        return Array.from(Array(end - start + 1), (_, i) => i + start);
    }

    var sideWidth = maxLength < 9 ? 1 : 2;
    var leftWidth = (maxLength - sideWidth * 2 - 3) >> 1;
    var rightWidth = (maxLength - sideWidth * 2 - 2) >> 1;
    if (totalPages <= maxLength) {
        // no breaks in list
        return range(1, totalPages);
    }
    if (page <= maxLength - sideWidth - 1 - rightWidth) {
        // no break on left of page
        return range(1, maxLength - sideWidth - 1)
            .concat([0])
            .concat(range(totalPages - sideWidth + 1, totalPages));
    }
    if (page >= totalPages - sideWidth - 1 - rightWidth) {
        // no break on right of page
        return range(1, sideWidth)
            .concat([0])
            .concat(
                range(totalPages - sideWidth - 1 - rightWidth - leftWidth, totalPages)
            );
    }
    // Breaks on both sides
    return range(1, sideWidth)
        .concat([0])
        .concat(range(page - leftWidth, page + rightWidth))
        .concat([0])
        .concat(range(totalPages - sideWidth + 1, totalPages));
}

$(function () {
    // Number of items and limits the number of items per page
    var numberOfItems = $("#orderPanal .content").length;
    var limitPerPage = 1;
    // Total pages rounded upwards
    var totalPages = Math.ceil(numberOfItems / limitPerPage);
    // Number of buttons at the top, not counting prev/next,
    // but including the dotted buttons.
    // Must be at least 5:
    var paginationSize = 7;
    var currentPage;

    function showPage(whichPage) {
        if (whichPage < 1 || whichPage > totalPages) return false;
        currentPage = whichPage;
        $("#orderPanal .content")
            .hide()
            .slice((currentPage - 1) * limitPerPage, currentPage * limitPerPage)
            .show();
        // Replace the navigation items (not prev/next):
        $(".pagination li").slice(1, -1).remove();
        getPageList(totalPages, currentPage, paginationSize).forEach(item => {
            $("<li>")

                .addClass(
                    "page-item " +
                    (item ? "current-page " : "") +
                    (item === currentPage ? "active " : "")
                )
                .append(
                    $("<a>")
                        .addClass("page-link")
                        .attr({
                            href: "javascript:void(0)"
                        })
                        .text(item || "...")
                )
                .insertBefore("#next-page");

        });
        return true;
    }

    // Include the prev/next buttons:
    $(".pagination").append(
        $("<li>").addClass("page-item").attr({ id: "previous-page" }).append(
            $("<a>")
                .addClass("page-link")
                .attr({
                    href: "javascript:void(0)"
                })
                .text("Prev")
        ),
        $("<li>").addClass("page-item").attr({ id: "next-page" }).append(
            $("<a>")
                .addClass("page-link")
                .attr({
                    href: "javascript:void(0)"
                })
                .text("Next")
        )
    );
    // Show the page links
    $("#orderPanal").show();
    showPage(1);

    // Use event delegation, as these items are recreated later
    $(document).on("click", ".pagination li.current-page:not(.active)", function () {
        return showPage(+$(this).text());
    });
    $("#next-page").on("click", function () {
        return showPage(currentPage + 1);
    });

    $("#previous-page").on("click", function () {
        return showPage(currentPage - 1);
    });
    $(".pagination").on("click", function () {
        //$("html,body").animate({ scrollTop: 0 }, 0);
        var elmnt = document.getElementsByClassName("myorder_section");
        elmnt[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
});

$(function() {
    $('input[name="start_date"], input[name="end_date"]').daterangepicker({
        locale: {
            format: 'DD/MM/YYYY'
        },
        cancelButtonClasses: 'd-none',
        showButtonPanel: false,
        singleDatePicker: true,
        autoUpdateInput: false,
        showDropdowns: true,
        minYear: 2000,
        maxYear: parseInt(moment().format('YYYY'),10),
        maxDate: new Date()
    });

    $('input[name="start_date"], input[name="end_date"]').on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format('DD/MM/YYYY'));
        $("#start_date, #end_date").val('');
    })

    function myOrder(){
        $("#show_loader").fadeIn(); 

        let start_date = $('#start_date').val();
        let end_date = $('#end_date').val();
        let form_name = $("#document_type").val();
        if(!(start_date && end_date)){
            var s_d = $('input[name="start_date"]').val();
            const [date, month, year] = s_d.split('/');
            start_date = `${year}-${month}-${date}`;

            var e_d = $('input[name="end_date"]').val();
            const [e_date, e_month, e_year] = e_d.split('/');
            end_date = `${e_year}-${e_month}-${e_date}`;
        }
        
        
        $.ajax({
            url: '/userProgress/myOrder',
            method: 'POST',
            data: {start_date : start_date, end_date: end_date, form_name: form_name},
            success: function (response) {
                $(".myOrder").remove();
                if (response.success == true) {
                    for(var i in response.data) { 
                        var myOrder = '<div class="col-xs-12 col-sm-6 my-4 myOrder">\
                            <div class="panal-list-inner">\
                                <iframe src="'+response.data[i].pdf_path+'" align="top" width="100%" frameBorder="0" scrolling="auto"><p>Your browser does not support iframes.</p> </iframe>\
                                <div class="d-flex align-items-center justify-content-around mt-3">\
                                    <button type="button" class="btn btn-yellow btn-icon btn-download" data-href="'+response.data[i].pdf_path+'"><i class="fa fa-download mb-0"></i></button>\
                                    <button type="button" class="btn btn-yellow btn-icon btn-view" data-href="'+response.data[i].pdf_path+'"><i class="fa fa-eye mb-0"></i></button>\
                                </div>\
                            </div>\
                        </div>';
                        $("#myOrder_content").append(myOrder);
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
    myOrder();

    $(document).on("click",".btn-download",function(){
        var url = $(this).attr('data-href');
        var a = $("<a>")
            .attr("href", url)
            .attr("download", '')
            .appendTo("body");
        a[0].click();
        a.remove();
    });

    $(document).on("click",".btn-view",function(){
        var url = $(this).attr('data-href');
        window.open(url, '_blank');
    });

    $(document).on("click","#btn-submit",function(){
        myOrder();
    });
});