$(() => {
    var clientdb = [];
    var changeableDB = [];
    populateClientDb();

    async function populateClientDb() {
        await $.getJSON('/getAllWords').then((resp) => clientdb = resp);
        changeableDB = JSON.parse(JSON.stringify(clientdb));
    }

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
                let trans = [newTrans];
                populateTable(trans, 1);
            },
            error: (err) => {
                console.log("Error adding a new translation: " + err);
                return;
            }
        }).then(() => {
            populateClientDb();
        });

        $('#vWord').focus();
    });

    $('#clear').click(() => {
        $('#vWord').val('');
        $('#eWord').val('');
        $('tbody').empty();
        $('#vWord').focus();
    });

    $('#options').click(() => $('#buttonsContainer').toggle());

    $('#vWord, #eWord').on('input', ((e) => {
        if (e.target.value != '') {
            if (clientdb.length < 1) {
                populateClientDb();
            }

            let changeableDB = JSON.parse(JSON.stringify(clientdb));

            let searchTerm = {
                lang: (e.target.id === 'eWord') ? 'eng' : 'viet',
                st: e.target.value
            };

            let st = new RegExp(RegExp.escape(searchTerm.st), "i");

            let searchResults = [];

            for (item in changeableDB) {
                if (st.test(changeableDB[item][searchTerm.lang])) {
                    searchResults.push(changeableDB[item]);
                }
            }

            populateTable(searchResults, searchResults.length, e.target.value, searchTerm.lang);

        } else {
            $('tbody').empty();
        }
    }));

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
        if (confirm('Are you sure you want to delete this translation?.')) {
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
            }).then(() => {
                populateClientDb();
            });;
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
            success: (resp) => {
                clientdb = resp;
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

    function populateTable(data, num, searchTerm, lang) {
        $('tbody').empty();
        if (searchTerm) {
            for (let i = 0; i < num; i++) {
                let regex = new RegExp(RegExp.escape(searchTerm), "i");
                let original = data[i][lang].match(regex);
                data[i][lang] = data[i][lang].split(regex).join(`<mark>${original}</mark>`);
            };
        };

        for (let row in data) {
            $('tbody').append(`
                  <tr id="${data[row]._id}">
                      <td contenteditable="true" spellcheck="false">${data[row].viet}</td>
                      <td contenteditable="true" class="${showEnglish ? "showEnglish" : "hideEnglish"}">${data[row].eng}</td>
                  </tr>
            `);
        };
    };
});

RegExp.escape = function (s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};