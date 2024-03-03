

// Variant Code
var linkEle = document.createElement('style'); 
linkEle.innerHTML = `
.mq-offer-1012 .review_hero {
    min-height: 80px;
}
.mq-offer-1012 .order_summary >.p-3 {
    padding: 0 !important;
}
.mq-offer-1012 .order_details {
    margin: 0 auto;
    border-radius: 0;
    border: none;
}

.mq-offer-1012.modal-open:not(.modal-closed) .modal-container.steps1 {
    opacity: 0;
}
div#hs-eu-cookie-confirmation.hs-cookie-notification-position-bottom{
    z-index: 99999999999 !important;
}
.mq-offer-1012 .modal-exit-inner-wrapper {
    border-radius: 8px;
    background: #FFF;
    -moz-box-shadow: 0px 4px 60px 0px rgba(0, 0, 0, 0.10);
    -webkit-box-shadow: 0px 4px 60px 0px rgba(0, 0, 0, 0.10);
    box-shadow: 0px 4px 60px 0px rgba(0, 0, 0, 0.10);
    display: flex;
    justify-content: space-between;
    width: 100%;
    max-width: 540px;
    position: relative;
    margin: 0 auto;
    padding: 50px 60px;
}
.mq-offer-1012 .close-modal {
    position: absolute;
    right: 20px;
    top: 10px;
}
.mq-offer-1012 .close-modal:hover path {
    fill: #041E42;
}
.mq-offer-1012 .modal-exit-content {
    width: 100%;
    display: flex;
    justify-content: space-between;
    text-align: center;
}

/* Left Part */
.mq-offer-1012 .modal-exit-content .modal-exit-left {
    padding-right: 15px;
}
.mq-offer-1012 .exit-logo {
    width: 100%;
    max-width: 158px;
    margin-top: 2px;  
    margin-bottom: 30px;
}
.mq-offer-1012 .exit-title-tag {
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    color: #F0C000;
    margin-bottom: 11px;
}
.mq-offer-1012 .exit-title {
    font-size: 32px;
    font-style: normal;
    font-weight: 400;
    line-height: 38.4px;
    color: #041E42;
    width: 100%;
    max-width: 520px;
    margin-bottom: 28px;
}
.mq-offer-1012 .modal-exit-left ul {
    list-style: none;
    width: 100%;
    max-width: 500px;
    padding: 0;
    margin: 0 0 46px 0;
}
.mq-offer-1012 .modal-exit-left li {
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 24px;
    position: relative;
    padding-left: 0px;
    margin-bottom: 20px;
}

.mq-offer-1012 .modal-exit-left li b {
    color: #F0C000
}


/* Video */
.mq-offer-1012 .modal-exit-cover {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    outline: 0;
    z-index: 999999999;
    width: 100%;
    padding: 40px 20px;
    background-color: #808080a8;

}
.mq-offer-1012 .modal-exit-inner-cover {
    display: flex;
    align-items: center;
    min-height: calc(100% - 1rem);
    position: relative;
}
.mq-offer-1012 .modal-exit-video {
    display: none;
}
.mq-offer-1012 .modal-exit-video>iframe {
    width: 868px;
    height: 488px;
    border: 0 none;
    pointer-events: initial;
}
.mq-offer-1012 .modal-exit-inner-wrapper.videoWrapper {
    padding: 47px 40px 40px;
    max-width: 950px;
}

.mq-offer-1012 .copy-text {
	position: relative;
	padding: 10px;
	background: #F0C000;
    border: 3px dashed #000;
	border-radius: 8px;
	display: flex;
}
.mq-offer-1012 .copy-text input.text {
	padding: 10px;
	font-size: 18px;
	border: none;
	outline: none;
    width: 100%;
    background-color: transparent;
    font-size: 1.3rem;
    text-align: center;
    font-weight: bold;
    color: #000;
}
.mq-offer-1012 .copy-text button {
	padding: 10px;
	background: #5784f5;
	color: #fff;
	font-size: 18px;
	border: none;
	outline: none;
	border-radius: 8px;
	cursor: pointer;
}

.mq-offer-1012 .copy-text button:active {
	background: #809ce2;
}
.mq-offer-1012 .copy-text button:before {
	content: "Copied";
	position: absolute;
	top: -45px;
	right: 0px;
	background: #5c81dc;
	padding: 8px 10px;
	border-radius: 20px;
	font-size: 15px;
	display: none;
}
.mq-offer-1012 .copy-text button:after {
	content: "";
	position: absolute;
	top: -20px;
	right: 25px;
	width: 10px;
	height: 10px;
	background: #5c81dc;
	transform: rotate(45deg);
	display: none;
}
.mq-offer-1012 .copy-text.active button:before,
.mq-offer-1012 .copy-text.active button:after {
	display: block;
}



@media only screen and (max-width: 1199.98px) {
    .mq-offer-1012 .modal-exit-content {
        align-items: center;
    }
}

@media only screen and (max-width: 991.98px) {
    .mq-offer-1012 .modal-exit-cover {
        padding: 87px 14px;
    }
    .mq-offer-1012 .exit-logo{
        margin-top: inherit;
    }
    .mq-offer-1012 .modal-exit-content .modal-exit-left {
        width: 100%;
        margin-bottom: 56px;
        padding-right: 0;
    }
    .mq-offer-1012 .modal-exit-inner-wrapper {
        max-width: 600px;
        padding: 50px;
    }
    .mq-offer-1012 .modal-exit-content {
        flex-direction: column;
    }
    .mq-offer-1012 .modal-exit-inner-wrapper.videoWrapper {
        padding: 50px 50px 44px;
        max-width: 602px;
    }
    .mq-offer-1012 .modal-exit-video>iframe {
        width: 502px;
        height: 283px;
    }
}

@media only screen and (max-width: 767.98px) {
    .mq-offer-1012 .modal-exit-inner-wrapper {
        max-width: 100%;
        padding: 40px 24px;
    }
    .mq-offer-1012 .modal-exit-cover {
        padding: 67px 21px;
    }
    .mq-offer-1012 .exit-title {
        font-size: 28px;
        font-style: normal;
        font-weight: 400;
        line-height: 33.6px;
        margin-bottom: 29px;
    }
    .mq-offer-1012 .exit-title-tag {
        margin-bottom: 12px;
    }
    .mq-offer-1012 .modal-exit-left ul {
        margin: 0 0 30px 0;
        max-width: 100%;
    }
    .mq-offer-1012 .modal-exit-left li {
        font-size: 14px;
        line-height: 21px;
    }
    .mq-offer-1012 .modal-exit-left .cta {
        display: inline-block;
        max-width: 100%;
        padding: 16px 30px;
    }
    .mq-offer-1012 .modal-exit-content .modal-exit-left {
        width: 100%;
        margin-bottom: 40px;
    }
    .mq-offer-1012 .modal-exit-inner-wrapper.videoWrapper {
        width: auto;
        padding: 40px 24px 33px;
        max-width: 100%;
    }
    .mq-offer-1012 .modal-exit-video>iframe {
        width: 100%;
        height: auto;
        min-height: 169px;
    }
}


/* Changed on Main Modal after Popup Closed */
.mq-offer-1012.modal-closed .modal-logo {
    display: none;
}
.mq-offer-1012.modal-closed .modal-form-wrapper .form-wrapper-outer {
    padding: 36px 32px 35px;
}
.mq-offer-1012.modal-closed .modal-form-wrapper .form-wrapper-outer > .form-title {
    color: #041E42;
    text-align: center;
    font-size: 32px;
    font-style: normal;
    font-weight: 400;
    line-height: 40px;
    margin-bottom: 8px;
}
.mq-offer-1012.modal-closed .form-sub-title {
    font-size: 18px;
    font-style: normal;
    font-weight: 400;
    line-height: 27px;
    width: 100%;
    display: block;
    text-align: center;
    color: #041E42;
    margin-bottom: 32px;
}
.mq-offer-1012.modal-closed .modal-form-wrapper .hs_submit .hs-button {
    max-width: 240px;
}
.mq-offer-1012.modal-closed .modal-form-wrapper .hs_submit {
    margin-top: 4px;
    margin-bottom: 1px;
}
/* Changed on Main Modal after Popup Closed over */

@media only screen and (max-width: 767.98px) {
    .mq-offer-1012.modal-closed .modal-form-wrapper .hs_submit .hs-button {
        max-width: 100%;
        margin-top: 4px;
    }
    .modal-closed .modal-form-wrapper .modal-form-container{
        padding: 50px 28px;
    }
    .mq-offer-1012.modal-closed .modal-form-wrapper .form-wrapper-outer {
        padding: 24px 18.5px 31px;
    }
    .mq-offer-1012.modal-closed .modal-form-wrapper .form-wrapper-outer > .form-title {
        margin-bottom: 8px;
    }
    .mq-offer-1012.modal-closed .form-sub-title {
        margin-bottom: 24px;
    }
}`;

document.querySelector('head').append(linkEle);

document.body.classList.add('mq-offer-1012');


if (window.matchMedia("(min-width: 1025px)").matches) {
    var mouseY = 0;
    var mouseX = 0;
    var topValue = 50;
    var leftValue = 50;
    var bottomValue = window.outerHeight - 50;
    var rightValue = window.outerWidth - 50;
    window.addEventListener("mouseout",function(e) {
        mouseY = e.clientY;
        mouseX = e.clientX;
        if(mouseY < topValue || mouseY > bottomValue || mouseX < leftValue || mouseX > rightValue) {
            //if (!sessionStorage.getItem('ExistingUser')) {
                sessionStorage.setItem('ExistingUser', 'true');
            //}
        }
    }, false);
} else {
    setTimeout(function(){
        //if (!sessionStorage.getItem('ExistingUser')) {
            sessionStorage.setItem('ExistingUser', 'true');
        //}
    }, 7000)
}