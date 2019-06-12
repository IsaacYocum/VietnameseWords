$(() => {
    $("body").keydown((e) => {
        if (e.which == 38) { getAllWords(); }
        if (e.which == 39) { getRandomWord(); }
    })

    $('#submitNewWordBtn').click(() => {
        if ($('#vWord').val() === '' || $('#eWord').val() === '') {
            alert("Please enter the Vietnamese word or sentence and it's English translation before submitting.");
            return
        }
        
        let newTrans = {
            viet: $('#vWord').val().toLowerCase(),
            eng: $('#eWord').val().toLowerCase()
        }

        console.log(newTrans)

        $.ajax({
            url: '/newWord',
            type: 'post',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(newTrans),
            success: (resp) => {
                console.log(resp);
                $('#vWord').val('')
                $('#eWord').val('')
            }
        });
    })

    let originalTrans = {};
    $(document).on('click', '.edit', (e) => {
        console.log($('.update'))
        let id = $(e.target).parents().parents().attr('id');

        if ($('.update').length > 0) {
            // cancelMultipleTrans(id, $('.update'));
            alert('Either cancel or submit the previous edit before editing this translation.')
            return;
        }

        originalTrans.viet = $(`#${id}`).children().eq(0).text();
        originalTrans.eng = $(`#${id}`).children().eq(1).text();
        originalTrans._id = id;
        editTranslation(id);
    })

    $(document).on('click', '.delete', (e) => {
        let id = $(e.target).parents().parents().attr('id');
        deleteWord(id);
    })

    $(document).on('click', '.update', (e) => {
        let id = $(e.target).parents().parents().attr('id');
        updateTrans(id, originalTrans);
    })

    $(document).on('click', '.cancel', (e) => {
        let id = $(e.target).parents().parents().attr('id');
        cancelTrans(id);
    })

    function getAllWords() {
        $.getJSON('/getAllWords').then((resp) => populateTable(resp, resp.length));
    }

    function getRandomWord() {
        $.getJSON('/getRandomWord').then((resp) => populateTable(resp, resp.length));
    }

    function editTranslation(id) {
        for (let i = 0; i < $(`#${id}`).children().length - 1; i++) {
            let tmp = $(`#${id}`).children().eq(i).text();
            $(`#${id}`).children().eq(i).empty().append(`
                <input type="text" value="${tmp}">
            `)
        }

        $(`#${id}`).children().last('td').empty().append(`
            <button class="update btn btn-primary">Update</button>
            <button class="cancel btn btn-danger">Cancel</button>
        `);
    }

    function updateTrans(id) {
        console.log($(`#${id}`).children().eq(0).children().val())
        let updatedTrans = {
            viet: $(`#${id}`).children().eq(0).children().val(),
            eng: $(`#${id}`).children().eq(1).children().val(),
            _id: id
        }

        $.ajax({
            url: '/updateTrans',
            type: 'post',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(updatedTrans),
            success: (resp) => {
                console.log("Update " + resp);
                $(`#${id}`).children().eq(0).empty().html(updatedTrans.viet);
                $(`#${id}`).children().eq(1).empty().html(updatedTrans.eng);
                $(`#${id}`).children().last('td').empty().append(`
                    <button class="edit btn btn-warning">Edit</button>
                    <button class="delete btn btn-danger">Delete</button>
                `);
            }
        });
    }

    function cancelTrans(id) {
        $(`#${id}`).children().eq(0).empty().html(originalTrans.viet);
        $(`#${id}`).children().eq(1).empty().html(originalTrans.eng);

        $(`#${id}`).children().last('td').empty().append(`
            <button class="edit btn btn-warning">Edit</button>
            <button class="delete btn btn-danger">Delete</button>
        `);
    }

    function deleteWord(id) {
        if (confirm('Are you sure you want to delete this translation?')) {
            $.ajax({
                url: '/deleteWord',
                data: { delId: id },
                dataType: 'json',
                success: (resp) => {
                    console.log(resp.status);
                    $(`#${id}`).empty();
                },
                error: (resp) => {
                    console.log(resp.status);
                    return;
                }
            });
        } else {
            return;
        }
    }

    function populateTable(data, num) {
        $('tbody').empty()

        for (let i = 0; i < num; i++) {
            $('tbody').append(`
                <tr id="${data[i]._id}">
                    <td class="col-lg-4">${data[i].viet}</td>
                    <td class="col-lg-4">${data[i].eng}</td>
                    <td class="col-lg-4">
                        <button class="edit btn btn-warning">Edit</button>
                        <button class="delete btn btn-danger">Delete</button>
                    </td>
                </tr>
            `);
        }
    }
})