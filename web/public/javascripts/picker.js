function pickerCallback(data) {
    let url = 'nothing';
    let id = '';
    if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
        let doc = data[google.picker.Response.DOCUMENTS][0];
        url = doc[google.picker.Document.URL];
        id = doc[google.picker.Document.ID];

        $.ajax({
            type: "POST",
            url: url,
            data: data,
            success: success,
            error: error
        });

    }
    const message = 'You picked: ' + url + "<br>" + 'Id: ' + id;
    document.getElementById('result').innerHTML = message;
}

const view = google.picker.ViewId.SPREADSHEETS;