$(() => {
    var allowDeleting = false;
    $('#showAll').click(() => { getAllWords(); cancelDelete(); });
    $('#random').click(() => { getRandomWord(); cancelDelete(); });

    $(document).on('keyup', 'td', (e) => {
        updateTrans($(e.target).parents('tr').attr('id'));
    });

    $(document).on('click', 'tr', (e) => {
        if (allowDeleting) {
            let target = $(e.target).parents('tr');
            target.css("background-color", "lightblue");
            target.addClass('toBeDeleted');
        }
    });

    $('#submitNewWordBtn').click(() => {
        if ($('#vWord').val() === '' || $('#eWord').val() === '') {
            alert("Please enter the Vietnamese word or sentence and it's English translation before submitting.");
            return;
        }

        let newTrans = {
            viet: $('#vWord').val(),
            eng: $('#eWord').val()
        };

        $.ajax({
            url: '/newWord',
            type: 'post',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(newTrans),
            success: (resp) => {
                $('#vWord').val('');
                $('#eWord').val('');
                populateTable(newTrans, 1);
            },
            error: (err) => {
                console.log("Error adding a new translation: " + err);
                return;
            }
        });

        $('#vWord').focus();
    });

    $('#clear').click(() => {
        $('#vWord').val('');
        $('#eWord').val('');
        $('#vWord').focus(); 
    });

    $('#vWord, #eWord').keyup((e) => {
        let searchedTerm = new Object;
        let language = (e.target.id === 'eWord') ? 'eng' : 'viet';

        searchedTerm.lang = language;
        searchedTerm.st = e.target.value;

        $.ajax({
            url: '/search',
            data: searchedTerm,
            dataType: 'json',
            contentType: 'application/json',
            success: (resp) => {
                populateTable(resp, resp.length, searchedTerm.st, searchedTerm.lang)
            },
            error: (resp) => {
                console.log(resp);
                return;
            }
        });
    });

    $(document).on('click', '.delete', (e) => {
        allowDelete();
    });

    function allowDelete() {
        allowDeleting = true;
        $('.delete').html('<i class="fas fa-check"></i>');
        $('.delete').addClass('confirmDelete').removeClass('delete');
        $('#deletionButtons').append('<button class="cancelDelete btn btn-danger"><i class="fas fa-times"></i></button>');
        $('td').prop('contenteditable', false);
    };

    $(document).on('click', '.cancelDelete', (e) => {
        cancelDelete();
    });

    function cancelDelete() {
        allowDeleting = false;
        $('.cancelDelete').remove();
        $('.confirmDelete').html('<i class="fas fa-trash"></i>');
        $('.confirmDelete').addClass('delete').removeClass('confirmDelete');
        $('tr').css("background-color", "unset");
        $('.toBeDeleted').removeClass('toBeDeleted');
        $('td').prop('contenteditable', true);
    };

    $(document).on('click', '.confirmDelete', (e) => {
        let ids = $('.toBeDeleted');
        let idsToDelete = [];
        for (let i = 0; i < ids.length; i++) {
            idsToDelete.push({ _id: ids[i].id });
        }

        if (idsToDelete.length == 0) {
            cancelDelete();
            return;
        }
        deleteWord(idsToDelete);
    })

    function deleteWord(id) {
        if (confirm('Please confirm this deletion.')) {
            $.ajax({
                url: '/deleteWord',
                data: { delId: id },
                dataType: 'json',
                success: (resp) => {
                    for (let i = 0; i < id.length; i++) {
                        $(`#${id[i]._id}`).empty();
                    };
                    cancelDelete();
                },
                error: (resp) => {
                    console.log(resp.status);
                    cancelDelete();
                    return;
                }
            });
        } else {
            return;
        };
    };

    function getAllWords() {
        $.getJSON('/getAllWords').then((resp) => populateTable(resp, resp.length));
    };

    function getRandomWord() {
        $.getJSON('/getRandomWord').then((resp) => populateTable(resp, resp.length));
    };

    function updateTrans(id) {
        let updatedTrans = {
            viet: $(`#${id}`).children('td').eq(0).text(),
            eng: $(`#${id}`).children('td').eq(1).text(),
            _id: id
        };

        $.ajax({
            url: '/updateTrans',
            type: 'post',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(updatedTrans),
            success: () => {
                // console.log("Update successful");
            },
            error: (err) => {
                console.log('Error updating translation:' + err);
                return;
            }
        });
    };

    // Affects the visibility of the English column. Useful if I want to guess 
    // what the Vietnamese word is before seeing it's translation
    let showEnglish = true;
    $('#showEnglishBtn').click(() => {
        if (showEnglish) {
            $('td:nth-child(2)').css('opacity', '0');
        } else if (!showEnglish) {
            $('td:nth-child(2)').css('opacity', '1');
        }
        showEnglish = !showEnglish
    });

    function populateTable(data, num, searchedTerm, lang) {
        $('tbody').empty();

        if (searchedTerm) {
            for (let i = 0; i < num; i++) {
                let regex = new RegExp(RegExp.escape(searchedTerm), "i");
                let original = data[i][lang].match(regex);
                data[i][lang] = data[i][lang].split(regex).join(`<mark>${original}</mark>`);
            };
        };

        for (let i = 0; i < num; i++) {
            $('tbody').append(`
                  <tr id="${data[i]._id}">
                      <td contenteditable="true" spellcheck="false">${data[i].viet}</td>
                      <td contenteditable="true" class="${showEnglish ? "showEnglish" : "hideEnglish"}">${data[i].eng}</td>
                  </tr>
            `);
        };
    };    
});

RegExp.escape = function (s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};