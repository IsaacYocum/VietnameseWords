$(() => {
    console.log('HI')

    $("body").keydown((e) => {
        if (e.which == 38) {
            console.log("keyleft")
            getRandomWord();
        }
    })

    function getRandomWord() {
        $.getJSON('/getWords').then((resp) => {
            console.log(resp.words[1].eng);
            let random = Math.floor(Math.random() * (resp.words.length - 0));
            $('tbody').append(`
                <tr>
                    <td>${resp.words[random].viet}</td>
                    <td>${resp.words[random].eng}</td>
                </tr>
            `);
        })
    }
})