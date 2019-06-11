$(() => {
    console.log('HI')

    $("body").keydown((e) => {
        if (e.which == 38) {getAllWords();}
        if (e.which == 39) {getRandomWord();}
    })

    $('#submitNewWordBtn').click(() => {
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
            success: (data) => {
                console.log(data);
            }
        });
    })

    function getAllWords() {
        $.getJSON('/getAllWords').then((resp) => populateTable(resp, resp.length));
    }

    function getRandomWord() {
        $.getJSON('/getRandomWord').then((resp) => populateTable(resp, resp.length));
    }

    function populateTable(data, num) {
        $('tbody').empty()

        for (let i = 0; i < num; i++) {
            $('tbody').append(`
                <tr>
                    <td class="col-lg-5">${data[i].viet}</td>
                    <td class="col-lg-5">${data[i].eng}</td>
                    <td class="col-lg-2" id="${data[i]._id}">
                        <button class="btn btn-warning">Edit</button>
                        <button class="btn btn-danger">Delete</button>
                    </td>
                </tr>
            `);
        }
    }
})