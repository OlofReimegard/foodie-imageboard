// $('.submit-image').on("click", function() {
//     var file = $('input[type="file"]').get(0).files[0];
//     var formData = new FormData();
//     formData.append('file', file);
//     formData.append('name')
//     $.ajax({
//         url: '/upload',
//         method: 'POST',
//         data: formData,
//         processData: false,
//         contentType: false
//     });
//
// });

Handlebars.templates = {};

var templates = document.querySelectorAll('template');

Array.prototype.slice.call(templates).forEach(function(tmpl) {
    Handlebars.templates[tmpl.id] = Handlebars.compile(tmpl.innerHTML.replace(/{{&gt;/g, '{{>'));
});


/////////************ BACKBONE **************///////////
const modalAndMain = $("#modal, #main");
/////////************ IMAGES **************///////////
var ImagesModel = Backbone.Model.extend({
    initialize: function() {
        this.fetch();
    },
    url: '/images'
});

var ImagesView = Backbone.View.extend({
    initialize: function() {
        $("#modal").fadeOut();
        $(".single-card").remove();
        var view = this;
        this.model.on('change', function() {
            view.render();
        });
    },
    render: function() {
        var html = Handlebars.templates.home(this.model.toJSON());
        this.$el.css("display","none");
        this.$el.html(html);
        this.$el.fadeIn();
    },
    events: {
        'click .card-img': function() {
            console.log("shits going down here");
            // $("#home");
        },
    }
});

/////////************ IMAGE **************///////////
var ImageModel = Backbone.Model.extend({
    initialize: function(props) {
        $(".single-card").fadeOut();

        this.url = props.id;
        this.fetch();
    }
});

var ImageView = Backbone.View.extend({
    initialize: function() {
        $(".left-side, .right-side").remove();
        console.log("initializin imageview");
        var view = this;
        this.model.on('change', function() {
            console.log(' going for a image');
            view.render();
        });

    },
    render: function() {
        var html = Handlebars.templates.image(this.model.toJSON());
        $(".left-side, .right-side").remove();
        this.$el.html(html);
        this.$el.fadeIn();
        this.$el.css("display","flex");
    },
    events: {
        'click .submit-comment': function() {
            $.post("/comment", {
                    image_id: window.location.hash.split("/")[1],
                    user: $('#image-user-input').val(),
                    comment: $('#image-comment-input').val()
                },
                function(data) {
                    console.log(data);
                    $('#image-user-input, #image-comment-input').val(""),
                    $("<h2>"+data.user+"</h2><h3 class='comment'>"+data.comment+"</h3>").insertAfter( ".submit-comment" ).hide().slideDown();
                }

            );
        },
        'click .x-button': function() {
            console.log("x clicked");
            location.href = "/#images";
        }
    }
});

/////////************ UPLOAD **************///////////

var UploadModel = Backbone.Model.extend({
    initialize: function() {
        this.fetch();
    },
    url: '/upload',

});

var UploadView = Backbone.View.extend({
    initialize: function() {
        this.render();
    },
    render: function() {
        var html = Handlebars.templates.upload;
        if($("#modal")){
            $("#submit-card").css("display","none");
            this.$el.html(html);
            $("#submit-card").fadeIn();
            this.$el.css("display","flex");
        } else {
            this.$el.css("display","none");
            this.$el.html(html);
            this.$el.fadeIn();
            this.$el.css("display","flex");
        }

    },
    events: {
        'change #file-selector' : function(){
            var reader = new FileReader();

            reader.onload = function (e) {
                $('#preview-image')
                    .attr('src', e.target.result)
                    .width("100%").fadeIn();
            };

            reader.readAsDataURL($("#file-selector").prop('files')[0]);
            // $("#preview-image").attr("src","http://www.prowrestlingtees.com/media/catalog/product/cache/1/image/800x800/9df78eab33525d08d6e5fb8d27136e95/m/a/machoman1037_1.png");
        },
        'click .submit-image': function() {
            var file = $('input[type="file"]').get(0).files[0];
            var formData = new FormData();
            formData.append('file', file);
            formData.append('user', $('#user-input').val());
            formData.append('title', $('#title-input').val());
            formData.append('description', $('#description-input').val());
            $.ajax({
                url: '/upload',
                method: 'POST',
                data: formData,
                processData: false,
                contentType: false,

                complete: function () {
                    window.location.replace("/#images");
                },
            });

        },
        'click .x-button': function() {
            location.href = "/#images";
        }
    }
});


var Router = Backbone.Router.extend({
    routes: {
        'images': 'images',
        'image/:id': 'image',
        'upload': 'upload',
        'comment': 'image'
    },
    images: function() {
        $(modalAndMain).off();
        new ImagesView({
            model: new ImagesModel,
            el: '#main'
        });
    },
    image: function(id) {
        $(modalAndMain).off();
        new ImageView({
            model: new ImageModel({
                id: "image/" + id
            }),
            el: '#modal'
        });
    },
    upload: function() {
        $(modalAndMain).off();
        new UploadView({
            model: new UploadModel,
            el: '#modal'
        });
    }
});

var router = new Router;



Backbone.history.start();
