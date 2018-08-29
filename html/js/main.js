$(document).ready(function() {
    checkForInput();
});

function checkForInput() {
    $('.login-form .form-item input').blur(function() {
        tmpval = $(this).val();
        if (tmpval == '') {
            $(this).removeClass('focus');
        } else {
            $(this).addClass('focus');
        }
    });
}

// Open modal popup

$(function() {
    $('[modal-btn-open]').each(function(e) {
        $(this).on('click', function(e) {
            var targeted_popup_class = $(this).attr('modal-btn-open');
            $('[modal-popup-open="' + targeted_popup_class + '"]').fadeIn(100);

            e.preventDefault();
        });
    });

    $('.close-modal').on('click', function(e) {
        $('.modal').fadeOut(200);
        e.preventDefault();
    });

    $('.modal-content').click(function(e) {
        e.stopPropagation()
        $('.modal').show();
    });

    $('.modal').click(function() {
        $('.modal').fadeOut(200);
    });

});

// Add new table row

$(function() {
    $('[data-add-row]').on('click', function(e) {
        var targeted_row_class = $(this).attr('data-add-row');
        var table = $('[data-receive-row="' + targeted_row_class + '"] tbody tr.hidden');
        var thisRow = $(table).closest('tr.hidden')[0];

        $(thisRow).clone().insertAfter(thisRow);
        $(thisRow).removeClass('hidden');

        e.preventDefault();
    });
});

// Check uncheck all checkboxes

$(function() {
    $('.checkall').on('click', function(e) {
        $(this).closest('.checkboxes-item').find('input').prop('checked', this.checked);
    });
});

// Show hide filter text input

$(function() {
    var searchBtn = $('.search-in-filters .ico');
    var searchBtnClose = $('.search-in-filters .close-search');
    var searchInput = $('.search-in-filters .search-input');
    var title = $('.top-part .title');

    $(searchBtn).on('click', function(e) {
        $(this).hide();
        $(title).hide();
        $(searchInput).show();
    });

    $(searchBtnClose).on('click', function(e) {
        $(searchInput).hide();
        $(title).show();
        $(searchBtn).show();
    });
});

// Show hide filter text input

$(function() {
    var that = $(this);
    if ($('table th').hasClass('sortable')) {
        $('table th').append('<div class="sort-arrow"></div><div class="selectable"></div>');
    }
});

// Open table sortable filters

$(function() {
    var $targetItem = $('.filter-sort-box, .ui-datepicker');
    $('table .selectable').on('click', function() {
        $(this).parent().find('.filter-sort-box').toggle();
        $(this).parent().toggleClass('sort-open');
    });

    // $(document).mouseup(function(e) {
    //     if (!$targetItem.is(e.target) // if the target of the click isn't the container...
    //         &&
    //         $targetItem.has(e.target).length === 0) // ... nor a descendant of the container
    //     {
    //         $targetItem.hide();
    //         $targetItem.parent().removeClass('sort-open');
    //     }
    // });
});

// Datepicker

$(function() {
    $( ".datepicker" ).datepicker({
        onSelect: function() {
            // Keep in mind that maybe the $(this) now reference to something else so you need to serach for the relvent Node
            handleLabel();
          }
    });

    $(".datepicker").focus(function() {
        $(this).parent().toggleClass("show");
    });

    $(".datepicker").blur()(function() {
        $(this).parent().removeClass("show");
    });
});

function handleLabel() {
    $('.form-item-caledar input').on('click', function() {
        $(this).toggleClass('active');
    });
}

// Fake select

$(function() {
    $('select').each(function() {
        var $this = $(this),
            numberOfOptions = $(this).children('option').length;

        $this.addClass('select-hidden');
        $this.wrap('<div class="select"></div>');
        $this.after('<div class="select-styled"></div>');

        var $styledSelect = $this.next('div.select-styled');
        $styledSelect.text($this.children('option').eq(0).text());

        var $list = $('<ul />', {
            'class': 'select-options'
        }).insertAfter($styledSelect);

        for (var i = 0; i < numberOfOptions; i++) {
            $('<li />', {
                text: $this.children('option').eq(i).text(),
                rel: $this.children('option').eq(i).val()
            }).appendTo($list);
        }

        var $listItems = $list.children('li');

        $styledSelect.click(function(e) {
            e.stopPropagation();
            $('div.select-styled.active').not(this).each(function() {
                $(this).removeClass('active').next('ul.select-options').hide();
            });
            $(this).toggleClass('active').next('ul.select-options').toggle();
        });

        $listItems.click(function(e) {
            e.stopPropagation();
            $styledSelect.text($(this).text()).removeClass('active');
            $this.val($(this).attr('rel'));
            $list.hide();
            //console.log($this.val());
        });

        $(document).click(function() {
            $styledSelect.removeClass('active');
            $list.hide();
        });

    });
});
